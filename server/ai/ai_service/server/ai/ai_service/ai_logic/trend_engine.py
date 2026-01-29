"""
Trend detection engine with exponential time decay.
Prioritizes recent workouts while maintaining historical context.
"""

import math
from datetime import datetime, timedelta, timezone
from typing import Dict, List


def utc_now() -> datetime:
    """Get current UTC time."""
    return datetime.now(timezone.utc)


# Decay constant: higher = faster decay
DECAY_LAMBDA = 0.15


def apply_decay(workout_history: List[Dict]) -> float:
    """
    Calculate consistency score with exponential time decay.
    Recent workouts are weighted more heavily than old ones.

    Args:
        workout_history: List of workout dictionaries with 'created_at' and 'completed' keys

    Returns:
        Weighted consistency score between 0 and 1
    """
    if not workout_history:
        return 1.0

    now = utc_now()
    weighted_score = 0.0
    total_weight = 0.0

    for workout in workout_history:
        # Skip workouts without timestamp
        if "created_at" not in workout:
            continue

        # Calculate age in days
        created_at = workout["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))

        # Ensure timezone awareness
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        age_days = (now - created_at).days

        # Calculate exponential decay weight
        weight = math.exp(-DECAY_LAMBDA * age_days)

        # Score: 1.0 if completed, 0.0 if skipped
        score = 1.0 if workout.get("completed", False) else 0.0

        weighted_score += score * weight
        total_weight += weight

    # Return weighted average, or 1.0 if no valid data
    return weighted_score / total_weight if total_weight > 0 else 1.0


def detect_trend(consistency_score: float, previous_score: float) -> Dict:
    """
    Detect trend direction based on consistency score changes.

    Args:
        consistency_score: Current consistency score
        previous_score: Previous consistency score

    Returns:
        Dictionary with 'direction' and 'confidence' keys
    """
    delta = consistency_score - previous_score

    if delta > 0.1:
        return {
            "direction": "improving",
            "confidence": min(abs(delta), 1.0)
        }
    elif delta < -0.1:
        return {
            "direction": "declining",
            "confidence": min(abs(delta), 1.0)
        }
    else:
        return {
            "direction": "stable",
            "confidence": 0.5
        }


def calculate_momentum(workout_history: List[Dict], window_days: int = 7) -> float:
    """
    Calculate recent momentum (completion rate over last N days).

    Args:
        workout_history: List of workout dictionaries
        window_days: Number of days to look back

    Returns:
        Momentum score between 0 and 1
    """
    if not workout_history:
        return 0.5

    now = utc_now()
    cutoff = now - timedelta(days=window_days)

    recent_workouts = []
    for workout in workout_history:
        if "created_at" not in workout:
            continue

        created_at = workout["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))

        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        if created_at >= cutoff:
            recent_workouts.append(workout)

    if not recent_workouts:
        return 0.5

    completed = sum(1 for w in recent_workouts if w.get("completed", False))
    return completed / len(recent_workouts)


# Test function for verification
def test_recent_workouts_dominate():
    """Test that recent workouts have more impact than old ones."""
    history = [
        {"completed": False, "created_at": utc_now() - timedelta(days=20)},
        {"completed": True, "created_at": utc_now() - timedelta(days=1)},
    ]

    score = apply_decay(history)
    assert score > 0.5, f"Expected score > 0.5, got {score}"
    print(f"✓ Recent workout dominance test passed: score = {score}")


if __name__ == "__main__":
    test_recent_workouts_dominate()