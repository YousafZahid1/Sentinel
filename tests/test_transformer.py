import unittest
from api.services.transformer import transform

class TestTransformer(unittest.TestCase):
    def test_transform_with_feedback(self):
        raw_analysis = {'clip_summary': {}, 'prediction_next_5_10s': {}}
        feedback = {'criticality': 'high', 'follow_up': True}
        result = transform(raw_analysis, feedback)
        self.assertIn('feedback', result.metadata)
        self.assertEqual(result.metadata['feedback']['staff_feedback'], 'high')
        self.assertTrue(result.metadata['feedback']['follow_up_required'])

    def test_transform_without_feedback(self):
        raw_analysis = {'clip_summary': {}, 'prediction_next_5_10s': {}}
        result = transform(raw_analysis)
        self.assertNotIn('feedback', result.metadata)

if __name__ == '__main__':
    unittest.main()
import unittest
from api.services.transformer import transform

class TestTransformer(unittest.TestCase):
    def test_transform_with_feedback(self):
        raw_analysis = {'clip_summary': {}, 'prediction_next_5_10s': {}}
        feedback = {'criticality': 'high', 'follow_up': True}
        result = transform(raw_analysis, feedback)
        self.assertIn('feedback', result.metadata)
        self.assertEqual(result.metadata['feedback']['staff_feedback'], 'high')
        self.assertTrue(result.metadata['feedback']['follow_up_required'])

    def test_transform_without_feedback(self):
        raw_analysis = {'clip_summary': {}, 'prediction_next_5_10s': {}}
        result = transform(raw_analysis)
        self.assertNotIn('feedback', result.metadata)

if __name__ == '__main__':
    unittest.main()
