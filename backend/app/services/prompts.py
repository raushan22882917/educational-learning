"""
Prompt engineering module for AI interactions.
Contains prompt templates for different use cases.
"""

from typing import List, Dict, Any
from datetime import datetime


class PromptTemplates:
    """Collection of prompt templates for various AI interactions."""
    
    @staticmethod
    def tutor_prompt(message: str, context: List[Dict[str, str]], topic: str = None) -> str:
        """
        Generate an adaptive, interactive multimedia tutor prompt with understanding checks.
        
        Args:
            message: The user's current message
            context: Previous conversation messages
            topic: Optional topic for the session
            
        Returns:
            Formatted prompt for the AI tutor with multimedia suggestions
        """
        system_context = """You are an ADAPTIVE AI tutor who creates INTERACTIVE, MULTIMEDIA learning 
experiences and CONSTANTLY CHECKS UNDERSTANDING. Your teaching follows this cycle:

🎯 ADAPTIVE TEACHING CYCLE:
1. **TEACH** - Explain concept with multimedia
2. **CHECK** - Ask if they understand
3. **ADAPT** - Based on their response:
   - If YES (understood): Ask a question to VERIFY understanding
   - If NO (confused): Teach the SAME concept in a DIFFERENT way
4. **VERIFY** - Check their answer and provide feedback
5. **ADVANCE** - Move to next concept only after understanding is confirmed

📚 TEACHING PRINCIPLES:
- Start with simple explanations, add complexity gradually
- Use MULTIPLE teaching methods (visual, auditory, kinesthetic)
- NEVER move forward until student demonstrates understanding
- If student says "I don't understand", try a COMPLETELY DIFFERENT approach:
  * Use a different analogy
  * Show a different example
  * Use different multimedia (if you used text, try video; if you used diagram, try interactive)
  * Break it into smaller pieces
  * Connect to something they already know

🎨 MULTIMEDIA INTEGRATION - MANDATORY FORMAT:
YOU MUST USE THESE EXACT TAGS IN YOUR RESPONSES:

1. [IMAGE: description] - For ANY visual concept, diagram, or illustration
   Example: [IMAGE: graph showing limit of (x^2-1)/(x-1) as x approaches 1]
   
2. [VIDEO: search query] - For complex topics needing video explanation
   Example: [VIDEO: calculus limits explained]
   
3. [WOLFRAM: query] - For ALL math/science computations and graphs
   Example: [WOLFRAM: plot (x^2-1)/(x-1)]
   Example: [WOLFRAM: solve x^2 + 5x + 6 = 0]
   
4. [AUDIO: description] - For pronunciation or audio content
   Example: [AUDIO: pronunciation of "photosynthesis"]
   
5. [INTERACTIVE: activity] - For hands-on activities
   Example: [INTERACTIVE: try graphing different functions]

CRITICAL RULES:
- For MATH questions: ALWAYS include [WOLFRAM: ...] tag
- For VISUAL concepts: ALWAYS include [IMAGE: ...] tag  
- For GRAPHS/PLOTS: ALWAYS use [WOLFRAM: plot ...]
- Place tags AFTER explaining the concept in text
- Use EXACT format with square brackets

⚡ RESPONSE STRUCTURE WITH MULTIMEDIA EXAMPLE:

CORRECT Response Format:
"Let me explain limits! A limit describes what value a function approaches.

[IMAGE: diagram showing function approaching a point]
[WOLFRAM: plot (x^2-1)/(x-1)]

For example, as x approaches 1 in f(x) = (x^2-1)/(x-1), the function approaches 2.

[VIDEO: limits in calculus explained]

Does this make sense? Do you understand how limits work?"

WRONG Response Format (DON'T DO THIS):
"Let me explain limits. This image shows the graph..." ❌ NO TAG!
"You can see in the visualization..." ❌ NO TAG!
"Here's a graph of the function..." ❌ NO TAG!

After EVERY explanation, you MUST:
1. Provide clear explanation with multimedia TAGS
2. Ask: "Does this make sense? Do you understand [concept]?"
3. Wait for their response

When student says they UNDERSTAND:
- Don't just accept it! VERIFY with a question
- Ask them to explain it back, solve a problem, or give an example
- Format: "Great! Let me check: [verification question]"

When student says they DON'T UNDERSTAND:
- Stay positive: "No problem! Let me explain it differently."
- Use a COMPLETELY DIFFERENT approach
- Try different multimedia type
- Simplify further or use better analogy

When student ANSWERS your verification question:
- Give specific feedback on their answer
- Correct misconceptions gently
- If correct: Celebrate and move to next concept
- If incorrect: Re-teach the specific part they missed"""

        conversation_history = ""
        if context:
            conversation_history = "\n\n📝 Previous conversation:\n"
            for msg in context[-5:]:  # Last 5 messages for context
                role = "Student" if msg["role"] == "user" else "Tutor"
                conversation_history += f"{role}: {msg['content']}\n"
        
        topic_context = f"\n\n🎓 Current learning topic: {topic}" if topic else ""
        
        # Analyze last student response to determine teaching mode
        teaching_mode = ""
        if context and len(context) > 0:
            last_student_msg = next((msg['content'] for msg in reversed(context) if msg['role'] == 'user'), "")
            last_student_lower = last_student_msg.lower()
            
            if any(word in last_student_lower for word in ['yes', 'understand', 'got it', 'makes sense', 'clear']):
                teaching_mode = "\n\n🎯 MODE: Student claims to understand - VERIFY with a question!"
            elif any(word in last_student_lower for word in ['no', "don't understand", 'confused', 'unclear', 'lost']):
                teaching_mode = "\n\n🔄 MODE: Student is confused - Teach the SAME concept in a DIFFERENT way!"
            elif last_student_msg.strip().endswith('?'):
                teaching_mode = "\n\n📖 MODE: Student has a question - Teach and then check understanding"
            else:
                teaching_mode = "\n\n✅ MODE: Evaluate student's answer and provide feedback"
        
        prompt = f"""{system_context}{topic_context}{conversation_history}{teaching_mode}

Student's current message: {message}

Now respond following the ADAPTIVE TEACHING CYCLE:
1. Address their message appropriately
2. Include multimedia elements (use format tags)
3. ALWAYS end with a check or question
4. Adapt your approach based on their understanding level

Remember: 
- If they say they understand → VERIFY with a question
- If they say they don't understand → TEACH DIFFERENTLY
- Never move forward without confirmed understanding!"""
        
        return prompt
    
    @staticmethod
    def recommendation_prompt(user_profile: Dict[str, Any]) -> str:
        """
        Generate a recommendation prompt using user history.
        
        Args:
            user_profile: Dictionary containing user learning history and preferences
            
        Returns:
            Formatted prompt for generating recommendations
        """
        topics_completed = user_profile.get("topics_completed", [])
        interests = user_profile.get("interests", [])
        difficulty_level = user_profile.get("difficulty_level", "intermediate")
        recent_topics = user_profile.get("recent_topics", [])
        
        topics_str = ", ".join(topics_completed[-10:]) if topics_completed else "None yet"
        interests_str = ", ".join(interests) if interests else "General learning"
        recent_str = ", ".join(recent_topics[-3:]) if recent_topics else "None"
        
        prompt = f"""Based on a student's learning profile, suggest 5 personalized learning topics 
that would be engaging and appropriate for their next learning session.

Student Profile:
- Recently completed topics: {topics_str}
- Areas of interest: {interests_str}
- Current difficulty level: {difficulty_level}
- Most recent topics: {recent_str}

Generate 5 diverse topic recommendations that:
1. Build on their existing knowledge
2. Align with their interests
3. Introduce new but related concepts
4. Match their difficulty level
5. Are engaging and practical

Format your response as a JSON array with this structure:
[
  {{
    "title": "Topic Title",
    "description": "Brief description of what they'll learn",
    "difficulty": "beginner|intermediate|advanced",
    "estimated_time": "15-30 minutes",
    "why_recommended": "Brief explanation of why this is a good fit"
  }}
]

Provide only the JSON array, no additional text."""
        
        return prompt
    
    @staticmethod
    def quiz_generation_prompt(topic: str, difficulty: str, count: int = 5) -> str:
        """
        Generate a quiz generation prompt with difficulty levels.
        
        Args:
            topic: The topic for quiz questions
            difficulty: Difficulty level (beginner, intermediate, advanced)
            count: Number of questions to generate
            
        Returns:
            Formatted prompt for quiz generation
        """
        difficulty_guidelines = {
            "beginner": "Focus on basic concepts, definitions, and simple applications. Questions should test fundamental understanding.",
            "intermediate": "Include application of concepts, problem-solving, and connections between ideas. Require deeper thinking.",
            "advanced": "Challenge with complex scenarios, critical thinking, synthesis of multiple concepts, and advanced applications."
        }
        
        guideline = difficulty_guidelines.get(difficulty, difficulty_guidelines["intermediate"])
        
        prompt = f"""Generate {count} multiple-choice quiz questions about: {topic}

Difficulty level: {difficulty}
{guideline}

Requirements for each question:
1. Clear, unambiguous question text
2. Four answer options (A, B, C, D)
3. Only one correct answer
4. Plausible distractors (wrong answers that seem reasonable)
5. Educational explanation for why the correct answer is right

Format your response as a JSON array with this structure:
[
  {{
    "question": "Question text here?",
    "options": [
      "Option A text",
      "Option B text",
      "Option C text",
      "Option D text"
    ],
    "correct_answer": 0,
    "explanation": "Detailed explanation of why this answer is correct and what concept it tests"
  }}
]

Provide only the JSON array, no additional text."""
        
        return prompt
    
    @staticmethod
    def explanation_prompt(concept: str, style: str = "comprehensive") -> str:
        """
        Generate an explanation prompt with multiple format options.
        
        Args:
            concept: The concept to explain
            style: Explanation style (comprehensive, analogy, example, steps, simple)
            
        Returns:
            Formatted prompt for generating explanations
        """
        style_instructions = {
            "comprehensive": """Provide a thorough explanation that includes:
- Clear definition of the concept
- Why it's important or useful
- How it works or applies
- Real-world examples
- Common misconceptions to avoid""",
            
            "analogy": """Explain the concept using a creative analogy or metaphor that:
- Relates to everyday experiences
- Makes the abstract concrete
- Highlights key similarities
- Is memorable and engaging""",
            
            "example": """Explain through concrete examples that:
- Show the concept in action
- Progress from simple to complex
- Include step-by-step walkthrough
- Demonstrate practical applications""",
            
            "steps": """Break down the concept into clear steps:
- Number each step sequentially
- Explain what happens at each stage
- Show how steps connect
- Include visual descriptions where helpful""",
            
            "simple": """Explain as if teaching a beginner:
- Use simple, everyday language
- Avoid jargon or define it clearly
- Focus on the core idea
- Keep it concise and accessible"""
        }
        
        instruction = style_instructions.get(style, style_instructions["comprehensive"])
        
        prompt = f"""Explain the following concept to a student: {concept}

Explanation style: {style}

{instruction}

Make your explanation engaging, clear, and educational. Use formatting (bullet points, 
numbered lists, etc.) to improve readability."""
        
        return prompt
    
    @staticmethod
    def alternative_explanation_prompt(concept: str, previous_explanation: str, 
                                      feedback: str = None) -> str:
        """
        Generate a prompt for an alternative explanation when the first one wasn't clear.
        
        Args:
            concept: The concept to explain
            previous_explanation: The previous explanation that wasn't clear
            feedback: Optional feedback from the student
            
        Returns:
            Formatted prompt for generating an alternative explanation
        """
        feedback_context = f"\n\nStudent feedback: {feedback}" if feedback else ""
        
        prompt = f"""A student is having trouble understanding this concept: {concept}

Previous explanation provided:
{previous_explanation}{feedback_context}

Generate a completely different explanation that:
1. Uses a different approach or perspective
2. Includes a concrete, relatable analogy
3. Provides a specific example or scenario
4. Uses simpler language
5. Breaks down the concept into smaller parts

Focus on making the concept "click" for the student by finding a new angle."""
        
        return prompt
    
    @staticmethod
    def session_summary_prompt(messages: List[Dict[str, str]], topic: str, 
                               duration_minutes: int) -> str:
        """
        Generate a prompt for creating a session summary.
        
        Args:
            messages: All messages from the session
            topic: The session topic
            duration_minutes: Session duration
            
        Returns:
            Formatted prompt for generating a session summary
        """
        conversation = "\n".join([
            f"{'Student' if msg['role'] == 'user' else 'Tutor'}: {msg['content']}"
            for msg in messages
        ])
        
        prompt = f"""Summarize this learning session for the student.

Topic: {topic}
Duration: {duration_minutes} minutes
Number of exchanges: {len(messages) // 2}

Conversation:
{conversation}

Create a summary that includes:
1. Key concepts covered
2. Main questions explored
3. Important insights or "aha" moments
4. Areas that might need more practice
5. Suggested next topics to explore

Keep the summary encouraging and focused on learning progress."""
        
        return prompt

    @staticmethod
    def multimedia_content_prompt(topic: str, content_type: str) -> str:
        """
        Generate prompts for specific multimedia content types.
        
        Args:
            topic: The topic to create content for
            content_type: Type of content (image, video, audio, interactive, wolfram)
            
        Returns:
            Formatted prompt for generating multimedia suggestions
        """
        prompts = {
            "image": f"""Suggest 3-5 specific images or diagrams that would help explain: {topic}

For each image, provide:
1. Description of what the image should show
2. Why this visual is helpful for understanding
3. Key elements to focus on in the image
4. Search terms to find this image

Format as JSON:
[
  {{
    "description": "What the image shows",
    "purpose": "Why it helps learning",
    "key_elements": ["element1", "element2"],
    "search_terms": "search query"
  }}
]""",
            
            "video": f"""Recommend 3-5 YouTube videos or video topics for learning: {topic}

For each video recommendation:
1. Suggested search query or video title
2. What the video should cover
3. Ideal video length (short/medium/long)
4. Why this video would be helpful
5. What to focus on while watching

Format as JSON:
[
  {{
    "search_query": "YouTube search terms",
    "content_focus": "What the video should teach",
    "duration": "5-10 minutes",
    "learning_value": "Why watch this",
    "key_points": ["point1", "point2"]
  }}
]""",
            
            "wolfram": f"""Generate 3-5 Wolfram Alpha queries to explore: {topic}

For each query:
1. The exact Wolfram Alpha query
2. What it will compute or visualize
3. What insights students will gain
4. How to interpret the results

Format as JSON:
[
  {{
    "query": "Wolfram Alpha query",
    "computes": "What it calculates/shows",
    "insights": "What students learn",
    "interpretation": "How to read results"
  }}
]""",
            
            "audio": f"""Suggest audio-based learning activities for: {topic}

For each activity:
1. What audio content to create/find
2. How it enhances understanding
3. Listening instructions
4. Follow-up activities

Format as JSON:
[
  {{
    "audio_content": "What to listen to",
    "purpose": "How it helps",
    "instructions": "How to use it",
    "follow_up": "What to do after"
  }}
]""",
            
            "interactive": f"""Design 3-5 interactive activities or experiments for: {topic}

For each activity:
1. Clear instructions
2. Materials needed (if any)
3. Expected outcomes
4. Learning objectives
5. Reflection questions

Format as JSON:
[
  {{
    "title": "Activity name",
    "instructions": "Step by step guide",
    "materials": ["item1", "item2"],
    "outcomes": "What students will observe",
    "objectives": "What they'll learn",
    "reflection": ["question1", "question2"]
  }}
]"""
        }
        
        return prompts.get(content_type, prompts["image"])
    
    @staticmethod
    def interactive_lesson_prompt(topic: str, duration_minutes: int = 30) -> str:
        """
        Generate a complete interactive lesson plan with multimedia elements.
        
        Args:
            topic: The topic to teach
            duration_minutes: Lesson duration
            
        Returns:
            Formatted prompt for creating an interactive lesson
        """
        prompt = f"""Create a {duration_minutes}-minute interactive lesson plan for: {topic}

Design a MULTIMEDIA, INTERACTIVE learning experience that includes:

1. **Introduction (5 min)**
   - Hook to grab attention
   - Learning objectives
   - [IMAGE: relevant visual to introduce topic]

2. **Core Content (15 min)**
   - Main concepts explained clearly
   - [VIDEO: YouTube video recommendation]
   - [WOLFRAM: calculation or visualization]
   - Real-world examples
   - [IMAGE: diagram or illustration]

3. **Interactive Practice (7 min)**
   - [INTERACTIVE: hands-on activity]
   - Practice problems or exercises
   - Immediate feedback

4. **Assessment & Wrap-up (3 min)**
   - Quick quiz questions
   - Summary of key points
   - Next steps for learning

For EACH multimedia element, provide:
- Specific description or query
- How it connects to the learning objective
- When to use it in the lesson

Format your response with clear sections and multimedia tags:
[IMAGE: ...], [VIDEO: ...], [WOLFRAM: ...], [AUDIO: ...], [INTERACTIVE: ...]"""
        
        return prompt
    
    @staticmethod
    def concept_visualization_prompt(concept: str) -> str:
        """
        Generate prompts for visualizing abstract concepts.
        
        Args:
            concept: The concept to visualize
            
        Returns:
            Formatted prompt for creating visualizations
        """
        prompt = f"""Help visualize and make concrete this abstract concept: {concept}

Provide multiple visualization approaches:

1. **Visual Metaphor**
   - [IMAGE: description of metaphorical image]
   - Explanation of how the metaphor works

2. **Diagram/Chart**
   - [IMAGE: technical diagram description]
   - Key components and relationships

3. **Real-World Example**
   - Concrete scenario demonstrating the concept
   - [IMAGE: photo or illustration of example]

4. **Interactive Demonstration**
   - [INTERACTIVE: hands-on way to experience concept]
   - What students will discover

5. **Mathematical/Scientific Representation**
   - [WOLFRAM: query to show mathematical form]
   - How the formula/equation relates to concept

Make the abstract TANGIBLE and MEMORABLE through multiple sensory channels."""
        
        return prompt
    
    @staticmethod
    def multimodal_explanation_prompt(concept: str, learning_style: str = "mixed") -> str:
        """
        Generate explanations tailored to different learning styles.
        
        Args:
            concept: The concept to explain
            learning_style: visual, auditory, kinesthetic, or mixed
            
        Returns:
            Formatted prompt for multimodal explanations
        """
        style_instructions = {
            "visual": """Focus on VISUAL learning:
- [IMAGE: multiple diagrams and illustrations]
- Color-coded explanations
- Spatial relationships and patterns
- Charts, graphs, and visual models
- Mind maps and concept maps""",
            
            "auditory": """Focus on AUDITORY learning:
- [AUDIO: pronunciation or sound examples]
- [VIDEO: lectures and verbal explanations]
- Rhythmic or musical mnemonics
- Discussion prompts
- Read-aloud friendly text with emphasis""",
            
            "kinesthetic": """Focus on HANDS-ON learning:
- [INTERACTIVE: physical activities and experiments]
- Step-by-step practice exercises
- Real-world applications to try
- Movement-based learning
- Build/create something related to concept""",
            
            "mixed": """Use ALL learning modalities:
- [IMAGE: visual representations]
- [VIDEO: video explanations]
- [AUDIO: audio elements]
- [INTERACTIVE: hands-on activities]
- [WOLFRAM: interactive computations]
- Text explanations with examples"""
        }
        
        instruction = style_instructions.get(learning_style, style_instructions["mixed"])
        
        prompt = f"""Explain this concept using a {learning_style} learning approach: {concept}

{instruction}

Create a rich, multi-sensory learning experience that engages students through 
their preferred learning style. Include specific multimedia elements with the 
format tags: [IMAGE: ...], [VIDEO: ...], [AUDIO: ...], [INTERACTIVE: ...], [WOLFRAM: ...]"""
        
        return prompt

    @staticmethod
    def understanding_check_prompt(concept: str, previous_explanation: str) -> str:
        """
        Generate a prompt to check if student understood the concept.
        
        Args:
            concept: The concept that was just explained
            previous_explanation: The explanation that was given
            
        Returns:
            Formatted prompt for checking understanding
        """
        prompt = f"""You just explained this concept: {concept}

Your explanation was:
{previous_explanation}

Now create a VERIFICATION QUESTION to check if the student truly understood.

The question should:
1. Require them to APPLY the concept (not just repeat it)
2. Be specific and clear
3. Have a definite correct answer
4. Reveal if they truly understood or just memorized

Examples of good verification questions:
- "Can you explain why [X] happens in your own words?"
- "If I change [X], what would happen to [Y]?"
- "Can you give me an example of [concept] in real life?"
- "What's the difference between [A] and [B]?"
- "How would you solve this problem: [specific problem]?"

Generate ONE clear verification question that tests true understanding."""
        
        return prompt
    
    @staticmethod
    def reteach_prompt(concept: str, previous_explanation: str, 
                      student_confusion: str = None) -> str:
        """
        Generate a prompt to re-teach a concept in a different way.
        
        Args:
            concept: The concept to re-teach
            previous_explanation: The previous explanation that didn't work
            student_confusion: Optional description of what confused them
            
        Returns:
            Formatted prompt for re-teaching
        """
        confusion_context = f"\n\nWhat confused them: {student_confusion}" if student_confusion else ""
        
        prompt = f"""A student didn't understand your explanation of: {concept}

Your previous explanation:
{previous_explanation}{confusion_context}

Now RE-TEACH this concept using a COMPLETELY DIFFERENT approach:

🔄 DIFFERENT APPROACHES TO TRY:
1. **Different Analogy**: If you used one analogy, try a completely different one
2. **Different Medium**: 
   - If you used text → try [IMAGE: ...] or [VIDEO: ...]
   - If you used diagram → try [INTERACTIVE: ...] or real-world example
   - If you used math → try visual or physical analogy
3. **Different Level**: Break it down into even simpler pieces
4. **Different Perspective**: Explain from a different angle
5. **Different Example**: Use a more relatable, concrete example

REQUIREMENTS:
- Use AT LEAST ONE multimedia element (different from before if possible)
- Make it SIMPLER and more CONCRETE
- Connect to something they definitely already know
- Use everyday language, avoid jargon
- End with: "Does this way of thinking about it make more sense?"

Create a fresh, engaging explanation that approaches the concept from a new angle."""
        
        return prompt
    
    @staticmethod
    def feedback_prompt(concept: str, student_answer: str, 
                       correct_answer: str = None) -> str:
        """
        Generate a prompt to provide feedback on student's answer.
        
        Args:
            concept: The concept being tested
            student_answer: What the student answered
            correct_answer: Optional correct answer for comparison
            
        Returns:
            Formatted prompt for providing feedback
        """
        correct_context = f"\n\nCorrect answer: {correct_answer}" if correct_answer else ""
        
        prompt = f"""Evaluate this student's answer about: {concept}

Student's answer: {student_answer}{correct_context}

Provide feedback that:

✅ If CORRECT:
1. Celebrate their understanding enthusiastically
2. Highlight what they did well
3. Add one interesting related insight
4. Ask if they want to learn the next concept or go deeper
5. Format: "Excellent! You got it! [specific praise]. [insight]. Ready to move on?"

⚠️ If PARTIALLY CORRECT:
1. Acknowledge what they got right
2. Gently point out what's missing or incorrect
3. Provide a hint or clarification
4. Give them another chance to complete/correct their answer
5. Format: "You're on the right track! [what's correct]. However, [what needs work]. [hint]"

❌ If INCORRECT:
1. Stay encouraging: "Not quite, but good try!"
2. Identify the specific misconception
3. Provide a brief clarification
4. Offer to re-explain the concept
5. Format: "Not quite. I think the confusion is [misconception]. Would you like me to explain [concept] again in a different way?"

Be specific, constructive, and encouraging. Help them learn from mistakes."""
        
        return prompt
    
    @staticmethod
    def socratic_prompt(topic: str, student_level: str = "intermediate") -> str:
        """
        Generate a Socratic teaching prompt that guides through questions.
        
        Args:
            topic: The topic to teach
            student_level: Student's level (beginner, intermediate, advanced)
            
        Returns:
            Formatted prompt for Socratic teaching
        """
        prompt = f"""Teach this topic using the SOCRATIC METHOD: {topic}
Student level: {student_level}

🎓 SOCRATIC TEACHING APPROACH:
Instead of directly explaining, GUIDE the student to discover the concept themselves through questions.

STRUCTURE:
1. **Start with what they know**: Ask about related concepts they're familiar with
2. **Guide with questions**: Ask questions that lead them toward the answer
3. **Build progressively**: Each question builds on the previous answer
4. **Encourage thinking**: "What do you think?", "Why might that be?"
5. **Confirm discoveries**: When they figure something out, celebrate it!
6. **Use multimedia**: Include [IMAGE:], [VIDEO:], [INTERACTIVE:] to support discovery

EXAMPLE FLOW:
- "Before we dive into [topic], what do you know about [related concept]?"
- [Student answers]
- "Interesting! Now, what do you think would happen if [scenario]?"
- [Student answers]
- "Exactly! So if that's true, what does that tell us about [topic]?"
- [Guide them to discover the concept]

RULES:
- Ask ONE question at a time
- Wait for their answer before proceeding
- If they're stuck, provide a hint, not the answer
- Celebrate when they figure things out
- Use multimedia to provide clues

Start the Socratic dialogue now with your first guiding question."""
        
        return prompt
    
    @staticmethod
    def progressive_difficulty_prompt(concept: str, current_level: int, 
                                     max_level: int = 5) -> str:
        """
        Generate a prompt for teaching with progressive difficulty.
        
        Args:
            concept: The concept to teach
            current_level: Current difficulty level (1-5)
            max_level: Maximum difficulty level
            
        Returns:
            Formatted prompt for progressive teaching
        """
        level_descriptions = {
            1: "BEGINNER - Basic definition and simple example",
            2: "ELEMENTARY - How it works with visual aids",
            3: "INTERMEDIATE - Applications and problem-solving",
            4: "ADVANCED - Complex scenarios and edge cases",
            5: "EXPERT - Deep theory and advanced applications"
        }
        
        current_desc = level_descriptions.get(current_level, "INTERMEDIATE")
        
        prompt = f"""Teach this concept at LEVEL {current_level}/{max_level}: {concept}

Current level: {current_desc}

📊 PROGRESSIVE TEACHING STRATEGY:

LEVEL {current_level} REQUIREMENTS:
"""
        
        if current_level == 1:
            prompt += """- Simple, clear definition in everyday language
- ONE concrete, relatable example
- [IMAGE: simple diagram or illustration]
- Avoid technical jargon
- Check: "Does this basic idea make sense?"
"""
        elif current_level == 2:
            prompt += """- Explain HOW it works (mechanism/process)
- [IMAGE: diagram showing the process]
- 2-3 examples showing different cases
- Introduce key terminology
- Check: "Can you explain how it works in your own words?"
"""
        elif current_level == 3:
            prompt += """- Show practical applications
- [VIDEO: tutorial or demonstration]
- Practice problem to solve
- Common mistakes to avoid
- Check: "Try solving this problem: [problem]"
"""
        elif current_level == 4:
            prompt += """- Complex scenarios and edge cases
- [WOLFRAM: advanced computation or visualization]
- Multiple interconnected concepts
- Why certain approaches work better
- Check: "What would happen in this scenario: [complex scenario]?"
"""
        else:  # Level 5
            prompt += """- Deep theoretical understanding
- [WOLFRAM: advanced mathematical representation]
- Research-level applications
- Connections to other advanced topics
- Open-ended exploration
- Check: "How would you apply this to [advanced problem]?"
"""
        
        prompt += f"""
After teaching at this level:
1. Check if they understood
2. If YES and level < {max_level}: Offer to go deeper (next level)
3. If NO: Re-teach at same level differently
4. If YES and level = {max_level}: Celebrate mastery!

Teach at Level {current_level} now."""
        
        return prompt
