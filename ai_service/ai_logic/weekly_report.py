"""
Weekly report generation for user fitness summaries.
Analyzes the past week and provides actionable insights.
"""

from typing import Dict, List


def generate_weekly_report(workout_history: List[Dict], ai_state: Dict) -> Dict:
    """
    Generate a weekly fitness summary using workout history and AI state.

    Args:
        workout_history: List of all workout dictionaries
        ai_state: Current AI state with trend and preference data

    Returns:
        Dictionary with summary, consistency, insights, and suggestions
    """
    if not workout_history:
        return {
            "summary": "No workouts recorded this week.",
            "consistency": "0%",
            "insight": "Start with short, achievable workouts.",
            "suggestion": "Aim for 10 minutes a day to build the habit.",
            "trend": "new_user"
        }

    # Get last 7 workouts (or all if less than 7)
    last_week = workout_history[-7:]

    # Calculate consistency
    total = len(last_week)
    completed = sum(1 for w in last_week if w.get("completed", False))
    consistency_rate = completed / total if total > 0 else 0
    consistency_percent = int(consistency_rate * 100)

    # Extract AI state information
    trend = ai_state.get("trend", "stable")
    preferred = ai_state.get("preferred_difficulty", "medium")
    skip_risk = ai_state.get("skip_risk", "low")
    current_difficulty = ai_state.get("current_difficulty", "medium")

    # Generate summary
    if completed == total:
        summary = f"Excellent work! You completed all {total} workouts this week. 🎉"
    elif completed > 0:
        summary = f"You completed {completed} out of {total} workouts this week."
    else:
        summary = f"You had {total} planned workouts but didn't complete any this week."

    # Generate insight based on trend
    if trend == "improving":
        insight = "Your consistency is improving! Keep building this positive momentum."
    elif trend == "declining":
        insight = "Your activity dipped this week. Consider lighter workouts to rebuild momentum."
    elif consistency_rate > 0.7:
        insight = "Your activity level is stable and strong. Great consistency!"
    elif consistency_rate > 0.4:
        insight = "Your activity level is moderate. Small improvements can make a big difference."
    else:
        insight = "Building consistency takes time. Focus on small, achievable goals."

    # Generate actionable suggestion
    if skip_risk == "high":
        suggestion = "Focus on short, low-intensity workouts (10-15 min) to rebuild your routine."
    elif consistency_rate < 0.3:
        suggestion = "Try committing to just 3 short workouts next week. Small wins build habits."
    elif current_difficulty == "low" and consistency_rate > 0.7:
        suggestion = "You're doing great! Consider gradually increasing intensity when you feel ready."
    elif preferred == "high" and consistency_rate > 0.8:
        suggestion = "You're crushing it! You can safely challenge yourself with harder workouts."
    elif consistency_rate > 0.8:
        suggestion = "Maintain your current routine—you've found a great rhythm!"
    else:
        suggestion = "Focus on consistency before intensity. Aim to complete 4-5 workouts next week."

    return {
        "summary": summary,
        "consistency": f"{consistency_percent}%",
        "trend": trend,
        "insight": insight,
        "suggestion": suggestion,
        "workouts_completed": completed,
        "workouts_total": total,
        "current_difficulty": current_difficulty
    }


def generate_monthly_report(workout_history: List[Dict], ai_state: Dict) -> Dict:
    """
    Generate a monthly fitness summary.

    Args:
        workout_history: List of all workout dictionaries
        ai_state: Current AI state

    Returns:
        Monthly summary dictionary
    """
    if not workout_history:
        return {
            "summary": "No workouts recorded this month.",
            "total_workouts": 0,
            "completion_rate": "0%"
        }

    last_month = workout_history[-30:] if len(workout_history) >= 30 else workout_history

    total = len(last_month)
    completed = sum(1 for w in last_month if w.get("completed", False))
    completion_rate = int((completed / total * 100)) if total > 0 else 0

    return {
        "summary": f"This month: {completed} workouts completed out of {total} planned.",
        "total_workouts": total,
        "completion_rate": f"{completion_rate}%",
        "completed": completed
    }