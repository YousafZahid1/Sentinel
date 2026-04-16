import unittest
from unittest.mock import patch, MagicMock
from api.services.transformer import transform

class TestFallbackModelIntegration(unittest.TestCase):

    @patch('api.services.gemini_client.analyze_video')
    def test_transform_with_primary_model_success(self, mock_analyze_video):
        # Mock the primary model analysis output
        mock_raw_output = {
            "clip_summary": {"overall_assessment": "Normal"},
            "prediction_next_5_10s": {"likely_outcome": "no_issue", "confidence_0_1": 0.9},
            "recommended_action": {"action": "ignore"}
        }
        mock_analyze_video.return_value = mock_raw_output
        
        raw_output = mock_analyze_video.return_value
        result = transform(raw_output)
        
        self.assertIsNotNone(result)
        self.assertEqual(result.conclusion, "Normal Predicted outcome: no issue (confidence 90%).")
        self.assertEqual(result.recommended_actions, ["No action required — continue passive monitoring."])

    @patch('api.services.gemini_client.analyze_video')
    def test_transform_with_primary_model_failure(self, mock_analyze_video):
        # Mock the case where primary model fails and fallback is used
        mock_raw_output = {
            "clip_summary": {},
            "prediction_next_5_10s": {},
            "recommended_action": {}
        }
        mock_analyze_video.return_value = mock_raw_output
        
        raw_output = mock_analyze_video.return_value
        result = transform(raw_output)
        
        self.assertIsNotNone(result)
        self.assertEqual(result.conclusion, "Insufficient evidence to draw a conclusion.")
        # Additional assertions based on expected fallback behavior

if __name__ == '__main__':
    unittest.main()