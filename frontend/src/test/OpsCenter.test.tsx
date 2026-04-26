import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import OpsCenter from '../pages/OpsCenter';

describe('OpsCenter component', () => {
    it('renders feedback form', () => {
        const { getByText } = render(<OpsCenter />);
        expect(getByText('Submit Feedback')).toBeInTheDocument();
    });

    it('submits feedback', async () => {
        const { getByText, getByPlaceholderText } = render(<OpsCenter />);
        const input = getByPlaceholderText('Enter feedback');
        const button = getByText('Submit Feedback');
        
        fireEvent.change(input, { target: { value: 'Test feedback' } });
        fireEvent.click(button);
        
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    });
});
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import OpsCenter from '../pages/OpsCenter';

describe('OpsCenter component', () => {
    it('renders feedback form', () => {
        const { getByText } = render(<OpsCenter />);
        expect(getByText('Submit Feedback')).toBeInTheDocument();
    });

    it('submits feedback', async () => {
        const { getByText, getByPlaceholderText } = render(<OpsCenter />);
        const input = getByPlaceholderText('Enter feedback');
        const button = getByText('Submit Feedback');
        
        fireEvent.change(input, { target: { value: 'Test feedback' } });
        fireEvent.click(button);
        
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    });
});
