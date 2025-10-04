import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, PauseCircle, HelpCircle, Gauge, Upload } from "lucide-react";

// ============================================================
// C‑suite Overview — Strategic Targets × Objective RAG (Aggregated)
// Now with Year + PI selectors and a data ingestor so you can switch
// between PI2/PI3 and different years by pasting raw rows.
// ============================================================

// ---- STATUS VISUAL TOKENS ----
const STATUS = {
  "On track": { label: "On track", bg: "bg-emerald-100", fg: "text-emerald-800", bar: "bg-emerald-500", icon: <CheckCircle2 className="w-4 h-4"/> },
  "At risk": { label: "At risk", bg: "bg-amber-100", fg: "text-amber-800", bar: "bg-amber-400", icon: <AlertTriangle className="w-4 h-4"/> },
  "Not on track": { label: "Not on track", bg: "bg-rose-100", fg: "text-rose-800", bar: "bg-rose-500", icon: <XCircle className="w-4 h-4"/> },
  "Done": { label: "Done", bg: "bg-cyan-100", fg: "text-cyan-800", bar: "bg-cyan-500", icon: <CheckCircle2 className="w-4 h-4"/> },
  "On hold": { label: "On hold", bg: "bg-slate-200", fg: "text-slate-800", bar: "bg-slate-400", icon: <PauseCircle className="w-4 h-4"/> },
  "TBD": { label: "TBD", bg: "bg-gray-100", fg: "text-gray-800", bar: "bg-gray-400", icon: <HelpCircle className="w-4 h-4"/> },
};
const SEVERITY_ORDER = ["Not on track", "At risk", "On track", "Done", "On hold", "TBD"]; // left→right stack order

// ---- HELPERS ----
const sum = (obj) => Object.values(obj || {}).reduce((a, b) => a + b, 0);
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const normalizeStatus = (s) => {
  if (!s) return "TBD";
  const t = String(s).trim().toLowerCase();
  if (t === "on track" || t === "ontrack") return "On track";
  if (t === "at risk" || t === "atrisk") return "At risk";
  if (t === "not on track" || t === "notontrack") return "Not on track";
  if (t === "done") return "Done";
  if (t === "on hold" || t === "onhold") return "On hold";
  if (t === "tbd" || t === "") return "TBD";
  // fallback: keep capitalization as-is but attempt to map later
  return s;
};

// Objective-level roll-up logic from KR statuses
function rollupObjective(statuses) {
  const arr = statuses.map(normalizeStatus);
  const active = arr.filter((x) => x !== "On hold" && x !== "TBD");
  if (active.length === 0) return arr.includes("On hold") ? "On hold" : "TBD";
  if (active.includes("Not on track")) return "Not on track";
  if (active.includes("At risk")) return "At risk";
  if (active.every((x) => x === "Done")) return "Done";
  return "On track";
}

// ---- BASELINE DATA (PI3 2025) ----
// These counts were computed from the dataset you provided (PI3 2025).
// We store them here as the default view. Use the ingestor to add PI2/other years.
const DEFAULT_COUNTS = {
  2025: {
    PI3: [
      { target: "24/7 availability", totals: { "On track": 2, "At risk": 4, "Not on track": 2, "Done": 0, "On hold": 0, "TBD": 0 } },
      { target: "Competitive customer satisfaction and brand trust", totals: { "On track": 1, "At risk": 4, "Not on track": 3, "Done": 0, "On hold": 0, "TBD": 1 } },
      { target: "Competitive return on investment capital — ROE with market leading C/I", totals: { "On track": 2, "At risk": 3, "Not on track": 2, "Done": 0, "On hold": 0, "TBD": 0 } },
      { target: "Employee engagement", totals: { "On track": 1, "At risk": 0, "Not on track": 1, "Done": 1, "On hold": 0, "TBD": 1 } },
      { target: "Solid risk management & compliance", totals: { "On track": 5, "At risk": 8, "Not on track": 5, "Done": 0, "On hold": 0, "TBD": 1 } },
    ],
  },
};

