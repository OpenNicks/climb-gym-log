import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ClimbRating from '../src/ClimbRating';

describe('ClimbRating failure cases', () => {
  it('does not crash if onRate is not provided', () => {
    // Should not throw even if onRate is undefined
    const { getByTestId } = render(<ClimbRating rating={3} />);
    expect(() => fireEvent.click(getByTestId('star-2'))).not.toThrow();
  });

  it('handles non-numeric rating gracefully', () => {
    const { getByTestId } = render(<ClimbRating rating={null} onRate={() => {}} />);
    for (let i = 1; i <= 5; i++) {
      const star = getByTestId(`star-${i}`);
      expect(star).toHaveStyle('color: #CCC');
    }
  });
});
