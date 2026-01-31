"""
MongoDB connection and database setup.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

# Get MongoDB URL from environment or use default
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# Initialize client
client: Optional[AsyncIOMotorClient] = None


def get_mongo_client() -> AsyncIOMotorClient:
    """
    Get or create MongoDB client (singleton pattern).

    Returns:
        AsyncIOMotorClient instance
    """
    global client
    if client is None:
        client = AsyncIOMotorClient(MONGO_URL)
    return client


# Database and collections
def get_database():
    """Get the main database."""
    client = get_mongo_client()
    return client["desert_pulse"]


# Initialize database and collections
db = get_database()

users_col = db["users"]
ai_state_col = db["aiState"]
workouts_col = db["workoutSessions"]
reports_col = db["weeklyReports"]


async def init_db():
    """
    Initialize database with indexes for better performance.
    Call this on application startup.
    """
    try:
        # Create indexes for users collection
        await users_col.create_index("user_id", unique=True)
        await users_col.create_index("name")

        # Create indexes for ai_state collection
        await ai_state_col.create_index("user_id", unique=True)

        # Create indexes for workouts collection
        await workouts_col.create_index("user_id")
        await workouts_col.create_index([("user_id", 1), ("created_at", -1)])

        # Create indexes for reports collection
        await reports_col.create_index("user_id")
        await reports_col.create_index([("user_id", 1), ("created_at", -1)])

        print("✓ Database indexes created successfully")

    except Exception as e:
        print(f"✗ Error creating database indexes: {e}")


async def close_db():
    """
    Close database connection.
    Call this on application shutdown.
    """
    global client
    if client:
        client.close()
        print("✓ Database connection closed")


async def ping_db() -> bool:
    """
    Check if database connection is alive.

    Returns:
        True if connection is healthy, False otherwise
    """
    try:
        client = get_mongo_client()
        await client.admin.command('ping')
        return True
    except Exception as e:
        print(f"Database ping failed: {e}")
        return False