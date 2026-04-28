import unittest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
sys.modules['backend_yolo.main'] = MagicMock()
from api.main import app

class TestDockerContainerization(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "service": "sentinel-api"})

    @patch('api.routers.analyze.gemini_client.analyze_video')
    def test_analyze_video_endpoint(self, mock_analyze_video):
        mock_analyze_video.return_value = {"risk_factors": [], "conclusion": "Safe", "recommended_actions": []}
        video_content = b"fake_video_content"
        response = self.client.post("/analyze", files={"video": ("test.mp4", video_content, "video/mp4")})
        self.assertEqual(response.status_code, 200)
        self.assertIn("risk_factors", response.json())
        self.assertIn("conclusion", response.json())
        self.assertIn("recommended_actions", response.json())

if __name__ == "__main__":
    unittest.main()