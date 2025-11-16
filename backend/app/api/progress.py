"""
Progress API endpoints for tracking user learning progress and achievements.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from ..database import get_db
from ..services.progress import get_progress_service, ProgressServiceError
from ..models.user import User
from .auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])


# Pydantic models for request/response
class AchievementResponse(BaseModel):
    """Response model for achievement information."""
    id: str
    type: str
    title: str
    description: str
    icon: str
    earned_at: str


class ProgressStatsResponse(BaseModel):
    """Response model for user progress statistics."""
    user_id: str
    level: int
    topics_completed: int
    total_time_spent: int
    total_time_hours: float
    current_streak: int
    last_activity: str
    total_sessions: int
    completed_sessions: int
    average_session_duration: int
    recent_topics: List[str]
    achievements: List[AchievementResponse]
    achievement_count: int


class WeeklySummaryResponse(BaseModel):
    """Response model for weekly learning summary."""
    user_id: str
    summary: str
    generated_at: str


@router.get("/{user_id}", response_model=ProgressStatsResponse)
async def get_user_progress(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive progress statistics for a user.
    
    Args:
        user_id: User ID to get progress for
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        User progress statistics including achievements
        
    Raises:
        HTTPException: If user not authorized or progress retrieval fails
    """
    # Verify user can only access their own progress
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's progress"
        )
    
    try:
        # Convert user_id string to UUID
        user_uuid = uuid.UUID(user_id)
        
        # Get progress service and calculate stats
        progress_service = get_progress_service(db)
        stats = progress_service.calculate_stats(user_uuid)
        
        # Convert achievements to response model
        achievements = [
            AchievementResponse(**ach)
            for ach in stats["achievements"]
        ]
        
        return ProgressStatsResponse(
            user_id=stats["user_id"],
            level=stats["level"],
            topics_completed=stats["topics_completed"],
            total_time_spent=stats["total_time_spent"],
            total_time_hours=stats["total_time_hours"],
            current_streak=stats["current_streak"],
            last_activity=stats["last_activity"],
            total_sessions=stats["total_sessions"],
            completed_sessions=stats["completed_sessions"],
            average_session_duration=stats["average_session_duration"],
            recent_topics=stats["recent_topics"],
            achievements=achievements,
            achievement_count=stats["achievement_count"]
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user ID format: {str(e)}"
        )
    except ProgressServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve progress: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.get("/{user_id}/weekly-summary", response_model=WeeklySummaryResponse)
