// frontend/src/router.tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastHost } from './components/ui/Toast';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import MatchesPage from './pages/MatchesPage';
import PredictionsPage from './pages/PredictionsPage';
import BracketPage from './pages/BracketPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StatsPage from './pages/StatsPage';
import AdminPage from './pages/AdminPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HelpPage from './pages/HelpPage';
import ProfilePage from './pages/ProfilePage';

function RootLayout() {
  return (
    <AuthProvider>
      <ToastHost>
        <Outlet />
      </ToastHost>
    </AuthProvider>
  );
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminRoute() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/', element: <DashboardPage /> },
              { path: '/matches', element: <MatchesPage /> },
              { path: '/predictions', element: <PredictionsPage /> },
              { path: '/bracket', element: <BracketPage /> },
              { path: '/leaderboard', element: <LeaderboardPage /> },
              { path: '/stats', element: <StatsPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/help', element: <HelpPage /> },
            ],
          },
        ],
      },
      { path: '/auth/callback', element: <AuthCallbackPage /> },
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AppShell />,
            children: [{ path: '/admin', element: <AdminPage /> }],
          },
        ],
      },
    ],
  },
]);
