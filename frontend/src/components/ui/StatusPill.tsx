import type { MatchStatus } from '../../types';
import { Icon } from './Icon';

export interface StatusPillProps {
  status: MatchStatus;
  minute?: number;
}

export function StatusPill({ status, minute }: StatusPillProps) {
  if (status === 'live') {
    return (
      <span className="pill-live">
        LIVE
        {minute != null && <span aria-label={`${minute} minutes`}>{minute}'</span>}
      </span>
    );
  }
  if (status === 'locked') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'rgba(255,176,32,0.12)', color: 'var(--warn)',
        borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600,
      }} className="pill-locked">
        <Icon name="lock" size={11} />
        Locked
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        background: 'var(--bg-2)', color: 'var(--text-mute)',
        borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600,
      }} className="pill-done">FT</span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'var(--bg-2)', color: 'var(--text-mute)',
      borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600,
    }} className="pill-scheduled">Scheduled</span>
  );
}
