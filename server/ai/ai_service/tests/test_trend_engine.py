from datetime import timedelta
from ai_logic.trend_engine import apply_decay
from utils.time import utc_now

def test_recent_workouts_dominate():
    history = [
        {"completed": False, "created_at": utc_now() - timedelta(days=20)},
        {"completed": True, "created_at": utc_now()- timedelta(days=1)},
    ]

    score = apply_decay(history)

    # Recent completion should dominate
    assert score > 0.5
