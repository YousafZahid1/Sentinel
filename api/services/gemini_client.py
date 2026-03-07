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
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(
            PIPELINE_URL,
            files={"video": (filename, file_bytes, content_type)},
        )

    if response.status_code != 200:
        raise RuntimeError(
            response.json().get("error", response.text) if response.content else f"HTTP {response.status_code}"
        )

    return response.json()
