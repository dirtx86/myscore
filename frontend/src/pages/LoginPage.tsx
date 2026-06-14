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

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-mute)' }}>
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
