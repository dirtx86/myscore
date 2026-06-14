import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusPill } from '../../components/ui/StatusPill';

describe('StatusPill', () => {
  it('renders "Scheduled" for scheduled status', () => {
    render(<StatusPill status="scheduled" />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('renders "Locked" for locked status', () => {
    render(<StatusPill status="locked" />);
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  it('renders "FT" for completed status', () => {
    render(<StatusPill status="completed" />);
    expect(screen.getByText('FT')).toBeInTheDocument();
  });

  it('renders "LIVE" for live status', () => {
    render(<StatusPill status="live" />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders live minute when provided', () => {
    render(<StatusPill status="live" minute={67} />);
    expect(screen.getByText("67'")).toBeInTheDocument();
  });

  it('applies pill-live class for live status', () => {
    const { container } = render(<StatusPill status="live" />);
    expect(container.firstChild).toHaveClass('pill-live');
  });
});
