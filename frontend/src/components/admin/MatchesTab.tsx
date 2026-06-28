import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi } from '../../api/matches';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatusPill } from '../ui/StatusPill';
import { TeamTag } from '../ui/TeamTag';
import { ResultForm } from './ResultForm';
import { useToast } from '../../hooks/useToast';
import type { Match, MatchStage, MatchStatus, Team, CreateMatchRequest } from '../../types';

const STAGES: MatchStage[] = ['group', 'r32', 'r16', 'qf', 'sf', 'third_place', 'final'];
const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const STATUSES: MatchStatus[] = ['scheduled', 'locked', 'live', 'completed'];

interface MatchesTabProps { tournamentId: string; teams: Team[]; }

interface CreateForm {
  homeTeamId: string; awayTeamId: string; kickoffAt: string;
  stage: MatchStage; groupLabel: string; venue: string;
}

const EMPTY_FORM: CreateForm = { homeTeamId: '', awayTeamId: '', kickoffAt: '', stage: 'group', groupLabel: 'A', venue: '' };

export function MatchesTab({ tournamentId, teams }: MatchesTabProps) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [resultMatchId, setResultMatchId] = useState<string | null>(null);
  const [streamMatchId, setStreamMatchId] = useState<string | null>(null);
  const [streamUrlDraft, setStreamUrlDraft] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);

  const importMutation = useMutation({
    mutationFn: () => matchesApi.importMatches(tournamentId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      toast(`Imported ${data.created} matches (${data.skipped} skipped${data.errors.length ? `, ${data.errors.length} errors` : ''})`, data.errors.length ? 'error' : 'success');
    },
    onError: () => toast('Import failed — check API key', 'error'),
  });

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ['admin-matches', tournamentId],
    queryFn: () => matchesApi.getMatches(tournamentId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MatchStatus }) =>
      matchesApi.updateMatchStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-matches'] }); toast('Status updated', 'success'); },
    onError: () => toast('Failed to update status', 'error'),
  });

  const resultMutation = useMutation({
    mutationFn: ({ id, homeScore, awayScore }: { id: string; homeScore: number; awayScore: number }) =>
      matchesApi.updateMatchResult(id, { homeScore, awayScore }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-matches'] }); setResultMatchId(null); toast('Result saved — leaderboard recalculated', 'success'); },
    onError: () => toast('Failed to save result', 'error'),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const data: CreateMatchRequest = {
        tournamentId,
        homeTeamId: form.homeTeamId,
        awayTeamId: form.awayTeamId,
        kickoffAt: new Date(form.kickoffAt).toISOString(),
        stage: form.stage,
        ...(form.stage === 'group' ? { groupLabel: form.groupLabel } : {}),
        ...(form.venue ? { venue: form.venue } : {}),
      };
      return matchesApi.createMatch(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-matches'] }); setShowCreate(false); setForm(EMPTY_FORM); toast('Match created', 'success'); },
    onError: () => toast('Failed to create match', 'error'),
  });

  const streamMutation = useMutation({
    mutationFn: ({ id, url, published }: { id: string; url: string | null; published: boolean }) =>
      matchesApi.adminUpdateStream(id, url, published),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      toast('Stream updated', 'success');
    },
    onError: () => toast('Failed to update stream', 'error'),
  });

  const selStyle = { background: 'var(--bg-2)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '8px 10px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button
          variant="ghost"
          onClick={() => { if (window.confirm('Import all WC2026 matches from football-data.org? This will skip any already imported.')) importMutation.mutate(); }}
          disabled={importMutation.isPending}
        >
          {importMutation.isPending ? 'Importing…' : '⬇ Import from API'}
        </Button>
        <Button variant="primary" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? 'Cancel' : '+ New Match'}
        </Button>
      </div>

      {showCreate && (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Home Team</span>
            <select value={form.homeTeamId} onChange={e => setForm(f => ({ ...f, homeTeamId: e.target.value }))} style={selStyle}>
              <option value="">Select team…</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.fifaCode} — {t.name}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Away Team</span>
            <select value={form.awayTeamId} onChange={e => setForm(f => ({ ...f, awayTeamId: e.target.value }))} style={selStyle}>
              <option value="">Select team…</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.fifaCode} — {t.name}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Kickoff</span>
            <Input type="datetime-local" value={form.kickoffAt} onChange={e => setForm(f => ({ ...f, kickoffAt: e.target.value }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Stage</span>
            <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as MatchStage }))} style={selStyle}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          {form.stage === 'group' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Group</span>
              <select value={form.groupLabel} onChange={e => setForm(f => ({ ...f, groupLabel: e.target.value }))} style={selStyle}>
                {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
              </select>
            </label>
          )}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Venue (optional)</span>
            <Input type="text" placeholder="e.g. MetLife Stadium" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={() => createMutation.mutate()} disabled={!form.homeTeamId || !form.awayTeamId || !form.kickoffAt || createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create Match'}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? <p style={{ color: 'var(--text-dim)' }}>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-dim)' }}>
                {['Date/Time','Home','Away','Stage','Status','Result','Stream','Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map(match => (
                <>
                  <tr key={match.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      {new Date(match.kickoffAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '10px 12px' }}><TeamTag team={match.homeTeam} /></td>
                    <td style={{ padding: '10px 12px' }}><TeamTag team={match.awayTeam} /></td>
                    <td style={{ padding: '10px 12px' }}>{match.stage}</td>
                    <td style={{ padding: '10px 12px' }}><StatusPill status={match.status} /></td>
                    <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
                      {match.homeScore != null && match.awayScore != null ? `${match.homeScore}–${match.awayScore}` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        onClick={() => {
                          setStreamMatchId(streamMatchId === match.id ? null : match.id);
                          setStreamUrlDraft(d => ({ ...d, [match.id]: match.streamUrl ?? '' }));
                        }}
                        style={{
                          padding: '4px 10px', fontSize: 12, fontWeight: 600,
                          borderRadius: 'var(--r-sm)', cursor: 'pointer', border: 'none',
                          background: match.streamPublished
                            ? 'rgba(25,224,138,0.15)'
                            : 'rgba(255,255,255,0.07)',
                          color: match.streamPublished ? 'var(--live)' : 'var(--text-mute)',
                        }}
                      >
                        {match.streamPublished ? '📡 Live' : '📡 Stream'}
                      </button>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {(match.status === 'scheduled' || match.status === 'locked') && (
                          <button
                            onClick={() => statusMutation.mutate({ id: match.id, status: match.status === 'scheduled' ? 'locked' : 'scheduled' })}
                            disabled={statusMutation.isPending}
                            style={{
                              padding: '4px 10px', fontSize: 12, fontWeight: 600,
                              borderRadius: 'var(--r-sm)', cursor: 'pointer', border: 'none',
                              background: match.status === 'scheduled' ? 'rgba(255,180,0,0.15)' : 'rgba(74,168,255,0.15)',
                              color: match.status === 'scheduled' ? '#f59e0b' : 'var(--info)',
                            }}
                          >
                            {match.status === 'scheduled' ? '🔒 Lock Predictions' : '🔓 Open Predictions'}
                          </button>
                        )}
                        {match.status !== 'completed' && match.status !== 'scheduled' && match.status !== 'locked' && (
                          <select value={match.status} onChange={e => statusMutation.mutate({ id: match.id, status: e.target.value as MatchStatus })} style={{ background: 'var(--bg-2)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '4px 8px', fontSize: 13 }}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                        <Button variant="ghost" onClick={() => setResultMatchId(resultMatchId === match.id ? null : match.id)}>
                          {resultMatchId === match.id ? 'Cancel' : 'Enter Result'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {resultMatchId === match.id && (
                    <tr key={`r-${match.id}`}>
                      <td colSpan={8} style={{ padding: '12px 20px', background: 'var(--bg-1)' }}>
                        <ResultForm match={match} onSave={(hs, as) => resultMutation.mutate({ id: match.id, homeScore: hs, awayScore: as })} onCancel={() => setResultMatchId(null)} />
                      </td>
                    </tr>
                  )}
                  {streamMatchId === match.id && (
                    <tr key={`s-${match.id}`}>
                      <td colSpan={8} style={{ padding: '12px 20px', background: 'var(--bg-1)' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: 'var(--text-mute)' }}>M3U / HLS Stream URL</label>
                            <Input
                              type="url"
                              placeholder="https://example.com/stream.m3u8"
                              value={streamUrlDraft[match.id] ?? match.streamUrl ?? ''}
                              onChange={e => setStreamUrlDraft(d => ({ ...d, [match.id]: e.target.value }))}
                            />
                          </div>
                          <Button
                            variant="primary"
                            disabled={streamMutation.isPending}
                            onClick={() => streamMutation.mutate({
                              id: match.id,
                              url: streamUrlDraft[match.id] || null,
                              published: true,
                            })}
                          >
                            {streamMutation.isPending ? '…' : 'Publish'}
                          </Button>
                          {match.streamPublished && (
                            <Button
                              variant="ghost"
                              disabled={streamMutation.isPending}
                              onClick={() => streamMutation.mutate({
                                id: match.id,
                                url: match.streamUrl ?? null,
                                published: false,
                              })}
                            >
                              Unpublish
                            </Button>
                          )}
                          <Button variant="ghost" onClick={() => setStreamMatchId(null)}>Cancel</Button>
                        </div>
                        {match.streamPublished && match.streamUrl && (
                          <p style={{ fontSize: 11, color: 'var(--live)', marginTop: 8 }}>
                            ✓ Stream is published: {match.streamUrl}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
