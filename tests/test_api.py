import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

class TestFeedbackEndpoint(unittest.TestCase):
    @patch('api.routers.analyze.feedback_service.submit_feedback')
    def test_submit_feedback_success(self, mock_submit_feedback):
        mock_submit_feedback.return_value = None
        response = client.post("/analyze/feedback", json={"feedback": "Test feedback"})
        self.assertEqual(response.status_code, 200)

    @patch('api.routers.analyze.feedback_service.submit_feedback')
    def test_submit_feedback_failure(self, mock_submit_feedback):
        mock_submit_feedback.side_effect = Exception("Failed to submit feedback")
        response = client.post("/analyze/feedback", json={"feedback": "Test feedback"})
        self.assertEqual(response.status_code, 500)

if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

class TestFeedbackEndpoint(unittest.TestCase):
    @patch('api.routers.analyze.feedback_service.submit_feedback')
    def test_submit_feedback_success(self, mock_submit_feedback):
        mock_submit_feedback.return_value = None
        response = client.post("/analyze/feedback", json={"feedback": "Test feedback"})
        self.assertEqual(response.status_code, 200)

    @patch('api.routers.analyze.feedback_service.submit_feedback')
    def test_submit_feedback_failure(self, mock_submit_feedback):
        mock_submit_feedback.side_effect = Exception("Failed to submit feedback")
        response = client.post("/analyze/feedback", json={"feedback": "Test feedback"})
        self.assertEqual(response.status_code, 500)

if __name__ == '__main__':
    unittest.main()
