from pathlib import Path

from fastapi import APIRouter, HTTPException, status

from api.models.response import AnalysisResponse, ErrorResponse
from api.services import gemini_client, transformer

router = APIRouter(prefix="/cameras", tags=["Cameras"])

VIDEOS_DIR = Path(__file__).parent.parent.parent / "videos"

# Configuration for available cameras - this should be moved to a database or config file
CAMERAS = [
    {"id": "CAM-01", "filename": "video_01.mov"},
    {"id": "CAM-02", "filename": "video_02.mov"},
    {"id": "CAM-03", "filename": "video_03.mov"},
]


@router.get("", summary="List available cameras and their video URLs")
async def list_cameras() -> list[dict]:
    # In a real system, this data would come from a database or configuration
    return [
        {"id": cam["id"], "video_url": f"/videos/{cam['filename']}"}
        for cam in CAMERAS
    ]


@router.post(
    "/{cam_id}/analyze",
    response_model=AnalysisResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Camera not found"},
        502: {"model": ErrorResponse, "description": "Analysis pipeline error"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Run safety analysis on a camera's video",
)
async def analyze_camera(cam_id: str) -> AnalysisResponse:
    # Find the camera configuration
    cam = next((c for c in CAMERAS if c["id"] == cam_id), None)
    if cam is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Camera {cam_id!r} not found.")

    # Construct the video path and verify it exists
    video_path = VIDEOS_DIR / cam["filename"]
    if not video_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Video file for {cam_id} not found on disk.")

    # Read the video file
    file_bytes = video_path.read_bytes()

    try:
        # Analyze the video using Gemini client
        raw = await gemini_client.analyze_video(file_bytes, cam["filename"], "video/quicktime")
    except Exception as err:
        # Handle analysis errors with appropriate status codes
        msg = str(err)
        code = (
            status.HTTP_502_BAD_GATEWAY
            if any(t in msg.lower() for t in ("http", "pipeline", "connect"))
            else status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code=code, detail=msg) from err

    # Transform the raw analysis into structured response
    return transformer.transform(raw)
