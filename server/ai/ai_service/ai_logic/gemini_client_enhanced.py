"""
Enhanced Gemini API client with retry logic and proper error handling.
NEW API Key: AIzaSyAjNBTQD7hHFXkLDOuDL86p_MyQHTS13bk
Model: gemini-2.5-flash
"""

import os
import json
import httpx
import logging
import re
import asyncio
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# NEW API KEY - Updated January 2026
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAjNBTQD7hHFXkLDOuDL86p_MyQHTS13bk")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


async def call_gemini(
    prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 4096,
    json_mode: bool = True,
    timeout: int = 60,
    max_retries: int = 3
) -> Dict:
    """
    Call Gemini API with retry logic and proper error handling.

    Args:
        prompt: The prompt to send to Gemini
        temperature: Creativity level (0.0-1.0)
        max_tokens: Maximum response tokens
        json_mode: Whether to enforce JSON response format
        timeout: Request timeout in seconds
        max_retries: Maximum number of retry attempts

    Returns:
        Parsed response from Gemini
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-api-key-here":
        raise ValueError("GEMINI_API_KEY is not set. Please set it in .env file.")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )

    generation_config = {
        "temperature": temperature,
        "maxOutputTokens": max_tokens,
        "topP": 0.95,
        "topK": 40
    }

    if json_mode:
        generation_config["responseMimeType"] = "application/json"

    payload = {
        "contents": [{
            "role": "user",
            "parts": [{"text": prompt}]
        }],
        "generationConfig": generation_config,
        "safetySettings": [
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"}
        ]
    }

    last_error = None

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(url, json=payload)

                # Handle rate limiting
                if response.status_code == 429:
                    wait_time = (attempt + 1) * 3  # 3s, 6s, 9s backoff
                    logger.warning(f"⚠️  Rate limit hit. Waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                    await asyncio.sleep(wait_time)
                    continue

                response.raise_for_status()
                data = response.json()

                # Extract text from response
                try:
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                except (KeyError, IndexError) as e:
                    logger.error(f"❌ Invalid response structure: {data}")
                    raise ValueError(f"Invalid API response structure: {e}")

                # Parse JSON if in JSON mode
                if json_mode:
                    parsed_json = parse_json_response(raw_text)
                    if parsed_json:
                        logger.info(f"✅ Gemini API call successful")
                        return parsed_json
                    else:
                        raise ValueError("Failed to parse JSON response")
                else:
                    logger.info(f"✅ Gemini API call successful")
                    return {"response": raw_text}

        except httpx.HTTPStatusError as e:
            last_error = e
            if e.response.status_code == 429:
                wait_time = (attempt + 1) * 3
                logger.warning(f"⚠️  Rate limit (429). Waiting {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
                continue
            elif e.response.status_code == 400:
                error_text = e.response.text
                logger.error(f"❌ Bad request (400): {error_text}")
                raise ValueError(f"Bad request to Gemini API: {error_text}")
            elif e.response.status_code == 403:
                logger.error(f"❌ API key invalid or quota exceeded (403)")
                raise ValueError("Gemini API key is invalid or quota exceeded. Check your key at https://makersuite.google.com/app/apikey")
            else:
                logger.error(f"❌ HTTP error {e.response.status_code}: {e.response.text}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2)
                    continue
                raise

        except httpx.RequestError as e:
            last_error = e
            logger.error(f"❌ Network error on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2)
                continue
            raise ValueError(f"Network error calling Gemini API: {e}")

        except Exception as e:
            last_error = e
            logger.error(f"❌ Unexpected error on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2)
                continue
            raise

    # If all retries failed
    raise ValueError(f"Failed after {max_retries} attempts. Last error: {last_error}")


def parse_json_response(raw_text: str) -> Optional[Dict]:
    """
    Parse JSON response with auto-repair for common issues.

    Args:
        raw_text: Raw text from Gemini response

    Returns:
        Parsed JSON dict or None if parsing fails
    """
    try:
        # Try direct parsing first
        return json.loads(raw_text)
    except json.JSONDecodeError:
        logger.warning("⚠️  Direct JSON parse failed. Attempting cleanup...")

    # Clean up markdown formatting
    cleaned = raw_text.replace("```json", "").replace("```", "").strip()

    # Fix common JSON issues
    # 1. Missing commas between objects
    cleaned = re.sub(r'\}\s*\{', '},{', cleaned)
    cleaned = re.sub(r'\]\s*\{', '],{', cleaned)

    # 2. Fix trailing commas
    cleaned = re.sub(r",\s*([\]}])", r"\1", cleaned)

    # 3. Balance quotes
    if cleaned.count('"') % 2 != 0:
        cleaned += '"'

    # 4. Balance brackets
    cleaned += ']' * max(0, (cleaned.count('[') - cleaned.count(']')))
    cleaned += '}' * max(0, (cleaned.count('{') - cleaned.count('}')))

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parse failed even after cleanup: {e}")
        logger.error(f"Cleaned text (first 500 chars): {cleaned[:500]}...")
        return None


async def generate_workout_with_ai(
    difficulty: str,
    energy_level: str,
    time_available: int,
    location: str,
    ai_state: Dict,
    goal: str = "general fitness",
    injuries: str = "none"
) -> Dict:
    """
    Generate workout using Gemini AI with enhanced prompting.
    """
    try:
        from ai_logic.gemini_prompt_enhanced import build_workout_prompt, validate_workout_response
    except ImportError:
        from gemini_prompt_enhanced import build_workout_prompt, validate_workout_response

    prompt = build_workout_prompt(
        difficulty, energy_level, time_available,
        location, ai_state, goal, injuries
    )

    try:
        logger.info(f"🏋️  Generating workout: difficulty={difficulty}, energy={energy_level}, time={time_available}min")
        workout = await call_gemini(prompt=prompt, json_mode=True, max_tokens=2000)

        if not validate_workout_response(workout):
            logger.warning("⚠️  Generated workout failed validation, using fallback")
            raise ValueError("Invalid workout structure")

        logger.info(f"✅ Workout generated successfully via AI")
        return workout

    except Exception as e:
        logger.error(f"❌ Workout generation failed: {e}. Using fallback.")
        try:
            from ai_logic.fallback_workout import fallback_workout
        except ImportError:
            from fallback_workout import fallback_workout
        return fallback_workout(difficulty)


async def get_ai_coach_guidance(exercise: str, user_context: Dict) -> str:
    """
    Get conversational coaching guidance for an exercise using AI.
    """
    try:
        from ai_logic.gemini_prompt_enhanced import build_coach_prompt
    except ImportError:
        from gemini_prompt_enhanced import build_coach_prompt

    prompt = build_coach_prompt(exercise, user_context)

    try:
        logger.info(f"💪 Getting AI coaching for: {exercise}")
        response = await call_gemini(
            prompt=prompt,
            temperature=0.8,
            max_tokens=800,
            json_mode=False
        )

        coaching = response.get("response", "").strip()
        if len(coaching) < 50:
            raise ValueError("Coaching response too short")

        logger.info(f"✅ AI coaching received for {exercise}")
        return coaching

    except Exception as e:
        logger.error(f"❌ AI Coach failed for {exercise}: {e}. Using fallback.")
        return generate_fallback_coaching(exercise, user_context)


def generate_fallback_coaching(exercise: str, user_context: Dict) -> str:
    """
    Generate fallback coaching when AI fails.
    """
    difficulty = user_context.get("difficulty", "medium")

    return f"""Great choice working on {exercise}!

