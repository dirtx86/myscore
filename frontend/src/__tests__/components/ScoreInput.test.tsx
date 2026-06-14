import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { ScoreInput } from '../../components/match/ScoreInput';

describe('ScoreInput', () => {
  it('renders current value', () => {
    render(<ScoreInput value={3} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('increment button calls onChange with value + 1', async () => {
    const onChange = vi.fn();
    render(<ScoreInput value={2} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase score'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('decrement button calls onChange with value - 1', async () => {
    const onChange = vi.fn();
    render(<ScoreInput value={2} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease score'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('does not go below 0', async () => {
    const onChange = vi.fn();
    render(<ScoreInput value={0} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease score'));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('does not go above 20', async () => {
    const onChange = vi.fn();
    render(<ScoreInput value={20} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase score'));
    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('ArrowUp key increments', () => {
    const onChange = vi.fn();
    render(<ScoreInput value={5} onChange={onChange} />);
    const input = screen.getByDisplayValue('5');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('ArrowDown key decrements', () => {
    const onChange = vi.fn();
    render(<ScoreInput value={5} onChange={onChange} />);
    const input = screen.getByDisplayValue('5');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('disabled state disables all controls', () => {
    render(<ScoreInput value={0} onChange={vi.fn()} disabled />);
    expect(screen.getByLabelText('Increase score')).toBeDisabled();
    expect(screen.getByLabelText('Decrease score')).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });
});
