import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--r)', border: 'none', transition: 'all 0.15s', userSelect: 'none',
    opacity: disabled || loading ? 0.6 : 1,
    ...(size === 'sm' ? { fontSize: 12, padding: '6px 12px' } : size === 'lg' ? { fontSize: 16, padding: '13px 26px' } : { fontSize: 14, padding: '10px 18px' }),
  };

  const variantStyle: React.CSSProperties =
    variant === 'primary' ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--accent-ink)' } :
    variant === 'danger'  ? { background: 'var(--danger)', color: '#fff' } :
    variant === 'ghost'   ? { background: 'transparent', color: 'var(--text-dim)', border: '1px solid transparent' } :
    { background: 'var(--bg-2)', color: 'var(--text)', border: '1px solid var(--line)' };

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      style={{ ...baseStyle, ...variantStyle, ...style }}
      {...rest}
    >
      {loading && (
        <span aria-hidden="true" style={{
          width: '1em', height: '1em', border: '2px solid currentColor',
          borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      )}
      {children}
    </button>
  );
}
