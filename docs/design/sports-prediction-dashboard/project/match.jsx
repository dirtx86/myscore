/* ============================================================
   MySCORE WC2026 — match scoreboard + prediction entry
   ============================================================ */
const { useState: useStateM } = React;

/* central broadcast score display: HOME  [a : b]  AWAY */
function Scoreboard({ m, center, big = 34, flagSize = 34, names = true }) {
  const h = WC.teams[m.home], a = WC.teams[m.away];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end", textAlign: "right" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.08 }}>
          <span style={{ fontWeight: 800, fontSize: names ? 16 : 0, height: names ? "auto" : 0, overflow: names ? "visible" : "hidden" }}>{names ? h.name : ""}</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-mute)", letterSpacing: ".08em", fontWeight: 700 }}>{h.fifa}</span>
        </div>
        <Flag iso={h.iso} size={flagSize} round={5} />
      </div>
      <div style={{ minWidth: 96, display: "flex", justifyContent: "center" }}>{center}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-start", textAlign: "left" }}>
        <Flag iso={a.iso} size={flagSize} round={5} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.08 }}>
          <span style={{ fontWeight: 800, fontSize: names ? 16 : 0, height: names ? "auto" : 0, overflow: names ? "visible" : "hidden" }}>{names ? a.name : ""}</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-mute)", letterSpacing: ".08em", fontWeight: 700 }}>{a.fifa}</span>
        </div>
      </div>
    </div>
  );
}

function bigScore(arr, accent) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span className="score-big" style={{ color: accent ? "var(--text)" : "var(--text)" }}>{arr[0]}</span>
      <span className="score-big" style={{ color: "var(--text-mute)", fontSize: 22 }}>:</span>
      <span className="score-big">{arr[1]}</span>
    </div>
  );
}

