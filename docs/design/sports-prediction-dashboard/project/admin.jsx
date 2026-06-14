/* ============================================================
   MySCORE WC2026 — Admin panel
   ============================================================ */
function Modal({ title, onClose, children, footer, width = 440 }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "grid", placeItems: "center", padding: 20,
      background: "color-mix(in oklab, #000 55%, transparent)", backdropFilter: "blur(3px)", animation: "fadeIn .2s ease" }}
      onClick={onClose}>
      <div className="card" style={{ width, maxWidth: "100%", maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="card-head">
          <span className="card-title">{title}</span>
          <button className="card-link" onClick={onClose} style={{ marginLeft: "auto" }}><Icon name="x" size={18} /></button>
        </div>
        <div className="card-pad">{children}</div>
        {footer && <div style={{ padding: "14px 18px", borderTop: "1px solid var(--line)", display: "flex", gap: 10, justifyContent: "flex-end" }}>{footer}</div>}
      </div>
    </div>
  );
}

function ResultModal({ m, onClose, onPublish }) {
  const [r, setR] = React.useState(m.res ? [...m.res] : [0, 0]);
  return (
    <Modal title="Enter final result" onClose={onClose} width={460} footer={
      <>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onPublish(m.id, r)}><Icon name="whistle" size={16} />Publish result</button>
      </>
    }>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: "var(--text-dim)" }}>
        <span className="chip">Group {m.group}</span><span className="mono">{dayShort(m.date)} · {clockOf(m.date)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
        <Scoreboard m={m} flagSize={34} center={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Stepper value={r[0]} onChange={(v) => setR([v, r[1]])} />
            <span style={{ color: "var(--text-mute)", fontWeight: 800 }}>:</span>
            <Stepper value={r[1]} onChange={(v) => setR([r[0], v])} />
          </div>} />
      </div>
      <div style={{ fontSize: 12, color: "var(--text-mute)", textAlign: "center", marginTop: 14 }}>
        Publishing recalculates every player's points and the leaderboard instantly.
      </div>
    </Modal>
  );
}

function AdminScreen({ rules, setRules, publishResult }) {
  const [tab, setTab] = React.useState("matches");
  const toast = useToast();

  const tabs = [["matches", "Matches", "matches"], ["teams", "Teams", "trophy"], ["users", "Users", "user"], ["scoring", "Scoring", "settings2"]];

  return (
    <div className="stagger">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 7 }}>Tournament control · FIFA World Cup 2026</div>
          <h1 style={{ fontSize: 30 }}>Admin</h1>
        </div>
        <span className="chip" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}><Icon name="lock" size={13} />Administrator access</span>
      </div>

      <div className="seg" style={{ marginBottom: 18 }}>
        {tabs.map(([k, l, ic]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Icon name={ic} size={15} />{l}
          </button>
        ))}
      </div>

      {tab === "matches" && <AdminMatches publishResult={publishResult} />}
      {tab === "teams" && <AdminTeams toast={toast} />}
      {tab === "users" && <AdminUsers toast={toast} />}
      {tab === "scoring" && <AdminScoring rules={rules} setRules={setRules} toast={toast} />}
    </div>
  );
}

