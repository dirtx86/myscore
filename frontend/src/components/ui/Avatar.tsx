const AVATAR_COLORS = [
  '#ff8a3d', '#5b8def', '#19c08a', '#c45bef',
  '#ef5b7a', '#e0a619', '#3dd6c4', '#8d6bef',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInitials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export interface AvatarProps {
  displayName: string;
  size?: number;
  className?: string;
}

export function Avatar({ displayName, size = 36, className }: AvatarProps) {
  const bg = AVATAR_COLORS[hashString(displayName) % AVATAR_COLORS.length];
  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: Math.round(size * 0.38),
        fontWeight: 700, color: '#fff', flexShrink: 0, userSelect: 'none',
      }}
      aria-label={displayName}
      role="img"
    >
      {getInitials(displayName)}
    </div>
  );
}
