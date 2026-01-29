"""
Comprehensive test suite for workout generation system.
"""

import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch

# Import modules to test
from ai_logic.difficulty_engine import adapt_difficulty
from ai_logic.feedback_engine import update_feedback, get_success_rate
from ai_logic.memory_engine import initialize_ai_state, normalize_ai_state, get_ai_state_summary
from ai_logic.pattern_analysis import analyze_patterns, detect_skip_patterns
from ai_logic.trend_engine import apply_decay, detect_trend, calculate_momentum
from ai_logic.weekly_report import generate_weekly_report
from ai_logic.fallback_workout import fallback_workout, quick_workout


class TestDifficultyEngine:
    """Test difficulty adaptation logic."""

    def test_new_user_starts_low(self):
        """New users should start with low difficulty."""
        result = adapt_difficulty(
            ai_state=None,
            workout_history=[],
            energy_level="medium"
        )
        assert result["difficulty"] == "low"
        assert result["ai_state"]["current_difficulty"] == "low"

    def test_low_energy_forces_low_difficulty(self):
        """Low energy should force low difficulty."""
        ai_state = initialize_ai_state()
        ai_state["current_difficulty"] = "high"

        result = adapt_difficulty(
            ai_state=ai_state,
            workout_history=[],
            energy_level="low"
        )
        assert result["difficulty"] == "low"
        assert "low energy" in result["ai_state"]["last_decision"]["reason"]

    def test_high_consistency_increases_difficulty(self):
        """High consistency with high energy should increase difficulty."""
        ai_state = initialize_ai_state()
        ai_state["current_difficulty"] = "low"

        # Create history with high completion rate
        workout_history = [
            {"completed": True, "created_at": datetime.now(timezone.utc) - timedelta(days=i)}
            for i in range(5)
        ]

        result = adapt_difficulty(
            ai_state=ai_state,
            workout_history=workout_history,
            energy_level="high"
        )
        assert result["difficulty"] in ["medium", "high"]

    def test_skip_risk_lowers_difficulty(self):
        """High skip risk should lower difficulty."""
        ai_state = initialize_ai_state()

        # Create history with many skips
        workout_history = [
            {"completed": False, "created_at": datetime.now(timezone.utc) - timedelta(days=i)}
            for i in range(4)
        ]

        result = adapt_difficulty(
            ai_state=ai_state,
            workout_history=workout_history,
            energy_level="medium"
        )
        assert result["difficulty"] == "low"
        assert "high skip risk" in result["ai_state"]["last_decision"]["reason"]


class TestFeedbackEngine:
    """Test feedback tracking."""

    def test_update_feedback_initializes_state(self):
        """Feedback should initialize empty state."""
        result = update_feedback(None, {"difficulty": "medium", "completed": True})
        assert "difficulty_success_rate" in result
        assert result["difficulty_success_rate"]["medium"]["success"] == 1

    def test_update_feedback_tracks_success(self):
        """Feedback should track successful completions."""
        ai_state = {"difficulty_success_rate": {
            "low": {"success": 0, "fail": 0},
            "medium": {"success": 0, "fail": 0},
            "high": {"success": 0, "fail": 0}
        }}

        result = update_feedback(ai_state, {"difficulty": "high", "completed": True})
        assert result["difficulty_success_rate"]["high"]["success"] == 1
        assert result["difficulty_success_rate"]["high"]["fail"] == 0

    def test_update_feedback_tracks_failure(self):
        """Feedback should track skipped workouts."""
        ai_state = {"difficulty_success_rate": {
            "low": {"success": 0, "fail": 0},
            "medium": {"success": 0, "fail": 0},
            "high": {"success": 0, "fail": 0}
        }}

        result = update_feedback(ai_state, {"difficulty": "medium", "completed": False})
        assert result["difficulty_success_rate"]["medium"]["success"] == 0
        assert result["difficulty_success_rate"]["medium"]["fail"] == 1

    def test_get_success_rate(self):
        """Success rate calculation should work correctly."""
        ai_state = {"difficulty_success_rate": {
            "medium": {"success": 7, "fail": 3}
        }}

        rate = get_success_rate(ai_state, "medium")
        assert rate == 0.7


