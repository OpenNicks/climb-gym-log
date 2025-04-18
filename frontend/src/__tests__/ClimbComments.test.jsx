import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClimbComments from '../ClimbComments';

describe('ClimbComments', () => {
  const climbId = 1;
  const user = { id: 42, username: 'climber' };
  const token = 'jwt';

  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders and loads comments', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 1, user_id: 42, username: 'climber', text: 'Nice!', created_at: new Date().toISOString() }]) });
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    expect(screen.getByText(/loading comments/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/nice!/i)).toBeInTheDocument());
  });

  it('shows error on fetch failure', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    await waitFor(() => expect(screen.getByText(/could not fetch comments/i)).toBeInTheDocument());
  });

  it('can post a comment', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // load
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2 }) }) // post
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 2, user_id: 42, username: 'climber', text: 'Test comment', created_at: new Date().toISOString() }]) }); // reload
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    await waitFor(() => screen.getByText(/no comments yet/i));
    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), { target: { value: 'Test comment' } });
    fireEvent.click(screen.getByRole('button', { name: /post/i }));
    await waitFor(() => expect(screen.getByText(/comment added/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/test comment/i)).toBeInTheDocument());
  });

  it('shows error on post failure', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // load
      .mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Nope' }) }); // post
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    await waitFor(() => screen.getByText(/no comments yet/i));
    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), { target: { value: 'fail' } });
    fireEvent.click(screen.getByRole('button', { name: /post/i }));
    await waitFor(() => expect(screen.getByText(/nope/i)).toBeInTheDocument());
  });

  it('can delete own comment', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 3, user_id: 42, username: 'climber', text: 'To delete', created_at: new Date().toISOString() }]) }) // load
      .mockResolvedValueOnce({ ok: true }) // delete
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // reload
    render(<ClimbComments climbId={climbId} token={token} user={user} />);
    await waitFor(() => screen.getByText(/to delete/i));
    window.confirm = jest.fn(() => true);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => expect(screen.getByText(/comment deleted/i)).toBeInTheDocument());
  });
});
