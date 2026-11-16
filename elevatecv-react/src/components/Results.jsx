import { useEffect, useState } from "react";
import { RUBRIC } from "../rubric.js";

const BAND_CLASS = (s) => (s >= 90 ? "band-excellent" : s >= 75 ? "band-good" : s >= 60 ? "band-developing" : "band-major");
const BAND_EMOJI = (s) => (s >= 90 ? "🏆" : s >= 75 ? "🌷" : s >= 60 ? "🌱" : "🛠️");

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

export default function Results({ r }) {
  const n = useCountUp(r.score);
  const doc = r.type === "cover" ? "cover letter" : "CV";

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
          <h2 style={{ font: "800 24px var(--head)", margin: "10px 0 0" }}>Your {doc} review is ready!</h2>
          <p className="result-meta">
            {RUBRIC[r.type].label} · {r.role}{r.company ? ` · ${r.company}` : ""} · {r.words} words · {new Date(r.date).toLocaleDateString()}
          </p>
          <p className="result-summary">{r.summary}</p>
        </div>
      </div>
      <p className="disclaimer">ⓘ This is a demo score from rule-based checks of the Harvard-based rubric. It’s a helpful checklist, not an AI verdict or a hiring prediction.</p>

      {r.priorities.length > 0 && (
        <>
          <h3 className="section-h">top three priorities</h3>
          <ol className="priority-list">
            {r.priorities.map((p) => <li key={p.id}><span><b>{p.name}:</b> {p.recommendation}</span></li>)}
          </ol>
        </>
      )}

      <h3 className="section-h">rubric scores</h3>
      <div className="rubric-rows">
        {r.rows.map((row, i) => (
          <div className="rubric-row" key={row.id} style={{ animationDelay: `${i * 0.07}s` }}>
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

      {r.notes.length > 0 && <div className="info-note">{r.notes.map((n2) => <p key={n2} style={{ margin: "4px 0" }}>ⓘ {n2}</p>)}</div>}

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

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button className="btn soft" onClick={() => window.print()}>🖨 print / save as PDF</button>
      </div>
    </section>
  );
}
