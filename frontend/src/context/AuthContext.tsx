import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { AuthTokenPayload, UserProfile } from '../types';
import { profileApi } from '../api/profile';

const TOKEN_KEY = 'mscore_token';

interface AuthContextValue {
  token: string | null;
  user: AuthTokenPayload | null;
  profile: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeToken(token: string): AuthTokenPayload | null {
  try {
    return jwtDecode<AuthTokenPayload>(token);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<AuthTokenPayload | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    return stored ? decodeToken(stored) : null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const navigate = useNavigate();

  const refreshProfile = useCallback(async () => {
    try {
      const p = await profileApi.getMe();
      setProfile(p);
    } catch {
      // ignore — user stays logged in even if profile fetch fails
    }
  }, []);

  // Fetch profile whenever we have a token
  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [token, refreshProfile]);

  const login = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(decodeToken(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setProfile(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        if (e.newValue) {
          setToken(e.newValue);
          setUser(decodeToken(e.newValue));
        } else {
          setToken(null);
          setUser(null);
          setProfile(null);
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      profile,
      login,
      logout,
      refreshProfile,
      isAuthenticated: token !== null && user !== null,
    }),
    [token, user, profile, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
