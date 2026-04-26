import unittest
from unittest.mock import patch, MagicMock
import sys
sys.modules['ultralytics'] = MagicMock()
sys.modules['ultralytics.YOLO'] = MagicMock()
from api.routers.analyze import analyze_video
from fastapi import UploadFile
import io

class TestFallbackModelIntegration(unittest.IsolatedAsyncioTestCase):
    @patch('api.services.gemini_client.analyze_video')
    @patch('backend_yolo.detect.run_yolo_on_video')
    async def test_fallback_model_invocation(self, mock_fallback, mock_gemini):
        mock_gemini.side_effect = Exception("Primary model failure")
        mock_fallback.return_value = {"fallback": "result"}
        
        video_content = io.BytesIO(b"fake video content")
        video = UploadFile(filename="test.mp4", file=video_content)
        
        with self.assertRaises(Exception):
            await analyze_video(video)
        mock_fallback.assert_called_once()

    @patch('api.services.gemini_client.analyze_video')
    @patch('backend_yolo.detect.run_yolo_on_video')
    @patch('api.services.transformer.transform')
    async def test_analysis_completion_with_fallback(self, mock_transform, mock_fallback, mock_gemini):
        mock_gemini.side_effect = Exception("Primary model failure")
        mock_fallback.return_value = {"detections": ["person"]}
        mock_transform.return_value = {"analysis": "result"}
        
        video_content = io.BytesIO(b"fake video content")
        video = UploadFile(filename="test.mp4", file=video_content)
        
        result = await analyze_video(video)
        self.assertIsNotNone(result)
        mock_transform.assert_called_once_with(mock_fallback.return_value)

if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import patch, MagicMock
import sys
sys.modules['ultralytics'] = MagicMock()
sys.modules['ultralytics.YOLO'] = MagicMock()
from api.routers.analyze import analyze_video
from fastapi import UploadFile
import io

class TestFallbackModelIntegration(unittest.IsolatedAsyncioTestCase):
    @patch('api.services.gemini_client.analyze_video')
    @patch('backend_yolo.detect.run_yolo_on_video')
    async def test_fallback_model_invocation(self, mock_fallback, mock_gemini):
        mock_gemini.side_effect = Exception("Primary model failure")
        mock_fallback.return_value = {"fallback": "result"}
        
        video_content = io.BytesIO(b"fake video content")
        video = UploadFile(filename="test.mp4", file=video_content)
        
        with self.assertRaises(Exception):
            await analyze_video(video)
        mock_fallback.assert_called_once()

    @patch('api.services.gemini_client.analyze_video')
    @patch('backend_yolo.detect.run_yolo_on_video')
    @patch('api.services.transformer.transform')
    async def test_analysis_completion_with_fallback(self, mock_transform, mock_fallback, mock_gemini):
        mock_gemini.side_effect = Exception("Primary model failure")
        mock_fallback.return_value = {"detections": ["person"]}
        mock_transform.return_value = {"analysis": "result"}
        
        video_content = io.BytesIO(b"fake video content")
        video = UploadFile(filename="test.mp4", file=video_content)
        
        result = await analyze_video(video)
        self.assertIsNotNone(result)
        mock_transform.assert_called_once_with(mock_fallback.return_value)

if __name__ == '__main__':
    unittest.main()
