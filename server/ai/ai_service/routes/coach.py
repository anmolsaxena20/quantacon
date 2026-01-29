"""
AI Coach endpoint - Provides conversational guidance for exercises.
Fixed version with no duplicate functions.
API: AIzaSyBFWXtXCBEmKUhPgX6duMcVevf0EWW0sFE
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from ai_logic.gemini_client_enhanced import get_ai_coach_guidance, call_gemini
from data_layer.ai_state_repo import get_ai_state

router = APIRouter(prefix="/coach", tags=["AI Coach"])


class CoachRequest(BaseModel):
    """Request for AI coaching guidance."""
    user_id: str
    exercise: str = Field(..., min_length=1, max_length=200)
    additional_context: Optional[str] = Field(default=None, max_length=500)

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "exercise": "Push-ups",
                "additional_context": "I feel strain in my lower back"
            }
        }


class CoachResponse(BaseModel):
    """Response with AI coaching guidance."""
    exercise: str
    guidance: str
    tips: List[str] = []
    difficulty_level: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "exercise": "Push-ups",
                "guidance": "Great choice! Let's perfect your push-up form...",
                "tips": [
                    "Keep your core engaged throughout",
                    "Lower yourself until elbows are at 90 degrees",
                    "Exhale as you push up"
                ],
                "difficulty_level": "medium"
            }
        }


class MotivationRequest(BaseModel):
    """Request for motivational message."""
    user_id: str

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }


class MotivationResponse(BaseModel):
    """Response with motivational message."""
    message: str
    user_stats: Optional[Dict] = None

    class Config:
        json_schema_extra = {
            "example": {
                "message": "You're on fire! 3 workouts this week. Keep crushing it! 💪",
                "user_stats": {
                    "trend": "improving",
                    "consistency": 0.85,
                    "current_difficulty": "medium"
                }
            }
        }


@router.post("/guidance", response_model=CoachResponse)
async def get_exercise_guidance(request: CoachRequest):
    """
    Get AI-powered coaching guidance for a specific exercise.

    This endpoint provides:
    - Step-by-step instructions
    - Form tips and common mistakes to avoid
    - Breathing cues
    - Muscle engagement information
    - Injury-specific modifications
    - Motivational encouragement

    Args:
        request: Coach request with exercise name and user context

    Returns:
        Conversational coaching guidance with tips

    Raises:
        HTTPException: If guidance generation fails
    """

    # Validate exercise name
    if not request.exercise or request.exercise.strip() == "":
        raise HTTPException(
            status_code=400,
            detail="Exercise name cannot be empty"
        )

    # Get user's AI state for context
    try:
        ai_state = await get_ai_state(request.user_id)
    except Exception as e:
        # If we can't get AI state, use defaults
        print(f"Warning: Could not retrieve AI state: {e}")
        ai_state = {}

    # Build user context
    user_context = {
        "difficulty": ai_state.get("current_difficulty", "medium"),
        "injuries": "none",  # Could be enhanced with user profile
        "goal": "general fitness",  # Could be enhanced with user profile
        "energy_level": "medium",
        "additional_context": request.additional_context
    }

    # Get AI coaching
    try:
        guidance = await get_ai_coach_guidance(
            exercise=request.exercise,
            user_context=user_context
        )
    except Exception as e:
        # Log the detailed error for debugging
        print(f"COACH ERROR: {str(e)}")
        print(f"Exercise: {request.exercise}")
        print(f"User context: {user_context}")

        # Provide fallback guidance
        guidance = generate_fallback_guidance(request.exercise, request.additional_context)

    # Extract tips from guidance
    tips = extract_tips_from_guidance(guidance, request.exercise)

    return CoachResponse(
        exercise=request.exercise,
        guidance=guidance,
        tips=tips,
        difficulty_level=ai_state.get("current_difficulty", "medium")
    )


@router.post("/motivate", response_model=MotivationResponse)
async def get_motivation(request: MotivationRequest):
    """
    Get motivational message based on user's progress.

    Args:
        request: Request with user_id

    Returns:
        Personalized motivational message with user stats

    Raises:
        HTTPException: If motivation generation fails
    """

    # Get user's AI state
    try:
        ai_state = await get_ai_state(request.user_id)
    except Exception as e:
        # Use default motivation if we can't get state
        return MotivationResponse(
            message="You're doing great! Every workout counts. Keep pushing forward! 💪",
            user_stats=None
        )

    trend = ai_state.get("trend", "stable")
    consistency = ai_state.get("consistency_score", 0.5)
    current_diff = ai_state.get("current_difficulty", "medium")

    # Create personalized motivation prompt
    prompt = f"""You are an enthusiastic and supportive fitness coach. Create a SHORT (2-3 sentences max) motivational message for a user with these stats:

User Stats:
- Current trend: {trend}
- Consistency score: {consistency:.0%}
- Current difficulty level: {current_diff}

Requirements:
- Be positive and encouraging
- Be specific to their stats
- Keep it concise (2-3 sentences max)
- End with a relevant emoji
- NO markdown formatting
- Sound natural and conversational

Generate the motivation message:"""

    try:
        response = await call_gemini(prompt, json_mode=False, max_tokens=200, temperature=0.9)
        motivation_text = response.get("response", "").strip()

        # Clean up any markdown
        motivation_text = motivation_text.replace("**", "").replace("*", "").replace("#", "")

        # If still empty or too long, use fallback
        if not motivation_text or len(motivation_text) > 300:
            motivation_text = generate_fallback_motivation(trend, consistency)

    except Exception as e:
        print(f"Warning: Could not generate motivation: {e}")
        motivation_text = generate_fallback_motivation(trend, consistency)

    user_stats = {
        "trend": trend,
        "consistency": round(consistency, 2),
        "current_difficulty": current_diff
    }

    return MotivationResponse(
        message=motivation_text,
        user_stats=user_stats
    )


@router.get("/exercises", tags=["AI Coach"])
async def list_common_exercises():
    """
    List common exercises that users can get coaching for.

    Returns:
        Categorized list of exercises with coaching available
    """
    exercises = {
        "upper_body": {
            "description": "Exercises targeting chest, shoulders, arms, and back",
            "exercises": [
                "Push-ups (all variations)",
                "Pull-ups",
                "Dips",
                "Pike Push-ups",
                "Diamond Push-ups",
                "Wide-arm Push-ups",
                "Tricep Dips",
                "Arm Circles"
            ]
        },
        "lower_body": {
            "description": "Exercises targeting legs, glutes, and calves",
            "exercises": [
                "Squats (all variations)",
                "Lunges",
                "Bulgarian Split Squats",
                "Glute Bridges",
                "Single-leg Deadlifts",
                "Calf Raises",
                "Wall Sits",
                "Step-ups"
            ]
        },
        "core": {
            "description": "Exercises targeting abs, obliques, and lower back",
            "exercises": [
                "Plank",
                "Side Plank",
                "Mountain Climbers",
                "Bicycle Crunches",
                "Russian Twists",
                "Dead Bug",
                "Bird Dog",
                "Hollow Body Hold"
            ]
        },
        "cardio": {
            "description": "High-intensity cardiovascular exercises",
            "exercises": [
                "Jumping Jacks",
                "High Knees",
                "Burpees",
                "Jump Squats",
                "Jump Rope",
                "Running in Place",
                "Skaters",
                "Box Jumps (with step)"
            ]
        },
        "full_body": {
            "description": "Compound movements engaging multiple muscle groups",
            "exercises": [
                "Burpees",
                "Mountain Climbers",
                "Bear Crawls",
                "Inchworms",
                "Turkish Get-ups"
            ]
        }
    }

    total_exercises = sum(len(cat["exercises"]) for cat in exercises.values())

    return {
        "message": "Common exercises available for AI coaching",
        "total_categories": len(exercises),
        "total_exercises": total_exercises,
        "categories": exercises,
        "note": "AI Coach can provide guidance for any exercise - not limited to this list!"
    }


def extract_tips_from_guidance(guidance: str, exercise: str) -> List[str]:
    """
    Extract tips from AI guidance text.

    Args:
        guidance: The full guidance text
        exercise: Exercise name

    Returns:
        List of extracted tips
    """
    tips = []

    # Try to extract numbered or bulleted points
    lines = guidance.split('\n')
    for line in lines:
        line = line.strip()
        # Look for lines that start with numbers, bullets, or contain key words
        if any(keyword in line.lower() for keyword in ["tip:", "remember:", "important:", "key point:"]):
            clean_tip = line.split(':', 1)[-1].strip() if ':' in line else line
            if len(clean_tip) > 10 and len(clean_tip) < 200:
                tips.append(clean_tip)

    # If we didn't find enough tips, use generic ones
    if len(tips) < 3:
        tips = generate_generic_tips(exercise)

    return tips[:5]  # Return max 5 tips


def generate_generic_tips(exercise: str) -> List[str]:
    """
    Generate generic tips for common exercises.

    Args:
        exercise: Exercise name

    Returns:
        List of tips
    """
    exercise_lower = exercise.lower()

    # Comprehensive tips database
    tips_db = {
        "push": [  # Catches push-ups, push-up, pushup, push up
            "Keep your body in a straight line from head to heels.",
            "Engage your core throughout the entire movement.",
            "Lower yourself until elbows are at 90 degrees.",
            "Exhale as you push up, inhale as you lower down."
        ],
        "squat": [
            "Keep your chest up and back straight.",
            "Push through your heels as you rise.",
            "Don't let your knees go past your toes.",
            "Lower until thighs are parallel to the ground."
        ],
        "plank": [
            "Keep your body in a straight line - don't sag or pike.",
            "Engage your core and squeeze your glutes.",
            "Breathe steadily - don't hold your breath.",
            "Keep your neck neutral, looking at the floor."
        ],
        "lunge": [
            "Keep your front knee directly over your ankle.",
            "Lower straight down, not forward.",
            "Keep your torso upright throughout.",
            "Push through your front heel to return to start."
        ],
        "burpee": [
            "Land softly when jumping.",
            "Keep your core tight throughout the movement.",
            "Maintain a steady, controlled rhythm.",
            "Modify by stepping back instead of jumping if needed."
        ],
        "mountain climber": [
            "Keep your hips level - don't let them pike up.",
            "Drive your knees toward your chest.",
            "Maintain plank position in your upper body.",
            "Keep your core engaged throughout."
        ],
        "jumping jack": [
            "Land softly on the balls of your feet.",
            "Keep your core engaged for stability.",
            "Maintain a steady, controlled rhythm.",
            "Breathe naturally - don't hold your breath."
        ],
        "pull": [  # Pull-ups, pull up
            "Start from a dead hang with arms fully extended.",
            "Pull your shoulder blades down and back.",
            "Drive your elbows down toward your hips.",
            "Control the descent - don't just drop."
        ],
        "dip": [
            "Keep your elbows close to your body.",
            "Lower until your elbows are at 90 degrees.",
            "Lean slightly forward for chest emphasis.",
            "Push through your palms to return to start."
        ]
    }

    # Find matching tips
    for key, tips in tips_db.items():
        if key in exercise_lower:
            return tips

    # Generic fallback tips
    return [
        "Focus on proper form over speed or number of reps.",
        "Breathe steadily throughout the movement.",
        "Listen to your body and modify if you feel pain.",
        "Warm up properly before attempting this exercise."
    ]


def generate_fallback_guidance(exercise: str, additional_context: Optional[str] = None) -> str:
    """
    Generate fallback guidance when AI fails.

    Args:
        exercise: Exercise name
        additional_context: Any additional context

    Returns:
        Fallback guidance text
    """
    base_guidance = f"""Great choice working on {exercise}! Here's how to do it properly:

