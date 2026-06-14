/* ============================================================
   MySCORE WC2026 — Login screen
   ============================================================ */
function Login({ onLogin }) {
  const [email, setEmail] = React.useState("alex.rivera@company.com");
  const [pw, setPw] = React.useState("worldcup26");
  const [loading, setLoading] = React.useState(false);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(onLogin, 650);
  };
  const flagStrip = ["br", "ar", "de", "gb-eng", "nl", "jp", "us", "mx", "ma", "sn", "hr", "be"];
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.05fr 0.95fr" }} className="login-wrap">
      {/* brand panel */}
      <div style={{ position: "relative", overflow: "hidden", background: "var(--field-grad)", borderRight: "1px solid var(--line)",
        display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 52px" }} className="login-brand hide-mobile">
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 60% at 80% 10%, color-mix(in oklab, var(--accent) 14%, transparent), transparent)" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: 13, position: "relative" }}>
          <div className="brand-mark" style={{ width: 46, height: 46 }}><Icon name="trophy" size={24} fill /></div>
          <div>
            <div className="brand-name" style={{ fontSize: 19 }}>MySCORE</div>
            <div className="brand-sub">World Cup 2026</div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Office prediction league</div>
          <h1 className="display" style={{ fontSize: 52, lineHeight: 1.02, maxWidth: 480 }}>
            Call the scores.<br />Climb the <span style={{ color: "var(--accent)" }}>board.</span>
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: 15.5, maxWidth: 420, marginTop: 18, lineHeight: 1.6 }}>
            Predict every fixture of the FIFA World Cup 2026, bank points for exact scores and correct results, and settle who really knows football across the company.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
            {flagStrip.map((c) => <Flag key={c} iso={c} size={22} round={4} />)}
            <span className="mono" style={{ fontSize: 11, color: "var(--text-mute)", alignSelf: "center", marginLeft: 4 }}>+36 nations</span>
          </div>
          <div style={{ display: "flex", gap: 26 }}>
            <Stat n="5" l="pts · exact score" />
            <Stat n="3" l="pts · correct result" />
            <Stat n="48" l="teams · 12 groups" />
          </div>
        </div>
      </div>

      {/* form */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
        <div style={{ width: "100%", maxWidth: 360 }} className="fade-in">
          <div className="login-mobilebrand" style={{ display: "none", alignItems: "center", gap: 11, marginBottom: 28 }}>
            <div className="brand-mark"><Icon name="trophy" size={20} fill /></div>
            <div><div className="brand-name">MySCORE</div><div className="brand-sub">World Cup 2026</div></div>
          </div>
          <h2 style={{ fontSize: 24 }}>Sign in</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 6, marginBottom: 26 }}>Welcome back — your predictions are waiting.</p>
          <form onSubmit={submit}>
            <label className="label">Work email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 16 }} />
            <label className="label">Password</label>
            <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={{ marginBottom: 10 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-dim)", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} />Remember me
              </label>
              <button type="button" className="card-link" style={{ fontSize: 13 }}>Forgot password?</button>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Signing in…" : <>Sign in<Icon name="chevR" size={17} /></>}
            </button>
          </form>
          <div style={{ marginTop: 22, padding: "12px 14px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", fontSize: 12.5, color: "var(--text-dim)" }}>
            <b style={{ color: "var(--text)" }}>Demo</b> · credentials are pre-filled. Just press <b style={{ color: "var(--accent)" }}>Sign in</b>.
          </div>
        </div>
      </div>
    </div>
  );
}
function Stat({ n, l }) {
  return (
    <div>
      <div className="score-big" style={{ fontSize: 26, color: "var(--accent)" }}>{n}</div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--text-mute)", marginTop: 4, letterSpacing: ".04em" }}>{l}</div>
    </div>
  );
}

Object.assign(window, { Login });
