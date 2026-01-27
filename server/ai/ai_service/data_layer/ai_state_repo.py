"""
Repository for AI state persistence in MongoDB.
Handles saving and retrieving user AI states.
"""

from data_layer.mongo import ai_state_col
from typing import Dict, Any, Optional


async def get_ai_state(user_id: str) -> Dict[str, Any]:
    """
    Retrieve AI state for a user.

    Args:
        user_id: User's unique identifier

    Returns:
        AI state dictionary, empty dict if not found
    """
    try:
        doc = await ai_state_col.find_one({"user_id": user_id})

        if doc and "state" in doc:
            return doc["state"]

        # Return default state for new users
        return {}

    except Exception as e:
        print(f"Error retrieving AI state for user {user_id}: {e}")
        return {}


async def save_ai_state(user_id: str, state: Dict[str, Any]) -> bool:
    """
    Save or update AI state for a user.

    Args:
        user_id: User's unique identifier
        state: AI state dictionary to save

    Returns:
        True if successful, False otherwise
    """
    try:
        # upsert=True creates document if it doesn't exist
        result = await ai_state_col.update_one(
            {"user_id": user_id},
            {"$set": {"state": state}},
            upsert=True
        )

        return result.acknowledged

    except Exception as e:
        print(f"Error saving AI state for user {user_id}: {e}")
        return False


async def delete_ai_state(user_id: str) -> bool:
    """
    Delete AI state for a user.

    Args:
        user_id: User's unique identifier

    Returns:
        True if successful, False otherwise
    """
    try:
        result = await ai_state_col.delete_one({"user_id": user_id})
        return result.deleted_count > 0

    except Exception as e:
        print(f"Error deleting AI state for user {user_id}: {e}")
        return False


async def ai_state_exists(user_id: str) -> bool:
    """
    Check if AI state exists for a user.

    Args:
        user_id: User's unique identifier

    Returns:
        True if state exists, False otherwise
    """
    try:
        count = await ai_state_col.count_documents({"user_id": user_id}, limit=1)
        return count > 0

    except Exception as e:
        print(f"Error checking AI state existence for user {user_id}: {e}")
        return False