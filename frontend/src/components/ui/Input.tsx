import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && (
          <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            background: 'var(--bg-inset)', border: `1px solid ${error ? 'var(--danger)' : 'var(--line-2)'}`,
            borderRadius: 'var(--r-sm)', padding: '10px 14px', color: 'var(--text)',
            fontFamily: 'var(--font-sans)', fontSize: 14, width: '100%', outline: 'none',
          }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,210,63,0.15)'; }}
          onBlur={(e) => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--line-2)'; e.target.style.boxShadow = 'none'; }}
          {...rest}
        />
        {error && (
          <span id={`${inputId}-error`} role="alert" style={{ fontSize: 12, color: 'var(--danger)' }}>
            {error}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
