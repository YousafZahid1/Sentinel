"""
Sentinel FastAPI service
========================
Accepts video uploads from the frontend, runs them through the Gemini-based
analysis pipeline, and returns structured safety assessments.

Start:
    uvicorn api.main:app --reload --port 8000

Docs:
    http://localhost:8000/docs
"""

from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import analyze

app = FastAPI(
    title="Sentinel API",
    description=(
        "AI-powered safety system. Predicts → Prevents → Intervenes.\n\n"
        "Analyzes motion, body pose, and audio signals in uploaded video to "
        "anticipate dangerous situations and coordinate responses."
    ),
    version="1.0.0",
    contact={"name": "Sentinel Team"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(analyze.router)


@app.get("/health", tags=["System"], summary="Health check")
async def health() -> dict:
    return {"status": "ok", "service": "sentinel-api"}
