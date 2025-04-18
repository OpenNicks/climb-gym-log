import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClimbComments from '../src/ClimbComments';

describe('ClimbComments Edge & Failure Cases', () => {
  const climbId = 1;
  const user = { id: 42, username: 'climber' };
  const token = 'jwt';

  beforeEach(() => {
    global.fetch = jest.fn();
    window.confirm = jest.fn(() => true);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders no comments state', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    expect(screen.getByText(/loading comments/i)).toBeInTheDocument();
    expect(await screen.findByText(/no comments yet/i)).toBeInTheDocument();
  });

  it('handles comment with missing username/text gracefully', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 1, user_id: 42 }]) });
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    // Should render an empty <b /> and 'Invalid Date', but not crash
    expect(await screen.findByText(/invalid date/i)).toBeInTheDocument();
    // Optionally, check that the comment list is present
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('does not post empty comment', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    await screen.findByText(/no comments yet/i);
    const input = screen.getByPlaceholderText(/add a comment/i);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /post/i }));
    // Should not call fetch again
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('shows error on delete failure', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 2, user_id: 42, username: 'climber', text: 'ToFail', created_at: new Date().toISOString() }]) }) // load
      .mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Delete failed' }) }); // delete
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    await screen.findByText(/tofail/i);
    const delBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(delBtn);
    await waitFor(() => expect(screen.getByText(/delete failed/i)).toBeInTheDocument());
  });

  it('handles rapid post/delete actions without crash', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // load
      .mockResolvedValue({ ok: true, json: async () => [] }); // for posts/deletes
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    await screen.findByText(/no comments yet/i);
    const input = screen.getByPlaceholderText(/add a comment/i);
    for (let i = 0; i < 3; ++i) {
      fireEvent.change(input, { target: { value: `Test ${i}` } });
      fireEvent.click(screen.getByRole('button', { name: /post/i }));
    }
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });
});
