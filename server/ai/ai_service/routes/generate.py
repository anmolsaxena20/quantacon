"""
Workout generation endpoint - main entry point for creating personalized workouts.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from ai_logic.difficulty_engine import adapt_difficulty
from ai_logic.pattern_analysis import analyze_patterns
from ai_logic.fallback_workout import fallback_workout
from data_layer.ai_state_repo import get_ai_state, save_ai_state
from data_layer.workout_repo import get_workout_history
from ai_logic.gemini_client_enhanced import generate_workout_with_ai

router = APIRouter(prefix="/workout", tags=["Workout"])


class GenerateWorkoutRequest(BaseModel):
    """Request model for workout generation."""
    user_id: UUID
    energy_level: str = Field(..., pattern="^(low|medium|high)$")
    time_available: int = Field(..., ge=10, le=120)
    location: str = Field(default="home")
    goal: str = Field(default="general fitness")
    injuries: Optional[List[str]] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "energy_level": "medium",
                "time_available": 30,
                "location": "home",
                "goal": "general fitness",
                "injuries": []
            }
        }


class GenerateWorkoutResponse(BaseModel):
    """Response model for workout generation."""
    difficulty: str
    workout: Dict[str, Any]
    ai_state: Dict[str, Any]

    class Config:
        json_schema_extra = {
            "example": {
                "difficulty": "medium",
                "workout": {
                    "warmup": [
                        {
                            "exercise": "Arm circles",
                            "duration": "2 min"
                        }
                    ],
                    "main": [
                        {
                            "exercise": "Push-ups",
                            "sets": 3,
                            "reps": 12,
                            "rest_seconds": 60
                        }
                    ],
                    "cooldown": [
                        {
                            "exercise": "Stretching",
                            "duration": "5 min"
                        }
                    ]
                },
                "ai_state": {
                    "current_difficulty": "medium",
                    "consistency_score": 0.75,
                    "trend": "improving"
                }
            }
        }


@router.post("/generate", response_model=GenerateWorkoutResponse)
async def generate_workout(request: GenerateWorkoutRequest):
    """
    Generate a personalized workout based on user state and preferences.

    This endpoint:
    1. Retrieves user's AI state and workout history
    2. Determines optimal difficulty using adaptive logic
    3. Analyzes user patterns
    4. Generates workout using Gemini AI (or fallback)
    5. Saves updated AI state

    Args:
        request: Workout generation request with user preferences

    Returns:
        Generated workout with difficulty and updated AI state

    Raises:
        HTTPException: If any step fails
    """
    user_id_str = str(request.user_id)

    # Validate energy level
    if request.energy_level not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=400,
            detail="Energy level must be 'low', 'medium', or 'high'"
        )

    # Validate time available
    if request.time_available < 10 or request.time_available > 120:
        raise HTTPException(
            status_code=400,
            detail="Time available must be between 10 and 120 minutes"
        )

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
        history = await get_workout_history(request.user_id, limit=30)
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

    # Generate workout using LLM with fallback
    try:
        workout = await generate_workout_with_ai(
            difficulty=difficulty,
            energy_level=request.energy_level,
            time_available=request.time_available,
            location=request.location,
            ai_state=ai_state,
            goal=request.goal,
            injuries=", ".join(request.injuries) if request.injuries else "none"
        )
    except Exception as e:
        # If AI generation fails, use fallback
        print(f"Warning: AI generation failed, using fallback: {e}")
        workout = fallback_workout(difficulty)

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


@router.get("/test")
async def test_workout_generation():
    """
    Test endpoint to verify workout generation is working.

    Returns:
        Test workout with default parameters
    """
    return {
        "status": "success",
        "message": "Workout generation endpoint is operational",
        "test_workout": fallback_workout("medium")
    }