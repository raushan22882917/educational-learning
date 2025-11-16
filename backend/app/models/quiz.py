from sqlalchemy import Column, String, DateTime, Float, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class Quiz(Base):
    """
    Quiz model for storing quiz data, questions, answers, and scores.
    """
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    questions = Column(JSON, nullable=False)  # Stores list of question objects
    answers = Column(JSON, nullable=False)  # Stores list of user answers
    score = Column(Float, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="quizzes")

    def __repr__(self):
        return f"<Quiz(id={self.id}, user_id={self.user_id}, topic={self.topic}, score={self.score})>"
