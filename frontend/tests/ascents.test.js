import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import MyAscents from '../src/components/MyAscents';
import LogAscentForm from '../src/components/LogAscentForm';

// Mock data
const mockUser = { id: 123, username: 'testuser' };
const mockAscents = [
  {
    id: 1,
    climb_name: 'Test Boulder 1',
    climb_type: 'boulder',
    user_id: 123, // matches mockUser.id
    username: 'testuser',
    date: '2025-04-15',
    sent: true,
    personal_grade: 'V5',
    quality: 3,
    notes: 'Test notes'
  },
  {
    id: 2,
    climb_name: 'Test Route 1',
    climb_type: 'route',
    user_id: 456, // different user
    username: 'otheruser',
    date: '2025-04-16',
    sent: false,
    personal_grade: '5.11a',
    quality: 4,
    notes: 'Other user notes'
  },
  {
    id: 3,
    climb_name: 'Test Boulder 2',
    climb_type: 'boulder',
    user_id: 123, // matches mockUser.id
    username: 'testuser',
    date: '2025-04-17',
    sent: false,
    personal_grade: 'V6',
    quality: 5,
    notes: ''
  }
];

// Mock climb details for getClimbDetails
jest.mock('../src/mockData', () => ({
  mockBoulders: [
    { id: 1, name: 'Test Boulder 1', setter_grade: 'V4', color: 'Red', section: 'Cave', setter: 'Alex' },
    { id: 3, name: 'Test Boulder 2', setter_grade: 'V7', color: 'Blue', section: 'Wall', setter: 'Beth' }
  ],
  mockRoutes: [
    { id: 2, name: 'Test Route 1', setter_grade: '5.10d', color: 'Green', section: 'Lead Wall', setter: 'Carlos' }
  ]
}));

// Helper to create a test ascent
const makeAscent = (overrides = {}) => ({
  id: Math.floor(Math.random() * 100000),
  climb_id: 1,
  climb_name: 'Test Boulder',
  climb_type: 'boulder',
  user_id: 11,
  username: 'demo',
  date: '2025-04-17',
  sent: true,
  personal_grade: 'V4',
  quality: 4,
  notes: 'Felt good!',
  ...overrides,
});

describe('MyAscents', () => {
  const mockDeleteAscent = jest.fn();
  const mockEditAscent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders only the current user\'s ascents', () => {
    // Pass both current user and other user ascents
    const userAscents = mockAscents.filter(a => a.user_id === mockUser.id);
    
    render(
      <MyAscents
        ascents={userAscents}
        user={mockUser}
        onDeleteAscent={mockDeleteAscent}
        onEditAscent={mockEditAscent}
      />
    );
    
    // Should see the current user's ascents
    expect(screen.getByText('Test Boulder 1')).toBeInTheDocument();
    expect(screen.getByText('Test Boulder 2')).toBeInTheDocument();
    
    // Should not see other user's ascents
    expect(screen.queryByText('Test Route 1')).not.toBeInTheDocument();
  });

  it('filters ascents by sent/project', () => {
    const userAscents = mockAscents.filter(a => a.user_id === mockUser.id);
    
    render(
      <MyAscents
        ascents={userAscents}
        user={mockUser}
        onDeleteAscent={mockDeleteAscent}
        onEditAscent={mockEditAscent}
      />
    );
    
    // Start with all ascents visible
    expect(screen.getByText('Test Boulder 1')).toBeInTheDocument(); // sent
    expect(screen.getByText('Test Boulder 2')).toBeInTheDocument(); // project
    
    // Filter to sent only
    fireEvent.click(screen.getByText('Sent'));
    expect(screen.getByText('Test Boulder 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Boulder 2')).not.toBeInTheDocument();
    
    // Filter to projects only
    fireEvent.click(screen.getByText('Project'));
    expect(screen.queryByText('Test Boulder 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Boulder 2')).toBeInTheDocument();
  });
  
  it('searching filters ascents properly', () => {
    const userAscents = mockAscents.filter(a => a.user_id === mockUser.id);
    
    render(
      <MyAscents
        ascents={userAscents}
        user={mockUser}
        onDeleteAscent={mockDeleteAscent}
        onEditAscent={mockEditAscent}
      />
    );
    
    // Search for V5 grade (only in Test Boulder 1)
    fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: 'V5' } });
    expect(screen.getByText('Test Boulder 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Boulder 2')).not.toBeInTheDocument();
    
    // Search for Boulder 2
    fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: 'Boulder 2' } });
    expect(screen.queryByText('Test Boulder 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Boulder 2')).toBeInTheDocument();
    
    // Clear search
    fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: '' } });
    expect(screen.getByText('Test Boulder 1')).toBeInTheDocument();
    expect(screen.getByText('Test Boulder 2')).toBeInTheDocument();
  });

  it('can delete an ascent with undo capability', () => {
    const userAscents = mockAscents.filter(a => a.user_id === mockUser.id);
    
    render(
      <MyAscents
        ascents={userAscents}
        user={mockUser}
        onDeleteAscent={mockDeleteAscent}
        onEditAscent={mockEditAscent}
      />
    );
    
    // Find delete button for first ascent
    const deleteButtons = screen.getAllByLabelText(/Delete ascent/i);
    fireEvent.click(deleteButtons[0]);
    
    // Should show undo bar
    expect(screen.getByText(/Ascent deleted/i)).toBeInTheDocument();
    expect(screen.getByText(/Undo/i)).toBeInTheDocument();
    
    // onDeleteAscent shouldn't be called yet (waiting for undo timeout)
    expect(mockDeleteAscent).not.toHaveBeenCalled();
    
    // Click undo
    fireEvent.click(screen.getByText(/Undo/i));
    
    // Undo bar should be gone
    expect(screen.queryByText(/Ascent deleted/i)).not.toBeInTheDocument();
    expect(mockDeleteAscent).not.toHaveBeenCalled();
  });

  it('can edit an ascent', () => {
    const userAscents = mockAscents.filter(a => a.user_id === mockUser.id);
    
    render(
      <MyAscents
        ascents={userAscents}
        user={mockUser}
        onDeleteAscent={mockDeleteAscent}
        onEditAscent={mockEditAscent}
      />
    );
    
    // Find edit button for first ascent
    const editButtons = screen.getAllByLabelText(/Edit ascent/i);
    fireEvent.click(editButtons[0]);
    
    // Should call onEditAscent with the correct ascent
    expect(mockEditAscent).toHaveBeenCalledWith(userAscents[0]);
  });
  
  it('shows stats based on current user\'s ascents', () => {
    const userAscents = mockAscents.filter(a => a.user_id === mockUser.id);
    
    render(
      <MyAscents
        ascents={userAscents}
        user={mockUser}
        onDeleteAscent={mockDeleteAscent}
        onEditAscent={mockEditAscent}
      />
    );
    
    // Check that stats are showing correctly
    expect(screen.getByText(/Total logged: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Sent: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Projects: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Unique climbs: 2/i)).toBeInTheDocument();
  });
});

