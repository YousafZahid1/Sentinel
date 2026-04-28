"""
Pipeline proxy — forwards video to the existing Node.js server (server.js)
and returns the raw JSON it produces.

The Node.js server owns all Gemini calls; this layer never touches Gemini directly.
"""

import os
import httpx

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
    except httpx.HTTPError as e:
        # Attempt fallback model
        try:
            # Assuming YOLO is the fallback model
            return await run_yolo_fallback(file_bytes, filename)
        except Exception as fallback_err:
            raise RuntimeError(f"Primary model failed: {str(e)}. Fallback model failed: {str(fallback_err)}")


async def run_yolo_fallback(file_bytes: bytes, filename: str) -> dict:
    # Implementation to run YOLO model on the video
    # This is a placeholder and needs actual implementation
    # For example:
    # Save the file_bytes to a temporary file
    # Run YOLO on the temporary file
    # Return the results in the expected format
    pass