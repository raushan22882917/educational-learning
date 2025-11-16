"""
NotebookLM-inspired service for intelligent note analysis and insights.
"""

import json
from typing import Dict, Any, List, Optional
from .gemini import get_gemini_service
from .cache import get_cache_service


class NotebookLMService:
    """Service for NotebookLM-style intelligent analysis."""
    
    def __init__(self):
        """Initialize NotebookLM service."""
        self.gemini_service = get_gemini_service()
        self.cache_service = get_cache_service()
    
    def generate_study_guide(
        self, 
        video_content: Dict[str, Any],
        focus_areas: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive study guide.
        
        Args:
            video_content: Processed video content
            focus_areas: Optional specific areas to focus on
            
        Returns:
            Study guide with sections
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        focus_text = ""
        if focus_areas:
            focus_text = f"\nFocus especially on: {', '.join(focus_areas)}"
        
        prompt = f"""Create a comprehensive study guide from this video.

Video: {metadata['title']}
Channel: {metadata['channel']}
{focus_text}

"""
        
        if transcript:
            prompt += f"Content:\n{transcript[:5000]}\n\n"
        
        prompt += """Generate a study guide with these sections:

1. **Overview** - What this content covers
2. **Prerequisites** - What you should know first
3. **Main Concepts** - Core ideas explained
4. **Key Terminology** - Important terms and definitions
5. **Examples & Applications** - Real-world uses
6. **Common Misconceptions** - What people often get wrong
7. **Practice Questions** - Questions to test understanding
8. **Further Learning** - What to study next

Format as JSON:
{
  "overview": "...",
  "prerequisites": ["..."],
  "main_concepts": [{"concept": "...", "explanation": "..."}],
  "terminology": [{"term": "...", "definition": "..."}],
  "examples": ["..."],
  "misconceptions": ["..."],
  "practice_questions": ["..."],
  "further_learning": ["..."]
}"""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.6,
                cache_key_prefix="notebooklm_study_guide"
            )
            
            # Parse JSON
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            study_guide = json.loads(cleaned)
            return study_guide
            
        except Exception as e:
            print(f"Error generating study guide: {e}")
            return {
                "overview": "Unable to generate study guide",
                "prerequisites": [],
                "main_concepts": [],
                "terminology": [],
                "examples": [],
                "misconceptions": [],
                "practice_questions": [],
                "further_learning": []
            }
    
    def generate_connections(
        self, 
        video_content: Dict[str, Any],
        related_topics: Optional[List[str]] = None
    ) -> List[Dict[str, str]]:
        """
        Find connections to other topics and concepts.
        
        Args:
            video_content: Processed video content
            related_topics: Optional list of topics to connect to
            
        Returns:
            List of connections
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        related_text = ""
        if related_topics:
            related_text = f"\nConsider connections to: {', '.join(related_topics)}"
        
        prompt = f"""Identify connections between this video content and other topics/concepts.

Video: {metadata['title']}
{related_text}

"""
        
        if transcript:
            prompt += f"Content:\n{transcript[:4000]}\n\n"
        
        prompt += """Find 5-7 meaningful connections to:
- Related academic subjects
- Real-world applications
- Historical context
- Current events
- Other fields of study

