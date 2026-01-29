"""
Workout completion endpoint for recording user feedback.
"""

from fastapi import APIRouter, HTTPException
from schemas.ai_schemas import CompleteWorkoutRequest, CompleteWorkoutResponse
from ai_logic.feedback_engine import update_feedback
from data_layer.ai_state_repo import get_ai_state, save_ai_state
from data_layer.workout_repo import save_workout
from uuid import UUID

router = APIRouter(prefix="/workout", tags=["Workout"])


@router.post("/complete", response_model=CompleteWorkoutResponse)
async def complete_workout(request: CompleteWorkoutRequest):
    """
    Record workout completion and update AI state.

    Args:
        request: Workout completion request

    Returns:
        Status and updated AI state summary
    """
    user_id_str = str(request.user_id)

    # Get current AI state
    try:
        ai_state = await get_ai_state(user_id_str)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve AI state: {str(e)}"
        )

    # Update AI state with feedback
    try:
        ai_state = update_feedback(
            ai_state,
            {
                "difficulty": request.difficulty,
                "completed": request.completed
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update feedback: {str(e)}"
        )

    # Save updated AI state
    try:
        await save_ai_state(user_id_str, ai_state)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save AI state: {str(e)}"
        )

    # Save workout record
    try:
        await save_workout(
            user_id=request.user_id,
            completed=request.completed,
            difficulty=request.difficulty
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save workout: {str(e)}"
        )

    return CompleteWorkoutResponse(
        status="recorded",
        message="Workout completion recorded successfully"
    )