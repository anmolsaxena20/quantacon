"""
Authentication endpoint for user login/registration.
"""

import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from data_layer.mongo import users_col

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    """Request model for user login."""
    name: str


class LoginResponse(BaseModel):
    """Response model for user login."""
    user_id: str
    message: str


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login or create a new user.

    Args:
        request: Login request with user name

    Returns:
        User ID and success message
    """
    # Check if user already exists
    existing_user = await users_col.find_one({"name": request.name})

    if existing_user:
        return LoginResponse(
            user_id=existing_user["user_id"],
            message="User logged in"
        )

    # Create new user
    user = {
        "user_id": str(uuid.uuid4()),
        "name": request.name,
        "created_at": None  # Will be set by database default or middleware
    }

    try:
        await users_col.insert_one(user)
        return LoginResponse(
            user_id=user["user_id"],
            message="User created"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user: {str(e)}"
        )