"""
Pydantic schemas for AI service requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from uuid import UUID


# ==================== Auth Schemas ====================

class LoginRequest(BaseModel):
    """Login request schema."""
    name: str = Field(..., min_length=1, max_length=100)


class LoginResponse(BaseModel):
    """Login response schema."""
    user_id: str
    message: str


# ==================== Workout Completion Schemas ====================

class CompleteWorkoutRequest(BaseModel):
    """Request to record workout completion."""
    user_id: UUID
    completed: bool
    difficulty: str = Field(..., pattern="^(low|medium|high)$")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "completed": True,
                "difficulty": "medium"
            }
        }


class CompleteWorkoutResponse(BaseModel):
    """Response after recording workout completion."""
    status: str
    message: str


# ==================== Workout Generation Schemas ====================

class GenerateWorkoutRequest(BaseModel):
    """Request to generate a personalized workout."""
    user_id: UUID
    energy_level: str = Field(..., pattern="^(low|medium|high)$")
    goal: str = Field(default="general fitness")
    time_available: int = Field(default=30, ge=5, le=120)
    location: str = Field(default="home")
    injuries: List[str] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "energy_level": "medium",
                "goal": "general fitness",
                "time_available": 30,
                "location": "home",
                "injuries": []
            }
        }


class GenerateWorkoutResponse(BaseModel):
    """Response with generated workout."""
    difficulty: str
    workout: Dict
    ai_state: Dict


# ==================== Report Schemas ====================

class WeeklyReportRequest(BaseModel):
    """Request for weekly report."""
    user_id: UUID

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }


class WeeklyReportResponse(BaseModel):
    """Weekly report response."""
    summary: str
    consistency: str
    trend: str
    insight: str
    suggestion: str
    workouts_completed: int = 0
    workouts_total: int = 0
    current_difficulty: Optional[str] = "medium"

    class Config:
        json_schema_extra = {
            "example": {
                "summary": "You completed 5 out of 7 workouts this week.",
                "consistency": "71%",
                "trend": "improving",
                "insight": "Your consistency is improving! Keep building momentum.",
                "suggestion": "Maintain your current routine—you've found a great rhythm!",
                "workouts_completed": 5,
                "workouts_total": 7,
                "current_difficulty": "medium"
            }
        }


# ==================== Legacy/Internal Schemas ====================

class WorkoutHistoryItem(BaseModel):
    """Single workout history item."""
    completed: bool
    difficulty: str
    created_at: Optional[str] = None

    class Config:
        # Support both dict() and model_dump() for Pydantic v1/v2 compatibility
        json_schema_extra = {
            "example": {
                "completed": True,
                "difficulty": "medium",
                "created_at": "2024-01-27T10:00:00Z"
            }
        }