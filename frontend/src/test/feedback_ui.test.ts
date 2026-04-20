import { render, fireEvent, waitFor } from '@testing-library/react';
import OpsCenter from '../pages/OpsCenter';

test('renders feedback UI', async () => {
  const { getByText } = render(<OpsCenter />);
  expect(getByText('Submit Feedback')).toBeInTheDocument();
});

test('submits feedback successfully', async () => {
  const { getByText, getByLabelText } = render(<OpsCenter />);
  const criticalitySlider = getByLabelText('Criticality');
  const commentsInput = getByLabelText('Comments');
  const submitButton = getByText('Submit Feedback');

  fireEvent.change(criticalitySlider, { target: { value: 5 } });
  fireEvent.change(commentsInput, { target: { value: 'Test feedback' } });
  fireEvent.click(submitButton);

  await waitFor(() => expect(submitButton).toBeDisabled());
  expect(getByText('Feedback submitted successfully')).toBeInTheDocument();
});