from ai_logic.prompt_builder import build_workout_prompt

def test_prompt_contains_difficulty():
    prompt = build_workout_prompt(
        difficulty="high",
        energy_level="high",
        time_available=30,
        location="home",
        patterns={"reasons": ["high consistency"]}
    )
    assert "Difficulty: high" in prompt
