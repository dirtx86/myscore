import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matches';
import { BracketRound } from '../components/bracket/BracketRound';
import type { Match, MatchStage } from '../types';

const SLOT_HEIGHT = 80;   // px — height of one R32 slot
const ROUND_GAP = 24;     // px — horizontal gap; must match CSS var
const CARD_WIDTH = 160;   // px

const KNOCKOUT_STAGES: MatchStage[] = ['r32', 'r16', 'qf', 'sf', 'third_place', 'final'];

function fillSlots(matches: Match[], count: number): (Match | null)[] {
  const slots = Array<Match | null>(count).fill(null);
  matches.slice(0, count).forEach((m, i) => { slots[i] = m; });
  return slots;
}

// Rounds on the left half of the bracket (converging to FINAL)
const LEFT_ROUNDS: { stage: MatchStage; label: string; halfCount: number }[] = [
  { stage: 'r32',  label: 'Round of 32', halfCount: 8 },
  { stage: 'r16',  label: 'Round of 16', halfCount: 4 },
  { stage: 'qf',   label: 'Quarter-finals', halfCount: 2 },
  { stage: 'sf',   label: 'Semi-finals', halfCount: 1 },
];

function MobileRound({ label, matches }: { label: string; matches: (Match | null)[] }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mute)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {matches.map((m, i) => (
          <div key={m?.id ?? i} style={{
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-sm)', padding: '8px 12px', minWidth: 180,
          }}>
            {m ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                  <span>{m.homeTeam.fifaCode}</span>
                  {m.homeScore != null && m.awayScore != null && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      {m.homeScore}–{m.awayScore}
                    </span>
                  )}
                  <span>{m.awayTeam.fifaCode}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>
                  {m.status === 'live' ? '🔴 LIVE' : m.status === 'completed' ? 'FT' :
                    new Date(m.kickoffAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>TBD</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BracketPage() {
  const { data: tournament, isLoading: tournamentLoading, isError: tournamentError } = useQuery({
    queryKey: ['tournament', 'active'],
    queryFn: matchesApi.getActiveTournament,
  });

  const { data: allMatches = [], isLoading } = useQuery({
    queryKey: ['matches', tournament?.id, 'knockout'],
    queryFn: () => matchesApi.getMatches(tournament!.id),
    enabled: !!tournament,
    select: (ms) =>
      ms
        .filter((m) => KNOCKOUT_STAGES.includes(m.stage))
        .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()),
  });

  const byStage = (stage: MatchStage) => allMatches.filter((m) => m.stage === stage);

  // Left half: first N/2 matches of each round; right half: last N/2
  function halfSlots(stage: MatchStage, half: 'left' | 'right', halfCount: number): (Match | null)[] {
    const all = byStage(stage);
    const chunk = half === 'left' ? all.slice(0, halfCount) : all.slice(halfCount);
    return fillSlots(chunk, halfCount);
  }

  const finalMatches = fillSlots(byStage('final'), 1);
  const thirdMatches = fillSlots(byStage('third_place'), 1);

  // Total bracket height = 8 R32 slots per half × SLOT_HEIGHT
  const bracketHeight = 8 * SLOT_HEIGHT;

  if (tournamentLoading || isLoading) {
    return (
      <div style={{ color: 'var(--text-mute)', padding: 40, textAlign: 'center' }}>
        Loading bracket…
      </div>
    );
  }

  if (tournamentError || !tournament) {
    return (
      <div style={{ color: 'var(--text-mute)', padding: 40, textAlign: 'center' }}>
        No active tournament found.
      </div>
    );
  }

  // ── Mobile fallback (≤880px via media query class) ──────────────────────
  const mobileView = (
    <div className="bracket-mobile">
      {LEFT_ROUNDS.map(({ stage, label, halfCount }) => (
        <MobileRound
          key={stage}
          label={label}
          matches={fillSlots(byStage(stage), halfCount * 2)}
        />
      ))}
      <MobileRound label="3rd Place" matches={thirdMatches} />
      <MobileRound label="Final" matches={finalMatches} />
    </div>
  );

  // ── Desktop bracket tree ─────────────────────────────────────────────────
  const desktopView = (
    <div
      className="bracket-desktop"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: ROUND_GAP,
        overflowX: 'auto',
        paddingBottom: 16,
        minWidth: 'max-content',
      }}
    >
      {/* Left half: R32 → R16 → QF → SF (converging inward) */}
      {LEFT_ROUNDS.map(({ stage, label, halfCount }) => (
        <BracketRound
          key={`left-${stage}`}
          label={label}
          matches={halfSlots(stage, 'left', halfCount)}
          slotHeight={bracketHeight / halfCount}
          side="left"
        />
      ))}

      {/* Centre: FINAL + 3rd Place stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>
          Final
        </div>
        {finalMatches.map((m, i) => (
          <div key={m?.id ?? i} className="bk-slot bk-slot--center" style={{ display: 'flex', alignItems: 'center' }}>
            {/* import BracketMatchCard inline for center */}
            {m ? (
              <div style={{
                width: CARD_WIDTH + 20, padding: '8px 12px',
                background: 'var(--bg-2)',
                border: `2px solid ${m.status === 'live' ? 'var(--live)' : m.status === 'completed' ? 'var(--accent)' : 'var(--line-2)'}`,
                borderRadius: 'var(--r)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                  <span>{m.homeTeam.fifaCode}</span>
                  {m.homeScore != null && m.awayScore != null && (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{m.homeScore}–{m.awayScore}</span>
                  )}
                  <span>{m.awayTeam.fifaCode}</span>
                </div>
              </div>
            ) : (
              <div style={{
                width: CARD_WIDTH + 20, height: 52,
                border: '1px dashed var(--line-2)', borderRadius: 'var(--r)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>TBD</span>
              </div>
            )}
          </div>
        ))}
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-mute)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 12 }}>
          3rd Place
        </div>
        {thirdMatches.map((m, i) => (
          <div key={m?.id ?? i} className="bk-slot bk-slot--center" style={{ display: 'flex', alignItems: 'center' }}>
            {m ? (
              <div style={{
                width: CARD_WIDTH + 20, padding: '8px 12px',
                background: 'var(--bg-2)',
                border: '1px solid var(--line-2)',
                borderRadius: 'var(--r)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--text-dim)' }}>
                  <span>{m.homeTeam.fifaCode}</span>
                  {m.homeScore != null && m.awayScore != null && (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{m.homeScore}–{m.awayScore}</span>
                  )}
                  <span>{m.awayTeam.fifaCode}</span>
                </div>
              </div>
            ) : (
              <div style={{
                width: CARD_WIDTH + 20, height: 52,
                border: '1px dashed var(--line-2)', borderRadius: 'var(--r)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>TBD</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right half: SF → QF → R16 → R32 (diverging outward) */}
      {[...LEFT_ROUNDS].reverse().map(({ stage, label, halfCount }) => (
        <BracketRound
          key={`right-${stage}`}
          label={label}
          matches={halfSlots(stage, 'right', halfCount)}
          slotHeight={bracketHeight / halfCount}
          side="right"
        />
      ))}
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>
        Knockout Bracket
      </h2>
      {mobileView}
      {desktopView}
    </div>
  );
}