**Proper Form**:
1. Start in the correct position with good posture
2. Move with control - no rushing or using momentum
3. Keep your core engaged throughout
4. Breathe steadily - exhale on exertion, inhale on return

**Key Tips**:
- Focus on the targeted muscles
- Quality over quantity - perfect form is essential
- Listen to your body and modify if needed
- Start with {difficulty} intensity and progress gradually

**Breathing**: Exhale during the hard part, inhale during the easier phase.

Remember: Proper form prevents injuries and maximizes results. You've got this! 💪"""


async def test_gemini_connection() -> bool:
    """
    Test if Gemini API is accessible and working.

    Returns:
        True if connection successful, False otherwise
    """
    try:
        logger.info(f"🧪 Testing Gemini API connection...")
        logger.info(f"   API Key: {GEMINI_API_KEY[:20]}...")
        logger.info(f"   Model: {GEMINI_MODEL}")

        response = await call_gemini(
            prompt='Respond with a JSON object: {"status": "ready", "message": "Connection successful"}',
            json_mode=True,
            max_tokens=50,
            timeout=15
        )

        if response and response.get("status") == "ready":
            logger.info("✅ Gemini API connection successful!")
            return True
        else:
            logger.warning(f"⚠️  Gemini API responded but with unexpected format: {response}")
            return False

    except Exception as e:
        logger.error(f"❌ Gemini API connection test failed: {e}")
        return False


async def call_gemini_with_fallback(
    prompt: str,
    fallback_response: Optional[Dict] = None,
    **kwargs
) -> Dict:
    """
    Call Gemini API with automatic fallback on error.
    """
    try:
        return await call_gemini(prompt, **kwargs)
    except Exception as e:
        logger.error(f"❌ Gemini API error: {e}")
        if fallback_response:
            logger.info("ℹ️  Using fallback response")
            return fallback_response
        raise


# Quick test function
if __name__ == "__main__":
    async def quick_test():
        print("="*60)
        print("🧪 Testing Gemini API Connection")
        print("="*60)
        print(f"API Key: {GEMINI_API_KEY[:20]}...")
        print(f"Model: {GEMINI_MODEL}")
        print()

        result = await test_gemini_connection()
        print()
        print("="*60)
        if result:
            print("✅ SUCCESS! Gemini API is working!")
        else:
            print("❌ FAILED! Check your API key and quota")
        print("="*60)

    import asyncio
    asyncio.run(quick_test())