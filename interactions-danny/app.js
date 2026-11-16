/*
  ElevateCV — app logic
  ---------------------------------------------------------------
  - Page navigation
  - Rubric-based demo review engine (uses RUBRIC and WORDS from rubric.js)
  - Review history (saved in this browser)
  - Footer links / YouTube playlist and the demo admin screen

  IMPORTANT: the review engine below is a rule-based demo. It checks
  patterns in the text against the Harvard-based rubric. It is not an
  AI model. See README.md for how to connect a real AI service.
*/

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const DEFAULTS = {
  playlist: "https://www.youtube.com/playlist?list=PLhjLO-ekrsRu1FXl1Sx3yAl0pL_5c75bv",
  instagram: "@Cvreviewer",
  tiktok: "Cvreviewer"
};
const DEFAULT_EMBED = "https://www.youtube.com/embed/videoseries?list=PLhjLO-ekrsRu1FXl1Sx3yAl0pL_5c75bv";
const ADMIN_PASSCODE = "elevate-admin"; // Demo only. Replace with real server-side authentication before publishing.

let docType = "resume"; // "resume" or "cover"

/* ---------- Safe browser storage ---------- */
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } },
  remove(key) { try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ } }
};
let reviews = store.get("elevatecv_reviews", []);

/* ---------- Helpers ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function showToast(message) {
  const t = $("#toast"); t.textContent = message; t.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => t.classList.remove("show"), 2800);
}
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const shorten = (s, n = 140) => (s.length > n ? s.slice(0, n - 1).trim() + "…" : s);
function bandFor(score) { return RUBRIC.bands.find(b => score >= b.min); }

/* ---------- Navigation ---------- */
const PAGE_NAMES = { overview: "Overview", reviewer: "CV reviewer", history: "Review history", guide: "CV guide", admin: "Admin settings" };
function go(page) {
  $$(".page").forEach(p => p.classList.remove("active"));
  $("#page-" + page).classList.add("active");
  $$(".nav-item[data-page]").forEach(n => n.classList.toggle("active", n.dataset.page === page));
  $("#crumb").textContent = PAGE_NAMES[page];
  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (page === "history") renderHistory();
}
$$(".nav-item[data-page]").forEach(b => b.addEventListener("click", () => go(b.dataset.page)));
$$("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#year").textContent = new Date().getFullYear();

/* ---------- Document type switch ---------- */
function setDocType(type) {
  docType = type;
  $$(".doc-option").forEach(b => {
    const on = b.dataset.doc === type;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on);
  });
  const isCover = type === "cover";
  $("#companyField").classList.toggle("hidden", !isCover);
  $("#docStepTitle").textContent = isCover ? "Add your cover letter" : "Add your CV";
  $("#docStepText").textContent = isCover ? "Upload a .txt file or paste your cover letter below." : "Upload a .txt file or paste your CV text below.";
  $("#cvText").placeholder = isCover
    ? "Paste your cover letter here, from the greeting (Dear …) to your sign-off…"
    : "Paste the text from your CV here. Include your contact details, profile, experience, education and skills…";
  $("#orLabel").textContent = isCover ? "OR PASTE YOUR COVER LETTER" : "OR PASTE YOUR CV TEXT";
  renderCoverage();
}
$$(".doc-option").forEach(b => b.addEventListener("click", () => setDocType(b.dataset.doc)));

function renderCoverage() {
  const cats = RUBRIC[docType].categories;
  $("#coverageList").innerHTML = cats.map((c, i) =>
    `<div><span class="coverage-icon">${c.max}</span><span><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.checks)}</small></span></div>`
  ).join("");
  $("#coverageTitle").textContent = `What your ${docType === "cover" ? "cover letter" : "CV"} review covers`;
}

