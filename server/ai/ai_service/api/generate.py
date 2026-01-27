"""
Workout generation endpoint - main entry point for creating personalized workouts.
"""

from fastapi import APIRouter, HTTPException
from schemas.ai_schemas import GenerateWorkoutRequest, GenerateWorkoutResponse
from ai_logic.difficulty_engine import adapt_difficulty
from ai_logic.workout_generator import generate_workout_llm
from ai_logic.pattern_analysis import analyze_patterns
from data_layer.ai_state_repo import get_ai_state, save_ai_state
from data_layer.workout_repo import get_workout_history

router = APIRouter(prefix="/workout", tags=["Workout"])


@router.post("/generate", response_model=GenerateWorkoutResponse)
async def generate_workout(request: GenerateWorkoutRequest):
    """
    Generate a personalized workout based on user state and preferences.

    Args:
        request: Workout generation request with user preferences

    Returns:
        Generated workout with difficulty and AI state
    """
    user_id_str = str(request.user_id)

    # Load user's AI state
    try:
        ai_state = await get_ai_state(user_id_str)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve AI state: {str(e)}"
        )

    # Load workout history
    try:
        history = await get_workout_history(request.user_id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve workout history: {str(e)}"
        )

    # Decide difficulty using deterministic AI logic
    try:
        result = adapt_difficulty(
            ai_state=ai_state,
            workout_history=history,
            energy_level=request.energy_level
        )
        difficulty = result["difficulty"]
        ai_state = result["ai_state"]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to adapt difficulty: {str(e)}"
        )

    # Analyze patterns for additional context
    try:
        ai_state = analyze_patterns(history, ai_state)
    except Exception as e:
        # Pattern analysis failure shouldn't block workout generation
        print(f"Warning: Pattern analysis failed: {e}")

    # Generate workout using LLM
    try:
        workout = await generate_workout_llm(
            difficulty=difficulty,
            energy_level=request.energy_level,
            time_available=request.time_available,
            location=request.location,
            ai_state=ai_state,
            goal=request.goal,
            injuries=", ".join(request.injuries) if request.injuries else "none"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate workout: {str(e)}"
        )

    # Persist updated AI state
    try:
        await save_ai_state(user_id_str, ai_state)
    except Exception as e:
        # Log error but don't fail the request
        print(f"Warning: Failed to save AI state: {e}")

    return GenerateWorkoutResponse(
        difficulty=difficulty,
        workout=workout,
        ai_state=ai_state
    )