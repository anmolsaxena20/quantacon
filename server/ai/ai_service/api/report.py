"""
Weekly report generation endpoint.
"""

from fastapi import APIRouter, HTTPException
from schemas.ai_schemas import WeeklyReportRequest, WeeklyReportResponse
from ai_logic.weekly_report import generate_weekly_report
from data_layer.workout_repo import get_workout_history
from data_layer.ai_state_repo import get_ai_state

router = APIRouter(prefix="/report", tags=["Reports"])


@router.post("/weekly", response_model=WeeklyReportResponse)
async def weekly_report(request: WeeklyReportRequest):
    """
    Generate a weekly workout report for the user.

    Args:
        request: Weekly report request with user ID

    Returns:
        Weekly summary with insights and suggestions
    """
    user_id_str = str(request.user_id)

    # Get workout history
    try:
        workout_history = await get_workout_history(request.user_id, limit=7)
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
            workout_history=workout_history,
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
    """
    from uuid import UUID

    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Get workout history
    try:
        workout_history = await get_workout_history(user_uuid, limit=7)
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
            workout_history=workout_history,
            ai_state=ai_state
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )

    return WeeklyReportResponse(**report)