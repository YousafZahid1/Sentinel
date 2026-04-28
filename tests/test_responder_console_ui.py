import unittest
from unittest.mock import patch, MagicMock
from frontend.src.pages.OpsCenter import FeedbackForm

class TestResponderConsoleUI(unittest.TestCase):
    @patch('frontend.src.lib.api.submitFeedback')
    def test_feedback_submission_success(self, mock_submit_feedback):
        mock_submit_feedback.return_value = Promise.resolve()
        feedback_form = FeedbackForm()
        feedback_form.find('textarea').simulate('change', { target: { value: 'Test feedback' } })
        feedback_form.find('button').simulate('click')
        self.assertEqual(feedback_form.state('feedback'), '')

    @patch('frontend.src.lib.api.submitFeedback')
    def test_feedback_submission_failure(self, mock_submit_feedback):
        mock_submit_feedback.return_value = Promise.reject('Failed to submit feedback')
        feedback_form = FeedbackForm()
        feedback_form.find('textarea').simulate('change', { target: { value: 'Test feedback' } })
        feedback_form.find('button').simulate('click')
        # Assuming there's an error state or message displayed on failure
        # self.assertEqual(feedback_form.state('error'), 'Failed to submit feedback')

if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import patch, MagicMock
from frontend.src.pages.OpsCenter import FeedbackForm

class TestResponderConsoleUI(unittest.TestCase):
    @patch('frontend.src.lib.api.submitFeedback')
    def test_feedback_submission_success(self, mock_submit_feedback):
        mock_submit_feedback.return_value = Promise.resolve()
        feedback_form = FeedbackForm()
        feedback_form.find('textarea').simulate('change', { target: { value: 'Test feedback' } })
        feedback_form.find('button').simulate('click')
        self.assertEqual(feedback_form.state('feedback'), '')

    @patch('frontend.src.lib.api.submitFeedback')
    def test_feedback_submission_failure(self, mock_submit_feedback):
        mock_submit_feedback.return_value = Promise.reject('Failed to submit feedback')
        feedback_form = FeedbackForm()
        feedback_form.find('textarea').simulate('change', { target: { value: 'Test feedback' } })
        feedback_form.find('button').simulate('click')
        # Assuming there's an error state or message displayed on failure
        # self.assertEqual(feedback_form.state('error'), 'Failed to submit feedback')

if __name__ == '__main__':
    unittest.main()
