/* ============================================================
   MySCORE WC2026 — Dashboard screen
   ============================================================ */
function StatTile({ icon, label, value, sub, accent, delta }) {
  return (
    <div className="stat fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center",
          background: accent ? "color-mix(in oklab, var(--accent) 18%, transparent)" : "var(--bg-2)",
          color: accent ? "var(--accent)" : "var(--text-dim)" }}>
          <Icon name={icon} size={18} />
        </div>
        {delta != null && delta !== 0 && (
          <span className={delta > 0 ? "delta-up" : "delta-down"} style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12.5, fontWeight: 800 }}>
            <Icon name={delta > 0 ? "arrowUp" : "arrowDown"} size={13} />{Math.abs(delta)}
          </span>
        )}
      </div>
      <div className="stat-val tnum" style={{ marginTop: 12 }}>{value}</div>
      <div className="stat-label">{label}{sub && <span style={{ color: "var(--text-mute)" }}> · {sub}</span>}</div>
    </div>
  );
}

function NotifItem({ icon, color, title, time }) {
  return (
    <div style={{ display: "flex", gap: 11, padding: "11px 14px", alignItems: "flex-start" }}>
      <div style={{ width: 30, height: 30, flex: "none", borderRadius: 9, display: "grid", placeItems: "center",
        background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}>
        <Icon name={icon} size={15} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--text-mute)", marginTop: 3, letterSpacing: ".05em" }}>{time}</div>
      </div>
    </div>
  );
}

function Dashboard({ preds, savePred, go }) {
  const meRow = WC.board.find((b) => b.id === "u1");
  const rank = WC.board.findIndex((b) => b.id === "u1") + 1;
  const delta = meRow.prev - rank;

  const live = WC.matches.filter((m) => m.status === "live");
  const upcoming = WC.matches.filter((m) => m.status === "scheduled").sort((a, b) => new Date(a.date) - new Date(b.date));
  const needPred = upcoming.filter((m) => !preds[m.id]);
  const soon = upcoming.filter((m) => (new Date(m.date) - WC.NOW) < 1000 * 60 * 60 * 30);

  const top = WC.board.slice(0, 6);

  return (
    <div className="stagger">
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 7 }}>Matchday 3 · {dayLong(WC.NOW)}</div>
          <h1 style={{ fontSize: 30, whiteSpace: "nowrap" }}>Welcome back, Alex</h1>
        </div>
        <button className="btn btn-primary" onClick={() => go("matches")}><Icon name="target" size={17} />{needPred.length} matches to predict</button>
      </div>

      {/* stat tiles */}
      <div className="grid-stats" style={{ marginBottom: 16 }}>
        <StatTile icon="leaderboard" label="Your rank" value={"#" + rank} sub={WC.board.length + " players"} accent delta={delta} />
        <StatTile icon="bolt" label="Total points" value={meRow.pts} sub="this tournament" />
        <StatTile icon="target" label="Exact scores" value={meRow.exact} sub="5 pts each" />
        <StatTile icon="check" label="Predictions" value={Object.keys(preds).length} sub={"of " + WC.matches.length + " matches"} />
      </div>

      {/* live hero */}
      {live.map((m) => {
        const pred = preds[m.id];
        const pts = null;
        return (
          <div key={m.id} className="card fade-in" style={{ marginBottom: 16, position: "relative", overflow: "hidden", background: "var(--field-grad)" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 100% at 50% 0, color-mix(in oklab, var(--live) 12%, transparent), transparent)" }}></div>
            <div style={{ position: "relative", padding: "16px 20px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className="pill pill-live"><span className="dot"></span>Live · {m.min}'</span>
                <span className="mono hide-mobile" style={{ fontSize: 11.5, color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 360 }}>Group {m.group} · {WC.venues[m.venue]}</span>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => go("matches")}>Match centre<Icon name="chevR" size={14} /></button>
              </div>
              <div style={{ padding: "8px 0 4px" }}>
                <Scoreboard m={m} flagSize={42} center={
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="score-big" style={{ fontSize: 46 }}>{m.res[0]}</span>
                      <span className="score-big" style={{ fontSize: 30, color: "var(--text-mute)" }}>:</span>
                      <span className="score-big" style={{ fontSize: 46 }}>{m.res[1]}</span>
                    </div>
                  </div>} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
                  {pred ? <>Your pick <b className="mono" style={{ color: "var(--text)" }}>{pred[0]}–{pred[1]}</b> · settles at full-time</> : "You didn't predict this match"}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, alignItems: "start" }} className="dash-cols">
        {/* left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="Predictions closing soon" icon="clock" link="All matches" onLink={() => go("matches")} pad={false}>
            <div style={{ padding: 6 }}>
              {soon.length ? soon.slice(0, 5).map((m) => <MiniMatch key={m.id} m={m} pred={preds[m.id]} onClick={() => go("matches")} />)
                : <div style={{ padding: 24, textAlign: "center", color: "var(--text-mute)", fontSize: 13 }}>You're all caught up.</div>}
            </div>
          </Card>

          <Card title="Recent results" icon="whistle" link="My predictions" onLink={() => go("predictions")} pad={false}>
            <div style={{ padding: 6 }}>
              {WC.matches.filter((m) => m.status === "completed").slice(-4).reverse().map((m) => (
                <MiniMatch key={m.id} m={m} pred={preds[m.id]} onClick={() => go("predictions")} />
              ))}
            </div>
          </Card>
        </div>

        {/* right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="Leaderboard" icon="trophy" link="Full board" onLink={() => go("leaderboard")} pad={false}>
            <div style={{ padding: "6px 6px 10px" }}>
              {top.map((b, i) => {
                const u = WC.userById(b.id), me = b.id === "u1";
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 12px", borderRadius: 8,
                    background: me ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "transparent" }}>
                    {i < 3 ? <span className={"rank-medal rank-" + (i + 1)}>{i + 1}</span>
                           : <span className="mono" style={{ width: 26, textAlign: "center", color: "var(--text-mute)", fontWeight: 700 }}>{i + 1}</span>}
                    <Avatar user={u} size={28} />
                    <span style={{ fontWeight: 700, fontSize: 13.5, flex: 1 }}>{me ? "You" : u.name}</span>
                    <span className="mono" style={{ fontWeight: 800, fontSize: 14 }}>{b.pts}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Activity" icon="bell" pad={false}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <NotifItem icon="clock" color="var(--accent)" title={<>{soon.length} predictions lock in the next 30 hours</>} time="Just now" />
              <div className="divider" style={{ margin: "0 14px" }}></div>
              <NotifItem icon="whistle" color="var(--info)" title={<>Result in — <b>USA 2–2 Germany</b>. You earned +3 pts.</>} time="2h ago" />
              <div className="divider" style={{ margin: "0 14px" }}></div>
              <NotifItem icon="arrowUp" color="var(--live)" title={<>You climbed <b>2 spots</b> to #{rank} on the leaderboard.</>} time="2h ago" />
              <div className="divider" style={{ margin: "0 14px" }}></div>
              <NotifItem icon="target" color="var(--accent)" title={<>Exact score! <b>England 2–0 Ecuador</b> · +5 pts.</>} time="Yesterday" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