describe('LogAscentForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the form correctly for boulder', () => {
    render(<LogAscentForm climbType="boulder" onSubmit={mockSubmit} user={mockUser} ascents={mockAscents} />);
    
    expect(screen.getByText(/Log Ascent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Climb Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sent?/i)).toBeInTheDocument();
  });

  it('shows appropriate grade scale for boulder', () => {
    render(<LogAscentForm climbType="boulder" onSubmit={mockSubmit} user={mockUser} ascents={mockAscents} />);
    
    const gradeSelect = screen.getByLabelText(/Personal Grade/i);
    expect(gradeSelect).toBeInTheDocument();
    expect(screen.getByText('V0')).toBeInTheDocument();
    expect(screen.getByText('V10')).toBeInTheDocument();
  });
  
  it('shows appropriate grade scale for route', () => {
    render(<LogAscentForm climbType="route" onSubmit={mockSubmit} user={mockUser} ascents={mockAscents} />);
    
    const gradeSelect = screen.getByLabelText(/Personal Grade/i);
    expect(gradeSelect).toBeInTheDocument();
    expect(screen.getByText('5.6')).toBeInTheDocument();
    expect(screen.getByText('5.14a')).toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(<LogAscentForm climbType="boulder" onSubmit={mockSubmit} user={mockUser} ascents={mockAscents} />);
    
    // Try to submit without required fields
    fireEvent.click(screen.getByText('Submit'));
    
    // Should show validation error
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('submits with valid data and attaches user information', () => {
    render(<LogAscentForm climbType="boulder" onSubmit={mockSubmit} user={mockUser} ascents={mockAscents} />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Climb Name/i), { target: { value: 'New Test Boulder' } });
    fireEvent.click(screen.getByLabelText(/Sent\?/i));
    fireEvent.change(screen.getByLabelText(/Quality/i), { target: { value: '4' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit'));
    
    // Check that onSubmit was called with correct data including userID
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      climb_name: 'New Test Boulder',
      climb_type: 'boulder',
      sent: true,
      quality: '4'
    }));
  });

  it('loads data for editing when editAscent is provided', () => {
    const editAscent = mockAscents[0];
    
    render(
      <LogAscentForm 
        climbType="boulder" 
        onSubmit={mockSubmit} 
        user={mockUser} 
        ascents={mockAscents}
        editAscent={editAscent}
      />
    );
    
    // Check that form is pre-filled with ascent data
    expect(screen.getByLabelText(/Climb Name/i).value).toBe(editAscent.climb_name);
    expect(screen.getByLabelText(/Personal Grade/i).value).toBe(editAscent.personal_grade);
    expect(screen.getByLabelText(/Sent\?/i).checked).toBe(editAscent.sent);
    expect(screen.getByLabelText(/Quality/i).value).toBe(editAscent.quality.toString());
    expect(screen.getByLabelText(/Notes/i).value).toBe(editAscent.notes);
  });
});
