"""
Adaptive tutor service that tracks understanding and adjusts teaching approach.
"""

from typing import List, Dict, Any, Optional
from enum import Enum
from dataclasses import dataclass
from datetime import datetime


class UnderstandingState(Enum):
    """Student's understanding state."""
    UNKNOWN = "unknown"
    CONFUSED = "confused"
    CLAIMS_UNDERSTANDING = "claims_understanding"
    VERIFIED_UNDERSTANDING = "verified_understanding"
    PARTIAL_UNDERSTANDING = "partial_understanding"


class TeachingMode(Enum):
    """Current teaching mode."""
    INITIAL_TEACH = "initial_teach"
    RETEACH = "reteach"
    VERIFY = "verify"
    FEEDBACK = "feedback"
    ADVANCE = "advance"
    SOCRATIC = "socratic"


@dataclass
class ConceptProgress:
    """Tracks progress on a specific concept."""
    concept: str
    attempts: int = 0
    understanding_state: UnderstandingState = UnderstandingState.UNKNOWN
    teaching_approaches_used: List[str] = None
    last_explanation: str = ""
    verification_question: str = ""
    student_answer: str = ""
    
    def __post_init__(self):
        if self.teaching_approaches_used is None:
            self.teaching_approaches_used = []


class AdaptiveTutor:
    """
    Manages adaptive teaching flow based on student understanding.
    """
    
    def __init__(self):
        """Initialize the adaptive tutor."""
        self.current_concept: Optional[ConceptProgress] = None
        self.concept_history: List[ConceptProgress] = []
        self.teaching_mode: TeachingMode = TeachingMode.INITIAL_TEACH
    
    def analyze_student_response(self, message: str) -> Dict[str, Any]:
        """
        Analyze student's response to determine understanding state.
        
        Args:
            message: Student's message
            
        Returns:
            Analysis dictionary with understanding state and recommended action
        """
        message_lower = message.lower().strip()
        
        # Check for understanding indicators
        understanding_indicators = {
            'positive': ['yes', 'understand', 'got it', 'makes sense', 'clear', 
                        'i get it', 'i see', 'oh i understand', 'that makes sense'],
            'negative': ['no', "don't understand", "dont understand", 'confused', 
                        'unclear', 'lost', "doesn't make sense", 'what', 'huh',
                        'i dont get it', "i don't get it", 'still confused'],
            'partial': ['kind of', 'sort of', 'maybe', 'i think so', 'partially',
                       'not sure', 'almost']
        }
        
        # Determine understanding state
        if any(indicator in message_lower for indicator in understanding_indicators['positive']):
            if self.teaching_mode == TeachingMode.INITIAL_TEACH or self.teaching_mode == TeachingMode.RETEACH:
                # Student claims to understand - need to verify
                new_state = UnderstandingState.CLAIMS_UNDERSTANDING
                recommended_mode = TeachingMode.VERIFY
                action = "verify_understanding"
            else:
                # Already in verification, they confirmed
                new_state = UnderstandingState.VERIFIED_UNDERSTANDING
                recommended_mode = TeachingMode.ADVANCE
                action = "advance_to_next"
                
        elif any(indicator in message_lower for indicator in understanding_indicators['negative']):
            new_state = UnderstandingState.CONFUSED
            recommended_mode = TeachingMode.RETEACH
            action = "reteach_differently"
            
        elif any(indicator in message_lower for indicator in understanding_indicators['partial']):
            new_state = UnderstandingState.PARTIAL_UNDERSTANDING
            recommended_mode = TeachingMode.RETEACH
            action = "clarify_and_reteach"
            
        else:
            # Analyzing their answer to a question
            if self.teaching_mode == TeachingMode.VERIFY:
                new_state = UnderstandingState.UNKNOWN
                recommended_mode = TeachingMode.FEEDBACK
                action = "evaluate_answer"
            else:
                # New question or topic
                new_state = UnderstandingState.UNKNOWN
                recommended_mode = TeachingMode.INITIAL_TEACH
                action = "teach_concept"
        
        # Update current concept if exists
        if self.current_concept:
            self.current_concept.understanding_state = new_state
            self.current_concept.attempts += 1
            if action == "reteach_differently":
                self.current_concept.teaching_approaches_used.append(f"attempt_{self.current_concept.attempts}")
        
        return {
            "understanding_state": new_state.value,
            "recommended_mode": recommended_mode.value,
            "action": action,
            "message_analysis": {
                "is_question": message.strip().endswith('?'),
                "is_short_response": len(message.split()) < 5,
                "sentiment": self._analyze_sentiment(message)
            }
        }
    
    def _analyze_sentiment(self, message: str) -> str:
        """Analyze sentiment of student's message."""
        message_lower = message.lower()
        
        positive_words = ['great', 'awesome', 'cool', 'interesting', 'love', 'like', 'thanks']
        negative_words = ['hard', 'difficult', 'frustrated', 'stuck', 'hate', 'boring']
        
        if any(word in message_lower for word in positive_words):
            return "positive"
        elif any(word in message_lower for word in negative_words):
            return "negative"
        else:
            return "neutral"
    
    def get_teaching_strategy(self, analysis: Dict[str, Any], 
                             concept: str) -> Dict[str, Any]:
        """
        Get recommended teaching strategy based on analysis.
        
        Args:
            analysis: Analysis from analyze_student_response
            concept: Current concept being taught
            
        Returns:
            Teaching strategy dictionary
        """
        action = analysis['action']
        
        strategies = {
            "teach_concept": {
                "mode": "initial_teach",
                "prompt_type": "tutor_prompt",
                "include_multimedia": True,
                "end_with_check": True,
                "instructions": "Teach the concept clearly with multimedia, then ask if they understand"
            },
            
            "verify_understanding": {
                "mode": "verify",
                "prompt_type": "understanding_check_prompt",
                "include_multimedia": False,
                "end_with_check": False,
                "instructions": "Ask a verification question that tests true understanding"
            },
            
            "reteach_differently": {
                "mode": "reteach",
                "prompt_type": "reteach_prompt",
                "include_multimedia": True,
                "end_with_check": True,
                "instructions": "Re-teach using a completely different approach with different multimedia"
            },
            
            "clarify_and_reteach": {
                "mode": "reteach",
                "prompt_type": "reteach_prompt",
                "include_multimedia": True,
                "end_with_check": True,
                "instructions": "Clarify the confusing parts and re-teach more simply"
            },
            
            "evaluate_answer": {
                "mode": "feedback",
                "prompt_type": "feedback_prompt",
                "include_multimedia": False,
                "end_with_check": True,
                "instructions": "Evaluate their answer and provide constructive feedback"
            },
            
            "advance_to_next": {
                "mode": "advance",
                "prompt_type": "tutor_prompt",
                "include_multimedia": True,
                "end_with_check": True,
                "instructions": "Celebrate understanding and introduce the next concept"
            }
        }
        
        strategy = strategies.get(action, strategies["teach_concept"])
        strategy["concept"] = concept
        strategy["attempt_number"] = self.current_concept.attempts if self.current_concept else 1
        
        return strategy
    
    def start_new_concept(self, concept: str):
        """Start tracking a new concept."""
        if self.current_concept:
            self.concept_history.append(self.current_concept)
        
        self.current_concept = ConceptProgress(concept=concept)
        self.teaching_mode = TeachingMode.INITIAL_TEACH
    
    def update_teaching_mode(self, mode: TeachingMode):
        """Update the current teaching mode."""
        self.teaching_mode = mode
    
    def record_explanation(self, explanation: str):
        """Record the explanation given to student."""
        if self.current_concept:
            self.current_concept.last_explanation = explanation
    
    def record_verification_question(self, question: str):
        """Record the verification question asked."""
        if self.current_concept:
            self.current_concept.verification_question = question
    
    def record_student_answer(self, answer: str):
        """Record student's answer to verification question."""
        if self.current_concept:
            self.current_concept.student_answer = answer
    
    def get_progress_summary(self) -> Dict[str, Any]:
        """Get summary of learning progress."""
        total_concepts = len(self.concept_history) + (1 if self.current_concept else 0)
        verified_concepts = sum(
            1 for c in self.concept_history 
            if c.understanding_state == UnderstandingState.VERIFIED_UNDERSTANDING
        )
        
        return {
            "total_concepts_attempted": total_concepts,
            "concepts_mastered": verified_concepts,
            "current_concept": self.current_concept.concept if self.current_concept else None,
            "current_understanding": self.current_concept.understanding_state.value if self.current_concept else None,
            "teaching_mode": self.teaching_mode.value,
            "mastery_rate": verified_concepts / total_concepts if total_concepts > 0 else 0
        }
    
    def should_try_different_approach(self) -> bool:
        """Determine if we should try a completely different teaching approach."""
        if not self.current_concept:
            return False
        
        # If student is still confused after 2 attempts, try something radically different
        return (
            self.current_concept.attempts >= 2 and
            self.current_concept.understanding_state in [
                UnderstandingState.CONFUSED,
                UnderstandingState.PARTIAL_UNDERSTANDING
            ]
        )
    
    def get_alternative_teaching_methods(self) -> List[str]:
        """Get list of alternative teaching methods to try."""
        if not self.current_concept:
            return []
        
        all_methods = [
            "visual_analogy",
            "real_world_example",
            "interactive_activity",
            "video_demonstration",
            "step_by_step_breakdown",
            "socratic_questioning",
            "storytelling",
            "hands_on_experiment"
        ]
        
        # Filter out already used methods
        used = set(self.current_concept.teaching_approaches_used)
        available = [m for m in all_methods if m not in used]
        
        return available if available else all_methods  # Reset if all tried


def create_adaptive_response(
    tutor: AdaptiveTutor,
    student_message: str,
    concept: str,
    context: List[Dict[str, str]]
) -> Dict[str, Any]:
    """
    Create an adaptive response based on student's understanding.
    
    Args:
        tutor: AdaptiveTutor instance
        student_message: Student's current message
        concept: Current concept being taught
        context: Conversation context
        
    Returns:
        Response configuration for the AI
    """
    # Analyze student response
    analysis = tutor.analyze_student_response(student_message)
    
    # Get teaching strategy
    strategy = tutor.get_teaching_strategy(analysis, concept)
    
    # Update teaching mode
    tutor.update_teaching_mode(TeachingMode[strategy['mode'].upper()])
    
    # Build response configuration
    response_config = {
        "strategy": strategy,
        "analysis": analysis,
        "should_use_multimedia": strategy['include_multimedia'],
        "should_check_understanding": strategy['end_with_check'],
        "teaching_instructions": strategy['instructions'],
        "attempt_number": strategy['attempt_number'],
        "alternative_methods": tutor.get_alternative_teaching_methods() if tutor.should_try_different_approach() else []
    }
    
    return response_config
