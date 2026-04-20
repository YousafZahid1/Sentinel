import sys
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
sys.modules['detect'] = MagicMock()
from backend_yolo.main import app

client = TestClient(app)

def test_detect_upload_endpoint():
    with open("test_video.mp4", "rb") as file:
        response = client.post("/detect/upload", files={"file": file})
    assert response.status_code == 200
    # Add more assertions based on the expected response

def test_get_result_endpoint():
    response = client.get("/results/test_video.mp4")
    assert response.status_code == 200
    # Add more assertions based on the expected response
import sys
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
sys.modules['detect'] = MagicMock()
from backend_yolo.main import app

client = TestClient(app)

def test_detect_upload_endpoint():
    with open("test_video.mp4", "rb") as file:
        response = client.post("/detect/upload", files={"file": file})
    assert response.status_code == 200
    # Add more assertions based on the expected response

def test_get_result_endpoint():
    response = client.get("/results/test_video.mp4")
    assert response.status_code == 200
    # Add more assertions based on the expected response
