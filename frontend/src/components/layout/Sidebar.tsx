import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  onLogout: () => void;
}

export function Sidebar({ navItems, onLogout }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside style={{
      width: 244, minHeight: '100vh', background: 'var(--bg-1)',
      borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 'var(--r-sm)',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="trophy" size={18} style={{ color: 'var(--accent-ink)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>MySCORE</div>
          <div style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>WC2026</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }} aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--r-sm)',
                color: isActive ? 'var(--text)' : 'var(--text-dim)',
                background: isActive ? 'var(--bg-2)' : 'transparent',
                fontWeight: 500, fontSize: 14,
                textDecoration: 'none', position: 'relative',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
              {item.badge != null && item.badge > 0 && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--accent)', color: 'var(--accent-ink)',
                  borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700,
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User chip */}
      {user && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar displayName={user.displayName} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
                {user.displayName}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {user.role}
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Log out"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-mute)', padding: 6, borderRadius: 'var(--r-xs)',
              }}
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
