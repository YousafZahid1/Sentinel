import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import OpsCenter from '../pages/OpsCenter';

describe('OpsCenter Component', () => {
    it('renders feedback UI', () => {
        const { getByText } = render(<OpsCenter />);
        expect(getByText('Submit Feedback')).toBeInTheDocument();
    });

    it('submits feedback successfully', async () => {
        const { getByText, getByPlaceholderText } = render(<OpsCenter />);
        const feedbackInput = getByPlaceholderText('Enter your feedback');
        const submitButton = getByText('Submit Feedback');

        fireEvent.change(feedbackInput, { target: { value: 'Test feedback' } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(getByText('Feedback submitted successfully')).toBeInTheDocument());
    });

    it('shows error on failed feedback submission', async () => {
        // Mock the API call to fail
        global.fetch = jest.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ detail: 'Failed to submit feedback' }) }));

        const { getByText, getByPlaceholderText } = render(<OpsCenter />);
        const feedbackInput = getByPlaceholderText('Enter your feedback');
        const submitButton = getByText('Submit Feedback');

        fireEvent.change(feedbackInput, { target: { value: 'Test feedback' } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(getByText('Failed to submit feedback')).toBeInTheDocument());
    });
});