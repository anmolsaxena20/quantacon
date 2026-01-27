"""
Feedback engine for tracking workout success/failure rates.
Updates AI state based on user performance.
"""

from typing import Dict, Optional


def update_feedback(ai_state: Optional[Dict], feedback: Dict) -> Dict:
    """
    Updates the success/fail rates for a specific difficulty level.

    Args:
        ai_state: Current AI state dictionary
        feedback: Dictionary containing 'difficulty' and 'completed' keys

    Returns:
        Updated ai_state dictionary
    """
    if not ai_state:
        ai_state = {}

    # Initialize the nested dictionary to prevent KeyErrors
    if "difficulty_success_rate" not in ai_state:
        ai_state["difficulty_success_rate"] = {
            "low": {"success": 0, "fail": 0},
            "medium": {"success": 0, "fail": 0},
            "high": {"success": 0, "fail": 0},
        }

    diff = feedback.get("difficulty", "medium")
    completed = feedback.get("completed", False)

    rates = ai_state["difficulty_success_rate"]

    # Ensure the difficulty level exists
    if diff not in rates:
        rates[diff] = {"success": 0, "fail": 0}

    # Logic to increment success or failure count
    if completed:
        rates[diff]["success"] += 1
    else:
        rates[diff]["fail"] += 1

    return ai_state


def get_success_rate(ai_state: Dict, difficulty: str) -> float:
    """
    Calculate success rate for a specific difficulty level.

    Args:
        ai_state: Current AI state dictionary
        difficulty: Difficulty level ("low", "medium", "high")

    Returns:
        Success rate as a float between 0 and 1
    """
    if not ai_state or "difficulty_success_rate" not in ai_state:
        return 0.5  # Default neutral rate

    rates = ai_state["difficulty_success_rate"].get(difficulty, {"success": 0, "fail": 0})
    total = rates["success"] + rates["fail"]

    if total == 0:
        return 0.5

    return rates["success"] / total