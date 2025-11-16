"""
Wolfram Alpha integration service for computational intelligence and mathematical solutions.
"""

import os
import re
from typing import Dict, Any, Optional, List
from enum import Enum
import wolframalpha


class QueryType(Enum):
    """Types of queries that can be processed."""
    MATHEMATICAL = "mathematical"
    SCIENTIFIC = "scientific"
    COMPUTATIONAL = "computational"
    GENERAL = "general"
    UNSUPPORTED = "unsupported"


class WolframServiceError(Exception):
    """Custom exception for Wolfram service errors."""
    pass


class WolframResult:
    """Structured result from Wolfram Alpha query."""
    
    def __init__(
        self,
        success: bool,
        query: str,
        result_text: Optional[str] = None,
        step_by_step: Optional[List[str]] = None,
        images: Optional[List[str]] = None,
        pods: Optional[List[Dict[str, Any]]] = None,
        error_message: Optional[str] = None
    ):
        self.success = success
        self.query = query
        self.result_text = result_text
        self.step_by_step = step_by_step or []
        self.images = images or []
        self.pods = pods or []
        self.error_message = error_message
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary format."""
        return {
            "success": self.success,
            "query": self.query,
            "result_text": self.result_text,
            "step_by_step": self.step_by_step,
            "images": self.images,
            "pods": self.pods,
            "error_message": self.error_message
        }


class StepByStepSolution:
    """Structured step-by-step solution."""
    
    def __init__(
        self,
        problem: str,
        steps: List[str],
        final_answer: Optional[str] = None,
        images: Optional[List[str]] = None
    ):
        self.problem = problem
        self.steps = steps
        self.final_answer = final_answer
        self.images = images or []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert solution to dictionary format."""
        return {
            "problem": self.problem,
            "steps": self.steps,
            "final_answer": self.final_answer,
            "images": self.images
        }


