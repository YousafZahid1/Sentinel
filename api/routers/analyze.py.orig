from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from api.models.response import AnalysisResponse, ErrorResponse
from api.services import gemini_client, transformer

router = APIRouter(prefix="/analyze", tags=["Analysis"])

ALLOWED_MIMES = {"video/mp4", "video/quicktime", "video/webm"}
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".webm"}
MAX_FILE_SIZE_MB = 100


@router.post(
    "",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"},
        502: {"model": ErrorResponse, "description": "Pipeline error"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Analyze a video for safety risks",
    description=(
        "Upload a video file (mp4, mov, webm). "
        "Sentinel analyzes motion, body pose, and audio signals then returns "
        "structured risk factors, a situational conclusion, and recommended actions."
    ),
)
async def analyze_video(
    video: UploadFile = File(..., description="Video file — mp4, mov, or webm, max 100 MB"),
) -> AnalysisResponse:
    ext = Path(video.filename or "").suffix.lower()
    if video.content_type not in ALLOWED_MIMES and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Supported formats: mp4, mov, webm.",
        )

    content = await video.read()
    if len(content) / (1024 * 1024) > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum allowed: {MAX_FILE_SIZE_MB} MB.",
        )

    try:
        raw = await gemini_client.analyze_video(content, video.filename or "video.mp4", video.content_type or "video/mp4")
    except Exception as err:
        msg = str(err)
        code = status.HTTP_502_BAD_GATEWAY if any(t in msg for t in ("HTTP", "Connect", "pipeline")) else status.HTTP_500_INTERNAL_SERVER_ERROR
        raise HTTPException(status_code=code, detail=msg) from err

    return transformer.transform(raw)
