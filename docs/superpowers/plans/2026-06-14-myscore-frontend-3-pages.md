# MySCORE Frontend — Part 3: User Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all user-facing pages: auth flows, Dashboard, Matches, Predictions, Leaderboard, Stats.

**Architecture:** Pages compose hooks (TanStack Query) + presentational components from Part 2. No page manages server state directly — all data via hooks. Local state for filters/search/modals only.

**Tech Stack:** React 18, TypeScript 5, TanStack Query v5, React Router v6

**Prerequisites:** Parts 1 & 2 complete. All components, hooks, and types available.

---

## File Map

```
frontend/src/pages/
├── LoginPage.tsx
├── RegisterPage.tsx
├── ForgotPasswordPage.tsx
├── DashboardPage.tsx
├── MatchesPage.tsx
├── PredictionsPage.tsx
├── LeaderboardPage.tsx
└── StatsPage.tsx
```

All pages are registered in the existing router (`src/router.tsx` or `src/App.tsx`) behind an `<AppShell>` wrapper — except auth pages which render standalone. Consult how Part 2 wired the router; adjust the route registration steps below accordingly.

---

## Task 1 — Auth Pages (LoginPage, RegisterPage, ForgotPasswordPage)

### Step 1.1 — Create `src/pages/LoginPage.tsx`

- [ ] Create the file with the content below exactly:

```tsx
// src/pages/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login as apiLogin, changePassword as apiChangePassword } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { toast } = useToast();

  // Step: 'login' | 'change-password'
  const [step, setStep] = useState<'login' | 'change-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: () => apiLogin({ email, password }),
    onSuccess: (data) => {
      if (data.mustChangePassword) {
        // Backend returned a temporary token alongside mustChangePassword flag
        setSessionToken(data.token ?? '');
        setStep('change-password');
        return;
      }
      auth.login(data.token);
      navigate('/');
    },
    onError: (err: any) => {
      const status = err?.response?.status ?? err?.status;
      if (status === 401) {
        setError('Invalid email or password.');
      } else if (status === 403) {
        // Server may return token + mustChangePassword via 403 body
        const body = err?.response?.data ?? {};
        if (body.mustChangePassword) {
          setSessionToken(body.token ?? '');
          setStep('change-password');
        } else {
          setError('Account disabled. Contact an administrator.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      apiChangePassword({ token: sessionToken, newPassword }),
    onSuccess: (data) => {
      auth.login(data.token);
      toast('Password updated. Welcome!', 'success');
      navigate('/');
    },
    onError: () => {
      setError('Failed to update password. Please try again.');
    },
  });

  // ---- Login step ----
  if (step === 'login') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
        }}
        className="login-wrap"
      >
        {/* Brand panel — hidden on mobile via CSS */}
        <div
          className="login-brand hide-mobile"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--field-grad)',
            borderRight: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 52px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(70% 60% at 80% 10%, color-mix(in oklab, var(--accent) 14%, transparent), transparent)',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 'var(--r)',
                display: 'grid',
                placeItems: 'center',
                background:
                  'color-mix(in oklab, var(--accent) 18%, transparent)',
                color: 'var(--accent)',
              }}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 4H4v2a3 3 0 0 0 3 3m10-5h3v2a3 3 0 0 1-3 3" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                MySCORE
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-mute)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                }}
              >
                World Cup 2026
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-mute)',
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              Office prediction league
            </div>
            <h1
              style={{
                fontSize: 52,
                lineHeight: 1.02,
                maxWidth: 480,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Call the scores.
              <br />
              Climb the{' '}
              <span style={{ color: 'var(--accent)' }}>board.</span>
            </h1>
            <p
              style={{
                color: 'var(--text-dim)',
                fontSize: 15.5,
                maxWidth: 420,
                marginTop: 18,
                lineHeight: 1.6,
              }}
            >
              Predict every fixture of the FIFA World Cup 2026, bank
              points for exact scores and correct results, and settle who
              really knows football across the company.
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                gap: 26,
              }}
            >
              {[
                { n: '5', l: 'pts · exact score' },
                { n: '3', l: 'pts · correct result' },
                { n: '48', l: 'teams · 12 groups' },
              ].map(({ n, l }) => (
                <div key={l}>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: 'var(--accent)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10.5,
                      color: 'var(--text-mute)',
                      marginTop: 4,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 28,
            background: 'var(--bg-0)',
          }}
        >
          <div style={{ width: '100%', maxWidth: 360 }}>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>Sign in</h2>
            <p
              style={{
                color: 'var(--text-dim)',
                fontSize: 14,
                marginTop: 0,
                marginBottom: 26,
              }}
            >
              Welcome back — your predictions are waiting.
            </p>

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  background:
                    'color-mix(in oklab, var(--danger) 12%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--danger) 30%, transparent)',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 13.5,
                  color: 'var(--danger)',
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                loginMutation.mutate();
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--text-dim)',
                    marginBottom: 6,
                  }}
                >
                  Work email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--text-dim)',
                    marginBottom: 6,
                  }}
                >
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 22,
                }}
              >
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: 13,
                    color: 'var(--text-dim)',
                    textDecoration: 'none',
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loginMutation.isPending}
                style={{ width: '100%' }}
              >
                Sign in
              </Button>
            </form>

            <p
              style={{
                marginTop: 22,
                textAlign: 'center',
                fontSize: 13.5,
                color: 'var(--text-dim)',
              }}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Change-password step (mustChangePassword flow) ----
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-0)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--bg-1)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-lg)',
          padding: 32,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--r)',
            display: 'grid',
            placeItems: 'center',
            background: 'color-mix(in oklab, var(--accent) 18%, transparent)',
            color: 'var(--accent)',
            marginBottom: 20,
          }}
        >
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2ZM7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Set a new password</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24 }}>
          Your account requires a password change before continuing.
        </p>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              background:
                'color-mix(in oklab, var(--danger) 12%, transparent)',
              border:
                '1px solid color-mix(in oklab, var(--danger) 30%, transparent)',
              borderRadius: 'var(--r-sm)',
              fontSize: 13.5,
              color: 'var(--danger)',
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            if (newPassword.length < 8) {
              setError('Password must be at least 8 characters.');
              return;
            }
            if (newPassword !== confirmPassword) {
              setError('Passwords do not match.');
              return;
            }
            changePasswordMutation.mutate();
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-dim)',
                marginBottom: 6,
              }}
            >
              New password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-dim)',
                marginBottom: 6,
              }}
            >
              Confirm new password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={changePasswordMutation.isPending}
            style={{ width: '100%' }}
          >
            Set password & continue
          </Button>
        </form>
      </div>
    </div>
  );
}
```

### Step 1.2 — Create `src/pages/RegisterPage.tsx`

- [ ] Create the file with the content below exactly:

```tsx
// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { register as apiRegister, login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: () => apiRegister({ displayName, email, password }),
    onSuccess: async () => {
      // Register succeeded (returns User, no token). Auto-login with same credentials.
      try {
        const loginData = await apiLogin({ email, password });
        auth.login(loginData.token);
        toast('Account created! Welcome to MySCORE.', 'success');
        navigate('/');
      } catch {
        // Login after register failed — send to login page
        navigate('/login');
      }
    },
    onError: (err: any) => {
      const status = err?.response?.status ?? err?.status;
      if (status === 409) {
        setError('An account with this email already exists.');
      } else {
        setError('Registration failed. Please try again.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-0)',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--r)',
              display: 'grid',
              placeItems: 'center',
              background: 'color-mix(in oklab, var(--accent) 18%, transparent)',
              color: 'var(--accent)',
              margin: '0 auto 16px',
            }}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 4H4v2a3 3 0 0 0 3 3m10-5h3v2a3 3 0 0 1-3 3" />
            </svg>
          </div>
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Create your account</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
            Join the MySCORE WC2026 prediction league.
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              background: 'color-mix(in oklab, var(--danger) 12%, transparent)',
              border:
                '1px solid color-mix(in oklab, var(--danger) 30%, transparent)',
              borderRadius: 'var(--r-sm)',
              fontSize: 13.5,
              color: 'var(--danger)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-dim)',
                marginBottom: 6,
              }}
            >
              Display name
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Rivera"
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-dim)',
                marginBottom: 6,
              }}
            >
              Work email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-dim)',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-dim)',
                marginBottom: 6,
              }}
            >
              Confirm password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={registerMutation.isPending}
            style={{ width: '100%' }}
          >
            Create account
          </Button>
        </form>

        <p
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: 13.5,
            color: 'var(--text-dim)',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Step 1.3 — Create `src/pages/ForgotPasswordPage.tsx`

- [ ] Create the file with the content below exactly:

```tsx
// src/pages/ForgotPasswordPage.tsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { generatePassword as apiGeneratePassword } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: () => apiGeneratePassword({ email }),
    onSuccess: (data) => {
      setGeneratedPassword(data.password);
    },
  });

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-0)',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Forgot your password?</h2>
        <p
          style={{
            color: 'var(--text-dim)',
            fontSize: 14,
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          Enter your email address and we'll generate a new temporary password
          for you.
        </p>

        {!generatedPassword ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--text-dim)',
                  marginBottom: 6,
                }}
              >
                Work email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            {mutation.isError && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  background:
                    'color-mix(in oklab, var(--danger) 12%, transparent)',
                  border:
                    '1px solid color-mix(in oklab, var(--danger) 30%, transparent)',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 13.5,
                  color: 'var(--danger)',
                }}
              >
                No account found for that email address.
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={mutation.isPending}
              style={{ width: '100%' }}
            >
              Generate new password
            </Button>
          </form>
        ) : (
          <div>
            {/* Warning box */}
            <div
              style={{
                padding: '14px 16px',
                background:
                  'color-mix(in oklab, var(--warn) 12%, transparent)',
                border:
                  '1px solid color-mix(in oklab, var(--warn) 30%, transparent)',
                borderRadius: 'var(--r-sm)',
                fontSize: 13.5,
                color: 'var(--warn)',
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              <strong>This password is shown once — copy it now.</strong>
              <br />
              You will be prompted to change it on first sign in.
            </div>

            {/* Generated password display */}
            <div
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <input
                ref={passwordRef}
                readOnly
                value={generatedPassword}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 15,
                  color: 'var(--text)',
                  letterSpacing: '0.05em',
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  flexShrink: 0,
                  background: copied
                    ? 'color-mix(in oklab, var(--live) 18%, transparent)'
                    : 'var(--bg-3)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-xs)',
                  padding: '6px 12px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: copied ? 'var(--live)' : 'var(--text-dim)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <p
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: 13.5,
            color: 'var(--text-dim)',
          }}
        >
          <Link
            to="/login"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}
          >
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Step 1.4 — Register routes in router

- [ ] Open `src/router.tsx` (or `src/App.tsx` — wherever React Router routes are defined in Part 2).
- [ ] Add the following imports at the top:
  ```tsx
  import { LoginPage } from './pages/LoginPage';
  import { RegisterPage } from './pages/RegisterPage';
  import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
  ```
- [ ] Add routes **outside** the `<AppShell>` layout (auth pages are standalone):
  ```tsx
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  ```
- [ ] Ensure the root `/` redirect goes to `/login` when `!isAuthenticated`.

### Step 1.5 — Commit

- [ ] Run:
  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/pages/LoginPage.tsx src/pages/RegisterPage.tsx src/pages/ForgotPasswordPage.tsx src/router.tsx
  git commit -m "feat: add auth pages — login (with mustChangePassword flow), register, forgot-password"
  ```

---

## Task 2 — DashboardPage

### Step 2.1 — Create `src/pages/DashboardPage.tsx`

- [ ] Create the file with the content below exactly:

```tsx
// src/pages/DashboardPage.tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useMatches } from '../hooks/useMatches';
import { usePredictions } from '../hooks/usePredictions';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { getActiveTournament } from '../api/tournaments';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { PtsTag } from '../components/ui/PtsTag';
import { Skel } from '../components/ui/Skeleton';
import { LiveMatchHero } from '../components/match/LiveMatchHero';
import { MiniMatch } from '../components/match/MiniMatch';
import type { Match, Prediction, LeaderboardEntry } from '../types';

// ---- Stat tile ----
function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r)',
        padding: '20px 22px',
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: 'var(--text-dim)',
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: accent ? 'var(--accent)' : 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          marginBottom: sub ? 6 : 0,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-mute)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ---- Leaderboard snapshot row ----
function SnapshotRow({
  entry,
  rank,
  isMe,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '8px 14px',
        borderRadius: 8,
        background: isMe
          ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
          : 'transparent',
      }}
    >
      {rank <= 3 ? (
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: 13,
            background:
              rank === 1
                ? '#ffd23f'
                : rank === 2
                ? '#c0c8d4'
                : '#c8956b',
            color:
              rank === 1
                ? '#15120a'
                : rank === 2
                ? '#0d1622'
                : '#15120a',
            flexShrink: 0,
          }}
        >
          {rank}
        </span>
      ) : (
        <span
          style={{
            width: 26,
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--text-mute)',
            flexShrink: 0,
          }}
        >
          {rank}
        </span>
      )}
      <Avatar user={{ displayName: entry.displayName, id: entry.userId }} size={28} />
      <span style={{ fontWeight: 700, fontSize: 13.5, flex: 1 }}>
        {isMe ? 'You' : entry.displayName}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        {entry.totalPts}
      </span>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();

  // 1. Active tournament
  const { data: tournament } = useQuery({
    queryKey: ['tournaments', 'active'],
    queryFn: getActiveTournament,
  });

  const tournamentId = tournament?.id;

  // 2. Matches, predictions, leaderboard
  const { data: matches = [], isLoading: loadingMatches } = useMatches(tournamentId!);
  const { data: predictions = [], isLoading: loadingPredictions } = usePredictions();
  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useLeaderboard(tournamentId!);

  const isLoading = !tournamentId || loadingMatches || loadingPredictions || loadingLeaderboard;

  // Derived data
  const predictionsByMatchId = Object.fromEntries(
    (predictions as Prediction[]).map((p) => [p.matchId, p])
  );

  const myEntry = (leaderboard as LeaderboardEntry[]).find(
    (e) => e.userId === user?.sub
  );
  const myRank =
    (leaderboard as LeaderboardEntry[]).findIndex(
      (e) => e.userId === user?.sub
    ) + 1;

  const now = Date.now();
  const SIX_HOURS = 6 * 60 * 60 * 1000;

  const liveMatches = (matches as Match[]).filter((m) => m.status === 'live');

  const closingSoon = (matches as Match[])
    .filter(
      (m) =>
        m.status === 'scheduled' &&
        new Date(m.kickoffAt).getTime() - now < SIX_HOURS &&
        new Date(m.kickoffAt).getTime() > now
    )
    .sort(
      (a, b) =>
        new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
    )
    .slice(0, 5);

  const recentResults = (matches as Match[])
    .filter((m) => m.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime()
    )
    .slice(0, 5);

  const leaderboardTop6 = (leaderboard as LeaderboardEntry[]).slice(0, 6);

  if (isLoading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Skel style={{ height: 36, width: 240, marginBottom: 24 }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Skel key={i} style={{ height: 100, borderRadius: 'var(--r)' }} />
          ))}
        </div>
        <Skel style={{ height: 200, borderRadius: 'var(--r)', marginBottom: 16 }} />
        <Skel style={{ height: 160, borderRadius: 'var(--r)' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 22,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-mute)',
              fontWeight: 600,
              marginBottom: 7,
            }}
          >
            {tournament?.name}
          </div>
          <h1 style={{ fontSize: 30, margin: 0 }}>
            Welcome back,{' '}
            {user?.displayName?.split(' ')[0] ?? 'there'}
          </h1>
        </div>
        <Link
          to="/matches"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            borderRadius: 'var(--r-sm)',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Make predictions
        </Link>
      </div>

      {/* Stat tiles — 4-col */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 20,
        }}
        className="grid-stats"
      >
        <StatTile
          label="Your rank"
          value={myRank > 0 ? `#${myRank}` : '—'}
          sub={`of ${leaderboard.length} players`}
          accent
        />
        <StatTile
          label="Total points"
          value={myEntry?.totalPts ?? 0}
          sub="this tournament"
        />
        <StatTile
          label="Exact scores"
          value={myEntry?.fullCount ?? 0}
          sub="+5 pts each"
        />
        <StatTile
          label="Predictions made"
          value={myEntry?.playedCount ?? 0}
          sub={`of ${matches.length} matches`}
        />
      </div>

      {/* Live match hero */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {liveMatches.slice(0, 1).map((m) => (
            <LiveMatchHero
              key={m.id}
              match={m}
              prediction={predictionsByMatchId[m.id]}
            />
          ))}
        </div>
      )}

      {/* Two-column section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: 16,
          alignItems: 'start',
        }}
        className="dash-cols"
      >
        {/* Left: Closing soon + Recent results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card
            title="Predictions closing soon"
            linkLabel="All matches"
            linkTo="/matches"
            noPadding
          >
            <div style={{ padding: 6 }}>
              {closingSoon.length > 0 ? (
                closingSoon.map((m) => (
                  <MiniMatch
                    key={m.id}
                    match={m}
                    prediction={predictionsByMatchId[m.id]}
                  />
                ))
              ) : (
                <div
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--text-mute)',
                    fontSize: 13,
                  }}
                >
                  No predictions closing soon.
                </div>
              )}
            </div>
          </Card>

          <Card
            title="Recent results"
            linkLabel="My predictions"
            linkTo="/predictions"
            noPadding
          >
            <div style={{ padding: 6 }}>
              {recentResults.length > 0 ? (
                recentResults.map((m) => (
                  <MiniMatch
                    key={m.id}
                    match={m}
                    prediction={predictionsByMatchId[m.id]}
                    showPts
                  />
                ))
              ) : (
                <div
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--text-mute)',
                    fontSize: 13,
                  }}
                >
                  No completed matches yet.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Leaderboard snapshot */}
        <Card
          title="Leaderboard"
          linkLabel="Full board"
          linkTo="/leaderboard"
          noPadding
        >
          <div style={{ padding: '6px 6px 10px' }}>
            {leaderboardTop6.map((entry, i) => (
              <SnapshotRow
                key={entry.userId}
                entry={entry}
                rank={i + 1}
                isMe={entry.userId === user?.sub}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
```

### Step 2.2 — Register route

- [ ] In the router, inside the `<AppShell>` layout, add:
  ```tsx
  import { DashboardPage } from './pages/DashboardPage';
  // ...
  <Route index element={<DashboardPage />} />
  // or:
  <Route path="/" element={<DashboardPage />} />
  ```

### Step 2.3 — Commit

- [ ] Run:
  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/pages/DashboardPage.tsx src/router.tsx
  git commit -m "feat: add DashboardPage with stat tiles, live hero, closing-soon, recent results, leaderboard snapshot"
  ```

---

## Task 3 — MatchesPage

### Step 3.1 — Create `src/pages/MatchesPage.tsx`

- [ ] Create the file with the content below exactly:

```tsx
// src/pages/MatchesPage.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMatches } from '../hooks/useMatches';
import { usePredictions } from '../hooks/usePredictions';
import { getActiveTournament } from '../api/tournaments';
import { MatchCard } from '../components/match/MatchCard';
import { Skel } from '../components/ui/Skeleton';
import type { Match, Prediction } from '../types';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'predict', label: 'To Predict' },
  { key: 'live', label: 'Live' },
  { key: 'done', label: 'Results' },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]['key'];

const WC2026_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'] as const;

function groupMatchesByDate(matches: Match[]): Record<string, Match[]> {
  const groups: Record<string, Match[]> = {};
  for (const m of matches) {
    const day = new Date(m.kickoffAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[day]) groups[day] = [];
    groups[day].push(m);
  }
  return groups;
}

export function MatchesPage() {
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [group, setGroup] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Active tournament
  const { data: tournament } = useQuery({
    queryKey: ['tournaments', 'active'],
    queryFn: getActiveTournament,
  });
  const tournamentId = tournament?.id;

  const { data: matches = [], isLoading: loadingMatches } = useMatches(tournamentId!);
  const { data: predictions = [], isLoading: loadingPredictions } = usePredictions();

  const predictionsByMatchId = useMemo(
    () =>
      Object.fromEntries(
        (predictions as Prediction[]).map((p) => [p.matchId, p])
      ),
    [predictions]
  );

  const isLoading = !tournamentId || loadingMatches || loadingPredictions;

  // Count badges for tabs
  const counts = useMemo(() => {
    const all = matches as Match[];
    return {
      all: all.length,
      predict: all.filter(
        (m) => m.status === 'scheduled' && !predictionsByMatchId[m.id]
      ).length,
      live: all.filter((m) => m.status === 'live').length,
      done: all.filter((m) => m.status === 'completed').length,
    };
  }, [matches, predictionsByMatchId]);

  // Filter
  const filtered = useMemo(() => {
    let result = (matches as Match[]).filter((m) => {
      if (group !== 'all' && m.group !== group) return false;
      if (statusTab === 'predict') {
        if (m.status !== 'scheduled' || predictionsByMatchId[m.id]) return false;
      }
      if (statusTab === 'live' && m.status !== 'live') return false;
      if (statusTab === 'done' && m.status !== 'completed') return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          m.homeTeam?.name ?? '',
          m.awayTeam?.name ?? '',
          m.homeTeam?.code ?? '',
          m.awayTeam?.code ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    result = result.sort(
      (a, b) =>
        new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
    );
    return result;
  }, [matches, group, statusTab, search, predictionsByMatchId]);

  const byDate = useMemo(() => groupMatchesByDate(filtered), [filtered]);
  const dateKeys = Object.keys(byDate);

  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.12s',
    background: active
      ? 'color-mix(in oklab, var(--accent) 16%, transparent)'
      : 'var(--bg-2)',
    borderColor: active ? 'var(--accent)' : 'var(--line)',
    color: active ? 'var(--accent)' : 'var(--text-dim)',
  });

  const segBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    borderRadius: 'var(--r-xs)',
    background: active ? 'var(--bg-3)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--text-dim)',
  });

  if (isLoading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Skel style={{ height: 36, width: 180, marginBottom: 20 }} />
        <Skel style={{ height: 44, borderRadius: 'var(--r-sm)', marginBottom: 14 }} />
        {[0, 1, 2].map((i) => (
          <Skel
            key={i}
            style={{ height: 120, borderRadius: 'var(--r)', marginBottom: 14 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-mute)',
            fontWeight: 600,
            marginBottom: 7,
          }}
        >
          FIFA World Cup 2026
        </div>
        <h1 style={{ fontSize: 30, margin: 0 }}>Matches</h1>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        {/* Status seg control */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-2)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-sm)',
            padding: 3,
            gap: 2,
          }}
        >
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              style={segBtnStyle(statusTab === key)}
              onClick={() => setStatusTab(key)}
            >
              {label}
              {counts[key] !== undefined && (
                <span
                  style={{
                    marginLeft: 5,
                    opacity: 0.5,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Group chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            style={chipStyle(group === 'all')}
            onClick={() => setGroup('all')}
          >
            All groups
          </button>
          {WC2026_GROUPS.map((g) => (
            <button
              key={g}
              style={chipStyle(group === g)}
              onClick={() => setGroup(g)}
            >
              Group {g}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-mute)',
              pointerEvents: 'none',
            }}
          >
            <path d="M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams…"
            style={{
              width: 200,
              paddingLeft: 34,
              padding: '8px 12px 8px 34px',
              background: 'var(--bg-2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-sm)',
              fontSize: 13.5,
              color: 'var(--text)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Match list grouped by date */}
      {dateKeys.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r)',
            padding: 50,
            textAlign: 'center',
            color: 'var(--text-mute)',
            fontSize: 13,
          }}
        >
          No matches match your filters.
        </div>
      ) : (
        dateKeys.map((day) => {
          const dayMatches = byDate[day];
          return (
            <div key={day} style={{ marginBottom: 28 }}>
              {/* Day header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {day}
                </span>
                <span
                  style={{
                    flex: 1,
                    height: 1,
                    background: 'var(--line)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-mute)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {dayMatches.length}{' '}
                  {dayMatches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              {/* Match cards */}
              <div style={{ display: 'grid', gap: 14 }}>
                {dayMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    prediction={predictionsByMatchId[m.id]}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
```

### Step 3.2 — Register route

- [ ] In the router, inside `<AppShell>`, add:
  ```tsx
  import { MatchesPage } from './pages/MatchesPage';
  // ...
  <Route path="/matches" element={<MatchesPage />} />
  ```

### Step 3.3 — Commit

- [ ] Run:
  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/pages/MatchesPage.tsx src/router.tsx
  git commit -m "feat: add MatchesPage with filter chips, group tabs, search, and date-grouped match cards"
  ```

---

## Task 4 — PredictionsPage

### Step 4.1 — Create `src/pages/PredictionsPage.tsx`

- [ ] Create the file with the content below exactly:

```tsx
// src/pages/PredictionsPage.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../hooks/usePredictions';
import { useMatches } from '../hooks/useMatches';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { getActiveTournament } from '../api/tournaments';
import { Flag } from '../components/ui/Flag';
import { PtsTag } from '../components/ui/PtsTag';
import { StatusPill } from '../components/ui/StatusPill';
import { Skel } from '../components/ui/Skeleton';
import type { Match, Prediction, LeaderboardEntry } from '../types';

type FilterTab = 'all' | 'correct' | 'full' | 'wrong';

const FILTER_TABS: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'correct', label: 'Correct result' },
  { key: 'full', label: 'Full score' },
  { key: 'wrong', label: 'Wrong' },
];

function SummaryTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-2)',
        borderRadius: 'var(--r-sm)',
        padding: '16px 18px',
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: accent ? 'var(--accent)' : 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          marginBottom: sub ? 4 : 0,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function PredictionsPage() {
  const { user } = useAuth();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const { data: tournament } = useQuery({
    queryKey: ['tournaments', 'active'],
    queryFn: getActiveTournament,
  });
  const tournamentId = tournament?.id;

  const { data: predictions = [], isLoading: loadingPredictions } = usePredictions();
  const { data: matches = [], isLoading: loadingMatches } = useMatches(tournamentId!);
  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useLeaderboard(tournamentId!);

  const isLoading =
    !tournamentId || loadingPredictions || loadingMatches || loadingLeaderboard;

  const matchById = useMemo(
    () =>
      Object.fromEntries((matches as Match[]).map((m) => [m.id, m])),
    [matches]
  );

  const myEntry = useMemo(
    () =>
      (leaderboard as LeaderboardEntry[]).find(
        (e) => e.userId === user?.sub
      ),
    [leaderboard, user]
  );
  const myRank = useMemo(
    () =>
      (leaderboard as LeaderboardEntry[]).findIndex(
        (e) => e.userId === user?.sub
      ) + 1,
    [leaderboard, user]
  );

  // Build enriched rows sorted by kickoffAt desc
  const rows = useMemo(() => {
    return (predictions as Prediction[])
      .map((pred) => {
        const match = matchById[pred.matchId];
        return { pred, match };
      })
      .filter((r) => !!r.match)
      .sort(
        (a, b) =>
          new Date(b.match.kickoffAt).getTime() -
          new Date(a.match.kickoffAt).getTime()
      );
  }, [predictions, matchById]);

  // Filter rows by tab
  const filtered = useMemo(() => {
    if (filterTab === 'all') return rows;
    return rows.filter(({ pred }) => {
      if (pred.points == null) return false;
      if (filterTab === 'full') return pred.points >= 5;
      if (filterTab === 'correct') return pred.points === 3;
      if (filterTab === 'wrong') return pred.points === 0;
      return true;
    });
  }, [rows, filterTab]);

  const completedRows = filtered.filter((r) => r.match.status === 'completed');
  const upcomingRows = filtered.filter((r) => r.match.status !== 'completed');

  const segBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    borderRadius: 'var(--r-xs)',
    background: active ? 'var(--bg-3)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--text-dim)',
  });

  if (isLoading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Skel style={{ height: 36, width: 240, marginBottom: 20 }} />
        <Skel style={{ height: 100, borderRadius: 'var(--r)', marginBottom: 16 }} />
        <Skel style={{ height: 300, borderRadius: 'var(--r)' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-mute)',
            fontWeight: 600,
            marginBottom: 7,
          }}
        >
          Your tournament card
        </div>
        <h1 style={{ fontSize: 30, margin: 0 }}>My Predictions</h1>
      </div>

      {/* Tournament summary card */}
      <div
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r)',
          padding: '20px 22px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
          }}
          className="grid-stats"
        >
          <SummaryTile
            label="Rank"
            value={myRank > 0 ? `#${myRank}` : '—'}
            sub={`of ${leaderboard.length}`}
            accent
          />
          <SummaryTile
            label="Total points"
            value={myEntry?.totalPts ?? 0}
            sub="pts earned"
          />
          <SummaryTile
            label="Full scores"
            value={myEntry?.fullCount ?? 0}
            sub="+5 pts each"
          />
          <SummaryTile
            label="Toto"
            value={myEntry?.totoCount ?? 0}
            sub="correct result"
          />
          <SummaryTile
            label="Played"
            value={myEntry?.playedCount ?? 0}
            sub="predictions"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-2)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-sm)',
          padding: 3,
          gap: 2,
          marginBottom: 18,
          width: 'fit-content',
        }}
      >
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            style={segBtnStyle(filterTab === key)}
            onClick={() => setFilterTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Predictions table */}
      <div
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r)',
          overflow: 'hidden',
        }}
      >
        {/* Completed section */}
        {completedRows.length > 0 && (
          <>
            <div
              style={{
                padding: '10px 18px 8px',
                borderBottom: '1px solid var(--line)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-mute)',
                fontWeight: 600,
              }}
            >
              Completed
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: 'var(--bg-2)',
                  }}
                >
                  <th
                    style={{
                      padding: '10px 18px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-mute)',
                    }}
                  >
                    Match
                  </th>
                  <th
                    style={{
                      padding: '10px 14px',
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-mute)',
                    }}
                  >
                    Your pick
                  </th>
                  <th
                    style={{
                      padding: '10px 14px',
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-mute)',
                    }}
                  >
                    Result
                  </th>
                  <th
                    style={{
                      padding: '10px 18px',
                      textAlign: 'right',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-mute)',
                    }}
                  >
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {completedRows.map(({ pred, match }) => (
                  <PredictionRow
                    key={pred.id}
                    prediction={pred}
                    match={match}
                  />
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Upcoming section */}
        {upcomingRows.length > 0 && (
          <>
            <div
              style={{
                padding: '10px 18px 8px',
                borderTop: completedRows.length > 0 ? '1px solid var(--line)' : 'none',
                borderBottom: '1px solid var(--line)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-mute)',
                fontWeight: 600,
              }}
            >
              Upcoming
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: 'var(--bg-2)',
                  }}
                >
                  <th
                    style={{
                      padding: '10px 18px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-mute)',
                    }}
                  >
                    Match
                  </th>
                  <th
                    style={{
                      padding: '10px 14px',
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-mute)',
                    }}
                  >
                    Your pick
                  </th>
                  <th
                    style={{
                      padding: '10px 14px',
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-mute)',
                    }}
                  >
                    Result
                  </th>
                  <th
                    style={{
                      padding: '10px 18px',
                      textAlign: 'right',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-mute)',
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingRows.map(({ pred, match }) => (
                  <PredictionRow
                    key={pred.id}
                    prediction={pred}
                    match={match}
                  />
                ))}
              </tbody>
            </table>
          </>
        )}

        {filtered.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-mute)',
              fontSize: 13,
            }}
          >
            No predictions here yet.
          </div>
        )}
      </div>
    </div>
  );
}