// ---- INGESTOR ----
// Accepts pasted CSV/TSV with columns (case-insensitive):
// Year, PI, Strategic Target, Objective, RAG
// Example header: year\tpi\tstrategic target\tobjective\trag
function parseTable(text) {
  const sep = text.includes("\t") ? "\t" : ",";
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((r) => r.split(sep));
  if (rows.length < 2) throw new Error("Not enough rows");
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.findIndex((h) => h === name);
  const y = col("year"), p = col("pi"), st = col("strategic target"), obj = col("objective"), rag = col("rag");
  if ([y,p,st,obj,rag].some((i) => i === -1)) throw new Error("Missing required columns: Year, PI, Strategic Target, Objective, RAG");
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    out.push({
      year: String(r[y]).trim(),
      pi: String(r[p]).trim().toUpperCase(),
      target: String(r[st]).trim(),
      objective: String(r[obj]).trim(),
      rag: normalizeStatus(r[rag])
    });
  }
  return out;
}

// From raw rows → aggregated counts per Strategic Target at Objective level
function aggregateCounts(rows, year, pi) {
  const filtered = rows.filter((r) => String(r.year) === String(year) && String(r.pi).toUpperCase() === String(pi).toUpperCase());
  if (filtered.length === 0) return [];
  // Group by (target, objective) and roll-up
  const byObj = new Map();
  for (const r of filtered) {
    const key = `${r.target}||${r.objective}`;
    if (!byObj.has(key)) byObj.set(key, []);
    byObj.get(key).push(r.rag);
  }
  const objectiveRAG = [];
  for (const [key, arr] of byObj.entries()) {
    const [target, objective] = key.split("||");
    objectiveRAG.push({ target, objective, rag: rollupObjective(arr) });
  }
  // Count totals per target
  const byTarget = new Map();
  for (const { target, rag } of objectiveRAG) {
    if (!byTarget.has(target)) byTarget.set(target, { "On track": 0, "At risk": 0, "Not on track": 0, "Done": 0, "On hold": 0, "TBD": 0 });
    const t = byTarget.get(target);
    t[rag] = (t[rag] || 0) + 1;
  }
  return Array.from(byTarget.entries()).map(([target, totals]) => ({ target, totals }));
}

// ---- PRESENTATION SUBCOMPONENTS ----
const StackedBar = ({ totals }) => {
  const total = sum(totals) || 1;
  return (
    <div className="w-full h-3.5 rounded-full overflow-hidden bg-slate-100">
      <div className="flex w-full h-full">
        {SEVERITY_ORDER.map((k) => {
          const v = totals[k] || 0;
          if (!v) return null;
          return (
            <div key={k} className={`${STATUS[k].bar} h-full`} style={{ width: `${(v / total) * 100}%` }} title={`${STATUS[k].label}: ${v}`}/>
          );
        })}
      </div>
    </div>
  );
};

const MiniKPIs = ({ totals }) => {
  const total = sum(totals);
  const ok = (totals["On track"] || 0) + (totals["Done"] || 0);
  const sev = totals["Not on track"] || 0;
  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      <div className="rounded-2xl bg-emerald-50 p-3">
        <div className="text-[11px] text-emerald-700">On track + Done</div>
        <div className="text-xl font-semibold text-emerald-900">{ok}/{total} <span className="text-sm text-emerald-700">({pct(ok, total)}%)</span></div>
      </div>
      <div className="rounded-2xl bg-amber-50 p-3">
        <div className="text-[11px] text-amber-700">At risk</div>
        <div className="text-xl font-semibold text-amber-900">{totals["At risk"] || 0}</div>
      </div>
      <div className="rounded-2xl bg-rose-50 p-3">
        <div className="text-[11px] text-rose-700">Not on track</div>
        <div className="text-xl font-semibold text-rose-900">{sev}</div>
      </div>
    </div>
  );
};

