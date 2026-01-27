from ai_logic.difficulty_engine import adapt_difficulty


def test_increase_difficulty_with_high_consistency():
    history = [{"completed": True} for _ in range(6)]
    ai_state = {}

    result = adapt_difficulty(ai_state, history, energy_level="high")

    assert result["difficulty"] in {"medium", "high"}
