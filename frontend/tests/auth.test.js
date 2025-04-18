import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Auth from '../src/components/Auth';

describe('Auth Component', () => {
  const mockOnLogin = jest.fn();
  const mockOnLogout = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form when not logged in', () => {
    render(<Auth onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('renders logout button when logged in', () => {
    const mockUser = { username: 'testuser', id: 123 };
    render(<Auth user={mockUser} onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    
    expect(screen.getByText(`Logged in as ${mockUser.username}`)).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('toggles between login and signup forms', () => {
    render(<Auth onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    
    // Initially in login mode
    expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
    
    // Switch to signup mode
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    
    // Switch back to login mode
    fireEvent.click(screen.getByText('Log in'));
    expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
  });

  it('shows validation error for empty username', () => {
    render(<Auth onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    
    fireEvent.click(screen.getByText('Log in'));
    expect(screen.getByText('Username required')).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows validation error for empty email in signup', () => {
    render(<Auth onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    
    // Switch to signup
    fireEvent.click(screen.getByText('Sign up'));
    
    // Enter username but no email
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.click(screen.getByText('Sign up').closest('button'));
    
    expect(screen.getByText('Email required')).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin when login form submitted with valid data', () => {
    render(<Auth onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.click(screen.getByText('Log in').closest('button'));
    
    expect(mockOnLogin).toHaveBeenCalledWith(expect.objectContaining({
      username: 'testuser',
      email: '',
    }));
  });

  it('calls onLogin when signup form submitted with valid data', () => {
    render(<Auth onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    
    // Switch to signup
    fireEvent.click(screen.getByText('Sign up'));
    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Sign up').closest('button'));
    
    expect(mockOnLogin).toHaveBeenCalledWith(expect.objectContaining({
      username: 'testuser',
      email: 'test@example.com',
    }));
  });

  it('calls onLogout when logout button clicked', () => {
    const mockUser = { username: 'testuser', id: 123 };
    render(<Auth user={mockUser} onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    
    fireEvent.click(screen.getByText('Log out'));
    expect(mockOnLogout).toHaveBeenCalled();
  });
});