const CompactLegend = ({ totals }) => {
  const total = sum(totals);
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
      {SEVERITY_ORDER.map((k) => {
        const v = totals[k] || 0;
        if (!v) return null;
        return (
          <div key={k} className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${STATUS[k].bg} ${STATUS[k].fg}`}>
              {STATUS[k].icon}
              {STATUS[k].label}
            </span>
            <span className="text-slate-700">{v}</span>
            <span className="text-slate-400">({pct(v, total)}%)</span>
          </div>
        );
      })}
    </div>
  );
};

const TargetCard = ({ target, totals }) => {
  const total = sum(totals);
  const headline = totals["Not on track"] > 0
    ? { tone: "bg-rose-50", icon: <XCircle className="w-5 h-5 text-rose-600"/>, text: "Attention needed" }
    : totals["At risk"] > 0
    ? { tone: "bg-amber-50", icon: <AlertTriangle className="w-5 h-5 text-amber-600"/>, text: "Monitor closely" }
    : { tone: "bg-emerald-50", icon: <CheckCircle2 className="w-5 h-5 text-emerald-600"/>, text: "On track" };
  return (
    <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      <div className={`flex items-center justify-between px-4 py-3 ${headline.tone}`}>
        <div className="flex items-center gap-2">
          {headline.icon}
          <h2 className="text-base font-semibold">{target}</h2>
        </div>
        <div className="text-xs text-slate-700">{total} objectives</div>
      </div>
      <div className="p-4">
        <StackedBar totals={totals} />
        <MiniKPIs totals={totals} />
        <CompactLegend totals={totals} />
      </div>
    </div>
  );
};

// ---- MAIN COMPONENT ----
export default function StrategicTargetsRAG() {
  // Local state for dataset, initialized with PI3 2025
  const [store, setStore] = useState(DEFAULT_COUNTS);
  const years = Object.keys(store).sort();
  const [year, setYear] = useState(years[years.length - 1] || "2025");
  const pis = Object.keys(store[year] || {}).sort();
  const [pi, setPI] = useState(pis.includes("PI3") ? "PI3" : (pis[0] || "PI3"));

  const cards = useMemo(() => (store[year] && store[year][pi]) ? store[year][pi] : [], [store, year, pi]);
  const grand = useMemo(() => {
    const acc = { "On track": 0, "At risk": 0, "Not on track": 0, "Done": 0, "On hold": 0, "TBD": 0 };
    for (const c of cards) for (const k of Object.keys(acc)) acc[k] += c.totals[k] || 0;
    return acc;
  }, [cards]);
  const allObjectives = sum(grand);
  const headerPulse = grand["Not on track"] > 0 ? "Portfolio attention required" : grand["At risk"] > 0 ? "Monitor and unblock quickly" : "Tracking to plan";

  // Ingest pasted rows and merge into store
  function handleIngest(text) {
    try {
      const rows = parseTable(text);
      // Determine unique year×pi pairs to rebuild aggregates
      const pairs = Array.from(new Set(rows.map(r => `${r.year}||${r.pi}`)));
      const next = { ...store };
      for (const pair of pairs) {
        const [y, p] = pair.split("||");
        const aggregated = aggregateCounts(rows, y, p);
        if (!next[y]) next[y] = {};
        next[y][p] = aggregated;
      }
      setStore(next);
      // auto-switch to the last ingested year/pi for convenience
      const last = pairs[pairs.length - 1].split("||");
      setYear(last[0]);
      setPI(last[1]);
      alert(`Loaded ${pairs.length} period(s). Switched to ${last[0]} ${last[1]}.`);
    } catch (e) {
      alert(`Import failed: ${e.message}`);
    }
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Strategic Targets — Objective Status (Aggregated)</h1>
            <p className="text-slate-600 mt-1">Switch Year & PI. Paste new data to refresh the view.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 bg-white">
              <Gauge className="w-5 h-5 text-slate-500"/>
              <span className="text-sm text-slate-700">Total objectives: {allObjectives}</span>
            </div>
            <select className="px-3 py-2 rounded-xl border border-slate-200 text-sm" value={year} onChange={(e) => setYear(e.target.value)}>
              {Object.keys(store).sort().map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select className="px-3 py-2 rounded-xl border border-slate-200 text-sm" value={pi} onChange={(e) => setPI(e.target.value)}>
              {(Object.keys(store[year] || {}).sort()).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <details className="ml-2">
              <summary className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm cursor-pointer select-none">
                <Upload className="w-4 h-4"/> Paste data
              </summary>
              <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white max-w-xl">
                <p className="text-xs text-slate-600 mb-2">Paste CSV/TSV with headers: <code>Year, PI, Strategic Target, Objective, RAG</code>. Example:</p>
                <pre className="text-xs bg-slate-50 p-2 rounded-md overflow-auto">
{`year\tpi\tstrategic target\tobjective\trag
2025\tPI2\t24/7 availability\tStable, secure...\tOn track
2025\tPI2\tSolid risk management & compliance\tEnsure future regulatory compliance\tAt risk`}
                </pre>
                <textarea id="ingest-text" className="mt-2 w-full h-40 p-2 rounded-md border border-slate-200 text-xs font-mono" placeholder="Paste rows here..."></textarea>
                <div className="mt-2 flex justify-end">
                  <button
                    className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 text-white hover:opacity-90"
                    onClick={() => {
                      const el = document.getElementById("ingest-text");
                      if (el && "value" in el) handleIngest(el.value);
                    }}
                  >Import</button>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Overall pulse */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="rounded-2xl bg-rose-50 p-3">
            <div className="text-[11px] text-rose-700">Not on track</div>
            <div className="text-xl font-semibold text-rose-900">{grand["Not on track"] || 0}</div>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3">
            <div className="text-[11px] text-amber-700">At risk</div>
            <div className="text-xl font-semibold text-amber-900">{grand["At risk"] || 0}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3">
            <div className="text-[11px] text-emerald-700">On track + Done</div>
            <div className="text-xl font-semibold text-emerald-900">{(grand["On track"] || 0) + (grand["Done"] || 0)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-[11px] text-slate-700">Neutral (On hold + TBD)</div>
            <div className="text-xl font-semibold text-slate-900">{(grand["On hold"] || 0) + (grand["TBD"] || 0)}</div>
          </div>
        </div>
        <div className="mt-2 text-sm text-slate-700">{headerPulse} — {year} {pi}</div>
      </div>

      {/* Cards */}
      {cards.length === 0 ? (
        <div className="mt-8 p-6 rounded-2xl border border-dashed border-slate-300 text-slate-600">
          No data for <strong>{year} {pi}</strong>. Paste rows via <em>Paste data</em> to populate this period.
        </div>
      ) : (
        <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 mt-6">
          {cards
            .slice()
            .sort((a, b) => (b.totals["Not on track"] || 0) + (b.totals["At risk"] || 0) - ((a.totals["Not on track"] || 0) + (a.totals["At risk"] || 0)))
            .map(({ target, totals }) => (
              <TargetCard key={target} target={target} totals={totals} />
          ))}
        </div>
      )}

      {/* Legend & Notes */}
      <div className="mt-8 p-4 rounded-2xl border border-slate-200">
        <div className="text-sm font-medium text-slate-800 mb-3">Legend</div>
        <div className="flex flex-wrap gap-3">
          {SEVERITY_ORDER.map((k) => (
            <span key={k} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${STATUS[k].bg} ${STATUS[k].fg}`}>
              {STATUS[k].icon}
              {STATUS[k].label}
            </span>
          ))}
        </div>
        <div className="text-xs text-slate-500 mt-3 space-y-1">
          <p>Objective roll‑up: All active KRs Done → Done; no active → On hold if any On hold else TBD; else any Not on track → Not on track; else any At risk → At risk; else On track. Active excludes On hold & TBD.</p>
          <p>Use the <em>Paste data</em> panel to add PI2 or other years. Required columns: Year, PI, Strategic Target, Objective, RAG.</p>
        </div>
      </div>
    </div>
  );
}
