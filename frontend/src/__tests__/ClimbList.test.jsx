import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ClimbList from '../ClimbList';

import AscentLog from '../AscentLog';

describe('ClimbList', () => {
  const climbs = [
    { id: 1, name: 'Sloper', grade: 'V2', rating: 3 },
    { id: 2, name: 'Crimpfest', grade: 'V5', rating: 0 },
  ];

  it('shows login prompt if not logged in', () => {
    render(<ClimbList climbs={climbs} onDelete={() => {}} onRatingChange={() => {}} token={null} user={null} />);
    expect(screen.getAllByText(/login to rate/i).length).toBe(climbs.length);
  });

  it('renders ClimbRating if logged in', () => {
    render(<ClimbList climbs={climbs} onDelete={() => {}} onRatingChange={() => {}} token="jwt" user={{ username: 'u' }} />);
    expect(screen.getAllByRole('button', { name: /star/i }).length).toBeGreaterThan(0);
  });

  it('calls onRatingChange and shows success on rating', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/comments')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/ascents/climb/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/ascents/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1, name: 'Sloper', grade: 'V2', rating: 5 }) });
    });
    const onRatingChange = jest.fn();
    render(<ClimbList climbs={climbs} onDelete={() => {}} onRatingChange={onRatingChange} token="jwt" user={{ username: 'u' }} />);
    // Click the 5th star for first climb
    const stars = screen.getAllByRole('button', { name: /star/i });
    fireEvent.click(stars[4]);
    await waitFor(() => expect(onRatingChange).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/rating updated/i)).toBeInTheDocument());
  });

  it('shows error if rating fails', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/comments')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/ascents/climb/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/ascents/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({ detail: 'Nope' }) });
    });
    render(<ClimbList climbs={climbs} onDelete={() => {}} onRatingChange={() => {}} token="jwt" user={{ username: 'u' }} />);
    const stars = screen.getAllByRole('button', { name: /star/i });
    fireEvent.click(stars[0]);
    await waitFor(() => expect(screen.getByText(/nope/i)).toBeInTheDocument());
  });
    it('shows AscentLog for each climb when logged in', async () => {
      global.fetch = jest.fn((url) => {
        if (url.includes('/ascents/climb/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        if (url.includes('/api/ascents/climb/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        if (url.includes('/api/ascents/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        if (url.includes('/comments')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      render(<ClimbList climbs={climbs} onDelete={() => {}} onRatingChange={() => {}} token="jwt" user={{ username: 'u' }} />);
      // Should see "Log an Ascent" for each climb
      expect(await screen.findAllByText(/Log an Ascent/i)).toHaveLength(climbs.length);
    });
  
    it('logs an ascent via AscentLog', async () => {
      global.fetch = jest.fn((url, opts) => {
        if (url.includes('/ascents/climb/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        if (url.includes('/api/ascents/climb/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        if (url.includes('/api/ascents/') && opts && opts.method === 'POST') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ grade: 'V2', notes: 'Test', id: 1, date: new Date().toISOString() }) });
        }
        if (url.includes('/api/ascents/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        if (url.includes('/comments')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      await act(async () => {
        render(<ClimbList climbs={climbs} onDelete={() => {}} onRatingChange={() => {}} token="jwt" user={{ username: 'u' }} />);
      });
      await act(async () => {
        fireEvent.change(screen.getAllByPlaceholderText(/e\.g\./i)[0], { target: { value: 'V2' } });
        fireEvent.change(screen.getAllByPlaceholderText(/Optional notes/i)[0], { target: { value: 'Test' } });
        fireEvent.click(screen.getAllByText(/Log Ascent/i)[0]);
      });
      await waitFor(() => expect(screen.getByText(/Ascent logged!/i)).toBeInTheDocument());
    });
  
    it('shows ascent history in AscentLog', async () => {
      global.fetch = jest.fn((url) => {
        if (url.includes('/ascents/climb/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 2, grade: 'V3', notes: 'History', date: new Date().toISOString() }]) });
        }
        if (url.includes('/api/ascents/climb/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 2, grade: 'V3', notes: 'History', date: new Date().toISOString() }]) });
        }
        if (url.includes('/api/ascents/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        if (url.includes('/comments')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      await act(async () => {
        render(<ClimbList climbs={climbs} onDelete={() => {}} onRatingChange={() => {}} token="jwt" user={{ username: 'u' }} />);
      });
      await waitFor(() => expect(screen.getAllByText(/V3/).length).toBeGreaterThan(0));
      expect(screen.getAllByText(/History/).length).toBeGreaterThan(0);
    });
  // ... (new tests above)
});