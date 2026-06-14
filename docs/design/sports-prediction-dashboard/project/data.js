/* ============================================================
   MySCORE WC2026 — seed data (fake, for prototype)
   "Now" is fixed at 2026-06-13T18:30 local tournament time.
   ============================================================ */
(function () {
  const NOW = new Date("2026-06-13T18:30:00");

  // ---- Teams (iso = flagcdn code) ----
  const teams = {
    mex: { name: "Mexico",       fifa: "MEX", iso: "mx", group: "A" },
    arg: { name: "Argentina",    fifa: "ARG", iso: "ar", group: "A" },
    cro: { name: "Croatia",      fifa: "CRO", iso: "hr", group: "A" },
    mar: { name: "Morocco",      fifa: "MAR", iso: "ma", group: "A" },
    can: { name: "Canada",       fifa: "CAN", iso: "ca", group: "B" },
    bra: { name: "Brazil",       fifa: "BRA", iso: "br", group: "B" },
    jpn: { name: "Japan",        fifa: "JPN", iso: "jp", group: "B" },
    gha: { name: "Ghana",        fifa: "GHA", iso: "gh", group: "B" },
    usa: { name: "USA",          fifa: "USA", iso: "us", group: "C" },
    ger: { name: "Germany",      fifa: "GER", iso: "de", group: "C" },
    kor: { name: "South Korea",  fifa: "KOR", iso: "kr", group: "C" },
    sen: { name: "Senegal",      fifa: "SEN", iso: "sn", group: "C" },
    eng: { name: "England",      fifa: "ENG", iso: "gb-eng", group: "D" },
    ned: { name: "Netherlands",  fifa: "NED", iso: "nl", group: "D" },
    bel: { name: "Belgium",      fifa: "BEL", iso: "be", group: "D" },
    ecu: { name: "Ecuador",      fifa: "ECU", iso: "ec", group: "D" },
  };

  const groups = ["A", "B", "C", "D"];

  const venues = {
    nyc: "MetLife Stadium · New York",
    la:  "SoFi Stadium · Los Angeles",
    dal: "AT&T Stadium · Dallas",
    atl: "Mercedes-Benz · Atlanta",
    mia: "Hard Rock Stadium · Miami",
    sea: "Lumen Field · Seattle",
    kc:  "Arrowhead · Kansas City",
    tor: "BMO Field · Toronto",
    van: "BC Place · Vancouver",
    mex: "Estadio Azteca · Mexico City",
    mty: "Estadio BBVA · Monterrey",
    gdl: "Estadio Akron · Guadalajara",
  };

  // helper to build a date relative to tournament
  const D = (day, h, m) => new Date(2026, 5, day, h, m).toISOString();

  // status: scheduled | locked | live | completed
  // res: [home, away] when completed/live
  // min: live clock minutes
  let mid = 0;
  const M = (o) => ({ id: "m" + (++mid), ...o });

  const matches = [
    // ---- Group A ----
    M({ group: "A", home: "mex", away: "arg", date: D(11, 19, 0), venue: "mex", status: "completed", res: [1, 2] }),
    M({ group: "A", home: "cro", away: "mar", date: D(11, 15, 0), venue: "atl", status: "completed", res: [0, 0] }),
    M({ group: "A", home: "arg", away: "cro", date: D(13, 16, 0), venue: "dal", status: "completed", res: [3, 1] }),
    M({ group: "A", home: "mex", away: "mar", date: D(13, 19, 0), venue: "mex", status: "live", res: [1, 1], min: 67 }),
    M({ group: "A", home: "mar", away: "arg", date: D(17, 19, 0), venue: "atl", status: "scheduled" }),
    M({ group: "A", home: "cro", away: "mex", date: D(17, 16, 0), venue: "la",  status: "scheduled" }),

    // ---- Group B ----
    M({ group: "B", home: "bra", away: "gha", date: D(12, 18, 0), venue: "mia", status: "completed", res: [3, 0] }),
    M({ group: "B", home: "can", away: "jpn", date: D(12, 15, 0), venue: "tor", status: "completed", res: [1, 1] }),
    M({ group: "B", home: "bra", away: "jpn", date: D(13, 21, 0), venue: "mia", status: "locked" }),
    M({ group: "B", home: "can", away: "gha", date: D(14, 18, 0), venue: "van", status: "scheduled" }),
    M({ group: "B", home: "jpn", away: "gha", date: D(18, 15, 0), venue: "sea", status: "scheduled" }),
    M({ group: "B", home: "bra", away: "can", date: D(18, 18, 0), venue: "kc",  status: "scheduled" }),

    // ---- Group C ----
    M({ group: "C", home: "usa", away: "ger", date: D(12, 20, 0), venue: "la",  status: "completed", res: [2, 2] }),
    M({ group: "C", home: "kor", away: "sen", date: D(12, 17, 0), venue: "sea", status: "completed", res: [0, 1] }),
    M({ group: "C", home: "usa", away: "kor", date: D(14, 20, 0), venue: "sea", status: "scheduled" }),
    M({ group: "C", home: "ger", away: "sen", date: D(15, 18, 0), venue: "atl", status: "scheduled" }),
    M({ group: "C", home: "sen", away: "usa", date: D(18, 20, 0), venue: "kc",  status: "scheduled" }),
    M({ group: "C", home: "ger", away: "kor", date: D(18, 17, 0), venue: "dal", status: "scheduled" }),

    // ---- Group D ----
    M({ group: "D", home: "eng", away: "ecu", date: D(12, 16, 0), venue: "nyc", status: "completed", res: [2, 0] }),
    M({ group: "D", home: "ned", away: "bel", date: D(13, 13, 0), venue: "nyc", status: "completed", res: [1, 0] }),
    M({ group: "D", home: "eng", away: "bel", date: D(15, 16, 0), venue: "dal", status: "scheduled" }),
    M({ group: "D", home: "ned", away: "ecu", date: D(16, 18, 0), venue: "atl", status: "scheduled" }),
    M({ group: "D", home: "ecu", away: "bel", date: D(19, 16, 0), venue: "mia", status: "scheduled" }),
    M({ group: "D", home: "eng", away: "ned", date: D(19, 19, 0), venue: "nyc", status: "scheduled" }),
  ];

  // mark scheduled matches that are actually within the lock window as "locked"
  matches.forEach((m) => {
    if (m.status === "scheduled" && new Date(m.date) <= NOW) m.status = "locked";
  });

  const scoreRules = { exact: 5, result: 3, incorrect: 0, lockMinutes: 0 };

  function computePoints(pred, res, rules) {
    if (!pred || !res) return null;
    const [ph, pa] = pred, [rh, ra] = res;
    if (ph === rh && pa === ra) return rules.exact;
    const so = Math.sign(ph - pa), ro = Math.sign(rh - ra);
    if (so === ro) return rules.result;
    return rules.incorrect;
  }

  // ---- Current user predictions (matchId -> [h,a]) ----
  const myPreds = {
    m1: [1, 1], // mex-arg  -> actual 1-2 : correct result? pred draw, actual arg win -> 0
    m2: [0, 0], // cro-mar  -> actual 0-0 : exact 5
    m3: [2, 1], // arg-cro  -> actual 3-1 : correct result 3
    m4: [2, 1], // mex-mar LIVE (1-1)
    m7: [2, 0], // bra-gha  -> actual 3-0 : correct result 3
    m8: [2, 1], // can-jpn  -> actual 1-1 : 0
    m9: [1, 2], // bra-jpn LOCKED (no result yet)
    m13: [1, 1], // usa-ger -> actual 2-2 : correct result (draw) 3
    m14: [1, 0], // kor-sen -> actual 0-1 : 0
    m19: [2, 0], // eng-ecu -> actual 2-0 : exact 5
    m20: [2, 1], // ned-bel -> actual 1-0 : correct result 3
    // upcoming with predictions already in
    m10: [2, 0], // can-gha
    m15: [1, 1], // usa-kor
    m21: [1, 1], // eng-bel
    // m5, m6, m11, m12, m16, m17, m18, m22, m23, m24 -> no prediction yet
  };

  // ---- Office users ----
  // points/exact/correct precomputed to a believable spread
  const me = { id: "u1", name: "Alex Rivera", initials: "AR", color: "#ff8a3d", role: "admin" };
  const users = [
    me,
    { id: "u2",  name: "Priya Menon",     initials: "PM", color: "#5b8def" },
    { id: "u3",  name: "Marcus Hale",     initials: "MH", color: "#19c08a" },
    { id: "u4",  name: "Sofia Lindqvist", initials: "SL", color: "#c45bef" },
    { id: "u5",  name: "Diego Fuentes",   initials: "DF", color: "#ef5b7a" },
    { id: "u6",  name: "Yuki Tanaka",     initials: "YT", color: "#e0a619" },
    { id: "u7",  name: "Omar Haddad",     initials: "OH", color: "#3dd6c4" },
    { id: "u8",  name: "Lena Brandt",     initials: "LB", color: "#8d6bef" },
    { id: "u9",  name: "Tomas Novak",     initials: "TN", color: "#5bc0ef" },
    { id: "u10", name: "Grace Okoye",     initials: "GO", color: "#ef9b3d" },
    { id: "u11", name: "Ravi Shah",       initials: "RS", color: "#6bd16b" },
    { id: "u12", name: "Hana Kim",        initials: "HK", color: "#ef5bb0" },
  ];

  // leaderboard rows: pts, exact, correct, played, prev rank (for delta)
  const board = [
    { id: "u3",  pts: 41, exact: 5, correct: 7, played: 14, prev: 1 },
    { id: "u2",  pts: 39, exact: 4, correct: 8, played: 14, prev: 2 },
    { id: "u1",  pts: 35, exact: 3, correct: 6, played: 13, prev: 5 }, // me
    { id: "u6",  pts: 34, exact: 4, correct: 5, played: 14, prev: 3 },
    { id: "u8",  pts: 31, exact: 2, correct: 7, played: 14, prev: 4 },
    { id: "u5",  pts: 29, exact: 3, correct: 4, played: 13, prev: 6 },
    { id: "u11", pts: 27, exact: 2, correct: 6, played: 14, prev: 9 },
    { id: "u7",  pts: 25, exact: 1, correct: 7, played: 13, prev: 7 },
    { id: "u4",  pts: 23, exact: 2, correct: 4, played: 12, prev: 8 },
    { id: "u9",  pts: 20, exact: 1, correct: 5, played: 14, prev: 10 },
    { id: "u12", pts: 18, exact: 1, correct: 4, played: 11, prev: 11 },
    { id: "u10", pts: 14, exact: 0, correct: 4, played: 12, prev: 12 },
  ];

  window.WC = {
    NOW, teams, groups, venues, matches, scoreRules, computePoints,
    me, users, board, myPreds,
    userById: (id) => users.find((u) => u.id === id),
    matchById: (id) => matches.find((m) => m.id === id),
    flagUrl: (iso) => (window.__resources && window.__resources["flag_" + iso]) || `https://flagcdn.com/${iso}.svg`,
  };
})();
