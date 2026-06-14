import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi } from '../../api/matches';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../hooks/useToast';
import type { Tournament, ScoreRules } from '../../types';

interface ScoringTabProps { tournamentId: string; tournament: Tournament; }
interface ScoringForm { totoPts: number; fullScorePts: number; goalDiffPts: number; lockMinutes: number; }

export function ScoringTab({ tournamentId, tournament }: ScoringTabProps) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: rules } = useQuery<ScoreRules>({
    queryKey: ['score-rules', tournamentId],
    queryFn: () => matchesApi.getScoreRules(tournamentId),
  });

  const [form, setForm] = useState<ScoringForm>({ totoPts: 1, fullScorePts: 3, goalDiffPts: 1, lockMinutes: 15 });

  useEffect(() => {
    if (rules && tournament) {
      setForm({ totoPts: rules.totoPts, fullScorePts: rules.fullScorePts, goalDiffPts: rules.goalDiffPts, lockMinutes: tournament.lockMinutes });
    }
  }, [rules, tournament]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await matchesApi.updateScoreRules(tournamentId, { totoPts: form.totoPts, fullScorePts: form.fullScorePts, goalDiffPts: form.goalDiffPts });
      await matchesApi.updateTournamentLockMinutes(tournamentId, form.lockMinutes);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['score-rules'] }); qc.invalidateQueries({ queryKey: ['active-tournament'] }); toast('Scoring rules saved', 'success'); },
    onError: () => toast('Failed to save', 'error'),
  });

  const setField = (key: keyof ScoringForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
    setForm(f => ({ ...f, [key]: val }));
  };

  const preview = [
    { label: 'Correct winner / draw (toto)', pts: form.totoPts },
    { label: 'Exact score (toto + full)', pts: form.totoPts + form.fullScorePts },
    { label: 'Correct goal difference (toto + diff)', pts: form.totoPts + form.goalDiffPts },
    { label: 'Wrong result', pts: 0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 640 }}>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Scoring Rules</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {([['totoPts','Toto points'],['fullScorePts','Full score bonus'],['goalDiffPts','Goal difference bonus'],['lockMinutes','Lock window (minutes)']] as Array<[keyof ScoringForm, string]>).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{label}</span>
              <Input type="number" min={0} value={form[key]} onChange={setField(key)} />
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Live Preview</h2>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
          {preview.map((row, i) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: i < preview.length - 1 ? '1px solid var(--line)' : undefined }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>{row.label}</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: row.pts === 0 ? 'var(--text-mute)' : 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{row.pts} pts</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 8 }}>Predictions lock {form.lockMinutes} minute{form.lockMinutes !== 1 ? 's' : ''} before kickoff.</p>
      </div>

      <Button variant="primary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
        {saveMutation.isPending ? 'Saving…' : 'Save Rules'}
      </Button>
    </div>
  );
}
