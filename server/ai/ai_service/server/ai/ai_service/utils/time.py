"""
Time utilities for consistent datetime handling across the application.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional


def utc_now() -> datetime:
    """
    Get current UTC time with timezone awareness.

    Returns:
        Current datetime in UTC with timezone info
    """
    return datetime.now(timezone.utc)


def to_utc(dt: datetime) -> datetime:
    """
    Convert datetime to UTC timezone.

    Args:
        dt: Datetime to convert

    Returns:
        Datetime in UTC timezone
    """
    if dt.tzinfo is None:
        # Assume naive datetime is UTC
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def parse_iso_datetime(date_string: str) -> Optional[datetime]:
    """
    Parse ISO format datetime string to datetime object.

    Args:
        date_string: ISO format datetime string

    Returns:
        Parsed datetime or None if invalid
    """
    try:
        # Handle both with and without 'Z' suffix
        date_string = date_string.replace('Z', '+00:00')
        return datetime.fromisoformat(date_string)
    except (ValueError, AttributeError):
        return None


def days_ago(days: int) -> datetime:
    """
    Get datetime N days ago from now.

    Args:
        days: Number of days to go back

    Returns:
        Datetime N days ago
    """
    return utc_now() - timedelta(days=days)


def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format datetime to string.

    Args:
        dt: Datetime to format
        format_str: Format string (default: ISO-like)

    Returns:
        Formatted datetime string
    """
    return dt.strftime(format_str)


def is_timezone_aware(dt: datetime) -> bool:
    """
    Check if datetime is timezone aware.

    Args:
        dt: Datetime to check

    Returns:
        True if timezone aware, False otherwise
    """
    return dt.tzinfo is not None and dt.tzinfo.utcoffset(dt) is not None