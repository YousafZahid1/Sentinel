import unittest
from api.services.transformer import transform

class TestTransformerUpdate(unittest.TestCase):
    def test_transform_without_feedback(self):
        raw_data = {}  # Sample raw data
        result = transform(raw_data)
        self.assertIsNotNone(result)

    def test_transform_with_feedback(self):
        raw_data = {}  # Sample raw data
        feedback = {"criticality": "high"}
        result = transform(raw_data, staff_feedback=feedback)
        self.assertIsNotNone(result)
        self.assertIn('staff_feedback', result.metadata)

if __name__ == '__main__':
    unittest.main()
import unittest
from api.services.transformer import transform

class TestTransformerUpdate(unittest.TestCase):
    def test_transform_without_feedback(self):
        raw_data = {}  # Sample raw data
        result = transform(raw_data)
        self.assertIsNotNone(result)

    def test_transform_with_feedback(self):
        raw_data = {}  # Sample raw data
        feedback = {"criticality": "high"}
        result = transform(raw_data, staff_feedback=feedback)
        self.assertIsNotNone(result)
        self.assertIn('staff_feedback', result.metadata)

if __name__ == '__main__':
    unittest.main()
