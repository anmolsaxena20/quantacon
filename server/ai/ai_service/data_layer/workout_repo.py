"""
Repository for workout persistence in MongoDB.
Handles saving and retrieving workout history.
"""

from datetime import datetime, timezone
from data_layer.mongo import workouts_col
from uuid import UUID
from typing import List, Dict


def utc_now() -> datetime:
    """Get current UTC time."""
    return datetime.now(timezone.utc)


async def save_workout(
        user_id: UUID,
        completed: bool,
        difficulty: str,
        time_available: int = None,
        energy_level: str = None
) -> bool:
    """
    Save a workout record to the database.

    Args:
        user_id: User's UUID
        completed: Whether workout was completed
        difficulty: Difficulty level
        time_available: Optional workout duration
        energy_level: Optional energy level

    Returns:
        True if successful, False otherwise
    """
    try:
        workout_doc = {
            "user_id": str(user_id),
            "completed": completed,
            "difficulty": difficulty,
            "created_at": utc_now()
        }

        # Add optional fields if provided
        if time_available is not None:
            workout_doc["time_available"] = time_available
        if energy_level is not None:
            workout_doc["energy_level"] = energy_level

        result = await workouts_col.insert_one(workout_doc)
        return result.acknowledged

    except Exception as e:
        print(f"Error saving workout for user {user_id}: {e}")
        return False


async def get_workout_history(user_id: UUID, limit: int = 30) -> List[Dict]:
    """
    Get workout history for a user.

    Args:
        user_id: User's UUID
        limit: Maximum number of workouts to retrieve

    Returns:
        List of workout dictionaries, sorted by most recent first
    """
    try:
        cursor = workouts_col.find(
            {"user_id": str(user_id)}
        ).sort("created_at", -1).limit(limit)

        workouts = []
        async for doc in cursor:
            # Remove MongoDB _id field
            if "_id" in doc:
                doc.pop("_id")
            workouts.append(doc)

        return workouts

    except Exception as e:
        print(f"Error retrieving workout history for user {user_id}: {e}")
        return []


async def get_workout_count(user_id: UUID) -> int:
    """
    Get total workout count for a user.

    Args:
        user_id: User's UUID

    Returns:
        Total number of workouts
    """
    try:
        count = await workouts_col.count_documents({"user_id": str(user_id)})
        return count

    except Exception as e:
        print(f"Error counting workouts for user {user_id}: {e}")
        return 0


async def get_completed_workout_count(user_id: UUID) -> int:
    """
    Get count of completed workouts for a user.

    Args:
        user_id: User's UUID

    Returns:
        Number of completed workouts
    """
    try:
        count = await workouts_col.count_documents({
            "user_id": str(user_id),
            "completed": True
        })
        return count

    except Exception as e:
        print(f"Error counting completed workouts for user {user_id}: {e}")
        return 0


async def delete_user_workouts(user_id: UUID) -> bool:
    """
    Delete all workouts for a user.

    Args:
        user_id: User's UUID

    Returns:
        True if successful, False otherwise
    """
    try:
        result = await workouts_col.delete_many({"user_id": str(user_id)})
        return result.acknowledged

    except Exception as e:
        print(f"Error deleting workouts for user {user_id}: {e}")
        return False