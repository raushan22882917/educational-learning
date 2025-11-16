"""
AI Coordinator service to combine Gemini and Wolfram Alpha responses.
Provides hybrid AI responses that leverage both computational intelligence and natural language explanations.
"""

from typing import Dict, Any, Optional, List
from .gemini import GeminiService, GeminiServiceError, get_gemini_service
from .wolfram import (
    WolframService, 
    WolframServiceError, 
    WolframResult,
    QueryType,
    get_wolfram_service
)
from .multimedia_parser import MultimediaParser, MultimediaElement, format_response_with_multimedia


class HybridResponse:
    """Structured hybrid response combining Gemini and Wolfram results."""
    
    def __init__(
        self,
        message: str,
        has_wolfram_data: bool = False,
        wolfram_result: Optional[WolframResult] = None,
        computational_answer: Optional[str] = None,
        step_by_step: Optional[List[str]] = None,
        images: Optional[List[str]] = None,
        explanation: Optional[str] = None,
        source: str = "gemini"
    ):
        """
        Initialize a hybrid response.
        
        Args:
            message: The main response message (from Gemini)
            has_wolfram_data: Whether Wolfram data is included
            wolfram_result: Raw Wolfram result object
            computational_answer: Computational result from Wolfram
            step_by_step: Step-by-step solution from Wolfram
            images: Image URLs from Wolfram (plots, graphs)
            explanation: Additional explanation from Gemini
            source: Source of the response ("gemini", "wolfram", "hybrid")
        """
        self.message = message
        self.has_wolfram_data = has_wolfram_data
        self.wolfram_result = wolfram_result
        self.computational_answer = computational_answer
        self.step_by_step = step_by_step or []
        self.images = images or []
        self.explanation = explanation
        self.source = source
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert hybrid response to dictionary format for API responses."""
        response = {
            "message": self.message,
            "has_wolfram_data": self.has_wolfram_data,
            "source": self.source
        }
        
        if self.has_wolfram_data:
            response["wolfram_data"] = {
                "computational_answer": self.computational_answer,
                "step_by_step": self.step_by_step,
                "images": self.images
            }
            
            if self.explanation:
                response["explanation"] = self.explanation
        
        return response


class AICoordinator:
    """
    Coordinates between Gemini AI and Wolfram Alpha to provide hybrid responses.
    Detects when to use computational intelligence vs natural language processing.
    """
    
    def __init__(
        self,
        gemini_service: Optional[GeminiService] = None,
        wolfram_service: Optional[WolframService] = None
    ):
        """
        Initialize the AI coordinator.
        
        Args:
            gemini_service: Optional GeminiService instance (creates one if not provided)
            wolfram_service: Optional WolframService instance (creates one if not provided)
        """
        self.gemini_service = gemini_service or get_gemini_service()
        self.wolfram_service = wolfram_service or get_wolfram_service()
    
    def should_use_wolfram(self, message: str) -> bool:
        """
        Determine if Wolfram Alpha should be used for this query.
        
        Args:
            message: The user's message
            
        Returns:
            True if Wolfram should be used
        """
        query_type = self.wolfram_service.detect_query_type(message)
        should_use = query_type in [
            QueryType.MATHEMATICAL,
            QueryType.SCIENTIFIC,
            QueryType.COMPUTATIONAL
        ]
        
        print(f"Wolfram check for '{message[:50]}...': query_type={query_type}, should_use={should_use}")
        
        return should_use
    
    def generate_hybrid_response(
        self,
        message: str,
        context: List[Dict[str, str]],
        topic: Optional[str] = None,
        force_wolfram: bool = False
    ) -> HybridResponse:
        """
        Generate a hybrid response combining Gemini and Wolfram when appropriate.
        
        Args:
            message: The user's current message
            context: List of previous messages with 'role' and 'content' keys
            topic: Optional topic for the learning session
            force_wolfram: Force Wolfram query even if detection says no
            
        Returns:
            HybridResponse object with combined results
        """
        # Determine if we should use Wolfram
        use_wolfram = force_wolfram or self.should_use_wolfram(message)
        
        if not use_wolfram:
            # Pure Gemini response for non-computational queries
            try:
                gemini_response = self.gemini_service.generate_tutor_response(
                    message, context, topic
                )
                return HybridResponse(
                    message=gemini_response,
                    source="gemini"
                )
            except GeminiServiceError as e:
                # Fallback error response
                return HybridResponse(
                    message=f"I apologize, but I'm having trouble generating a response right now. Please try again.",
                    source="error"
                )
        
        # Hybrid response: Use both Wolfram and Gemini
        return self._generate_computational_response(message, context, topic)
    
    def _generate_computational_response(
        self,
        message: str,
        context: List[Dict[str, str]],
        topic: Optional[str] = None
    ) -> HybridResponse:
        """
        Generate a response that combines Wolfram computational results with Gemini explanations.
        
        Args:
            message: The user's message
            context: Conversation context
            topic: Optional topic
            
        Returns:
            HybridResponse with combined data
        """
        wolfram_result = None
        computational_answer = None
        step_by_step = []
        images = []
        
        # Try to get Wolfram computational results
        try:
            print(f"Calling Wolfram for: {message[:50]}...")
            wolfram_result = self.wolfram_service.query_computational(message)
            
            if wolfram_result.success:
                computational_answer = wolfram_result.result_text
                images = wolfram_result.images
                print(f"Wolfram success! Got {len(images)} images")
                
                # Try to get step-by-step solution for mathematical problems
                try:
                    solution = self.wolfram_service.get_step_by_step_solution(message)
                    if solution.steps:
                        step_by_step = solution.steps
                except WolframServiceError:
                    # Step-by-step not available, continue with basic result
                    pass
        
        except WolframServiceError as e:
            # Wolfram failed, will fall back to pure Gemini
            pass
        
        # Generate Gemini explanation
        try:
            if wolfram_result and wolfram_result.success:
                # Create enhanced context with Wolfram results
                enhanced_message = self._create_enhanced_prompt(
                    message,
                    computational_answer,
                    step_by_step
                )
                
                gemini_response = self.gemini_service.generate_tutor_response(
                    enhanced_message,
                    context,
                    topic
                )
                
                # Return hybrid response
                return HybridResponse(
                    message=gemini_response,
                    has_wolfram_data=True,
                    wolfram_result=wolfram_result,
                    computational_answer=computational_answer,
                    step_by_step=step_by_step,
                    images=images,
                    source="hybrid"
                )
            else:
                # Wolfram didn't work, use pure Gemini
                gemini_response = self.gemini_service.generate_tutor_response(
                    message, context, topic
                )
                
                # Check if we should generate an image for this response
                generated_image = self._maybe_generate_image(message, gemini_response)
                if generated_image:
                    images.append(generated_image)
                
                return HybridResponse(
                    message=gemini_response,
                    images=images,
                    source="gemini"
                )
        
        except GeminiServiceError:
            # Both services failed, return error
            return HybridResponse(
                message="I apologize, but I'm having trouble processing your request right now. Please try again.",
                source="error"
            )
    
    def _maybe_generate_image(self, message: str, response: str) -> Optional[str]:
        """
        Determine if an image should be generated and generate it.
        
        Args:
            message: User's message
            response: AI's response
            
        Returns:
            Image URL/data or None
        """
        # Keywords that suggest visual content would be helpful
        visual_keywords = [
            'diagram', 'chart', 'graph', 'picture', 'image', 'illustration',
            'visualize', 'show me', 'draw', 'sketch', 'looks like',
            'appearance', 'structure', 'architecture', 'design',
            'what does', 'how does it look'
        ]
        
        message_lower = message.lower()
        
        # Check if user is asking for visual content
        if any(keyword in message_lower for keyword in visual_keywords):
            # Extract the main subject for image generation
            # Simple heuristic: use the message as the prompt
            try:
                # Generate a focused image prompt
                image_prompt = f"Educational illustration: {message}"
                print(f"Generating image for: {image_prompt}")
                
                image_url = self.gemini_service.generate_image(image_prompt)
                if image_url:
                    print(f"Successfully generated image")
                    return image_url
            except Exception as e:
                print(f"Image generation failed: {e}")
        
        return None
    
    def _create_enhanced_prompt(
        self,
        original_message: str,
        computational_answer: Optional[str],
        step_by_step: List[str]
    ) -> str:
        """
        Create an enhanced prompt that includes Wolfram computational results.
        
        Args:
            original_message: The user's original message
            computational_answer: Computational result from Wolfram
            step_by_step: Step-by-step solution
            
        Returns:
            Enhanced prompt string
        """
        prompt_parts = [original_message]
        
        if computational_answer:
            prompt_parts.append(
                f"\n\n[Computational Result: {computational_answer}]"
            )
        
        if step_by_step:
            steps_text = "\n".join([f"Step {i+1}: {step}" for i, step in enumerate(step_by_step)])
            prompt_parts.append(
                f"\n\n[Step-by-Step Solution:\n{steps_text}]"
            )
        
        prompt_parts.append(
            "\n\nPlease provide a clear explanation that helps the student understand this solution."
        )
        
        return "".join(prompt_parts)
    
    def generate_explanation(
        self,
        concept: str,
        style: str = "comprehensive",
        topic: Optional[str] = None
    ) -> HybridResponse:
        """
        Generate an explanation that may include computational results.
        
        Args:
            concept: The concept to explain
            style: Explanation style
            topic: Optional topic context
            
        Returns:
            HybridResponse with explanation and optional computational data
        """
        # Check if this is a computational concept
        use_wolfram = self.should_use_wolfram(concept)
        
        if use_wolfram:
            # Try to get computational data
            try:
                wolfram_result = self.wolfram_service.query_computational(concept)
                
                if wolfram_result.success:
                    # Try to get step-by-step solution
                    step_by_step = []
                    try:
                        solution = self.wolfram_service.get_step_by_step_solution(concept)
                        if solution.steps:
                            step_by_step = solution.steps
                    except WolframServiceError:
                        pass
                    
                    # Generate explanation with Wolfram context
                    enhanced_concept = f"{concept}\n\n[Computational data: {wolfram_result.result_text}]"
                    explanation = self.gemini_service.generate_explanation(
                        enhanced_concept, style
                    )
                    
                    return HybridResponse(
                        message=explanation,
                        has_wolfram_data=True,
                        wolfram_result=wolfram_result,
                        computational_answer=wolfram_result.result_text,
                        step_by_step=step_by_step,
                        images=wolfram_result.images,
                        source="hybrid"
                    )
            except WolframServiceError:
                # Fall through to pure Gemini
                pass
        
        # Pure Gemini explanation
        try:
            explanation = self.gemini_service.generate_explanation(concept, style)
            return HybridResponse(
                message=explanation,
                source="gemini"
            )
        except GeminiServiceError:
            return HybridResponse(
                message="I apologize, but I'm having trouble generating an explanation right now.",
                source="error"
            )
    
    def generate_explanation_with_computation(
        self,
        concept: str,
        style: str = "comprehensive"
    ) -> HybridResponse:
        """
        Generate an explanation that may include computational results.
        
        Deprecated: Use generate_explanation instead.
        
        Args:
            concept: The concept to explain
            style: Explanation style
            
        Returns:
            HybridResponse with explanation and optional computational data
        """
        return self.generate_explanation(concept, style)
    
    def format_for_display(self, hybrid_response: HybridResponse) -> Dict[str, Any]:
        """
        Format a hybrid response for frontend display.
        
        Args:
            hybrid_response: The HybridResponse object
            
        Returns:
            Dictionary formatted for frontend consumption
        """
        display_data = {
            "type": "hybrid_response",
            "content": {
                "main_message": hybrid_response.message,
                "source": hybrid_response.source
            }
        }
        
        if hybrid_response.has_wolfram_data:
            display_data["content"]["computational_data"] = {
                "answer": hybrid_response.computational_answer,
                "has_steps": len(hybrid_response.step_by_step) > 0,
                "steps": hybrid_response.step_by_step,
                "has_visualizations": len(hybrid_response.images) > 0,
                "visualizations": [
                    {
                        "url": img,
                        "type": "plot"
                    } for img in hybrid_response.images
                ]
            }
        
        return display_data


# Singleton instance for easy access
_ai_coordinator_instance: Optional[AICoordinator] = None


def get_ai_coordinator() -> AICoordinator:
    """
    Get or create a singleton instance of AICoordinator.
    
    Returns:
        AICoordinator instance
    """
    global _ai_coordinator_instance
    if _ai_coordinator_instance is None:
        _ai_coordinator_instance = AICoordinator()
    return _ai_coordinator_instance
