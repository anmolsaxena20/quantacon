"""
Gemini prompt builder - Simple wrapper around enhanced version.
Maintains backward compatibility while using the enhanced prompt system.
"""

from ai_logic.gemini_prompt_enhanced import (
    build_workout_prompt,
    build_coach_prompt,
    validate_workout_response,
    extract_json_from_text,
    get_test_prompt
)

# Re-export everything from enhanced version
__all__ = [
    'build_workout_prompt',
    'build_coach_prompt',
    'validate_workout_response',
    'extract_json_from_text',
    'get_test_prompt'
]