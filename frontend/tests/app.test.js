import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

// Mock the NotificationProvider context
jest.mock('../src/components/NotificationProvider', () => ({
  useNotification: () => ({
    showNotification: jest.fn(),
  }),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('renders login form when not authenticated', () => {
    render(<App />);
    expect(screen.getByText(/Please log in to track your ascents/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  });

  it('shows content after login', () => {
    render(<App />);
    
    // Log in
    fireEvent.change(screen.getByPlaceholderText('Username'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.click(screen.getByText('Log in'));
    
    // Should now show logged in UI
    expect(screen.getByText(/Logged in as testuser/i)).toBeInTheDocument();
    expect(screen.queryByText(/Please log in to track your ascents/i)).not.toBeInTheDocument();
  });

  it('hides content after logout', () => {
    render(<App />);
    
    // First log in
    fireEvent.change(screen.getByPlaceholderText('Username'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.click(screen.getByText('Log in'));
    
    // Then log out
    fireEvent.click(screen.getByText('Log out'));
    
    // Should show login form again
    expect(screen.getByText(/Please log in to track your ascents/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  });

  it('only shows user-specific ascents', async () => {
    // Setup localStorage with mixed-user ascents
    const mockAscents = [
      { id: 1, climb_name: 'User1 Boulder', user_id: 123, username: 'user1' },
      { id: 2, climb_name: 'User2 Boulder', user_id: 456, username: 'user2' }
    ];
    mockLocalStorage.setItem('ascents', JSON.stringify(mockAscents));
    
    render(<App />);
    
    // Log in as user1
    fireEvent.change(screen.getByPlaceholderText('Username'), { 
      target: { value: 'user1' } 
    });
    fireEvent.click(screen.getByText('Log in'));
    
    // Navigate to My Ascents
    fireEvent.click(screen.getByText('My Ascents'));
    
    // Should only see user1's ascents
    expect(screen.queryByText('User1 Boulder')).toBeInTheDocument();
    expect(screen.queryByText('User2 Boulder')).not.toBeInTheDocument();
  });

  it('allows logging ascent when authenticated', () => {
    render(<App />);
    
    // Log in
    fireEvent.change(screen.getByPlaceholderText('Username'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.click(screen.getByText('Log in'));
    
    // Should see Log Ascent buttons enabled
    expect(screen.getByText(/Log Ascent/i)).toBeEnabled();
  });
});
