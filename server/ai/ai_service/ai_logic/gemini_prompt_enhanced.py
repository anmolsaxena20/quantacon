"""
Enhanced Gemini prompt builder with comprehensive workout generation.
Optimized for gemini-2.5-flash model.
"""

from typing import Dict, List


def build_workout_prompt(
        difficulty: str,
        energy_level: str,
        time_available: int,
        location: str,
        ai_state: Dict,
        goal: str = "general fitness",
        injuries: str = "none"
) -> str:
    """
    Build a comprehensive, detailed prompt for Gemini workout generation.

    Args:
        difficulty: Pre-determined difficulty level ("low", "medium", "high")
        energy_level: User's current energy level
        time_available: Minutes available for workout
        location: Where the workout will take place
        ai_state: Current AI state with decision reasoning
        goal: User's fitness goal
        injuries: Any injuries or limitations

    Returns:
        Formatted prompt string for Gemini
    """

    # Extract AI state info
    reasons = ai_state.get("last_decision", {}).get("reason", ["adaptive difficulty"])
    trend = ai_state.get("trend", "stable")
    consistency = ai_state.get("consistency_score", 0.5)

    # Difficulty specifications
    difficulty_specs = {
        "low": {"sets": "2-3", "reps": "8-10", "rest": "60-90s", "intensity": "Light"},
        "medium": {"sets": "3-4", "reps": "10-15", "rest": "45-60s", "intensity": "Moderate"},
        "high": {"sets": "4-5", "reps": "15-20", "rest": "30-45s", "intensity": "High"}
    }

    specs = difficulty_specs.get(difficulty, difficulty_specs["medium"])

    # Location context
    location_equipment = {
        "home": "No equipment - bodyweight only",
        "gym": "Full gym equipment available",
        "outdoor": "Outdoor with benches/stairs",
        "park": "Open space with natural features"
    }

    location_info = location_equipment.get(location.lower(), "Bodyweight exercises")

    return f"""You are an expert fitness coach creating a {difficulty.upper()} difficulty workout.

USER PROFILE:
- Difficulty: {difficulty.upper()} (Reason: {', '.join(reasons[:2])})
- Energy: {energy_level.upper()}
- Time: {time_available} minutes (STRICT - must fit)
- Location: {location} ({location_info})
- Goal: {goal}
- Injuries: {injuries}
- Trend: {trend} (consistency: {consistency:.0%})

WORKOUT SPECIFICATIONS FOR {difficulty.upper()}:
- Sets: {specs['sets']}
- Reps: {specs['reps']}
- Rest: {specs['rest']}
- Intensity: {specs['intensity']}

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no explanations
2. Keep all text fields under 50 words to avoid cutoff
3. MUST include warmup, main, and cooldown sections
4. Time must fit within {time_available} minutes total
5. Respect {difficulty} difficulty - don't make it harder/easier
6. If injuries specified, avoid those movement patterns completely

REQUIRED JSON STRUCTURE:
{{
  "warmup": [
    {{
      "exercise": "Exercise name",
      "duration": "2 min",
      "instructions": "Brief how-to",
      "focus": "What this prepares"
    }}
  ],
  "main": [
    {{
      "exercise": "Exercise name",
      "sets": {specs['sets'].split('-')[0]},
      "reps": {specs['reps'].split('-')[0]},
      "rest_seconds": {specs['rest'].split('-')[0].replace('s', '')},
      "instructions": "Clear form cues",
      "target_muscles": ["muscle1", "muscle2"]
    }}
  ],
  "cooldown": [
    {{
      "exercise": "Stretch name",
      "duration": "2 min",
      "instructions": "How to stretch"
    }}
  ]
}}

Generate the workout now:"""


