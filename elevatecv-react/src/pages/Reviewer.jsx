import { useEffect, useRef, useState } from "react";
import { RUBRIC } from "../rubric.js";
import { analyse } from "../reviewEngine.js";
import Results from "../components/Results.jsx";

export default function Reviewer({ onResult, notify, setCalm }) {
  const [docType, setDocType] = useState("resume");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [job, setJob] = useState("");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [thinking, setThinking] = useState(false);
  const resultsRef = useRef(null);
  const isCover = docType === "cover";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => { if (result) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [result]);

  // Make bubbles faint while the user is typing
  const focusProps = { onFocus: () => setCalm(true), onBlur: () => setCalm(false) };

  async function onFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { notify("That file is over 10 MB (｡•́︿•̀｡)"); e.target.value = ""; return; }
    setFileName(file.name);
    if (file.name.toLowerCase().endsWith(".txt")) { setText(await file.text()); notify("Text file loaded ✿"); }
    else notify("For now, please paste the text from your PDF/Word file into the box ♡");
  }

  function run() {
    if (!text.trim()) { notify(`Paste your ${isCover ? "cover letter" : "CV"} first ♡`); return; }
    setThinking(true);
    setTimeout(() => {
      const r = analyse(text, role, job, company, docType);
      setResult(r);
      setThinking(false);
      onResult(r);
    }, 900);
  }

  return (
    <>
      <div className="page-head">
        <div className="kicker">✎ your personal review desk</div>
        <h1>CV <span>reviewer</span></h1>
        <p>Share your document and get structured, honest feedback you can act on.</p>
      </div>

      <div className="review-grid">
        <section className="card">
          <span className="tape left" />
          <span className="step">step 01</span>
          <h2 className="form-h">What are we reviewing?</h2>
          <p className="form-sub">Pick a document type and add some context for better feedback.</p>

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

          <label className="field-label" htmlFor="job">Job description <small>OPTIONAL</small></label>
          <textarea id="job" className="textarea" rows={3} value={job} onChange={(e) => setJob(e.target.value)} placeholder="Paste the job advert to check keyword alignment…" {...focusProps} />

          <div className="lace" />
          <span className="step">step 02</span>
          <h2 className="form-h">Add your {isCover ? "cover letter" : "CV"}</h2>

          <label className="upload">
            <span className="up-icon">☁️</span>
            <strong>{fileName || "Choose a file"}</strong>
            <small>.txt files are read automatically · PDF/Word: paste the text below · max 10 MB</small>
            <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={onFile} />
          </label>
          <div className="or">or paste it here</div>
          <textarea
            className="textarea lined" rows={10} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={isCover ? "Dear Hiring Manager, …" : "Your name, contact details, profile, experience, education, skills…"}
            {...focusProps}
          />
          <div className="word-count">{words} words {words > 0 && words < 120 ? "· add more for a better review" : ""}</div>
          <p className="privacy">◈ Everything stays in your browser. Please avoid adding your ID number or full home address.</p>
          <button className="btn big" onClick={run} disabled={thinking}>
            {thinking ? "Mochi is reading… ( ˘▽˘)っ📄" : "✦ review my document ✦"}
          </button>
          <p className="demo-note">Demo mode: rule-based checks of the rubric, not real AI yet.</p>
        </section>

        <aside className="card dotted">
          <h3 className="card-title">what we check</h3>
          <ul className="coverage">
            {RUBRIC[docType].categories.map((c) => (
              <li key={c.id}><span className="pts">{c.max}</span><span><b>{c.name}</b><small>{c.checks}</small></span></li>
            ))}
          </ul>
          <div className="tip-note"><b>✧ pro tip:</b> paste the job description — tailored CVs are stronger than generic ones!</div>
        </aside>
      </div>

      <div ref={resultsRef}>{result && <Results r={result} />}</div>
    </>
  );
}
