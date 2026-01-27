"""
Gemini API client for workout generation.
Handles API calls and response parsing.
"""

import os
import json
import httpx
from typing import Dict, Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"


async def call_gemini(prompt: str, timeout: int = 30) -> Dict:
    """
    Call Gemini API with the given prompt.

    Args:
        prompt: The prompt to send to Gemini
        timeout: Request timeout in seconds

    Returns:
        Parsed JSON response from Gemini

    Raises:
        ValueError: If API key is missing or response parsing fails
        httpx.HTTPError: If API request fails
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.9,
            "maxOutputTokens": 800,
            "responseMimeType": "application/json"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()

        data = response.json()

        # Extract the generated text
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]

        # Parse JSON response
        return json.loads(raw_text)

    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected API response structure: {e}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON from Gemini response: {e}")
    except httpx.HTTPError as e:
        raise ValueError(f"API request failed: {e}")


async def call_gemini_with_fallback(prompt: str, fallback_response: Optional[Dict] = None) -> Dict:
    """
    Call Gemini API with automatic fallback on error.

    Args:
        prompt: The prompt to send to Gemini
        fallback_response: Response to return if API call fails

    Returns:
        API response or fallback response
    """
    try:
        return await call_gemini(prompt)
    except Exception as e:
        print(f"Gemini API error: {e}")
        if fallback_response:
            return fallback_response
        raise