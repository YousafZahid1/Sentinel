import sys
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
sys.modules['backend_yolo.main'] = MagicMock()
sys.modules['api.services.gemini_client'] = MagicMock()
from api.main import app

client = TestClient(app)

def test_video_analysis_workflow():
    # Mock the backend_yolo service to return a dummy response
    with patch('api.routers.analyze.gemini_client.analyze_video') as mock_analyze_video:
        mock_analyze_video.return_value = {"dummy": "response"}
        
        # Upload a video file
        with open("test_video.mp4", "rb") as file:
            response = client.post("/analyze", files={"video": file})
        
        # Assert that the response is as expected
        assert response.status_code == 200
        assert response.json() == {"dummy": "response"}
import sys
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
sys.modules['backend_yolo.main'] = MagicMock()
sys.modules['api.services.gemini_client'] = MagicMock()
from api.main import app

client = TestClient(app)

def test_video_analysis_workflow():
    # Mock the backend_yolo service to return a dummy response
    with patch('api.routers.analyze.gemini_client.analyze_video') as mock_analyze_video:
        mock_analyze_video.return_value = {"dummy": "response"}
        
        # Upload a video file
        with open("test_video.mp4", "rb") as file:
            response = client.post("/analyze", files={"video": file})
        
        # Assert that the response is as expected
        assert response.status_code == 200
        assert response.json() == {"dummy": "response"}
