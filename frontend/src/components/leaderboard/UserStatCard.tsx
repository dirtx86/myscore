import { useState, useRef, useEffect } from 'react';
import type { LeaderboardEntry } from '../../types';
import { Avatar } from '../ui/Avatar';
import { RankMedal } from './RankMedal';
import { displayLabel } from '../../utils/displayLabel';

interface UserStatCardProps {
  entry: LeaderboardEntry;
  children: React.ReactNode;
}

export function UserStatCard({ entry, children }: UserStatCardProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  function show() {
    clearTimeout(timerRef.current);
    setVisible(true);
  }

  function hide() {
    timerRef.current = setTimeout(() => setVisible(false), 120);
  }

  useEffect(() => {
    if (!visible || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const cardW = 220;
    let left = r.right + 10;
    if (left + cardW > window.innerWidth - 12) left = r.left - cardW - 10;
    setPos({ top: r.top, left });
  }, [visible]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const { user, rank, totalPts, fullCount, totoCount, goalDiffCount, playedCount } = entry;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ cursor: 'default' }}
      >
        {children}
      </span>
      {visible && (
        <div
          ref={cardRef}
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 500,
            width: 220,
            background: 'var(--bg-1)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r)',
            padding: 16,
            boxShadow: 'var(--shadow)',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Avatar displayName={user.displayName} avatarUrl={user.avatarUrl ?? undefined} size={44} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{displayLabel(user)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <RankMedal rank={rank} size={18} />
                <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Rank #{rank}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Total Pts', value: totalPts, mono: true, accent: true },
              { label: 'Played', value: playedCount, mono: true },
              { label: 'Full scores', value: fullCount, mono: true },
              { label: 'Toto scores', value: totoCount, mono: true },
              { label: 'Goal diff', value: goalDiffCount, mono: true },
            ].map(({ label, value, mono, accent }) => (
              <div key={label} style={{
                background: 'var(--bg-2)', borderRadius: 'var(--r-sm)',
                padding: '8px 10px',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                  {label}
                </div>
                <div style={{
                  fontFamily: mono ? 'var(--font-mono)' : undefined,
                  fontWeight: 700, fontSize: 16,
                  color: accent ? 'var(--accent-text)' : 'var(--text)',
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
