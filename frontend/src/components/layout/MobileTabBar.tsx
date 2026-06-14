import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';

interface TabItem {
  to: string;
  label: string;
  icon: string;
}

interface MobileTabBarProps {
  tabs: TabItem[];
}

export function MobileTabBar({ tabs }: MobileTabBarProps) {
  const location = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg-1)', borderTop: '1px solid var(--line)',
        backdropFilter: 'blur(14px)', zIndex: 200,
        display: 'flex', alignItems: 'stretch',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(tab.to);
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              padding: '10px 0', textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-mute)',
              fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
            }}
          >
            <Icon name={tab.icon} size={20} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
