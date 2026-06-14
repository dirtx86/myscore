/* ============================================================
   MySCORE WC2026 — My Predictions screen
   ============================================================ */
function MyPredictions({ preds, go }) {
  const [tab, setTab] = React.useState("all");

  const rows = WC.matches
    .filter((m) => preds[m.id])
    .map((m) => {
      const pred = preds[m.id];
      const pts = m.status === "completed" ? WC.computePoints(pred, m.res, WC.scoreRules) : null;
      return { m, pred, pts };
    })
    .sort((a, b) => new Date(b.m.date) - new Date(a.m.date));

  const settled = rows.filter((r) => r.m.status === "completed");
  const totalPts = settled.reduce((s, r) => s + r.pts, 0);
  const exact = settled.filter((r) => r.pts >= 5).length;
  const correct = settled.filter((r) => r.pts === 3).length;
  const acc = settled.length ? Math.round(((exact + correct) / settled.length) * 100) : 0;

  const view = rows.filter((r) => {
    if (tab === "settled") return r.m.status === "completed";
    if (tab === "pending") return r.m.status !== "completed";
    if (tab === "exact") return r.pts >= 5;
    return true;
  });

  return (
    <div className="stagger">
      <div style={{ marginBottom: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 7 }}>Your tournament card</div>
        <h1 style={{ fontSize: 30 }}>My Predictions</h1>
      </div>

      <div className="grid-stats" style={{ marginBottom: 18 }}>
        <StatTile icon="bolt" label="Points from picks" value={totalPts} accent />
        <StatTile icon="target" label="Exact scores" value={exact} sub="+5 each" />
        <StatTile icon="check" label="Correct results" value={correct} sub="+3 each" />
        <StatTile icon="stats" label="Hit rate" value={acc + "%"} sub={settled.length + " settled"} />
      </div>

      <div className="seg" style={{ marginBottom: 16 }}>
        {[["all", "All"], ["settled", "Settled"], ["pending", "Pending"], ["exact", "Exact hits"]].map(([k, l]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Match</th>
              <th style={{ textAlign: "center" }}>Your pick</th>
              <th style={{ textAlign: "center" }}>Result</th>
              <th style={{ textAlign: "right" }}>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {view.map(({ m, pred, pts }) => {
              const h = WC.teams[m.home], a = WC.teams[m.away];
              return (
                <tr key={m.id} style={{ cursor: "pointer" }} onClick={() => go("matches")}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                        <Flag iso={h.iso} size={20} round={3} />
                        <span style={{ fontWeight: 700, fontSize: 13.5 }} className="hide-mobile">{h.name}</span>
                        <span className="mono" style={{ fontWeight: 700, fontSize: 12, color: "var(--text-dim)" }}>{h.fifa}</span>
                      </div>
                      <span style={{ color: "var(--text-mute)", fontSize: 12 }}>v</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                        <span className="mono" style={{ fontWeight: 700, fontSize: 12, color: "var(--text-dim)" }}>{a.fifa}</span>
                        <span style={{ fontWeight: 700, fontSize: 13.5 }} className="hide-mobile">{a.name}</span>
                        <Flag iso={a.iso} size={20} round={3} />
                      </div>
                      <span className="mono hide-mobile" style={{ fontSize: 10.5, color: "var(--text-mute)", marginLeft: 6 }}>· GRP {m.group} · {dayShort(m.date)}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="mono" style={{ fontWeight: 800, fontSize: 15 }}>{pred[0]}–{pred[1]}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {m.status === "completed" ? <span className="mono" style={{ fontWeight: 800, fontSize: 15 }}>{m.res[0]}–{m.res[1]}</span>
                      : m.status === "live" ? <span className="pill pill-live"><span className="dot"></span>{m.res[0]}–{m.res[1]} {m.min}'</span>
                      : <span className="mono" style={{ color: "var(--text-mute)" }}>—</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {m.status === "completed" ? <PtsTag pts={pts} />
                      : <StatusPill status={m.status} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {view.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--text-mute)", fontSize: 13 }}>Nothing here yet.</div>}
      </div>
    </div>
  );
}

Object.assign(window, { MyPredictions });
