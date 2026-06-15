import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileTabBar } from './MobileTabBar';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/matches', label: 'Matches', icon: 'matches' },
  { to: '/predictions', label: 'My Predictions', icon: 'predictions' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/stats', label: 'Statistics', icon: 'stats' },
  { to: '/profile', label: 'My Profile', icon: 'user' },
  { to: '/help', label: 'How it works', icon: 'info' },
];

const ADMIN_NAV = { to: '/admin', label: 'Admin', icon: 'admin' };

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/matches': 'Matches',
  '/predictions': 'My Predictions',
  '/leaderboard': 'Leaderboard',
  '/stats': 'Statistics',
  '/profile': 'My Profile',
  '/help': 'How it works',
  '/admin': 'Admin',
};

function getThemePreference(): 'dark' | 'light' {
  try {
    return (localStorage.getItem('myscore-theme') as 'dark' | 'light') || 'dark';
  } catch {
    return 'dark';
  }
}

export default function AppShell() {
  const [theme, setTheme] = useState<'dark' | 'light'>(getThemePreference);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('myscore-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'MySCORE';
  const navItems = user?.role === 'admin' ? [...NAV_ITEMS, ADMIN_NAV] : NAV_ITEMS;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-0)' }}>
      {/* Sidebar — hidden on mobile via CSS */}
      <style>{`
        @media (max-width: 880px) { .sidebar-desktop { display: none !important; } }
        @media (min-width: 881px) { .mobile-tabbar { display: none !important; } }
      `}</style>

      <div className="sidebar-desktop">
        <Sidebar navItems={navItems} onLogout={logout} onChangePassword={() => setShowChangePassword(true)} />
      </div>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar title={pageTitle} theme={theme} onToggleTheme={toggleTheme} />
        <main style={{ padding: '26px 28px 60px', maxWidth: 'var(--maxw)', margin: '0 auto', width: '100%' }} id="main-content">
          <Outlet />
        </main>
      </div>

      <div className="mobile-tabbar">
        <MobileTabBar tabs={NAV_ITEMS.slice(0, 5)} />
      </div>
    </div>
  );
}
