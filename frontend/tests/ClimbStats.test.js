import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClimbStats from '../src/components/ClimbStats';
import { AscentsProvider } from '../src/contexts/AscentsContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import * as authApi from '../src/api/auth';
import * as ascentsApi from '../src/api/ascents';

// Mock dependencies
jest.mock('../src/api/auth');
jest.mock('../src/api/ascents');
jest.mock('chart.js');
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>
}));
jest.mock('../src/components/NotificationProvider', () => ({
  useNotification: () => ({
    showNotification: jest.fn(),
  }),
}));

// Test wrapper with providers
const renderWithProviders = (ui) => {
  return render(
    <AuthProvider>
      <AscentsProvider>
        {ui}
      </AscentsProvider>
    </AuthProvider>
  );
};

describe('ClimbStats Component', () => {
  const mockUser = { id: 1, username: 'testuser', token: 'test-token' };
  const mockAscents = [
    { 
      id: 1, 
      climb_name: 'Test Boulder 1', 
      climb_type: 'boulder', 
      user_id: 1,
      username: 'testuser',
      sent: true,
      personal_grade: 'V5',
      quality: 3,
      date: '2025-04-15'
    },
    { 
      id: 2, 
      climb_name: 'Test Route 1', 
      climb_type: 'route', 
      user_id: 1,
      username: 'testuser',
      sent: false,
      personal_grade: '5.11a',
      quality: 4,
      date: '2025-04-16'
    },
    { 
      id: 3, 
      climb_name: 'Test Boulder 2', 
      climb_type: 'boulder', 
      user_id: 1,
      username: 'testuser',
      sent: true,
      personal_grade: 'V3',
      quality: 5,
      date: '2025-04-17'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authentication and ascents data
    authApi.getCurrentUser.mockResolvedValue({
      success: true,
      user: mockUser
    });
    
    ascentsApi.getUserAscents.mockResolvedValue({
      success: true,
      data: mockAscents
    });
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'test-token'),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  test('renders the stats overview by default', async () => {
    renderWithProviders(<ClimbStats />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Climbing Statistics')).toBeInTheDocument();
    });
    
    // Should show overview tab by default
    expect(screen.getByText('Total Ascents')).toBeInTheDocument();
    expect(screen.getByText('Send Streak')).toBeInTheDocument();
    expect(screen.getByText('Hardest Boulder')).toBeInTheDocument();
    expect(screen.getByText('Hardest Route')).toBeInTheDocument();
  });

  test('allows navigation between tabs', async () => {
    renderWithProviders(<ClimbStats />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Climbing Statistics')).toBeInTheDocument();
    });
    
    // Switch to Grades tab
    fireEvent.click(screen.getByRole('tab', { name: /grades/i }));
    await waitFor(() => {
      expect(screen.getByText('Boulder Grades')).toBeInTheDocument();
      expect(screen.getByText('Route Grades')).toBeInTheDocument();
    });
    
    // Switch to Send Rate tab
    fireEvent.click(screen.getByRole('tab', { name: /send rate/i }));
    await waitFor(() => {
      expect(screen.getByText('Send Rate')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
    
    // Switch to Activity tab
    fireEvent.click(screen.getByRole('tab', { name: /activity/i }));
    await waitFor(() => {
      expect(screen.getByText('Climbing Activity (6 Months)')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    
    // Back to Overview
    fireEvent.click(screen.getByRole('tab', { name: /overview/i }));
    await waitFor(() => {
      expect(screen.getByText('Total Ascents')).toBeInTheDocument();
    });
  });

  test('displays a message when no ascents are available', async () => {
    // Mock no ascents
    ascentsApi.getUserAscents.mockResolvedValue({
      success: true,
      data: []
    });
    
    renderWithProviders(<ClimbStats />);
    
    await waitFor(() => {
      expect(screen.getByText(/No climbs logged yet/i)).toBeInTheDocument();
    });
  });

  test('shows a message when not authenticated', async () => {
    // Mock not authenticated
    authApi.getCurrentUser.mockResolvedValue({
      success: false,
      error: 'Invalid token'
    });
    
    localStorage.removeItem('auth_token');
    
    renderWithProviders(<ClimbStats />);
    
    await waitFor(() => {
      expect(screen.getByText(/Please log in to view your stats/i)).toBeInTheDocument();
    });
  });

  test('shows loading state while data is being fetched', async () => {
    // Delay the API response to test loading state
    ascentsApi.getUserAscents.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        success: true, 
        data: mockAscents 
      }), 100))
    );
    
    renderWithProviders(<ClimbStats />);
    
    // Should show loading first
    expect(screen.getByText(/Loading stats/i)).toBeInTheDocument();
    
    // Then content after loading
    await waitFor(() => {
      expect(screen.getByText('Total Ascents')).toBeInTheDocument();
    });
  });
});
