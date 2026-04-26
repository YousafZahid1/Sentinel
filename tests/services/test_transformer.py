import unittest
from api.services.transformer import transform
from api.models.response import AnalysisResponse

class TestTransformer(unittest.TestCase):

    def test_transform_valid_input(self):
        # Mock valid raw input
        raw = {
            "clip_summary": {"overall_assessment": "Safe", "people_detected": 1},
            "prediction_next_5_10s": {"likely_outcome": "no_fight", "confidence_0_1": 0.9},
            "recommended_action": {"action": "ignore", "why": ["No risk detected"]},
            "per_person": [],
            "timeline": [],
        }
        response = transform(raw)
        self.assertIsInstance(response, AnalysisResponse)
        self.assertEqual(response.conclusion, "Safe. Predicted outcome: no fight (confidence 90%). No risk detected")

    def test_transform_empty_input(self):
        # Test with empty input
        raw = {}
        with self.assertRaises(KeyError):
            transform(raw)

    def test_transform_missing_fields(self):
        # Test with missing critical fields
        raw = {"clip_summary": {}}
        with self.assertRaises(KeyError):
            transform(raw)

if __name__ == '__main__':
    unittest.main()
import unittest
from api.services.transformer import transform
from api.models.response import AnalysisResponse

class TestTransformer(unittest.TestCase):

    def test_transform_valid_input(self):
        # Mock valid raw input
        raw = {
            "clip_summary": {"overall_assessment": "Safe", "people_detected": 1},
            "prediction_next_5_10s": {"likely_outcome": "no_fight", "confidence_0_1": 0.9},
            "recommended_action": {"action": "ignore", "why": ["No risk detected"]},
            "per_person": [],
            "timeline": [],
        }
        response = transform(raw)
        self.assertIsInstance(response, AnalysisResponse)
        self.assertEqual(response.conclusion, "Safe. Predicted outcome: no fight (confidence 90%). No risk detected")

    def test_transform_empty_input(self):
        # Test with empty input
        raw = {}
        with self.assertRaises(KeyError):
            transform(raw)

    def test_transform_missing_fields(self):
        # Test with missing critical fields
        raw = {"clip_summary": {}}
        with self.assertRaises(KeyError):
            transform(raw)

if __name__ == '__main__':
    unittest.main()
