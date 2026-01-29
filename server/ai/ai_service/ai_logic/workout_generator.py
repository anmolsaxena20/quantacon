"""
Enhanced workout generator that uses improved Gemini prompting.
"""

from typing import Dict
from gemini_client_enhanced import generate_workout_with_ai, test_gemini_connection
from fallback_workout import fallback_workout


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
    Generate a workout using enhanced Gemini LLM with comprehensive prompting.

    This function uses the advanced prompt system that considers:
    - Pre-determined difficulty from AI logic
    - User's current energy level
    - Time constraints
    - Location and equipment availability
    - Fitness goals
    - Injuries and limitations
    - AI state reasoning (why this difficulty was chosen)
    - User's consistency and trend

    Args:
        difficulty: Pre-determined difficulty level ("low", "medium", "high")
        energy_level: User's energy level ("low", "medium", "high")
        time_available: Minutes available for workout
        location: Where the workout will take place
        ai_state: Current AI state with decision reasoning
        goal: User's fitness goal
        injuries: Any injuries or limitations (comma-separated string or "none")

    Returns:
        Workout dictionary with warmup, main, and cooldown sections
    """

    try:
        # Generate workout using enhanced AI
        workout = await generate_workout_with_ai(
            difficulty=difficulty,
            energy_level=energy_level,
            time_available=time_available,
            location=location,
            ai_state=ai_state,
            goal=goal,
            injuries=injuries
        )

        # Add metadata
        workout["_metadata"] = {
            "generated_by": "gemini_ai",
            "difficulty": difficulty,
            "energy_level": energy_level,
            "time_available": time_available,
            "location": location,
            "goal": goal,
            "injuries": injuries
        }

        return workout

    except Exception as e:
        print(f"Error in workout generation: {e}")
        print("Falling back to pre-defined workout")

        # Return fallback workout
        fallback = fallback_workout(difficulty)
        fallback["_metadata"] = {
            "generated_by": "fallback",
            "reason": str(e),
            "difficulty": difficulty
        }
        return fallback


async def generate_workout_batch(
    user_data_list: list[Dict]
) -> list[Dict]:
    """
    Generate multiple workouts in batch for efficiency.

    Useful for pre-generating weekly workout plans.

    Args:
        user_data_list: List of user data dictionaries

    Returns:
        List of generated workouts
    """
    workouts = []

    for user_data in user_data_list:
        try:
            workout = await generate_workout_llm(
                difficulty=user_data.get("difficulty", "medium"),
                energy_level=user_data.get("energy_level", "medium"),
                time_available=user_data.get("time_available", 30),
                location=user_data.get("location", "home"),
                ai_state=user_data.get("ai_state", {}),
                goal=user_data.get("goal", "general fitness"),
                injuries=user_data.get("injuries", "none")
            )
            workouts.append(workout)
        except Exception as e:
            print(f"Error generating workout in batch: {e}")
            workouts.append(fallback_workout(user_data.get("difficulty", "medium")))

    return workouts


async def regenerate_workout(
    previous_workout: Dict,
    feedback: str = None
) -> Dict:
    """
    Regenerate a workout based on feedback.

    Args:
        previous_workout: The previous workout that needs adjustment
        feedback: User feedback (e.g., "too hard", "too easy", "more cardio")

    Returns:
        New workout incorporating feedback
    """
    from gemini_client_enhanced import call_gemini

    metadata = previous_workout.get("_metadata", {})
    difficulty = metadata.get("difficulty", "medium")

    # Adjust difficulty based on feedback
    if feedback and "hard" in feedback.lower():
        difficulty = "low" if difficulty == "medium" else "medium"
    elif feedback and "easy" in feedback.lower():
        difficulty = "high" if difficulty == "medium" else "medium"

    # Generate new workout
    return await generate_workout_llm(
        difficulty=difficulty,
        energy_level=metadata.get("energy_level", "medium"),
        time_available=metadata.get("time_available", 30),
        location=metadata.get("location", "home"),
        ai_state=metadata.get("ai_state", {}),
        goal=metadata.get("goal", "general fitness"),
        injuries=metadata.get("injuries", "none")
    )


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


async def test_workout_generation():
    """
    Test workout generation with sample data.
    """
    print("Testing Gemini connection...")
    connected = await test_gemini_connection()

    if not connected:
        print("❌ Gemini connection failed")
        return False

    print("✓ Gemini connection successful")

    print("\nTesting workout generation...")
    from memory_engine import initialize_ai_state

    ai_state = initialize_ai_state()
    ai_state["last_decision"] = {
        "difficulty": "medium",
        "reason": ["Testing workout generation"],
        "timestamp": "2024-01-27T10:00:00Z"
    }

    try:
        workout = await generate_workout_llm(
            difficulty="medium",
            energy_level="high",
            time_available=30,
            location="home",
            ai_state=ai_state,
            goal="general fitness",
            injuries="none"
        )

        print("✓ Workout generated successfully")
        print(f"  - Warmup exercises: {len(workout.get('warmup', []))}")
        print(f"  - Main exercises: {len(workout.get('main', []))}")
        print(f"  - Cooldown exercises: {len(workout.get('cooldown', []))}")

        return True

    except Exception as e:
        print(f"❌ Workout generation failed: {e}")
        return False


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_workout_generation())