def build_coach_prompt(exercise: str, user_context: Dict) -> str:
    """
    Build prompt for AI Coach feature (conversational guidance).

    Args:
        exercise: The exercise to explain
        user_context: User context including fitness level, injuries, etc.

    Returns:
        Prompt for conversational AI coach
    """

    difficulty = user_context.get("difficulty", "medium")
    injuries = user_context.get("injuries", "none")
    additional = user_context.get("additional_context", "")

    return f"""You are a supportive fitness coach providing guidance for {exercise}.

USER CONTEXT:
- Fitness level: {difficulty}
- Injuries/concerns: {injuries}
{f"- Additional context: {additional}" if additional else ""}

Provide coaching in 2-3 paragraphs covering:
1. How to perform {exercise} properly (form, positioning)
2. Key tips and common mistakes to avoid
3. Breathing technique
{f"4. Modifications for {injuries}" if injuries != "none" else ""}

Keep it conversational, encouraging, and practical. Max 300 words."""


def validate_workout_response(workout: Dict) -> bool:
    """
    Validate that the workout response has the correct structure.

    Args:
        workout: Parsed workout dictionary from Gemini

    Returns:
        True if valid, False otherwise
    """
    if not workout or not isinstance(workout, dict):
        print("❌ Validation failed: Not a dict or empty")
        return False

    # Check required sections exist
    required_sections = ["main"]  # warmup and cooldown are optional but recommended
    for section in required_sections:
        if section not in workout:
            print(f"❌ Validation failed: Missing '{section}' section")
            return False

    # Validate main section
    main_workout = workout.get("main", [])
    if not isinstance(main_workout, list):
        print("❌ Validation failed: 'main' is not a list")
        return False

    if len(main_workout) < 1:
        print("❌ Validation failed: 'main' section is empty")
        return False

    # Validate each exercise in main
    for i, exercise in enumerate(main_workout):
        if not isinstance(exercise, dict):
            print(f"❌ Validation failed: Exercise {i} is not a dict")
            return False

        required_fields = ["exercise", "sets", "reps", "rest_seconds"]
        for field in required_fields:
            if field not in exercise:
                print(f"❌ Validation failed: Exercise {i} missing '{field}'")
                return False

        # Type validation
        if not isinstance(exercise.get("sets"), int) or exercise.get("sets") < 1:
            print(f"❌ Validation failed: Exercise {i} has invalid 'sets'")
            return False

        if not isinstance(exercise.get("rest_seconds"), int) or exercise.get("rest_seconds") < 0:
            print(f"❌ Validation failed: Exercise {i} has invalid 'rest_seconds'")
            return False

    # Ensure warmup and cooldown sections exist (create empty if missing)
    for section in ["warmup", "cooldown"]:
        if section not in workout:
            workout[section] = []
        elif not isinstance(workout[section], list):
            workout[section] = []

    print(f"✅ Validation passed: {len(main_workout)} main exercises")
    return True


def extract_json_from_text(text: str) -> str:
    """
    Extract JSON from text that might have markdown or extra content.

    Args:
        text: Text that might contain JSON

    Returns:
        Extracted JSON string
    """
    import re

    # Remove markdown code blocks
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)

    # Find JSON object (first { to last })
    start = text.find('{')
    end = text.rfind('}')

    if start != -1 and end != -1 and end > start:
        return text[start:end + 1]

    return text


# Example prompts for testing
def get_test_prompt() -> str:
    """Get a simple test prompt to verify API is working."""
    return """Create a simple JSON workout with:
- 1 warmup exercise
- 2 main exercises
- 1 cooldown exercise

Use this exact structure:
{
  "warmup": [{"exercise": "Jumping Jacks", "duration": "2 min"}],
  "main": [
    {"exercise": "Push-ups", "sets": 3, "reps": 10, "rest_seconds": 60},
    {"exercise": "Squats", "sets": 3, "reps": 12, "rest_seconds": 60}
  ],
  "cooldown": [{"exercise": "Stretching", "duration": "3 min"}]
}"""


if __name__ == "__main__":
    # Test prompt generation
    test_ai_state = {
        "last_decision": {
            "difficulty": "medium",
            "reason": ["Testing prompt"],
            "timestamp": "2025-01-30"
        },
        "trend": "improving",
        "consistency_score": 0.75
    }

    prompt = build_workout_prompt(
        difficulty="medium",
        energy_level="high",
        time_available=30,
        location="home",
        ai_state=test_ai_state,
        goal="strength",
        injuries="none"
    )

    print("Generated prompt:")
    print(prompt)
    print("\n" + "=" * 50)
    print(f"Prompt length: {len(prompt)} characters")