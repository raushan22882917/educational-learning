"""
Progress tracking service for managing user learning progress, statistics, and achievements.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.progress import Progress, Achievement
from ..models.session import Session as LearningSession
from ..models.user import User
from .gemini import get_gemini_service, GeminiServiceError
from .cache import get_cache_service, CacheService
import uuid


class ProgressServiceError(Exception):
    """Custom exception for progress service errors."""
    pass


# Achievement definitions
ACHIEVEMENT_DEFINITIONS = {
    "first_session": {
        "title": "First Steps",
        "description": "Completed your first learning session",
        "icon": "🎯"
    },
    "five_sessions": {
        "title": "Getting Started",
        "description": "Completed 5 learning sessions",
        "icon": "🌟"
    },
    "ten_sessions": {
        "title": "Dedicated Learner",
        "description": "Completed 10 learning sessions",
        "icon": "🏆"
    },
    "streak_3": {
        "title": "Three Day Streak",
        "description": "Learned for 3 consecutive days",
        "icon": "🔥"
    },
    "streak_7": {
        "title": "Week Warrior",
        "description": "Learned for 7 consecutive days",
        "icon": "⚡"
    },
    "streak_30": {
        "title": "Monthly Master",
        "description": "Learned for 30 consecutive days",
        "icon": "👑"
    },
    "hour_milestone": {
        "title": "Hour of Learning",
        "description": "Spent 1 hour learning",
        "icon": "⏰"
    },
    "ten_hours": {
        "title": "Ten Hour Scholar",
        "description": "Spent 10 hours learning",
        "icon": "📚"
    },
    "fifty_hours": {
        "title": "Fifty Hour Expert",
        "description": "Spent 50 hours learning",
        "icon": "🎓"
    }
}


class ProgressService:
    """
    Service class for tracking and managing user learning progress.
    """
    
    def __init__(self, db: Session, cache_service: Optional[CacheService] = None):
        """
        Initialize the progress service.
        
        Args:
            db: SQLAlchemy database session
            cache_service: Optional CacheService instance
        """
        self.db = db
        self.gemini_service = get_gemini_service()
        self.cache_service = cache_service or get_cache_service()
    
    def _get_or_create_progress(self, user_id: uuid.UUID) -> Progress:
        """
        Get existing progress record or create a new one.
        
        Args:
            user_id: User ID
            
        Returns:
            Progress record
        """
        progress = self.db.query(Progress).filter(Progress.user_id == user_id).first()
        
        if not progress:
            progress = Progress(
                user_id=user_id,
                topics_completed=0,
                total_time_spent=0,
                current_streak=0,
                last_activity=datetime.utcnow(),
                level=1
            )
            self.db.add(progress)
            self.db.commit()
            self.db.refresh(progress)
        
        return progress

    
    def _calculate_streak(self, user_id: uuid.UUID, current_date: datetime) -> int:
        """
        Calculate the current learning streak for a user.
        
        Args:
            user_id: User ID
            current_date: Current date
            
        Returns:
            Current streak count in days
        """
        # Get all completed sessions ordered by date
        sessions = self.db.query(LearningSession).filter(
            LearningSession.user_id == user_id,
            LearningSession.status == "completed"
        ).order_by(LearningSession.completed_at.desc()).all()
        
        if not sessions:
            return 0
        
        # Get unique dates of learning activity
        activity_dates = set()
        for session in sessions:
            if session.completed_at:
                activity_dates.add(session.completed_at.date())
        
        # Sort dates in descending order
        sorted_dates = sorted(activity_dates, reverse=True)
        
        if not sorted_dates:
            return 0
        
        # Check if there's activity today or yesterday
        today = current_date.date()
        yesterday = today - timedelta(days=1)
        
        if sorted_dates[0] not in [today, yesterday]:
            return 0  # Streak broken
        
        # Count consecutive days
        streak = 1
        expected_date = sorted_dates[0] - timedelta(days=1)
        
        for i in range(1, len(sorted_dates)):
            if sorted_dates[i] == expected_date:
                streak += 1
                expected_date -= timedelta(days=1)
            else:
                break
        
        return streak
    
    def _calculate_level(self, topics_completed: int, total_time_hours: float) -> int:
        """
        Calculate user level based on topics completed and time spent.
        
        Args:
            topics_completed: Number of topics completed
            total_time_hours: Total time spent learning in hours
            
        Returns:
            User level (1-100)
        """
        # Simple leveling formula: level increases with both topics and time
        # Each topic is worth 10 points, each hour is worth 5 points
        points = (topics_completed * 10) + (total_time_hours * 5)
        
        # Level = sqrt(points / 10) + 1, capped at 100
        level = int((points / 10) ** 0.5) + 1
        return min(level, 100)
    
    def update_progress(self, user_id: uuid.UUID, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update user progress after a learning session.
        
        Args:
            user_id: User ID
            session_data: Dictionary containing:
                - session_id: Session UUID
                - duration_seconds: Session duration
                - topic: Topic covered
                - completed: Whether session was completed
                
        Returns:
            Dictionary with updated progress and any new achievements
            
        Raises:
            ProgressServiceError: If update fails
        """
        try:
            # Get or create progress record
            progress = self._get_or_create_progress(user_id)
            
            # Update metrics
            if session_data.get("completed", False):
                progress.topics_completed += 1
            
            duration_seconds = session_data.get("duration_seconds", 0)
            progress.total_time_spent += duration_seconds
            
            # Update last activity
            current_time = datetime.utcnow()
            progress.last_activity = current_time
            
            # Calculate and update streak
            progress.current_streak = self._calculate_streak(user_id, current_time)
            
            # Calculate and update level
            total_time_hours = progress.total_time_spent / 3600.0
            progress.level = self._calculate_level(progress.topics_completed, total_time_hours)
            
            self.db.commit()
            self.db.refresh(progress)
            
            # Invalidate cached progress data
            self.cache_service.invalidate_user_progress(str(user_id))
            
            # Check for new achievements
            new_achievements = self._check_achievements(user_id, progress)
            
            return {
                "progress": {
                    "topics_completed": progress.topics_completed,
                    "total_time_spent": progress.total_time_spent,
                    "current_streak": progress.current_streak,
                    "level": progress.level,
                    "last_activity": progress.last_activity.isoformat()
                },
                "new_achievements": new_achievements
            }
            
        except Exception as e:
            self.db.rollback()
            raise ProgressServiceError(f"Failed to update progress: {str(e)}")
    
    def _check_achievements(self, user_id: uuid.UUID, progress: Progress) -> List[Dict[str, Any]]:
        """
        Check if user has earned any new achievements.
        
        Args:
            user_id: User ID
            progress: Current progress record
            
        Returns:
            List of newly earned achievements
        """
        new_achievements = []
        
        # Get existing achievements
        existing_achievements = self.db.query(Achievement).filter(
            Achievement.user_id == user_id
        ).all()
        existing_types = {ach.achievement_type for ach in existing_achievements}
        
        # Check session-based achievements
        if progress.topics_completed >= 1 and "first_session" not in existing_types:
            new_achievements.append(self.award_achievement(user_id, "first_session"))
        
        if progress.topics_completed >= 5 and "five_sessions" not in existing_types:
            new_achievements.append(self.award_achievement(user_id, "five_sessions"))
        
        if progress.topics_completed >= 10 and "ten_sessions" not in existing_types:
            new_achievements.append(self.award_achievement(user_id, "ten_sessions"))
        
        # Check streak-based achievements
        if progress.current_streak >= 3 and "streak_3" not in existing_types:
            new_achievements.append(self.award_achievement(user_id, "streak_3"))
        
        if progress.current_streak >= 7 and "streak_7" not in existing_types:
            new_achievements.append(self.award_achievement(user_id, "streak_7"))
        
        if progress.current_streak >= 30 and "streak_30" not in existing_types:
            new_achievements.append(self.award_achievement(user_id, "streak_30"))
        
        # Check time-based achievements (in hours)
        total_hours = progress.total_time_spent / 3600.0
        
        if total_hours >= 1 and "hour_milestone" not in existing_types:
            new_achievements.append(self.award_achievement(user_id, "hour_milestone"))
        
        if total_hours >= 10 and "ten_hours" not in existing_types:
            new_achievements.append(self.award_achievement(user_id, "ten_hours"))
        
        if total_hours >= 50 and "fifty_hours" not in existing_types:
            new_achievements.append(self.award_achievement(user_id, "fifty_hours"))
        
        return new_achievements

    
    def calculate_stats(self, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Calculate comprehensive statistics for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary containing user statistics and achievements
            
        Raises:
            ProgressServiceError: If calculation fails
        """
        try:
            # Try to get from cache first
            cached_stats = self.cache_service.get_user_progress(str(user_id))
            if cached_stats:
                return cached_stats
            
            # Get progress record
            progress = self._get_or_create_progress(user_id)
            
            # Get all achievements
            achievements = self.db.query(Achievement).filter(
                Achievement.user_id == user_id
            ).order_by(Achievement.earned_at.desc()).all()
            
            # Get session statistics
            total_sessions = self.db.query(func.count(LearningSession.id)).filter(
                LearningSession.user_id == user_id
            ).scalar() or 0
            
            completed_sessions = self.db.query(func.count(LearningSession.id)).filter(
                LearningSession.user_id == user_id,
                LearningSession.status == "completed"
            ).scalar() or 0
            
            # Get recent topics (last 10 sessions)
            recent_sessions = self.db.query(LearningSession).filter(
                LearningSession.user_id == user_id,
                LearningSession.status == "completed"
            ).order_by(LearningSession.completed_at.desc()).limit(10).all()
            
            recent_topics = [session.topic for session in recent_sessions]
            
            # Calculate average session duration
            avg_duration = 0
            if completed_sessions > 0:
                total_duration = self.db.query(func.sum(LearningSession.duration_seconds)).filter(
                    LearningSession.user_id == user_id,
                    LearningSession.status == "completed"
                ).scalar() or 0
                avg_duration = total_duration // completed_sessions if completed_sessions > 0 else 0
            
            # Format achievements
            achievement_list = [
                {
                    "id": str(ach.id),
                    "type": ach.achievement_type,
                    "title": ach.title,
                    "description": ach.description,
                    "icon": ach.icon,
                    "earned_at": ach.earned_at.isoformat()
                }
                for ach in achievements
            ]
            
            stats = {
                "user_id": str(user_id),
                "level": progress.level,
                "topics_completed": progress.topics_completed,
                "total_time_spent": progress.total_time_spent,
                "total_time_hours": round(progress.total_time_spent / 3600.0, 2),
                "current_streak": progress.current_streak,
                "last_activity": progress.last_activity.isoformat(),
                "total_sessions": total_sessions,
                "completed_sessions": completed_sessions,
                "average_session_duration": avg_duration,
                "recent_topics": recent_topics,
                "achievements": achievement_list,
                "achievement_count": len(achievement_list)
            }
            
            # Cache the stats
            self.cache_service.set_user_progress(str(user_id), stats)
            
            return stats
            
        except Exception as e:
            raise ProgressServiceError(f"Failed to calculate stats: {str(e)}")
    
    def award_achievement(self, user_id: uuid.UUID, achievement_type: str) -> Dict[str, Any]:
        """
        Award an achievement to a user.
        
        Args:
            user_id: User ID
            achievement_type: Type of achievement to award
            
        Returns:
            Dictionary with achievement details
            
        Raises:
            ProgressServiceError: If achievement type is invalid or award fails
        """
        try:
            # Validate achievement type
            if achievement_type not in ACHIEVEMENT_DEFINITIONS:
                raise ProgressServiceError(f"Invalid achievement type: {achievement_type}")
            
            # Check if user already has this achievement
            existing = self.db.query(Achievement).filter(
                Achievement.user_id == user_id,
                Achievement.achievement_type == achievement_type
            ).first()
            
            if existing:
                return {
                    "id": str(existing.id),
                    "type": existing.achievement_type,
                    "title": existing.title,
                    "description": existing.description,
                    "icon": existing.icon,
                    "earned_at": existing.earned_at.isoformat(),
                    "already_earned": True
                }
            
            # Create new achievement
            achievement_def = ACHIEVEMENT_DEFINITIONS[achievement_type]
            achievement = Achievement(
                user_id=user_id,
                achievement_type=achievement_type,
                title=achievement_def["title"],
                description=achievement_def["description"],
                icon=achievement_def["icon"],
                earned_at=datetime.utcnow()
            )
            
            self.db.add(achievement)
            self.db.commit()
            self.db.refresh(achievement)
            
            return {
                "id": str(achievement.id),
                "type": achievement.achievement_type,
                "title": achievement.title,
                "description": achievement.description,
                "icon": achievement.icon,
                "earned_at": achievement.earned_at.isoformat(),
                "already_earned": False
            }
            
        except ProgressServiceError:
            raise
        except Exception as e:
            self.db.rollback()
            raise ProgressServiceError(f"Failed to award achievement: {str(e)}")
    
    def generate_weekly_summary(self, user_id: uuid.UUID) -> str:
        """
        Generate an AI-powered weekly learning summary.
        
        Args:
            user_id: User ID
            
        Returns:
            AI-generated weekly summary text
            
        Raises:
            ProgressServiceError: If summary generation fails
        """
        try:
            # Get sessions from the last 7 days
            week_ago = datetime.utcnow() - timedelta(days=7)
            weekly_sessions = self.db.query(LearningSession).filter(
                LearningSession.user_id == user_id,
                LearningSession.started_at >= week_ago,
                LearningSession.status == "completed"
            ).order_by(LearningSession.started_at).all()
            
            if not weekly_sessions:
                return "You haven't completed any learning sessions this week. Start a new session to begin your learning journey!"
            
            # Calculate weekly statistics
            total_time = sum(session.duration_seconds for session in weekly_sessions)
            topics = [session.topic for session in weekly_sessions]
            session_count = len(weekly_sessions)
            
            # Get progress for streak info
            progress = self._get_or_create_progress(user_id)
            
            # Create prompt for Gemini
            prompt = self._create_weekly_summary_prompt(
                session_count=session_count,
                topics=topics,
                total_time_seconds=total_time,
                current_streak=progress.current_streak,
                level=progress.level
            )
            
            # Generate summary using Gemini
            try:
                summary = self.gemini_service._make_request_with_retry(prompt, temperature=0.7)
                return summary.strip()
            except GeminiServiceError as e:
                # Fallback to basic summary if AI fails
                return self._generate_basic_weekly_summary(
                    session_count, topics, total_time, progress.current_streak
                )
            
        except Exception as e:
            raise ProgressServiceError(f"Failed to generate weekly summary: {str(e)}")
    
    def _create_weekly_summary_prompt(
        self, 
        session_count: int, 
        topics: List[str], 
        total_time_seconds: int,
        current_streak: int,
        level: int
    ) -> str:
        """
        Create a prompt for generating weekly summary.
        
        Args:
            session_count: Number of sessions this week
            topics: List of topics covered
            total_time_seconds: Total time spent learning
            current_streak: Current learning streak
            level: User's current level
            
        Returns:
            Formatted prompt
        """
        total_hours = total_time_seconds / 3600.0
        total_minutes = total_time_seconds / 60.0
        
        topics_str = ", ".join(topics)
        
        prompt = f"""Generate an encouraging and insightful weekly learning summary for a student.

This week's learning activity:
- Sessions completed: {session_count}
- Topics explored: {topics_str}
- Total learning time: {total_hours:.1f} hours ({total_minutes:.0f} minutes)
- Current learning streak: {current_streak} days
- Current level: {level}

Create a summary that:
1. Celebrates their achievements this week
2. Highlights interesting patterns or focus areas in their learning
3. Provides encouraging feedback on their progress
4. Suggests areas for continued growth
5. Motivates them to keep learning

Keep the tone positive, personal, and motivating. Make it feel like a supportive mentor reviewing their progress.
Limit the summary to 3-4 paragraphs."""
        
        return prompt
    
    def _generate_basic_weekly_summary(
        self, 
        session_count: int, 
        topics: List[str], 
        total_time_seconds: int,
        current_streak: int
    ) -> str:
        """
        Generate a basic weekly summary as fallback.
        
        Args:
            session_count: Number of sessions
            topics: List of topics
            total_time_seconds: Total time in seconds
            current_streak: Current streak
            
        Returns:
            Basic summary text
        """
        hours = total_time_seconds / 3600.0
        minutes = total_time_seconds / 60.0
        
        summary = f"""Great work this week! You completed {session_count} learning session{'s' if session_count != 1 else ''} """
        summary += f"""and spent {hours:.1f} hours exploring new topics.\n\n"""
        
        if topics:
            unique_topics = list(set(topics))
            summary += f"""You explored {len(unique_topics)} different topic{'s' if len(unique_topics) != 1 else ''}: {', '.join(unique_topics[:5])}"""
            if len(unique_topics) > 5:
                summary += f" and {len(unique_topics) - 5} more"
            summary += ".\n\n"
        
        if current_streak > 1:
            summary += f"""You're on a {current_streak}-day learning streak! Keep it up!\n\n"""
        
        summary += """Keep up the excellent work and continue exploring topics that interest you!"""
        
        return summary


def get_progress_service(db: Session) -> ProgressService:
    """
    Factory function to create a ProgressService instance.
    
    Args:
        db: SQLAlchemy database session
        
    Returns:
        ProgressService instance
    """
    return ProgressService(db)
