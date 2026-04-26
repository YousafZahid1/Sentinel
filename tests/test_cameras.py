import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from api.routers.cameras import router
from api.main import app

app.include_router(router)

client = TestClient(app)

class TestCameraAnalysis(unittest.TestCase):
    @patch('api.routers.cameras.gemini_client.analyze_video')
    @patch('api.routers.cameras.transformer.transform')
    def test_analyze_camera_success(self, mock_transform, mock_analyze_video):
        mock_analyze_video.return_value = {'raw': 'analysis'}
        mock_transform.return_value = {'analysis': 'result'}
        
        response = client.post("/cameras/CAM-01/analyze")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'analysis': 'result'})

    @patch('api.routers.cameras.gemini_client.analyze_video')
    def test_analyze_camera_failure(self, mock_analyze_video):
        mock_analyze_video.side_effect = Exception('Analysis failed')
        
        response = client.post("/cameras/CAM-01/analyze")
        self.assertEqual(response.status_code, 500)

if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from api.routers.cameras import router
from api.main import app

app.include_router(router)

client = TestClient(app)

class TestCameraAnalysis(unittest.TestCase):
    @patch('api.routers.cameras.gemini_client.analyze_video')
    @patch('api.routers.cameras.transformer.transform')
    def test_analyze_camera_success(self, mock_transform, mock_analyze_video):
        mock_analyze_video.return_value = {'raw': 'analysis'}
        mock_transform.return_value = {'analysis': 'result'}
        
        response = client.post("/cameras/CAM-01/analyze")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'analysis': 'result'})

    @patch('api.routers.cameras.gemini_client.analyze_video')
    def test_analyze_camera_failure(self, mock_analyze_video):
        mock_analyze_video.side_effect = Exception('Analysis failed')
        
        response = client.post("/cameras/CAM-01/analyze")
        self.assertEqual(response.status_code, 500)

if __name__ == '__main__':
    unittest.main()
