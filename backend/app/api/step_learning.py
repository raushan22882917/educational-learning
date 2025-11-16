"""
API endpoints for step-by-step learning.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.step_by_step_learning import (
    StepByStepLearning,
    LearningPath,
    LearningStep,
    generate_learning_path_prompt,
    generate_step_response_prompt,
    generate_next_question_prompt
)
from ..services.gemini import get_gemini_service
from ..services.multimedia_parser import MultimediaParser
import json


router = APIRouter(prefix="/api/step-learning", tags=["step-learning"])

# In-memory storage for demo (use database in production)
learning_manager = StepByStepLearning()
user_paths: Dict[str, LearningPath] = {}


class StartLearningRequest(BaseModel):
    """Request to start a new learning path."""
    topic: str
    difficulty: str = "intermediate"
    user_id: str


class AnswerStepRequest(BaseModel):
    """Request to answer a step."""
    path_id: str
    user_id: str
    answer: str


class GetStepRequest(BaseModel):
    """Request to get current step."""
    path_id: str
    user_id: str


@router.post("/start")
async def start_learning_path(request: StartLearningRequest):
    """
    Start a new step-by-step learning path.
    
    Returns the first step to begin learning.
    """
    try:
        # Generate learning path using AI
        gemini = get_gemini_service()
        prompt = generate_learning_path_prompt(request.topic, request.difficulty)
        
        # Get AI response
        ai_response = gemini.generate_response(prompt)
        
        # Parse JSON response
        try:
            # Extract JSON from response (might have extra text)
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            json_str = ai_response[json_start:json_end]
            path_data = json.loads(json_str)
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse learning path: {str(e)}")
        
        # Create learning path
        path = LearningPath(
            topic=path_data['topic'],
            total_steps=len(path_data['steps'])
        )
        
        # Create steps
        for step_data in path_data['steps']:
            step = LearningStep(
                step_number=step_data['step_number'],
                step_type=step_data['step_type'],
                content=step_data['content'],
                question=step_data.get('question'),
                expected_answer=step_data.get('expected_answer'),
                hints=step_data.get('hints', []),
                multimedia=step_data.get('multimedia', [])
            )
            path.steps.append(step)
        
        # Store path
        path_id = f"{request.user_id}_{request.topic}_{path.started_at.timestamp()}"
        user_paths[path_id] = path
        
        # Get first step
        first_step = path.get_current_step()
        if not first_step:
            raise HTTPException(status_code=500, detail="No steps in learning path")
        
        # Generate response for first step
        step_prompt = generate_step_response_prompt(first_step)
        step_response = gemini.generate_response(step_prompt)
        
        # Parse multimedia
        cleaned_text, multimedia_elements = MultimediaParser.parse(step_response)
        
        return {
            "path_id": path_id,
            "topic": path.topic,
            "total_steps": path.total_steps,
            "current_step": path.current_step + 1,
            "progress_percentage": path.get_progress_percentage(),
            "step": {
                "step_number": first_step.step_number,
                "step_type": first_step.step_type.value,
                "content": cleaned_text,
                "multimedia": [elem.to_dict() for elem in multimedia_elements],
                "requires_answer": first_step.question is not None
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/answer")
async def answer_step(request: AnswerStepRequest):
    """
    Submit an answer to the current step and get the next step.
    """
    try:
        # Get learning path
        path = user_paths.get(request.path_id)
        if not path:
            raise HTTPException(status_code=404, detail="Learning path not found")
        
        current_step = path.get_current_step()
        if not current_step:
            raise HTTPException(status_code=400, detail="No current step")
        
        # Record answer
        current_step.student_answer = request.answer
        current_step.attempts += 1
        
        gemini = get_gemini_service()
        
        # Evaluate answer if there's an expected answer
        is_correct = None
        if current_step.expected_answer:
            # Use AI to evaluate answer
            eval_prompt = f"""Evaluate this student answer:

Question: {current_step.question}
Expected answer: {current_step.expected_answer}
Student's answer: {request.answer}

Is the student's answer correct? Consider:
- Does it capture the main concept?
- Is it accurate even if worded differently?
- Does it show understanding?