class ImageData:
    """Structured image data from Wolfram."""
    
    def __init__(
        self,
        url: str,
        title: Optional[str] = None,
        alt_text: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None
    ):
        self.url = url
        self.title = title
        self.alt_text = alt_text
        self.width = width
        self.height = height
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert image data to dictionary format."""
        return {
            "url": self.url,
            "title": self.title,
            "alt_text": self.alt_text,
            "width": self.width,
            "height": self.height
        }


class WolframService:
    """
    Service class for interacting with Wolfram Alpha API.
    Provides computational intelligence, mathematical solutions, and scientific data.
    """
    
    # Keywords that indicate computational queries
    MATH_KEYWORDS = [
        "solve", "calculate", "compute", "integrate", "differentiate", "derivative",
        "equation", "factor", "simplify", "expand", "limit", "sum", "product",
        "matrix", "determinant", "eigenvalue", "plot", "graph", "draw", "sketch"
    ]
    
    SCIENCE_KEYWORDS = [
        "formula", "constant", "element", "molecule", "reaction", "physics",
        "chemistry", "biology", "astronomy", "convert", "unit"
    ]
    
    def __init__(self, app_id: Optional[str] = None):
        """
        Initialize the Wolfram Alpha service.
        
        Args:
            app_id: Wolfram Alpha App ID (defaults to environment variable)
            
        Raises:
            WolframServiceError: If App ID is not provided
        """
        self.app_id = app_id or os.getenv("WOLFRAM_APP_ID")
        if not self.app_id:
            raise WolframServiceError("WOLFRAM_APP_ID not found in environment variables")
        
        # Initialize Wolfram Alpha client
        self.client = wolframalpha.Client(self.app_id)
    
    def detect_query_type(self, message: str) -> QueryType:
        """
        Detect the type of query to determine if Wolfram should be used.
        
        Args:
            message: The user's message/query
            
        Returns:
            QueryType enum indicating the type of query
        """
        message_lower = message.lower()
        
        # Check for mathematical keywords
        if any(keyword in message_lower for keyword in self.MATH_KEYWORDS):
            return QueryType.MATHEMATICAL
        
        # Check for scientific keywords
        if any(keyword in message_lower for keyword in self.SCIENCE_KEYWORDS):
            return QueryType.SCIENTIFIC
        
        # Check for mathematical symbols and patterns
        math_patterns = [
            r'\d+\s*[\+\-\*/\^]\s*\d+',  # Basic arithmetic
            r'[xy]\s*[\+\-\*/\^=]',  # Variables in equations
            r'\b(sin|cos|tan|log|ln|sqrt|exp)\b',  # Math functions
            r'\d+\s*[a-z]\s*[\+\-]',  # Algebraic expressions
            r'∫|∑|∏|√|π|∞',  # Mathematical symbols
        ]
        
        for pattern in math_patterns:
            if re.search(pattern, message_lower):
                return QueryType.COMPUTATIONAL
        
        # Check if it looks like a computational query (numbers and operators)
        if re.search(r'\d+.*[=\+\-\*/\^].*\d+', message):
            return QueryType.COMPUTATIONAL
        
        # Default to general for non-computational queries
        return QueryType.GENERAL
    
    def query_computational(self, query: str) -> WolframResult:
        """
        Execute a computational query and return structured results.
        
        Args:
            query: The computational query string
            
        Returns:
            WolframResult object with parsed results
            
        Raises:
            WolframServiceError: If the API request fails
        """
        try:
            # Query Wolfram Alpha
            res = self.client.query(query)
            
            # Check if query was successful
            if not hasattr(res, '@success') or res['@success'] != 'true':
                return WolframResult(
                    success=False,
                    query=query,
                    error_message="Wolfram Alpha could not interpret the query"
                )
            
            # Parse pods (result sections)
            pods = []
            result_text = None
            images = []
            
            for pod in res.pods:
                pod_data = {
                    "title": pod.get('@title', ''),
                    "text": [],
                    "images": []
                }
                
                # Extract text from subpods
                if hasattr(pod, 'subpod'):
                    subpods = pod.subpod if isinstance(pod.subpod, list) else [pod.subpod]
                    for subpod in subpods:
                        # Get plaintext
                        if hasattr(subpod, 'plaintext') and subpod.plaintext:
                            pod_data["text"].append(subpod.plaintext)
                        
                        # Get images
                        if hasattr(subpod, 'img') and subpod.img:
                            img_url = subpod.img.get('@src', '')
                            if img_url:
                                pod_data["images"].append(img_url)
                                images.append(img_url)
                
                pods.append(pod_data)
                
                # Use the first "Result" or "Solution" pod as the main result
                if not result_text and pod.get('@title') in ['Result', 'Solution', 'Exact result']:
                    if pod_data["text"]:
                        result_text = pod_data["text"][0]
            
            # If no specific result found, use the second pod (first is usually "Input")
            if not result_text and len(pods) > 1 and pods[1]["text"]:
                result_text = pods[1]["text"][0]
            
            return WolframResult(
                success=True,
                query=query,
                result_text=result_text,
                images=images,
                pods=pods
            )
            
        except Exception as e:
            # Handle API quota limits
            if "quota" in str(e).lower() or "limit" in str(e).lower():
                raise WolframServiceError(
                    "Wolfram Alpha API quota limit reached. Please try again later."
                )
            
            # Handle other errors
            raise WolframServiceError(f"Error querying Wolfram Alpha: {str(e)}")
    
    def get_step_by_step_solution(self, problem: str) -> StepByStepSolution:
        """
        Get a step-by-step solution for a mathematical problem.
        
        Args:
            problem: The mathematical problem to solve
            
        Returns:
            StepByStepSolution object with steps
            
        Raises:
            WolframServiceError: If the API request fails
        """
        try:
            # Add "step by step" to the query to get detailed solution
            query = f"{problem} step by step"
            
            # Query Wolfram Alpha
            res = self.client.query(query)
            
            # Check if query was successful
            if not hasattr(res, '@success') or res['@success'] != 'true':
                # Try without "step by step" if it fails
                return self._extract_steps_from_basic_query(problem)
            
            steps = []
            final_answer = None
            images = []
            
            for pod in res.pods:
                pod_title = pod.get('@title', '').lower()
                
                # Look for step-by-step pods
                if 'step' in pod_title or 'solution' in pod_title:
                    if hasattr(pod, 'subpod'):
                        subpods = pod.subpod if isinstance(pod.subpod, list) else [pod.subpod]
                        for subpod in subpods:
                            if hasattr(subpod, 'plaintext') and subpod.plaintext:
                                steps.append(subpod.plaintext)
                            
                            # Collect images
                            if hasattr(subpod, 'img') and subpod.img:
                                img_url = subpod.img.get('@src', '')
                                if img_url:
                                    images.append(img_url)
                
                # Look for final result
                if pod_title in ['result', 'solution', 'answer']:
                    if hasattr(pod, 'subpod'):
                        subpods = pod.subpod if isinstance(pod.subpod, list) else [pod.subpod]
                        if subpods and hasattr(subpods[0], 'plaintext'):
                            final_answer = subpods[0].plaintext
            
            # If no steps found, try to extract from basic query
            if not steps:
                return self._extract_steps_from_basic_query(problem)
            
            return StepByStepSolution(
                problem=problem,
                steps=steps,
                final_answer=final_answer,
                images=images
            )
            
        except Exception as e:
            if "quota" in str(e).lower() or "limit" in str(e).lower():
                raise WolframServiceError(
                    "Wolfram Alpha API quota limit reached. Please try again later."
                )
            raise WolframServiceError(f"Error getting step-by-step solution: {str(e)}")
    
    def _extract_steps_from_basic_query(self, problem: str) -> StepByStepSolution:
        """
        Fallback method to extract steps from a basic query result.
        
        Args:
            problem: The mathematical problem
            
        Returns:
            StepByStepSolution with available information
        """
        try:
            result = self.query_computational(problem)
            
            if not result.success:
                raise WolframServiceError("Could not solve the problem")
            
            # Extract steps from pods
            steps = []
            for pod in result.pods:
                if pod["text"] and pod["title"].lower() not in ['input', 'input interpretation']:
                    steps.extend(pod["text"])
            
            return StepByStepSolution(
                problem=problem,
                steps=steps if steps else ["Solution: " + (result.result_text or "No solution found")],
                final_answer=result.result_text,
                images=result.images
            )
            
        except Exception as e:
            raise WolframServiceError(f"Could not extract solution steps: {str(e)}")
    
    def get_visual_representation(self, query: str) -> List[ImageData]:
        """
        Get visual representations (plots, graphs) for a query.
        
        Args:
            query: The query to visualize (e.g., "plot sin(x)")
            
        Returns:
            List of ImageData objects with plot/graph URLs
            
        Raises:
            WolframServiceError: If the API request fails
        """
        try:
            # Add "plot" or "graph" if not present
            query_lower = query.lower()
            if "plot" not in query_lower and "graph" not in query_lower:
                query = f"plot {query}"
            
            # Query Wolfram Alpha
            res = self.client.query(query)
            
            # Check if query was successful
            if not hasattr(res, '@success') or res['@success'] != 'true':
                return []
            
            images = []
            
            for pod in res.pods:
                pod_title = pod.get('@title', '').lower()
                
                # Look for plot/graph pods
                if any(keyword in pod_title for keyword in ['plot', 'graph', 'visual', 'curve', '3d']):
                    if hasattr(pod, 'subpod'):
                        subpods = pod.subpod if isinstance(pod.subpod, list) else [pod.subpod]
                        for subpod in subpods:
                            if hasattr(subpod, 'img') and subpod.img:
                                img_url = subpod.img.get('@src', '')
                                img_alt = subpod.img.get('@alt', '')
                                img_width = subpod.img.get('@width')
                                img_height = subpod.img.get('@height')
                                
                                if img_url:
                                    images.append(ImageData(
                                        url=img_url,
                                        title=pod.get('@title', ''),
                                        alt_text=img_alt,
                                        width=int(img_width) if img_width else None,
                                        height=int(img_height) if img_height else None
                                    ))
            
            return images
            
        except Exception as e:
            if "quota" in str(e).lower() or "limit" in str(e).lower():
                raise WolframServiceError(
                    "Wolfram Alpha API quota limit reached. Please try again later."
                )
            raise WolframServiceError(f"Error getting visual representation: {str(e)}")
    
    def is_computational_query(self, message: str) -> bool:
        """
        Quick check if a message is likely a computational query.
        
        Args:
            message: The user's message
            
        Returns:
            True if the message appears to be computational
        """
        query_type = self.detect_query_type(message)
        return query_type in [QueryType.MATHEMATICAL, QueryType.SCIENTIFIC, QueryType.COMPUTATIONAL]


# Singleton instance for easy access
_wolfram_service_instance: Optional[WolframService] = None


def get_wolfram_service() -> WolframService:
    """
    Get or create a singleton instance of WolframService.
    
    Returns:
        WolframService instance
        
    Raises:
        WolframServiceError: If service cannot be initialized
    """
    global _wolfram_service_instance
    if _wolfram_service_instance is None:
        _wolfram_service_instance = WolframService()
    return _wolfram_service_instance
