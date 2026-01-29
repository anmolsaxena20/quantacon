"""
Weekly report generation endpoint.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from uuid import UUID
from data_layer.workout_repo import get_workout_history
from data_layer.ai_state_repo import get_ai_state

router = APIRouter(prefix="/report", tags=["Reports"])


class WeeklyReportRequest(BaseModel):
    """Request model for weekly report."""
    user_id: UUID

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }


class WeeklyReportResponse(BaseModel):
    """Response model for weekly report."""
    period: str
    total_workouts: int
    completed_workouts: int
    completion_rate: float
    current_streak: int
    difficulty_breakdown: Dict[str, int]
    insights: List[str]
    suggestions: List[str]
    estimated_calories: int
    consistency_score: float

    class Config:
        json_schema_extra = {
            "example": {
                "period": "Last 7 days",
                "total_workouts": 5,
                "completed_workouts": 4,
                "completion_rate": 0.80,
                "current_streak": 3,
                "difficulty_breakdown": {
                    "low": 1,
                    "medium": 2,
                    "high": 1
                },
                "insights": [
                    "You've completed 80% of your workouts this week!",
                    "Your consistency is improving - keep it up!"
                ],
                "suggestions": [
                    "Try increasing difficulty for your next workout",
                    "Consider working out earlier in the day for better energy"
                ],
                "estimated_calories": 1200,
                "consistency_score": 0.75
            }
        }


@router.post("/weekly", response_model=WeeklyReportResponse)
async def weekly_report(request: WeeklyReportRequest):
    """
    Generate a weekly workout report for the user.

    Args:
        request: Weekly report request with user ID

    Returns:
        Weekly summary with insights and suggestions

    Raises:
        HTTPException: If report generation fails
    """
    user_id_str = str(request.user_id)

    # Get workout history (last 7 days)
    try:
        workout_history = await get_workout_history(request.user_id, limit=30)
        # Filter to last 7 days
        from datetime import datetime, timedelta, timezone
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

        recent_workouts = []
        for workout in workout_history:
            created_at = workout.get("created_at")
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            if created_at and created_at >= seven_days_ago:
                recent_workouts.append(workout)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve workout history: {str(e)}"
        )

    # Get AI state
    try:
        ai_state = await get_ai_state(user_id_str)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve AI state: {str(e)}"
        )

    # Generate report
    try:
        report = generate_weekly_report(
            workout_history=recent_workouts,
            ai_state=ai_state
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )

    return WeeklyReportResponse(**report)


@router.get("/weekly/{user_id}", response_model=WeeklyReportResponse)
async def get_weekly_report(user_id: str):
    """
    Get weekly report by user ID (GET endpoint).

    Args:
        user_id: User's UUID as string

    Returns:
        Weekly summary with insights and suggestions

    Raises:
        HTTPException: If report generation fails
    """
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Get workout history
    try:
        workout_history = await get_workout_history(user_uuid, limit=30)
        # Filter to last 7 days
        from datetime import datetime, timedelta, timezone
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

        recent_workouts = []
        for workout in workout_history:
            created_at = workout.get("created_at")
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            if created_at and created_at >= seven_days_ago:
                recent_workouts.append(workout)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve workout history: {str(e)}"
        )

    # Get AI state
    try:
        ai_state = await get_ai_state(user_id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve AI state: {str(e)}"
        )

    # Generate report
    try:
        report = generate_weekly_report(
            workout_history=recent_workouts,
            ai_state=ai_state
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )

    return WeeklyReportResponse(**report)


def generate_weekly_report(
    workout_history: List[Dict[str, Any]],
    ai_state: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate weekly report from workout history and AI state.

    Args:
        workout_history: List of recent workouts
        ai_state: Current AI state

    Returns:
        Report dictionary
    """
    # Calculate basic stats
    total_workouts = len(workout_history)
    completed_workouts = sum(1 for w in workout_history if w.get("completed", False))
    completion_rate = completed_workouts / total_workouts if total_workouts > 0 else 0.0

    # Calculate difficulty breakdown
    difficulty_breakdown = {"low": 0, "medium": 0, "high": 0}
    for workout in workout_history:
        diff = workout.get("difficulty", "medium")
        if diff in difficulty_breakdown:
            difficulty_breakdown[diff] += 1

    # Calculate current streak
    current_streak = 0
    for workout in reversed(workout_history):
        if workout.get("completed", False):
            current_streak += 1
        else:
            break

    # Get consistency score from AI state
    consistency_score = ai_state.get("consistency_score", 0.5)
    trend = ai_state.get("trend", "stable")

    # Generate insights
    insights = []
    if completion_rate >= 0.8:
        insights.append(f"Excellent! You've completed {completion_rate:.0%} of your workouts this week!")
    elif completion_rate >= 0.5:
        insights.append(f"Good progress! You've completed {completion_rate:.0%} of your workouts.")
    else:
        insights.append(f"You've completed {completion_rate:.0%} of workouts. Let's aim higher next week!")

    if trend == "improving":
        insights.append("Your consistency is improving - keep up the great work!")
    elif trend == "declining":
        insights.append("Your consistency has dipped recently. Let's get back on track!")
    else:
        insights.append("You're maintaining steady progress.")

    if current_streak >= 3:
        insights.append(f"Amazing! You're on a {current_streak}-workout streak! 🔥")

    # Generate suggestions
    suggestions = []
    if completion_rate < 0.7:
        suggestions.append("Try setting reminders to help maintain consistency")

    if difficulty_breakdown["low"] > difficulty_breakdown["medium"] + difficulty_breakdown["high"]:
        suggestions.append("Consider gradually increasing workout difficulty for better results")

    if total_workouts < 3:
        suggestions.append("Aim for at least 3-4 workouts per week for optimal progress")

    if not suggestions:
        suggestions.append("Keep up your excellent routine!")
        suggestions.append("Consider setting new fitness goals to stay motivated")

    # Estimate calories (rough estimate: 150-300 kcal per workout based on difficulty)
    calorie_estimates = {"low": 150, "medium": 225, "high": 300}
    estimated_calories = sum(
        calorie_estimates.get(w.get("difficulty", "medium"), 225)
        for w in workout_history
        if w.get("completed", False)
    )

    return {
        "period": "Last 7 days",
        "total_workouts": total_workouts,
        "completed_workouts": completed_workouts,
        "completion_rate": round(completion_rate, 2),
        "current_streak": current_streak,
        "difficulty_breakdown": difficulty_breakdown,
        "insights": insights,
        "suggestions": suggestions,
        "estimated_calories": estimated_calories,
        "consistency_score": round(consistency_score, 2)
    }


@router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    """
    Get comprehensive user statistics.

    Args:
        user_id: User's unique identifier

    Returns:
        User statistics including all-time metrics

    Raises:
        HTTPException: If stats retrieval fails
    """
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Get all workout history
        all_workouts = await get_workout_history(user_uuid, limit=1000)

        # Calculate all-time stats
        total_completed = sum(1 for w in all_workouts if w.get("completed", False))
        total_attempted = len(all_workouts)

        # Get AI state
        ai_state = await get_ai_state(user_id)

        return {
            "user_id": user_id,
            "all_time_stats": {
                "total_workouts_completed": total_completed,
                "total_workouts_attempted": total_attempted,
                "overall_completion_rate": round(total_completed / total_attempted, 2) if total_attempted > 0 else 0.0
            },
            "current_state": {
                "difficulty": ai_state.get("current_difficulty", "medium"),
                "consistency_score": ai_state.get("consistency_score", 0.5),
                "trend": ai_state.get("trend", "stable"),
                "skip_risk": ai_state.get("skip_risk", "low")
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve user stats: {str(e)}"
        )