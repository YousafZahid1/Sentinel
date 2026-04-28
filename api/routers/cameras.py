from pathlib import Path

from fastapi import APIRouter, HTTPException, status

from api.models.response import AnalysisResponse, ErrorResponse
from api.services import gemini_client, transformer, camera_config

router = APIRouter(prefix="/cameras", tags=["Cameras"])

VIDEOS_DIR = Path(__file__).parent.parent.parent / "videos"


@router.get("", summary="List available cameras and their video URLs")
async def list_cameras() -> list[dict]:
    cameras = camera_config.get_camera_config()
    return [
        {"id": c["id"], "video_url": f"/videos/{c['filename']}"}
        for c in cameras
    ]


@router.post(
    "/{cam_id}/analyze",
    response_model=AnalysisResponse,
    responses={
        404: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Run safety analysis on a camera's video",
)
async def analyze_camera(cam_id: str) -> AnalysisResponse:
    cameras = camera_config.get_camera_config()
    cam = next((c for c in cameras if c["id"] == cam_id), None)
    if cam is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Camera {cam_id!r} not found.")

    video_path = VIDEOS_DIR / cam["filename"]
    if not video_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Video file for {cam_id} not found on disk.")

    file_bytes = video_path.read_bytes()

    try:
        raw = await gemini_client.analyze_video(file_bytes, cam["filename"], "video/quicktime")
    except Exception as err:
        msg = str(err)
        code = (
            status.HTTP_502_BAD_GATEWAY
            if any(t in msg for t in ("HTTP", "pipeline", "Connect"))
            else status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code=code, detail=msg) from err

    return transformer.transform(raw)