/* ---------- Footer settings ---------- */
function normalizeUrl(value, platform) {
  const v = (value || "").trim();
  if (!v) return platform === "instagram" ? "https://www.instagram.com/Cvreviewer/" : "https://www.tiktok.com/@Cvreviewer";
  if (/^https?:\/\//i.test(v)) return v;
  const name = v.replace(/^@/, "");
  return platform === "instagram" ? `https://www.instagram.com/${name}/` : `https://www.tiktok.com/@${name}`;
}
function playlistEmbed(url) {
  try {
    const list = new URL(url).searchParams.get("list");
    return list ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}` : DEFAULT_EMBED;
  } catch (e) { return DEFAULT_EMBED; }
}
function loadFooterSettings() {
  const s = store.get("elevatecv_footer", null) || DEFAULTS;
  $("#instagramLink").href = normalizeUrl(s.instagram, "instagram");
  $("#tiktokLink").href = normalizeUrl(s.tiktok, "tiktok");
  $("#youtubeFrame").src = playlistEmbed(s.playlist);
  $("#adminPlaylist").value = s.playlist;
  $("#adminInstagram").value = s.instagram;
  $("#adminTikTok").value = s.tiktok;
}

/* ---------- File input ---------- */
$("#cvFile").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  $("#fileName").textContent = file.name;
  if (file.size > 10 * 1024 * 1024) {
    showToast("Please choose a file smaller than 10 MB.");
    e.target.value = ""; $("#fileName").textContent = "No file selected"; return;
  }
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "txt") { $("#cvText").value = await file.text(); showToast("Text file loaded."); }
  else showToast("File selected. For this demo, please paste the text into the box below — PDF/DOCX reading needs a document parser.");
});

/* =================================================================
   REVIEW ENGINE (rule-based demo of the Harvard rubric)
   Each category function returns:
   { score, issue, recommendation, quote?, example? }
   ================================================================= */

function prepare(text, role, job, company) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean);
  const bullets = lines.filter(l => /^([•\-–*▪◦●·]|\d+[.)])\s*/.test(l));
  // Every line of 4+ words (bullet marker removed) counts as a "statement"
  const statements = lines
    .map(l => l.replace(/^([•\-–*▪◦●·]|\d+[.)])\s*/, ""))
    .filter(l => l.split(/\s+/).length >= 4);
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter(s => s.split(/\s+/).length >= 3);
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  // Job description keywords
  let jobTerms = [];
  if (job.trim()) {
    const terms = job.toLowerCase().match(/[a-z][a-z+#.\-]{3,}/g) || [];
    jobTerms = [...new Set(terms.map(t => t.replace(/[.\-]+$/, "")))].filter(w => w.length >= 4 && !WORDS.stopWords.includes(w));
  }
  const matchedTerms = jobTerms.filter(w => new RegExp("\\b" + escapeRegex(w) + "\\b").test(lower));
  const missingTerms = jobTerms.filter(w => !matchedTerms.includes(w));
  const keywordFit = jobTerms.length ? matchedTerms.length / jobTerms.length : 0;

  return { text, lower, lines, words, bullets, statements, sentences, paragraphs, role: role.trim(), job: job.trim(), company: company.trim(), jobTerms, matchedTerms, missingTerms, keywordFit };
}

function findPhrase(d, phrases) {
  for (const p of phrases) {
    const re = new RegExp("\\b" + escapeRegex(p) + "\\b", "i");
    const line = d.lines.find(l => re.test(l));
    if (line) return { phrase: p, line };
  }
  return null;
}
function countPhrases(d, phrases) {
  return phrases.reduce((n, p) => n + (d.lower.match(new RegExp("\\b" + escapeRegex(p) + "\\b", "g")) || []).length, 0);
}
function startsWithActionVerb(line) {
  const first = (line.replace(/^([•\-–*▪◦●·]|\d+[.)])\s*/, "").split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, "");
  return WORDS.actionVerbs.includes(first);
}
function hasNumber(line) { return /(\d+%|\d+\+?|\$\s?\d|ksh\s?\d|kes\s?\d|£\s?\d|€\s?\d)/i.test(line); }
function findMisspellings(d) {
  const found = [];
  for (const [wrong, right] of Object.entries(WORDS.misspellings)) {
    if (new RegExp("\\b" + wrong + "\\b", "i").test(d.text)) found.push({ wrong, right });
  }
  return found;
}
function dateFormats(d) {
  const formats = new Set();
  if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4}\b/i.test(d.text)) formats.add("Month YYYY");
  if (/\b\d{1,2}\/\d{4}\b/.test(d.text)) formats.add("MM/YYYY");
  if (/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(d.text)) formats.add("DD/MM/YYYY");
  if (/\b\d{4}-\d{2}\b/.test(d.text)) formats.add("YYYY-MM");
  if (/\b'\d{2}\b/.test(d.text)) formats.add("'YY");
  return [...formats];
}
function sensitiveInfo(d) {
  const flags = [];
  if (/\b(date of birth|d\.o\.b|dob|born on|birth date)\b/i.test(d.text)) flags.push("date of birth");
  if (/\b(marital status|married|single|divorced|widowed)\b/i.test(d.text) && /\b(marital|status)\b/i.test(d.text)) flags.push("marital status");
  if (/\b(national id|id no|id number|passport no|passport number|huduma)\b/i.test(d.text)) flags.push("national ID / passport number");
  if (/\b(religion|tribe|ethnicity)\s*:/i.test(d.text)) flags.push("religion or ethnicity");
  if (/\b(p\.?\s?o\.?\s?box|house no|apartment|street|road|avenue)\b.*\d|\d+\s+\w+\s+(street|road|avenue|lane|drive)\b/i.test(d.text)) flags.push("full home address");
  if (/\b(gender|sex)\s*:/i.test(d.text)) flags.push("gender");
  return flags;
}

/* ---------- Resume categories ---------- */
const RESUME_CHECKS = {
  contact(d) {
    let s = 0; const missing = [];
    const email = (d.text.match(/[\w.+-]+@[\w-]+\.[\w.]+/) || [])[0];
    if (email) {
      s += 4;
      const unprofessional = WORDS.unprofessionalEmail.some(w => email.toLowerCase().split("@")[0].includes(w));
      if (unprofessional) s -= 2;
    } else missing.push("email address");
    if (/(\+?\d[\d\s().-]{7,}\d)/.test(d.text)) s += 3; else missing.push("phone number");
    if (/linkedin|github|portfolio|behance|website|\.com\//i.test(d.text)) s += 2; else missing.push("LinkedIn or portfolio link (if relevant)");
    if (/\b(nairobi|mombasa|kisumu|nakuru|eldoret|kenya|city|town|county|remote|[A-Z][a-z]+,\s?[A-Z][a-z]+)\b/.test(d.text)) s += 1; else missing.push("city/country");
    const sens = sensitiveInfo(d);
    s -= Math.min(3, sens.length);
    s = clamp(s, 0, 10);
    let issue = "Contact details look complete.", rec = "Keep your contact section short: name, email, phone, LinkedIn and city.";
    if (sens.length) { issue = `Includes unnecessary personal details: ${sens.join(", ")}.`; rec = "Remove these details. Employers only need your name, professional email, phone, city and relevant links."; }
    else if (missing.length) { issue = `Missing: ${missing.join(", ")}.`; rec = "Add the missing details at the top of your CV, under your name."; }
    if (email && WORDS.unprofessionalEmail.some(w => email.toLowerCase().split("@")[0].includes(w))) { issue = "Your email address may look unprofessional."; rec = "Use a simple address such as firstname.lastname@… for applications."; }
    return { score: s, issue, recommendation: rec, quote: email && issue.includes("email") ? email : null };
  },

  formatting(d) {
    let s = 0;
    const headings = d.lines.filter(l => l.length < 40 && (/^[A-Z\s&/]+$/.test(l) || /^(profile|summary|experience|work experience|education|skills|projects|certifications|awards|volunteering|leadership|languages|interests|references)\b/i.test(l)));
    if (headings.length >= 3) s += 5; else if (headings.length >= 1) s += 2;
    const bulletLines = d.lines.filter(l => /^([•\-–*▪◦●·])\s*/.test(l));
    if (bulletLines.length >= 4) s += 4; else if (bulletLines.length >= 1) s += 2;
    const longLines = d.lines.filter(l => l.split(/\s+/).length > 40);
    if (longLines.length === 0) s += 3; else if (longLines.length <= 2) s += 1;
    if (d.words.length >= 200 && d.words.length <= 900) s += 3; else if (d.words.length >= 120 && d.words.length <= 1200) s += 1;
    if (d.words.length < 150) s -= 3; // very short CVs rarely give enough detail
    s = clamp(s, 0, 15);
    let issue = "Layout looks easy to scan.", rec = "Keep headings, spacing and bullet styles consistent.";
    if (headings.length < 3) { issue = "Section headings are hard to identify."; rec = "Use clear headings such as PROFILE, EXPERIENCE, EDUCATION and SKILLS on their own lines."; }
    else if (bulletLines.length < 4) { issue = "Few bullet points — experience may be written as long paragraphs."; rec = "Break experience into 2–5 short bullet points per role."; }
    else if (longLines.length) { issue = "Some lines are very long and hard to scan."; rec = "Keep each bullet to one or two lines."; }
    else if (d.words.length < 200) { issue = "The CV is quite short."; rec = "Add relevant projects, coursework, volunteering or achievements."; }
    else if (d.words.length > 900) { issue = "The CV is long."; rec = "Students and early-career applicants usually aim for one page. Cut less relevant detail."; }
    return { score: s, issue, recommendation: rec, quote: longLines[0] ? shorten(longLines[0]) : null };
  },

  sections(d) {
    let s = 0; const missing = [];
    if (/\beducation|university|college|degree|diploma|bachelor|master|high school|secondary\b/i.test(d.text)) s += 3; else missing.push("Education");
    if (/\bexperience|employment|internship|projects?|volunteer|work history\b/i.test(d.text)) s += 3; else missing.push("Experience or Projects");
    if (/\bskills|competencies|technical|languages\b/i.test(d.text)) s += 2; else missing.push("Skills");
    const years = d.text.match(/\b(19|20)\d{2}\b/g) || [];
    if (years.length >= 2) s += 2; else missing.push("dates for your roles and education");
    return {
      score: s,
      issue: missing.length ? `Missing: ${missing.join(", ")}.` : "All key sections are present.",
      recommendation: missing.length ? "Add the missing sections and list experience in reverse chronological order (most recent first)." : "Order sections by importance for the role you want."
    };
  },

  experience(d) {
    const st = d.statements.length ? d.statements : d.sentences;
    const total = Math.max(1, st.length);
    const actionCount = st.filter(startsWithActionVerb).length;
    const quantCount = st.filter(hasNumber).filter(l => !/^\s*(19|20)\d{2}\s*[-–]/.test(l)).length;
    const weak = findPhrase(d, WORDS.weakPhrases);
    const weakCount = countPhrases(d, WORDS.weakPhrases);
    let s = 0;
    s += 9 * clamp(actionCount / Math.max(3, total * 0.6), 0, 1);
    s += 6 * clamp(quantCount / Math.max(2, total * 0.3), 0, 1);
    s += weakCount === 0 ? 5 : weakCount <= 2 ? 2 : 0;
    if (d.jobTerms.length) s += 5 * clamp(d.keywordFit / 0.6, 0, 1);
    else if (d.role) s += d.lower.includes(d.role.toLowerCase().split(" ")[0]) ? 4 : 2;
    else s += 2;
    if (d.words.length < 200) s -= 3;
    s = Math.round(clamp(s, 0, 25));
    let issue = "Experience is described with action verbs and evidence.", rec = "Keep adding outcomes where you can verify them.", quote = null, example = null;
    if (weak) {
      issue = `Weak phrase “${weak.phrase}” hides your specific contribution.`;
      quote = shorten(weak.line);
      rec = "Start with a strong action verb, name the task or tool, and add the result if you can verify it.";
      example = "Structure to use: [Action verb] + [what you did / tool or audience] + [result or scope]. E.g. “Created and scheduled weekly Instagram posts for the student club” — add a number only if you tracked it.";
    } else if (actionCount < total * 0.4) {
      issue = "Many statements do not start with an action verb.";
      const line = st.find(l => !startsWithActionVerb(l)); quote = line ? shorten(line) : null;
      rec = "Begin bullets with verbs such as Led, Created, Organised, Analysed, Developed or Improved.";
    } else if (quantCount < 2) {
      issue = "Few results or measurable outcomes.";
      rec = "Where true, add numbers (people, %, time saved, budget). If you have none, describe the scope, tools, audience or outcome instead — never invent figures.";
    }
    return { score: s, issue, recommendation: rec, quote, example };
  },

  skills(d) {
    let s = 0;
    const skillsLineIdx = d.lines.findIndex(l => /^skills|technical skills|key skills|core competencies/i.test(l));
    if (skillsLineIdx >= 0) s += 5;
    const skillText = skillsLineIdx >= 0 ? d.lines.slice(skillsLineIdx, skillsLineIdx + 6).join(", ") : "";
    const items = skillText.split(/[,;•|\n]/).map(x => x.trim()).filter(x => x && x.length < 40).length;
    if (items >= 6) s += 3; else if (items >= 3) s += 2;
    if (d.jobTerms.length) s += Math.round(7 * clamp(d.keywordFit / 0.6, 0, 1));
    else s += 4;
    s = clamp(s, 0, 15);
    let issue = "Skills are listed and relevant.", rec = "Back up key skills with an example in your experience section.";
    if (skillsLineIdx < 0) { issue = "No clear Skills section found."; rec = "Add a short Skills section (technical, software, languages, transferable skills) — only skills you can demonstrate."; }
    else if (d.jobTerms.length && d.keywordFit < 0.6) { issue = `Some job-description keywords are missing: ${d.missingTerms.slice(0, 6).join(", ")}.`; rec = "If you genuinely have these skills, add them naturally to your skills and experience sections."; }
    else if (!d.jobTerms.length) { issue = "Keyword match not checked — no job description provided."; rec = "Paste a job description to check how well your skills align with the role."; }
    return { score: s, issue, recommendation: rec };
  },

  education(d) {
    let s = 0; const missing = [];
    if (/\b(bachelor|master|degree|diploma|certificate|b\.?sc|b\.?a|m\.?sc|mba|phd|kcse|high school|secondary)\b/i.test(d.text)) s += 2; else missing.push("degree or qualification");
    if (/\b(university|college|institute|school|academy)\b/i.test(d.text)) s += 2; else missing.push("institution");
    if (/\b(expected|graduat|class of|20\d{2})\b/i.test(d.text)) s += 2; else missing.push("graduation date");
    const extras = ["coursework", "honours", "honors", "dean", "award", "scholarship", "certification", "certified", "project", "gpa", "first class", "second class"].filter(w => d.lower.includes(w));
    s += Math.min(4, extras.length * 2);
    return {
      score: clamp(s, 0, 10),
      issue: missing.length ? `Missing: ${missing.join(", ")}.` : extras.length ? "Education section is clear." : "Education lacks supporting detail.",
      recommendation: missing.length ? "Include your qualification, institution and (expected) graduation date." : extras.length ? "Link coursework or projects to the role you want." : "Add relevant coursework, projects, honours or certifications where they support your target role."
    };
  },

  accuracy(d) {
    let s = 15;
    const typos = findMisspellings(d);
    s -= Math.min(6, typos.length * 2);
    const formats = dateFormats(d);
    if (formats.length > 1) s -= 3;
    const exaggerations = WORDS.exaggerations.filter(w => d.lower.includes(w));
    s -= Math.min(4, exaggerations.length * 2);
    const firstPerson = (d.text.match(/\b(I|my|me)\b/g) || []).length;
    if (firstPerson > 3) s -= 2;
    s = clamp(s, 0, 15);
    let issue = "No obvious spelling or consistency problems found.", rec = "Still proofread carefully — this demo only catches common errors.", quote = null;
    if (typos.length) { issue = `Possible spelling errors: ${typos.slice(0, 4).map(t => `“${t.wrong}” → “${t.right}”`).join(", ")}.`; rec = "Correct these and run a full spell-check."; quote = typos[0].wrong; }
    else if (formats.length > 1) { issue = `Mixed date formats (${formats.join(", ")}).`; rec = "Use one format throughout, e.g. “Jan 2024 – May 2025”."; }
    else if (exaggerations.length) { issue = `Possibly exaggerated wording: “${exaggerations[0]}”.`; rec = "Replace with specific, factual evidence of what you did."; quote = exaggerations[0]; }
    else if (firstPerson > 3) { issue = "Frequent use of “I/my/me”."; rec = "Resumes are usually written without personal pronouns, e.g. “Led…” instead of “I led…”."; }
    return { score: s, issue, recommendation: rec, quote };
  },

  ats(d) {
    let s = 10;
    const tableLike = d.lines.filter(l => (l.match(/\|/g) || []).length >= 2 || (l.match(/\t/g) || []).length >= 2).length >= 3;
    if (tableLike) s -= 3;
    const emoji = d.text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}★☆✓✔✗➤►]/gu) || [];
    if (emoji.length) s -= 2;
    const standard = ["experience", "education", "skills"].filter(h => new RegExp("^\\s*(work\\s+|professional\\s+|technical\\s+|key\\s+)?" + h, "im").test(d.text)).length;
    if (standard < 2) s -= 3;
    if (d.lines.some(l => l.split(/\s+/).length > 60)) s -= 2;
    s = clamp(s, 0, 10);
    let issue = "Structure looks ATS-friendly.", rec = "Export to PDF from Word/Google Docs and check the text can be selected.";
    if (tableLike) { issue = "Text looks like it comes from a table or columns."; rec = "Use a single-column layout without tables or text boxes."; }
    else if (emoji.length) { issue = "Uses symbols or emoji that ATS may not read."; rec = "Replace icons and symbols with plain text labels."; }
    else if (standard < 2) { issue = "Uses non-standard section headings."; rec = "Use standard headings: Experience, Education, Skills."; }
    return { score: s, issue, recommendation: rec };
  }
};

/* ---------- Cover letter categories ---------- */
const COVER_CHECKS = {
  format(d) {
    let s = 0; const n = d.words.length;
    s += n >= 250 && n <= 450 ? 8 : (n >= 180 && n <= 550 ? 5 : 2);
    s += d.paragraphs.length >= 3 && d.paragraphs.length <= 6 ? 4 : d.paragraphs.length >= 2 ? 2 : 0;
    s += /^\s*(dear|to whom|hello)\b/im.test(d.text) ? 3 : 0;
    let issue = "Length and structure look appropriate.", rec = "Keep it to one page with 3–5 short paragraphs.";
    if (n > 550) { issue = `The letter is long (${n} words).`; rec = "Aim for about 250–400 words so it fits on one page."; }
    else if (n < 180) { issue = `The letter is short (${n} words).`; rec = "Add one or two specific examples that connect your experience to the role."; }
    else if (d.paragraphs.length < 3) { issue = "The letter is not broken into clear paragraphs."; rec = "Use an opening, 1–2 evidence paragraphs and a closing, separated by blank lines."; }
    else if (!/^\s*(dear|to whom|hello)\b/im.test(d.text)) { issue = "No professional greeting found."; rec = "Start with “Dear [Name]” — or “Dear Hiring Manager” if you cannot find a name."; }
    return { score: clamp(s, 0, 15), issue, recommendation: rec };
  },

  opening(d) {
    const first = (d.paragraphs.find(p => !/^\s*(dear|to whom|hello)\b[^\n]*$/i.test(p)) || d.paragraphs[0] || "").toLowerCase();
    let s = 0; const missing = [];
    const roleWord = d.role ? d.role.toLowerCase() : null;
    if ((roleWord && first.includes(roleWord.split(" ")[0])) || /\b(position|role|internship|vacancy|post|opportunity)\b/.test(first)) s += 5; else missing.push("the role you are applying for");
    if (/\b(apply|applying|application|interest|excited|keen)\b/.test(first)) s += 5; else missing.push("why you are applying");
    if (/\b(advert|advertised|posting|posted|linkedin|career fair|website|referred|recommended|brightermonday|fuzu|indeed|saw)\b/.test(first)) s += 5; else missing.push("how you found the opportunity");
    return {
      score: s,
      issue: missing.length ? `Opening does not clearly state ${missing.join(", ")}.` : "Clear opening with role, purpose and source.",
      recommendation: missing.length ? "In your first two sentences, name the role and organisation, say why you are interested and where you saw the vacancy." : "Keep the opening to two or three sentences.",
      quote: first ? shorten(first) : null
    };
  },

  tailoring(d) {
    let s = 0;
    if (d.company) s += new RegExp(escapeRegex(d.company.toLowerCase())).test(d.lower) ? 8 : 0;
    else s += /\b(your company|your organisation|your organization|your team)\b/.test(d.lower) ? 2 : 3;
    if (d.role) s += d.lower.includes(d.role.toLowerCase().split(" ")[0]) ? 5 : 0; else s += 3;
    if (d.jobTerms.length) s += Math.round(12 * clamp(d.keywordFit / 0.5, 0, 1)); else s += 5;
    if (d.words.length < 180) s = Math.min(s, 20); // too short to address the role in depth
    s = clamp(s, 0, 25);
    let issue = "Letter is tailored to the employer and role.", rec = "Mention one specific thing you admire about the organisation’s work.";
    if (d.company && !d.lower.includes(d.company.toLowerCase())) { issue = `The organisation (“${d.company}”) is never mentioned.`; rec = "Name the employer and show you have researched them — their mission, a project or a recent achievement."; }
    else if (d.words.length < 180) { issue = "The letter is too short to show how you meet the role’s requirements."; rec = "Add a paragraph linking 2–3 job requirements to your own experience."; }
    else if (!d.company) { issue = "Tailoring not fully checked — no organisation name provided."; rec = "Enter the organisation name above, and make sure the letter mentions it and the role."; }
    else if (d.jobTerms.length && d.keywordFit < 0.5) { issue = `Job requirements not addressed: ${d.missingTerms.slice(0, 5).join(", ")}.`; rec = "Pick 2–3 key requirements from the job description and show how you meet them."; }
    else if (!d.jobTerms.length) { issue = "No job description provided to check alignment."; rec = "Paste the job description to see which requirements your letter covers."; }
    return { score: s, issue, recommendation: rec };
  },

  evidence(d) {
    const exampleSentences = d.sentences.filter(s =>
      (WORDS.actionVerbs.some(v => new RegExp("\\b" + v + "\\b", "i").test(s)) && (hasNumber(s) || /\b(project|course|internship|club|team|volunteer|event|research|campaign|role at|while at|during)\b/i.test(s)))
      || /\b(for example|for instance|such as when)\b/i.test(s));
    const n = exampleSentences.length;
    const claims = d.sentences.filter(s => /\b(i am|i'm)\s+(a\s+)?(hard[- ]working|passionate|dedicated|motivated|team player|fast learner|detail[- ]oriented|reliable)\b/i.test(s));
    let s = n >= 3 ? 25 : n === 2 ? 20 : n === 1 ? 12 : 4;
    if (claims.length > 1) s -= 4;
    if (d.words.length < 180) s = Math.min(s, 15); // too short to develop examples
    s = clamp(s, 0, 25);
    let issue = "Uses specific examples to support claims.", rec = "Make sure each example ends with what you achieved or learned.", quote = null;
    if (n >= 2 && d.words.length < 180) { issue = "Good examples, but they need more detail."; rec = "Expand each example: what the situation was, what you did and what changed as a result."; }
    if (n < 2) { issue = "Few specific examples of your experience."; rec = "Add two or three short stories: the situation, what you did, and the result (only true details)."; }
    if (claims.length > 1) { issue = "Describes qualities (e.g. “hard-working”) without showing evidence."; quote = shorten(claims[0]); rec = "Replace self-descriptions with an example that proves the quality."; }
    return { score: s, issue, recommendation: rec, quote };
  },

  value(d) {
    const give = (d.lower.match(/\b(contribute|bring|add value|support your|help your|help the team|deliver|benefit your|strengthen your)\b/g) || []).length;
    const take = (d.lower.match(/\b(i want to (gain|learn)|i hope to (gain|learn)|this will help me|build my career|advance my career|gain experience)\b/g) || []).length;
    let s = give >= 2 ? 10 : give === 1 ? 7 : 3;
    if (take > give) s -= 3;
    s = clamp(s, 0, 10);
    return {
      score: s,
      issue: give === 0 ? "Doesn’t explain what you would contribute to the employer." : take > give ? "Focuses more on what you want to gain than what you offer." : "Explains what you can contribute.",
      recommendation: give === 0 || take > give ? "Add a sentence on how your skills will help the team meet its goals." : "Keep connecting your skills to the employer’s needs."
    };
  },

  tone(d) {
    let s = 10;
    const typos = findMisspellings(d); s -= Math.min(4, typos.length * 2);
    const iStarts = d.sentences.filter(x => /^\s*I\b/.test(x)).length;
    const iRatio = iStarts / Math.max(1, d.sentences.length);
    if (iRatio > 0.5) s -= 3;
    const casual = WORDS.casual.filter(w => new RegExp("\\b" + escapeRegex(w) + "\\b", "i").test(d.text));
    const flowery = WORDS.flowery.filter(w => d.lower.includes(w));
    s -= Math.min(3, (casual.length + flowery.length) * 1.5);
    s = clamp(Math.round(s), 0, 10);
    let issue = "Tone is professional and clear.", rec = "Read it aloud once to check flow.", quote = null;
    if (typos.length) { issue = `Possible spelling errors: ${typos.slice(0, 3).map(t => `“${t.wrong}” → “${t.right}”`).join(", ")}.`; rec = "Correct these and spell-check the whole letter."; quote = typos[0].wrong; }
    else if (iRatio > 0.5) { issue = `Many sentences start with “I” (${iStarts} of ${d.sentences.length}).`; rec = "Vary sentence openings, e.g. “During my internship, I…” or “At X, I…”."; }
    else if (casual.length) { issue = `Casual wording: “${casual[0]}”.`; rec = "Use professional language throughout."; quote = casual[0]; }
    else if (flowery.length) { issue = `Flowery wording: “${flowery[0]}”.`; rec = "Replace with direct, factual language."; quote = flowery[0]; }
    return { score: s, issue, recommendation: rec, quote };
  },

  closing(d) {
    const last = d.paragraphs.slice(-2).join(" ").toLowerCase();
    let s = 0; const missing = [];
    if (/\b(thank you|thanks for|appreciate)\b/.test(last)) s += 3; else missing.push("a thank-you");
    if (/\b(look forward|welcome the opportunity|happy to discuss|discuss|interview|meet|speak with)\b/.test(last)) s += 4; else missing.push("an invitation to discuss further");
    if (/\b(sincerely|kind regards|best regards|yours faithfully|yours sincerely|regards)\b/.test(last)) s += 3; else missing.push("a professional sign-off");
    return {
      score: s,
      issue: missing.length ? `Closing is missing ${missing.join(", ")}.` : "Strong, professional closing.",
      recommendation: missing.length ? "End by restating your interest, inviting a conversation, and signing off with “Kind regards” and your name." : "Keep the closing to two or three sentences."
    };
  }
};

/* ---------- Ethical check ---------- */
function ethicalCheck(d) {
  const flags = [];
  const sens = sensitiveInfo(d);
  if (sens.length) flags.push(`Private information detected (${sens.join(", ")}). Consider removing it — employers do not need it at this stage.`);
  const ex = WORDS.exaggerations.filter(w => d.lower.includes(w));
  if (ex.length) flags.push(`Wording such as “${ex[0]}” may read as exaggerated. Use specific, verifiable evidence instead.`);
  const formats = dateFormats(d);
  if (formats.length > 1) flags.push("Dates use more than one format. Check they are consistent and accurate.");
  const metrics = d.statements.filter(hasNumber).length;
  if (metrics) flags.push("Your document includes numbers or percentages. Keep only those you tracked and can explain in an interview.");
  flags.push("This review never adds experience, numbers or skills for you. Any rewrite should use only information that is true.");
  return flags;
}

/* ---------- Main analysis ---------- */
function analyse(text, role, job, company, type) {
  const d = prepare(text, role, job, company);
  const checks = type === "cover" ? COVER_CHECKS : RESUME_CHECKS;
  const rows = RUBRIC[type].categories.map(cat => {
    const r = checks[cat.id](d);
    return { ...cat, ...r, score: clamp(Math.round(r.score), 0, cat.max) };
  });
  const score = rows.reduce((n, r) => n + r.score, 0);
  const band = bandFor(score);
  const byLoss = [...rows].sort((a, b) => (b.max - b.score) - (a.max - a.score));
  const priorities = byLoss.filter(r => r.score < r.max).slice(0, 3);
  const detailed = byLoss.filter(r => r.score / r.max < 0.8);
  const notes = [];
  if (d.words.length < 120) notes.push("The text is short, so this review may be less reliable. Paste the full document if you can.");
  if (type === "resume" && /\bcurriculum vitae|publications|conferences|research interests\b/i.test(d.text) && d.role && !/research|lecturer|academic|phd|professor/i.test(d.role))
    notes.push("This looks like an academic CV. For non-academic roles, a 1–2 page resume is usually preferred.");
  if (type === "resume" && d.statements.filter(hasNumber).length === 0)
    notes.push("No measurable results found. That’s okay — describe the scope, tools, audience or outcome of your work instead of inventing numbers.");

  return {
    type, role: d.role || (type === "cover" ? "General cover letter" : "General CV review"),
    company: d.company, words: d.words.length, score, band: band.label,
    bandText: band[type], rows, priorities, detailed, ethics: ethicalCheck(d), notes,
    jobChecked: d.jobTerms.length > 0,
    summary: buildSummary(type, score, band, priorities),
    date: new Date().toISOString()
  };
}
function buildSummary(type, score, band, priorities) {
  const doc = type === "cover" ? "cover letter" : "CV";
  if (!priorities.length) return `Your ${doc} meets the rubric well — focus on final proofreading and tailoring for each application.`;
  return `Your ${doc} is rated “${band.label}”; the biggest gains will come from improving ${priorities.map(p => p.name.toLowerCase()).slice(0, 2).join(" and ")}.`;
}

/* ---------- Render results ---------- */
function renderResults(r) {
  const docLabel = RUBRIC[r.type].label;
  const bandClass = r.score >= 90 ? "band-excellent" : r.score >= 75 ? "band-good" : r.score >= 60 ? "band-developing" : "band-major";
  const panel = $("#results");
  panel.classList.remove("hidden");
  panel.innerHTML = `
  <div class="result-top">
    <div>
      <span class="eyebrow">OVERALL ASSESSMENT</span>
      <h2 class="result-title">Your ${r.type === "cover" ? "cover letter" : "CV"} review is ready</h2>
      <p class="result-meta">${escapeHtml(docLabel)} · ${escapeHtml(r.role)}${r.company ? " · " + escapeHtml(r.company) : ""} · ${r.words} words · ${new Date(r.date).toLocaleDateString()}</p>
      <span class="band-chip ${bandClass}">${escapeHtml(r.band)}</span>
      <p class="result-summary">${escapeHtml(r.summary)}</p>
    </div>
    <div class="result-score">${r.score}<small>/ 100</small></div>
  </div>
  <p class="demo-disclaimer">Demo score from a rule-based check of the Harvard-based rubric — not an AI assessment or hiring prediction. Use it as a checklist.</p>

  ${r.priorities.length ? `<div class="priority-box"><h3>Top three priorities</h3><ol>${r.priorities.map(p => `<li><strong>${escapeHtml(p.name)}</strong> — ${escapeHtml(p.recommendation)}</li>`).join("")}</ol></div>` : ""}

  <h3 class="result-section">Rubric scores</h3>
  <div class="rubric-table-wrap"><table class="rubric-table">
    <thead><tr><th>Category</th><th>Score</th><th>Key issue</th><th>Recommendation</th></tr></thead>
    <tbody>${r.rows.map(row => `<tr>
      <td><strong>${escapeHtml(row.name)}</strong></td>
      <td><span class="cat-score">${row.score}<small>/${row.max}</small></span><div class="cat-bar"><i style="width:${Math.round(row.score / row.max * 100)}%"></i></div></td>
      <td>${escapeHtml(row.issue)}</td>
      <td>${escapeHtml(row.recommendation)}</td></tr>`).join("")}
    </tbody>
    <tfoot><tr><td><strong>Total</strong></td><td><span class="cat-score">${r.score}<small>/100</small></span></td><td colspan="2">${escapeHtml(r.bandText)}</td></tr></tfoot>
  </table></div>

  ${r.detailed.length ? `<h3 class="result-section">Detailed feedback</h3>
  <div class="feedback-list">${r.detailed.map(f => `
    <article class="feedback-item">
      <div class="feedback-head"><strong>${escapeHtml(f.issue)}</strong><span class="score-chip">${f.score}/${f.max}</span></div>
      ${f.quote ? `<p class="feedback-quote">“${escapeHtml(f.quote)}”</p>` : ""}
      <p><b>Rubric category:</b> ${escapeHtml(f.name)} (up to ${f.max} points)</p>
      <p><b>Why it matters:</b> ${escapeHtml(f.why)}</p>
      <p><b>Recommendation:</b> ${escapeHtml(f.recommendation)}</p>
      ${f.example ? `<p class="feedback-example">${escapeHtml(f.example)}</p>` : ""}
    </article>`).join("")}</div>` : ""}

  ${r.notes.length ? `<div class="note-box">${r.notes.map(n => `<p>ⓘ ${escapeHtml(n)}</p>`).join("")}</div>` : ""}

  <div class="result-grid">
    <div class="result-box">
      <h3>↗ Action plan</h3>
      <ol>${r.priorities.map((p, i) => `<li><b>${["Highest-impact change", "Second change", "Third change"][i]}:</b> ${escapeHtml(p.recommendation)}</li>`).join("") || "<li>Keep tailoring your document to each role.</li>"}</ol>
      <h4>Final proofreading checklist</h4>
      <ul>${RUBRIC.proofreadingChecklist.map(c => `<li>${escapeHtml(c)}</li>`).join("")}</ul>
    </div>
    <div class="result-box ethics-box">
      <h3>◈ Ethical check</h3>
      <ul>${r.ethics.map(e => `<li>${escapeHtml(e)}</li>`).join("")}</ul>
    </div>
  </div>
  <div class="result-actions"><button class="subtle-button" onclick="window.print()">Print review / Save as PDF</button></div>`;
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

$("#analyseBtn").addEventListener("click", () => {
  const text = $("#cvText").value.trim();
  const role = $("#roleInput").value.trim();
  const job = $("#jobInput").value.trim();
  const company = $("#companyInput").value.trim();
  if (!text) { showToast(`Paste your ${docType === "cover" ? "cover letter" : "CV"} text before starting the review.`); $("#cvText").focus(); return; }
  if (text.split(/\s+/).length < 40) { showToast("That text is very short — paste the full document for a useful review."); }
  const result = analyse(text, role, job, company, docType);
  // Save a light version to history (no CV text is stored)
  reviews.unshift({ type: result.type, role: result.role, company: result.company, score: result.score, band: result.band, words: result.words, improvements: result.priorities.length, date: result.date });
  reviews = reviews.slice(0, 30);
  store.set("elevatecv_reviews", reviews);
  renderStats(); renderHistory(); renderResults(result);
  showToast("Your review is ready.");
});

/* ---------- Stats & history ---------- */
function typeLabel(r) { return r.type === "cover" ? "Cover letter" : "CV"; }
function renderStats() {
  $("#statReviews").textContent = reviews.length;
  $("#statScore").textContent = reviews.length ? reviews[0].score + "/100" : "—";
  $("#statScoreNote").textContent = reviews.length ? `${typeLabel(reviews[0])} · ${reviews[0].band || "Latest review"}` : "Complete a review to see your score";
  $("#statImprove").textContent = reviews.length ? (typeof reviews[0].improvements === "number" ? reviews[0].improvements : reviews[0].improvements.length) : "—";
  const recent = $("#recentRows");
  if (!reviews.length) { recent.className = "empty-row"; recent.textContent = "No reviews yet. Your first review will appear here."; return; }
  recent.className = "";
  recent.innerHTML = reviews.slice(0, 3).map(r => `<div class="review-row"><span class="review-title">${escapeHtml(typeLabel(r))} · ${escapeHtml(r.role)}</span><span>${new Date(r.date).toLocaleDateString()}</span><span><b class="score-chip">${r.score}/100</b></span><span class="status-chip">● ${escapeHtml(r.band || "Completed")}</span></div>`).join("");
}
function renderHistory() {
  const el = $("#historyRows");
  if (!reviews.length) { el.innerHTML = '<div class="empty-row">You have not completed a review yet.</div>'; return; }
  el.innerHTML = reviews.map(r => `<div class="history-item"><div><strong>${escapeHtml(typeLabel(r))} · ${escapeHtml(r.role)}</strong><small>${new Date(r.date).toLocaleString()} · ${r.words} words${r.band ? " · " + escapeHtml(r.band) : ""}</small></div><span class="score-chip">${r.score}/100</span></div>`).join("");
}
$("#clearHistory").addEventListener("click", () => {
  if (!confirm("Clear all review history saved in this browser?")) return;
  reviews = []; store.remove("elevatecv_reviews"); renderStats(); renderHistory(); showToast("Review history cleared.");
});

/* ---------- Admin (demo only) ---------- */
function unlockAdmin() {
  if ($("#adminPass").value === ADMIN_PASSCODE) {
    $("#adminLogin").classList.add("hidden"); $("#adminSettings").classList.remove("hidden"); $("#adminError").textContent = "";
    showToast("Admin settings unlocked for this demo.");
  } else $("#adminError").textContent = "That passcode is not correct.";
}
$("#adminLoginBtn").addEventListener("click", unlockAdmin);
$("#adminPass").addEventListener("keydown", e => { if (e.key === "Enter") unlockAdmin(); });
$("#saveAdmin").addEventListener("click", () => {
  const settings = {
    playlist: $("#adminPlaylist").value.trim() || DEFAULTS.playlist,
    instagram: $("#adminInstagram").value.trim() || DEFAULTS.instagram,
    tiktok: $("#adminTikTok").value.trim() || DEFAULTS.tiktok
  };
  store.set("elevatecv_footer", settings); loadFooterSettings();
  $("#savedLabel").textContent = "SAVED LOCALLY"; showToast("Footer settings saved on this device.");
});
$("#adminLogout").addEventListener("click", () => {
  $("#adminSettings").classList.add("hidden"); $("#adminLogin").classList.remove("hidden"); $("#adminPass").value = "";
});

/* ---------- Start ---------- */
loadFooterSettings();
setDocType("resume");
renderStats();