function PredictionRow({
  prediction,
  match,
}: {
  prediction: Prediction;
  match: Match;
}) {
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live';

  const dateLabel = new Date(match.kickoffAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--line)',
      }}
    >
      {/* Match info */}
      <td style={{ padding: '12px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Flag iso={match.homeTeam?.flagIso ?? ''} size={20} />
            <span
              style={{ fontWeight: 700, fontSize: 13.5 }}
              className="hide-mobile"
            >
              {match.homeTeam?.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 12,
                color: 'var(--text-dim)',
              }}
            >
              {match.homeTeam?.code}
            </span>
          </div>
          <span style={{ color: 'var(--text-mute)', fontSize: 12 }}>v</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 12,
                color: 'var(--text-dim)',
              }}
            >
              {match.awayTeam?.code}
            </span>
            <span
              style={{ fontWeight: 700, fontSize: 13.5 }}
              className="hide-mobile"
            >
              {match.awayTeam?.name}
            </span>
            <Flag iso={match.awayTeam?.flagIso ?? ''} size={20} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              color: 'var(--text-mute)',
              marginLeft: 6,
            }}
            className="hide-mobile"
          >
            · {match.stage} · {dateLabel}
          </span>
        </div>
      </td>

      {/* My pick */}
      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          {prediction.homeScore}–{prediction.awayScore}
        </span>
      </td>

      {/* Result */}
      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
        {isCompleted ? (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            {match.homeScore}–{match.awayScore}
          </span>
        ) : isLive ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: 20,
              background: 'color-mix(in oklab, var(--live) 14%, transparent)',
              color: 'var(--live)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--live)',
                flexShrink: 0,
              }}
            />
            {match.homeScore}–{match.awayScore} {match.minute}'
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-mute)',
            }}
          >
            —
          </span>
        )}
      </td>

      {/* Points / status */}
      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
        {isCompleted ? (
          <PtsTag pts={prediction.points ?? 0} />
        ) : (
          <StatusPill status={match.status} />
        )}
      </td>
    </tr>
  );
}
```

### Step 4.2 — Register route

- [ ] In the router, inside `<AppShell>`, add:
  ```tsx
  import { PredictionsPage } from './pages/PredictionsPage';
  // ...
  <Route path="/predictions" element={<PredictionsPage />} />
  ```

### Step 4.3 — Commit

- [ ] Run:
  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/pages/PredictionsPage.tsx src/router.tsx
  git commit -m "feat: add PredictionsPage with tournament summary card, filter tabs, completed/upcoming sections"
  ```

