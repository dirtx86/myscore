import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: boolean;
}

export function Card({ children, className, style, padding = true }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-1)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)',
        ...(padding ? { padding: 20 } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
