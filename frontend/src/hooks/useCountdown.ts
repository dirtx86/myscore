import { useState, useEffect } from 'react';

export interface CountdownResult {
  label: string;
  urgent: boolean; // < 1 hour
  started: boolean;
}

export function useCountdown(kickoffAt: string): CountdownResult {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const target = new Date(kickoffAt).getTime();
    const diff = target - Date.now();
    // Tick every second when < 1h, every 30s otherwise
    const interval = diff < 3_600_000 ? 1000 : 30_000;
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [kickoffAt]);

  const target = new Date(kickoffAt).getTime();
  const diff = target - now;

  if (diff <= 0) return { label: '', urgent: false, started: true };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let label: string;
  if (days > 0) {
    label = `${days}d ${hours}h`;
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m`;
  } else {
    label = `${minutes}m ${seconds}s`;
  }

  return { label, urgent: diff < 3_600_000, started: false };
}
