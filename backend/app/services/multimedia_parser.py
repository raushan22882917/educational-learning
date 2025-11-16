"""
Multimedia content parser for extracting and processing multimedia elements from AI responses.
"""

import re
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum


class MediaType(Enum):
    """Types of multimedia content."""
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    WOLFRAM = "wolfram"
    INTERACTIVE = "interactive"


@dataclass
class MultimediaElement:
    """Represents a multimedia element in the content."""
    type: MediaType
    content: str
    position: int
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "type": self.type.value,
            "content": self.content,
            "position": self.position,
            "metadata": self.metadata or {}
        }


class MultimediaParser:
    """Parser for extracting multimedia elements from text."""
    
    # Regex patterns for different media types
    PATTERNS = {
        MediaType.IMAGE: r'\[IMAGE:\s*([^\]]+)\]',
        MediaType.VIDEO: r'\[VIDEO:\s*([^\]]+)\]',
        MediaType.AUDIO: r'\[AUDIO:\s*([^\]]+)\]',
        MediaType.WOLFRAM: r'\[WOLFRAM:\s*([^\]]+)\]',
        MediaType.INTERACTIVE: r'\[INTERACTIVE:\s*([^\]]+)\]',
    }
    
    @classmethod
    def parse(cls, text: str) -> Tuple[str, List[MultimediaElement]]:
        """
        Parse text and extract multimedia elements.
        
        Args:
            text: The text containing multimedia tags
            
        Returns:
            Tuple of (cleaned_text, list of multimedia elements)
        """
        elements = []
        cleaned_text = text
        
        for media_type, pattern in cls.PATTERNS.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                element = MultimediaElement(
                    type=media_type,
                    content=match.group(1).strip(),
                    position=match.start(),
                    metadata=cls._generate_metadata(media_type, match.group(1).strip())
                )
                elements.append(element)
        
        # Sort by position
        elements.sort(key=lambda x: x.position)
        
        # Remove tags from text
        for pattern in cls.PATTERNS.values():
            cleaned_text = re.sub(pattern, '', cleaned_text, flags=re.IGNORECASE)
        
        # Clean up extra whitespace
        cleaned_text = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned_text)
        cleaned_text = cleaned_text.strip()
        
        return cleaned_text, elements
    
    @staticmethod
    def _generate_metadata(media_type: MediaType, content: str) -> Dict[str, Any]:
        """
        Generate metadata for multimedia elements.
        
        Args:
            media_type: Type of media
            content: Content description
            
        Returns:
            Metadata dictionary
        """
        from urllib.parse import quote
        
        metadata = {}
        
        if media_type == MediaType.VIDEO:
            metadata["platform"] = "youtube"
            metadata["search_query"] = content
            metadata["embed_url"] = f"https://www.youtube.com/results?search_query={quote(content)}"
            
        elif media_type == MediaType.WOLFRAM:
            metadata["query"] = content
            metadata["wolfram_url"] = f"https://www.wolframalpha.com/input?i={quote(content)}"
            
        elif media_type == MediaType.IMAGE:
            metadata["description"] = content
            metadata["search_query"] = content
            metadata["alt_text"] = content
            
        elif media_type == MediaType.AUDIO:
            metadata["description"] = content
            metadata["type"] = "pronunciation" if "pronounce" in content.lower() else "explanation"
            
        elif media_type == MediaType.INTERACTIVE:
            metadata["description"] = content
            # Classify activity type
            content_lower = content.lower()
            if any(word in content_lower for word in ["experiment", "test", "try"]):
                metadata["activity_type"] = "experiment"
            elif any(word in content_lower for word in ["draw", "sketch", "create"]):
                metadata["activity_type"] = "creative"
            elif any(word in content_lower for word in ["solve", "calculate", "compute"]):
                metadata["activity_type"] = "problem_solving"
            elif any(word in content_lower for word in ["build", "construct", "make"]):
                metadata["activity_type"] = "construction"
            else:
                metadata["activity_type"] = "general"
        
        return metadata
    



class MultimediaEnhancer:
    """Enhances responses with multimedia suggestions."""
    
    @staticmethod
    def suggest_images(topic: str, count: int = 3) -> List[Dict[str, str]]:
        """
        Suggest relevant images for a topic.
        
        Args:
            topic: The topic to find images for
            count: Number of image suggestions
            
        Returns:
            List of image suggestions
        """
        # This would integrate with image search APIs
        suggestions = []
        
        # Generate search queries
        queries = [
            f"{topic} diagram",
            f"{topic} illustration",
            f"{topic} infographic",
            f"{topic} visual explanation",
            f"{topic} chart"
        ]
        
        for i, query in enumerate(queries[:count]):
            suggestions.append({
                "search_query": query,
                "description": f"Visual representation of {topic}",
                "source": "unsplash",  # or other image API
                "url": f"https://source.unsplash.com/800x600/?{query.replace(' ', ',')}"
            })
        
        return suggestions
    
    @staticmethod
    def suggest_videos(topic: str, count: int = 3) -> List[Dict[str, str]]:
        """
        Suggest relevant YouTube videos for a topic.
        
        Args:
            topic: The topic to find videos for
            count: Number of video suggestions
            
        Returns:
            List of video suggestions
        """
        from urllib.parse import quote
        
        suggestions = []
        video_types = [
            f"{topic} explained",
            f"{topic} tutorial",
            f"learn {topic}",
            f"{topic} crash course",
            f"{topic} for beginners"
        ]
        
        for i, query in enumerate(video_types[:count]):
            suggestions.append({
                "search_query": query,
                "platform": "youtube",
                "search_url": f"https://www.youtube.com/results?search_query={quote(query)}",
                "description": f"Video tutorial on {topic}"
            })
        
        return suggestions
    
    @staticmethod
    def suggest_wolfram_queries(topic: str, count: int = 3) -> List[Dict[str, str]]:
        """
        Suggest Wolfram Alpha queries for a topic.
        
        Args:
            topic: The topic to create queries for
            count: Number of query suggestions
            
        Returns:
            List of Wolfram query suggestions
        """
        from urllib.parse import quote
        
        suggestions = []
        query_types = [
            topic,
            f"plot {topic}",
            f"{topic} formula",
            f"{topic} examples",
            f"solve {topic}"
        ]
        
        for i, query in enumerate(query_types[:count]):
            suggestions.append({
                "query": query,
                "url": f"https://www.wolframalpha.com/input?i={quote(query)}",
                "description": f"Computational exploration of {topic}",
                "type": "computation"
            })
        
        return suggestions


def format_response_with_multimedia(text: str, elements: List[MultimediaElement]) -> Dict[str, Any]:
    """
    Format a response with multimedia elements for frontend consumption.
    
    Args:
        text: The cleaned text content
        elements: List of multimedia elements
        
    Returns:
        Formatted response dictionary
    """
    return {
        "text": text,
        "multimedia": [element.to_dict() for element in elements],
        "has_multimedia": len(elements) > 0,
        "media_types": list(set(element.type.value for element in elements))
    }
