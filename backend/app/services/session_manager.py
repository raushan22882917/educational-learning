"""
Session Manager service for managing learning sessions and conversation history.
Handles session creation, message storage in Redis cache, and session completion.
"""

import os
import json
import redis
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.orm import Session as DBSession
from ..models.session import Session, Message
from ..models.user import User
from .gemini import GeminiService, get_gemini_service


class SessionManagerError(Exception):
    """Custom exception for session manager errors."""
    pass


class SessionManager:
    """
    Service class for managing learning sessions.
    Uses Redis for caching conversation history and PostgreSQL for persistence.
    """
    
    def __init__(
        self,
        redis_url: Optional[str] = None,
        gemini_service: Optional[GeminiService] = None
    ):
        """
        Initialize the session manager.
        
        Args:
            redis_url: Redis connection URL (defaults to environment variable)
            gemini_service: Optional GeminiService instance
        """
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        
        # Initialize Redis connection
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_connect_timeout=5
            )
            # Test connection
            self.redis_client.ping()
        except Exception as e:
            raise SessionManagerError(f"Failed to connect to Redis: {str(e)}")
        
        # Initialize Gemini service for summaries
        self.gemini_service = gemini_service or get_gemini_service()
        
        # Cache TTL (time to live) - 24 hours
        self.cache_ttl = 86400
    
    def _get_cache_key(self, session_id: str) -> str:
        """
        Generate Redis cache key for a session.
        
        Args:
            session_id: Session UUID
            
        Returns:
            Cache key string
        """
        return f"session:{session_id}:messages"
    
    def create_session(
        self,
        db: DBSession,
        user_id: UUID,
        topic: str
    ) -> Session:
        """
        Create a new learning session.
        
        Args:
            db: Database session
            user_id: User UUID
            topic: Learning topic for the session
            
        Returns:
            Created Session object
            
        Raises:
            SessionManagerError: If session creation fails
        """
        try:
            # Verify user exists
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise SessionManagerError(f"User with id {user_id} not found")
            
            # Create new session
            session = Session(
                user_id=user_id,
                topic=topic,
                status="active",
                message_count=0,
                duration_seconds=0
            )
            
            db.add(session)
            db.commit()
            db.refresh(session)
            
            # Initialize empty message list in Redis cache
            cache_key = self._get_cache_key(str(session.id))
            self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                json.dumps([])
            )
            
            return session
            
        except SessionManagerError:
            raise
        except Exception as e:
            db.rollback()
            raise SessionManagerError(f"Failed to create session: {str(e)}")
    
    def add_message(
        self,
        db: DBSession,
        session_id: UUID,
        role: str,
        content: str
    ) -> Message:
        """
        Add a message to a session and store in Redis cache.
        
        Args:
            db: Database session
            session_id: Session UUID
            role: Message role ('user' or 'assistant')
            content: Message content
            
        Returns:
            Created Message object
            
        Raises:
            SessionManagerError: If message creation fails
        """
        try:
            # Verify session exists and is active
            session = db.query(Session).filter(Session.id == session_id).first()
            if not session:
                raise SessionManagerError(f"Session with id {session_id} not found")
            
            if session.status != "active":
                raise SessionManagerError(f"Session {session_id} is not active")
            
            # Validate role
            if role not in ["user", "assistant"]:
                raise SessionManagerError(f"Invalid role: {role}. Must be 'user' or 'assistant'")
            
            # Create message in database
            message = Message(
                session_id=session_id,
                role=role,
                content=content
            )
            
            db.add(message)
            
            # Update session message count
            session.message_count += 1
            
            db.commit()
            db.refresh(message)
            
            # Add message to Redis cache
            cache_key = self._get_cache_key(str(session_id))
            
            # Get existing messages from cache
            cached_messages = self._get_cached_messages(str(session_id))
            
            # Append new message
            message_dict = {
                "id": str(message.id),
                "role": message.role,
                "content": message.content,
                "timestamp": message.timestamp.isoformat()
            }
            cached_messages.append(message_dict)
            
            # Update cache
            self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(cached_messages)
            )
            
            return message
            
        except SessionManagerError:
            raise
        except Exception as e:
            db.rollback()
            raise SessionManagerError(f"Failed to add message: {str(e)}")
    
    def _get_cached_messages(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Get messages from Redis cache.
        
        Args:
            session_id: Session UUID string
            
        Returns:
            List of message dictionaries
        """
        cache_key = self._get_cache_key(session_id)
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
            return []
        except Exception:
            # If cache fails, return empty list
            return []
    
    def get_session_context(
        self,
        db: DBSession,
        session_id: UUID,
        max_messages: int = 20
    ) -> List[Dict[str, str]]:
        """
        Retrieve conversation history for a session.
        First tries Redis cache, falls back to database if needed.
        
        Args:
            db: Database session
            session_id: Session UUID
            max_messages: Maximum number of recent messages to return
            
        Returns:
            List of message dictionaries with 'role' and 'content' keys
            
        Raises:
            SessionManagerError: If session not found
        """
        try:
            # Verify session exists
            session = db.query(Session).filter(Session.id == session_id).first()
            if not session:
                raise SessionManagerError(f"Session with id {session_id} not found")
            
            # Try to get from cache first
            cached_messages = self._get_cached_messages(str(session_id))
            
            if cached_messages:
                # Return most recent messages from cache
                recent_messages = cached_messages[-max_messages:]
                return [
                    {"role": msg["role"], "content": msg["content"]}
                    for msg in recent_messages
                ]
            
            # Fall back to database if cache is empty
            messages = (
                db.query(Message)
                .filter(Message.session_id == session_id)
                .order_by(Message.timestamp.desc())
                .limit(max_messages)
                .all()
            )
            
            # Reverse to get chronological order
            messages = list(reversed(messages))
            
            # Rebuild cache from database
            message_dicts = [
                {
                    "id": str(msg.id),
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat()
                }
                for msg in messages
            ]
            
            # Update cache
            cache_key = self._get_cache_key(str(session_id))
            self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(message_dicts)
            )
            
            # Return context format
            return [
                {"role": msg.role, "content": msg.content}
                for msg in messages
            ]
            
        except SessionManagerError:
            raise
        except Exception as e:
            raise SessionManagerError(f"Failed to get session context: {str(e)}")
    
    def complete_session(
        self,
        db: DBSession,
        session_id: UUID
    ) -> Dict[str, Any]:
        """
        Complete a learning session and generate a summary.
        
        Args:
            db: Database session
            session_id: Session UUID
            
        Returns:
            Dictionary with summary and session statistics
            
        Raises:
            SessionManagerError: If session completion fails
        """
        try:
            # Get session
            session = db.query(Session).filter(Session.id == session_id).first()
            if not session:
                raise SessionManagerError(f"Session with id {session_id} not found")
            
            if session.status != "active":
                raise SessionManagerError(f"Session {session_id} is not active")
            
            # Calculate duration
            duration = datetime.utcnow() - session.started_at
            session.duration_seconds = int(duration.total_seconds())
            session.completed_at = datetime.utcnow()
            session.status = "completed"
            
            # Get all messages for summary
            messages = (
                db.query(Message)
                .filter(Message.session_id == session_id)
                .order_by(Message.timestamp)
                .all()
            )
            
            # Generate AI summary if there are messages
            summary = ""
            if messages:
                message_context = [
                    {"role": msg.role, "content": msg.content}
                    for msg in messages
                ]
                
                try:
                    duration_minutes = max(1, session.duration_seconds // 60)
                    summary = self.gemini_service.generate_session_summary(
                        message_context,
                        session.topic,
                        duration_minutes
                    )
                except Exception as e:
                    # If summary generation fails, provide a basic summary
                    summary = f"Completed learning session on {session.topic} with {len(messages)} messages exchanged."
            
            db.commit()
            
            # Clear cache
            cache_key = self._get_cache_key(str(session_id))
            self.redis_client.delete(cache_key)
            
            return {
                "session_id": str(session.id),
                "topic": session.topic,
                "duration_seconds": session.duration_seconds,
                "message_count": session.message_count,
                "summary": summary,
                "completed_at": session.completed_at.isoformat()
            }
            
        except SessionManagerError:
            raise
        except Exception as e:
            db.rollback()
            raise SessionManagerError(f"Failed to complete session: {str(e)}")


# Singleton instance for easy access
_session_manager_instance: Optional[SessionManager] = None


def get_session_manager() -> SessionManager:
    """
    Get or create a singleton instance of SessionManager.
    
    Returns:
        SessionManager instance
    """
    global _session_manager_instance
    if _session_manager_instance is None:
        _session_manager_instance = SessionManager()
    return _session_manager_instance
