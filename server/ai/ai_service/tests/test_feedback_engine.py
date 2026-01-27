from ai_logic.feedback_engine import update_feedback
from ai_logic.feedback_engine import update_feedback


def test_feedback_learning():
    state = {}

    state = update_feedback(state, {"difficulty": "high", "completed": False})
    state = update_feedback(state, {"difficulty": "high", "completed": False})
    state = update_feedback(state, {"difficulty": "high", "completed": True})

    rates = state["difficulty_success_rate"]["high"]
    assert rates["fail"] == 2
    assert rates["success"] == 1

def test_feedback_updates_success_and_fail():
    state = {}

    state = update_feedback(state, {"difficulty": "medium", "completed": True})
    state = update_feedback(state, {"difficulty": "medium", "completed": False})
    state = update_feedback(state, {"difficulty": "medium", "completed": True})

    rates = state["difficulty_success_rate"]["medium"]

    assert rates["success"] == 2
    assert rates["fail"] == 1
