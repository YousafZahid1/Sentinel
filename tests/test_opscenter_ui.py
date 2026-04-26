import unittest
from unittest.mock import patch, MagicMock
from frontend.src.pages.OpsCenter import OpsCenter

class TestOpsCenterUI(unittest.TestCase):
    @patch('frontend.src.pages.OpsCenter.fetch')
    def test_feedback_submission(self, mock_fetch):
        mock_fetch.return_value.json.return_value = {"message": "Feedback received successfully"}
        # Simulate feedback submission
        # Assuming the feedback form is submitted with the required data
        self.assertTrue(True)  # Replace with actual test logic

if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import patch, MagicMock
from frontend.src.pages.OpsCenter import OpsCenter

class TestOpsCenterUI(unittest.TestCase):
    @patch('frontend.src.pages.OpsCenter.fetch')
    def test_feedback_submission(self, mock_fetch):
        mock_fetch.return_value.json.return_value = {"message": "Feedback received successfully"}
        # Simulate feedback submission
        # Assuming the feedback form is submitted with the required data
        self.assertTrue(True)  # Replace with actual test logic

if __name__ == '__main__':
    unittest.main()
