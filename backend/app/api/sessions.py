"""
Session API endpoints for managing learning sessions.
Handles session creation, messaging with hybrid AI, history retrieval, and completion.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from ..database import get_db
from ..services.session_manager import SessionManager, SessionManagerError, get_session_manager
from ..services.ai_coordinator import AICoordinator, get_ai_coordinator, HybridResponse
from ..services.multimedia_parser import MultimediaParser
from .auth import get_current_user
from ..models.user import User


router = APIRouter(prefix="/api/sessions", tags=["sessions"])


# Request/Response Models
class StartSessionRequest(BaseModel):
    """Request model for starting a new session."""
    topic: str = Field(..., min_length=1, max_length=255, description="Learning topic for the session")


class StartSessionResponse(BaseModel):
    """Response model for session start."""
    session_id: str
    topic: str
    initial_message: str
    started_at: str


class SendMessageRequest(BaseModel):
    """Request model for sending a message in a session."""
    message: str = Field(..., min_length=1, description="User message content")


class WolframData(BaseModel):
    """Wolfram computational data in response."""
    computational_answer: Optional[str] = None
    step_by_step: List[str] = []
    images: List[str] = []


class MultimediaElement(BaseModel):
    """Multimedia element in response."""
    type: str
    content: str
    metadata: Optional[Dict[str, Any]] = None


class SendMessageResponse(BaseModel):
    """Response model for message sending."""
    message_id: str
    response: str
    has_wolfram_data: bool = False
    wolfram_data: Optional[WolframData] = None
    multimedia: List[MultimediaElement] = []
    source: str
    timestamp: str


class MessageHistory(BaseModel):
    """Message in history."""
    id: str
    role: str
    content: str
    multimedia: List[MultimediaElement] = []
    timestamp: str


class SessionHistoryResponse(BaseModel):
    """Response model for session history."""
    session_id: str
    topic: str
    messages: List[MessageHistory]
    message_count: int


class CompleteSessionResponse(BaseModel):
    """Response model for session completion."""
    session_id: str
    topic: str
    duration_seconds: int
    message_count: int
    summary: str
    completed_at: str


class ExplainConceptRequest(BaseModel):
    """Request model for explaining a concept."""
    concept: str = Field(..., min_length=1, max_length=500, description="Concept to explain")
    styles: List[str] = Field(
        default=["comprehensive", "analogy", "example"],
        description="Explanation styles to generate"
    )


class ExplanationFormat(BaseModel):
    """Single explanation format."""
    style: str
    content: str
    wolfram_data: Optional[WolframData] = None


class ExplainConceptResponse(BaseModel):
    """Response model for concept explanation."""
    concept: str
    explanations: List[ExplanationFormat]
    timestamp: str


class UserSessionSummary(BaseModel):
    """Summary of a user session."""
    id: str
    topic: str
    created_at: str
    completed_at: Optional[str] = None
    message_count: int
    status: str


class UserSessionsResponse(BaseModel):
    """Response model for user sessions list."""
    sessions: List[UserSessionSummary]
    total: int


@router.get("/user/sessions", response_model=UserSessionsResponse)
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Get all sessions for the current user.
    
    Returns a list of all learning sessions created by the authenticated user,
    ordered by creation date (most recent first).
    """
    from ..models.session import Session as SessionModel
    
    try:
        # Query all sessions for the user
        sessions = db.query(SessionModel).filter(
            SessionModel.user_id == current_user.id
        ).order_by(SessionModel.started_at.desc()).all()
        
        # Convert to response format
        session_summaries = [
            UserSessionSummary(
                id=str(session.id),
                topic=session.topic,
                created_at=session.started_at.isoformat(),
                completed_at=session.completed_at.isoformat() if session.completed_at else None,
                message_count=session.message_count,
                status=session.status
            )
            for session in sessions
        ]
        
        return UserSessionsResponse(
            sessions=session_summaries,
            total=len(session_summaries)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user sessions: {str(e)}"
        )


