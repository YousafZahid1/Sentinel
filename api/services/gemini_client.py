"""
Pipeline proxy — forwards video to the existing Node.js server (server.js)
and returns the raw JSON it produces.

The Node.js server owns all Gemini calls; this layer never touches Gemini directly.
"""

import os
import httpx
import backend_yolo.detect

PIPELINE_URL = os.getenv("PIPELINE_URL", "http://localhost:3000/analyze")
REQUEST_TIMEOUT = float(os.getenv("PIPELINE_TIMEOUT_S", "180"))


async def analyze_video(file_bytes: bytes, filename: str, content_type: str) -> dict:
    """POST video bytes to the Node.js pipeline and return its parsed JSON."""
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(
                PIPELINE_URL,
                files={"video": (filename, file_bytes, content_type)},
            )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as err:
        # Fallback to YOLO if the primary analysis fails
        return await run_yolo_fallback(file_bytes, filename)

    if response.status_code != 200:
        raise RuntimeError(
            response.json().get("error", response.text) if response.content else f"HTTP {response.status_code}"
        ) from err
    return response.json()
async def run_yolo_fallback(file_bytes: bytes, filename: str) -> dict:
    """Run YOLOv8 fallback analysis on video bytes."""
    try:
        # Create temp file to satisfy cv2.VideoCapture requirements
        with tempfile.NamedTemporaryFile(delete=True, suffix=Path(filename).suffix) as temp_file:
            temp_file.write(file_bytes)
            temp_file.flush()
            
            # Run YOLO analysis
            results = backend_yolo.detect.run_yolo_on_video(
                input_path=temp_file.name,
                output_path="output.mp4",  # This could be configurable
                model_name="yolov8n.pt"
            )
            
            # Transform YOLO results to Gemini-like format
            return _transform_yolo_results(results)
    except Exception as e:
        logger = logging.getLogger('api.gemini_client')
        logger.error(f"YOLO fallback analysis failed: {e}")
        raise RuntimeError(f"YOLO fallback failed: {str(e)}")
def _transform_yolo_results(yolo_results: dict) -> dict:
    """Convert YOLO detection results to Gemini-like format for transformer compatibility."""
    return {
        "clip_summary": {
            "overall_assessment": "Fallback analysis using YOLOv8",
            "people_detected": yolo_results.get("total_detections", 0),
        },
        "per_person": [],
        "timeline": [],
        "prediction_next_5_10s": {},
        "recommended_action": {
            "action": "monitor",
            "why": ["Primary analysis failed, using YOLO fallback"]
        }
    }
    return response.json()
