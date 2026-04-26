import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import OpsCenter from './OpsCenter';
import { submitFeedback } from '../lib/api';

jest.mock('../lib/api');

describe('OpsCenter Component', () => {
    it('renders feedback UI correctly', () => {
        const { getByText, getByPlaceholderText } = render(<OpsCenter />);
        expect(getByText('PROVIDE FEEDBACK')).toBeInTheDocument();
        expect(getByPlaceholderText('Criticality (0-100):')).toBeInTheDocument();
        expect(getByPlaceholderText('Comments:')).toBeInTheDocument();
    });

    it('submits feedback correctly', async () => {
        submitFeedback.mockResolvedValueOnce();
        const { getByText, getByPlaceholderText } = render(<OpsCenter />);
        const criticalityInput = getByPlaceholderText('Criticality (0-100):');
        const commentsInput = getByPlaceholderText('Comments:');
        const submitButton = getByText('Submit Feedback');

        fireEvent.change(criticalityInput, { target: { value: '50' } });
        fireEvent.change(commentsInput, { target: { value: 'Test feedback' } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(submitFeedback).toHaveBeenCalledTimes(1));
        expect(submitFeedback).toHaveBeenCalledWith({
            analysis_id: expect.any(String),
            criticality: 50,
            comments: 'Test feedback',
        });
    });
});
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import OpsCenter from './OpsCenter';
import { submitFeedback } from '../lib/api';

jest.mock('../lib/api');

describe('OpsCenter Component', () => {
    it('renders feedback UI correctly', () => {
        const { getByText, getByPlaceholderText } = render(<OpsCenter />);
        expect(getByText('PROVIDE FEEDBACK')).toBeInTheDocument();
        expect(getByPlaceholderText('Criticality (0-100):')).toBeInTheDocument();
        expect(getByPlaceholderText('Comments:')).toBeInTheDocument();
    });

    it('submits feedback correctly', async () => {
        submitFeedback.mockResolvedValueOnce();
        const { getByText, getByPlaceholderText } = render(<OpsCenter />);
        const criticalityInput = getByPlaceholderText('Criticality (0-100):');
        const commentsInput = getByPlaceholderText('Comments:');
        const submitButton = getByText('Submit Feedback');

        fireEvent.change(criticalityInput, { target: { value: '50' } });
        fireEvent.change(commentsInput, { target: { value: 'Test feedback' } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(submitFeedback).toHaveBeenCalledTimes(1));
        expect(submitFeedback).toHaveBeenCalledWith({
            analysis_id: expect.any(String),
            criticality: 50,
            comments: 'Test feedback',
        });
    });
});
