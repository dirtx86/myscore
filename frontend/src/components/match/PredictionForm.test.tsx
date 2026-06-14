import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PredictionForm } from './PredictionForm';
import type { Match, ScoreRules } from '../../types';

const mockMatch: Match = {
  id: 'm1', tournamentId: 't1',
  homeTeam: { id: 'h1', tournamentId: 't1', name: 'Mexico', fifaCode: 'MEX', isoCode: 'mx', groupLabel: 'A' },
  awayTeam: { id: 'a1', tournamentId: 't1', name: 'Argentina', fifaCode: 'ARG', isoCode: 'ar', groupLabel: 'A' },
  kickoffAt: new Date(Date.now() + 3_600_000).toISOString(),
  stage: 'group', groupLabel: 'A', status: 'scheduled',
};

const mockRules: ScoreRules = { id: 'r1', tournamentId: 't1', totoPts: 1, fullScorePts: 3, goalDiffPts: 1 };

describe('PredictionForm', () => {
  it('disables all inputs when isLocked is true', () => {
    render(<PredictionForm match={mockMatch} rules={mockRules} onSave={vi.fn()} isLocked={true} />);
    const inputs = screen.getAllByRole('spinbutton');
    inputs.forEach(input => expect(input).toBeDisabled());
  });

  it('clamps stepper to 0 minimum', async () => {
    render(<PredictionForm match={mockMatch} rules={mockRules} onSave={vi.fn()} isLocked={false} />);
    const downBtns = screen.getAllByLabelText(/decrease score/i);
    await userEvent.click(downBtns[0]); // already at 0
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(0);
  });

  it('clamps stepper to 20 maximum', async () => {
    render(<PredictionForm match={mockMatch} rules={mockRules} onSave={vi.fn()} isLocked={false} />);
    const input = screen.getAllByRole('spinbutton')[0];
    await userEvent.clear(input);
    await userEvent.type(input, '20');
    const upBtns = screen.getAllByLabelText(/increase score/i);
    await userEvent.click(upBtns[0]);
    expect(input).toHaveValue(20);
  });

  it('calls onSave with home and away scores on submit', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<PredictionForm match={mockMatch} rules={mockRules} onSave={onSave} isLocked={false} />);
    const upBtns = screen.getAllByLabelText(/increase score/i);
    await userEvent.click(upBtns[0]); // home = 1
    await userEvent.click(screen.getByRole('button', { name: /save prediction/i }));
    expect(onSave).toHaveBeenCalledWith(1, 0);
  });
});
