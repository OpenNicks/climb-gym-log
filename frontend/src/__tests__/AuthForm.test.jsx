import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AuthForm from '../AuthForm';

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.resetAllMocks();
});

import { mockFetchResponseOnce } from './testUtils';

describe('AuthForm', () => {
  it('renders login form by default', () => {
    render(<AuthForm onAuth={() => {}} />);
    // Header
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    // Button
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Invalid credentials' }) });
    render(<AuthForm onAuth={() => {}} />);
    fireEvent.change(await screen.findByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(await screen.findByPlaceholderText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(await screen.findByRole('button', { name: /login/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('calls onAuth on successful login', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'jwt-token' }) });
    const onAuth = jest.fn();
    render(<AuthForm onAuth={onAuth} />);
    fireEvent.change(await screen.findByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(await screen.findByPlaceholderText('Password'), { target: { value: 'pass' } });
    fireEvent.click(await screen.findByRole('button', { name: /login/i }));
    await screen.findByText(/authenticating/i); // Ensure UI is updating
    await waitFor(() => expect(onAuth).toHaveBeenCalledWith('jwt-token'));
  });

  it('shows loading spinner while authenticating', async () => {
    let resolve;
    fetch.mockReturnValue(new Promise(r => { resolve = r; }));
    render(<AuthForm onAuth={() => {}} />);
    fireEvent.change(await screen.findByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(await screen.findByPlaceholderText('Password'), { target: { value: 'pass' } });
    fireEvent.click(await screen.findByRole('button', { name: /login/i }));
    expect(await screen.findByText(/authenticating/i)).toBeInTheDocument();
    resolve({ ok: false, json: async () => ({ detail: 'fail' }) });
  });

  it('does not call fetch if username or password is empty', async () => {
    render(<AuthForm onAuth={() => {}} />);
    // Username empty
    fireEvent.change(await screen.findByPlaceholderText('Password'), { target: { value: 'pass' } });
    fireEvent.click(await screen.findByRole('button', { name: /login/i }));
    expect(global.fetch).not.toHaveBeenCalled();
    // Password empty
    fireEvent.change(await screen.findByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(await screen.findByPlaceholderText('Password'), { target: { value: '' } });
    fireEvent.click(await screen.findByRole('button', { name: /login/i }));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('disables button and shows loading on rapid submit', async () => {
    let resolve;
    fetch.mockReturnValue(new Promise(r => { resolve = r; }));
    render(<AuthForm onAuth={() => {}} />);
    fireEvent.change(await screen.findByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(await screen.findByPlaceholderText('Password'), { target: { value: 'pass' } });
    const button = await screen.findByRole('button', { name: /login/i });
    fireEvent.click(button);
    expect(await screen.findByText(/authenticating/i)).toBeInTheDocument();
    expect(button).toBeDisabled();
    resolve({ ok: false, json: async () => ({ detail: 'fail' }) });
  });

  it('switches between login and register modes', async () => {
    const { rerender } = render(<AuthForm onAuth={() => {}} mode="login" />);
    expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument();
    rerender(<AuthForm onAuth={() => {}} mode="register" />);
    expect(await screen.findByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(await screen.findByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('handles slow fetch and shows error on registration failure', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Email taken' }) });
    render(<AuthForm onAuth={() => {}} mode="register" />);
    fireEvent.change(await screen.findByPlaceholderText('Username'), { target: { value: 'newuser' } });
    fireEvent.change(await screen.findByPlaceholderText('Email'), { target: { value: 'taken@example.com' } });
    fireEvent.change(await screen.findByPlaceholderText('Password'), { target: { value: 'pass' } });
    fireEvent.click(await screen.findByRole('button', { name: /register/i }));
    expect(await screen.findByText(/email taken/i)).toBeInTheDocument();
  });
});
