import json
import shutil
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from api.models.response import AnalysisResponse, ErrorResponse
from api.services import gemini_client, transformer

router = APIRouter(prefix="/cameras", tags=["Cameras"])

VIDEOS_DIR = Path(__file__).parent.parent.parent / "videos"
CAMERAS_DB = Path(__file__).parent.parent.parent / "cameras.json"
VIDEOS_DIR.mkdir(exist_ok=True)


def _load_cameras() -> list[dict]:
    if not CAMERAS_DB.exists():
        default = [
            {"id": "CAM-01", "label": "Camera 01", "filename": "video_01.mov"},
            {"id": "CAM-02", "label": "Camera 02", "filename": "video_02.mov"},
            {"id": "CAM-03", "label": "Camera 03", "filename": "video_03.mov"},
        ]
        _save_cameras(default)
        return default
    return json.loads(CAMERAS_DB.read_text())


def _save_cameras(cameras: list[dict]) -> None:
    CAMERAS_DB.write_text(json.dumps(cameras, indent=2))


@router.get("", summary="List all cameras")
async def list_cameras() -> list[dict]:
    cameras = _load_cameras()
    return [
        {
            "id": c["id"],
            "label": c.get("label", c["id"]),
            "video_url": f"/videos/{c['filename']}",
            "filename": c["filename"],
        }
        for c in cameras
        if (VIDEOS_DIR / c["filename"]).exists()
    ]


@router.post("/add", summary="Add a new camera by uploading a video")
async def add_camera(
    label: str = Form(..., description="Display name for this camera, e.g. 'Entrance Lobby'"),
    video: UploadFile = File(..., description="Video file (mp4, mov, webm)"),
) -> dict:
    cameras = _load_cameras()

    # Generate a unique ID
    existing_ids = {c["id"] for c in cameras}
    idx = len(cameras) + 1
    while f"CAM-{idx:02d}" in existing_ids:
        idx += 1
    cam_id = f"CAM-{idx:02d}"

    ext = Path(video.filename or "video.mp4").suffix.lower() or ".mp4"
    allowed = {".mp4", ".mov", ".webm"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use mp4, mov, or webm.")

    filename = f"video_{cam_id.lower().replace('-', '_')}{ext}"
    dest = VIDEOS_DIR / filename

    content = await video.read()
    dest.write_bytes(content)

    cameras.append({"id": cam_id, "label": label, "filename": filename})
    _save_cameras(cameras)

    return {"id": cam_id, "label": label, "video_url": f"/videos/{filename}", "filename": filename}


@router.delete("/{cam_id}", summary="Remove a camera")
async def remove_camera(cam_id: str, delete_video: bool = False) -> dict:
    cameras = _load_cameras()
    cam = next((c for c in cameras if c["id"] == cam_id), None)
    if cam is None:
        raise HTTPException(status_code=404, detail=f"Camera {cam_id!r} not found.")

    cameras = [c for c in cameras if c["id"] != cam_id]
    _save_cameras(cameras)

    if delete_video:
        video_path = VIDEOS_DIR / cam["filename"]
        if video_path.exists():
            video_path.unlink()

    return {"removed": cam_id, "video_deleted": delete_video}


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
    cameras = _load_cameras()
    cam = next((c for c in cameras if c["id"] == cam_id), None)
    if cam is None:
        raise HTTPException(status_code=404, detail=f"Camera {cam_id!r} not found.")

    video_path = VIDEOS_DIR / cam["filename"]
    if not video_path.exists():
        raise HTTPException(status_code=404, detail=f"Video file for {cam_id} not found on disk.")

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
