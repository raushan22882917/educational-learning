"""
YouTube content extraction and processing service.
"""

import os
import re
import json
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse, parse_qs
import requests
from .gemini import get_gemini_service
from .cache import get_cache_service


class YouTubeServiceError(Exception):
    """Custom exception for YouTube service errors."""
    pass


class YouTubeService:
    """Service for extracting and processing YouTube content."""
    
    def __init__(self):
        """Initialize YouTube service."""
        self.api_key = os.getenv("YOUTUBE_API_KEY")
        self.gemini_service = get_gemini_service()
        self.cache_service = get_cache_service()
        
    def extract_video_id(self, url: str) -> Optional[str]:
        """
        Extract video ID from YouTube URL.
        
        Args:
            url: YouTube URL
            
        Returns:
            Video ID or None if invalid
        """
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
            r'youtube\.com\/embed\/([^&\n?#]+)',
            r'youtube\.com\/v\/([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
    
    def get_video_metadata(self, video_id: str) -> Dict[str, Any]:
        """
        Get video metadata from YouTube API.
        
        Args:
            video_id: YouTube video ID
            
        Returns:
            Video metadata dictionary
        """
        if not self.api_key:
            # Return basic metadata without API
            return {
                "id": video_id,
                "title": "YouTube Video",
                "description": "",
                "duration": "Unknown",
                "thumbnail": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
                "channel": "Unknown"
            }
        
        try:
            url = f"https://www.googleapis.com/youtube/v3/videos"
            params = {
                "part": "snippet,contentDetails,statistics",
                "id": video_id,
                "key": self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if not data.get("items"):
                raise YouTubeServiceError("Video not found")
            
            item = data["items"][0]
            snippet = item["snippet"]
            content_details = item["contentDetails"]
            
            return {
                "id": video_id,
                "title": snippet["title"],
                "description": snippet["description"],
                "duration": content_details["duration"],
                "thumbnail": snippet["thumbnails"]["high"]["url"],
                "channel": snippet["channelTitle"],
                "published_at": snippet["publishedAt"],
                "tags": snippet.get("tags", [])
            }
            
        except Exception as e:
            print(f"Error fetching video metadata: {e}")
            return {
                "id": video_id,
                "title": "YouTube Video",
                "description": "",
                "duration": "Unknown",
                "thumbnail": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
                "channel": "Unknown"
            }
    
    def get_video_transcript(self, video_id: str) -> Optional[str]:
        """
        Get video transcript/captions.
        
        Args:
            video_id: YouTube video ID
            
        Returns:
            Transcript text or None
        """
        try:
            # Try using youtube-transcript-api if available
            from youtube_transcript_api import YouTubeTranscriptApi
            
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            transcript = " ".join([item["text"] for item in transcript_list])
            return transcript
            
        except ImportError:
            print("youtube-transcript-api not installed")
            return None
        except Exception as e:
            print(f"Error fetching transcript: {e}")
            return None
    
    def process_video_content(
        self, 
        video_url: str,
        include_transcript: bool = True
    ) -> Dict[str, Any]:
        """
        Process YouTube video and extract all content.
        
        Args:
            video_url: YouTube video URL
            include_transcript: Whether to fetch transcript
            
        Returns:
            Processed video content
        """
        video_id = self.extract_video_id(video_url)
        if not video_id:
            raise YouTubeServiceError("Invalid YouTube URL")
        
        # Get metadata
        metadata = self.get_video_metadata(video_id)
        
        # Get transcript if requested
        transcript = None
        if include_transcript:
            transcript = self.get_video_transcript(video_id)
        
        return {
            "video_id": video_id,
            "url": video_url,
            "metadata": metadata,
            "transcript": transcript,
            "has_transcript": transcript is not None
        }
    
    def analyze_notes_for_wolfram(
        self,
        notes_text: str,
        video_metadata: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """
        Use Gemini to analyze notes and identify concepts for Wolfram visualization.
        
        Args:
            notes_text: Generated notes text
            video_metadata: Video metadata
            
        Returns:
            List of concepts with queries and descriptions
        """
        # If notes are very short (no transcript), use title and description
        content_source = notes_text if len(notes_text) > 500 else f"{video_metadata['title']}\n\n{video_metadata.get('description', '')[:1000]}"
        
        # First, check for obvious mathematical keywords
        math_keywords = ['calculus', 'derivative', 'integral', 'limit', 'function', 'equation', 
                        'algebra', 'trigonometry', 'sin', 'cos', 'tan', 'polynomial', 'exponential',
                        'logarithm', 'matrix', 'vector', 'geometry', 'theorem', 'proof']
        
        content_lower = content_source.lower()
        has_math_content = any(keyword in content_lower for keyword in math_keywords)
        
        prompt = f"""Analyze this educational content and identify mathematical, scientific, or computational concepts that would benefit from Wolfram Alpha visualization.

Video: {video_metadata['title']}

Content:
{content_source[:4000]}

CRITICAL INSTRUCTIONS:
1. Look for ANY mathematical expressions, formulas, or concepts in the text
2. Extract EXACT formulas and expressions you see (like "x^2", "sin(x)", "lim (x→2)", etc.)
3. For calculus content, ALWAYS include: derivatives, integrals, limits, and function plots
4. Return 4-6 visualizations if this is math/science content

For each concept, provide:
- query: Precise Wolfram Alpha query
- description: What this visualizes
- type: graph|formula|calculation|diagram|structure

Return as JSON array:
[
  {{
    "query": "exact Wolfram query",
    "description": "what this visualizes",
    "type": "graph|formula|calculation|diagram|structure"
  }}
]

EXAMPLES OF GOOD QUERIES:
- "plot sin(x) from -2pi to 2pi"
- "derivative of x^2"
- "limit of (x^2-4)/(x-2) as x approaches 2"
- "solve x^2 + 5x + 6 = 0"
- "integral of x^2 from 0 to 5"
- "plot x^2 - 4x + 3"
- "derivative of e^x"
- "limit of sin(x)/x as x approaches 0"

IMPORTANT: If this is calculus/math content, you MUST return at least 4 queries!
"""
        
        # First, try to extract mathematical expressions directly from text using regex
        extracted_concepts = []
        
        # Pattern matching for common mathematical expressions
        import re
        
        # Look for derivatives
        derivative_patterns = [
            r'derivative of ([^\s,\.]+)',
            r'd/dx\s*\(([^\)]+)\)',
            r"d\(([^\)]+)\)/dx"
        ]
        for pattern in derivative_patterns:
            matches = re.findall(pattern, content_source, re.IGNORECASE)
            for match in matches[:2]:  # Limit to 2 per pattern
                extracted_concepts.append({
                    "query": f"derivative of {match}",
                    "description": f"Derivative of {match}",
                    "type": "calculation"
                })
        
        # Look for integrals
        integral_patterns = [
            r'integral of ([^\s,\.]+)',
            r'∫\s*([^\s,\.]+)',
        ]
        for pattern in integral_patterns:
            matches = re.findall(pattern, content_source, re.IGNORECASE)
            for match in matches[:2]:
                extracted_concepts.append({
                    "query": f"integral of {match}",
                    "description": f"Integral of {match}",
                    "type": "calculation"
                })
        
        # Look for limits
        limit_patterns = [
            r'lim[it]*\s*\(([^\)]+)\)',
            r'limit of ([^\s,\.]+)',
        ]
        for pattern in limit_patterns:
            matches = re.findall(pattern, content_source, re.IGNORECASE)
            for match in matches[:2]:
                extracted_concepts.append({
                    "query": f"limit of {match}",
                    "description": f"Limit calculation",
                    "type": "calculation"
                })
        
        # Look for functions to plot
        function_patterns = [
            r'(sin\([^\)]+\))',
            r'(cos\([^\)]+\))',
            r'(tan\([^\)]+\))',
            r'(x\^[0-9]+)',
            r'(e\^[^\s,\.]+)',
        ]
        for pattern in function_patterns:
            matches = re.findall(pattern, content_source, re.IGNORECASE)
            for match in matches[:1]:  # Limit to 1 per pattern
                extracted_concepts.append({
                    "query": f"plot {match}",
                    "description": f"Graph of {match}",
                    "type": "graph"
                })
        
        print(f"📊 Extracted {len(extracted_concepts)} concepts via pattern matching")
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.4
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
            
            concepts = json.loads(cleaned)
            
            # Merge extracted concepts with Gemini concepts
            if extracted_concepts:
                concepts = extracted_concepts + (concepts if concepts else [])
            
            # If no concepts found OR too few, add defaults based on title/content
            if not concepts or len(concepts) < 3:
                title_lower = video_metadata['title'].lower()
                content_lower = content_source.lower()
                default_concepts = []
                
                print(f"⚠️ Gemini returned {len(concepts) if concepts else 0} concepts, adding fallbacks...")
                
                # Calculus topics - VERY AGGRESSIVE
                if any(word in title_lower or word in content_lower for word in ['calculus', 'derivative', 'integral', 'limit']):
                    default_concepts.extend([
                        {
                            "query": "derivative of x^2",
                            "description": "Power rule for derivatives",
                            "type": "calculation"
                        },
                        {
                            "query": "integral of x^2 from 0 to 1",
                            "description": "Definite integral example",
                            "type": "calculation"
                        },
                        {
                            "query": "plot sin(x) from -2pi to 2pi",
                            "description": "Sine function graph",
                            "type": "graph"
                        },
                        {
                            "query": "limit of (x^2-4)/(x-2) as x approaches 2",
                            "description": "Limit calculation example",
                            "type": "calculation"
                        },
                        {
                            "query": "derivative of sin(x)",
                            "description": "Derivative of sine function",
                            "type": "calculation"
                        },
                        {
                            "query": "plot x^2",
                            "description": "Parabola visualization",
                            "type": "graph"
                        }
                    ])
                
                # Trigonometry
                if any(word in title_lower or word in content_lower for word in ['sin', 'cos', 'tan', 'trigonometry']):
                    default_concepts.extend([
                        {
                            "query": "plot sin(x), cos(x) from -2pi to 2pi",
                            "description": "Sine and cosine functions",
                            "type": "graph"
                        },
                        {
                            "query": "derivative of sin(x)",
                            "description": "Derivative of sine",
                            "type": "calculation"
                        }
                    ])
                
                # Algebra topics
                if any(word in title_lower or word in content_lower for word in ['algebra', 'equation', 'polynomial', 'quadratic']):
                    default_concepts.extend([
                        {
                            "query": "solve x^2 + 5x + 6 = 0",
                            "description": "Quadratic equation solution",
                            "type": "calculation"
                        },
                        {
                            "query": "plot x^2 - 4x + 3",
                            "description": "Parabola graph",
                            "type": "graph"
                        },
                        {
                            "query": "factor x^2 + 5x + 6",
                            "description": "Factoring quadratic",
                            "type": "calculation"
                        }
                    ])
                
                # Exponential and logarithms
                if any(word in title_lower or word in content_lower for word in ['exponential', 'logarithm', 'log', 'e^x']):
                    default_concepts.extend([
                        {
                            "query": "plot e^x",
                            "description": "Exponential function",
                            "type": "graph"
                        },
                        {
                            "query": "derivative of e^x",
                            "description": "Derivative of exponential",
                            "type": "calculation"
                        }
                    ])
                
                # Physics topics
                if 'physics' in title_lower or 'physics' in content_lower:
                    default_concepts.extend([
                        {
                            "query": "F = ma",
                            "description": "Newton's second law",
                            "type": "formula"
                        },
                        {
                            "query": "projectile motion 45 degrees 20 m/s",
                            "description": "Projectile trajectory",
                            "type": "graph"
                        }
                    ])
                
                # Chemistry topics
                if 'chemistry' in title_lower or 'chemistry' in content_lower:
                    default_concepts.extend([
                        {
                            "query": "structure of water molecule",
                            "description": "H2O molecular structure",
                            "type": "structure"
                        },
                        {
                            "query": "structure of benzene",
                            "description": "Benzene ring structure",
                            "type": "structure"
                        }
                    ])
                
                # Combine Gemini results with defaults
                if default_concepts:
                    # Remove duplicates
                    all_concepts = (concepts if concepts else []) + default_concepts
                    seen_queries = set()
                    unique_concepts = []
                    for concept in all_concepts:
                        query = concept.get('query', '').lower()
                        if query and query not in seen_queries:
                            seen_queries.add(query)
                            unique_concepts.append(concept)
                    
                    print(f"✓ Total concepts after fallback: {len(unique_concepts)}")
                    return unique_concepts[:6]  # Return up to 6
            
            return concepts if isinstance(concepts, list) else []
            
        except Exception as e:
            print(f"Error analyzing notes for Wolfram: {e}")
            return []
    
    def extract_formulas_from_notes(
        self,
        notes_text: str,
        video_metadata: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """
        Extract all formulas and equations from notes using Gemini.
        
        Args:
            notes_text: Generated notes text
            video_metadata: Video metadata
            
        Returns:
            List of formulas with names, formulas, and descriptions
        """
        prompt = f"""Extract ALL mathematical formulas, equations, and expressions from this content.

Video: {video_metadata['title']}

Content:
{notes_text[:5000]}

For each formula/equation you find, provide:
1. name: A descriptive name (e.g., "Power Rule", "Pythagorean Theorem", "Quadratic Formula")
2. formula: The actual formula/equation (use plain text math notation)
3. description: Brief explanation of what it represents or when to use it
4. category: Type of formula (Calculus, Algebra, Trigonometry, Physics, Chemistry, etc.)

Return as JSON array with ALL formulas found:
[
  {{
    "name": "Formula name",
    "formula": "actual formula",
    "description": "what it means",
    "category": "category"
  }}
]

IMPORTANT:
- Extract EVERY formula, equation, or mathematical expression you see
- Include derivatives, integrals, limits, functions, equations, theorems, laws, etc.
- Use clear notation: x^2 for powers, sqrt(x) for square root, integral, derivative, etc.
- If you see "d/dx(x^2) = 2x", extract it as a formula
- Include both the formula and what it equals if shown
- Return at least 5-10 formulas if this is math/science content

Examples:
{{
  "name": "Power Rule for Derivatives",
  "formula": "d/dx(x^n) = n*x^(n-1)",
  "description": "Used to find the derivative of polynomial terms",
  "category": "Calculus"
}}
{{
  "name": "Pythagorean Theorem",
  "formula": "a^2 + b^2 = c^2",
  "description": "Relates the sides of a right triangle",
  "category": "Geometry"
}}
"""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.3
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
            
            formulas = json.loads(cleaned)
            
            if not formulas or len(formulas) == 0:
                print("⚠️ No formulas extracted by Gemini")
                return []
            
            print(f"✓ Extracted {len(formulas)} formulas")
            return formulas if isinstance(formulas, list) else []
            
        except Exception as e:
            print(f"Error extracting formulas: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def generate_notes(
        self, 
        video_content: Dict[str, Any],
        style: str = "detailed",
        include_wolfram: bool = True
    ) -> Dict[str, Any]:
        """
        Generate notes from video content with Wolfram visualizations.
        
        Args:
            video_content: Processed video content
            style: Note style (detailed, bullet, outline)
            include_wolfram: Whether to include Wolfram visualizations
            
        Returns:
            Dictionary with notes text and wolfram data
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        prompt = f"""Generate comprehensive learning notes from this YouTube video.

Video Title: {metadata['title']}
Channel: {metadata['channel']}
Description: {metadata['description'][:500]}

"""
        
        if transcript:
            prompt += f"Transcript:\n{transcript[:4000]}\n\n"
        
        prompt += f"""Create {style} notes that include:
1. Main topics and key concepts
2. Important definitions and explanations
3. Examples and demonstrations mentioned
4. Key takeaways and conclusions
5. Mathematical formulas or equations (if any)

Format the notes in a clear, organized manner suitable for studying.
Use markdown formatting for better readability."""
        
        try:
            notes_text = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.6,
                cache_key_prefix="youtube_notes"
            ).strip()
            
            wolfram_data = []
            
            # Analyze notes and visualize concepts with Wolfram if requested
            if include_wolfram:
                try:
                    from .wolfram import get_wolfram_service
                    wolfram_service = get_wolfram_service()
                    
                    # Use Gemini to analyze notes and identify concepts for visualization
                    concepts = self.analyze_notes_for_wolfram(notes_text, metadata)
                    
                    print(f"✓ Gemini identified {len(concepts)} concepts for Wolfram visualization")
                    print(f"✓ Concepts: {[c.get('query', '') for c in concepts]}")
                    
                    for concept_info in concepts[:3]:  # Limit to 3
                        query = concept_info.get("query", "")
                        description = concept_info.get("description", "")
                        viz_type = concept_info.get("type", "")
                        
                        if not query:
                            continue
                            
                        try:
                            print(f"Querying Wolfram for: {query}")
                            result = wolfram_service.query(query)
                            
                            if result and (result.get("result") or result.get("images")):
                                wolfram_data.append({
                                    "query": query,
                                    "description": description,
                                    "type": viz_type,
                                    "result": result.get("result"),
                                    "images": result.get("images", [])[:2],  # Max 2 images per concept
                                    "step_by_step": result.get("step_by_step", [])
                                })
                                print(f"✓ Successfully visualized: {query}")
                            else:
                                print(f"✗ No visualization data for: {query}")
                                
                        except Exception as e:
                            print(f"Error querying Wolfram for '{query}': {e}")
                            
                except Exception as e:
                    print(f"Error with Wolfram integration: {e}")
            
            return {
                "text": notes_text,
                "wolfram_visualizations": wolfram_data
            }
            
        except Exception as e:
            print(f"Error generating notes: {e}")
            return {
                "text": "Unable to generate notes at this time.",
                "wolfram_visualizations": []
            }
    
    def generate_summary(
        self, 
        video_content: Dict[str, Any],
        length: str = "medium"
    ) -> str:
        """
        Generate summary of video content.
        
        Args:
            video_content: Processed video content
            length: Summary length (short, medium, long)
            
        Returns:
            Generated summary
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        length_instructions = {
            "short": "in 2-3 sentences",
            "medium": "in 1-2 paragraphs",
            "long": "in 3-4 detailed paragraphs"
        }
        
        prompt = f"""Summarize this YouTube video {length_instructions.get(length, 'concisely')}.

Video Title: {metadata['title']}
Channel: {metadata['channel']}
Description: {metadata['description'][:500]}

"""
        
        if transcript:
            prompt += f"Transcript:\n{transcript[:4000]}\n\n"
        
        prompt += "Provide a clear, informative summary that captures the main points and key insights."
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.5,
                cache_key_prefix="youtube_summary"
            )
            return response.strip()
        except Exception as e:
            print(f"Error generating summary: {e}")
            return "Unable to generate summary at this time."
    
    def generate_flashcards(
        self, 
        video_content: Dict[str, Any],
        count: int = 10
    ) -> List[Dict[str, str]]:
        """
        Generate flashcards from video content.
        
        Args:
            video_content: Processed video content
            count: Number of flashcards to generate
            
        Returns:
            List of flashcard dictionaries
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        prompt = f"""Generate {count} flashcards from this YouTube video for studying.

Video Title: {metadata['title']}
Channel: {metadata['channel']}
Description: {metadata['description'][:500]}

"""
        
        if transcript:
            prompt += f"Transcript:\n{transcript[:4000]}\n\n"
        
        prompt += f"""Create {count} flashcards in JSON format. Each flashcard should have:
- front: The question or concept
- back: The answer or explanation

Return ONLY a JSON array of flashcards, no other text.
Example format:
[
  {{"front": "What is...", "back": "It is..."}},
  {{"front": "Define...", "back": "..."}}
]"""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.6,
                cache_key_prefix="youtube_flashcards"
            )
            
            # Parse JSON response
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            flashcards = json.loads(cleaned)
            return flashcards
            
        except Exception as e:
            print(f"Error generating flashcards: {e}")
            return []
    
    def generate_key_points(
        self, 
        video_content: Dict[str, Any],
        count: int = 5
    ) -> List[str]:
        """
        Extract key points from video.
        
        Args:
            video_content: Processed video content
            count: Number of key points
            
        Returns:
            List of key points
        """
        metadata = video_content["metadata"]
        transcript = video_content.get("transcript", "")
        
        prompt = f"""Extract the {count} most important key points from this YouTube video.

Video Title: {metadata['title']}
Channel: {metadata['channel']}
Description: {metadata['description'][:500]}

"""
        
        if transcript:
            prompt += f"Transcript:\n{transcript[:4000]}\n\n"
        
        prompt += f"""List the {count} most important key points or takeaways.
Return as a JSON array of strings.
Example: ["Point 1", "Point 2", "Point 3"]"""
        
        try:
            response = self.gemini_service._make_request_with_retry(
                prompt, 
                temperature=0.5,
                cache_key_prefix="youtube_keypoints"
            )
            
            # Parse JSON response
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            key_points = json.loads(cleaned)
            return key_points
            
        except Exception as e:
            print(f"Error generating key points: {e}")
            return []
    
    def generate_quiz(
        self, 
        video_content: Dict[str, Any],
        count: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate quiz questions from video content.
        
        Args:
            video_content: Processed video content
            count: Number of questions
            
        Returns:
            List of quiz questions
        """
        metadata = video_content["metadata"]
        
        # Use existing quiz generation with video context
        topic = f"{metadata['title']} - {metadata['description'][:200]}"
        
        try:
            questions = self.gemini_service.generate_quiz_questions(
                topic=topic,
                difficulty="intermediate",
                count=count
            )
            return questions
        except Exception as e:
            print(f"Error generating quiz: {e}")
            return []


# Singleton instance
_youtube_service_instance: Optional[YouTubeService] = None


def get_youtube_service() -> YouTubeService:
    """Get or create singleton YouTube service instance."""
    global _youtube_service_instance
    if _youtube_service_instance is None:
        _youtube_service_instance = YouTubeService()
    return _youtube_service_instance
