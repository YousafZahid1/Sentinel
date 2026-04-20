import sys
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
sys.modules['backend_yolo.main'] = MagicMock()
from api.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "sentinel-api"}

def test_analyze_video_endpoint():
    with open("test_video.mp4", "rb") as file:
        response = client.post("/analyze", files={"video": file})
    assert response.status_code == 200
    # Add more assertions based on the expected response
import sys
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
sys.modules['backend_yolo.main'] = MagicMock()
from api.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "sentinel-api"}

def test_analyze_video_endpoint():
    with open("test_video.mp4", "rb") as file:
        response = client.post("/analyze", files={"video": file})
    assert response.status_code == 200
    # Add more assertions based on the expected response
