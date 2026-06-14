import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '../../api/teams';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Flag } from '../ui/Flag';
import { useToast } from '../../hooks/useToast';
import type { Team } from '../../types';

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

interface EditState { name: string; fifaCode: string; isoCode: string; groupLabel: string; }

export function TeamsTab({ tournamentId }: { tournamentId: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ name: '', fifaCode: '', isoCode: '', groupLabel: 'A' });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<EditState>({ name: '', fifaCode: '', isoCode: '', groupLabel: 'A' });

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ['teams', tournamentId],
    queryFn: () => teamsApi.getTeams(tournamentId),
  });

  const createMutation = useMutation({
    mutationFn: () => teamsApi.createTeam({ tournamentId, name: createForm.name, fifaCode: createForm.fifaCode.toUpperCase(), isoCode: createForm.isoCode.toLowerCase(), groupLabel: createForm.groupLabel }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); setShowCreate(false); setCreateForm({ name: '', fifaCode: '', isoCode: '', groupLabel: 'A' }); toast('Team created', 'success'); },
    onError: () => toast('Failed to create team', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EditState> }) => teamsApi.updateTeam(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); setEditingId(null); toast('Team updated', 'success'); },
    onError: () => toast('Failed to update team', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamsApi.deleteTeam(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); toast('Team deleted', 'success'); },
    onError: () => toast('Failed to delete team', 'error'),
  });

  const startEdit = (team: Team) => { setEditingId(team.id); setEditForm({ name: team.name, fifaCode: team.fifaCode, isoCode: team.isoCode, groupLabel: team.groupLabel }); };
  const handleDelete = (team: Team) => { if (window.confirm(`Delete ${team.name}?`)) deleteMutation.mutate(team.id); };

  const cellInput: React.CSSProperties = { background: 'var(--bg-2)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '4px 8px', fontSize: 13, width: '100%' };
  const selStyle: React.CSSProperties = { ...cellInput };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" onClick={() => setShowCreate(v => !v)}>{showCreate ? 'Cancel' : '+ New Team'}</Button>
      </div>

      {showCreate && (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Name</span>
            <Input type="text" placeholder="Argentina" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>FIFA Code</span>
            <Input type="text" placeholder="ARG" maxLength={3} value={createForm.fifaCode} onChange={e => setCreateForm(f => ({ ...f, fifaCode: e.target.value.toUpperCase() }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>ISO Code</span>
            <Input type="text" placeholder="ar" value={createForm.isoCode} onChange={e => setCreateForm(f => ({ ...f, isoCode: e.target.value.toLowerCase() }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Group</span>
            <select value={createForm.groupLabel} onChange={e => setCreateForm(f => ({ ...f, groupLabel: e.target.value }))} style={selStyle}>
              {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
            </select>
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={() => createMutation.mutate()} disabled={!createForm.name || createForm.fifaCode.length !== 3 || !createForm.isoCode || createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create Team'}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? <p style={{ color: 'var(--text-dim)' }}>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-dim)' }}>
                {['Flag','FIFA Code','Name','Group','Actions'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {teams.map(team => editingId === team.id ? (
                <tr key={team.id} style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-1)' }}>
                  <td style={{ padding: '8px 12px' }}><Flag isoCode={editForm.isoCode} size={24} /></td>
                  <td style={{ padding: '8px 12px' }}><input style={cellInput} maxLength={3} value={editForm.fifaCode} onChange={e => setEditForm(f => ({ ...f, fifaCode: e.target.value.toUpperCase() }))} /></td>
                  <td style={{ padding: '8px 12px' }}><input style={cellInput} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></td>
                  <td style={{ padding: '8px 12px' }}>
                    <select style={selStyle} value={editForm.groupLabel} onChange={e => setEditForm(f => ({ ...f, groupLabel: e.target.value }))}>
                      {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="primary" onClick={() => updateMutation.mutate({ id: team.id, data: editForm })} disabled={updateMutation.isPending}>Save</Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={team.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px' }}><Flag isoCode={team.isoCode} size={24} /></td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, letterSpacing: '0.05em' }}>{team.fifaCode}</td>
                  <td style={{ padding: '10px 12px' }}>{team.name}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>Group {team.groupLabel}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="ghost" onClick={() => startEdit(team)}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(team)} disabled={deleteMutation.isPending}>Delete</Button>
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
