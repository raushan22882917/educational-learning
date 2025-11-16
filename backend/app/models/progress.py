from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class Progress(Base):
    """
    Progress model for tracking user learning progress and statistics.
    """
    __tablename__ = "progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    topics_completed = Column(Integer, default=0, nullable=False)
    total_time_spent = Column(Integer, default=0, nullable=False)  # in seconds
    current_streak = Column(Integer, default=0, nullable=False)
    last_activity = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    level = Column(Integer, default=1, nullable=False)

    # Relationships
    user = relationship("User", back_populates="progress")

    def __repr__(self):
        return f"<Progress(id={self.id}, user_id={self.user_id}, level={self.level}, topics_completed={self.topics_completed})>"


class Achievement(Base):
    """
    Achievement model for storing user achievements and badges.
    """
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    icon = Column(String(100), nullable=False)

    # Relationships
    user = relationship("User", back_populates="achievements")

    def __repr__(self):
        return f"<Achievement(id={self.id}, user_id={self.user_id}, title={self.title})>"
