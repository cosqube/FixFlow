import os
import asyncio
from pathlib import Path

# Load .env before anything else
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from schemas import DiagnosisResponse
from ai_service import analyze_issue
from demo_data import DEMO_SCENARIOS
import memory_service

VALID_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB

app = FastAPI(title="FixFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_check():
    key = os.getenv("GROQ_API_KEY", "").strip()
    if not key or key == "your_groq_api_key_here":
        print("\n" + "=" * 60)
        print("  WARNING: GROQ_API_KEY is not set.")
        print("  Live analysis will fail. Demo mode is still available.")
        print("  Add your key to:  fixflow/backend/.env")
        print("  Get a free key:   https://console.groq.com")
        print("=" * 60 + "\n")
    else:
        model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
        print(f"[FixFlow] Groq API key loaded. Model: {model}")

    # Warm up Cognee (best-effort — won't block startup if it fails)
    if memory_service.is_memory_active():
        print("[FixFlow] Cognee case memory: ACTIVE")
        asyncio.create_task(memory_service._initialize_cognee())
    else:
        print("[FixFlow] Cognee case memory: INACTIVE (install cognee + set GROQ_API_KEY)")


@app.get("/health")
def health_check():
    key = os.getenv("GROQ_API_KEY", "").strip()
    return {
        "status": "ok",
        "ai_provider": "groq",
        "ai_configured": bool(key) and key != "your_groq_api_key_here",
        "ai_model": os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b"),
        "memory_active": memory_service.is_memory_active(),
        "memory_provider": "cognee" if memory_service.is_memory_active() else None,
    }


@app.get("/demos")
def list_demos():
    return {
        "demos": [
            {"id": "local_application", "name": "LOCAL APPLICATION", "description": "Connection refused"},
            {"id": "network", "name": "NETWORK", "description": "Connected without internet"},
            {"id": "configuration", "name": "CONFIGURATION", "description": "Missing environment variable"},
        ]
    }


@app.post("/analyze", response_model=DiagnosisResponse)
async def analyze(
    description: str = Form(...),
    file: Optional[UploadFile] = File(None),
    demo_id: Optional[str] = Form(None),
):
    # ── Demo mode (no AI, no memory) ──
    if demo_id:
        if demo_id not in DEMO_SCENARIOS:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown demo_id '{demo_id}'. Valid: {list(DEMO_SCENARIOS.keys())}"
            )
        return DEMO_SCENARIOS[demo_id]

    # ── Live analysis ──
    if not file:
        raise HTTPException(
            status_code=422,
            detail="'file' is required for live analysis. Use 'demo_id' for demo mode."
        )

    content_type = (file.content_type or "").lower()
    if content_type not in VALID_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{content_type}'. Accepted: PNG, JPG, WEBP."
        )

    image_bytes = await file.read()

    if len(image_bytes) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")
    if len(image_bytes) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    # ── Step 1: Recall similar past cases from Cognee memory ──
    memory_context = await memory_service.recall_similar_cases(description)

    try:
        # ── Step 2: Run Groq vision analysis (with memory context injected) ──
        result = analyze_issue(image_bytes, content_type, description,
                               memory_context=memory_context or "")

        # ── Step 3: Store this case in Cognee memory (fire-and-forget) ──
        asyncio.create_task(
            memory_service.remember_case(
                problem=result.problem,
                category=result.category,
                severity=result.severity,
                evidence=result.evidence,
                diagnosis=result.diagnosis,
                actions=[a.title for a in result.recommended_actions],
                description=description,
            )
        )

        return result

    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {type(e).__name__}: {e}")
