"""
Workout generator that combines AI logic with LLM generation.
Main entry point for workout creation.
"""

from typing import Dict


async def generate_workout_llm(
    difficulty: str,
    energy_level: str,
    time_available: int,
    location: str,
    ai_state: Dict,
    goal: str = "general fitness",
    injuries: str = "none"
) -> Dict:
    """
    Generate a workout using Gemini LLM.

    Args:
        difficulty: Pre-determined difficulty level
        energy_level: User's energy level
        time_available: Minutes available
        location: Workout location
        ai_state: Current AI state with decision reasoning
        goal: User's fitness goal
        injuries: Any injuries or limitations

    Returns:
        Workout dictionary with warmup, main, and cooldown sections
    """
    # Import here to avoid circular dependencies
    from ai_logic.gemini_client import call_gemini_with_fallback
    from ai_logic.gemini_prompt import build_workout_prompt, validate_workout_response
    from ai_logic.fallback_workout import fallback_workout

    # Build the prompt
    prompt = build_workout_prompt(
        difficulty=difficulty,
        energy_level=energy_level,
        time_available=time_available,
        location=location,
        ai_state=ai_state,
        goal=goal,
        injuries=injuries
    )

    # Try to get workout from Gemini
    try:
        workout = await call_gemini_with_fallback(
            prompt=prompt,
            fallback_response=fallback_workout(difficulty)
        )

        # Validate the response structure
        if not validate_workout_response(workout):
            print("Warning: Invalid workout structure, using fallback")
            return fallback_workout(difficulty)

        return workout

    except Exception as e:
        print(f"Error generating workout: {e}")
        return fallback_workout(difficulty)


def generate_workout_sync(
    difficulty: str,
    energy_level: str = "medium",
    time_available: int = 30,
    location: str = "home",
    ai_state: Dict = None,
    goal: str = "general fitness",
    injuries: str = "none"
) -> Dict:
    """
    Synchronous wrapper for workout generation (for testing).

    Args:
        difficulty: Pre-determined difficulty level
        energy_level: User's energy level
        time_available: Minutes available
        location: Workout location
        ai_state: Current AI state
        goal: User's fitness goal
        injuries: Any injuries or limitations

    Returns:
        Workout dictionary
    """
    import asyncio

    if ai_state is None:
        from memory_engine import initialize_ai_state
        ai_state = initialize_ai_state()

    return asyncio.run(
        generate_workout_llm(
            difficulty=difficulty,
            energy_level=energy_level,
            time_available=time_available,
            location=location,
            ai_state=ai_state,
            goal=goal,
            injuries=injuries
        )
    )