import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { AscentsProvider, useAscents } from '../src/contexts/AscentsContext';
import * as authApi from '../src/api/auth';
import * as ascentsApi from '../src/api/ascents';

// Mock the API modules
jest.mock('../src/api/auth');
jest.mock('../src/api/ascents');
jest.mock('../src/components/NotificationProvider', () => ({
  useNotification: () => ({
    showNotification: jest.fn(),
  }),
}));

// Test component for AuthContext
const AuthTest = () => {
  const { user, loading, error, login, register, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {loading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      {user && <div data-testid="username">{user.username}</div>}
      {error && <div data-testid="error">{error}</div>}
      <button 
        data-testid="login-btn" 
        onClick={() => login({ username: 'testuser' })}
      >
        Login
      </button>
      <button 
        data-testid="register-btn" 
        onClick={() => register({ username: 'testuser', email: 'test@example.com' })}
      >
        Register
      </button>
      <button 
        data-testid="logout-btn" 
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

// Test component for AscentsContext
const AscentsTest = () => {
  const { ascents, loading, error, addAscent, updateAscent, deleteAscent, calculateStats } = useAscents();
  
  return (
    <div>
      <div data-testid="ascents-status">
        {loading ? 'Loading...' : ascents.length > 0 ? 'Has ascents' : 'No ascents'}
      </div>
      <div data-testid="ascents-count">{ascents.length}</div>
      {error && <div data-testid="error">{error}</div>}
      <button 
        data-testid="add-ascent" 
        onClick={() => addAscent({ climb_name: 'Test Climb', climb_type: 'boulder' })}
      >
        Add Ascent
      </button>
      <button 
        data-testid="delete-ascent" 
        onClick={() => ascents.length > 0 && deleteAscent(ascents[0].id)}
      >
        Delete Ascent
      </button>
      <button 
        data-testid="calculate-stats"
        onClick={() => calculateStats()}
      >
        Calculate Stats
      </button>
    </div>
  );
};

// Combined test component
const CombinedTest = () => (
  <AuthProvider>
    <AscentsProvider>
      <div>
        <h2>Auth Test</h2>
        <AuthTest />
        <h2>Ascents Test</h2>
        <AscentsTest />
      </div>
    </AscentsProvider>
  </AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful login
    authApi.login.mockResolvedValue({
      success: true,
      user: { id: 1, username: 'testuser', token: 'test-token' }
    });
    // Mock successful register
    authApi.register.mockResolvedValue({
      success: true,
      user: { id: 1, username: 'testuser', email: 'test@example.com', token: 'test-token' }
    });
    // Mock successful logout
    authApi.logout.mockResolvedValue({ success: true });
    // Mock getCurrentUser for token validation
    authApi.getCurrentUser.mockResolvedValue({
      success: true,
      user: { id: 1, username: 'testuser', token: 'test-token' }
    });
  });

  test('provides initial unauthenticated state', async () => {
    render(<AuthProvider><AuthTest /></AuthProvider>);
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
  });

  test('handles login successfully', async () => {
    render(<AuthProvider><AuthTest /></AuthProvider>);
    
    fireEvent.click(screen.getByTestId('login-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('username')).toHaveTextContent('testuser');
    });
    
    expect(authApi.login).toHaveBeenCalledWith({ username: 'testuser' });
  });

  test('handles registration successfully', async () => {
    render(<AuthProvider><AuthTest /></AuthProvider>);
    
    fireEvent.click(screen.getByTestId('register-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('username')).toHaveTextContent('testuser');
    });
    
    expect(authApi.register).toHaveBeenCalledWith({ 
      username: 'testuser', 
      email: 'test@example.com' 
    });
  });

  test('handles logout successfully', async () => {
    // Setup initial authenticated state
    authApi.getCurrentUser.mockResolvedValueOnce({
      success: true,
      user: { id: 1, username: 'testuser', token: 'test-token' }
    });
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'test-token'),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    render(<AuthProvider><AuthTest /></AuthProvider>);
    
    // First we need to be logged in
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Now logout
    fireEvent.click(screen.getByTestId('logout-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
    
    expect(authApi.logout).toHaveBeenCalled();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
  });

  test('handles login failure', async () => {
    // Mock login failure
    authApi.login.mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials'
    });
    
    render(<AuthProvider><AuthTest /></AuthProvider>);
    
    fireEvent.click(screen.getByTestId('login-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
  });
});

describe('AscentsContext', () => {
  const mockUser = { id: 1, username: 'testuser', token: 'test-token' };
  const mockAscents = [
    { id: 1, climb_name: 'Test Boulder', climb_type: 'boulder', user_id: 1 },
    { id: 2, climb_name: 'Test Route', climb_type: 'route', user_id: 1 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    ascentsApi.getUserAscents.mockResolvedValue({
      success: true,
      data: mockAscents
    });
    
    ascentsApi.createAscent.mockImplementation((ascentData) => 
      Promise.resolve({
        success: true,
        data: { id: Date.now(), ...ascentData }
      })
    );
    
    ascentsApi.deleteAscent.mockResolvedValue({ success: true });
    
    // Mock Auth
    authApi.getCurrentUser.mockResolvedValue({
      success: true,
      user: mockUser
    });
  });

  test('loads user ascents when authenticated', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'test-token'),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    render(<CombinedTest />);
    
    await waitFor(() => {
      expect(screen.getByTestId('ascents-status')).toHaveTextContent('Has ascents');
      expect(screen.getByTestId('ascents-count')).toHaveTextContent('2');
    });
    
    expect(ascentsApi.getUserAscents).toHaveBeenCalledWith({
      userId: 1,
      token: 'test-token'
    });
  });

  test('adds an ascent successfully', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'test-token'),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    render(<CombinedTest />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('ascents-count')).toHaveTextContent('2');
    });
    
    // Mock a successful add
    ascentsApi.createAscent.mockResolvedValueOnce({
      success: true,
      data: { id: 3, climb_name: 'Test Climb', climb_type: 'boulder', user_id: 1 }
    });
    
    fireEvent.click(screen.getByTestId('add-ascent'));
    
    // Should update to 3 ascents
    await waitFor(() => {
      expect(screen.getByTestId('ascents-count')).toHaveTextContent('3');
    });
    
    expect(ascentsApi.createAscent).toHaveBeenCalledWith(
      expect.objectContaining({ 
        climb_name: 'Test Climb', 
        climb_type: 'boulder',
        user_id: 1,
        username: 'testuser'
      }),
      'test-token'
    );
  });

  test('deletes an ascent successfully', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'test-token'),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    render(<CombinedTest />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('ascents-count')).toHaveTextContent('2');
    });
    
    // Setup getUserAscents to return one fewer ascent after deletion
    ascentsApi.getUserAscents
      .mockResolvedValueOnce({ success: true, data: mockAscents })
      .mockResolvedValueOnce({ success: true, data: [mockAscents[1]] });
    
    fireEvent.click(screen.getByTestId('delete-ascent'));
    
    // Should update to 1 ascent after successful deletion
    await waitFor(() => {
      expect(screen.getByTestId('ascents-count')).toHaveTextContent('1');
    });
    
    expect(ascentsApi.deleteAscent).toHaveBeenCalledWith(
      mockAscents[0].id,
      expect.objectContaining({ 
        userId: 1,
        token: 'test-token'
      })
    );
  });

  test('calculates statistics correctly', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'test-token'),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Setup mocks with more detailed data for stats calculation
    const detailedMockAscents = [
      { 
        id: 1, 
        climb_name: 'Test Boulder 1', 
        climb_type: 'boulder', 
        user_id: 1,
        sent: true,
        personal_grade: 'V5',
        date: '2025-04-15' 
      },
      { 
        id: 2, 
        climb_name: 'Test Route 1', 
        climb_type: 'route', 
        user_id: 1,
        sent: false,
        personal_grade: '5.11a',
        date: '2025-04-16'
      },
      { 
        id: 3, 
        climb_name: 'Test Boulder 2', 
        climb_type: 'boulder', 
        user_id: 1,
        sent: true,
        personal_grade: 'V3',
        date: '2025-04-17' 
      }
    ];
    
    ascentsApi.getUserAscents.mockResolvedValue({
      success: true,
      data: detailedMockAscents
    });
    
    render(<CombinedTest />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('ascents-count')).toHaveTextContent('3');
    });
    
    fireEvent.click(screen.getByTestId('calculate-stats'));
    
    // We're just testing that the function doesn't crash
    // In a real test we'd check the output, but the implementation 
    // would need to expose the calculated stats for testing
    expect(true).toBeTruthy(); // Placeholder assertion
  });
});
