import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ClimbRating from '../src/ClimbRating';

describe('ClimbRating', () => {
  it('renders 5 stars and highlights according to rating', () => {
    const { getByTestId } = render(<ClimbRating rating={3} onRate={() => {}} />);
    for (let i = 1; i <= 5; i++) {
      const star = getByTestId(`star-${i}`);
      expect(star).toBeInTheDocument();
      if (i <= 3) {
        expect(star).toHaveStyle('color: #FFD700');
      } else {
        expect(star).toHaveStyle('color: #CCC');
      }
    }
  });

  it('calls onRate with correct value when a star is clicked', () => {
    const mockRate = jest.fn();
    const { getByTestId } = render(<ClimbRating rating={2} onRate={mockRate} />);
    fireEvent.click(getByTestId('star-4'));
    expect(mockRate).toHaveBeenCalledWith(4);
  });
});
