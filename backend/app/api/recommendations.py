"""
Recommendations API endpoints for personalized learning topic recommendations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from ..database import get_db
from ..services.recommendations import get_recommendations_service, RecommendationsServiceError
from ..models.user import User
from .auth import get_current_user

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


# Pydantic models for request/response
class RecommendationResponse(BaseModel):
    """Response model for a single recommendation."""
    id: str
    title: str
    description: str
    difficulty: str
    estimated_duration: Optional[str] = None
    category: Optional[str] = None
    generated_at: str
    rank: int


class RecommendationsListResponse(BaseModel):
    """Response model for list of recommendations."""
    user_id: str
    recommendations: List[RecommendationResponse]
    count: int


class FeedbackRequest(BaseModel):
    """Request model for recommendation feedback."""
    recommendation_id: str = Field(..., description="ID of the recommendation")
    feedback_type: str = Field(..., description="Type of feedback: 'accepted', 'rejected', or 'rated'")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating from 1-5 (required if feedback_type is 'rated')")


class FeedbackResponse(BaseModel):
    """Response model for feedback submission."""
    success: bool
    message: str
    feedback_type: str
    recommendation_id: str


@router.get("/{user_id}", response_model=RecommendationsListResponse)
async def get_recommendations(
    user_id: str,
    count: int = Query(default=5, ge=1, le=10, description="Number of recommendations to generate"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized learning recommendations for a user.
    
    Args:
        user_id: User ID to get recommendations for
        count: Number of recommendations to generate (1-10, default: 5)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of personalized topic recommendations
        
    Raises:
        HTTPException: If user not authorized or recommendation generation fails
    """
    # Verify user can only access their own recommendations
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's recommendations"
        )
    
    try:
        # Convert user_id string to UUID
        user_uuid = uuid.UUID(user_id)
        
        # Get recommendations service and generate recommendations
        recommendations_service = get_recommendations_service(db)
        recommendations = recommendations_service.generate_recommendations(user_uuid, count)
        
        # Convert to response model
        recommendation_responses = [
            RecommendationResponse(**rec)
            for rec in recommendations
        ]
        
        return RecommendationsListResponse(
            user_id=user_id,
            recommendations=recommendation_responses,
            count=len(recommendation_responses)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user ID format: {str(e)}"
        )
    except RecommendationsServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.post("/{user_id}/feedback", response_model=FeedbackResponse)
async def submit_recommendation_feedback(
    user_id: str,
    feedback: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit feedback on a recommendation.
    
    Args:
        user_id: User ID submitting feedback
        feedback: Feedback data including recommendation_id, feedback_type, and optional rating
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Confirmation of feedback submission
        
    Raises:
        HTTPException: If user not authorized, validation fails, or feedback recording fails
    """
    # Verify user can only submit feedback for their own recommendations
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to submit feedback for this user"
        )
    
    # Validate feedback_type
    valid_feedback_types = ["accepted", "rejected", "rated"]
    if feedback.feedback_type not in valid_feedback_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid feedback_type. Must be one of: {', '.join(valid_feedback_types)}"
        )
    
    # Validate rating is provided if feedback_type is 'rated'
    if feedback.feedback_type == "rated" and feedback.rating is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating is required when feedback_type is 'rated'"
        )
    
    try:
        # Convert user_id string to UUID
        user_uuid = uuid.UUID(user_id)
        
        # Get recommendations service and record feedback
        recommendations_service = get_recommendations_service(db)
        result = recommendations_service.record_feedback(
            user_uuid,
            feedback.recommendation_id,
            feedback.feedback_type,
            feedback.rating
        )
        
        return FeedbackResponse(**result)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user ID format: {str(e)}"
        )
    except RecommendationsServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record feedback: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )
