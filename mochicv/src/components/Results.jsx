import { useEffect, useState } from "react";
import { RUBRIC } from "../rubric.js";
import { VERB_BANK } from "../insights.js";

const BAND_CLASS = (s) => (s >= 90 ? "band-excellent" : s >= 75 ? "band-good" : s >= 60 ? "band-developing" : "band-major");
const BAND_EMOJI = (s) => (s >= 90 ? "🏆" : s >= 75 ? "🌷" : s >= 60 ? "🌱" : "🛠️");
const TABS = [
  { id: "overview", label: "📊 overview" },
  { id: "highlight", label: "🖍 highlighter" },
  { id: "fix", label: "✎ fix my bullets" },
  { id: "interview", label: "💬 interview prep" }
];
const LEGEND = [
  ["verb", "action verb"], ["num", "result / number"], ["weak", "weak phrase"],
  ["passive", "passive voice"], ["typo", "spelling"], ["exag", "exaggeration"], ["private", "private info"]
];

function useCountUp(target, ms = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

async function copy(text, notify, msg = "Copied ✓") {
  try { await navigator.clipboard.writeText(text); notify(msg); }
  catch { notify("Couldn’t copy — select the text and copy it manually."); }
}

export default function Results({ r, notify }) {
  const [tab, setTab] = useState("overview");
  const n = useCountUp(r.score);
  const doc = r.type === "cover" ? "cover letter" : "CV";
  const ins = r.insights;
  const delta = typeof r.prev === "number" ? r.score - r.prev : null;

  const summaryText = [
    `MochiCV review — ${RUBRIC[r.type].label}${r.role ? ` (${r.role})` : ""}`,
    `Score: ${r.score}/100 · ${r.band}`,
    r.summary,
    "",
    "Top priorities:",
    ...r.priorities.map((p, i) => `${i + 1}. ${p.name}: ${p.recommendation}`),
    "",
    "Rubric scores:",
    ...r.rows.map((row) => `- ${row.name}: ${row.score}/${row.max} — ${row.issue}`)
  ].join("\n");

  return (
    <section className="card results page-enter" key={r.date}>
      <span className="tape pink" />
      <div className="result-head">
        <div className="score-bubble" style={{ "--pct": `${n}%` }}>
          <strong>{n}</strong>
          <small>out of 100</small>
        </div>
        <div>
          <span className={`band-sticker ${BAND_CLASS(r.score)}`}>{BAND_EMOJI(r.score)} {r.band}</span>
          {delta !== null && (
            <span className={`delta-chip ${delta > 0 ? "up" : delta < 0 ? "down" : ""}`}>
              {delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : "＝ same"} since your last {doc}
            </span>
          )}
          <h2 style={{ font: "800 24px var(--head)", margin: "10px 0 0" }}>Your {doc} review is ready!</h2>
          <p className="result-meta">
            {RUBRIC[r.type].label} · {r.role}{r.company ? ` · ${r.company}` : ""} · {r.words} words · {new Date(r.date).toLocaleDateString()}
          </p>
          <p className="result-summary">{r.summary}</p>
        </div>
      </div>

      <div className="health-stats">
        {ins.stats.map((s) => (
          <div key={s.label} className={`health ${s.good ? "good" : "meh"}`} title={s.hint}>
            <strong>{s.value}</strong><small>{s.label}</small><em>{s.good ? "✓ nice" : s.hint}</em>
          </div>
        ))}
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === "fix" && ins.bulletFixes.length > 0 && <span className="tab-count">{ins.bulletFixes.length}</span>}
          </button>
        ))}
      </div>

      <div className="tab-panel page-enter" key={tab}>
        {tab === "overview" && <Overview r={r} ins={ins} />}
        {tab === "highlight" && <Highlighter ins={ins} />}
        {tab === "fix" && <FixBullets ins={ins} notify={notify} />}
        {tab === "interview" && <Interview ins={ins} notify={notify} />}
      </div>

      <p className="disclaimer">ⓘ Demo score from rule-based checks of the Harvard-based rubric. It’s a helpful checklist, not an AI verdict or a hiring prediction.</p>
      <div className="result-actions">
        <button className="btn soft" onClick={() => copy(summaryText, notify, "Summary copied — paste it anywhere ✿")}>📋 copy summary</button>
        <button className="btn soft" onClick={() => window.print()}>🖨 print / save as PDF</button>
      </div>
    </section>
  );
}

