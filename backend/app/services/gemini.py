"""
Gemini AI service for intelligent tutoring and content generation.
"""

import os
import json
import time
from typing import List, Dict, Any, Optional
from google import genai
from .prompts import PromptTemplates
from .cache import get_cache_service, CacheService
from ..utils.circuit_breaker import circuit_breaker
from ..exceptions import AIServiceError


class GeminiServiceError(Exception):
    """Custom exception for Gemini service errors."""
    pass


class GeminiService:
    """
    Service class for interacting with Google Gemini AI.
    Provides methods for tutoring, recommendations, quiz generation, and explanations.
    """
    
    def __init__(
        self, 
        api_key: Optional[str] = None, 
        model_name: str = "gemini-2.0-flash-exp",
        cache_service: Optional[CacheService] = None
    ):
        """
        Initialize the Gemini AI service.
        
        Args:
            api_key: Gemini API key (defaults to environment variable)
            model_name: Name of the Gemini model to use
            cache_service: Optional CacheService instance for caching responses
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise GeminiServiceError("GEMINI_API_KEY not found in environment variables")
        
        # Configure the Gemini API with new client
        os.environ["GOOGLE_API_KEY"] = self.api_key
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name
        
        # Configuration for generation
        self.generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        # Retry configuration
        self.max_retries = 3
        self.retry_delay = 1  # seconds
        
        # Initialize cache service
        self.cache_service = cache_service or get_cache_service()
        self.enable_caching = True  # Can be disabled for testing
        
        # Fallback responses for when AI service is unavailable
        self.fallback_responses = {
            "tutor": "I'm having trouble connecting to the AI service right now. Please try again in a moment. In the meantime, feel free to explore other topics or check your progress dashboard.",
            "explanation": "I'm currently unable to generate an explanation. Please try again shortly, or try rephrasing your question.",
            "quiz": [
                {
                    "question": "This is a sample question. The AI service is temporarily unavailable.",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": 0,
                    "explanation": "This is a fallback question. Please try generating the quiz again."
                }
            ],
            "recommendations": [],  # Empty list for recommendations
            "summary": "Session completed. Unable to generate detailed summary at this time."
        }
    
    @circuit_breaker(failure_threshold=5, recovery_timeout=60, expected_exception=Exception)
    def _make_request_with_retry(
        self, 
        prompt: str, 
        temperature: float = None,
        cache_key_prefix: Optional[str] = None
    ) -> str:
        """
        Make a request to Gemini API with retry logic, caching, and circuit breaker.
        
        Args:
            prompt: The prompt to send to the API
            temperature: Optional temperature override
            cache_key_prefix: Optional prefix for cache key (enables caching)
            
        Returns:
            Generated text response
            
        Raises:
            GeminiServiceError: If all retry attempts fail
            CircuitBreakerOpenError: If circuit breaker is open
        """
        # Try to get from cache if caching is enabled
        if self.enable_caching and cache_key_prefix:
            prompt_hash = self.cache_service.generate_prompt_hash(prompt)
            cached_response = self.cache_service.get_ai_response(cache_key_prefix, prompt_hash)
            if cached_response:
                return cached_response
        
        config = self.generation_config.copy()
        if temperature is not None:
            config["temperature"] = temperature
        
        last_error = None
        for attempt in range(self.max_retries):
            try:
                # Use new API - correct method
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=config
                )
                
                # Check if response has text
                if not response or not hasattr(response, 'text') or not response.text:
                    raise GeminiServiceError("Empty response from Gemini API")
                
                response_text = response.text
                
                # Cache the response if caching is enabled
                if self.enable_caching and cache_key_prefix:
                    prompt_hash = self.cache_service.generate_prompt_hash(prompt)
                    self.cache_service.set_ai_response(cache_key_prefix, prompt_hash, response_text)
                
                return response_text
                
            except Exception as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    # Exponential backoff
                    wait_time = self.retry_delay * (2 ** attempt)
                    time.sleep(wait_time)
                    continue
                    
        # All retries failed
        raise GeminiServiceError(f"Failed after {self.max_retries} attempts: {str(last_error)}")
    
    def generate_tutor_response(
        self, 
        message: str, 
        context: List[Dict[str, str]], 
        topic: Optional[str] = None
    ) -> str:
        """
        Generate a tutor response with conversation context.
        
        Args:
            message: The user's current message
            context: List of previous messages with 'role' and 'content' keys
            topic: Optional topic for the learning session
            
        Returns:
            AI-generated tutor response
            
        Raises:
            AIServiceError: If the API request fails after retries
        """
        try:
            # Generate prompt using the prompt template
            prompt = PromptTemplates.tutor_prompt(message, context, topic)
            
            # Make request with retry logic and circuit breaker
            response = self._make_request_with_retry(prompt, temperature=0.7)
            
            return response.strip()
            
        except Exception as e:
            # Return fallback response instead of raising
            print(f"Gemini service error (returning fallback): {str(e)}")
            return self.fallback_responses["tutor"]
    
    def generate_recommendations(self, user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate personalized topic recommendations based on user profile.
        
        Args:
            user_profile: Dictionary containing:
                - topics_completed: List of completed topics
                - interests: List of user interests
                - difficulty_level: Current difficulty level
                - recent_topics: Recently studied topics
                
        Returns:
            List of recommendation dictionaries with title, description, difficulty, etc.
            
        Raises:
            AIServiceError: If the API request fails or response parsing fails
        """
        try:
            # Generate prompt using the prompt template
            prompt = PromptTemplates.recommendation_prompt(user_profile)
            
            # Make request with retry logic (lower temperature for more consistent JSON)
            response = self._make_request_with_retry(prompt, temperature=0.5)
            
            # Parse JSON response
            try:
                # Clean response - remove markdown code blocks if present
                cleaned_response = response.strip()
                if cleaned_response.startswith("```json"):
                    cleaned_response = cleaned_response[7:]
                if cleaned_response.startswith("```"):
                    cleaned_response = cleaned_response[3:]
                if cleaned_response.endswith("```"):
                    cleaned_response = cleaned_response[:-3]
                cleaned_response = cleaned_response.strip()
                
                recommendations = json.loads(cleaned_response)
                
                # Validate structure
                if not isinstance(recommendations, list):
                    raise ValueError("Response is not a list")
                
                return recommendations
                
            except json.JSONDecodeError as e:
                print(f"Failed to parse recommendations JSON: {str(e)}")
                return self.fallback_responses["recommendations"]
                
        except Exception as e:
            # Return fallback response instead of raising
            print(f"Gemini service error (returning fallback): {str(e)}")
            return self.fallback_responses["recommendations"]
    
    def generate_quiz_questions(
        self, 
        topic: str, 
        difficulty: str = "intermediate", 
        count: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate quiz questions for a given topic.
        
        Args:
            topic: The topic for quiz questions
            difficulty: Difficulty level (beginner, intermediate, advanced)
            count: Number of questions to generate (default: 5)
            
        Returns:
            List of question dictionaries with question, options, correct_answer, explanation
            
        Raises:
            AIServiceError: If the API request fails or response parsing fails
        """
        try:
            # Validate difficulty
            valid_difficulties = ["beginner", "intermediate", "advanced"]
            if difficulty not in valid_difficulties:
                difficulty = "intermediate"
            
            # Validate count
            if count < 1 or count > 10:
                count = 5
            
            # Generate prompt using the prompt template
            prompt = PromptTemplates.quiz_generation_prompt(topic, difficulty, count)
            
            # Make request with retry logic and caching (quiz questions are cacheable)
            response = self._make_request_with_retry(
                prompt, 
                temperature=0.4,
                cache_key_prefix="quiz"
            )
            
            # Parse JSON response
            try:
                # Clean response - remove markdown code blocks if present
                cleaned_response = response.strip()
                if cleaned_response.startswith("```json"):
                    cleaned_response = cleaned_response[7:]
                if cleaned_response.startswith("```"):
                    cleaned_response = cleaned_response[3:]
                if cleaned_response.endswith("```"):
                    cleaned_response = cleaned_response[:-3]
                cleaned_response = cleaned_response.strip()
                
                # Remove trailing commas before closing brackets/braces (common Gemini issue)
                import re
                cleaned_response = re.sub(r',(\s*[}\]])', r'\1', cleaned_response)
                
                # Try to parse with strict=False to handle control characters
                try:
                    questions = json.loads(cleaned_response, strict=False)
                except json.JSONDecodeError:
                    # If that fails, try escaping control characters manually
                    # Replace unescaped newlines and tabs within strings
                    cleaned_response = re.sub(r'(?<!\\)(\n|\r|\t)', lambda m: '\\n' if m.group() == '\n' else ('\\r' if m.group() == '\r' else '\\t'), cleaned_response)
                    questions = json.loads(cleaned_response, strict=False)
                
                # Validate structure
                if not isinstance(questions, list):
                    raise ValueError("Response is not a list")
                
                # Validate each question has required fields
                for q in questions:
                    required_fields = ["question", "options", "correct_answer", "explanation"]
                    if not all(field in q for field in required_fields):
                        raise ValueError(f"Question missing required fields: {q}")
                
                return questions
                
            except json.JSONDecodeError as e:
                print(f"Failed to parse quiz questions JSON: {str(e)}")
                print(f"Raw response was: {response[:500]}")  # Print first 500 chars
                raise GeminiServiceError(f"Failed to parse quiz JSON: {str(e)}")
                
        except GeminiServiceError:
            raise  # Re-raise GeminiServiceError
        except Exception as e:
            print(f"Gemini service error in generate_quiz_questions: {str(e)}")
            import traceback
            traceback.print_exc()
            return self.fallback_responses["quiz"]
    
    def generate_explanation(
        self, 
        concept: str, 
        style: str = "comprehensive"
    ) -> str:
        """
        Generate an explanation for a concept with multiple format options.
        
        Args:
            concept: The concept to explain
            style: Explanation style - one of:
                - comprehensive: Thorough explanation with examples
                - analogy: Explanation using analogies
                - example: Explanation through concrete examples
                - steps: Step-by-step breakdown
                - simple: Simple, beginner-friendly explanation
                
        Returns:
            AI-generated explanation
            
        Raises:
            AIServiceError: If the API request fails
        """
        try:
            # Validate style
            valid_styles = ["comprehensive", "analogy", "example", "steps", "simple"]
            if style not in valid_styles:
                style = "comprehensive"
            
            # Generate prompt using the prompt template
            prompt = PromptTemplates.explanation_prompt(concept, style)
            
            # Make request with retry logic and caching (explanations are cacheable)
            response = self._make_request_with_retry(
                prompt, 
                temperature=0.7,
                cache_key_prefix="explanation"
            )
            
            return response.strip()
            
        except Exception as e:
            # Return fallback response instead of raising
            print(f"Gemini service error (returning fallback): {str(e)}")
            return self.fallback_responses["explanation"]
    
    def generate_alternative_explanation(
        self, 
        concept: str, 
        previous_explanation: str,
        feedback: Optional[str] = None
    ) -> str:
        """
        Generate an alternative explanation when the first one wasn't clear.
        
        Args:
            concept: The concept to explain
            previous_explanation: The previous explanation that wasn't clear
            feedback: Optional feedback from the student
            
        Returns:
            AI-generated alternative explanation
            
        Raises:
            AIServiceError: If the API request fails
        """
        try:
            # Generate prompt using the prompt template
            prompt = PromptTemplates.alternative_explanation_prompt(
                concept, 
                previous_explanation, 
                feedback
            )
            
            # Make request with retry logic (higher temperature for more creative alternatives)
            response = self._make_request_with_retry(prompt, temperature=0.8)
            
            return response.strip()
            
        except Exception as e:
            # Return fallback response instead of raising
            print(f"Gemini service error (returning fallback): {str(e)}")
            return self.fallback_responses["explanation"]
    
    def generate_session_summary(
        self, 
        messages: List[Dict[str, str]], 
        topic: str,
        duration_minutes: int
    ) -> str:
        """
        Generate a summary of a learning session.
        
        Args:
            messages: All messages from the session with 'role' and 'content' keys
            topic: The session topic
            duration_minutes: Session duration in minutes
            
        Returns:
            AI-generated session summary
            
        Raises:
            AIServiceError: If the API request fails
        """
        try:
            # Generate prompt using the prompt template
            prompt = PromptTemplates.session_summary_prompt(messages, topic, duration_minutes)
            
            # Make request with retry logic
            response = self._make_request_with_retry(prompt, temperature=0.6)
            
            return response.strip()
            
        except Exception as e:
            # Return fallback response instead of raising
            print(f"Gemini service error (returning fallback): {str(e)}")
            return self.fallback_responses["summary"]


    def generate_educational_image(
        self,
        prompt: str,
        save_path: Optional[str] = None
    ) -> Optional[str]:
        """
        Generate an educational diagram or visualization using Gemini.
        
        Args:
            prompt: Description of the image to generate
            save_path: Optional path to save the image
            
        Returns:
            Path to the saved image or base64 encoded image data
        """
        try:
            from PIL import Image
            import base64
            from io import BytesIO
            
            # Use image generation model
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",  # Use flash model for now
                contents=[f"Create an educational diagram or visualization: {prompt}"]
            )
            
            # Check for inline image data
            for part in response.parts:
                if part.inline_data is not None:
                    # Convert to PIL Image
                    image = part.as_image()
                    
                    # Save if path provided
                    if save_path:
                        image.save(save_path)
                        return save_path
                    else:
                        # Return base64 encoded
                        buffered = BytesIO()
                        image.save(buffered, format="PNG")
                        img_str = base64.b64encode(buffered.getvalue()).decode()
                        return f"data:image/png;base64,{img_str}"
            
            # If no image generated, return None
            return None
            
        except Exception as e:
            print(f"Image generation error: {e}")
            return None
    
    def generate_image(self, prompt: str, save_path: Optional[str] = None) -> Optional[str]:
        """
        Generate an image using Gemini's Imagen model.
        
        Args:
            prompt: Description of the image to generate
            save_path: Optional path to save the image file
            
        Returns:
            Image URL or base64 data URI, or None if generation fails
        """
        try:
            # Use Imagen 3 for image generation
            response = self.client.models.generate_images(
                model='imagen-3.0-generate-001',
                prompt=prompt,
                config={
                    'number_of_images': 1,
                    'safety_filter_level': 'block_some',
                    'person_generation': 'allow_adult',
                }
            )
            
            if response and hasattr(response, 'generated_images') and response.generated_images:
                image = response.generated_images[0]
                
                # If image has a URL, return it
                if hasattr(image, 'image') and hasattr(image.image, 'url'):
                    return image.image.url
                
                # If image has bytes, convert to base64
                if hasattr(image, 'image') and hasattr(image.image, 'image_bytes'):
                    import base64
                    img_bytes = image.image.image_bytes
                    img_b64 = base64.b64encode(img_bytes).decode('utf-8')
                    return f"data:image/png;base64,{img_b64}"
            
            return None
            
        except Exception as e:
            print(f"Image generation error: {str(e)}")
            import traceback
            traceback.print_exc()
            return None


# Singleton instance for easy access
_gemini_service_instance: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """
    Get or create a singleton instance of GeminiService.
    
    Returns:
        GeminiService instance
    """
    global _gemini_service_instance
    if _gemini_service_instance is None:
        _gemini_service_instance = GeminiService()
    return _gemini_service_instance
