def build_workout_prompt(
    difficulty: str,
    energy_level: str,
    time_available: int,
    location: str,
    patterns: dict,
    goal: str = "general fitness",
    injuries: str = "none"
) -> str:
    reasons = patterns.get("reasons", [])

    return f"""
You are an expert fitness coach.

User profile:
- Goal: {goal}
- Difficulty: {difficulty}
- Energy level: {energy_level}
- Time available: {time_available} minutes
- Location: {location}
- Injuries: {injuries}

Behavioral insights:
{reasons}

Rules:
- Respect difficulty strictly
- Keep workout achievable
- Prefer bodyweight exercises
- Output JSON ONLY with:
  warmup, workout, cooldown

Generate today's workout.
"""