@router.post("/start", response_model=StartSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(
    request: StartSessionRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    session_manager: SessionManager = Depends(get_session_manager),
    ai_coordinator: AICoordinator = Depends(get_ai_coordinator)
):
    """
    Start a new learning session.
    
    Creates a new session for the authenticated user and generates an initial
    greeting message from the AI tutor.
    """
    try:
        # Create session
        session = session_manager.create_session(
            db=db,
            user_id=current_user.id,
            topic=request.topic
        )
        
        # Generate initial greeting from AI
        initial_prompt = f"I want to learn about {request.topic}"
        initial_response = ai_coordinator.generate_hybrid_response(
            message=initial_prompt,
            context=[],
            topic=request.topic
        )
        
        # Store the initial exchange
        session_manager.add_message(
            db=db,
            session_id=session.id,
            role="user",
            content=initial_prompt
        )
        
        session_manager.add_message(
            db=db,
            session_id=session.id,
            role="assistant",
            content=initial_response.message
        )
        
        return StartSessionResponse(
            session_id=str(session.id),
            topic=session.topic,
            initial_message=initial_response.message,
            started_at=session.started_at.isoformat()
        )
        
    except SessionManagerError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start session: {str(e)}"
        )


@router.post("/{session_id}/message", response_model=SendMessageResponse)
async def send_message(
    session_id: UUID,
    request: SendMessageRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    session_manager: SessionManager = Depends(get_session_manager),
    ai_coordinator: AICoordinator = Depends(get_ai_coordinator)
):
    """
    Send a message in a learning session and get AI response.
    
    Uses hybrid AI integration to provide responses that combine Gemini AI
    with Wolfram Alpha computational intelligence when appropriate.
    """
    try:
        # Verify session exists and belongs to user
        from ..models.session import Session
        session = db.query(Session).filter(Session.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {session_id} not found"
            )
        
        if session.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this session"
            )
        
        if session.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session is {session.status}, not active"
            )
        
        # Store user message
        user_message = session_manager.add_message(
            db=db,
            session_id=session_id,
            role="user",
            content=request.message
        )
        
        # Get conversation context
        context = session_manager.get_session_context(
            db=db,
            session_id=session_id,
            max_messages=20
        )
        
        # Generate hybrid AI response
        hybrid_response = ai_coordinator.generate_hybrid_response(
            message=request.message,
            context=context[:-1],  # Exclude the message we just added
            topic=session.topic
        )
        
        # Parse multimedia elements from response
        cleaned_text, multimedia_elements = MultimediaParser.parse(hybrid_response.message)
        
        # Store assistant response (with cleaned text)
        assistant_message = session_manager.add_message(
            db=db,
            session_id=session_id,
            role="assistant",
            content=cleaned_text  # Store cleaned text without multimedia tags
        )
        
        # Build response
        response_data = {
            "message_id": str(assistant_message.id),
            "response": cleaned_text,
            "has_wolfram_data": hybrid_response.has_wolfram_data,
            "source": hybrid_response.source,
            "timestamp": assistant_message.timestamp.isoformat(),
            "multimedia": [
                MultimediaElement(
                    type=elem.type.value,
                    content=elem.content,
                    metadata=elem.metadata
                )
                for elem in multimedia_elements
            ]
        }
        
        # Add Wolfram data if present
        if hybrid_response.has_wolfram_data:
            response_data["wolfram_data"] = WolframData(
                computational_answer=hybrid_response.computational_answer,
                step_by_step=hybrid_response.step_by_step,
                images=hybrid_response.images
            )
        elif hybrid_response.images:
            # Add AI-generated images as multimedia elements
            for img_url in hybrid_response.images:
                response_data["multimedia"].append(
                    MultimediaElement(
                        type="image",
                        content="AI-generated illustration",
                        metadata={"url": img_url, "generated": True}
                    )
                )
        
        return SendMessageResponse(**response_data)
        
    except HTTPException:
        raise
    except SessionManagerError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )


