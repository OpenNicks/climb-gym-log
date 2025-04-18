import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ClimbRating from '../src/ClimbRating';

describe('ClimbRating edge and failure cases', () => {
  it('renders with rating 0 (no stars highlighted)', () => {
    const { getByTestId } = render(<ClimbRating rating={0} onRate={() => {}} />);
    for (let i = 1; i <= 5; i++) {
      const star = getByTestId(`star-${i}`);
      expect(star).toHaveStyle('color: #CCC');
    }
  });

  it('renders with rating 5 (all stars highlighted)', () => {
    const { getByTestId } = render(<ClimbRating rating={5} onRate={() => {}} />);
    for (let i = 1; i <= 5; i++) {
      const star = getByTestId(`star-${i}`);
      expect(star).toHaveStyle('color: #FFD700');
    }
  });

  it('handles keyboard rating (Enter and Space)', () => {
    const mockRate = jest.fn();
    const { getByTestId } = render(<ClimbRating rating={1} onRate={mockRate} />);
    const star3 = getByTestId('star-3');
    fireEvent.keyDown(star3, { key: 'Enter' });
    expect(mockRate).toHaveBeenCalledWith(3);
    fireEvent.keyDown(star3, { key: ' ' });
    expect(mockRate).toHaveBeenCalledWith(3);
  });

  it('does not call onRate for non-interaction keys', () => {
    const mockRate = jest.fn();
    const { getByTestId } = render(<ClimbRating rating={2} onRate={mockRate} />);
    const star2 = getByTestId('star-2');
    fireEvent.keyDown(star2, { key: 'a' });
    expect(mockRate).not.toHaveBeenCalled();
  });

  it('handles rapid clicking on different stars', () => {
    const mockRate = jest.fn();
    const { getByTestId } = render(<ClimbRating rating={3} onRate={mockRate} />);
    fireEvent.click(getByTestId('star-1'));
    fireEvent.click(getByTestId('star-5'));
    fireEvent.click(getByTestId('star-2'));
    expect(mockRate).toHaveBeenCalledWith(1);
    expect(mockRate).toHaveBeenCalledWith(5);
    expect(mockRate).toHaveBeenCalledWith(2);
    expect(mockRate).toHaveBeenCalledTimes(3);
  });
});
