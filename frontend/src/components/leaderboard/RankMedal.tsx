export interface RankMedalProps {
  rank: number;
  size?: number;
}

export function RankMedal({ rank, size = 32 }: RankMedalProps) {
  if (rank <= 3) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: Math.round(size * 0.44),
          color: rank === 1 ? '#15120a' : '#fff',
          flexShrink: 0,
        }}
        className={`rank-${rank}`}
      >
        {rank}
      </div>
    );
  }
  return (
    <span style={{
      width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: 'var(--text-mute)',
    }}>
      {rank}
    </span>
  );
}
