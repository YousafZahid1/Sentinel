import unittest
from fastapi.testclient import TestClient
from api.main import app
import io

class TestAPIAnalyze(unittest.TestCase):
    def test_analyze_video(self):
        client = TestClient(app)
        # Create a fake video file
        fake_video = io.BytesIO(b"fake video content")
        response = client.post("/analyze", files={"video": ("test.mp4", fake_video, "video/mp4")})
        self.assertEqual(response.status_code, 200)
        # Additional assertions based on the expected response structure

    def test_invalid_file_type(self):
        client = TestClient(app)
        fake_video = io.BytesIO(b"fake video content")
        response = client.post("/analyze", files={"video": ("test.txt", fake_video, "text/plain")})
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()
import unittest
from fastapi.testclient import TestClient
from api.main import app
import io

class TestAPIAnalyze(unittest.TestCase):
    def test_analyze_video(self):
        client = TestClient(app)
        # Create a fake video file
        fake_video = io.BytesIO(b"fake video content")
        response = client.post("/analyze", files={"video": ("test.mp4", fake_video, "video/mp4")})
        self.assertEqual(response.status_code, 200)
        # Additional assertions based on the expected response structure

    def test_invalid_file_type(self):
        client = TestClient(app)
        fake_video = io.BytesIO(b"fake video content")
        response = client.post("/analyze", files={"video": ("test.txt", fake_video, "text/plain")})
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()
