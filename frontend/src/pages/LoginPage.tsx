import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  displayName: string;
  mustChangePassword?: boolean;
}

type Step = 'login' | 'change-password';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const decoded = jwtDecode<DecodedToken>(data.accessToken);
      if (decoded.mustChangePassword) {
        // Store token so axios can make authenticated requests (change-password)
        login(data.accessToken);
        setStep('change-password');
      } else {
        login(data.accessToken);
        toast('Welcome back!', 'success');
        navigate('/');
      }
    } catch (err: unknown) {
      const anyErr = err as { response?: { status?: number } };
      if (anyErr?.response?.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword: password, newPassword });
      toast('Password updated! Welcome to MySCORE.', 'success');
      navigate('/');
    } catch {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--bg-0)',
    }}>
      {/* Left brand panel — hidden on mobile */}
      <div style={{
        flex: '0 0 440px', background: 'var(--field-grad)',
        borderRight: '1px solid var(--line)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
        padding: 48,
      }} className="hide-mobile">
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 900, color: 'var(--accent-ink)',
          fontFamily: 'var(--font-mono)',
        }}>
          ⚽
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
            MySCORE
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-mute)', lineHeight: 1.6, maxWidth: 280 }}>
            The internal FIFA World Cup 2026 prediction game. Pick your scores, climb the leaderboard, prove you know football.
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 20, marginTop: 16,
        }}>
          {['Predict', 'Compete', 'Win'].map((label) => (
            <div key={label} style={{
              textAlign: 'center', padding: '12px 20px',
              background: 'var(--bg-2)', border: '1px solid var(--line)',
              borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600, color: 'var(--text-dim)',
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {step === 'login' ? (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--text)' }}>
                  Sign in
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-mute)' }}>
                  Enter your credentials to access MySCORE.
                </p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                {error && (
                  <p role="alert" style={{ fontSize: 13, color: 'var(--danger)', background: 'rgba(255,77,94,0.08)', padding: '10px 14px', borderRadius: 'var(--r-sm)' }}>
                    {error}
                  </p>
                )}

                <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
                  Sign in
                </Button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 4px' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-mute)', whiteSpace: 'nowrap' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }} />
              </div>

              <a
                href={`${import.meta.env.VITE_API_URL}/auth/google`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '10px 16px', border: '1px solid var(--line-2)',
                  borderRadius: 'var(--r-sm)', textDecoration: 'none',
                  color: 'var(--text)', fontSize: 14, fontWeight: 600,
                  background: 'var(--bg-inset)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </a>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-mute)' }}>
                <Link to="/forgot-password" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </Link>
                <Link to="/register" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
                  Don't have an account? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--text)' }}>
                  Set a new password
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-mute)' }}>
                  Your account requires a password change before you can continue.
                </p>
              </div>

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />

                {error && (
                  <p role="alert" style={{ fontSize: 13, color: 'var(--danger)', background: 'rgba(255,77,94,0.08)', padding: '10px 14px', borderRadius: 'var(--r-sm)' }}>
                    {error}
                  </p>
                )}

                <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
                  Update password &amp; continue
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
