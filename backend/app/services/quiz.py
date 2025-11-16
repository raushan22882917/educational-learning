"""
Quiz service for quiz generation and evaluation.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from .gemini import get_gemini_service, GeminiServiceError
from ..models.quiz import Quiz
from ..models.user import User


class QuizServiceError(Exception):
    """Custom exception for quiz service errors."""
    pass


class QuizService:
    """
    Service class for quiz generation, evaluation, and management.
    """
    
    def __init__(self, db: Session):
        """
        Initialize the quiz service.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self.gemini_service = get_gemini_service()
    
    def generate_quiz(
        self, 
        topic: str, 
        difficulty: str = "intermediate", 
        count: int = 5
    ) -> Dict[str, Any]:
        """
        Generate quiz questions for a given topic using Gemini AI.
        
        Args:
            topic: The topic for quiz questions
            difficulty: Difficulty level (beginner, intermediate, advanced)
            count: Number of questions to generate (3-10)
            
        Returns:
            Dictionary containing:
                - quiz_id: Unique identifier for the quiz
                - topic: The quiz topic
                - difficulty: Difficulty level
                - questions: List of question dictionaries (without correct answers)
                
        Raises:
            QuizServiceError: If quiz generation fails
        """
        try:
            # Validate inputs
            if not topic or not topic.strip():
                raise QuizServiceError("Topic cannot be empty")
            
            valid_difficulties = ["beginner", "intermediate", "advanced"]
            if difficulty not in valid_difficulties:
                difficulty = "intermediate"
            
            # Clamp count between 3 and 10
            count = max(3, min(10, count))
            
            # Generate questions using Gemini AI
            questions = self.gemini_service.generate_quiz_questions(
                topic=topic,
                difficulty=difficulty,
                count=count
            )
            
            if not questions:
                raise QuizServiceError("Failed to generate quiz questions")
            
            # Generate a unique quiz ID
            quiz_id = str(uuid.uuid4())
            
            # Return quiz data without correct answers (for frontend)
            quiz_data = {
                "quiz_id": quiz_id,
                "topic": topic,
                "difficulty": difficulty,
                "questions": [
                    {
                        "question_id": idx,
                        "question": q["question"],
                        "options": q["options"]
                    }
                    for idx, q in enumerate(questions)
                ]
            }
            
            # Store the full questions (with answers) temporarily for validation
            # In a production system, you might want to cache this in Redis
            # For now, we'll return it separately for the API to handle
            quiz_data["_full_questions"] = questions
            
            return quiz_data
            
        except GeminiServiceError as e:
            raise QuizServiceError(f"AI service error: {str(e)}")
        except Exception as e:
            raise QuizServiceError(f"Error generating quiz: {str(e)}")
    
    def evaluate_quiz(
        self,
        user_id: uuid.UUID,
        topic: str,
        questions: List[Dict[str, Any]],
        answers: List[int],
        difficulty: str = "intermediate"
    ) -> Dict[str, Any]:
        """
        Evaluate quiz answers and provide feedback.
        
        Args:
            user_id: ID of the user taking the quiz
            topic: The quiz topic
            questions: Full question data including correct answers
            answers: List of user's answer indices
            difficulty: Difficulty level
            
        Returns:
            Dictionary containing:
                - score: Percentage score (0-100)
                - correct_count: Number of correct answers
                - total_count: Total number of questions
                - feedback: List of feedback for each question
                - quiz_id: ID of the saved quiz record
                
        Raises:
            QuizServiceError: If evaluation fails
        """
        try:
            # Validate inputs
            if len(answers) != len(questions):
                raise QuizServiceError("Number of answers must match number of questions")
            
            # Verify user exists
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise QuizServiceError(f"User not found: {user_id}")
            
            # Evaluate each answer
            correct_count = 0
            feedback = []
            
            for idx, (question, user_answer) in enumerate(zip(questions, answers)):
                correct_answer = question["correct_answer"]
                is_correct = user_answer == correct_answer
                
                if is_correct:
                    correct_count += 1
                
                feedback.append({
                    "question_id": idx,
                    "question": question["question"],
                    "user_answer": user_answer,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct,
                    "explanation": question["explanation"],
                    "selected_option": question["options"][user_answer] if 0 <= user_answer < len(question["options"]) else "Invalid",
                    "correct_option": question["options"][correct_answer]
                })
            
            # Calculate score
            total_count = len(questions)
            score = (correct_count / total_count * 100) if total_count > 0 else 0
            
            # Save quiz to database
            quiz = Quiz(
                user_id=user_id,
                topic=topic,
                questions=questions,
                answers=answers,
                score=score,
                completed_at=datetime.utcnow()
            )
            
            self.db.add(quiz)
            self.db.commit()
            self.db.refresh(quiz)
            
            # Generate performance feedback
            performance_message = self._generate_performance_message(score, difficulty)
            
            return {
                "quiz_id": str(quiz.id),
                "score": round(score, 2),
                "correct_count": correct_count,
                "total_count": total_count,
                "feedback": feedback,
                "performance_message": performance_message
            }
            
        except QuizServiceError:
            raise
        except Exception as e:
            self.db.rollback()
            raise QuizServiceError(f"Error evaluating quiz: {str(e)}")
    
    def _generate_performance_message(self, score: float, difficulty: str) -> str:
        """
        Generate an encouraging performance message based on score.
        
        Args:
            score: Quiz score (0-100)
            difficulty: Difficulty level
            
        Returns:
            Encouraging message
        """
        if score >= 90:
            return f"Excellent work! You've mastered this {difficulty} level topic. Ready for a challenge?"
        elif score >= 75:
            return f"Great job! You have a solid understanding of this {difficulty} level material."
        elif score >= 60:
            return f"Good effort! You're on the right track. Review the explanations to strengthen your understanding."
        elif score >= 40:
            return f"Keep practicing! Review the concepts and try again. Learning takes time."
        else:
            return f"Don't give up! This {difficulty} level topic is challenging. Review the material and try a beginner level quiz first."
    
    def get_user_quiz_history(
        self, 
        user_id: uuid.UUID, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get quiz history for a user.
        
        Args:
            user_id: ID of the user
            limit: Maximum number of quizzes to return
            
        Returns:
            List of quiz summary dictionaries
            
        Raises:
            QuizServiceError: If retrieval fails
        """
        try:
            quizzes = (
                self.db.query(Quiz)
                .filter(Quiz.user_id == user_id)
                .order_by(Quiz.completed_at.desc())
                .limit(limit)
                .all()
            )
            
            return [
                {
                    "quiz_id": str(quiz.id),
                    "topic": quiz.topic,
                    "score": round(quiz.score, 2),
                    "question_count": len(quiz.questions),
                    "completed_at": quiz.completed_at.isoformat()
                }
                for quiz in quizzes
            ]
            
        except Exception as e:
            raise QuizServiceError(f"Error retrieving quiz history: {str(e)}")
    
    def get_quiz_details(
        self, 
        quiz_id: uuid.UUID, 
        user_id: uuid.UUID
    ) -> Dict[str, Any]:
        """
        Get detailed results for a specific quiz.
        
        Args:
            quiz_id: ID of the quiz
            user_id: ID of the user (for authorization)
            
        Returns:
            Detailed quiz results
            
        Raises:
            QuizServiceError: If quiz not found or unauthorized
        """
        try:
            quiz = (
                self.db.query(Quiz)
                .filter(Quiz.id == quiz_id, Quiz.user_id == user_id)
                .first()
            )
            
            if not quiz:
                raise QuizServiceError("Quiz not found or unauthorized")
            
            # Calculate correct count
            correct_count = sum(
                1 for q, a in zip(quiz.questions, quiz.answers)
                if a == q["correct_answer"]
            )
            
            # Build feedback
            feedback = []
            for idx, (question, user_answer) in enumerate(zip(quiz.questions, quiz.answers)):
                correct_answer = question["correct_answer"]
                is_correct = user_answer == correct_answer
                
                feedback.append({
                    "question_id": idx,
                    "question": question["question"],
                    "user_answer": user_answer,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct,
                    "explanation": question["explanation"],
                    "selected_option": question["options"][user_answer] if 0 <= user_answer < len(question["options"]) else "Invalid",
                    "correct_option": question["options"][correct_answer]
                })
            
            return {
                "quiz_id": str(quiz.id),
                "topic": quiz.topic,
                "score": round(quiz.score, 2),
                "correct_count": correct_count,
                "total_count": len(quiz.questions),
                "completed_at": quiz.completed_at.isoformat(),
                "feedback": feedback
            }
            
        except QuizServiceError:
            raise
        except Exception as e:
            raise QuizServiceError(f"Error retrieving quiz details: {str(e)}")


def get_quiz_service(db: Session) -> QuizService:
    """
    Factory function to create a QuizService instance.
    
    Args:
        db: SQLAlchemy database session
        
    Returns:
        QuizService instance
    """
    return QuizService(db)