class TestMemoryEngine:
    """Test AI state management."""

    def test_initialize_ai_state(self):
        """State initialization should create proper structure."""
        state = initialize_ai_state()
        assert "current_difficulty" in state
        assert "difficulty_success_rate" in state
        assert state["current_difficulty"] == "low"

    def test_normalize_ai_state(self):
        """State normalization should add decision tracking."""
        state = {}
        result = normalize_ai_state(state, "medium", ["test reason"])

        assert "last_decision" in result
        assert result["last_decision"]["difficulty"] == "medium"
        assert "test reason" in result["last_decision"]["reason"]
        assert "timestamp" in result["last_decision"]

    def test_get_ai_state_summary(self):
        """State summary should extract key metrics."""
        state = initialize_ai_state()
        summary = get_ai_state_summary(state)

        assert "current_difficulty" in summary
        assert "consistency_score" in summary
        assert "trend" in summary


class TestPatternAnalysis:
    """Test pattern detection."""

    def test_analyze_patterns_empty_history(self):
        """Empty history should return unchanged state."""
        ai_state = {}
        result = analyze_patterns([], ai_state)
        assert result == ai_state

    def test_analyze_patterns_calculates_completion_rate(self):
        """Pattern analysis should calculate completion rate."""
        history = [
            {"completed": True, "difficulty": "low"},
            {"completed": True, "difficulty": "low"},
            {"completed": False, "difficulty": "low"}
        ]
        ai_state = {}

        result = analyze_patterns(history, ai_state)
        assert result["completion_rate"] == 0.67  # 2/3 rounded

    def test_detect_skip_patterns(self):
        """Skip pattern detection should work correctly."""
        history = [
            {"completed": False},
            {"completed": False},
            {"completed": True},
            {"completed": False}
        ]

        result = detect_skip_patterns(history)
        assert result["skip_count"] == 3
        assert result["skip_streak"] == 1
        assert result["skip_rate"] == 0.75


class TestTrendEngine:
    """Test trend detection and decay."""

    def test_apply_decay_empty_history(self):
        """Empty history should return default score."""
        score = apply_decay([])
        assert score == 1.0

    def test_apply_decay_recent_workouts_dominate(self):
        """Recent workouts should have more weight."""
        history = [
            {"completed": False, "created_at": datetime.now(timezone.utc) - timedelta(days=20)},
            {"completed": True, "created_at": datetime.now(timezone.utc) - timedelta(days=1)}
        ]

        score = apply_decay(history)
        assert score > 0.5  # Recent completion should dominate old skip

    def test_detect_trend_improving(self):
        """Trend detection should identify improvement."""
        result = detect_trend(0.8, 0.5)
        assert result["direction"] == "improving"
        assert result["confidence"] > 0

    def test_detect_trend_declining(self):
        """Trend detection should identify decline."""
        result = detect_trend(0.4, 0.7)
        assert result["direction"] == "declining"

    def test_detect_trend_stable(self):
        """Trend detection should identify stability."""
        result = detect_trend(0.6, 0.65)
        assert result["direction"] == "stable"

    def test_calculate_momentum(self):
        """Momentum calculation should work for recent window."""
        now = datetime.now(timezone.utc)
        history = [
            {"completed": True, "created_at": now - timedelta(days=2)},
            {"completed": True, "created_at": now - timedelta(days=3)},
            {"completed": False, "created_at": now - timedelta(days=10)}  # Outside window
        ]

        momentum = calculate_momentum(history, window_days=7)
        assert momentum == 1.0  # Only recent workouts count


