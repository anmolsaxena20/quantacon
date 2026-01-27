from ai_logic.weekly_report import generate_weekly_report

history = [
    {"completed": True, "difficulty": "low"},
    {"completed": True, "difficulty": "low"},
    {"completed": False, "difficulty": "medium"},
    {"completed": True, "difficulty": "low"},
    {"completed": False, "difficulty": "medium"},
    {"completed": True, "difficulty": "low"},
]

ai_state = {
    "trend": "improving",
    "preferred_difficulty": "low",
    "skip_risk": "medium"
}

report = generate_weekly_report(history, ai_state)
print(report)
