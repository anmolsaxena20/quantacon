"""
Notification system for workout reminders and alerts.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from data_layer.mongo import db

router = APIRouter(prefix="/notifications", tags=["Notifications"])

notifications_col = db["notifications"]
user_preferences_col = db["user_preferences"]


class NotificationPreference(BaseModel):
    """User notification preferences."""
    user_id: str
    enabled: bool = True
    reminder_time: str = "09:00"  # HH:MM format
    reminder_days: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    missed_workout_alert: bool = True
    weekly_report_notification: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "enabled": True,
                "reminder_time": "09:00",
                "reminder_days": ["Monday", "Wednesday", "Friday"],
                "missed_workout_alert": True,
                "weekly_report_notification": True
            }
        }


class Notification(BaseModel):
    """Notification model."""
    user_id: str
    title: str
    message: str
    type: str  # reminder, alert, achievement, report
    read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Time to work out! 💪",
                "message": "Your daily workout is ready. Let's crush it!",
                "type": "reminder",
                "read": False
            }
        }


@router.post("/preferences")
async def set_notification_preferences(prefs: NotificationPreference):
    """Set notification preferences for a user."""
    try:
        hour, minute = prefs.reminder_time.split(":")
        hour_int = int(hour)
        minute_int = int(minute)
        if not (0 <= hour_int <= 23 and 0 <= minute_int <= 59):
            raise ValueError
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid reminder_time format. Use HH:MM (e.g., '09:00')"
        )

    valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for day in prefs.reminder_days:
        if day not in valid_days:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid day: {day}. Must be one of {valid_days}"
            )

    try:
        await user_preferences_col.update_one(
            {"user_id": prefs.user_id},
            {"$set": prefs.model_dump()}, # Updated from .dict()
            upsert=True
        )
        return {
            "status": "success",
            "message": "Notification preferences updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update preferences: {str(e)}"
        )


@router.get("/preferences/{user_id}")
async def get_notification_preferences(user_id: str):
    """Get notification preferences for a user."""
    try:
        prefs = await user_preferences_col.find_one({"user_id": user_id})
        if not prefs:
            return NotificationPreference(user_id=user_id).model_dump() # Updated from .dict()

        if "_id" in prefs:
            prefs.pop("_id")
        return prefs
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get preferences: {str(e)}"
        )


@router.post("/send")
async def send_notification(notification: Notification):
    """Send a notification to a user."""
    valid_types = ["reminder", "alert", "achievement", "report"]
    if notification.type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid notification type. Must be one of {valid_types}"
        )

    if not notification.created_at:
        notification.created_at = datetime.now(timezone.utc)

    try:
        result = await notifications_col.insert_one(notification.model_dump()) # Updated from .dict()
        return {
            "status": "success",
            "message": "Notification sent successfully",
            "notification_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send notification: {str(e)}"
        )


@router.get("/list/{user_id}")
async def get_notifications(user_id: str, unread_only: bool = False, limit: int = 20):
    """Get notifications for a user."""
    try:
        query = {"user_id": user_id}
        if unread_only:
            query["read"] = False

        cursor = notifications_col.find(query).sort("created_at", -1).limit(limit)

        notifications = []
        async for notif in cursor:
            if "_id" in notif:
                notif["notification_id"] = str(notif.pop("_id"))
            notifications.append(notif)

        return {
            "notifications": notifications,
            "count": len(notifications),
            "unread_count": sum(1 for n in notifications if not n.get("read", True))
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get notifications: {str(e)}"
        )


@router.post("/mark-read/{notification_id}")
async def mark_notification_read(notification_id: str):
    """Mark a notification as read."""
    try:
        obj_id = ObjectId(notification_id)
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID format"
        )

    try:
        result = await notifications_col.update_one(
            {"_id": obj_id},
            {"$set": {"read": True}}
        )

        if result.modified_count > 0 or result.matched_count > 0:
            return {
                "status": "success",
                "message": "Notification marked as read"
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Notification not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to mark notification as read: {str(e)}"
        )


@router.post("/mark-all-read/{user_id}")
async def mark_all_read(user_id: str):
    """Mark all notifications as read for a user."""
    try:
        result = await notifications_col.update_many(
            {"user_id": user_id, "read": False},
            {"$set": {"read": True}}
        )

        return {
            "status": "success",
            "message": f"Marked {result.modified_count} notifications as read",
            "count": result.modified_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to mark notifications as read: {str(e)}"
        )


@router.delete("/delete/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete a notification."""
    try:
        obj_id = ObjectId(notification_id)
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID format"
        )

    try:
        result = await notifications_col.delete_one({"_id": obj_id})

        if result.deleted_count > 0:
            return {
                "status": "success",
                "message": "Notification deleted"
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Notification not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete notification: {str(e)}"
        )


# Helper functions for creating specific notification types

async def create_workout_reminder(user_id: str):
    """Create a workout reminder notification."""
    notification = Notification(
        user_id=user_id,
        title="Time to work out! 💪",
        message="Your daily workout is ready. Let's crush it today!",
        type="reminder",
        created_at=datetime.now(timezone.utc)
    )

    await notifications_col.insert_one(notification.model_dump()) # Updated


async def create_missed_workout_alert(user_id: str, days_missed: int):
    """Create a missed workout alert."""
    notification = Notification(
        user_id=user_id,
        title=f"We miss you! 😢",
        message=f"It's been {days_missed} days since your last workout. Even a 10-minute session makes a difference!",
        type="alert",
        created_at=datetime.now(timezone.utc)
    )

    await notifications_col.insert_one(notification.model_dump()) # Updated


async def create_achievement_notification(user_id: str, achievement: str):
    """Create an achievement notification."""
    notification = Notification(
        user_id=user_id,
        title="Achievement Unlocked! 🏆",
        message=achievement,
        type="achievement",
        created_at=datetime.now(timezone.utc)
    )

    await notifications_col.insert_one(notification.model_dump()) # Updated


async def create_weekly_report_notification(user_id: str):
    """Create a weekly report notification."""
    notification = Notification(
        user_id=user_id,
        title="Your Weekly Report is Ready! 📊",
        message="Check out your progress and insights from this week.",
        type="report",
        created_at=datetime.now(timezone.utc)
    )

    await notifications_col.insert_one(notification.model_dump()) # Updated