import os
import re
import json
import base64
import urllib.error
import urllib.request
from pathlib import Path

# Load .env from the same directory as this file
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from schemas import DiagnosisResponse, Cause, Action

API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "qwen/qwen3.8-27b"  # vision-capable model available on this account



def _extract_json(text: str) -> dict:
    """Strip markdown fences and extract the JSON object from the model response."""
    cleaned = text.strip()

    # Strip ```json ... ``` or ``` ... ``` fences
    cleaned = re.sub(r"^```[a-zA-Z]*\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())

    # Find the outermost { ... } block in case the model adds leading prose
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)

    return json.loads(cleaned)


def _coerce_to_diagnosis(data: dict) -> DiagnosisResponse:
    """
    Coerce/normalize the raw dict from the model into a valid DiagnosisResponse.
    Handles common model output quirks:
      - possible_causes as plain strings instead of {cause, likelihood} objects
      - recommended_actions as plain strings instead of {title, description, expected_result}
      - confidence as a string like "85%" instead of int 85
    """
    # --- confidence ---
    raw_conf = data.get("confidence", 0)
    if isinstance(raw_conf, str):
        raw_conf = int(re.sub(r"[^0-9]", "", raw_conf) or "0")
    data["confidence"] = max(0, min(100, int(raw_conf)))

    # --- possible_causes ---
    raw_causes = data.get("possible_causes", [])
    coerced_causes = []
    for item in raw_causes:
        if isinstance(item, str):
            coerced_causes.append({"cause": item, "likelihood": "UNKNOWN"})
        elif isinstance(item, dict):
            coerced_causes.append({
                "cause": item.get("cause", item.get("description", str(item))),
                "likelihood": item.get("likelihood", item.get("probability", "UNKNOWN")).upper(),
            })
    data["possible_causes"] = coerced_causes

    # --- recommended_actions ---
    raw_actions = data.get("recommended_actions", [])
    coerced_actions = []
    for item in raw_actions:
        if isinstance(item, str):
            coerced_actions.append({
                "title": item,
                "description": item,
                "expected_result": "Issue resolved.",
            })
        elif isinstance(item, dict):
            coerced_actions.append({
                "title": item.get("title", item.get("action", "ACTION")),
                "description": item.get("description", item.get("detail", "")),
                "expected_result": item.get("expected_result", item.get("expected", "Issue resolved.")),
            })
    data["recommended_actions"] = coerced_actions

    # --- evidence ---
    if isinstance(data.get("evidence"), str):
        data["evidence"] = [data["evidence"]]

    # --- list fields that should be lists of strings ---
    for field in ("warnings", "escalation_conditions", "evidence"):
        if not isinstance(data.get(field), list):
            data[field] = [str(data[field])] if data.get(field) else []

    return DiagnosisResponse(**data)


def _request_groq(image_bytes: bytes, mime_type: str, prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key or api_key == "your_groq_api_key_here":
        raise ValueError(
            "GROQ_API_KEY is not configured. "
            "Add your key to fixflow/backend/.env or export GROQ_API_KEY=<key>. "
            "Get a free key at https://console.groq.com"
        )

    image_data = base64.b64encode(image_bytes).decode("ascii")
    model = os.getenv("GROQ_MODEL", DEFAULT_MODEL)

    payload = {
        "model": model,
        "temperature": 0.2,
        "max_tokens": 900,           # free tier OTPM limit is 1000 — keep headroom
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert diagnostic AI for software, network, and system issues. "
                    "Return ONLY valid JSON with no markdown fences, no prose outside the JSON object. "
                    "The JSON must contain exactly these keys: "
                    "problem, category, severity, confidence, evidence, possible_causes, "
                    "diagnosis, recommended_actions, warnings, simple_explanation, "
                    "technical_explanation, ide_agent_instructions, escalation_conditions."
                ),
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{image_data}"},
                    },
                ],
            },
        ],
    }

    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "FixFlow/1.0 python-urllib/3.9",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise ValueError(f"Groq API error ({error.code}): {body}") from error
    except urllib.error.URLError as error:
        raise ValueError(f"Could not reach Groq API: {error.reason}") from error

    try:
        return result["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        raise ValueError(f"Unexpected Groq response shape: {json.dumps(result)[:400]}") from error


PROMPT_TEMPLATE = """
You are an expert diagnostic AI for software, network, and system issues.
Given a screenshot and user description, return a compact JSON diagnostic report.

User Description: {description}

Return JSON with EXACTLY these keys (keep all string values SHORT — max 2 sentences each):

- problem (string): one-line problem summary
- category (string): e.g. "NETWORK", "CONFIGURATION", "LOCAL APPLICATION"
- severity (string): CRITICAL | HIGH | MEDIUM | LOW
- confidence (integer 0-100)
- evidence (array of 2-4 short strings): facts from image or description
- possible_causes (array of 2-3 objects): each has "cause" (string) and "likelihood" (HIGH|MEDIUM|LOW)
- diagnosis (string): 1-2 sentences explaining the root cause
- recommended_actions (array of 2-3 objects): each has "title", "description", "expected_result" — keep each ≤1 sentence
- warnings (array of 0-2 strings): only include if truly dangerous actions are possible
- simple_explanation (string): 1 sentence for non-technical users
- technical_explanation (string): 1-2 sentences of precise technical detail
- escalation_conditions (array of 0-2 strings): when to call a specialist

Facts from image take priority over assumptions. Prefer reversible actions. Return JSON only.
""".strip()


def analyze_issue(image_bytes: bytes, mime_type: str, description: str,
                  memory_context: str = "") -> DiagnosisResponse:
    """
    Run vision analysis via Groq. Optionally accepts memory_context —
    a block of similar past cases retrieved from Cognee — which is prepended
    to the prompt so the model benefits from historical diagnostic knowledge.
    """
    # Build the base prompt
    base_prompt = PROMPT_TEMPLATE.format(description=description or "No additional description provided.")

    # Prepend memory context if Cognee found similar past cases
    if memory_context and memory_context.strip():
        full_prompt = (
            f"{memory_context}\n\n"
            "Use the above past cases only as supplementary context. "
            "Base your diagnosis primarily on the current image and description.\n\n"
            f"{base_prompt}"
        )
    else:
        full_prompt = base_prompt

    response_text = _request_groq(image_bytes, mime_type, full_prompt)

    if not response_text or not response_text.strip():
        raise ValueError("Groq returned an empty response.")

    try:
        raw = _extract_json(response_text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Groq response was not valid JSON. JSONDecodeError: {e}. "
            f"Raw response (first 500 chars): {response_text[:500]}"
        ) from e

    try:
        return _coerce_to_diagnosis(raw)
    except Exception as e:
        raise ValueError(f"Could not parse Groq response into DiagnosisResponse: {e}. Raw: {raw}") from e
