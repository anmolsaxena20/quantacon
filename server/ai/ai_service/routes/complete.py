"""
Workout completion endpoint for recording user feedback.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from ai_logic.feedback_engine import update_feedback
from data_layer.ai_state_repo import get_ai_state, save_ai_state
from data_layer.workout_repo import save_workout

router = APIRouter(prefix="/workout", tags=["Workout"])


class CompleteWorkoutRequest(BaseModel):
    """Request model for workout completion."""
    user_id: UUID
    completed: bool
    difficulty: str = Field(..., pattern="^(low|medium|high)$")
    feedback: Optional[str] = None
    duration_minutes: Optional[int] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "completed": True,
                "difficulty": "medium",
                "feedback": "Great workout!",
                "duration_minutes": 30
            }
        }


class CompleteWorkoutResponse(BaseModel):
    """Response model for workout completion."""
    status: str
    message: str
    updated_ai_state: Optional[dict] = None

    class Config:
        json_schema_extra = {
            "example": {
                "status": "recorded",
                "message": "Workout completion recorded successfully",
                "updated_ai_state": {
                    "current_difficulty": "medium",
                    "consistency_score": 0.80,
                    "trend": "improving"
                }
            }
        }


@router.post("/complete", response_model=CompleteWorkoutResponse)
async def complete_workout(request: CompleteWorkoutRequest):
    """
    Record workout completion and update AI state.

    This endpoint:
    1. Records the workout completion in the database
    2. Updates the user's AI state with feedback
    3. Adjusts difficulty success rates
    4. Updates consistency scores and trends

    Args:
        request: Workout completion request with feedback

    Returns:
        Status confirmation and updated AI state summary

    Raises:
        HTTPException: If any step fails
    """
    user_id_str = str(request.user_id)

    # Validate difficulty
    if request.difficulty not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=400,
            detail="Difficulty must be 'low', 'medium', or 'high'"
        )

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
        workout_data = {
            "user_id": request.user_id,
            "completed": request.completed,
            "difficulty": request.difficulty
        }

        if request.duration_minutes:
            workout_data["time_available"] = request.duration_minutes

        await save_workout(**workout_data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save workout: {str(e)}"
        )

    # Return summary of updated state
    ai_state_summary = {
        "current_difficulty": ai_state.get("current_difficulty", "medium"),
        "consistency_score": ai_state.get("consistency_score", 0.5),
        "trend": ai_state.get("trend", "stable"),
        "skip_risk": ai_state.get("skip_risk", "low")
    }

    return CompleteWorkoutResponse(
        status="recorded",
        message="Workout completion recorded successfully. Keep up the great work!",
        updated_ai_state=ai_state_summary
    )


@router.get("/history/{user_id}")
async def get_user_workout_history(user_id: str, limit: int = 10):
    """
    Get workout history for a user.

    Args:
        user_id: User's unique identifier
        limit: Maximum number of workouts to return

    Returns:
        List of recent workouts

    Raises:
        HTTPException: If retrieval fails
    """
    from uuid import UUID

    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID format"
        )

    try:
        from data_layer.workout_repo import get_workout_history
        history = await get_workout_history(user_uuid, limit=limit)

        return {
            "user_id": user_id,
            "total_workouts": len(history),
            "workouts": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve workout history: {str(e)}"
        )