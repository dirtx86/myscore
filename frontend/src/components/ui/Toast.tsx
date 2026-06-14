import React, { useState, useCallback, useContext, createContext } from 'react';
import { Icon } from './Icon';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem { id: number; message: string; type: ToastType; }

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const TYPE_ICON: Record<ToastType, string> = { success: 'check', error: 'x', info: 'bell' };
const TYPE_COLOR: Record<ToastType, string> = { success: 'var(--live)', error: 'var(--danger)', info: 'var(--info)' };

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      return next.length > 3 ? next.slice(-3) : next;
    });
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map((t) => (
          <div key={t.id} className="toast" style={{ borderLeft: `3px solid ${TYPE_COLOR[t.type]}` }} role="status">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name={TYPE_ICON[t.type]} size={16} style={{ color: TYPE_COLOR[t.type], flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