class TestWeeklyReport:
    """Test report generation."""

    def test_generate_weekly_report_empty(self):
        """Empty history should return new user message."""
        report = generate_weekly_report([], {})
        assert "No workouts" in report["summary"]
        assert report["consistency"] == "0%"

    def test_generate_weekly_report_perfect_week(self):
        """Perfect completion should generate positive report."""
        history = [
            {"completed": True, "created_at": datetime.now(timezone.utc) - timedelta(days=i)}
            for i in range(7)
        ]
        ai_state = {"trend": "improving", "skip_risk": "low"}

        report = generate_weekly_report(history, ai_state)
        assert report["consistency"] == "100%"
        assert report["workouts_completed"] == 7
        assert "Excellent" in report["summary"] or "all" in report["summary"]

    def test_generate_weekly_report_partial_completion(self):
        """Partial completion should generate appropriate report."""
        history = [
            {"completed": True if i % 2 == 0 else False,
             "created_at": datetime.now(timezone.utc) - timedelta(days=i)}
            for i in range(6)
        ]
        ai_state = {"trend": "stable", "skip_risk": "medium"}

        report = generate_weekly_report(history, ai_state)
        assert "3" in report["summary"]  # 3 completed
        assert report["workouts_completed"] == 3


class TestFallbackWorkout:
    """Test fallback workout generation."""

    def test_fallback_workout_low(self):
        """Low difficulty fallback should be appropriate."""
        workout = fallback_workout("low")
        assert "warmup" in workout
        assert "main" in workout
        assert "cooldown" in workout
        assert len(workout["main"]) > 0
        assert workout["main"][0]["sets"] <= 3

    def test_fallback_workout_high(self):
        """High difficulty fallback should be challenging."""
        workout = fallback_workout("high")
        assert len(workout["main"]) >= 4
        # High difficulty should have more reps or sets
        assert any(ex["sets"] >= 3 for ex in workout["main"])

    def test_fallback_workout_invalid_difficulty(self):
        """Invalid difficulty should default to medium."""
        workout = fallback_workout("extreme")
        assert workout is not None
        assert "main" in workout

    def test_quick_workout(self):
        """Quick workout should be short and simple."""
        workout = quick_workout(10)
        assert len(workout["main"]) <= 3
        assert all(ex["rest_seconds"] <= 60 for ex in workout["main"])


class TestIntegration:
    """Integration tests for the full workflow."""

    def test_full_workout_generation_flow(self):
        """Test complete workflow from new user to workout."""
        # Step 1: Initialize
        ai_state = initialize_ai_state()
        workout_history = []

        # Step 2: Adapt difficulty
        result = adapt_difficulty(ai_state, workout_history, "medium")
        assert result["difficulty"] == "low"  # New user starts low

        ai_state = result["ai_state"]

        # Step 3: Simulate workout completion
        workout_history.append({
            "completed": True,
            "difficulty": "low",
            "created_at": datetime.now(timezone.utc)
        })

        # Step 4: Update feedback
        ai_state = update_feedback(ai_state, {
            "difficulty": "low",
            "completed": True
        })

        # Step 5: Analyze patterns
        ai_state = analyze_patterns(workout_history, ai_state)

        # Step 6: Generate report
        report = generate_weekly_report(workout_history, ai_state)
        assert report["workouts_completed"] == 1

    def test_progression_over_multiple_workouts(self):
        """Test that difficulty increases with consistent completion."""
        ai_state = initialize_ai_state()
        workout_history = []

        # Complete 5 low difficulty workouts
        for i in range(5):
            result = adapt_difficulty(ai_state, workout_history, "high")
            ai_state = result["ai_state"]

            workout_history.append({
                "completed": True,
                "difficulty": result["difficulty"],
                "created_at": datetime.now(timezone.utc) - timedelta(days=5 - i)
            })

            ai_state = update_feedback(ai_state, {
                "difficulty": result["difficulty"],
                "completed": True
            })

        # After consistent completion, difficulty should increase
        final_result = adapt_difficulty(ai_state, workout_history, "high")
        assert final_result["difficulty"] in ["medium", "high"]


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])