import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import FollowUpUI from '../components/FollowUpUI'; // Assuming this is the component to test
import axios from 'axios';

jest.mock('axios');

describe('FollowUpUI Component', () => {
  it('renders follow-up questions', async () => {
    axios.get.mockResolvedValue({
      data: {
        questions: ['How would you rate the criticality of the situation?', 'Were there any false positives in the analysis?'],
        ratingOptions: ['Low', 'Medium', 'High']
      }
    });

    const { getByText } = render(<FollowUpUI cameraId="test-camera-id" />);
    await waitFor(() => expect(getByText('How would you rate the criticality of the situation?')).toBeInTheDocument());
    expect(getByText('Were there any false positives in the analysis?')).toBeInTheDocument();
  });

  it('handles user rating selection', async () => {
    axios.get.mockResolvedValue({
      data: {
        questions: ['How would you rate the criticality of the situation?'],
        ratingOptions: ['Low', 'Medium', 'High']
      }
    });

    const { getByText, getByRole } = render(<FollowUpUI cameraId="test-camera-id" />);
    await waitFor(() => expect(getByText('How would you rate the criticality of the situation?')).toBeInTheDocument());
    
    const ratingSelect = getByRole('combobox'); // or whatever role your rating selector has
    fireEvent.change(ratingSelect, { target: { value: 'Medium' } });
    expect(ratingSelect).toHaveValue('Medium');
  });

  // Add more tests as needed for other interactions and edge cases
});