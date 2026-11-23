import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { RUBRIC } from "../rubric.js";
import { analyse } from "../reviewEngine.js";
import { buildInsights } from "../insights.js";
import { extractText } from "../extractText.js";
import { SAMPLE_COVER, SAMPLE_CV, SAMPLE_JOB } from "../samples.js";
import Results from "../components/Results.jsx";

// The draft is kept for this browser tab only (cleared when the tab closes)
const DRAFT_KEY = "mochicv_draft";
function loadDraft() {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || {}; } catch { return {}; }
}

export default function Reviewer({ onResult, notify, setCalm, previousScore }) {
  const draft = useMemo(loadDraft, []);
  const [docType, setDocType] = useState(draft.docType || "resume");
  const [role, setRole] = useState(draft.role || "");
  const [company, setCompany] = useState(draft.company || "");
  const [job, setJob] = useState(draft.job || "");
  const [text, setText] = useState(draft.text || "");
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [thinking, setThinking] = useState(false);
  const resultsRef = useRef(null);
  const isCover = docType === "cover";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Save the draft as you type
  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ docType, role, company, job, text })); } catch { /* ignore */ }
  }, [docType, role, company, job, text]);

  useEffect(() => { if (result) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [result]);

  // Live score while typing (uses a deferred value so typing stays smooth)
  const liveText = useDeferredValue(text);
  const live = useMemo(() => {
    const w = liveText.trim().split(/\s+/).filter(Boolean).length;
    if (w < 30) return null;
    const r = analyse(liveText, role, job, company, docType);
    return { score: r.score, band: r.band, top: r.priorities[0] };
  }, [liveText, role, job, company, docType]);

  const focusProps = { onFocus: () => setCalm(true), onBlur: () => setCalm(false) };

  async function readFile(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { notify("That file is over 10 MB (｡•́︿•̀｡)"); return; }
    setFileName(file.name);
    setReading(true);
    try {
      const t = await extractText(file);
      setText(t);
      notify(`Read ${t.split(/\s+/).length} words from ${file.name} ✿`);
    } catch (err) {
      notify(err.message || "Sorry, I couldn’t read that file.");
    } finally {
      setReading(false);
    }
  }

  function loadSample() {
    if (isCover) { setText(SAMPLE_COVER); setRole("Data Analyst Intern"); setCompany("Safaricom"); }
    else { setText(SAMPLE_CV); setRole("Data Analyst Intern"); }
    setJob(SAMPLE_JOB);
    setFileName("");
    notify("Sample loaded — hit review to see it in action ✦");
  }

  function clearAll() {
    setText(""); setRole(""); setCompany(""); setJob(""); setFileName(""); setResult(null);
    notify("All cleared ✿");
  }

  function run() {
    if (!text.trim()) { notify(`Paste or upload your ${isCover ? "cover letter" : "CV"} first ♡`); return; }
    setThinking(true);
    setTimeout(() => {
      const r = analyse(text, role, job, company, docType);
      const insights = buildInsights(text, docType, role, job, company);
      const prev = previousScore(docType);
      setResult({ ...r, insights, text, prev });
      setThinking(false);
      onResult(r);
    }, 700);
  }

  const onKeyDown = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); };

  return (
    <>
      <div className="page-head">
        <div className="kicker">✎ your personal review desk</div>
        <h1>CV <span>reviewer</span></h1>
        <p>Upload or paste your document and get honest, structured feedback in seconds.</p>
      </div>

      <div className="review-grid">
        <section className="card">
          <span className="tape left" />
          <div className="form-top">
            <span className="step">step 01</span>
            <div className="mini-actions">
              <button className="chip" onClick={loadSample}>✨ try a sample</button>
              <button className="chip" onClick={clearAll}>↺ clear</button>
            </div>
          </div>
          <h2 className="form-h">What are we reviewing?</h2>
          <p className="form-sub">Pick a document type and add some context for sharper feedback.</p>

          <div className={`doc-toggle ${isCover ? "cover" : ""}`} role="tablist">
            <span className="slider" />
            <button role="tab" aria-selected={!isCover} onClick={() => setDocType("resume")}>📄 Resume / CV</button>
            <button role="tab" aria-selected={isCover} onClick={() => setDocType("cover")}>💌 Cover letter</button>
          </div>

          <label className="field-label" htmlFor="role">Target job title <small>OPTIONAL</small></label>
          <input id="role" className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Marketing Intern" {...focusProps} />

          {isCover && (
            <>
              <label className="field-label" htmlFor="company">Organisation name <small>RECOMMENDED</small></label>
              <input id="company" className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Safaricom" {...focusProps} />
            </>
          )}

          <label className="field-label" htmlFor="job">Job description <small>RECOMMENDED</small></label>
          <textarea id="job" className="textarea" rows={3} value={job} onChange={(e) => setJob(e.target.value)} placeholder="Paste the job advert to see which keywords you match…" {...focusProps} />

          <div className="lace" />
          <span className="step">step 02</span>
          <h2 className="form-h">Add your {isCover ? "cover letter" : "CV"}</h2>

          <label
            className={`upload ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files[0]); }}
          >
            <span className="up-icon">{reading ? "⏳" : dragging ? "📥" : "☁️"}</span>
            <strong>{reading ? "Reading your file…" : fileName || "Drop your file here or click to choose"}</strong>
            <small>PDF, DOCX or TXT · read privately in your browser · max 10 MB</small>
            <input type="file" accept=".pdf,.docx,.txt,.doc" onChange={(e) => { readFile(e.target.files[0]); e.target.value = ""; }} />
          </label>
          <div className="or">or paste it here</div>
          <textarea
            className="textarea lined" rows={11} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown}
            placeholder={isCover ? "Dear Hiring Manager, …" : "Your name, contact details, profile, experience, education, skills…"}
            {...focusProps}
          />
          <div className="word-count">{words} words · draft saved in this tab ✓</div>

          {live && (
            <div className="live-meter" aria-live="polite">
              <div className="live-top">
                <span>⚡ live check</span>
                <b>{live.score}<small>/100</small></b>
                <span className="live-band">{live.band}</span>
              </div>
              <div className="bar"><i style={{ "--w": `${live.score}%`, width: `${live.score}%`, animation: "none" }} /></div>
              {live.top && <p>Next best fix: <b>{live.top.name}</b> — {live.top.recommendation}</p>}
            </div>
          )}

          <p className="privacy">◈ Everything stays in your browser. Please leave out your ID number and full home address.</p>
          <button className="btn big" onClick={run} disabled={thinking || reading}>
            {thinking ? "Mochi is reading… ( ˘▽˘)っ📄" : "✦ get my full review ✦"}
          </button>
          <p className="demo-note">Tip: press Ctrl + Enter in the text box to review. Demo mode uses rule-based checks, not real AI.</p>
        </section>

        <aside className="card dotted">
          <h3 className="card-title">what we check</h3>
          <ul className="coverage">
            {RUBRIC[docType].categories.map((c) => (
              <li key={c.id}><span className="pts">{c.max}</span><span><b>{c.name}</b><small>{c.checks}</small></span></li>
            ))}
          </ul>
          <div className="tip-note"><b>✧ what you’ll get:</b> a score, a highlighted copy of your text, bullet rewrites, keyword match and interview questions.</div>
        </aside>
      </div>

      <div ref={resultsRef}>{result && <Results r={result} notify={notify} />}</div>
    </>
  );
}
