"""
API endpoints for YouTube notebook functionality.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any, Optional
from ..services.youtube_service import get_youtube_service, YouTubeServiceError
from ..services.notebooklm_service import get_notebooklm_service
from ..services.wolfram import get_wolfram_service
from ..api.auth import get_current_user
from ..models.user import User


router = APIRouter(prefix="/api/youtube", tags=["youtube"])


class VideoProcessRequest(BaseModel):
    """Request to process a YouTube video."""
    url: str
    include_transcript: bool = True


class VideoChatRequest(BaseModel):
    """Request to chat about video content."""
    video_url: str
    question: str
    context: Optional[str] = None  # Optional: notes, summary, or other context


class NotesRequest(BaseModel):
    """Request to generate notes."""
    video_url: str
    style: str = "detailed"  # detailed, bullet, outline


class SummaryRequest(BaseModel):
    """Request to generate summary."""
    video_url: str
    length: str = "medium"  # short, medium, long


class FlashcardsRequest(BaseModel):
    """Request to generate flashcards."""
    video_url: str
    count: int = 10


class KeyPointsRequest(BaseModel):
    """Request to extract key points."""
    video_url: str
    count: int = 5


class QuizRequest(BaseModel):
    """Request to generate quiz."""
    video_url: str
    count: int = 5


class StudyGuideRequest(BaseModel):
    """Request to generate study guide."""
    video_url: str
    focus_areas: Optional[List[str]] = None


class ConnectionsRequest(BaseModel):
    """Request to find connections."""
    video_url: str
    related_topics: Optional[List[str]] = None


class InsightsRequest(BaseModel):
    """Request to generate insights."""
    video_url: str


class TimelineRequest(BaseModel):
    """Request to generate timeline."""
    video_url: str


class QuestionRequest(BaseModel):
    """Request to ask a question."""
    video_url: str
    question: str


class AudioOverviewRequest(BaseModel):
    """Request to generate audio overview."""
    video_url: str


class BriefingDocRequest(BaseModel):
    """Request to generate briefing document."""
    video_url: str


class AnalyzeNotesForWolframRequest(BaseModel):
    """Request to analyze notes and generate Wolfram visualizations."""
    notes: str
    video_title: str


class ExtractFormulasRequest(BaseModel):
    """Request to extract formulas from notes."""
    notes: str
    video_title: str


class VisualizeFormulaRequest(BaseModel):
    """Request to visualize a specific formula."""
    formula: str
    name: str
    description: str


@router.post("/process")
async def process_video(
    request: VideoProcessRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Process a YouTube video and extract content.
    
    Args:
        request: Video processing request
        current_user: Authenticated user
        
    Returns:
        Processed video content
    """
    try:
        youtube_service = get_youtube_service()
        content = youtube_service.process_video_content(
            video_url=request.url,
            include_transcript=request.include_transcript
        )
        
        return {
            "success": True,
            "data": content
        }
        
    except YouTubeServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error processing video: {e}")
        raise HTTPException(status_code=500, detail="Failed to process video")


