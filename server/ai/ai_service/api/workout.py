from fastapi import APIRouter
from uuid import UUID

from schemas.ai_schemas import GenerateWorkoutRequest, GenerateWorkoutResponse
from ai_logic.difficulty_engine import adapt_difficulty
from ai_logic.workout_generator import generate_workout_llm
from ai_logic.pattern_analysis import analyze_patterns

from data_layer.ai_state_repo import get_ai_state, save_ai_state
from data_layer.workout_repo import get_workout_history

router = APIRouter()

@router.post("/generate-workout", response_model=GenerateWorkoutResponse)
async def generate_today_workout(request: GenerateWorkoutRequest):
    user_id_str = str(request.user_id)

    ai_state = await get_ai_state(user_id_str)
    history = await get_workout_history(request.user_id)

    decision = adapt_difficulty(
        ai_state=ai_state,
        workout_history=history,
        energy_level=request.energy_level
    )

    # FIX: Added 'await' to the generator call
    workout = await generate_workout_llm(
        difficulty=decision["difficulty"],
        goal=request.goal,
        injuries=", ".join(request.injuries),  # Pydantic list to str
        location=request.location,
        time_available=request.time_available,
        patterns=decision["ai_state"],
        energy_level=request.energy_level
    )

    await save_ai_state(user_id_str, decision["ai_state"])

    return {
        "difficulty": decision["difficulty"],
        "workout": workout,
        "ai_state": decision["ai_state"]
    }