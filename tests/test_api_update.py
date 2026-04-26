import unittest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

class TestAPIUpdate(unittest.TestCase):
    def test_analyze_camera_without_feedback(self):
        response = client.post("/cameras/CAM-01/analyze")
        self.assertEqual(response.status_code, 200)

    def test_analyze_camera_with_feedback(self):
        feedback = {"criticality": "high"}
        response = client.post("/cameras/CAM-01/analyze", json=feedback)
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()
import unittest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

class TestAPIUpdate(unittest.TestCase):
    def test_analyze_camera_without_feedback(self):
        response = client.post("/cameras/CAM-01/analyze")
        self.assertEqual(response.status_code, 200)

    def test_analyze_camera_with_feedback(self):
        feedback = {"criticality": "high"}
        response = client.post("/cameras/CAM-01/analyze", json=feedback)
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()
