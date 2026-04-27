import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.main import app
from api.routers.cameras import CAMERAS, list_cameras, analyze_camera

client = TestClient(app)

class TestCameraRouter(unittest.TestCase):

    @patch('api.routers.cameras.CAMERAS', new_callable=list)
    def test_list_cameras(self, mock_cameras):
        # Arrange
        mock_cameras.return_value = [
            {"id": "CAM-01", "filename": "video_01.mov"},
            {"id": "CAM-02", "filename": "video_02.mov"}
        ]

        # Act
        response = client.get("/cameras")

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    @patch('api.routers.cameras.CAMERAS', new_callable=list)
    def test_analyze_camera_success(self, mock_cameras):
        # Arrange
        mock_cameras.return_value = [
            {"id": "CAM-01", "filename": "video_01.mov"}
        ]
        with patch('api.services.gemini_client.analyze_video') as mock_analyze_video:
            mock_analyze_video.return_value = {"analysis_result": "success"}

            # Act
            response = client.post("/cameras/CAM-01/analyze")

            # Assert
            self.assertEqual(response.status_code, 200)

    @patch('api.routers.cameras.CAMERAS', new_callable=list)
    def test_analyze_camera_not_found(self, mock_cameras):
        # Arrange
        mock_cameras.return_value = []

        # Act
        response = client.post("/cameras/non_existent_cam/analyze")

        # Assert
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.main import app
from api.routers.cameras import CAMERAS, list_cameras, analyze_camera

client = TestClient(app)

class TestCameraRouter(unittest.TestCase):

    @patch('api.routers.cameras.CAMERAS', new_callable=list)
    def test_list_cameras(self, mock_cameras):
        # Arrange
        mock_cameras.return_value = [
            {"id": "CAM-01", "filename": "video_01.mov"},
            {"id": "CAM-02", "filename": "video_02.mov"}
        ]

        # Act
        response = client.get("/cameras")

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    @patch('api.routers.cameras.CAMERAS', new_callable=list)
    def test_analyze_camera_success(self, mock_cameras):
        # Arrange
        mock_cameras.return_value = [
            {"id": "CAM-01", "filename": "video_01.mov"}
        ]
        with patch('api.services.gemini_client.analyze_video') as mock_analyze_video:
            mock_analyze_video.return_value = {"analysis_result": "success"}

            # Act
            response = client.post("/cameras/CAM-01/analyze")

            # Assert
            self.assertEqual(response.status_code, 200)

    @patch('api.routers.cameras.CAMERAS', new_callable=list)
    def test_analyze_camera_not_found(self, mock_cameras):
        # Arrange
        mock_cameras.return_value = []

        # Act
        response = client.post("/cameras/non_existent_cam/analyze")

        # Assert
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()
