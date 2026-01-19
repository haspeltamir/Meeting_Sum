import os
import json
from openai import AsyncOpenAI
from app.prompts.analyst_v1 import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

# Initialize OpenAI Client (reuses the same env key)
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def analyze_transcript(transcript: str) -> dict:
    """
    Analyzes the transcript using GPT-4o and returns a structured JSON summary.
    """
    
    # 1. Populate the User Prompt
    user_content = USER_PROMPT_TEMPLATE.format(transcript=transcript)

    # 2. Call OpenAI API
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        response_format={"type": "json_object"},
        temperature=0.2  # Low temperature for more deterministic output
    )

    # 3. Parse and Return JSON
    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Fallback in case of malformed JSON (rare with json_object mode)
        return {"error": "Failed to parse JSON response", "raw_content": content}
