"""
Prompt builder for Gemini workout generation.
Creates structured prompts that enforce safety and format constraints.
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
    Builds a STRICT prompt for Gemini API.
    Gemini is NOT allowed to override difficulty decisions.

    Args:
        difficulty: Pre-determined difficulty level ("low", "medium", "high")
        energy_level: User's energy level ("low", "medium", "high")
        time_available: Minutes available for workout
        location: Where the workout will take place
        ai_state: AI state containing decision reasoning
        goal: User's fitness goal
        injuries: Any injuries to account for

    Returns:
        Formatted prompt string for Gemini
    """

    reasons = ai_state.get("last_decision", {}).get("reason", [])
    if not reasons:
        reasons = ["maintaining current level"]

    trend = ai_state.get("trend", "stable")

    return f"""You are a professional fitness coach AI.

Your task: Generate a SAFE, BODYWEIGHT workout plan.

CONTEXT (DO NOT QUESTION OR CHANGE):
- Difficulty level: {difficulty}
- Energy level: {energy_level}
- Time available: {time_available} minutes
- Location: {location}
- User goal: {goal}
- Injuries/limitations: {injuries}
- User trend: {trend}
- Reason for difficulty: {", ".join(reasons)}

STRICT RULES:
1. DO NOT change the difficulty level
2. DO NOT include dangerous movements
3. DO NOT require any equipment
4. All exercises must be beginner-safe even at high difficulty
5. NO medical advice
6. NO markdown formatting
7. NO explanations outside JSON
8. Respect time constraint ({time_available} minutes total)

DIFFICULTY GUIDELINES:
- low → Easy movements, long rest (60-90s), lower reps (8-10)
- medium → Moderate reps (12-15), controlled rest (45-60s)
- high → Higher reps (15-20), circuits, minimal rest (30-45s)

OUTPUT FORMAT (JSON ONLY):
{{
  "warmup": [
    {{"exercise": "Exercise name", "duration": "X min"}}
  ],
  "main": [
    {{"exercise": "Exercise name", "sets": 3, "reps": 10, "rest_seconds": 60}}
  ],
  "cooldown": [
    {{"exercise": "Exercise name", "duration": "X min"}}
  ]
}}

Generate the workout now."""


def validate_workout_response(workout: Dict) -> bool:
    """
    Validate that the workout response has the correct structure.

    Args:
        workout: Parsed workout dictionary

    Returns:
        True if valid, False otherwise
    """
    required_keys = ["warmup", "main", "cooldown"]

    if not all(key in workout for key in required_keys):
        return False

    # Check warmup structure
    if not isinstance(workout["warmup"], list):
        return False
    for exercise in workout["warmup"]:
        if not isinstance(exercise, dict) or "exercise" not in exercise or "duration" not in exercise:
            return False

    # Check main workout structure
    if not isinstance(workout["main"], list):
        return False
    for exercise in workout["main"]:
        if not isinstance(exercise, dict):
            return False
        required_exercise_keys = ["exercise", "sets", "reps", "rest_seconds"]
        if not all(key in exercise for key in required_exercise_keys):
            return False

    # Check cooldown structure
    if not isinstance(workout["cooldown"], list):
        return False
    for exercise in workout["cooldown"]:
        if not isinstance(exercise, dict) or "exercise" not in exercise or "duration" not in exercise:
            return False

    return True