Return as JSON array:
[
  {
    "topic": "Topic name",
    "connection": "How it connects",
    "relevance": "Why it matters"
  }
]"""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.7,
                cache_key_prefix="notebooklm_connections"
            )
            
            # Parse JSON
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            connections = json.loads(cleaned)
            return connections
            
        except Exception as e:
            print(f"Error generating connections: {e}")
            return []
    
    def generate_insights(
        self, 
        video_content: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """
        Generate AI insights about the content.
        
        Args:
            video_content: Processed video content
            
        Returns:
            List of insights
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        prompt = f"""Analyze this video and provide intelligent insights.

Video: {metadata['title']}
Channel: {metadata['channel']}

"""
        
        if transcript:
            prompt += f"Content:\n{transcript[:4000]}\n\n"
        
        prompt += """Generate 5-7 insights such as:
- Key patterns or themes
- Surprising or counterintuitive points
- Practical implications
- Deeper meanings
- Critical analysis
- Unique perspectives

Return as JSON array:
[
  {
    "type": "pattern|surprise|implication|analysis|perspective",
    "title": "Brief title",
    "insight": "Detailed insight"
  }
]"""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.7,
                cache_key_prefix="notebooklm_insights"
            )
            
            # Parse JSON
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            insights = json.loads(cleaned)
            return insights
            
        except Exception as e:
            print(f"Error generating insights: {e}")
            return []
    
    def generate_timeline(
        self, 
        video_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Create a timeline of key moments in the video.
        
        Args:
            video_content: Processed video content
            
        Returns:
            Timeline of key moments
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        prompt = f"""Create a timeline of key moments from this video.

Video: {metadata['title']}

"""
        
        if transcript:
            prompt += f"Content:\n{transcript[:4000]}\n\n"
        
        prompt += """Identify 5-10 key moments and organize them chronologically.

Return as JSON array:
[
  {
    "timestamp": "Approximate time (e.g., 'Beginning', '5:30', 'Middle', 'End')",
    "title": "What happens",
    "description": "Brief description",
    "importance": "Why it matters"
  }
]"""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.6,
                cache_key_prefix="notebooklm_timeline"
            )
            
            # Parse JSON
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            timeline = json.loads(cleaned)
            return timeline
            
        except Exception as e:
            print(f"Error generating timeline: {e}")
            return []
    
    def ask_question(
        self, 
        video_content: Dict[str, Any],
        question: str
    ) -> str:
        """
        Answer questions about the video content.
        
        Args:
            video_content: Processed video content
            question: User's question
            
        Returns:
            Answer to the question
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        prompt = f"""Answer this question about the video content.

Video: {metadata['title']}
Channel: {metadata['channel']}

"""
        
        if transcript:
            prompt += f"Content:\n{transcript[:4000]}\n\n"
        
        prompt += f"""Question: {question}

Provide a clear, accurate answer based on the video content. If the answer isn't in the content, say so and provide relevant context."""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.6
            )
            return response.strip()
            
        except Exception as e:
            print(f"Error answering question: {e}")
            return "Unable to answer the question at this time."
    
    def generate_audio_overview(
        self, 
        video_content: Dict[str, Any]
    ) -> str:
        """
        Generate a script for an audio overview (NotebookLM's signature feature).
        
        Args:
            video_content: Processed video content
            
        Returns:
            Audio overview script
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        prompt = f"""Create an engaging audio overview script for this video content.

Video: {metadata['title']}
Channel: {metadata['channel']}

"""
        
        if transcript:
            prompt += f"Content:\n{transcript[:4000]}\n\n"
        
        prompt += """Write a conversational 2-3 minute audio script that:
1. Introduces the topic engagingly
2. Highlights the most important points
3. Explains why it matters
4. Ends with key takeaways

Make it sound natural, like a podcast host explaining to a friend.
Use conversational language and enthusiasm."""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.8,
                cache_key_prefix="notebooklm_audio"
            )
            return response.strip()
            
        except Exception as e:
            print(f"Error generating audio overview: {e}")
            return "Unable to generate audio overview at this time."
    
    def generate_briefing_doc(
        self, 
        video_content: Dict[str, Any]
    ) -> str:
        """
        Generate a briefing document (executive summary style).
        
        Args:
            video_content: Processed video content
            
        Returns:
            Briefing document
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        prompt = f"""Create a professional briefing document for this video.

Video: {metadata['title']}
Channel: {metadata['channel']}

"""
        
        if transcript:
            prompt += f"Content:\n{transcript[:4000]}\n\n"
        
        prompt += """Format as a briefing document with:

# Executive Summary
[2-3 sentence overview]

# Key Points
- [Main points]

# Detailed Analysis
[Deeper dive into content]

# Recommendations
[What to do with this information]

# Conclusion
[Final thoughts]

Use professional, clear language."""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.6,
                cache_key_prefix="notebooklm_briefing"
            )
            return response.strip()
            
        except Exception as e:
            print(f"Error generating briefing doc: {e}")
            return "Unable to generate briefing document at this time."


# Singleton instance
_notebooklm_service_instance: Optional[NotebookLMService] = None


def get_notebooklm_service() -> NotebookLMService:
    """Get or create singleton NotebookLM service instance."""
    global _notebooklm_service_instance
    if _notebooklm_service_instance is None:
        _notebooklm_service_instance = NotebookLMService()
    return _notebooklm_service_instance
