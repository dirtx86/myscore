import { useCallback } from 'react';

export interface ScoreInputProps {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

const clamp = (v: number) => Math.max(0, Math.min(20, v));

export function ScoreInput({ value, onChange, disabled = false }: ScoreInputProps) {
  const increment = useCallback(() => onChange(clamp(value + 1)), [value, onChange]);
  const decrement = useCallback(() => onChange(clamp(value - 1)), [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); onChange(clamp(value + 1)); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); onChange(clamp(value - 1)); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!/^\d{0,2}$/.test(raw)) return;
    if (raw === '') return;
    const num = parseInt(raw, 10);
    if (!isNaN(num)) onChange(clamp(num));
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: disabled ? 0.5 : 1 }}>
      <button
        type="button"
        className="step-btn"
        onClick={increment}
        disabled={disabled}
        aria-label="Increase score"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
      >▲</button>
      <input
        type="number"
        role="spinbutton"
        className="score-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        min={0}
        max={20}
        aria-label="Score"
        style={{ MozAppearance: 'textfield' } as React.CSSProperties}
      />
      <button
        type="button"
        className="step-btn"
        onClick={decrement}
        disabled={disabled}
        aria-label="Decrease score"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
      >▼</button>
    </div>
  );
}