async def get_weekly_summary(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-generated weekly learning summary for a user.
    
    Args:
        user_id: User ID to get summary for
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AI-generated weekly summary
        
    Raises:
        HTTPException: If user not authorized or summary generation fails
    """
    # Verify user can only access their own summary
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's summary"
        )
    
    try:
        # Convert user_id string to UUID
        user_uuid = uuid.UUID(user_id)
        
        # Get progress service and generate summary
        progress_service = get_progress_service(db)
        summary = progress_service.generate_weekly_summary(user_uuid)
        
        return WeeklySummaryResponse(
            user_id=user_id,
            summary=summary,
            generated_at=datetime.utcnow().isoformat()
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user ID format: {str(e)}"
        )
    except ProgressServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


class DashboardStatsResponse(BaseModel):
    """Response model for comprehensive dashboard statistics."""
    user_id: str
    # Session stats
    total_sessions: int
    active_sessions: int
    completed_sessions: int
    total_messages: int
    # Progress stats
    level: int
    topics_completed: int
    total_time_spent: int
    total_time_hours: float
    current_streak: int
    # Achievement stats
    total_achievements: int
    recent_achievements: List[AchievementResponse]
    # Quiz stats (if available)
    total_quizzes: int
    quizzes_passed: int
    average_quiz_score: float
    # Activity stats
    last_activity: str
    days_active: int
    average_session_duration: int


@router.get("/{user_id}/dashboard", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dashboard statistics from all tables.
    
    Returns real counts and data from:
    - sessions table
    - messages table
    - progress table
    - achievements table
    - quiz_attempts table
    
    Args:
        user_id: User ID to get stats for
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Comprehensive dashboard statistics
        
    Raises:
        HTTPException: If user not authorized or stats retrieval fails
    """
    # Verify user can only access their own stats
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's stats"
        )
    
    try:
        from ..models.session import Session as LearningSession, Message
        from ..models.progress import Progress, Achievement
        from ..models.quiz import QuizAttempt
        from sqlalchemy import func, distinct
        
        user_uuid = uuid.UUID(user_id)
        
        # Session statistics
        total_sessions = db.query(func.count(LearningSession.id)).filter(
            LearningSession.user_id == user_uuid
        ).scalar() or 0
        
        active_sessions = db.query(func.count(LearningSession.id)).filter(
            LearningSession.user_id == user_uuid,
            LearningSession.status == "active"
        ).scalar() or 0
        
        completed_sessions = db.query(func.count(LearningSession.id)).filter(
            LearningSession.user_id == user_uuid,
            LearningSession.status == "completed"
        ).scalar() or 0
        
        # Message count across all sessions
        total_messages = db.query(func.count(Message.id)).join(
            LearningSession, Message.session_id == LearningSession.id
        ).filter(
            LearningSession.user_id == user_uuid
        ).scalar() or 0
        
        # Progress statistics
        progress = db.query(Progress).filter(Progress.user_id == user_uuid).first()
        if not progress:
            # Create default progress if doesn't exist
            progress = Progress(
                user_id=user_uuid,
                topics_completed=0,
                total_time_spent=0,
                current_streak=0,
                last_activity=datetime.utcnow(),
                level=1
            )
            db.add(progress)
            db.commit()
            db.refresh(progress)
        
        # Achievement statistics
        achievements = db.query(Achievement).filter(
            Achievement.user_id == user_uuid
        ).order_by(Achievement.earned_at.desc()).all()
        
        recent_achievements = [
            AchievementResponse(
                id=str(ach.id),
                type=ach.achievement_type,
                title=ach.title,
                description=ach.description,
                icon=ach.icon,
                earned_at=ach.earned_at.isoformat()
            )
            for ach in achievements[:5]  # Last 5 achievements
        ]
        
        # Quiz statistics
        total_quizzes = db.query(func.count(QuizAttempt.id)).filter(
            QuizAttempt.user_id == user_uuid
        ).scalar() or 0
        
        quizzes_passed = db.query(func.count(QuizAttempt.id)).filter(
            QuizAttempt.user_id == user_uuid,
            QuizAttempt.passed == True
        ).scalar() or 0
        
        avg_score = db.query(func.avg(QuizAttempt.score)).filter(
            QuizAttempt.user_id == user_uuid
        ).scalar() or 0.0
        
        # Activity statistics
        days_active = db.query(func.count(distinct(func.date(LearningSession.started_at)))).filter(
            LearningSession.user_id == user_uuid
        ).scalar() or 0
        
        avg_duration = 0
        if completed_sessions > 0:
            total_duration = db.query(func.sum(LearningSession.duration_seconds)).filter(
                LearningSession.user_id == user_uuid,
                LearningSession.status == "completed"
            ).scalar() or 0
            avg_duration = total_duration // completed_sessions
        
        return DashboardStatsResponse(
            user_id=user_id,
            # Session stats
            total_sessions=total_sessions,
            active_sessions=active_sessions,
            completed_sessions=completed_sessions,
            total_messages=total_messages,
            # Progress stats
            level=progress.level,
            topics_completed=progress.topics_completed,
            total_time_spent=progress.total_time_spent,
            total_time_hours=round(progress.total_time_spent / 3600.0, 2),
            current_streak=progress.current_streak,
            # Achievement stats
            total_achievements=len(achievements),
            recent_achievements=recent_achievements,
            # Quiz stats
            total_quizzes=total_quizzes,
            quizzes_passed=quizzes_passed,
            average_quiz_score=round(float(avg_score), 2),
            # Activity stats
            last_activity=progress.last_activity.isoformat(),
            days_active=days_active,
            average_session_duration=avg_duration
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user ID format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dashboard stats: {str(e)}"
        )
