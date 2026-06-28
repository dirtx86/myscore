import { Fragment, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useToast } from '../../hooks/useToast';
import type { User } from '../../types';

export function UsersTab() {
  const qc = useQueryClient();
  const { toast } = useToast();

  // Existing state
  const [resetResult, setResetResult] = useState<{ userId: string; password: string } | null>(null);

  // Add user state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', displayName: '' });
  const [addResult, setAddResult] = useState<{ id: string; email: string; displayName: string; temporaryPassword: string } | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', email: '', department: '' });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.listUsers(),
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => usersApi.disableUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast('User disabled', 'success'); },
    onError: () => toast('Failed to disable user', 'error'),
  });

  const enableMutation = useMutation({
    mutationFn: (id: string) => usersApi.enableUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast('User enabled', 'success'); },
    onError: () => toast('Failed to enable user', 'error'),
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => usersApi.resetUserPassword(id),
    onSuccess: (data, userId) => setResetResult({ userId, password: data.password }),
    onError: () => toast('Failed to reset password', 'error'),
  });

  const addMutation = useMutation({
    mutationFn: () => usersApi.adminCreateUser(addForm),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setShowAddModal(false);
      setAddForm({ email: '', displayName: '' });
      setAddResult(data);
    },
    onError: () => toast('Failed to create user', 'error'),
  });

  const editMutation = useMutation({
    mutationFn: (id: string) => usersApi.adminUpdateUser(id, {
      displayName: editForm.displayName || undefined,
      email: editForm.email || undefined,
      department: editForm.department || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingId(null);
      toast('User updated', 'success');
    },
    onError: () => toast('Failed to update user', 'error'),
  });

  function startEdit(user: User) {
    setEditingId(user.id);
    setEditForm({
      displayName: user.displayName,
      email: user.email,
      department: user.department ?? '',
    });
  }

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', fontSize: 13, width: '100%',
    background: 'var(--bg-inset)', border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-sm)', color: 'var(--text)',
  };

  const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  };

  const modalBox: React.CSSProperties = {
    background: 'var(--bg-1)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-lg)', padding: 32, maxWidth: 420, width: '90%',
    display: 'flex', flexDirection: 'column', gap: 16,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Reset password result modal */}
      {resetResult && (
        <div style={modalOverlay} onClick={() => setResetResult(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>New Password Generated</h3>
            <p style={{ margin: 0, color: 'var(--danger)', fontSize: 13 }}>Shown once. Copy and share securely.</p>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px 16px', fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.05em', userSelect: 'all' }}>
              {resetResult.password}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => { navigator.clipboard.writeText(resetResult!.password); toast('Password copied', 'success'); }}>Copy Password</Button>
              <Button variant="ghost" onClick={() => setResetResult(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* New user temp password modal */}
      {addResult && (
        <div style={modalOverlay} onClick={() => setAddResult(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>User Created</h3>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>{addResult.displayName} · {addResult.email}</p>
            <p style={{ margin: 0, color: 'var(--danger)', fontSize: 13 }}>Save this password — it won't be shown again.</p>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px 16px', fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.05em', userSelect: 'all' }}>
              {addResult.temporaryPassword}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => { navigator.clipboard.writeText(addResult!.temporaryPassword); toast('Password copied', 'success'); }}>Copy Password</Button>
              <Button variant="ghost" onClick={() => setAddResult(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add user modal */}
      {showAddModal && (
        <div style={modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Add New User</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Display Name</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={addForm.displayName}
                  onChange={(e) => setAddForm((f) => ({ ...f, displayName: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                disabled={!addForm.email || !addForm.displayName || addMutation.isPending}
                onClick={() => addMutation.mutate()}
              >
                {addMutation.isPending ? 'Creating…' : 'Create User'}
              </Button>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Users</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Add User</Button>
      </div>

      {isLoading ? <p style={{ color: 'var(--text-dim)' }}>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-dim)' }}>
                {['', 'Name', 'Email', 'Dept', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <Fragment key={user.id}>
                  <tr style={{ borderBottom: editingId === user.id ? 'none' : '1px solid var(--line)', opacity: user.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: '10px 12px', width: 40 }}><Avatar displayName={user.displayName} size={32} /></td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontWeight: 500 }}>{user.displayName}</span>
                      {!user.isActive && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 15%, transparent)', padding: '2px 6px', borderRadius: 4 }}>[Disabled]</span>}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>{user.email}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>{user.department ?? '—'}</td>
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
                        <Button variant="ghost" onClick={() => startEdit(user)}>Edit</Button>
                        {user.isActive
                          ? <Button variant="danger" onClick={() => disableMutation.mutate(user.id)} disabled={disableMutation.isPending}>Disable</Button>
                          : <Button variant="ghost" onClick={() => enableMutation.mutate(user.id)} disabled={enableMutation.isPending}>Enable</Button>
                        }
                        <Button variant="ghost" onClick={() => resetMutation.mutate(user.id)} disabled={resetMutation.isPending}>Reset Pwd</Button>
                      </div>
                    </td>
                  </tr>
                  {editingId === user.id && (
                    <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-inset)' }}>
                      <td colSpan={8} style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Display Name</label>
                            <input style={{ ...inputStyle, width: 180 }} value={editForm.displayName} onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Email</label>
                            <input type="email" style={{ ...inputStyle, width: 220 }} value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Department</label>
                            <input style={{ ...inputStyle, width: 160 }} value={editForm.department} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))} />
                          </div>
                          <div style={{ display: 'flex', gap: 8, paddingBottom: 1 }}>
                            <Button variant="primary" disabled={editMutation.isPending} onClick={() => editMutation.mutate(user.id)}>
                              {editMutation.isPending ? 'Saving…' : 'Save'}
                            </Button>
                            <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