@router.post("/notes")
async def generate_notes(
    request: NotesRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate notes from YouTube video.
    
    Args:
        request: Notes generation request
        current_user: Authenticated user
        
    Returns:
        Generated notes
    """
    try:
        youtube_service = get_youtube_service()
        
        # Process video
        video_content = youtube_service.process_video_content(request.video_url)
        
        # Generate notes
        notes = youtube_service.generate_notes(video_content, request.style)
        
        return {
            "success": True,
            "data": {
                "notes": notes,
                "video_metadata": video_content["metadata"]
            }
        }
        
    except YouTubeServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error generating notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate notes")


@router.post("/summary")
async def generate_summary(
    request: SummaryRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate summary from YouTube video.
    
    Args:
        request: Summary generation request
        current_user: Authenticated user
        
    Returns:
        Generated summary
    """
    try:
        youtube_service = get_youtube_service()
        
        # Process video
        video_content = youtube_service.process_video_content(request.video_url)
        
        # Generate summary
        summary = youtube_service.generate_summary(video_content, request.length)
        
        return {
            "success": True,
            "data": {
                "summary": summary,
                "video_metadata": video_content["metadata"]
            }
        }
        
    except YouTubeServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")


@router.post("/flashcards")
async def generate_flashcards(
    request: FlashcardsRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate flashcards from YouTube video.
    
    Args:
        request: Flashcards generation request
        current_user: Authenticated user
        
    Returns:
        Generated flashcards
    """
    try:
        youtube_service = get_youtube_service()
        
        # Process video
        video_content = youtube_service.process_video_content(request.video_url)
        
        # Generate flashcards
        flashcards = youtube_service.generate_flashcards(video_content, request.count)
        
        return {
            "success": True,
            "data": {
                "flashcards": flashcards,
                "video_metadata": video_content["metadata"]
            }
        }
        
    except YouTubeServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate flashcards")


@router.post("/key-points")
async def extract_key_points(
    request: KeyPointsRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Extract key points from YouTube video.
    
    Args:
        request: Key points extraction request
        current_user: Authenticated user
        
    Returns:
        Extracted key points
    """
    try:
        youtube_service = get_youtube_service()
        
        # Process video
        video_content = youtube_service.process_video_content(request.video_url)
        
        # Extract key points
        key_points = youtube_service.generate_key_points(video_content, request.count)
        
        return {
            "success": True,
            "data": {
                "key_points": key_points,
                "video_metadata": video_content["metadata"]
            }
        }
        
    except YouTubeServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error extracting key points: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract key points")


@router.post("/quiz")
async def generate_quiz(
    request: QuizRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate quiz from YouTube video.
    
    Args:
        request: Quiz generation request
        current_user: Authenticated user
        
    Returns:
        Generated quiz questions
    """
    try:
        youtube_service = get_youtube_service()
        
        # Process video
        video_content = youtube_service.process_video_content(request.video_url)
        
        # Generate quiz
        questions = youtube_service.generate_quiz(video_content, request.count)
        
        return {
            "success": True,
            "data": {
                "questions": questions,
                "video_metadata": video_content["metadata"]
            }
        }
        
    except YouTubeServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz")


@router.post("/complete-notebook")
async def generate_complete_notebook(
    request: VideoProcessRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate complete notebook with all content types including NotebookLM features.
    
    Args:
        request: Video processing request
        current_user: Authenticated user
        
    Returns:
        Complete notebook with notes, summary, flashcards, etc.
    """
    try:
        youtube_service = get_youtube_service()
        notebooklm_service = get_notebooklm_service()
        
        # Process video
        video_content = youtube_service.process_video_content(
            request.url,
            request.include_transcript
        )
        
        # Generate all content types
        notes_data = youtube_service.generate_notes(video_content, "detailed", include_wolfram=True)
        summary = youtube_service.generate_summary(video_content, "medium")
        flashcards = youtube_service.generate_flashcards(video_content, 10)
        key_points = youtube_service.generate_key_points(video_content, 5)
        quiz = youtube_service.generate_quiz(video_content, 5)
        
        # Generate NotebookLM features
        study_guide = notebooklm_service.generate_study_guide(video_content)
        insights = notebooklm_service.generate_insights(video_content)
        connections = notebooklm_service.generate_connections(video_content)
        timeline = notebooklm_service.generate_timeline(video_content)
        audio_overview = notebooklm_service.generate_audio_overview(video_content)
        briefing_doc = notebooklm_service.generate_briefing_doc(video_content)
        
        return {
            "success": True,
            "data": {
                "video_metadata": video_content["metadata"],
                "has_transcript": video_content["has_transcript"],
                "notes": notes_data["text"],
                "notes_wolfram": notes_data["wolfram_visualizations"],
                "summary": summary,
                "flashcards": flashcards,
                "key_points": key_points,
                "quiz": quiz,
                # NotebookLM features
                "study_guide": study_guide,
                "insights": insights,
                "connections": connections,
                "timeline": timeline,
                "audio_overview": audio_overview,
                "briefing_doc": briefing_doc
            }
        }
        
    except YouTubeServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error generating complete notebook: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate notebook")


@router.post("/study-guide")
async def generate_study_guide(
    request: StudyGuideRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Generate comprehensive study guide."""
    try:
        youtube_service = get_youtube_service()
        notebooklm_service = get_notebooklm_service()
        
        video_content = youtube_service.process_video_content(request.video_url)
        study_guide = notebooklm_service.generate_study_guide(
            video_content, 
            request.focus_areas
        )
        
        return {
            "success": True,
            "data": {
                "study_guide": study_guide,
                "video_metadata": video_content["metadata"]
            }
        }
    except Exception as e:
        print(f"Error generating study guide: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate study guide")


@router.post("/insights")
async def generate_insights(
    request: InsightsRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Generate AI insights."""
    try:
        youtube_service = get_youtube_service()
        notebooklm_service = get_notebooklm_service()
        
        video_content = youtube_service.process_video_content(request.video_url)
        insights = notebooklm_service.generate_insights(video_content)
        
        return {
            "success": True,
            "data": {
                "insights": insights,
                "video_metadata": video_content["metadata"]
            }
        }
    except Exception as e:
        print(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")


@router.post("/connections")
async def find_connections(
    request: ConnectionsRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Find connections to other topics."""
    try:
        youtube_service = get_youtube_service()
        notebooklm_service = get_notebooklm_service()
        
        video_content = youtube_service.process_video_content(request.video_url)
        connections = notebooklm_service.generate_connections(
            video_content,
            request.related_topics
        )
        
        return {
            "success": True,
            "data": {
                "connections": connections,
                "video_metadata": video_content["metadata"]
            }
        }
    except Exception as e:
        print(f"Error finding connections: {e}")
        raise HTTPException(status_code=500, detail="Failed to find connections")


@router.post("/timeline")
async def generate_timeline(
    request: TimelineRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Generate content timeline."""
    try:
        youtube_service = get_youtube_service()
        notebooklm_service = get_notebooklm_service()
        
        video_content = youtube_service.process_video_content(request.video_url)
        timeline = notebooklm_service.generate_timeline(video_content)
        
        return {
            "success": True,
            "data": {
                "timeline": timeline,
                "video_metadata": video_content["metadata"]
            }
        }
    except Exception as e:
        print(f"Error generating timeline: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate timeline")


@router.post("/ask")
async def ask_question(
    request: QuestionRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Ask a question about the video."""
    try:
        youtube_service = get_youtube_service()
        notebooklm_service = get_notebooklm_service()
        
        video_content = youtube_service.process_video_content(request.video_url)
        answer = notebooklm_service.ask_question(video_content, request.question)
        
        return {
            "success": True,
            "data": {
                "question": request.question,
                "answer": answer,
                "video_metadata": video_content["metadata"]
            }
        }
    except Exception as e:
        print(f"Error answering question: {e}")
        raise HTTPException(status_code=500, detail="Failed to answer question")


@router.post("/audio-overview")
async def generate_audio_overview(
    request: AudioOverviewRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Generate audio overview script."""
    try:
        youtube_service = get_youtube_service()
        notebooklm_service = get_notebooklm_service()
        
        video_content = youtube_service.process_video_content(request.video_url)
        audio_overview = notebooklm_service.generate_audio_overview(video_content)
        
        return {
            "success": True,
            "data": {
                "audio_overview": audio_overview,
                "video_metadata": video_content["metadata"]
            }
        }
    except Exception as e:
        print(f"Error generating audio overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio overview")


@router.post("/briefing")
async def generate_briefing(
    request: BriefingDocRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Generate briefing document."""
    try:
        youtube_service = get_youtube_service()
        notebooklm_service = get_notebooklm_service()
        
        video_content = youtube_service.process_video_content(request.video_url)
        briefing_doc = notebooklm_service.generate_briefing_doc(video_content)
        
        return {
            "success": True,
            "data": {
                "briefing_doc": briefing_doc,
                "video_metadata": video_content["metadata"]
            }
        }
    except Exception as e:
        print(f"Error generating briefing: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate briefing")


@router.post("/analyze-wolfram")
async def analyze_notes_for_wolfram(
    request: AnalyzeNotesForWolframRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Analyze notes with Gemini and generate Wolfram visualizations on-demand.
    
    Args:
        request: Notes and video title
        current_user: Authenticated user
        
    Returns:
        Wolfram visualizations
    """
    try:
        youtube_service = get_youtube_service()
        wolfram_service = get_wolfram_service()
        
        print(f"🔍 Analyzing notes for Wolfram visualizations...")
        
        # Use Gemini to analyze notes and identify concepts
        video_metadata = {"title": request.video_title, "description": ""}
        concepts = youtube_service.analyze_notes_for_wolfram(request.notes, video_metadata)
        
        print(f"✓ Gemini identified {len(concepts)} concepts")
        
        wolfram_visualizations = []
        
        for concept_info in concepts[:5]:  # Limit to 5 visualizations
            query = concept_info.get("query", "")
            description = concept_info.get("description", "")
            viz_type = concept_info.get("type", "")
            
            if not query:
                continue
            
            try:
                print(f"🔬 Querying Wolfram for: {query}")
                result = wolfram_service.query(query)
                
                if result and (result.get("result") or result.get("images")):
                    wolfram_visualizations.append({
                        "query": query,
                        "description": description,
                        "type": viz_type,
                        "result": result.get("result"),
                        "images": result.get("images", [])[:2],
                        "step_by_step": result.get("step_by_step", [])
                    })
                    print(f"✓ Successfully visualized: {query}")
                else:
                    print(f"✗ No visualization data for: {query}")
                    
            except Exception as e:
                print(f"Error querying Wolfram for '{query}': {e}")
        
        return {
            "success": True,
            "data": {
                "wolfram_visualizations": wolfram_visualizations,
                "concepts_found": len(concepts)
            }
        }
        
    except Exception as e:
        print(f"Error analyzing notes for Wolfram: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to analyze notes for Wolfram")


@router.post("/extract-formulas")
async def extract_formulas(
    request: ExtractFormulasRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Extract all formulas and equations from notes using Gemini.
    
    Args:
        request: Notes and video title
        current_user: Authenticated user
        
    Returns:
        List of formulas with descriptions
    """
    try:
        youtube_service = get_youtube_service()
        
        print(f"📐 Extracting formulas from notes...")
        
        # Use Gemini to extract formulas
        formulas = youtube_service.extract_formulas_from_notes(
            request.notes, 
            {"title": request.video_title}
        )
        
        print(f"✓ Extracted {len(formulas)} formulas")
        
        return {
            "success": True,
            "data": {
                "formulas": formulas,
                "count": len(formulas)
            }
        }
        
    except Exception as e:
        print(f"Error extracting formulas: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to extract formulas")


@router.post("/visualize-formula")
async def visualize_formula(
    request: VisualizeFormulaRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Visualize a specific formula with Wolfram Alpha.
    
    Args:
        request: Formula to visualize
        current_user: Authenticated user
        
    Returns:
        Wolfram visualization
    """
    try:
        wolfram_service = get_wolfram_service()
        
        print(f"🔬 Visualizing formula: {request.formula}")
        
        # Query Wolfram for this formula
        result = wolfram_service.query(request.formula)
        
        if result and (result.get("result") or result.get("images")):
            visualization = {
                "query": request.formula,
                "description": request.description,
                "type": "formula",
                "result": result.get("result"),
                "images": result.get("images", [])[:3],  # Up to 3 images
                "step_by_step": result.get("step_by_step", [])
            }
            
            print(f"✓ Successfully visualized: {request.name}")
            
            return {
                "success": True,
                "data": {
                    "visualization": visualization
                }
            }
        else:
            print(f"✗ No visualization data for: {request.formula}")
            return {
                "success": False,
                "data": {
                    "visualization": None
                }
            }
        
    except Exception as e:
        print(f"Error visualizing formula: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to visualize formula")


@router.post("/chat")
async def chat_with_video(
    request: VideoChatRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Chat with video content - ask questions and get AI responses.
    
    Args:
        request: Chat request with video URL and question
        current_user: Authenticated user
        
    Returns:
        AI response based on video content
    """
    try:
        youtube_service = get_youtube_service()
        notebooklm_service = get_notebooklm_service()
        
        # Get video content
        video_content = youtube_service.process_video_content(request.video_url)
        
        # Use NotebookLM service to answer the question
        answer = notebooklm_service.ask_question(video_content, request.question)
        
        # Check if question is mathematical/scientific and needs Wolfram
        wolfram_data = None
        if any(keyword in request.question.lower() for keyword in [
            'calculate', 'solve', 'plot', 'graph', 'formula', 'equation',
            'derivative', 'integral', 'function', 'compute'
        ]):
            try:
                wolfram_service = get_wolfram_service()
                # Extract potential query from question
                query = request.question.replace('?', '').strip()
                result = wolfram_service.query(query)
                if result and (result.get("result") or result.get("images")):
                    wolfram_data = {
                        "query": query,
                        "result": result.get("result"),
                        "images": result.get("images", [])[:2],
                        "step_by_step": result.get("step_by_step", [])
                    }
            except Exception as e:
                print(f"Wolfram query failed: {e}")
        
        return {
            "success": True,
            "data": {
                "question": request.question,
                "answer": answer,
                "wolfram_data": wolfram_data,
                "video_metadata": video_content["metadata"]
            }
        }
        
    except Exception as e:
        print(f"Error in video chat: {e}")
        raise HTTPException(status_code=500, detail="Failed to process question")
