"""
Quiz API endpoints for quiz generation and submission.
Handles quiz creation, answer evaluation, and quiz history.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..services.quiz import QuizService, QuizServiceError, get_quiz_service
from .auth import get_current_user
from ..models.user import User


router = APIRouter(prefix="/api/quiz", tags=["quiz"])


# Request/Response Models
class GenerateQuizRequest(BaseModel):
    """Request model for generating a quiz."""
    topic: str = Field(..., min_length=1, max_length=255, description="Topic for the quiz")
    difficulty: str = Field(default="intermediate", description="Difficulty level: beginner, intermediate, or advanced")
    count: int = Field(default=5, ge=3, le=10, description="Number of questions (3-10)")


class QuizQuestion(BaseModel):
    """Quiz question without the correct answer."""
    question_id: int
    question: str
    options: List[str]


class GenerateQuizResponse(BaseModel):
    """Response model for quiz generation."""
    quiz_id: str
    topic: str
    difficulty: str
    questions: List[QuizQuestion]


class SubmitQuizRequest(BaseModel):
    """Request model for submitting quiz answers."""
    quiz_id: str = Field(..., description="Quiz ID from generation")
    topic: str = Field(..., description="Quiz topic")
    difficulty: str = Field(default="intermediate", description="Difficulty level")
    questions: List[dict] = Field(..., description="Full question data with correct answers")
    answers: List[int] = Field(..., description="List of answer indices (0-3)")


class QuestionFeedback(BaseModel):
    """Feedback for a single question."""
    question_id: int
    question: str
    user_answer: int
    correct_answer: int
    is_correct: bool
    explanation: str
    selected_option: str
    correct_option: str


class SubmitQuizResponse(BaseModel):
    """Response model for quiz submission."""
    quiz_id: str
    score: float
    correct_count: int
    total_count: int
    feedback: List[QuestionFeedback]
    performance_message: str


class QuizHistoryItem(BaseModel):
    """Quiz history item."""
    quiz_id: str
    topic: str
    score: float
    question_count: int
    completed_at: str


class QuizHistoryResponse(BaseModel):
    """Response model for quiz history."""
    quizzes: List[QuizHistoryItem]
    total_count: int


class QuizDetailsResponse(BaseModel):
    """Response model for detailed quiz results."""
    quiz_id: str
    topic: str
    score: float
    correct_count: int
    total_count: int
    completed_at: str
    feedback: List[QuestionFeedback]


@router.post("/generate", response_model=GenerateQuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(
    request: GenerateQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a quiz for a given topic.
    
    Uses Gemini AI to create quiz questions based on the specified topic,
    difficulty level, and number of questions.
    """
    try:
        # Create quiz service
        quiz_service = get_quiz_service(db)
        
        # Generate quiz
        quiz_data = quiz_service.generate_quiz(
            topic=request.topic,
            difficulty=request.difficulty,
            count=request.count
        )
        
        # Store full questions in session/cache for later validation
        # For now, we'll include them in the response but the frontend should
        # send them back when submitting (in production, use Redis cache)
        
        return GenerateQuizResponse(
            quiz_id=quiz_data["quiz_id"],
            topic=quiz_data["topic"],
            difficulty=quiz_data["difficulty"],
            questions=quiz_data["questions"]
        )
        
    except QuizServiceError as e:
        print(f"QuizServiceError: {str(e)}")  # Debug logging
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Unexpected error in generate_quiz: {str(e)}")  # Debug logging
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )


@router.post("/submit", response_model=SubmitQuizResponse)
async def submit_quiz(
    request: SubmitQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit quiz answers and get evaluation results.
    
    Evaluates the user's answers, calculates the score, provides feedback
    for each question, and saves the quiz results to the database.
    """
    try:
        # Create quiz service
        quiz_service = get_quiz_service(db)
        
        # Validate request
        if len(request.answers) != len(request.questions):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Number of answers must match number of questions"
            )
        
        # Validate answer indices
        for idx, answer in enumerate(request.answers):
            if answer < 0 or answer >= len(request.questions[idx].get("options", [])):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid answer index {answer} for question {idx}"
                )
        
        # Evaluate quiz
        results = quiz_service.evaluate_quiz(
            user_id=current_user.id,
            topic=request.topic,
            questions=request.questions,
            answers=request.answers,
            difficulty=request.difficulty
        )
        
        return SubmitQuizResponse(**results)
        
    except QuizServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit quiz: {str(e)}"
        )


@router.get("/history", response_model=QuizHistoryResponse)
async def get_quiz_history(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get quiz history for the authenticated user.
    
    Returns a list of previously completed quizzes with summary information.
    """
    try:
        # Create quiz service
        quiz_service = get_quiz_service(db)
        
        # Validate limit
        limit = max(1, min(50, limit))
        
        # Get quiz history
        quizzes = quiz_service.get_user_quiz_history(
            user_id=current_user.id,
            limit=limit
        )
        
        return QuizHistoryResponse(
            quizzes=quizzes,
            total_count=len(quizzes)
        )
        
    except QuizServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get quiz history: {str(e)}"
        )


@router.get("/{quiz_id}", response_model=QuizDetailsResponse)
async def get_quiz_details(
    quiz_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed results for a specific quiz.
    
    Returns complete quiz results including all questions, answers,
    and explanations for the authenticated user.
    """
    try:
        # Create quiz service
        quiz_service = get_quiz_service(db)
        
        # Get quiz details
        quiz_details = quiz_service.get_quiz_details(
            quiz_id=quiz_id,
            user_id=current_user.id
        )
        
        return QuizDetailsResponse(**quiz_details)
        
    except QuizServiceError as e:
        if "not found" in str(e).lower() or "unauthorized" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get quiz details: {str(e)}"
        )
