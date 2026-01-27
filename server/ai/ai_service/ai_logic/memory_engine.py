"""
Memory engine for maintaining clean, structured AI state.
Ensures explainability and consistency in AI decision-making.
"""

from datetime import datetime, timezone
from typing import Dict, List


def utc_now() -> datetime:
    """Get current UTC time."""
    return datetime.now(timezone.utc)


def normalize_ai_state(ai_state: Dict, decision: str, reasons: List[str]) -> Dict:
    """
    Ensures AI memory stays clean, structured, and explainable.

    Args:
        ai_state: Current AI state dictionary
        decision: The difficulty decision made
        reasons: List of reasons for the decision

    Returns:
        Normalized ai_state dictionary
    """

    # Ensure required top-level keys exist
    ai_state.setdefault("metrics", {})
    ai_state.setdefault("reinforcement", {})
    ai_state.setdefault("trend", {})

    # Record the last decision with timestamp
    ai_state["last_decision"] = {
        "difficulty": decision,
        "reason": reasons,
        "timestamp": utc_now().isoformat()
    }

    return ai_state


def get_ai_state_summary(ai_state: Dict) -> Dict:
    """
    Get a summary of the current AI state for logging/debugging.

    Args:
        ai_state: Current AI state dictionary

    Returns:
        Summary dictionary with key metrics
    """
    return {
        "current_difficulty": ai_state.get("current_difficulty", "unknown"),
        "consistency_score": ai_state.get("consistency_score", 0.0),
        "trend": ai_state.get("trend", "stable"),
        "skip_risk": ai_state.get("skip_risk", "low"),
        "last_decision": ai_state.get("last_decision", {})
    }


def initialize_ai_state() -> Dict:
    """
    Create a fresh AI state for new users.

    Returns:
        Initialized AI state dictionary
    """
    return {
        "current_difficulty": "low",
        "fatigue_score": 0.0,
        "consistency_score": 1.0,
        "skip_risk": "low",
        "trend": "stable",
        "difficulty_success_rate": {
            "low": {"success": 1, "fail": 0},
            "medium": {"success": 1, "fail": 1},
            "high": {"success": 1, "fail": 1},
        },
        "metrics": {},
        "reinforcement": {},
        "last_decision": {
            "difficulty": "low",
            "reason": ["new user"],
            "timestamp": utc_now().isoformat()
        }
    }