import unittest
from fastapi.testclient import TestClient
from api.routers.analyze import router

client = TestClient(router)

class TestAnalyzeAPI(unittest.TestCase):
    def test_submit_staff_feedback(self):
        feedback_data = {"analysis_id": "12345", "feedback": "This is a test feedback"}
        response = client.post("/feedback", json=feedback_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Feedback received successfully"})

if __name__ == '__main__':
    unittest.main()
import unittest
from fastapi.testclient import TestClient
from api.routers.analyze import router

client = TestClient(router)

class TestAnalyzeAPI(unittest.TestCase):
    def test_submit_staff_feedback(self):
        feedback_data = {"analysis_id": "12345", "feedback": "This is a test feedback"}
        response = client.post("/feedback", json=feedback_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Feedback received successfully"})

if __name__ == '__main__':
    unittest.main()
