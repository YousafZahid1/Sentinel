import unittest
from unittest.mock import patch, mock_open
import yaml
from api.routers.cameras import list_cameras, load_camera_config

class TestCamerasRouter(unittest.TestCase):

    @patch('api.routers.cameras.CONFIG_PATH', 'config/cameras.yaml')
    @patch('api.routers.cameras.load_camera_config')
    def test_list_cameras_valid_config(self, mock_load_camera_config):
        # Mock valid camera configuration
        mock_cameras = [
            {"id": "CAM-01", "filename": "video_01.mov"},
            {"id": "CAM-02", "filename": "video_02.mov"}
        ]
        mock_load_camera_config.return_value = mock_cameras
        
        # Call list_cameras and verify the result
        cameras = list_cameras()
        expected_output = [
            {"id": "CAM-01", "video_url": "/videos/video_01.mov"},
            {"id": "CAM-02", "video_url": "/videos/video_02.mov"}
        ]
        self.assertEqual(cameras, expected_output)

    @patch('api.routers.cameras.CONFIG_PATH', 'config/empty_cameras.yaml')
    @patch('builtins.open', new_callable=mock_open, read_data='')
    def test_list_cameras_empty_config(self, mock_file):
        # Test with an empty YAML file
        cameras = load_camera_config()
        self.assertEqual(cameras, [])

    @patch('api.routers.cameras.CONFIG_PATH', 'config/invalid_cameras.yaml')
    @patch('builtins.open', new_callable=mock_open, read_data='invalid yaml')
    def test_list_cameras_invalid_config(self, mock_file):
        # Test with an invalid YAML file
        with self.assertRaises(yaml.YAMLError):
            load_camera_config()

if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import patch, mock_open
import yaml
from api.routers.cameras import list_cameras, load_camera_config

class TestCamerasRouter(unittest.TestCase):

    @patch('api.routers.cameras.CONFIG_PATH', 'config/cameras.yaml')
    @patch('api.routers.cameras.load_camera_config')
    def test_list_cameras_valid_config(self, mock_load_camera_config):
        # Mock valid camera configuration
        mock_cameras = [
            {"id": "CAM-01", "filename": "video_01.mov"},
            {"id": "CAM-02", "filename": "video_02.mov"}
        ]
        mock_load_camera_config.return_value = mock_cameras
        
        # Call list_cameras and verify the result
        cameras = list_cameras()
        expected_output = [
            {"id": "CAM-01", "video_url": "/videos/video_01.mov"},
            {"id": "CAM-02", "video_url": "/videos/video_02.mov"}
        ]
        self.assertEqual(cameras, expected_output)

    @patch('api.routers.cameras.CONFIG_PATH', 'config/empty_cameras.yaml')
    @patch('builtins.open', new_callable=mock_open, read_data='')
    def test_list_cameras_empty_config(self, mock_file):
        # Test with an empty YAML file
        cameras = load_camera_config()
        self.assertEqual(cameras, [])

    @patch('api.routers.cameras.CONFIG_PATH', 'config/invalid_cameras.yaml')
    @patch('builtins.open', new_callable=mock_open, read_data='invalid yaml')
    def test_list_cameras_invalid_config(self, mock_file):
        # Test with an invalid YAML file
        with self.assertRaises(yaml.YAMLError):
            load_camera_config()

if __name__ == '__main__':
    unittest.main()
