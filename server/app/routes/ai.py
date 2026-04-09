import json
from urllib import error, request

from fastapi import APIRouter, HTTPException

from app import schemas
from app.config import GEMINI_API_KEY, GEMINI_MODEL


router = APIRouter(tags=["ai"], prefix="/api")

SYSTEM_INSTRUCTION = """
You are a practical, direct microgreens advisor for Uzhavar Greens.
The user is selecting from three goals: Fitness/Health, Diabetic Diet, or Cooking/Recipes.

If they choose Fitness/Health, ask them what specific fitness goal they have (muscle, energy, immunity).
If they choose Diabetic Diet, ask them what meal type they are planning (breakfast, lunch, snacks).
If they choose Cooking/Recipes, ask them what dish type or cuisine they are cooking.

CRITICAL INSTRUCTIONS FOR RECIPES:
- Provide exactly ONE practical, realistic recipe.
- MUST use PLAIN TEXT ONLY. Do NOT use Markdown formatting like asterisks (**) or hashes (#).
- Format clearly with "Ingredients:" using dashes (-) for bullet points, and "Instructions:" using numbers (1., 2.).
- Do NOT exaggerate health claims, do NOT use excessive adjectives like "amazing" or "incredible", and avoid conversational fluff. Keep it neat, direct, and highly focused on genuine culinary value.
""".strip()


@router.post("/generate", response_model=schemas.ChatResponse)
def generate_with_ai(payload: schemas.ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI assistant is not configured on the server")

    contents = [
        {
            "role": item.role,
            "parts": [{"text": item.text}],
        }
        for item in payload.history
        if item.text.strip()
    ]
    contents.append({"role": "user", "parts": [{"text": payload.message.strip()}]})

    body = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}],
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.6,
            "maxOutputTokens": 512,
        },
    }

    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )
    req = request.Request(
        endpoint,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        detail = "AI request failed"
        try:
            error_body = json.loads(exc.read().decode("utf-8"))
            detail = error_body.get("error", {}).get("message", detail)
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=detail) from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="Unable to reach AI provider") from exc

    candidates = data.get("candidates") or []
    if not candidates:
        raise HTTPException(status_code=502, detail="AI provider returned no response")

    parts = candidates[0].get("content", {}).get("parts") or []
    text = "".join(part.get("text", "") for part in parts).strip()
    if not text:
        raise HTTPException(status_code=502, detail="AI provider returned an empty response")

    return schemas.ChatResponse(reply=text)
