import React from 'react';

export interface SkelProps {
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skel({ width = '100%', height = '16px', className, style }: SkelProps) {
  return (
    <div
      className={`skel${className ? ` ${className}` : ''}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}