function Overview({ r, ins }) {
  return (
    <>
      {r.priorities.length > 0 && (
        <>
          <h3 className="section-h">top three priorities</h3>
          <ol className="priority-list">
            {r.priorities.map((p) => <li key={p.id}><span><b>{p.name}:</b> {p.recommendation}</span></li>)}
          </ol>
        </>
      )}

      {ins.quickWins.length > 0 && (
        <>
          <h3 className="section-h">quick wins</h3>
          <ul className="quick-wins">{ins.quickWins.map((q) => <li key={q}>{q}</li>)}</ul>
        </>
      )}

      {ins.keywords.checked && (
        <>
          <h3 className="section-h">job keyword match</h3>
          <div className="kw-wrap">
            {ins.keywords.matched.map((k) => <span key={k} className="kw yes">✓ {k}</span>)}
            {ins.keywords.missing.map((k) => <span key={k} className="kw no">+ {k}</span>)}
          </div>
          <p className="progress-text" style={{ textAlign: "left" }}>Green = already in your document. Pink = in the job ad but not in your document. Add them only if they’re true for you.</p>
        </>
      )}

      <h3 className="section-h">rubric scores</h3>
      <div className="rubric-rows">
        {r.rows.map((row, i) => (
          <div className="rubric-row" key={row.id} style={{ animationDelay: `${i * 0.06}s` }}>
            <h4>{row.name}</h4>
            <div>
              <div className="bar-label">{row.score}<small> / {row.max}</small></div>
              <div className="bar"><i style={{ "--w": `${(row.score / row.max) * 100}%` }} /></div>
            </div>
            <div className="why"><b>{row.issue}</b><br />{row.recommendation}</div>
          </div>
        ))}
      </div>

      {r.detailed.length > 0 && (
        <>
          <h3 className="section-h">detailed feedback</h3>
          <div className="feedback-grid">
            {r.detailed.map((f, i) => (
              <article className="note-card" key={f.id}>
                <span className={`tape ${i % 2 ? "pink" : ""}`} />
                <h5><span>{f.issue}</span><span className="mini-chip">{f.score}/{f.max}</span></h5>
                {f.quote && <p className="quote">“{f.quote}”</p>}
                <p><b>Category:</b> {f.name} (up to {f.max} pts)</p>
                <p><b>Why it matters:</b> {f.why}</p>
                <p><b>Try this:</b> {f.recommendation}</p>
                {f.example && <p className="example">{f.example}</p>}
              </article>
            ))}
          </div>
        </>
      )}

      {r.notes.length > 0 && <div className="info-note">{r.notes.map((x) => <p key={x} style={{ margin: "4px 0" }}>ⓘ {x}</p>)}</div>}

      <div className="two-col">
        <div className="card">
          <h3 className="card-title">action plan</h3>
          <ol>
            {r.priorities.length
              ? r.priorities.map((p, i) => <li key={p.id}><b>{["Biggest win", "Next", "Then"][i]}:</b> {p.recommendation}</li>)
              : <li>Keep tailoring your document to each role ♡</li>}
          </ol>
          <h4 style={{ font: "700 14px var(--head)", margin: "12px 0 4px" }}>final proofreading checklist</h4>
          <ul>{RUBRIC.proofreadingChecklist.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
        <div className="card ethics">
          <h3 className="card-title">ethical check</h3>
          <ul>{r.ethics.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      </div>
    </>
  );
}

function Highlighter({ ins }) {
  const { parts, counts } = ins.highlight;
  return (
    <>
      <p className="tab-intro">Your document with the good bits and the fixable bits marked. Hover (or tap) a highlight to see why.</p>
      <div className="legend">
        {LEGEND.map(([k, label]) => (
          <span key={k} className={`hl-mark ${k}`}>{label}{counts[k] ? ` · ${counts[k]}` : ""}</span>
        ))}
      </div>
      <div className="highlight-doc">
        {parts.map((p, i) => p.type
          ? <mark key={i} className={`hl-mark ${p.type}`} title={p.label} tabIndex={0}>{p.text}</mark>
          : <span key={i}>{p.text}</span>)}
      </div>
    </>
  );
}

function FixBullets({ ins, notify }) {
  return (
    <>
      <p className="tab-intro">Rewrite ideas for weaker lines. They keep your facts exactly as they are: fill the [brackets] only with things that are true. Click an idea to copy it.</p>
      {ins.bulletFixes.length === 0 ? (
        <div className="info-note">✿ No weak bullets found — nice! Check the verb bank below to keep your wording varied.</div>
      ) : (
        <div className="fix-list">
          {ins.bulletFixes.map((f, i) => (
            <div className="fix-card" key={i}>
              <p className="fix-before"><span>before</span>{f.original}</p>
              <p className="fix-problem">⚠ {f.problem}</p>
              <div className="fix-options">
                {f.options.map((o) => (
                  o.startsWith("Tip:")
                    ? <p key={o} className="progress-text" style={{ textAlign: "left" }}>{o}</p>
                    : <button key={o} className="fix-option" onClick={() => copy(o, notify, "Rewrite copied — edit the [brackets] ✎")}><span>after</span>{o}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <h3 className="section-h">action verb bank</h3>
      <div className="verb-bank">
        {Object.entries(VERB_BANK).map(([cat, verbs]) => (
          <div key={cat} className="verb-group">
            <b>{cat}</b>
            <div>{verbs.map((v) => <button key={v} className="verb-chip" onClick={() => copy(v, notify, `“${v}” copied ✓`)}>{v}</button>)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Interview({ ins, notify }) {
  const [open, setOpen] = useState(null);
  return (
    <>
      <p className="tab-intro">Questions an employer might ask based on what you wrote. Practise answering out loud using <b>STAR</b>: Situation, Task, Action, Result.</p>
      <div className="q-list">
        {ins.interviewQuestions.map((q, i) => (
          <div key={q} className={`q-card ${open === i ? "open" : ""}`}>
            <button className="q-head" onClick={() => setOpen(open === i ? null : i)}>
              <span className="q-num">Q{i + 1}</span>{q}<span className="q-toggle">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="q-body">
                <p><b>S</b>ituation — where were you and what was happening?</p>
                <p><b>T</b>ask — what did you need to achieve?</p>
                <p><b>A</b>ction — what did <i>you</i> do, step by step?</p>
                <p><b>R</b>esult — what changed? Use a real number if you have one.</p>
                <button className="link-btn" onClick={() => copy(q, notify)}>copy question</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
