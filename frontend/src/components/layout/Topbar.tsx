import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  title: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Topbar({ title, theme, onToggleTheme }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100, height: 58,
      background: 'rgba(14,19,27,0.85)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12,
    }} role="banner">
      <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{title}</span>
      {import.meta.env.VITE_ENVIRONMENT === 'staging' && (
        <span style={{
          padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)',
          userSelect: 'none',
        }}>staging</span>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-sm)', padding: 8, cursor: 'pointer',
            color: 'var(--text-dim)', display: 'flex', alignItems: 'center',
          }}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
        </button>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar displayName={user.displayName} size={30} />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dim)' }}>
              {user.displayName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
