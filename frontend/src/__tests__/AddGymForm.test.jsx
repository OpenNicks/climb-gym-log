import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddGymForm from '../AddGymForm';

describe('AddGymForm', () => {
  it('renders input and button', () => {
    render(<AddGymForm onAdd={() => {}} />);
    expect(screen.getByPlaceholderText(/new gym name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add gym/i })).toBeInTheDocument();
  });

  it('calls onAdd and shows success on valid submit', async () => {
    const onAdd = jest.fn().mockResolvedValue();
    render(<AddGymForm onAdd={onAdd} />);
    fireEvent.change(screen.getByPlaceholderText(/new gym name/i), { target: { value: 'My Gym' } });
    fireEvent.click(screen.getByRole('button', { name: /add gym/i }));
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith('My Gym'));
    await waitFor(() => expect(screen.getByText(/gym added/i)).toBeInTheDocument());
  });

  it('shows error if onAdd throws', async () => {
    const onAdd = jest.fn().mockRejectedValue(new Error('Nope'));
    render(<AddGymForm onAdd={onAdd} />);
    fireEvent.change(screen.getByPlaceholderText(/new gym name/i), { target: { value: 'Fail Gym' } });
    fireEvent.click(screen.getByRole('button', { name: /add gym/i }));
    await waitFor(() => expect(screen.getByText(/nope/i)).toBeInTheDocument());
  });

  it('disables input/button and shows spinner while loading', async () => {
    let resolve;
    const onAdd = jest.fn(() => new Promise(r => { resolve = r; }));
    render(<AddGymForm onAdd={onAdd} />);
    fireEvent.change(screen.getByPlaceholderText(/new gym name/i), { target: { value: 'Slow Gym' } });
    fireEvent.click(screen.getByRole('button', { name: /add gym/i }));
    expect(screen.getByRole('button', { name: /adding/i })).toBeDisabled();
    expect(screen.getByText(/⏳/)).toBeInTheDocument();
    resolve();
    await waitFor(() => expect(screen.queryByText(/⏳/)).not.toBeInTheDocument());
  });
});
