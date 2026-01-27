"""
Fallback workout generator for when API calls fail.
Provides safe, reliable workout plans without external dependencies.
"""

from typing import Dict


def fallback_workout(difficulty: str) -> Dict:
    """
    Generate a safe fallback workout based on difficulty level.

    Args:
        difficulty: Difficulty level ("low", "medium", "high")

    Returns:
        Workout dictionary with warmup, main, and cooldown sections
    """

    # Ensure valid difficulty
    if difficulty not in ["low", "medium", "high"]:
        difficulty = "medium"

    workouts = {
        "low": {
            "warmup": [
                {"exercise": "Gentle marching in place", "duration": "3 min"},
                {"exercise": "Arm circles", "duration": "2 min"}
            ],
            "main": [
                {
                    "exercise": "Bodyweight Squats",
                    "sets": 2,
                    "reps": 8,
                    "rest_seconds": 90
                },
                {
                    "exercise": "Wall Push-ups",
                    "sets": 2,
                    "reps": 8,
                    "rest_seconds": 90
                },
                {
                    "exercise": "Standing Knee Raises",
                    "sets": 2,
                    "reps": 10,
                    "rest_seconds": 60
                }
            ],
            "cooldown": [
                {"exercise": "Standing hamstring stretch", "duration": "3 min"},
                {"exercise": "Deep breathing", "duration": "2 min"}
            ]
        },
        "medium": {
            "warmup": [
                {"exercise": "Jogging in place", "duration": "3 min"},
                {"exercise": "Dynamic stretches", "duration": "2 min"}
            ],
            "main": [
                {
                    "exercise": "Bodyweight Squats",
                    "sets": 3,
                    "reps": 12,
                    "rest_seconds": 60
                },
                {
                    "exercise": "Push-ups (knee or regular)",
                    "sets": 3,
                    "reps": 10,
                    "rest_seconds": 60
                },
                {
                    "exercise": "Lunges (alternating)",
                    "sets": 3,
                    "reps": 10,
                    "rest_seconds": 60
                },
                {
                    "exercise": "Plank hold",
                    "sets": 2,
                    "reps": 30,
                    "rest_seconds": 45
                }
            ],
            "cooldown": [
                {"exercise": "Full body stretch", "duration": "4 min"},
                {"exercise": "Deep breathing", "duration": "1 min"}
            ]
        },
        "high": {
            "warmup": [
                {"exercise": "High knees", "duration": "2 min"},
                {"exercise": "Jumping jacks", "duration": "2 min"},
                {"exercise": "Dynamic stretches", "duration": "1 min"}
            ],
            "main": [
                {
                    "exercise": "Jump Squats",
                    "sets": 4,
                    "reps": 15,
                    "rest_seconds": 45
                },
                {
                    "exercise": "Push-ups (regular)",
                    "sets": 4,
                    "reps": 15,
                    "rest_seconds": 45
                },
                {
                    "exercise": "Burpees",
                    "sets": 3,
                    "reps": 12,
                    "rest_seconds": 45
                },
                {
                    "exercise": "Mountain Climbers",
                    "sets": 3,
                    "reps": 20,
                    "rest_seconds": 30
                },
                {
                    "exercise": "Plank hold",
                    "sets": 3,
                    "reps": 45,
                    "rest_seconds": 30
                }
            ],
            "cooldown": [
                {"exercise": "Walking cooldown", "duration": "2 min"},
                {"exercise": "Full body stretch", "duration": "5 min"},
                {"exercise": "Deep breathing", "duration": "1 min"}
            ]
        }
    }

    return workouts[difficulty]


def quick_workout(time_minutes: int = 10) -> Dict:
    """
    Generate a quick workout for time-constrained situations.

    Args:
        time_minutes: Available time in minutes

    Returns:
        Quick workout dictionary
    """
    return {
        "warmup": [
            {"exercise": "March in place", "duration": "1 min"}
        ],
        "main": [
            {
                "exercise": "Squats",
                "sets": 2,
                "reps": 10,
                "rest_seconds": 30
            },
            {
                "exercise": "Push-ups",
                "sets": 2,
                "reps": 8,
                "rest_seconds": 30
            }
        ],
        "cooldown": [
            {"exercise": "Standing stretch", "duration": "1 min"}
        ]
    }