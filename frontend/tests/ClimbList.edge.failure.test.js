import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClimbList from '../src/ClimbList';

describe('ClimbList Edge & Failure Cases', () => {
  it('renders gracefully with no climbs', () => {
    render(<ClimbList climbs={[]} onDelete={() => {}} onRatingChange={() => {}} token={null} user={null} />);
    expect(screen.queryByText(/login to rate/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('handles climb with missing rating', () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    const climbs = [{ id: 1, name: 'Oddball', grade: 'V0' }];
    render(<ClimbList climbs={climbs} onDelete={() => {}} onRatingChange={() => {}} token={null} user={null} />);
    // Use a flexible matcher for split text
    expect(screen.getByText((content) => content.includes('Oddball'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('V0'))).toBeInTheDocument();
  });

  it('handles rapid rating clicks without crash', async () => {
    const climbs = [{ id: 1, name: 'Speedy', grade: 'V1', rating: 2 }];
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    const onRatingChange = jest.fn();
    render(<ClimbList climbs={climbs} onDelete={() => {}} onRatingChange={onRatingChange} token="jwt" user={{ username: 'u' }} />);
    const stars = await screen.findAllByRole('button', { name: /star/i });
    for (let i = 0; i < 5; ++i) {
      fireEvent.click(stars[i]);
    }
    await waitFor(() => expect(onRatingChange).toHaveBeenCalled());
  });

  it('handles onDelete failure gracefully', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    const climbs = [{ id: 1, name: 'DeleteMe', grade: 'V4', rating: 3 }];
    const onDelete = jest.fn(() => { throw new Error('Delete failed'); });
    render(<ClimbList climbs={climbs} onDelete={onDelete} onRatingChange={() => {}} token="jwt" user={{ username: 'u' }} />);
    // Use getByTitle for the ✕ button
    const deleteBtn = screen.getByTitle('Delete');
    fireEvent.click(deleteBtn);
    // The component should not crash
    expect(screen.getByText((content) => content.includes('DeleteMe'))).toBeInTheDocument();
  });
});
