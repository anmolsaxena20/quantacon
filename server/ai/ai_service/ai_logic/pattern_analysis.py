"""
Pattern analysis engine for long-term user behavior tracking.
Analyzes workout history to identify patterns and update AI state.
"""

from typing import Dict, List


def analyze_patterns(workout_history: List[Dict], ai_state: Dict) -> Dict:
    """
    Analyze user workout patterns and update AI state.

    Args:
        workout_history: List of past workout dictionaries
        ai_state: Current AI state to update

    Returns:
        Updated AI state with pattern insights
    """
    if not workout_history:
        return ai_state

    total = len(workout_history)

    # Calculate overall completion rate
    completed = sum(1 for w in workout_history if w.get("completed", False))
    ai_state["completion_rate"] = round(completed / total, 2) if total > 0 else 0.0

    # Analyze success rates by difficulty
    difficulty_stats = {"low": [], "medium": [], "high": []}

    for workout in workout_history:
        diff = workout.get("difficulty", "medium")
        if diff in difficulty_stats:
            difficulty_stats[diff].append(workout.get("completed", False))

    # Calculate success rate for each difficulty
    success_rate = {}
    for diff, results in difficulty_stats.items():
        if results:
            success_rate[diff] = round(sum(results) / len(results), 2)
        else:
            success_rate[diff] = 0.5  # Neutral default

    ai_state["difficulty_success_rate_by_pattern"] = success_rate

    # Identify preferred difficulty (highest success rate with sufficient data)
    if success_rate:
        min_workouts = 3  # Minimum workouts needed to trust the data
        valid_difficulties = {
            diff: rate for diff, rate in success_rate.items()
            if len(difficulty_stats[diff]) >= min_workouts
        }

        if valid_difficulties:
            preferred = max(valid_difficulties, key=valid_difficulties.get)
            ai_state["preferred_difficulty"] = preferred

    return ai_state


def detect_skip_patterns(workout_history: List[Dict]) -> Dict:
    """
    Detect patterns in skipped workouts.

    Args:
        workout_history: List of past workout dictionaries

    Returns:
        Dictionary with skip pattern insights
    """
    if not workout_history:
        return {"skip_count": 0, "skip_streak": 0, "skip_rate": 0.0}

    total = len(workout_history)
    skipped = [not w.get("completed", False) for w in workout_history]
    skip_count = sum(skipped)

    # Calculate current skip streak
    skip_streak = 0
    for is_skipped in reversed(skipped):
        if is_skipped:
            skip_streak += 1
        else:
            break

    return {
        "skip_count": skip_count,
        "skip_streak": skip_streak,
        "skip_rate": round(skip_count / total, 2) if total > 0 else 0.0
    }


def analyze_time_preferences(workout_history: List[Dict]) -> Dict:
    """
    Analyze when users typically complete workouts.

    Args:
        workout_history: List of past workout dictionaries

    Returns:
        Dictionary with time preference insights
    """
    if not workout_history:
        return {}

    completed_workouts = [w for w in workout_history if w.get("completed", False)]

    if not completed_workouts:
        return {}

    # Analyze workout durations
    durations = [w.get("time_available", 30) for w in completed_workouts]
    avg_duration = sum(durations) / len(durations) if durations else 30

    return {
        "average_workout_duration": round(avg_duration, 1),
        "total_completed": len(completed_workouts)
    }