Respond with ONLY "CORRECT" or "INCORRECT" followed by a brief explanation."""
            
            eval_response = gemini.generate_response(eval_prompt)
            is_correct = "CORRECT" in eval_response.upper().split('\n')[0]
        
        # Generate feedback
        feedback_prompt = generate_step_response_prompt(
            current_step,
            request.answer,
            is_correct
        )
        feedback_response = gemini.generate_response(feedback_prompt)
        
        # Parse multimedia from feedback
        feedback_text, feedback_multimedia = MultimediaParser.parse(feedback_response)
        
        # Determine next action
        if is_correct or current_step.expected_answer is None:
            # Move to next step
            current_step.status = "completed"
            has_next = path.advance_step()
            
            if not has_next:
                # Learning path completed!
                path.completed_at = path.started_at  # Should be datetime.now()
                return {
                    "path_id": request.path_id,
                    "completed": True,
                    "feedback": feedback_text,
                    "multimedia": [elem.to_dict() for elem in feedback_multimedia],
                    "progress_percentage": 100,
                    "message": "Congratulations! You've completed this learning path! 🎉"
                }
            
            # Get next step
            next_step = path.get_current_step()
            next_prompt = generate_step_response_prompt(next_step)
            next_response = gemini.generate_response(next_prompt)
            next_text, next_multimedia = MultimediaParser.parse(next_response)
            
            return {
                "path_id": request.path_id,
                "completed": False,
                "feedback": feedback_text,
                "feedback_multimedia": [elem.to_dict() for elem in feedback_multimedia],
                "current_step": path.current_step + 1,
                "total_steps": path.total_steps,
                "progress_percentage": path.get_progress_percentage(),
                "step": {
                    "step_number": next_step.step_number,
                    "step_type": next_step.step_type.value,
                    "content": next_text,
                    "multimedia": [elem.to_dict() for elem in next_multimedia],
                    "requires_answer": next_step.question is not None
                }
            }
        else:
            # Answer incorrect - provide hint and retry
            if current_step.attempts >= 3:
                # Too many attempts, show answer and move on
                current_step.status = "completed"
                path.advance_step()
                
                next_step = path.get_current_step()
                if next_step:
                    next_prompt = generate_step_response_prompt(next_step)
                    next_response = gemini.generate_response(next_prompt)
                    next_text, next_multimedia = MultimediaParser.parse(next_response)
                    
                    return {
                        "path_id": request.path_id,
                        "completed": False,
                        "feedback": f"{feedback_text}\n\nThe correct answer is: {current_step.expected_answer}\n\nLet's move on to the next step.",
                        "current_step": path.current_step + 1,
                        "total_steps": path.total_steps,
                        "progress_percentage": path.get_progress_percentage(),
                        "step": {
                            "step_number": next_step.step_number,
                            "step_type": next_step.step_type.value,
                            "content": next_text,
                            "multimedia": [elem.to_dict() for elem in next_multimedia],
                            "requires_answer": next_step.question is not None
                        }
                    }
            
            # Give hint and retry same step
            current_step.status = "needs_review"
            return {
                "path_id": request.path_id,
                "completed": False,
                "feedback": feedback_text,
                "multimedia": [elem.to_dict() for elem in feedback_multimedia],
                "current_step": path.current_step + 1,
                "total_steps": path.total_steps,
                "progress_percentage": path.get_progress_percentage(),
                "retry": True,
                "attempts": current_step.attempts,
                "step": {
                    "step_number": current_step.step_number,
                    "step_type": current_step.step_type.value,
                    "content": f"Try again: {current_step.question}",
                    "requires_answer": True
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/current")
async def get_current_step(request: GetStepRequest):
    """Get the current step without answering."""
    try:
        path = user_paths.get(request.path_id)
        if not path:
            raise HTTPException(status_code=404, detail="Learning path not found")
        
        current_step = path.get_current_step()
        if not current_step:
            return {
                "path_id": request.path_id,
                "completed": True,
                "progress_percentage": 100
            }
        
        return {
            "path_id": request.path_id,
            "topic": path.topic,
            "current_step": path.current_step + 1,
            "total_steps": path.total_steps,
            "progress_percentage": path.get_progress_percentage(),
            "step": current_step.to_dict()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/progress/{path_id}")
async def get_progress(path_id: str):
    """Get progress for a learning path."""
    try:
        path = user_paths.get(path_id)
        if not path:
            raise HTTPException(status_code=404, detail="Learning path not found")
        
        return {
            "path_id": path_id,
            "topic": path.topic,
            "total_steps": path.total_steps,
            "current_step": path.current_step + 1,
            "progress_percentage": path.get_progress_percentage(),
            "completed_steps": sum(1 for s in path.steps if s.status == "completed"),
            "started_at": path.started_at.isoformat(),
            "completed_at": path.completed_at.isoformat() if path.completed_at else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