function AdminMatches({ publishResult }) {
  const [modal, setModal] = React.useState(null);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="card-head"><Icon name="matches" size={17} style={{ color: "var(--accent)" }} /><span className="card-title">Match management</span>
        <button className="btn btn-sm btn-primary card-link" style={{ marginLeft: "auto" }}><Icon name="plus" size={15} />New match</button>
      </div>
      <table className="tbl">
        <thead><tr><th>Fixture</th><th className="hide-mobile">Kickoff</th><th>Status</th><th style={{ textAlign: "center" }}>Score</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
        <tbody>
          {WC.matches.map((m) => {
            const h = WC.teams[m.home], a = WC.teams[m.away];
            return (
              <tr key={m.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Flag iso={h.iso} size={18} round={3} /><span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{h.fifa}</span>
                    <span style={{ color: "var(--text-mute)", fontSize: 11 }}>v</span>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{a.fifa}</span><Flag iso={a.iso} size={18} round={3} />
                    <span className="chip hide-mobile" style={{ fontSize: 10, padding: "1px 7px", marginLeft: 4 }}>{m.group}</span>
                  </div>
                </td>
                <td className="hide-mobile mono" style={{ fontSize: 12, color: "var(--text-dim)" }}>{dayShort(m.date)} · {clockOf(m.date)}</td>
                <td><StatusPill status={m.status} /></td>
                <td style={{ textAlign: "center" }} className="mono">{m.res ? <b>{m.res[0]}–{m.res[1]}</b> : "—"}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-sm" onClick={() => setModal(m)} style={{ gap: 5 }}>
                    <Icon name={m.status === "completed" ? "edit" : "whistle"} size={14} />{m.status === "completed" ? "Edit" : "Result"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {modal && <ResultModal m={modal} onClose={() => setModal(null)} onPublish={(id, r) => { publishResult(id, r); setModal(null); }} />}
    </div>
  );
}

function AdminTeams({ toast }) {
  const [teams, setTeams] = React.useState(Object.entries(WC.teams).map(([id, t]) => ({ id, ...t })));
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="card-head"><Icon name="trophy" size={17} style={{ color: "var(--accent)" }} /><span className="card-title">Teams · {teams.length}</span>
        <button className="btn btn-sm btn-primary" style={{ marginLeft: "auto" }} onClick={() => toast("Team editor opened", { icon: "plus" })}><Icon name="plus" size={15} />Add team</button>
      </div>
      <table className="tbl">
        <thead><tr><th>Team</th><th>FIFA</th><th>Group</th><th style={{ textAlign: "right" }}>Manage</th></tr></thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id}>
              <td><div style={{ display: "flex", alignItems: "center", gap: 11 }}><Flag iso={t.iso} size={22} round={4} /><span style={{ fontWeight: 700 }}>{t.name}</span></div></td>
              <td className="mono" style={{ fontWeight: 700, color: "var(--text-dim)" }}>{t.fifa}</td>
              <td><span className="chip" style={{ fontSize: 11 }}>Group {t.group}</span></td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: 6 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => toast("Editing " + t.name, { icon: "edit" })}><Icon name="edit" size={14} /></button>
                  <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }}
                    onClick={() => { setTeams(teams.filter((x) => x.id !== t.id)); toast(t.name + " removed", { icon: "trash", color: "var(--danger)" }); }}><Icon name="trash" size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminUsers({ toast }) {
  const [users, setUsers] = React.useState(WC.users.map((u) => ({ ...u, status: "active" })));
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="card-head"><Icon name="user" size={17} style={{ color: "var(--accent)" }} /><span className="card-title">Users · {users.length}</span>
        <button className="btn btn-sm btn-primary" style={{ marginLeft: "auto" }} onClick={() => toast("Invite sent", { icon: "plus" })}><Icon name="plus" size={15} />Create user</button>
      </div>
      <table className="tbl">
        <thead><tr><th>Player</th><th className="hide-mobile">Role</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td><div style={{ display: "flex", alignItems: "center", gap: 11 }}><Avatar user={u} size={30} />
                <div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{u.name}</div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--text-mute)" }}>{u.name.toLowerCase().replace(" ", ".")}@company.com</div></div></div></td>
              <td className="hide-mobile"><span className="chip" style={{ fontSize: 11 }}>{u.role === "admin" ? "Admin" : "Player"}</span></td>
              <td>{u.status === "active" ? <span className="pill" style={{ background: "color-mix(in oklab, var(--live) 16%, transparent)", color: "var(--live)" }}>Active</span>
                : <span className="pill pill-done">Disabled</span>}</td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: 6 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => toast("Reset link sent to " + u.name, { icon: "bell", color: "var(--info)" })}>Reset</button>
                  <button className="btn btn-sm btn-ghost" style={{ color: u.status === "active" ? "var(--danger)" : "var(--live)" }}
                    onClick={() => { setUsers(users.map((x) => x.id === u.id ? { ...x, status: x.status === "active" ? "disabled" : "active" } : x)); toast((u.status === "active" ? "Disabled " : "Enabled ") + u.name, { icon: u.status === "active" ? "lock" : "check" }); }}>
                    {u.status === "active" ? "Disable" : "Enable"}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminScoring({ rules, setRules, toast }) {
  const [d, setD] = React.useState({ ...rules });
  const dirty = JSON.stringify(d) !== JSON.stringify(rules);
  const field = (key, label, sub) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 2 }}>{sub}</div>
      </div>
      <Stepper value={d[key]} onChange={(v) => setD({ ...d, [key]: v })} />
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }} className="dash-cols">
      <Card title="Scoring rules" icon="settings2">
        {field("exact", "Exact score", "Awarded when the predicted scoreline matches exactly")}
        {field("result", "Correct result", "Right winner or draw, wrong scoreline")}
        {field("incorrect", "Incorrect", "Wrong outcome entirely")}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0 4px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Lock period</div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 2 }}>Minutes before kickoff that predictions close</div>
          </div>
          <Stepper value={d.lockMinutes} onChange={(v) => setD({ ...d, lockMinutes: v })} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" disabled={!dirty} onClick={() => setD({ ...rules })}>Reset</button>
          <button className="btn btn-primary" disabled={!dirty} onClick={() => { setRules({ ...d }); toast("Scoring rules updated — points recalculated", { icon: "check", color: "var(--live)" }); }}>Save rules</button>
        </div>
      </Card>
      <Card title="Preview" icon="target">
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>Example: you predicted <b className="mono" style={{ color: "var(--text)" }}>2–1</b></div>
        {[["Actual 2–1", "Exact score", d.exact, "pts-5"], ["Actual 3–1", "Correct result", d.result, "pts-3"], ["Actual 0–2", "Incorrect", d.incorrect, "pts-0"]].map(([res, lbl, pts, cls]) => (
          <div key={res} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--line)" }}>
            <span className="mono" style={{ fontSize: 13, width: 78, color: "var(--text-dim)" }}>{res}</span>
            <span style={{ flex: 1, fontWeight: 700, fontSize: 13.5 }}>{lbl}</span>
            <span className={"tag-pts " + cls}>+{pts} pts</span>
          </div>
        ))}
        <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 14 }}>Single-tournament rules apply to FIFA World Cup 2026. Future tournaments inherit these defaults.</div>
      </Card>
    </div>
  );
}

Object.assign(window, { AdminScreen, Modal });
