// frontend/src/components/layout/AppShell.tsx
import { Outlet } from 'react-router-dom';

export default function AppShell() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-0)', color: 'var(--text)' }}>
      <Outlet />
    </div>
  );
}
