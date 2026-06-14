import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useToast } from '../../hooks/useToast';
import type { User } from '../../types';

export function UsersTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [resetResult, setResetResult] = useState<{ userId: string; password: string } | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.listUsers(),
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => usersApi.disableUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast('User disabled', 'success'); },
    onError: () => toast('Failed to disable user', 'error'),
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => usersApi.resetUserPassword(id),
    onSuccess: (data, userId) => setResetResult({ userId, password: data.password }),
    onError: () => toast('Failed to reset password', 'error'),
  });

  const handleCopy = () => {
    if (resetResult) { navigator.clipboard.writeText(resetResult.password); toast('Password copied', 'success'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {resetResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setResetResult(null)}>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 32, maxWidth: 400, width: '90%', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>New Password Generated</h3>
            <p style={{ margin: 0, color: 'var(--danger)', fontSize: 13 }}>Shown once. Copy and share securely.</p>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px 16px', fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.05em', userSelect: 'all' }}>
              {resetResult.password}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={handleCopy}>Copy Password</Button>
              <Button variant="ghost" onClick={() => setResetResult(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? <p style={{ color: 'var(--text-dim)' }}>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-dim)' }}>
                {['','Name','Email','Role','Status','Created','Actions'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--line)', opacity: user.isActive ? 1 : 0.5 }}>
                  <td style={{ padding: '10px 12px', width: 40 }}><Avatar displayName={user.displayName} size={32} /></td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontWeight: 500 }}>{user.displayName}</span>
                    {!user.isActive && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 15%, transparent)', padding: '2px 6px', borderRadius: 4 }}>[Disabled]</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>{user.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: user.role === 'admin' ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'var(--bg-2)', color: user.role === 'admin' ? 'var(--accent)' : 'var(--text-dim)' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: user.isActive ? 'color-mix(in srgb, #22c55e 15%, transparent)' : 'var(--bg-2)', color: user.isActive ? '#22c55e' : 'var(--text-mute)' }}>
                      {user.isActive ? 'active' : 'disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {user.isActive && <Button variant="danger" onClick={() => disableMutation.mutate(user.id)} disabled={disableMutation.isPending}>Disable</Button>}
                      <Button variant="ghost" onClick={() => resetMutation.mutate(user.id)} disabled={resetMutation.isPending}>Reset Password</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
