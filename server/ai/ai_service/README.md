# Workout Generator AI Service

## Overview
AI-powered personalized workout generation system using deterministic logic and LLM enhancement.

## Issues Fixed

### 1. Import Error in test_workout.py
**Problem:** `ImportError: cannot import name 'app' from 'main'`

**Root Cause:** The test file was trying to import `app` from a `main.py` file that either didn't exist or didn't have an `app` variable.

**Solution:** Created a complete `main.py` with FastAPI app that properly exports the `app` variable.

### 2. Inconsistent Prompt Builders
**Problem:** Two different `build_workout_prompt` functions with different signatures in `prompt_builder.py` and `gemini_prompt.py`.

**Solution:** Unified the prompt builder in `gemini_prompt.py` with a single, comprehensive signature that includes all parameters.

### 3. Missing Time Utilities
**Problem:** Files importing `utils.time.utc_now()` which didn't exist.

**Solution:** Added `utc_now()` function directly in modules that need it (`memory_engine.py`, `trend_engine.py`).

### 4. Incomplete Error Handling
**Problem:** Missing error handling in API calls and workout generation.

**Solution:** Added comprehensive try-catch blocks, validation functions, and fallback mechanisms.

### 5. Type Hints and Documentation
**Problem:** Missing type hints made code harder to debug.

**Solution:** Added proper type hints throughout all modules with detailed docstrings.

## Project Structure

```
workout-generator/
├── main.py                   # FastAPI application (FIXED)
├── difficulty_engine.py      # Difficulty adaptation logic
├── feedback_engine.py        # Feedback tracking (IMPROVED)
├── gemini_client.py          # Gemini API client (IMPROVED)
├── gemini_prompt.py          # Unified prompt builder (FIXED)
├── memory_engine.py          # AI state management (FIXED)
├── pattern_analysis.py       # Pattern detection (IMPROVED)
├── trend_engine.py           # Trend analysis with decay (FIXED)
├── weekly_report.py          # Report generation (IMPROVED)
├── workout_generator.py      # Main workout generator (FIXED)
├── fallback_workout.py       # Fallback workouts (IMPROVED)
├── test_workout.py           # Comprehensive tests (NEW)
└── requirements.txt          # Dependencies (NEW)
```

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Environment Variables
```bash
# Windows
set GEMINI_API_KEY=your_api_key_here

# Linux/Mac
export GEMINI_API_KEY=your_api_key_here
```

### 4. Run Tests
```bash
# Run all tests
pytest test_workout.py -v

# Run specific test class
pytest test_workout.py::TestDifficultyEngine -v

# Run with coverage
pytest test_workout.py --cov=. --cov-report=html
```

### 5. Start the Server
```bash
# Development mode
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Generate Workout
```bash
POST /workout/generate
Content-Type: application/json

{
  "user_id": "user123",
  "energy_level": "medium",
  "time_available": 30,
  "location": "home",
  "goal": "general fitness",
  "injuries": "none"
}
```

### Submit Feedback
```bash
POST /workout/feedback
Content-Type: application/json

{
  "user_id": "user123",
  "workout_id": "user123_2024-01-27T10:00:00",
  "difficulty": "medium",
  "completed": true,
  "rating": 5
}
```

### Get Weekly Report
```bash
GET /workout/report/{user_id}
```

### Get User State
```bash
GET /user/{user_id}/state
```

## Key Fixes Summary

1. **main.py**: Created complete FastAPI app with all endpoints
2. **gemini_prompt.py**: Unified prompt builder with all parameters
3. **memory_engine.py**: Added utc_now() function for timestamp handling
4. **trend_engine.py**: Fixed datetime handling with timezone awareness
5. **gemini_client.py**: Improved error handling and response parsing
6. **workout_generator.py**: Fixed imports and added sync wrapper for testing
7. **test_workout.py**: Created comprehensive test suite covering all modules
8. **All modules**: Added proper type hints and docstrings

## Testing in PyCharm

To fix the original error in PyCharm:

1. **Copy all fixed files** to your project directory:
   ```
   C:\Users\d12ra\PycharmProjects\quantacon\ai_service\
   ```

2. **Update your project structure**:
   ```
   ai_service/
   ├── ai_logic/
   │   ├── __init__.py
   │   ├── difficulty_engine.py
   │   ├── feedback_engine.py
   │   ├── gemini_client.py
   │   ├── gemini_prompt.py
   │   ├── memory_engine.py
   │   ├── pattern_analysis.py
   │   ├── trend_engine.py
   │   ├── weekly_report.py
   │   ├── workout_generator.py
   │   └── fallback_workout.py
   ├── tests/
   │   ├── __init__.py
   │   └── test_workout.py
   └── main.py
   ```

3. **Update imports in test_workout.py**:
   ```python
   from ai_logic.difficulty_engine import adapt_difficulty
   from ai_logic.feedback_engine import update_feedback
   # etc.
   ```

4. **Run tests**:
   ```bash
   pytest ai_service/tests/test_workout.py -v
   ```

## Common Issues and Solutions

### Issue: "ModuleNotFoundError: No module named 'utils'"
**Solution**: The fixed version includes utc_now() directly in modules. No external utils needed.

### Issue: "KeyError: 'completed'" in workout history
**Solution**: All modules now use `.get("completed", False)` with default values.

### Issue: Gemini API returns 404
**Solution**: Updated to use `gemini-2.5-flash` model which is currently available.

### Issue: Tests fail on datetime comparison
**Solution**: All datetime objects now use timezone-aware timestamps with UTC.

## Architecture Improvements

1. **Separation of Concerns**: AI logic separated from API layer
2. **Deterministic Core**: Difficulty decisions are rule-based, not LLM-based
3. **Explainable AI**: All decisions include reasoning
4. **Graceful Degradation**: Fallback workouts when API fails
5. **Type Safety**: Full type hints for better IDE support
6. **Test Coverage**: Comprehensive test suite for all modules

## Next Steps

1. Add database integration (replace in-memory storage)
2. Implement user authentication
3. Add more sophisticated pattern analysis
4. Create workout templates for different goals
5. Add exercise video/image references
6. Implement workout history visualization

## License
MIT