@router.get("/{session_id}/history", response_model=SessionHistoryResponse)
async def get_session_history(
    session_id: UUID,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    session_manager: SessionManager = Depends(get_session_manager)
):
    """
    Get the conversation history for a session.
    
    Returns all messages in the session with their metadata.
    """
    try:
        # Verify session exists and belongs to user
        from ..models.session import Session, Message
        session = db.query(Session).filter(Session.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {session_id} not found"
            )
        
        if session.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this session"
            )
        
        # Get all messages from database
        messages = (
            db.query(Message)
            .filter(Message.session_id == session_id)
            .order_by(Message.timestamp)
            .all()
        )
        
        # Format messages and parse multimedia
        message_history = []
        for msg in messages:
            # Parse multimedia from message content (if it's an assistant message)
            multimedia = []
            content = msg.content
            if msg.role == "assistant":
                # Try to parse multimedia tags that might still be in old messages
                _, multimedia_elements = MultimediaParser.parse(msg.content)
                multimedia = [
                    MultimediaElement(
                        type=elem.type.value,
                        content=elem.content,
                        metadata=elem.metadata
                    )
                    for elem in multimedia_elements
                ]
            
            message_history.append(
                MessageHistory(
                    id=str(msg.id),
                    role=msg.role,
                    content=content,
                    multimedia=multimedia,
                    timestamp=msg.timestamp.isoformat()
                )
            )
        
        return SessionHistoryResponse(
            session_id=str(session.id),
            topic=session.topic,
            messages=message_history,
            message_count=len(message_history)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session history: {str(e)}"
        )


@router.post("/{session_id}/complete", response_model=CompleteSessionResponse)
async def complete_session(
    session_id: UUID,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    session_manager: SessionManager = Depends(get_session_manager)
):
    """
    Complete a learning session and generate a summary.
    
    Marks the session as completed, calculates duration, and generates
    an AI-powered summary of what was learned.
    """
    try:
        # Verify session exists and belongs to user
        from ..models.session import Session
        session = db.query(Session).filter(Session.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {session_id} not found"
            )
        
        if session.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this session"
            )
        
        # Complete the session
        completion_data = session_manager.complete_session(
            db=db,
            session_id=session_id
        )
        
        return CompleteSessionResponse(**completion_data)
        
    except HTTPException:
        raise
    except SessionManagerError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete session: {str(e)}"
        )



@router.post("/{session_id}/explain", response_model=ExplainConceptResponse)
async def explain_concept(
    session_id: UUID,
    request: ExplainConceptRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ai_coordinator: AICoordinator = Depends(get_ai_coordinator)
):
    """
    Generate multiple explanation formats for a concept.
    
    Uses hybrid AI integration to provide explanations that combine Gemini AI
    with Wolfram Alpha computational intelligence for math/science concepts.
    """
    try:
        # Verify session exists and belongs to user
        from ..models.session import Session
        session = db.query(Session).filter(Session.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {session_id} not found"
            )
        
        if session.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this session"
            )
        
        # Validate styles
        valid_styles = ["comprehensive", "analogy", "example", "steps", "simple"]
        styles = [s for s in request.styles if s in valid_styles]
        if not styles:
            styles = ["comprehensive"]
        
        # Generate explanations for each style
        explanations = []
        for style in styles:
            # Generate explanation using hybrid AI
            hybrid_response = ai_coordinator.generate_explanation(
                concept=request.concept,
                style=style,
                topic=session.topic
            )
            
            # Build explanation format
            explanation_data = {
                "style": style,
                "content": hybrid_response.message
            }
            
            # Add Wolfram data if present
            if hybrid_response.has_wolfram_data:
                explanation_data["wolfram_data"] = WolframData(
                    computational_answer=hybrid_response.computational_answer,
                    step_by_step=hybrid_response.step_by_step,
                    images=hybrid_response.images
                )
            
            explanations.append(ExplanationFormat(**explanation_data))
        
        return ExplainConceptResponse(
            concept=request.concept,
            explanations=explanations,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate explanation: {str(e)}"
        )
