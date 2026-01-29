"""
Authentication endpoint for user login/registration.
"""

import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from data_layer.mongo import users_col

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    """Request model for user login."""
    name: str

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe"
            }
        }


class LoginResponse(BaseModel):
    """Response model for user login."""
    user_id: str
    message: str
    name: str
    created_at: str

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "message": "User logged in",
                "name": "John Doe",
                "created_at": "2025-01-28T10:30:00Z"
            }
        }


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login or create a new user.

    This endpoint:
    - Checks if a user with the given name exists
    - If yes, logs them in and returns their user_id
    - If no, creates a new user and returns the new user_id

    Args:
        request: Login request with user name

    Returns:
        User ID, message, name, and creation timestamp

    Raises:
        HTTPException: If user creation fails
    """
    # Validate input
    if not request.name or request.name.strip() == "":
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    # Check if user already exists
    existing_user = await users_col.find_one({"name": request.name})

    if existing_user:
        return LoginResponse(
            user_id=existing_user["user_id"],
            message="User logged in successfully",
            name=existing_user["name"],
            created_at=existing_user.get("created_at", datetime.now(timezone.utc).isoformat())
        )

    # Create new user
    current_time = datetime.now(timezone.utc)
    user = {
        "user_id": str(uuid.uuid4()),
        "name": request.name,
        "created_at": current_time.isoformat()
    }

    try:
        await users_col.insert_one(user)
        return LoginResponse(
            user_id=user["user_id"],
            message="User created successfully",
            name=user["name"],
            created_at=user["created_at"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user: {str(e)}"
        )


@router.get("/user/{user_id}")
async def get_user(user_id: str):
    """
    Get user information by user_id.

    Args:
        user_id: User's unique identifier

    Returns:
        User information

    Raises:
        HTTPException: If user not found
    """
    user = await users_col.find_one({"user_id": user_id})

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Remove MongoDB _id field
    if "_id" in user:
        user.pop("_id")

    return user