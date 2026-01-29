"""
Main FastAPI application for workout generation service.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

# Import the AI logic modules
from ai_logic.difficulty_engine import adapt_difficulty
from ai_logic.workout_generator import generate_workout_llm
from ai_logic.feedback_engine import update_feedback
from ai_logic.weekly_report import generate_weekly_report
from ai_logic.memory_engine import initialize_ai_state, get_ai_state_summary
from ai_logic.pattern_analysis import analyze_patterns

app = FastAPI(
    title="Workout Generator API",
    description="AI-powered personalized workout generation",
    version="1.0.0"
)


# Pydantic models for request/response
class WorkoutRequest(BaseModel):
    user_id: str
    energy_level: str = "medium"  # low, medium, high
    time_available: int = 30
    location: str = "home"
    goal: str = "general fitness"
    injuries: str = "none"


class WorkoutFeedback(BaseModel):
    user_id: str
    workout_id: str
    difficulty: str
    completed: bool
    rating: Optional[int] = None


class WorkoutResponse(BaseModel):
    workout_id: str
    difficulty: str
    workout: Dict
    ai_state_summary: Dict


# In-memory storage (replace with database in production)
user_states: Dict[str, Dict] = {}
workout_histories: Dict[str, List[Dict]] = {}


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Workout Generator API",
        "version": "1.0.0"
    }


@app.post("/workout/generate", response_model=WorkoutResponse)
async def generate_workout(request: WorkoutRequest):
    """
    Generate a personalized workout based on user state and preferences.
    """
    user_id = request.user_id

    # Initialize user state if new user
    if user_id not in user_states:
        user_states[user_id] = initialize_ai_state()
        workout_histories[user_id] = []

    # Get user's workout history and AI state
    workout_history = workout_histories[user_id]
    ai_state = user_states[user_id]

    # Analyze patterns if there's history
    if workout_history:
        ai_state = analyze_patterns(workout_history, ai_state)

    # Adapt difficulty based on user state
    difficulty_result = adapt_difficulty(
        ai_state=ai_state,
        workout_history=workout_history,
        energy_level=request.energy_level
    )

    difficulty = difficulty_result["difficulty"]
    ai_state = difficulty_result["ai_state"]

    # Generate workout using LLM
    try:
        workout = await generate_workout_llm(
            difficulty=difficulty,
            energy_level=request.energy_level,
            time_available=request.time_available,
            location=request.location,
            ai_state=ai_state,
            goal=request.goal,
            injuries=request.injuries
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate workout: {str(e)}"
        )

    # Create workout record
    workout_id = f"{user_id}_{datetime.utcnow().isoformat()}"
    workout_record = {
        "workout_id": workout_id,
        "difficulty": difficulty,
        "energy_level": request.energy_level,
        "time_available": request.time_available,
        "location": request.location,
        "created_at": datetime.utcnow(),
        "completed": None  # Will be updated via feedback
    }

    workout_histories[user_id].append(workout_record)
    user_states[user_id] = ai_state

    return WorkoutResponse(
        workout_id=workout_id,
        difficulty=difficulty,
        workout=workout,
        ai_state_summary=get_ai_state_summary(ai_state)
    )


@app.post("/workout/feedback")
async def submit_feedback(feedback: WorkoutFeedback):
    """
    Submit feedback for a completed (or skipped) workout.
    """
    user_id = feedback.user_id

    if user_id not in user_states:
        raise HTTPException(status_code=404, detail="User not found")

    # Update the workout record
    workout_history = workout_histories[user_id]
    for workout in workout_history:
        if workout["workout_id"] == feedback.workout_id:
            workout["completed"] = feedback.completed
            workout["rating"] = feedback.rating
            break

    # Update AI state with feedback
    ai_state = user_states[user_id]
    ai_state = update_feedback(ai_state, {
        "difficulty": feedback.difficulty,
        "completed": feedback.completed
    })

    user_states[user_id] = ai_state

    return {
        "status": "success",
        "message": "Feedback recorded",
        "ai_state_summary": get_ai_state_summary(ai_state)
    }


@app.get("/workout/report/{user_id}")
async def get_weekly_report(user_id: str):
    """
    Get weekly workout report for a user.
    """
    if user_id not in user_states:
        raise HTTPException(status_code=404, detail="User not found")

    workout_history = workout_histories[user_id]
    ai_state = user_states[user_id]

    report = generate_weekly_report(workout_history, ai_state)

    return report


@app.get("/user/{user_id}/state")
async def get_user_state(user_id: str):
    """
    Get current AI state for a user.
    """
    if user_id not in user_states:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user_id,
        "ai_state": get_ai_state_summary(user_states[user_id]),
        "total_workouts": len(workout_histories[user_id])
    }


@app.delete("/user/{user_id}")
async def delete_user(user_id: str):
    """
    Delete user data (for testing/development).
    """
    if user_id in user_states:
        del user_states[user_id]
        del workout_histories[user_id]
        return {"status": "success", "message": f"User {user_id} deleted"}
    else:
        raise HTTPException(status_code=404, detail="User not found")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)