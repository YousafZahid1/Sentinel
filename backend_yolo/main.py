#!/usr/bin/env python3
"""
Sentinel YOLO Detection API
----------------------------
POST /detect/upload   — upload a video file, get back annotated video
POST /detect/youtube  — supply a YouTube URL, downloads + annotates
GET  /results/{name}  — download an annotated video
GET  /               — simple HTML test page
"""

import os
import uuid
import shutil
import subprocess
from pathlib import Path

import aiofiles
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from detect import run_yolo_on_video

# ---------------------------------------------------------------------------
# Directories
# ---------------------------------------------------------------------------
BASE_DIR    = Path(__file__).parent
UPLOAD_DIR  = BASE_DIR / "uploads"
OUTPUT_DIR  = BASE_DIR / "outputs"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="Sentinel YOLO Detection", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = BASE_DIR / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _unique(suffix: str) -> str:
    return f"{uuid.uuid4().hex}{suffix}"


def _cleanup(path: str) -> None:
    try:
        os.remove(path)
    except OSError:
        pass


def _convert_to_h264(src: str, dst: str) -> None:
    """Re-encode with ffmpeg so the browser can play it inline."""
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", src,
            "-vcodec", "libx264", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            dst,
        ],
        check=True,
        capture_output=True,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
async def index():
    html_path = STATIC_DIR / "index.html"
    if html_path.exists():
        return HTMLResponse(html_path.read_text())
    return HTMLResponse("<h2>Sentinel YOLO API is running. See /docs</h2>")


@app.post("/detect/upload")
async def detect_upload(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    model: str = Form("yolov8n.pt"),
    conf: float = Form(0.25),
):
    """Upload any video file and receive an annotated version."""
    suffix = Path(file.filename).suffix or ".mp4"
    input_path  = str(UPLOAD_DIR / _unique(suffix))
    raw_output  = str(OUTPUT_DIR / _unique(".mp4"))
    final_output = str(OUTPUT_DIR / _unique("_annotated.mp4"))

    # Save upload
    async with aiofiles.open(input_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    try:
        summary = run_yolo_on_video(input_path, raw_output, model_name=model, conf_threshold=conf)
    except Exception as e:
        _cleanup(input_path)
        raise HTTPException(status_code=500, detail=str(e))

    # Re-encode for browser playback
    try:
        _convert_to_h264(raw_output, final_output)
        _cleanup(raw_output)
    except Exception:
        # ffmpeg not available — serve the raw mp4v file as-is
        final_output = raw_output

    background_tasks.add_task(_cleanup, input_path)

    result_name = Path(final_output).name
    return JSONResponse({
        "status": "ok",
        "result_video": f"/results/{result_name}",
        "summary": summary,
    })


@app.post("/detect/youtube")
async def detect_youtube(
    background_tasks: BackgroundTasks,
    url: str = Form(...),
    model: str = Form("yolov8n.pt"),
    conf: float = Form(0.25),
):
    """Provide a YouTube URL and receive an annotated version of the video."""
    input_path   = str(UPLOAD_DIR / _unique(".mp4"))
    raw_output   = str(OUTPUT_DIR / _unique(".mp4"))
    final_output = str(OUTPUT_DIR / _unique("_annotated.mp4"))

    # Download with yt-dlp
    try:
        result = subprocess.run(
            [
                "yt-dlp",
                "--format", "bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4][height<=720]/best",
                "--merge-output-format", "mp4",
                "--output", input_path,
                url,
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=300,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="YouTube download timed out.")
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=f"yt-dlp error: {e.stderr[:400]}")

    if not Path(input_path).exists():
        raise HTTPException(status_code=400, detail="Download failed — file not found.")

    try:
        summary = run_yolo_on_video(input_path, raw_output, model_name=model, conf_threshold=conf)
    except Exception as e:
        _cleanup(input_path)
        raise HTTPException(status_code=500, detail=str(e))

    try:
        _convert_to_h264(raw_output, final_output)
        _cleanup(raw_output)
    except Exception:
        final_output = raw_output

    background_tasks.add_task(_cleanup, input_path)

    result_name = Path(final_output).name
    return JSONResponse({
        "status": "ok",
        "result_video": f"/results/{result_name}",
        "summary": summary,
    })


@app.get("/results/{filename}")
async def get_result(filename: str):
    """Download or stream an annotated video."""
    # Prevent path traversal
    safe_name = Path(filename).name
    file_path = OUTPUT_DIR / safe_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(
        str(file_path),
        media_type="video/mp4",
        filename=safe_name,
    )


@app.delete("/results/{filename}")
async def delete_result(filename: str):
    """Clean up a result video from the server."""
    safe_name = Path(filename).name
    file_path = OUTPUT_DIR / safe_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found.")
    file_path.unlink()
    return {"status": "deleted", "file": safe_name}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
