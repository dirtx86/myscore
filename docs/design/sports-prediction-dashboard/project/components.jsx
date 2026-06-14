/* ============================================================
   MySCORE WC2026 — shared components + icons
   ============================================================ */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------------- Icons ---------------- */
const ICONS = {
  dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  matches: "M12 3v18M3 8h3a3 3 0 0 0 0 6H3m18-6h-3a3 3 0 0 1 0 6h3M3 6v12m18-12v12",
  predictions: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  leaderboard: "M4 20h4v-7H4v7Zm6 0h4V4h-4v16Zm6 0h4v-11h-4v11Z",
  stats: "M3 3v18h18M7 14l3-4 3 3 5-7",
  admin: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  chevR: "M9 18l6-6-6-6",
  chevD: "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  search: "M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z",
  check: "M20 6L9 17l-5-5",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2ZM7 11V7a5 5 0 0 1 10 0v4",
  trophy: "M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 4H4v2a3 3 0 0 0 3 3m10-5h3v2a3 3 0 0 1-3 3",
  fire: "M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 11 11 11c0-2-1-4 1-9Z M8.5 14a3.5 3.5 0 0 0 7 0c0-2-1.5-3-1.5-3",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  bolt: "M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z",
  whistle: "M3 12a6 6 0 1 0 12 0 6 6 0 0 0-12 0Zm12-3 6-3v4l-6 1",
  user: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z",
  trash: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
  filter: "M22 3H2l8 9.5V19l4 2v-8.5L22 3Z",
  x: "M18 6 6 18M6 6l12 12",
  flame: "M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 11 11 11c0-2-1-4 1-9Z",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M19 12l-7 7-7-7",
  settings2: "M20 7h-9M14 17H5M17 17a3 3 0 1 0 0 0M7 7a3 3 0 1 0 0 0",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  dash2: "M5 12h14",
};

function Icon({ name, size = 20, fill = false, style, className }) {
  const d = ICONS[name] || "";
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {d.split(" M").map((seg, i) => <path key={i} d={(i ? "M" : "") + seg} />)}
    </svg>
  );
}

/* ---------------- Date helpers ---------------- */
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const pad = (n) => String(n).padStart(2, "0");
function clockOf(d) { d = new Date(d); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function dayShort(d) { d = new Date(d); return `${MON[d.getMonth()]} ${d.getDate()}`; }
function dayLong(d) { d = new Date(d); return `${DOW[d.getDay()]} ${MON[d.getMonth()]} ${d.getDate()}`.toUpperCase(); }
function countdown(d, now) {
  const ms = new Date(d) - now;
  if (ms <= 0) return "now";
  const min = Math.floor(ms / 60000), h = Math.floor(min / 60), days = Math.floor(h / 24);
  if (days >= 1) return `${days}d ${h % 24}h`;
  if (h >= 1) return `${h}h ${min % 60}m`;
  return `${min}m`;
}

/* ---------------- Flag ---------------- */
function Flag({ iso, size = 26, ratio = 1.4, round = 4, style }) {
  return (
    <img className="flag" src={WC.flagUrl(iso)} alt=""
      width={Math.round(size * ratio)} height={size}
      style={{ width: Math.round(size * ratio), height: size, borderRadius: round, ...style }}
      loading="lazy" />
  );
}

/* ---------------- Avatar ---------------- */
function Avatar({ user, size = 32 }) {
  return (
    <div className="avatar" style={{
      width: size, height: size, fontSize: size * 0.38,
      background: `linear-gradient(145deg, ${user.color}, color-mix(in oklab, ${user.color} 55%, #000))`,
    }}>{user.initials}</div>
  );
}

/* ---------------- Status pill ---------------- */
function StatusPill({ status }) {
  if (status === "live") return <span className="pill pill-live"><span className="dot"></span>Live</span>;
  if (status === "locked") return <span className="pill pill-locked"><Icon name="lock" size={11} />Locked</span>;
  if (status === "completed") return <span className="pill pill-done">Full-time</span>;
  return <span className="pill pill-scheduled">Scheduled</span>;
}

/* ---------------- Points tag ---------------- */
function PtsTag({ pts }) {
  if (pts == null) return null;
  const cls = pts >= 5 ? "pts-5" : pts >= 3 ? "pts-3" : "pts-0";
  return <span className={"tag-pts " + cls}>{pts > 0 ? "+" + pts : "0"} pts</span>;
}

/* ---------------- Team label ---------------- */
function TeamTag({ id, align = "left", showName = true, flagSize = 22, strong }) {
  const t = WC.teams[id];
  const flag = <Flag iso={t.iso} size={flagSize} />;
  const txt = (
    <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, alignItems: align === "right" ? "flex-end" : "flex-start" }}>
      <span style={{ fontWeight: strong ? 800 : 700, fontSize: 14.5 }}>{showName ? t.name : t.fifa}</span>
      {showName && <span className="mono" style={{ fontSize: 10.5, color: "var(--text-mute)", letterSpacing: ".06em" }}>{t.fifa}</span>}
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexDirection: align === "right" ? "row-reverse" : "row" }}>
      {flag}{txt}
    </span>
  );
}

/* ---------------- Score stepper ---------------- */
function Stepper({ value, onChange, disabled }) {
  const set = (v) => onChange(Math.max(0, Math.min(20, v)));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="stepper">
        <button className="step-btn" disabled={disabled} onClick={() => set((value ?? 0) + 1)} aria-label="increase"><Icon name="plus" size={14} /></button>
        <button className="step-btn" disabled={disabled} onClick={() => set((value ?? 0) - 1)} aria-label="decrease"><Icon name="minus" size={14} /></button>
      </div>
      <input className="score-input" type="number" inputMode="numeric" disabled={disabled}
        value={value ?? ""} placeholder="–"
        onChange={(e) => { const v = e.target.value; onChange(v === "" ? null : Math.max(0, Math.min(20, parseInt(v) || 0))); }} />
    </div>
  );
}

/* ---------------- Generic card ---------------- */
function Card({ title, icon, link, onLink, children, pad = true, style, className = "" }) {
  return (
    <div className={"card " + className} style={style}>
      {title && (
        <div className="card-head">
          {icon && <Icon name={icon} size={17} style={{ color: "var(--accent)" }} />}
          <span className="card-title">{title}</span>
          {link && <button className="card-link" onClick={onLink}>{link}<Icon name="chevR" size={14} /></button>}
        </div>
      )}
      <div className={pad ? "card-pad" : ""}>{children}</div>
    </div>
  );
}

/* ---------------- Toast system ---------------- */
const ToastCtx = React.createContext(() => {});
function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (msg, opts = {}) => {
    const id = Math.random();
    setToasts((t) => [...t, { id, msg, ...opts }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration || 3200);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name={t.icon || "check"} size={17} style={{ color: t.color || "var(--accent)" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.msg}</div>
                {t.sub && <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{t.sub}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => React.useContext(ToastCtx);

Object.assign(window, {
  Icon, ICONS, Flag, Avatar, StatusPill, PtsTag, TeamTag, Stepper, Card,
  ToastHost, useToast,
  clockOf, dayShort, dayLong, countdown, MON, DOW, pad,
});
