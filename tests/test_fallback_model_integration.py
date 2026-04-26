import unittest
from unittest.mock import patch, MagicMock
import sys
from fastapi.testclient import TestClient
from api.routers.analyze import router

sys.modules['backend_yolo.detect'] = MagicMock()
sys.modules['ultralytics'] = MagicMock()
sys.modules['ultralytics.YOLO'] = MagicMock()

class TestFallbackModelIntegration(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(router)

    @patch('api.services.gemini_client.analyze_video')
    async def test_analyze_video_fallback_success(self, mock_analyze_video):
        mock_analyze_video.side_effect = [
            RuntimeError("Primary model failed"),
            {"analysis": "Fallback model success"}
        ]
        
        response = await self.client.post(
            "/analyze",
            files={"video": ("test.mp4", b"video_content", "video/mp4")}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"analysis": "Fallback model success"})

    @patch('api.services.gemini_client.analyze_video')
    async def test_analyze_video_fallback_failure(self, mock_analyze_video):
        mock_analyze_video.side_effect = [
            RuntimeError("Primary model failed"),
            RuntimeError("Fallback model failed")
        ]
        
        response = await self.client.post(
            "/analyze",
            files={"video": ("test.mp4", b"video_content", "video/mp4")}
        )
        self.assertEqual(response.status_code, 502)

if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import patch, MagicMock
import sys
from fastapi.testclient import TestClient
from api.routers.analyze import router

sys.modules['backend_yolo.detect'] = MagicMock()
sys.modules['ultralytics'] = MagicMock()
sys.modules['ultralytics.YOLO'] = MagicMock()

class TestFallbackModelIntegration(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(router)

    @patch('api.services.gemini_client.analyze_video')
    async def test_analyze_video_fallback_success(self, mock_analyze_video):
        mock_analyze_video.side_effect = [
            RuntimeError("Primary model failed"),
            {"analysis": "Fallback model success"}
        ]
        
        response = await self.client.post(
            "/analyze",
            files={"video": ("test.mp4", b"video_content", "video/mp4")}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"analysis": "Fallback model success"})

    @patch('api.services.gemini_client.analyze_video')
    async def test_analyze_video_fallback_failure(self, mock_analyze_video):
        mock_analyze_video.side_effect = [
            RuntimeError("Primary model failed"),
            RuntimeError("Fallback model failed")
        ]
        
        response = await self.client.post(
            "/analyze",
            files={"video": ("test.mp4", b"video_content", "video/mp4")}
        )
        self.assertEqual(response.status_code, 502)

if __name__ == '__main__':
    unittest.main()
