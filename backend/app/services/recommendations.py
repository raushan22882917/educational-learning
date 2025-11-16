"""
Recommendations service for generating personalized learning topic recommendations.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..models.session import Session as LearningSession
from ..models.progress import Progress
from ..models.user import User
from .gemini import get_gemini_service, GeminiServiceError
from .cache import get_cache_service, CacheService
import uuid


class RecommendationsServiceError(Exception):
    """Custom exception for recommendations service errors."""
    pass


class RecommendationsService:
    """
    Service class for generating personalized learning recommendations.
    """
    
    def __init__(self, db: Session, cache_service: Optional[CacheService] = None):
        """
        Initialize the recommendations service.
        
        Args:
            db: SQLAlchemy database session
            cache_service: Optional CacheService instance
        """
        self.db = db
        self.gemini_service = get_gemini_service()
        self.cache_service = cache_service or get_cache_service()
    
    def _analyze_user_history(self, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Analyze user's learning history to extract patterns and preferences.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary containing analyzed user data
        """
        # Get user's progress
        progress = self.db.query(Progress).filter(Progress.user_id == user_id).first()
        
        # Get completed sessions (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_sessions = self.db.query(LearningSession).filter(
            LearningSession.user_id == user_id,
            LearningSession.status == "completed",
            LearningSession.completed_at >= thirty_days_ago
        ).order_by(desc(LearningSession.completed_at)).all()
        
        # Extract topics
        topics_completed = [session.topic for session in recent_sessions]
        
        # Get all-time sessions for broader context
        all_sessions = self.db.query(LearningSession).filter(
            LearningSession.user_id == user_id,
            LearningSession.status == "completed"
        ).all()
        
        all_topics = [session.topic for session in all_sessions]
        
        # Calculate topic frequency
        topic_frequency = {}
        for topic in all_topics:
            topic_lower = topic.lower()
            topic_frequency[topic_lower] = topic_frequency.get(topic_lower, 0) + 1
        
        # Get most frequent topics
        frequent_topics = sorted(
            topic_frequency.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5]
        
        # Calculate average session duration
        avg_duration = 0
        if recent_sessions:
            total_duration = sum(s.duration_seconds for s in recent_sessions)
            avg_duration = total_duration // len(recent_sessions)
        
        # Get user preferences
        user = self.db.query(User).filter(User.id == user_id).first()
        preferences = user.preferences if user and user.preferences else {}
        
        # Determine difficulty level based on progress
        difficulty_level = "beginner"
        if progress:
            if progress.level >= 20:
                difficulty_level = "advanced"
            elif progress.level >= 10:
                difficulty_level = "intermediate"
        
        return {
            "topics_completed": topics_completed[:10],  # Last 10 topics
            "all_topics": all_topics,
            "frequent_topics": [topic for topic, _ in frequent_topics],
            "total_sessions": len(all_sessions),
            "recent_session_count": len(recent_sessions),
            "difficulty_level": difficulty_level,
            "current_level": progress.level if progress else 1,
            "current_streak": progress.current_streak if progress else 0,
            "interests": preferences.get("interests", []),
            "preferred_learning_style": preferences.get("learning_style", "comprehensive"),
            "average_session_duration": avg_duration
        }
    
    def generate_recommendations(
        self, 
        user_id: uuid.UUID, 
        count: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate personalized topic recommendations for a user.
        
        Args:
            user_id: User ID
            count: Number of recommendations to generate (default: 5)
            
        Returns:
            List of recommendation dictionaries with title, description, difficulty, etc.
            
        Raises:
            RecommendationsServiceError: If recommendation generation fails
        """
        try:
            # Try to get from cache first
            cached_recommendations = self.cache_service.get_recommendations(str(user_id))
            if cached_recommendations:
                # Return requested count from cache
                return cached_recommendations[:count]
            
            # Analyze user history
            user_profile = self._analyze_user_history(user_id)
            
            # Validate count
            if count < 1 or count > 10:
                count = 5
            
            # Generate recommendations using Gemini AI
            try:
                recommendations = self.gemini_service.generate_recommendations(user_profile)
                
                # Limit to requested count
                recommendations = recommendations[:count]
                
                # Add metadata
                for i, rec in enumerate(recommendations):
                    rec["id"] = str(uuid.uuid4())
                    rec["generated_at"] = datetime.utcnow().isoformat()
                    rec["rank"] = i + 1
                
                # Cache the recommendations
                self.cache_service.set_recommendations(str(user_id), recommendations)
                
                return recommendations
                
            except GeminiServiceError as e:
                # Fallback to rule-based recommendations if AI fails
                return self._generate_fallback_recommendations(user_profile, count)
            
        except Exception as e:
            raise RecommendationsServiceError(f"Failed to generate recommendations: {str(e)}")
    
    def _generate_fallback_recommendations(
        self, 
        user_profile: Dict[str, Any], 
        count: int
    ) -> List[Dict[str, Any]]:
        """
        Generate basic rule-based recommendations as fallback.
        
        Args:
            user_profile: User profile data
            count: Number of recommendations
            
        Returns:
            List of basic recommendations
        """
        recommendations = []
        difficulty = user_profile["difficulty_level"]
        
        # Define fallback topics by difficulty
        fallback_topics = {
            "beginner": [
                {
                    "title": "Introduction to Python Programming",
                    "description": "Learn the basics of Python, one of the most popular programming languages.",
                    "difficulty": "beginner",
                    "estimated_duration": "30-45 minutes",
                    "category": "Programming"
                },
                {
                    "title": "Basic Mathematics Concepts",
                    "description": "Review fundamental math concepts including algebra and geometry.",
                    "difficulty": "beginner",
                    "estimated_duration": "25-35 minutes",
                    "category": "Mathematics"
                },
                {
                    "title": "Introduction to Web Development",
                    "description": "Learn the basics of HTML, CSS, and how websites work.",
                    "difficulty": "beginner",
                    "estimated_duration": "30-40 minutes",
                    "category": "Web Development"
                },
                {
                    "title": "Science Fundamentals",
                    "description": "Explore basic scientific concepts and the scientific method.",
                    "difficulty": "beginner",
                    "estimated_duration": "20-30 minutes",
                    "category": "Science"
                },
                {
                    "title": "Critical Thinking Skills",
                    "description": "Develop your ability to analyze and evaluate information effectively.",
                    "difficulty": "beginner",
                    "estimated_duration": "25-35 minutes",
                    "category": "Skills"
                }
            ],
            "intermediate": [
                {
                    "title": "Data Structures and Algorithms",
                    "description": "Learn essential data structures and algorithmic thinking.",
                    "difficulty": "intermediate",
                    "estimated_duration": "45-60 minutes",
                    "category": "Computer Science"
                },
                {
                    "title": "Calculus Fundamentals",
                    "description": "Explore derivatives, integrals, and their applications.",
                    "difficulty": "intermediate",
                    "estimated_duration": "40-55 minutes",
                    "category": "Mathematics"
                },
                {
                    "title": "Machine Learning Basics",
                    "description": "Introduction to machine learning concepts and applications.",
                    "difficulty": "intermediate",
                    "estimated_duration": "50-65 minutes",
                    "category": "AI & ML"
                },
                {
                    "title": "Physics: Mechanics",
                    "description": "Study motion, forces, and energy in classical mechanics.",
                    "difficulty": "intermediate",
                    "estimated_duration": "45-60 minutes",
                    "category": "Physics"
                },
                {
                    "title": "Database Design",
                    "description": "Learn how to design efficient and scalable databases.",
                    "difficulty": "intermediate",
                    "estimated_duration": "40-50 minutes",
                    "category": "Database"
                }
            ],
            "advanced": [
                {
                    "title": "Advanced Algorithms",
                    "description": "Deep dive into complex algorithms and optimization techniques.",
                    "difficulty": "advanced",
                    "estimated_duration": "60-90 minutes",
                    "category": "Computer Science"
                },
                {
                    "title": "Quantum Computing",
                    "description": "Explore the principles and applications of quantum computing.",
                    "difficulty": "advanced",
                    "estimated_duration": "60-75 minutes",
                    "category": "Quantum"
                },
                {
                    "title": "Advanced Calculus",
                    "description": "Study multivariable calculus and differential equations.",
                    "difficulty": "advanced",
                    "estimated_duration": "60-90 minutes",
                    "category": "Mathematics"
                },
                {
                    "title": "Deep Learning Architectures",
                    "description": "Learn about neural networks, CNNs, RNNs, and transformers.",
                    "difficulty": "advanced",
                    "estimated_duration": "70-90 minutes",
                    "category": "AI & ML"
                },
                {
                    "title": "Theoretical Physics",
                    "description": "Explore advanced topics in quantum mechanics and relativity.",
                    "difficulty": "advanced",
                    "estimated_duration": "60-80 minutes",
                    "category": "Physics"
                }
            ]
        }
        
        # Get topics for user's difficulty level
        available_topics = fallback_topics.get(difficulty, fallback_topics["beginner"])
        
        # Select topics (avoid recently completed ones if possible)
        recent_topics_lower = [t.lower() for t in user_profile["topics_completed"]]
        
        for topic in available_topics:
            if len(recommendations) >= count:
                break
            
            # Skip if recently completed
            if topic["title"].lower() in recent_topics_lower:
                continue
            
            recommendations.append({
                "id": str(uuid.uuid4()),
                "title": topic["title"],
                "description": topic["description"],
                "difficulty": topic["difficulty"],
                "estimated_duration": topic["estimated_duration"],
                "category": topic["category"],
                "generated_at": datetime.utcnow().isoformat(),
                "rank": len(recommendations) + 1
            })
        
        # If we still need more, add remaining topics
        if len(recommendations) < count:
            for topic in available_topics:
                if len(recommendations) >= count:
                    break
                
                # Check if already added
                if any(r["title"] == topic["title"] for r in recommendations):
                    continue
                
                recommendations.append({
                    "id": str(uuid.uuid4()),
                    "title": topic["title"],
                    "description": topic["description"],
                    "difficulty": topic["difficulty"],
                    "estimated_duration": topic["estimated_duration"],
                    "category": topic["category"],
                    "generated_at": datetime.utcnow().isoformat(),
                    "rank": len(recommendations) + 1
                })
        
        return recommendations
    
    def record_feedback(
        self, 
        user_id: uuid.UUID, 
        recommendation_id: str, 
        feedback_type: str,
        rating: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Record user feedback on a recommendation.
        
        Args:
            user_id: User ID
            recommendation_id: ID of the recommendation
            feedback_type: Type of feedback ('accepted', 'rejected', 'rated')
            rating: Optional rating (1-5)
            
        Returns:
            Dictionary confirming feedback was recorded
            
        Raises:
            RecommendationsServiceError: If feedback recording fails
        """
        try:
            # Get user to update preferences
            user = self.db.query(User).filter(User.id == user_id).first()
            
            if not user:
                raise RecommendationsServiceError(f"User not found: {user_id}")
            
            # Initialize preferences if needed
            if not user.preferences:
                user.preferences = {}
            
            # Initialize feedback history
            if "recommendation_feedback" not in user.preferences:
                user.preferences["recommendation_feedback"] = []
            
            # Add feedback entry
            feedback_entry = {
                "recommendation_id": recommendation_id,
                "feedback_type": feedback_type,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            if rating is not None:
                feedback_entry["rating"] = rating
            
            user.preferences["recommendation_feedback"].append(feedback_entry)
            
            # Limit feedback history to last 50 entries
            if len(user.preferences["recommendation_feedback"]) > 50:
                user.preferences["recommendation_feedback"] = user.preferences["recommendation_feedback"][-50:]
            
            # Mark as modified for SQLAlchemy to detect change
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(user, "preferences")
            
            self.db.commit()
            
            # Invalidate cached recommendations when feedback is recorded
            self.cache_service.invalidate_recommendations(str(user_id))
            
            return {
                "success": True,
                "message": "Feedback recorded successfully",
                "feedback_type": feedback_type,
                "recommendation_id": recommendation_id
            }
            
        except RecommendationsServiceError:
            raise
        except Exception as e:
            self.db.rollback()
            raise RecommendationsServiceError(f"Failed to record feedback: {str(e)}")


def get_recommendations_service(db: Session) -> RecommendationsService:
    """
    Factory function to create a RecommendationsService instance.
    
    Args:
        db: SQLAlchemy database session
        
    Returns:
        RecommendationsService instance
    """
    return RecommendationsService(db)
