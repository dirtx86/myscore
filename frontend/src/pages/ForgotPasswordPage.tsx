import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.generatePassword({ email });
      setGeneratedPassword(data.password);
    } catch (err: unknown) {
      const anyErr = err as { response?: { status?: number } };
      if (anyErr?.response?.status === 404) {
        setError('No account found with that email address.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-0)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link
          to="/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-mute)', textDecoration: 'none', marginBottom: 28 }}
        >
          ← Back to login
        </Link>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--text)' }}>
            Forgot password?
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-mute)' }}>
            Enter your email and we'll generate a temporary password for you.
          </p>
        </div>

        {!generatedPassword ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            {error && (
              <p role="alert" style={{ fontSize: 13, color: 'var(--danger)', background: 'rgba(255,77,94,0.08)', padding: '10px 14px', borderRadius: 'var(--r-sm)' }}>
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
              Generate password
            </Button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Warning banner */}
            <div style={{
              background: 'rgba(255,176,32,0.10)', border: '1px solid rgba(255,176,32,0.3)',
              borderRadius: 'var(--r)', padding: '12px 16px',
              fontSize: 13, color: 'var(--warn)', fontWeight: 600,
            }}>
              This password is shown once — copy it now.
            </div>

            {/* Generated password display */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
                Your temporary password
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  readOnly
                  value={generatedPassword}
                  style={{
                    flex: 1, background: 'var(--bg-inset)',
                    border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)',
                    padding: '10px 14px', color: 'var(--text)',
                    fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600,
                    userSelect: 'all',
                  }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  type="button"
                  variant={copied ? 'primary' : 'secondary'}
                  onClick={handleCopy}
                  style={{ flexShrink: 0 }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.6 }}>
              Use this password to{' '}
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                sign in
              </Link>
              . You'll be asked to set a new password immediately.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