---

## Task 5 — LeaderboardPage

### Step 5.1 — Create `src/pages/LeaderboardPage.tsx`

- [ ] Create the file with the content below exactly:

```tsx
// src/pages/LeaderboardPage.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { getActiveTournament } from '../api/tournaments';
import { Avatar } from '../components/ui/Avatar';
import { Skel } from '../components/ui/Skeleton';
import { StandingsTable } from '../components/leaderboard/StandingsTable';
import { PodiumRow } from '../components/leaderboard/PodiumRow';
import type { LeaderboardEntry } from '../types';

// Podium order: indices into top-3 array → [1st=index0, 2nd=index1, 3rd=index2]
// Rendered order: 2nd (left), 1st (center), 3rd (right)
const PODIUM_ORDER = [1, 0, 2] as const;
const PODIUM_HEIGHTS: Record<number, number> = { 0: 116, 1: 88, 2: 70 };

function Podium({
  top3,
  currentUserId,
}: {
  top3: LeaderboardEntry[];
  currentUserId?: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 14,
        alignItems: 'end',
        marginBottom: 8,
      }}
      className="hide-mobile"
    >
      {PODIUM_ORDER.map((idx) => {
        const entry = top3[idx];
        if (!entry) return <div key={idx} />;
        const isMe = entry.userId === currentUserId;
        const rank = idx + 1;
        return (
          <div
            key={entry.userId}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <Avatar
              user={{ displayName: entry.displayName, id: entry.userId }}
              size={idx === 0 ? 58 : 48}
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>
                {isMe ? 'You' : entry.displayName}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-dim)',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.fullCount} exact · {entry.totoCount} correct
              </div>
            </div>
            <div
              style={{
                width: '100%',
                height: PODIUM_HEIGHTS[idx],
                borderRadius: '12px 12px 0 0',
                background:
                  idx === 0
                    ? 'linear-gradient(180deg, color-mix(in oklab, var(--accent) 35%, var(--bg-2)), var(--bg-2))'
                    : 'var(--bg-2)',
                border: '1px solid var(--line)',
                borderBottom: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                position: 'relative',
              }}
            >
              {/* Rank medal badge */}
              <span
                style={{
                  position: 'absolute',
                  top: -13,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                  background:
                    rank === 1
                      ? '#ffd23f'
                      : rank === 2
                      ? '#c0c8d4'
                      : '#c8956b',
                  color:
                    rank === 1
                      ? '#15120a'
                      : rank === 2
                      ? '#0d1622'
                      : '#15120a',
                }}
              >
                {rank}
              </span>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: idx === 0 ? 'var(--accent)' : 'var(--text)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {entry.totalPts}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-mute)',
                  letterSpacing: '0.1em',
                }}
              >
                POINTS
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type SortKey = 'pts' | 'exact' | 'correct';

export function LeaderboardPage() {
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>('pts');

  const { data: tournament } = useQuery({
    queryKey: ['tournaments', 'active'],
    queryFn: getActiveTournament,
  });
  const tournamentId = tournament?.id;

  const { data: leaderboard = [], isLoading } = useLeaderboard(tournamentId!);

  // Sort for display
  const sorted = useMemo(() => {
    const entries = [...(leaderboard as LeaderboardEntry[])];
    if (sortKey === 'exact') {
      entries.sort(
        (a, b) => b.fullCount - a.fullCount || b.totalPts - a.totalPts
      );
    } else if (sortKey === 'correct') {
      entries.sort(
        (a, b) => b.totoCount - a.totoCount || b.totalPts - a.totalPts
      );
    } else {
      entries.sort(
        (a, b) => b.totalPts - a.totalPts || b.fullCount - a.fullCount || b.totoCount - a.totoCount
      );
    }
    return entries;
  }, [leaderboard, sortKey]);

  // Top 3 by points (always by pts for podium)
  const top3ByPts = useMemo(
    () =>
      [...(leaderboard as LeaderboardEntry[])]
        .sort((a, b) => b.totalPts - a.totalPts)
        .slice(0, 3),
    [leaderboard]
  );

  const segBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    borderRadius: 'var(--r-xs)',
    background: active ? 'var(--bg-3)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--text-dim)',
  });

  if (!tournamentId || isLoading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Skel style={{ height: 36, width: 200, marginBottom: 20 }} />
        <Skel
          style={{
            height: 220,
            borderRadius: 'var(--r)',
            marginBottom: 16,
          }}
        />
        <Skel style={{ height: 400, borderRadius: 'var(--r)' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-mute)',
              fontWeight: 600,
              marginBottom: 7,
            }}
          >
            Office standings · live
          </div>
          <h1 style={{ fontSize: 30, margin: 0 }}>Leaderboard</h1>
        </div>

        {/* Sort control */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-2)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-sm)',
            padding: 3,
            gap: 2,
          }}
        >
          {(
            [
              ['pts', 'Points'],
              ['exact', 'Exact'],
              ['correct', 'Correct'],
            ] as Array<[SortKey, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              style={segBtnStyle(sortKey === key)}
              onClick={() => setSortKey(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Podium card */}
      <div
        style={{
          background: 'var(--field-grad)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r)',
          padding: '22px 22px 0',
          marginBottom: 16,
        }}
      >
        <Podium top3={top3ByPts} currentUserId={user?.sub} />
      </div>

      {/* Full standings table */}
      <StandingsTable entries={sorted} currentUserId={user?.sub} />

      {/* Tiebreaker note */}
      <p
        style={{
          marginTop: 16,
          fontSize: 12.5,
          color: 'var(--text-mute)',
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        Players tied on points are ranked by full scores (exact), then toto
        scores (correct result).
      </p>
    </div>
  );
}
```

