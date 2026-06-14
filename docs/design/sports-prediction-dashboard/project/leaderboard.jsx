/* ============================================================
   MySCORE WC2026 — Leaderboard screen
   ============================================================ */
function Podium({ rows }) {
  const order = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = { 0: 116, 1: 88, 2: 70 };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, alignItems: "end", marginBottom: 8 }} className="hide-mobile">
      {order.map((idx) => {
        const b = rows[idx]; if (!b) return <div key={idx}></div>;
        const u = WC.userById(b.id), me = b.id === "u1";
        return (
          <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <Avatar user={u} size={idx === 0 ? 58 : 48} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{me ? "You" : u.name}</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}>{b.exact} exact · {b.correct} correct</div>
            </div>
            <div style={{
              width: "100%", height: heights[idx], borderRadius: "12px 12px 0 0",
              background: idx === 0 ? "linear-gradient(180deg, color-mix(in oklab, var(--accent) 35%, var(--bg-2)), var(--bg-2))" : "var(--bg-2)",
              border: "1px solid var(--line)", borderBottom: "none",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, position: "relative",
            }}>
              <span className={"rank-medal rank-" + (idx + 1)} style={{ width: 32, height: 32, fontSize: 16, position: "absolute", top: -13 }}>{idx + 1}</span>
              <span className="score-big" style={{ fontSize: 30, color: idx === 0 ? "var(--accent)" : "var(--text)" }}>{b.pts}</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".1em" }}>POINTS</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Leaderboard({ go }) {
  const [sort, setSort] = React.useState("pts");
  const rows = [...WC.board].sort((a, b) => {
    if (sort === "exact") return b.exact - a.exact || b.pts - a.pts;
    if (sort === "correct") return b.correct - a.correct || b.pts - a.pts;
    return b.pts - a.pts;
  });
  const ranked = rows.map((b, i) => ({ ...b, rank: i + 1 }));

  return (
    <div className="stagger">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 7 }}>Office standings · live</div>
          <h1 style={{ fontSize: 30 }}>Leaderboard</h1>
        </div>
        <div className="seg">
          {[["pts", "Points"], ["exact", "Exact"], ["correct", "Correct"]].map(([k, l]) => (
            <button key={k} className={sort === k ? "on" : ""} onClick={() => setSort(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16, paddingBottom: 0, background: "var(--field-grad)" }}>
        <Podium rows={[...WC.board].sort((a, b) => b.pts - a.pts).slice(0, 3)} />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 56 }}>Rank</th>
              <th>Player</th>
              <th style={{ textAlign: "right" }}>Pts</th>
              <th style={{ textAlign: "right" }} className="hide-mobile">Exact</th>
              <th style={{ textAlign: "right" }} className="hide-mobile">Correct</th>
              <th style={{ textAlign: "right" }} className="hide-mobile">Played</th>
              <th style={{ textAlign: "right" }} className="hide-mobile">Hit %</th>
              <th style={{ textAlign: "center", width: 52 }}>+/–</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((b) => {
              const u = WC.userById(b.id), me = b.id === "u1";
              const delta = b.prev - b.rank;
              const hit = Math.round(((b.exact + b.correct) / b.played) * 100);
              return (
                <tr key={b.id} className={me ? "me" : ""}>
                  <td>
                    {b.rank <= 3 ? <span className={"rank-medal rank-" + b.rank}>{b.rank}</span>
                      : <span className="mono" style={{ fontWeight: 800, color: "var(--text-dim)", paddingLeft: 7 }}>{b.rank}</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <Avatar user={u} size={32} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{me ? "You" : u.name} {u.role === "admin" && <span className="chip" style={{ fontSize: 9.5, padding: "1px 6px", marginLeft: 4 }}>ADMIN</span>}</div>
                        <div className="mono hide-mobile" style={{ fontSize: 10.5, color: "var(--text-mute)" }}>{b.exact} exact · {b.correct} correct</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}><span className="mono" style={{ fontWeight: 800, fontSize: 16 }}>{b.pts}</span></td>
                  <td style={{ textAlign: "right" }} className="hide-mobile mono">{b.exact}</td>
                  <td style={{ textAlign: "right" }} className="hide-mobile mono">{b.correct}</td>
                  <td className="hide-mobile mono" style={{ textAlign: "right", color: "var(--text-dim)" }}>{b.played}</td>
                  <td style={{ textAlign: "right" }} className="hide-mobile">
                    <span className="mono" style={{ fontWeight: 700 }}>{hit}%</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {delta === 0 ? <Icon name="dash2" size={14} style={{ color: "var(--text-mute)" }} />
                      : <span className={delta > 0 ? "delta-up" : "delta-down"} style={{ display: "inline-flex", alignItems: "center", fontWeight: 800, fontSize: 12.5 }}>
                          <Icon name={delta > 0 ? "arrowUp" : "arrowDown"} size={12} />{Math.abs(delta)}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { Leaderboard, Podium });
