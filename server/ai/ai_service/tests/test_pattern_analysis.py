from ai_logic.pattern_analysis import analyze_patterns

state = {}

history = [
    {"completed": True, "difficulty": "low"},
    {"completed": True, "difficulty": "medium"},
    {"completed": False, "difficulty": "medium"},
    {"completed": False, "difficulty": "high"},
    {"completed": True, "difficulty": "low"},
    {"completed": True, "difficulty": "low"},
]

updated_state = analyze_patterns(history, state)
print(updated_state)


