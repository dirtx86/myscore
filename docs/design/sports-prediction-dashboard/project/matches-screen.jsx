/* ============================================================
   MySCORE WC2026 — Matches screen (list + inline prediction)
   ============================================================ */
function MatchesScreen({ preds, savePred, go }) {
  const [grp, setGrp] = React.useState("all");
  const [tab, setTab] = React.useState("all");
  const [q, setQ] = React.useState("");

  const filtered = WC.matches.filter((m) => {
    if (grp !== "all" && m.group !== grp) return false;
    if (tab === "predict" && m.status !== "scheduled") return false;
    if (tab === "live" && m.status !== "live") return false;
    if (tab === "done" && m.status !== "completed") return false;
    if (tab === "open" && !["scheduled", "live", "locked"].includes(m.status)) return false;
    if (q) {
      const s = (WC.teams[m.home].name + WC.teams[m.away].name + WC.teams[m.home].fifa + WC.teams[m.away].fifa).toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  // group by day
  const byDay = {};
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((m) => {
    const k = dayLong(m.date);
    (byDay[k] = byDay[k] || []).push(m);
  });

  const counts = {
    all: WC.matches.length,
    predict: WC.matches.filter((m) => m.status === "scheduled").length,
    live: WC.matches.filter((m) => m.status === "live").length,
    done: WC.matches.filter((m) => m.status === "completed").length,
  };
  const needPred = WC.matches.filter((m) => m.status === "scheduled" && !preds[m.id]).length;

  return (
    <div className="stagger">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 7 }}>FIFA World Cup 2026 · Group stage</div>
          <h1 style={{ fontSize: 30 }}>Matches</h1>
        </div>
        {needPred > 0 && <div className="chip" style={{ background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)", borderColor: "transparent", fontSize: 13, padding: "7px 13px" }}>
          <Icon name="target" size={14} />{needPred} open predictions
        </div>}
      </div>

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div className="seg">
          {[["all", "All"], ["predict", "To predict"], ["live", "Live"], ["done", "Results"]].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}{counts[k] != null && <span style={{ opacity: .5, marginLeft: 5 }}>{counts[k]}</span>}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", ...WC.groups].map((g) => (
            <button key={g} className={"chip" + (grp === g ? " sel" : "")} style={{ cursor: "pointer" }} onClick={() => setGrp(g)}>
              {g === "all" ? "All groups" : "Group " + g}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <Icon name="search" size={16} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-mute)" }} />
          <input className="input" placeholder="Search teams…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 200, paddingLeft: 34 }} />
        </div>
      </div>

      {/* list grouped by day */}
      {Object.keys(byDay).length === 0 && (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--text-mute)", padding: 50 }}>No matches match your filters.</div>
      )}
      {Object.entries(byDay).map(([day, ms]) => (
        <div key={day} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span className="eyebrow" style={{ color: "var(--text-dim)" }}>{day}</span>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }}></span>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>{ms.length} {ms.length === 1 ? "match" : "matches"}</span>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {ms.map((m) => <MatchCard key={m.id} m={m} pred={preds[m.id]} onSave={savePred} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { MatchesScreen });