**Starting Position**: Get into the correct starting stance with good posture and alignment.

**Movement Execution**: 
- Perform the movement with controlled, deliberate motions
- Focus on the targeted muscle groups
- Maintain proper form throughout the entire range of motion

**Breathing**: 
- Exhale during the exertion phase (the hard part)
- Inhale during the easier phase or return to starting position
- Never hold your breath

**Key Form Tips**:
- Keep your core engaged for stability
- Maintain proper spinal alignment
- Move through a full range of motion
- Quality over quantity - proper form is essential

**Common Mistakes to Avoid**:
- Using momentum instead of muscle control
- Rushing through repetitions
- Holding your breath
- Sacrificing form for more reps or weight"""

    if additional_context:
        base_guidance += f"\n\n**Note**: {additional_context}"
        base_guidance += "\nIf you're experiencing discomfort, reduce the intensity or consult with a fitness professional."

    base_guidance += "\n\nRemember: Listen to your body and progress at your own pace. You've got this! 💪"

    return base_guidance


def generate_fallback_motivation(trend: str, consistency: float) -> str:
    """
    Generate fallback motivation message based on stats.

    Args:
        trend: User's current trend
        consistency: Consistency score

    Returns:
        Motivational message
    """
    if trend == "improving" and consistency > 0.7:
        return "You're on fire! Your consistency is outstanding. Keep up this incredible momentum! 🔥"
    elif trend == "improving":
        return "Great progress! You're heading in the right direction. Keep building that consistency! 💪"
    elif consistency > 0.8:
        return "Stellar consistency! You're showing up and doing the work. That's what champions do! ⭐"
    elif consistency > 0.5:
        return "Solid effort! You're staying consistent. Every workout brings you closer to your goals! 💯"
    elif trend == "declining":
        return "Don't give up! Every champion has setbacks. Get back on track - you've got this! 🎯"
    else:
        return "Keep pushing forward! Progress isn't always linear, but you're making it happen! 🚀"