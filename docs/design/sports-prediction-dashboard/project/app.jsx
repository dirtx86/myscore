/* ============================================================
   MySCORE WC2026 — App shell, routing, tweaks
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": true,
  "accent": "#ffd23f",
  "fontset": "modern",
  "density": "regular"
}/*EDITMODE-END*/;

const ACCENTS = {
  "#ffd23f": { a2: "#ffb020", ink: "#15120a" },
  "#19e08a": { a2: "#0fbf72", ink: "#04230f" },
  "#4aa8ff": { a2: "#2f86e0", ink: "#04101f" },
  "#ff5b6e": { a2: "#e23d52", ink: "#2a060a" },
};
const FONTSETS = {
  modern:   { sans: '"Archivo", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace', label: "Modern" },
  sporty:   { sans: '"Saira", system-ui, sans-serif',   mono: '"Space Mono", ui-monospace, monospace',     label: "Sporty" },
  editorial:{ sans: '"Space Grotesk", system-ui, sans-serif', mono: '"Space Mono", ui-monospace, monospace', label: "Editorial" },
};

const NAV = [
  ["dashboard", "Dashboard", "dashboard"],
  ["matches", "Matches", "matches"],
  ["predictions", "My Predictions", "predictions"],
  ["leaderboard", "Leaderboard", "leaderboard"],
  ["stats", "Statistics", "stats"],
  ["admin", "Admin", "admin"],
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [authed, setAuthed] = React.useState(false);
  const [route, setRoute] = React.useState("dashboard");
  const [preds, setPreds] = React.useState(() => JSON.parse(JSON.stringify(WC.myPreds)));
  const [rules, setRulesState] = React.useState({ ...WC.scoreRules });
  const [, bump] = React.useState(0);

  // apply tweaks -> CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.dark ? "dark" : "light");
    const ac = ACCENTS[t.accent] || ACCENTS["#ffd23f"];
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-2", ac.a2);
    root.style.setProperty("--accent-ink", ac.ink);
    const fs = FONTSETS[t.fontset] || FONTSETS.modern;
    root.style.setProperty("--font-sans", fs.sans);
    root.style.setProperty("--font-mono", fs.mono);
  }, [t.dark, t.accent, t.fontset]);

  const savePred = (id, arr) => setPreds((p) => ({ ...p, [id]: arr }));
  const setRules = (r) => { Object.assign(WC.scoreRules, r); setRulesState({ ...r }); };
  const publishResult = (id, res) => {
    const m = WC.matchById(id);
    m.res = res; m.status = "completed"; if (m.min) delete m.min;
    bump((x) => x + 1);
  };

  const needPred = WC.matches.filter((m) => m.status === "scheduled" && !preds[m.id]).length;

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const screen = {
    dashboard: <Dashboard preds={preds} savePred={savePred} go={setRoute} />,
    matches: <MatchesScreen preds={preds} savePred={savePred} go={setRoute} />,
    predictions: <MyPredictions preds={preds} go={setRoute} />,
    leaderboard: <Leaderboard go={setRoute} />,
    stats: <Statistics go={setRoute} />,
    admin: <AdminScreen rules={rules} setRules={setRules} publishResult={publishResult} />,
  }[route];

  return (
    <div className="app">
      {/* sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon name="trophy" size={20} fill /></div>
          <div><div className="brand-name">MySCORE</div><div className="brand-sub">World Cup 2026</div></div>
        </div>
        <nav className="nav">
          {NAV.map(([k, l, ic]) => (
            <button key={k} className={"nav-item" + (route === k ? " active" : "")} onClick={() => setRoute(k)}>
              <Icon name={ic} size={19} className="ico" />{l}
              {k === "matches" && needPred > 0 && <span className="nav-badge">{needPred}</span>}
            </button>
          ))}
        </nav>
        <div className="nav-foot">
          <div className="userchip" onClick={() => setRoute("dashboard")}>
            <Avatar user={WC.me} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{WC.me.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>RANK #{WC.board.findIndex((b) => b.id === "u1") + 1} · {WC.board.find((b) => b.id === "u1").pts} PTS</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ padding: 7 }} title="Log out" onClick={(e) => { e.stopPropagation(); setAuthed(false); }}><Icon name="logout" size={16} /></button>
          </div>
        </div>
      </aside>

      {/* main */}
      <div className="main">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }} className="hide-mobile">{NAV.find((n) => n[0] === route)[1]}</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <div className="chip hide-mobile" style={{ gap: 8 }}>
              <span className="pill pill-live" style={{ padding: "2px 6px" }}><span className="dot"></span>Live</span>
              <span style={{ fontSize: 12.5 }}>{WC.matches.filter((m) => m.status === "live").length} match in play</span>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ padding: 9, position: "relative" }} onClick={() => setTweak("dark", !t.dark)} title="Toggle theme">
              <Icon name={t.dark ? "sun" : "moon"} size={18} />
            </button>
            <button className="btn btn-ghost btn-sm" style={{ padding: 9, position: "relative" }} title="Notifications">
              <Icon name="bell" size={18} />
              <span style={{ position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }}></span>
            </button>
            <Avatar user={WC.me} size={32} />
          </div>
        </header>

        <main className="page" key={route}>{screen}</main>
      </div>

      {/* mobile tab bar */}
      <nav className="mobile-tab">
        {NAV.slice(0, 5).map(([k, l, ic]) => (
          <button key={k} className={route === k ? "active" : ""} onClick={() => setRoute(k)}>
            <Icon name={ic} size={20} />{l.split(" ")[0]}
          </button>
        ))}
      </nav>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakColor label="Accent" value={t.accent} options={Object.keys(ACCENTS)} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Typography" />
        <TweakRadio label="Type set" value={t.fontset} options={["modern", "sporty", "editorial"]} onChange={(v) => setTweak("fontset", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ToastHost><App /></ToastHost>
);
