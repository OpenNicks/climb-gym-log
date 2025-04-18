import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddClimbForm from '../AddClimbForm';

describe('AddClimbForm', () => {
  it('renders inputs and button', () => {
    render(<AddClimbForm onAdd={() => {}} />);
    expect(screen.getByPlaceholderText(/climb name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/grade/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add climb/i })).toBeInTheDocument();
  });

  it('calls onAdd and shows success on valid submit', async () => {
    const onAdd = jest.fn().mockResolvedValue();
    render(<AddClimbForm onAdd={onAdd} />);
    fireEvent.change(await screen.findByPlaceholderText(/climb name/i), { target: { value: 'Dyno' } });
    fireEvent.change(await screen.findByPlaceholderText(/grade/i), { target: { value: 'V5' } });
    fireEvent.click(await screen.findByRole('button', { name: /add climb/i }));
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ name: 'Dyno', grade: 'V5' }));
    expect(await screen.findByText(/climb added/i)).toBeInTheDocument();
  });

  it('shows error if onAdd throws', async () => {
    const onAdd = jest.fn().mockRejectedValue(new Error('No climbs for you'));
    render(<AddClimbForm onAdd={onAdd} />);
    fireEvent.change(await screen.findByPlaceholderText(/climb name/i), { target: { value: 'Fail' } });
    fireEvent.click(await screen.findByRole('button', { name: /add climb/i }));
    expect(await screen.findByText(/no climbs for you/i)).toBeInTheDocument();
  });

  it('disables input/button and shows spinner while loading', async () => {
    let resolve;
    const onAdd = jest.fn(() => new Promise(r => { resolve = r; }));
    render(<AddClimbForm onAdd={onAdd} />);
    fireEvent.change(await screen.findByPlaceholderText(/climb name/i), { target: { value: 'Slow Climb' } });
    fireEvent.click(await screen.findByRole('button', { name: /add climb/i }));
    expect(await screen.findByRole('button', { name: /adding/i })).toBeDisabled();
    expect(screen.getByText(/⏳/)).toBeInTheDocument();
    resolve();
    await waitFor(() => expect(screen.queryByText(/⏳/)).not.toBeInTheDocument());
  });

  it('does not call onAdd or submit if name is empty', async () => {
    const onAdd = jest.fn();
    render(<AddClimbForm onAdd={onAdd} />);
    fireEvent.change(await screen.findByPlaceholderText(/climb name/i), { target: { value: '' } });
    fireEvent.click(await screen.findByRole('button', { name: /add climb/i }));
    // onAdd should not be called, and required HTML5 validation will block submission
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows error if onAdd throws due to invalid grade', async () => {
    // Simulate validation in onAdd
    const onAdd = jest.fn().mockImplementation(({ name, grade }) => {
      if (!/^V\d+$/.test(grade)) throw new Error('Invalid grade');
      return Promise.resolve();
    });
    render(<AddClimbForm onAdd={onAdd} />);
    fireEvent.change(await screen.findByPlaceholderText(/climb name/i), { target: { value: 'Test' } });
    fireEvent.change(await screen.findByPlaceholderText(/grade/i), { target: { value: 'badgrade' } });
    fireEvent.click(await screen.findByRole('button', { name: /add climb/i }));
    expect(await screen.findByText(/invalid grade/i)).toBeInTheDocument();
  });
});
