import unittest
from fastapi.testclient import TestClient
from api.main import app

class TestFeedbackEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_submit_feedback_success(self):
        feedback_data = {"criticality": "high"}
        response = self.client.post("/analyze/feedback", json=feedback_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Feedback received successfully"})

    def test_submit_feedback_missing_criticality(self):
        feedback_data = {"other_field": "value"}
        response = self.client.post("/analyze/feedback", json=feedback_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid feedback data", response.json().get("detail", ""))

    def test_submit_feedback_empty_data(self):
        response = self.client.post("/analyze/feedback", json={})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid feedback data", response.json().get("detail", ""))

if __name__ == "__main__":
    unittest.main()