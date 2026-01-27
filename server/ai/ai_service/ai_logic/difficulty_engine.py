"""
Deterministic difficulty decision engine.
- No GenAI decision-making
- Explainable logic
- Stable state management
"""

from typing import Dict, List, Optional


def apply_decay(workout_history: List[Dict]) -> float:
    """
    Calculate consistency score with time decay.
    Import this from trend_engine in production.
    """
    if not workout_history:
        return 1.0

    completed_count = sum(1 for w in workout_history if w.get("completed", False))
    return completed_count / len(workout_history)


def normalize_ai_state(ai_state: Dict, decision: str, reasons: List[str]) -> Dict:
    """
    Normalize AI state. Import from memory_engine in production.
    """
    from datetime import datetime

    ai_state.setdefault("metrics", {})
    ai_state.setdefault("reinforcement", {})
    ai_state.setdefault("trend", {})

    ai_state["last_decision"] = {
        "difficulty": decision,
        "reason": reasons,
        "timestamp": datetime.utcnow().isoformat()
    }

    return ai_state


def adapt_difficulty(
        ai_state: Optional[Dict],
        workout_history: List[Dict],
        energy_level: str
) -> Dict:
    """
    Deterministic difficulty decision engine.

    Args:
        ai_state: Current AI state dictionary
        workout_history: List of past workouts
        energy_level: User's current energy level ("low", "medium", "high")

    Returns:
        Dictionary with 'difficulty' and updated 'ai_state'
    """

    # -----------------------------
    # Initialize state
    # -----------------------------
    if not ai_state:
        ai_state = {
            "current_difficulty": "low",
            "fatigue_score": 0.0,
            "consistency_score": 1.0,
            "skip_risk": "low",
            "trend": "stable",
            "difficulty_success_rate": {
                "low": {"success": 1, "fail": 0},
                "medium": {"success": 1, "fail": 1},
                "high": {"success": 1, "fail": 1},
            }
        }

    # -----------------------------
    # Calculate Metrics
    # -----------------------------
    consistency_score = apply_decay(workout_history)
    prev_consistency = ai_state.get("consistency_score", consistency_score)

    # Determine trend
    if consistency_score > prev_consistency + 0.1:
        trend = "improving"
    elif consistency_score < prev_consistency - 0.1:
        trend = "declining"
    else:
        trend = "stable"

    # Calculate skip risk
    skipped = sum(1 for w in workout_history if not w.get("completed", False))

    if skipped >= 3:
        skip_risk = "high"
    elif skipped == 2:
        skip_risk = "medium"
    else:
        skip_risk = "low"

    current = ai_state.get("current_difficulty", "low")
    fatigue = ai_state.get("fatigue_score", 0.0)

    # -----------------------------
    # Decision Rules
    # -----------------------------
    reasons = []

    if skip_risk == "high":
        new_difficulty = "low"
        reasons.append("high skip risk")

    elif energy_level == "low":
        new_difficulty = "low"
        reasons.append("low energy")

    elif consistency_score > 0.8 and energy_level == "high":
        new_difficulty = "medium" if current == "low" else "high"
        reasons.append("high consistency + high energy")

    elif consistency_score < 0.4:
        new_difficulty = "low"
        reasons.append("low consistency")

    else:
        new_difficulty = current
        reasons.append("maintaining level")

    # -----------------------------
    # Update State
    # -----------------------------
    ai_state.update({
        "current_difficulty": new_difficulty,
        "consistency_score": round(consistency_score, 2),
        "trend": trend,
        "skip_risk": skip_risk,
        "fatigue_score": min(
            max(fatigue + (0.1 if energy_level == "low" else -0.05), 0.0),
            1.0
        )
    })

    ai_state = normalize_ai_state(
        ai_state,
        decision=new_difficulty,
        reasons=reasons
    )

    return {
        "difficulty": new_difficulty,
        "ai_state": ai_state
    }