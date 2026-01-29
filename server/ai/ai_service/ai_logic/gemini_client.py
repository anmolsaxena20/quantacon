"""
Gemini API client - Simple wrapper around enhanced version.
Maintains backward compatibility while using enhanced features.
"""

from ai_logic.gemini_client_enhanced import (
    call_gemini,
    generate_workout_with_ai,
    get_ai_coach_guidance,
    call_gemini_with_fallback,
    test_gemini_connection,
    GEMINI_API_KEY,
    GEMINI_MODEL
)

# Re-export everything for easy import
__all__ = [
    'call_gemini',
    'generate_workout_with_ai',
    'get_ai_coach_guidance',
    'call_gemini_with_fallback',
    'test_gemini_connection',
    'GEMINI_API_KEY',
    'GEMINI_MODEL'
]

# Verify API key on import
if __name__ == "__main__":
    print(f"Gemini API Key: {GEMINI_API_KEY[:20]}...")
    print(f"Gemini Model: {GEMINI_MODEL}")