### Step 5.2 — Register route

- [ ] In the router, inside `<AppShell>`, add:
  ```tsx
  import { LeaderboardPage } from './pages/LeaderboardPage';
  // ...
  <Route path="/leaderboard" element={<LeaderboardPage />} />
  ```

### Step 5.3 — Commit

- [ ] Run:
  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/pages/LeaderboardPage.tsx src/router.tsx
  git commit -m "feat: add LeaderboardPage with podium, sortable StandingsTable, tiebreaker note"
  ```

---

## Task 6 — StatsPage

### Step 6.1 — Create `src/pages/StatsPage.tsx`

- [ ] Create the file with the content below exactly:

```tsx
// src/pages/StatsPage.tsx
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStats } from '../hooks/useStats';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { getActiveTournament } from '../api/tournaments';
import { Avatar } from '../components/ui/Avatar';
import { Flag } from '../components/ui/Flag';
import { Skel } from '../components/ui/Skeleton';
import type { LeaderboardEntry } from '../types';

// ---- SVG bar chart ----
function BarChart({
  data,
}: {
  data: Array<{ stage: string; avgPts: number }>;
}) {
  const max = Math.max(...data.map((d) => d.avgPts), 1);
  return (
    <svg
      viewBox="0 0 300 120"
      style={{ width: '100%', display: 'block', overflow: 'visible' }}
      aria-label="Points by stage"
    >
      {data.map((d, i) => {
        const barH = (d.avgPts / max) * 80;
        const colW = 300 / data.length;
        const x = i * colW;
        const w = colW - 4;
        return (
          <g key={d.stage}>
            <rect
              x={x + 2}
              y={100 - barH}
              width={w}
              height={barH}
              fill="var(--accent)"
              rx="3"
              opacity={0.9}
            />
            <text
              x={x + w / 2 + 2}
              y={115}
              textAnchor="middle"
              fontSize="8"
              fill="var(--text-mute)"
              fontFamily="var(--font-mono)"
            >
              {d.stage}
            </text>
            <text
              x={x + w / 2 + 2}
              y={100 - barH - 4}
              textAnchor="middle"
              fontSize="8"
              fill="var(--text-dim)"
              fontFamily="var(--font-mono)"
              fontWeight="700"
            >
              {Math.round(d.avgPts)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- Consensus bar ----
function ConsensusBar({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12.5,
          marginBottom: 5,
        }}
      >
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color,
          }}
        >
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 9,
          borderRadius: 5,
          background: 'var(--bg-3)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 5,
            transition: 'width 0.5s',
          }}
        />
      </div>
    </div>
  );
}

// ---- Award card ----
function AwardCard({
  tag,
  color,
  icon,
  user,
  value,
  sub,
}: {
  tag: string;
  color: string;
  icon: React.ReactNode;
  user?: { displayName: string; id: string } | null;
  value: string | number;
  sub: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r)',
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative radial glow */}
      <div
        style={{
          position: 'absolute',
          right: -18,
          top: -18,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: `radial-gradient(circle, color-mix(in oklab, ${color} 22%, transparent), transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      {/* Tag row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          position: 'relative',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            display: 'grid',
            placeItems: 'center',
            background: `color-mix(in oklab, ${color} 18%, transparent)`,
            color,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color,
            fontWeight: 600,
          }}
        >
          {tag}
        </span>
      </div>
      {/* Content */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}
      >
        {user && (
          <Avatar user={user} size={42} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>
            {user ? user.displayName : value}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            {sub}
          </div>
        </div>
        {user && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: 28,
              color,
              marginLeft: 'auto',
            }}
          >
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Rank mini-list ----
function RankList({
  rows,
  metricKey,
  suffix,
}: {
  rows: LeaderboardEntry[];
  metricKey: 'fullCount' | 'playedCount';
  suffix: string;
}) {
  const max = Math.max(...rows.map((r) => r[metricKey]), 1);
  return (
    <div style={{ padding: '8px 10px 12px' }}>
      {rows.map((entry, i) => (
        <div
          key={entry.userId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '8px 8px',
          }}
        >
          <span
            style={{
              width: 18,
              color: 'var(--text-mute)',
              fontWeight: 700,
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {i + 1}
          </span>
          <Avatar user={{ displayName: entry.displayName, id: entry.userId }} size={28} />
          <span
            style={{
              fontWeight: 700,
              fontSize: 13.5,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.displayName}
          </span>
          <div
            style={{
              flex: 1,
              height: 7,
              background: 'var(--bg-3)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(entry[metricKey] / max) * 100}%`,
                height: '100%',
                background: 'var(--text-mute)',
                borderRadius: 4,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: 13.5,
              width: 80,
              textAlign: 'right',
            }}
          >
            {entry[metricKey]} {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- Icons (inline SVG to avoid import dependencies) ----
const TargetIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
);
const CheckIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const BoltIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" />
  </svg>
);
const FlameIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 11 11 11c0-2-1-4 1-9Z" />
  </svg>
);
const StatsIcon = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18M7 14l3-4 3 3 5-7" />
  </svg>
);
const WhistleIcon = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a6 6 0 1 0 12 0 6 6 0 0 0-12 0Zm12-3 6-3v4l-6 1" />
  </svg>
);

