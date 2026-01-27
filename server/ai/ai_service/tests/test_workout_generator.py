# tests/test_workout_generator.py
import pytest
from ai_logic.workout_generator import generate_workout_llm


@pytest.mark.asyncio  # FIX: Required for testing async functions
async def test_generate_workout_llm(monkeypatch):
    # FIX: The mock function MUST also be async
    async def fake_llm(difficulty, energy_level, time_available, location, patterns, goal, injuries):
        return {
            "warmup": ["jumping jacks"],
            "main": ["push-ups"],
            "cooldown": ["stretch"]
        }

    monkeypatch.setattr(
        "ai_logic.workout_generator.generate_workout_llm",
        fake_llm
    )

    # FIX: Use 'await' to resolve the coroutine into the actual dict result
    result = await generate_workout_llm(
        difficulty="high",
        energy_level="high",
        time_available=20,
        location="home",
        ai_state={},
        goal="strength",
        injuries="none"
    )

    assert "warmup" in result