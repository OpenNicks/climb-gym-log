import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { AscentsProvider, useAscents } from '../src/contexts/AscentsContext';
import * as authApi from '../src/api/auth';
import * as ascentsApi from '../src/api/ascents';

jest.mock('../src/api/auth');
jest.mock('../src/api/ascents');
jest.mock('../src/components/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: jest.fn() }),
}));

const AuthErrorTest = () => {
  const { error, login, register } = useAuth();
  return (
    <div>
      {error && <div data-testid="auth-error">{error}</div>}
      <button onClick={() => login({ username: 'baduser' })}>Login</button>
      <button onClick={() => register({ username: 'baduser', email: 'bad@example.com' })}>Register</button>
    </div>
  );
};

const AscentsErrorTest = () => {
  const { error, addAscent } = useAscents();
  return (
    <div>
      {error && <div data-testid="ascents-error">{error}</div>}
      <button onClick={() => addAscent({ climb_id: 1, grade: 'V0' })}>Add Ascent</button>
    </div>
  );
};

describe('AuthContext error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows backend error on login failure', async () => {
    authApi.login.mockResolvedValue({ status: 401, message: 'Invalid credentials' });
    render(
      <AuthProvider>
        <AuthErrorTest />
      </AuthProvider>
    );
    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('Invalid credentials');
    });
  });

  it('shows backend error on registration failure', async () => {
    authApi.register.mockResolvedValue({ status: 400, message: 'User already exists' });
    render(
      <AuthProvider>
        <AuthErrorTest />
      </AuthProvider>
    );
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('User already exists');
    });
  });
});

describe('AscentsContext error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ascentsApi.createAscent.mockClear();
  });

  it('shows backend error on addAscent failure', async () => {
    ascentsApi.createAscent.mockResolvedValue({ status: 400, message: 'Invalid ascent data' });
    render(
      <AuthProvider>
        <AscentsProvider>
          <AscentsErrorTest />
        </AscentsProvider>
      </AuthProvider>
    );
    fireEvent.click(screen.getByText('Add Ascent'));
    await waitFor(() => {
      expect(screen.getByTestId('ascents-error')).toHaveTextContent('Invalid ascent data');
    });
  });
});