// ---- Card wrapper ----
function SectionCard({
  title,
  icon,
  children,
  noPadding,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 18px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <span style={{ color: 'var(--accent)', display: 'flex' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
      </div>
      <div style={noPadding ? {} : { padding: '16px 18px' }}>{children}</div>
    </div>
  );
}

export function StatsPage() {
  const { data: tournament } = useQuery({
    queryKey: ['tournaments', 'active'],
    queryFn: getActiveTournament,
  });
  const tournamentId = tournament?.id;

  const { data: stats, isLoading: loadingStats } = useStats();
  const { data: leaderboard = [], isLoading: loadingLeaderboard } =
    useLeaderboard(tournamentId!);

  const isLoading = !tournamentId || loadingStats || loadingLeaderboard;

  // Derived award data from leaderboard
  const topScorer = useMemo(
    () =>
      [...(leaderboard as LeaderboardEntry[])].sort(
        (a, b) => b.totalPts - a.totalPts
      )[0] ?? null,
    [leaderboard]
  );

  const biggestComeback = useMemo(() => {
    // Largest positive rank delta (prev rank → current rank): entry with highest (prevRank - currentRank)
    const entries = leaderboard as LeaderboardEntry[];
    return entries.reduce<LeaderboardEntry | null>((best, entry, idx) => {
      const currentRank = idx + 1; // leaderboard already sorted by pts
      const delta =
        entry.prevRank != null ? entry.prevRank - currentRank : 0;
      if (!best) return delta > 0 ? entry : null;
      const bestIdx = entries.indexOf(best);
      const bestDelta =
        best.prevRank != null ? best.prevRank - (bestIdx + 1) : 0;
      return delta > bestDelta ? entry : best;
    }, null);
  }, [leaderboard]);

  const mostExact = useMemo(
    () =>
      [...(leaderboard as LeaderboardEntry[])].sort(
        (a, b) => b.fullCount - a.fullCount
      )[0] ?? null,
    [leaderboard]
  );

  const mostPredictions = useMemo(
    () =>
      [...(leaderboard as LeaderboardEntry[])].sort(
        (a, b) => b.playedCount - a.playedCount
      )[0] ?? null,
    [leaderboard]
  );

  // Top 5 for rank lists
  const top5Exact = useMemo(
    () =>
      [...(leaderboard as LeaderboardEntry[])]
        .sort((a, b) => b.fullCount - a.fullCount)
        .slice(0, 5),
    [leaderboard]
  );

  const top5Played = useMemo(
    () =>
      [...(leaderboard as LeaderboardEntry[])]
        .sort((a, b) => b.playedCount - a.playedCount)
        .slice(0, 5),
    [leaderboard]
  );

  // Bar chart data from stats.pointsByStage
  const barData = useMemo(() => {
    if (!stats?.pointsByStage) return [];
    return stats.pointsByStage.map((s: { stage: string; avgPts: number }) => ({
      stage: s.stage,
      avgPts: s.avgPts,
    }));
  }, [stats]);

  // Consensus: pick the first upcoming/live match that has consensus data
  const consensusMatch = useMemo(() => {
    if (!stats?.consensusByMatch) return null;
    const keys = Object.keys(stats.consensusByMatch);
    return keys.length > 0 ? stats.consensusByMatch[keys[0]] : null;
  }, [stats]);

  if (isLoading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Skel style={{ height: 36, width: 180, marginBottom: 20 }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            marginBottom: 16,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Skel key={i} style={{ height: 110, borderRadius: 'var(--r)' }} />
          ))}
        </div>
        <Skel style={{ height: 240, borderRadius: 'var(--r)' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-mute)',
            fontWeight: 600,
            marginBottom: 7,
          }}
        >
          The office, by the numbers
        </div>
        <h1 style={{ fontSize: 30, margin: 0 }}>Statistics</h1>
      </div>

      {/* Award cards 2×2 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <AwardCard
          tag="Most exact scores"
          color="var(--live)"
          icon={<TargetIcon />}
          user={
            mostExact
              ? { displayName: mostExact.displayName, id: mostExact.userId }
              : null
          }
          value={mostExact?.fullCount ?? '—'}
          sub="exact scorelines nailed"
        />
        <AwardCard
          tag="Most predictions"
          color="var(--info)"
          icon={<CheckIcon />}
          user={
            mostPredictions
              ? {
                  displayName: mostPredictions.displayName,
                  id: mostPredictions.userId,
                }
              : null
          }
          value={mostPredictions?.playedCount ?? '—'}
          sub="predictions submitted"
        />
        <AwardCard
          tag="Top scorer"
          color="var(--accent)"
          icon={<BoltIcon />}
          user={
            topScorer
              ? { displayName: topScorer.displayName, id: topScorer.userId }
              : null
          }
          value={topScorer?.totalPts ?? '—'}
          sub="total points this tournament"
        />
        <AwardCard
          tag="Biggest comeback"
          color="var(--danger)"
          icon={<FlameIcon />}
          user={
            biggestComeback
              ? {
                  displayName: biggestComeback.displayName,
                  id: biggestComeback.userId,
                }
              : null
          }
          value={
            biggestComeback?.prevRank != null
              ? `+${
                  biggestComeback.prevRank -
                  ((leaderboard as LeaderboardEntry[]).findIndex(
                    (e) => e.userId === biggestComeback.userId
                  ) +
                    1)
                }`
              : '—'
          }
          sub="spots climbed on the leaderboard"
        />
      </div>

      {/* Points by stage + Office consensus */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 16,
          marginBottom: 18,
        }}
        className="dash-cols"
      >
        <SectionCard title="Points by stage" icon={<StatsIcon />}>
          {barData.length > 0 ? (
            <>
              <BarChart data={barData} />
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-mute)',
                  textAlign: 'center',
                  marginTop: 6,
                }}
              >
                Avg office points per stage
              </div>
            </>
          ) : (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--text-mute)',
                fontSize: 13,
              }}
            >
              No stage data yet.
            </div>
          )}
        </SectionCard>

        <SectionCard title="Office consensus" icon={<WhistleIcon />}>
          {consensusMatch ? (
            <div>
              {/* Match header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                  flexWrap: 'wrap',
                }}
              >
                {consensusMatch.homeTeam && (
                  <>
                    <Flag
                      iso={consensusMatch.homeTeam.flagIso ?? ''}
                      size={20}
                    />
                    <span style={{ fontWeight: 800, fontSize: 14 }}>
                      {consensusMatch.homeTeam.name}
                    </span>
                  </>
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-mute)',
                    fontSize: 12,
                  }}
                >
                  vs
                </span>
                {consensusMatch.awayTeam && (
                  <>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>
                      {consensusMatch.awayTeam.name}
                    </span>
                    <Flag
                      iso={consensusMatch.awayTeam.flagIso ?? ''}
                      size={20}
                    />
                  </>
                )}
              </div>
              <ConsensusBar
                label={`${consensusMatch.homeTeam?.name ?? 'Home'} win`}
                pct={consensusMatch.homePct}
                color="var(--live)"
              />
              <ConsensusBar
                label="Draw"
                pct={consensusMatch.drawPct}
                color="var(--accent)"
              />
              <ConsensusBar
                label={`${consensusMatch.awayTeam?.name ?? 'Away'} win`}
                pct={consensusMatch.awayPct}
                color="var(--info)"
              />
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-mute)',
                  marginTop: 10,
                }}
              >
                Based on {consensusMatch.total} predictions submitted before
                lock.
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--text-mute)',
                fontSize: 13,
              }}
            >
              No locked matches with consensus data yet.
            </div>
          )}
        </SectionCard>
      </div>

      {/* Rank lists */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        className="dash-cols"
      >
        <SectionCard title="Sharpshooters" icon={<TargetIcon />} noPadding>
          <RankList rows={top5Exact} metricKey="fullCount" suffix="exact" />
        </SectionCard>
        <SectionCard
          title="Most predictions made"
          icon={<CheckIcon />}
          noPadding
        >
          <RankList rows={top5Played} metricKey="playedCount" suffix="picks" />
        </SectionCard>
      </div>
    </div>
  );
}
```

### Step 6.2 — Register route

- [ ] In the router, inside `<AppShell>`, add:
  ```tsx
  import { StatsPage } from './pages/StatsPage';
  // ...
  <Route path="/stats" element={<StatsPage />} />
  ```

### Step 6.3 — Commit

- [ ] Run:
  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/pages/StatsPage.tsx src/router.tsx
  git commit -m "feat: add StatsPage with award cards, SVG bar chart, consensus bars, rank lists"
  ```

---

## Final verification checklist

- [ ] Run `cd /home/shath/projects/auxillary/MySCORE/frontend && npm run build` — zero TypeScript errors.
- [ ] All 8 pages exist and are imported in the router.
- [ ] Auth pages (`/login`, `/register`, `/forgot-password`) render without `<AppShell>` wrapper.
- [ ] All other pages render inside `<AppShell>`.
- [ ] `LoginPage` mustChangePassword inline step works: submitting the change-password form calls `apiChangePassword`, then `auth.login(token)`, then navigates to `/`.
- [ ] `RegisterPage` auto-login: after `apiRegister` succeeds, calls `apiLogin` with same credentials, stores token, navigates to `/`.
- [ ] `ForgotPasswordPage` generated-password box shows generated password with copy button; "Back to login" link navigates to `/login`.
- [ ] `DashboardPage` shows skeletons while data loads; stat tiles show `—` when no entry for current user.
- [ ] `MatchesPage` group chips and status seg control filter correctly; empty state shows when no matches match.
- [ ] `PredictionsPage` "Completed" section appears only when completed predictions exist; points column blank for upcoming.
- [ ] `LeaderboardPage` podium hidden on mobile (`.hide-mobile`); sort control re-sorts table without refetching.
- [ ] `StatsPage` renders gracefully with empty `barData` and empty `consensusByMatch`.

---

## API shape assumptions

The plan assumes these response shapes from the backend (consult NestJS DTOs from the backend plan if types need adjustment):

```typescript
// POST /auth/login → { token: string; mustChangePassword?: boolean }
// POST /auth/register → User (no token)
// POST /auth/change-password → { token: string }
// POST /auth/generate-password → { password: string }
// GET /tournaments/active → Tournament { id, name, year, isActive, lockMinutes }
// GET /leaderboard/:tournamentId → LeaderboardEntry[]
//   LeaderboardEntry: { userId, displayName, totalPts, fullCount, totoCount, playedCount, prevRank? }
// GET /stats → Stats { pointsByStage: [{stage, avgPts}], consensusByMatch: Record<matchId, ConsensusData> }
//   ConsensusData: { homeTeam, awayTeam, homePct, drawPct, awayPct, total }
// Match: { id, kickoffAt, status, stage, group, homeTeam, awayTeam, homeScore?, awayScore?, minute? }
//   homeTeam/awayTeam: { id, name, code, flagIso }
// Prediction: { id, matchId, homeScore, awayScore, points? }
```

If the backend returns differently-named fields, update the field accesses in the pages above accordingly before committing.
