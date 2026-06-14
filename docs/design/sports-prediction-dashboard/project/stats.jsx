/* ============================================================
   MySCORE WC2026 — Statistics screen
   ============================================================ */
function AwardCard({ icon, tag, user, value, sub, color }) {
  return (
    <div className="card card-pad fade-in" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -18, top: -18, width: 90, height: 90, borderRadius: "50%",
        background: `radial-gradient(circle, color-mix(in oklab, ${color} 22%, transparent), transparent 70%)` }}></div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center",
          background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}><Icon name={icon} size={16} /></div>
        <span className="eyebrow" style={{ color }}>{tag}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
        {user && <Avatar user={user} size={42} />}
        <div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{user ? (user.id === "u1" ? "You" : user.name) : value}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 2 }}>{sub}</div>
        </div>
        {user && <div className="mono" style={{ marginLeft: "auto", fontWeight: 800, fontSize: 28, color }}>{value}</div>}
      </div>
    </div>
  );
}

function BarChart({ data, max, unit }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 180, padding: "10px 4px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
          <span className="mono" style={{ fontSize: 13, fontWeight: 800 }}>{d.v}</span>
          <div style={{ width: "100%", maxWidth: 60, height: `${(d.v / max) * 100}%`, borderRadius: "8px 8px 0 0",
            background: d.hot ? "linear-gradient(180deg, var(--accent), var(--accent-2))" : "var(--bg-3)",
            transition: "height .5s cubic-bezier(.2,.8,.2,1)" }}></div>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--text-mute)", letterSpacing: ".05em" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function ConsensusBar({ label, pct, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span className="mono" style={{ fontWeight: 800, color }}>{pct}%</span>
      </div>
      <div style={{ height: 9, borderRadius: 5, background: "var(--bg-3)", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 5, transition: "width .5s" }}></div>
      </div>
    </div>
  );
}

function Statistics({ go }) {
  const u = WC.userById;
  const sharp = [...WC.board].sort((a, b) => b.exact - a.exact).slice(0, 5);
  const active = [...WC.board].sort((a, b) => b.played - a.played).slice(0, 5);

  return (
    <div className="stagger">
      <div style={{ marginBottom: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 7 }}>The office, by the numbers</div>
        <h1 style={{ fontSize: 30 }}>Statistics</h1>
      </div>

      {/* award cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 16 }}>
        <AwardCard icon="target" tag="Sharpest eye" color="var(--live)" user={u("u3")} value="5" sub="exact scorelines nailed" />
        <AwardCard icon="check" tag="Most committed" color="var(--info)" user={u("u6")} value="14" sub="of 14 matches predicted" />
        <AwardCard icon="bolt" tag="Highest-scoring round" color="var(--accent)" value="Matchday 2" sub="92 pts shared across the office · avg 7.7 per player" />
        <AwardCard icon="flame" tag="Biggest upset called" color="var(--danger)" value="SEN 1–0 KOR" sub="Only 2 players backed Senegal — Marcus & Lena banked +3" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }} className="dash-cols">
        <Card title="Points by matchday" icon="stats">
          <BarChart max={100} data={[
            { label: "MD1", v: 78 }, { label: "MD2", v: 92, hot: true }, { label: "MD3", v: 41 },
          ]} />
          <div style={{ fontSize: 12, color: "var(--text-mute)", textAlign: "center", marginTop: 4 }}>Total office points scored per matchday · MD3 still in progress</div>
        </Card>

        <Card title="Office consensus" icon="whistle">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Flag iso={WC.teams.bra.iso} size={22} round={4} />
            <span style={{ fontWeight: 800, fontSize: 14 }}>Brazil</span>
            <span className="mono" style={{ color: "var(--text-mute)", fontSize: 12 }}>vs</span>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Japan</span>
            <Flag iso={WC.teams.jpn.iso} size={22} round={4} />
            <span className="pill pill-locked" style={{ marginLeft: "auto" }}><Icon name="lock" size={11} />Locked</span>
          </div>
          <ConsensusBar label="Brazil win" pct={68} color="var(--live)" />
          <ConsensusBar label="Draw" pct={21} color="var(--accent)" />
          <ConsensusBar label="Japan win" pct={11} color="var(--info)" />
          <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 8 }}>Based on 19 predictions submitted before lock.</div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-cols">
        <Card title="Sharpshooters" icon="target" link="Leaderboard" onLink={() => go("leaderboard")} pad={false}>
          <RankList rows={sharp} metric="exact" suffix="exact" />
        </Card>
        <Card title="Most predictions made" icon="check" pad={false}>
          <RankList rows={active} metric="played" suffix="picks" />
        </Card>
      </div>
    </div>
  );
}

function RankList({ rows, metric, suffix }) {
  const max = Math.max(...rows.map((r) => r[metric]));
  return (
    <div style={{ padding: "8px 10px 12px" }}>
      {rows.map((b, i) => {
        const user = WC.userById(b.id), me = b.id === "u1";
        return (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 8px" }}>
            <span className="mono" style={{ width: 18, color: "var(--text-mute)", fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
            <Avatar user={user} size={28} />
            <span style={{ fontWeight: 700, fontSize: 13.5, width: 120 }}>{me ? "You" : user.name}</span>
            <div style={{ flex: 1, height: 7, background: "var(--bg-3)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: (b[metric] / max) * 100 + "%", height: "100%", background: me ? "var(--accent)" : "var(--text-mute)", borderRadius: 4 }}></div>
            </div>
            <span className="mono" style={{ fontWeight: 800, fontSize: 13.5, width: 64, textAlign: "right" }}>{b[metric]} {suffix}</span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { Statistics, AwardCard, BarChart });
