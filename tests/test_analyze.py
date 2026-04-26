import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.routers.analyze import router
from api.models.response import StaffFeedbackRequest

client = TestClient(router)

class TestAnalyzeRouter(unittest.TestCase):
    def test_submit_staff_feedback_valid(self):
        feedback_data = StaffFeedbackRequest(analysis_id="123", criticality=50, comments="Test feedback")
        response = client.post("/feedback", json=feedback_data.dict())
        self.assertEqual(response.status_code, 204)

    def test_submit_staff_feedback_invalid(self):
        # Missing required fields
        feedback_data = {"analysis_id": "123", "comments": "Test feedback"}
        response = client.post("/feedback", json=feedback_data)
        self.assertEqual(response.status_code, 422)

if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.routers.analyze import router
from api.models.response import StaffFeedbackRequest

client = TestClient(router)

class TestAnalyzeRouter(unittest.TestCase):
    def test_submit_staff_feedback_valid(self):
        feedback_data = StaffFeedbackRequest(analysis_id="123", criticality=50, comments="Test feedback")
        response = client.post("/feedback", json=feedback_data.dict())
        self.assertEqual(response.status_code, 204)

    def test_submit_staff_feedback_invalid(self):
        # Missing required fields
        feedback_data = {"analysis_id": "123", "comments": "Test feedback"}
        response = client.post("/feedback", json=feedback_data)
        self.assertEqual(response.status_code, 422)

if __name__ == '__main__':
    unittest.main()