/* The full interactive match card used on the Matches screen */
function MatchCard({ m, pred, onSave, defaultOpen }) {
  const editable = m.status === "scheduled";
  const [draft, setDraft] = useStateM(pred ? [...pred] : [null, null]);
  const toast = useToast();
  const dirty = editable && (draft[0] !== (pred?.[0] ?? null) || draft[1] !== (pred?.[1] ?? null));
  const complete = draft[0] != null && draft[1] != null;

  React.useEffect(() => { setDraft(pred ? [...pred] : [null, null]); }, [pred]);

  const pts = m.status === "completed" && pred ? WC.computePoints(pred, m.res, WC.scoreRules) : null;

  let center;
  if (m.status === "completed" || m.status === "live") {
    center = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        {bigScore(m.res)}
        {m.status === "live"
          ? <span className="pill pill-live" style={{ marginTop: 2 }}><span className="dot"></span>{m.min}'</span>
          : <span className="mono" style={{ fontSize: 10.5, color: "var(--text-mute)", letterSpacing: ".1em" }}>FULL-TIME</span>}
      </div>
    );
  } else if (editable) {
    center = (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Stepper value={draft[0]} onChange={(v) => setDraft([v, draft[1]])} />
        <span style={{ color: "var(--text-mute)", fontWeight: 800, fontSize: 20 }}>:</span>
        <Stepper value={draft[1]} onChange={(v) => setDraft([draft[0], v])} />
      </div>
    );
  } else {
    // locked
    center = pred ? (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        {bigScore(pred)}
        <span className="mono" style={{ fontSize: 10, color: "var(--warn)", letterSpacing: ".08em" }}>YOUR PICK · LOCKED</span>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <span className="score-big" style={{ color: "var(--text-mute)" }}>–:–</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--danger)", letterSpacing: ".08em" }}>NO PICK</span>
      </div>
    );
  }

  const save = () => {
    onSave(m.id, [...draft]);
    toast(`Prediction saved · ${WC.teams[m.home].fifa} ${draft[0]}–${draft[1]} ${WC.teams[m.away].fifa}`, { icon: "check", color: "var(--live)" });
  };

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* meta header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
        <span className="chip" style={{ fontSize: 11 }}>Group {m.group}</span>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
          <Icon name="calendar" size={13} />{dayShort(m.date)} · {clockOf(m.date)}
        </span>
        <span className="hide-mobile" style={{ fontSize: 12, color: "var(--text-mute)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{WC.venues[m.venue]}</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {editable && <span className="mono" style={{ fontSize: 11.5, color: "var(--accent)" }}>Locks in {countdown(m.date, WC.NOW)}</span>}
          <StatusPill status={m.status} />
        </span>
      </div>

      {/* scoreboard */}
      <div style={{ padding: "20px 18px 16px" }}>
        <Scoreboard m={m} center={center} />
      </div>

      {/* footer / actions */}
      <div style={{ padding: "0 16px 14px", display: "flex", alignItems: "center", gap: 12, minHeight: 8 }}>
        {editable && (
          <>
            <span style={{ fontSize: 12.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
              {pred ? <><Icon name="check" size={14} style={{ color: "var(--live)" }} />Saved — edit anytime before kickoff</>
                    : <><Icon name="target" size={14} style={{ color: "var(--accent)" }} />Make your call</>}
            </span>
            <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} disabled={!complete || !dirty} onClick={save}>
              {pred ? "Update pick" : "Submit pick"}
            </button>
          </>
        )}
        {m.status === "completed" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
              {pred ? <>Your pick <b style={{ color: "var(--text)" }} className="mono">{pred[0]}–{pred[1]}</b></> : <span style={{ color: "var(--danger)" }}>No prediction submitted</span>}
            </span>
            <span style={{ marginLeft: "auto" }}>{pred && <PtsTag pts={pts} />}</span>
          </div>
        )}
        {m.status === "live" && (
          <span style={{ fontSize: 12.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
            {pred ? <>Your pick <b style={{ color: "var(--text)" }} className="mono">{pred[0]}–{pred[1]}</b> · points settle at full-time</>
                  : <span style={{ color: "var(--danger)" }}>No prediction — locked at kickoff</span>}
          </span>
        )}
        {m.status === "locked" && (
          <span style={{ fontSize: 12.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="lock" size={13} />Predictions closed · kickoff {clockOf(m.date)}
          </span>
        )}
      </div>
    </div>
  );
}

/* compact match line for dashboard / snapshots */
function MiniMatch({ m, pred, onClick }) {
  const h = WC.teams[m.home], a = WC.teams[m.away];
  const live = m.status === "live", done = m.status === "completed";
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
      padding: "12px 14px", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", gap: 12,
      color: "var(--text)", transition: "background .12s",
    }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
      <div style={{ width: 54, flex: "none", display: "flex", flexDirection: "column", gap: 2 }}>
        {live ? <span className="pill pill-live" style={{ padding: "2px 6px" }}><span className="dot"></span>{m.min}'</span>
              : <span className="mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>{done ? "FT" : clockOf(m.date)}</span>}
        <span className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>GRP {m.group}</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <Row team={h} score={done || live ? m.res[0] : null} />
        <Row team={a} score={done || live ? m.res[1] : null} />
      </div>
      <div style={{ flex: "none", textAlign: "right" }}>
        {pred ? <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-dim)" }}>{pred[0]}–{pred[1]}</span>
              : (m.status === "scheduled" ? <span className="chip" style={{ fontSize: 10.5, color: "var(--accent)", borderColor: "var(--accent)" }}>Predict</span>
                 : <span className="mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>—</span>)}
        <div className="mono" style={{ fontSize: 9.5, color: "var(--text-mute)", marginTop: 3, letterSpacing: ".06em" }}>{pred ? "YOUR PICK" : ""}</div>
      </div>
    </button>
  );
}
function Row({ team, score }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <Flag iso={team.iso} size={18} round={3} />
      <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{team.name}</span>
      {score != null && <span className="mono" style={{ fontSize: 15, fontWeight: 800 }}>{score}</span>}
    </div>
  );
}

Object.assign(window, { Scoreboard, MatchCard, MiniMatch, bigScore });
