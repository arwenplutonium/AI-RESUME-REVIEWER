/*
  Extra insights shown in the results tabs:
  - highlight(): marks weak phrases, action verbs, numbers, typos, private info
  - stats: quick "CV health" numbers
  - quickWins: small fixes (passive voice, repeated verbs, long bullets…)
  - bulletFixes: honest rewrite templates for weak bullets (never adds facts)
  - interviewQuestions: questions an employer might ask from this document
*/
import { WORDS } from "./rubric.js";
import { prepare } from "./reviewEngine.js";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BULLET = /^([•\-–*▪◦●·]|\d+[.)])\s*/;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "answering" -> "answered", "planning" -> "planned", "teaching" -> "taught"
const IRREGULAR = { making: "made", writing: "wrote", running: "ran", teaching: "taught", leading: "led", building: "built", giving: "gave", taking: "took", doing: "did", selling: "sold", buying: "bought", speaking: "spoke", setting: "set", getting: "got", keeping: "kept", meeting: "met", bringing: "brought", thinking: "thought", finding: "found", holding: "held", sending: "sent", spending: "spent", winning: "won", drawing: "drew", choosing: "chose" };
function gerundToPast(word) {
  const w = word.toLowerCase();
  if (IRREGULAR[w]) return IRREGULAR[w];
  const stem = w.slice(0, -3);
  if (/[^aeiou]y$/.test(stem)) return stem.slice(0, -1) + "ied";
  if (/(ee|ye|oe)$/.test(stem)) return stem + "d";
  return stem + "ed";
}

const FIX_VERBS = {
  "responsible for": ["Managed", "Led", "Oversaw"],
  "in charge of": ["Led", "Directed", "Supervised"],
  "helped with": ["Supported", "Coordinated", "Contributed to"],
  "helped to": ["Supported", "Helped", "Contributed to"],
  "assisted with": ["Supported", "Coordinated", "Contributed to"],
  "worked on": ["Developed", "Built", "Delivered"],
  "was involved in": ["Contributed to", "Collaborated on", "Took part in"],
  "were involved in": ["Contributed to", "Collaborated on", "Took part in"],
  "involved in": ["Contributed to", "Collaborated on", "Took part in"],
  "duties included": ["Handled", "Performed", "Managed"],
  "duties include": ["Handle", "Perform", "Manage"],
  "tasked with": ["Delivered", "Completed", "Carried out"]
};

export const VERB_BANK = {
  "Leadership": ["Led", "Directed", "Mentored", "Organised", "Supervised", "Coordinated", "Mobilised"],
  "Communication": ["Presented", "Wrote", "Persuaded", "Negotiated", "Facilitated", "Explained", "Promoted"],
  "Technical": ["Built", "Developed", "Automated", "Configured", "Designed", "Tested", "Programmed"],
  "Research & analysis": ["Analysed", "Investigated", "Evaluated", "Surveyed", "Measured", "Compiled", "Identified"],
  "Results": ["Improved", "Increased", "Reduced", "Saved", "Achieved", "Delivered", "Won"],
  "Helping people": ["Supported", "Resolved", "Advised", "Trained", "Guided", "Served", "Assisted"]
};

const PASSIVE = /\b(was|were|been|being|is|are)\s+(\w+ed|built|made|done|given|taken|led|run|written|chosen|known)\b(\s+by\b)?/i;
const startsWithVerb = (line) => WORDS.actionVerbs.includes((line.replace(BULLET, "").split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, ""));
const trimTo = (s, n) => { const t = s.replace(/[.\s]+$/, ""); if (t.length <= n) return t; const cut = t.slice(0, n); return cut.slice(0, cut.lastIndexOf(" ")) + "…"; };
const lower1 = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const hasNumber = (line) => /(\d+%|\d+\+?|\$\s?\d|ksh\s?\d|kes\s?\d)/i.test(line) && !/^\s*(19|20)\d{2}\b/.test(line);

/* ---------- Highlighter ---------- */
export function highlight(text) {
  const marks = [];
  const add = (re, type, label) => {
    let m;
    const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    while ((m = r.exec(text))) {
      if (!m[0]) { r.lastIndex++; continue; }
      marks.push({ start: m.index, end: m.index + m[0].length, type, label });
    }
  };
  // Order = priority when two marks overlap
  add(/\b(date of birth|d\.o\.b|dob|marital status|national id|id no\.?|id number|passport (?:no|number)|religion|tribe|gender)\b[^\n]*/i, "private", "Private info — consider removing");
  WORDS.weakPhrases.forEach((p) => add(new RegExp(`\\b${esc(p)}\\b`, "i"), "weak", "Weak phrase — start with an action verb instead"));
  WORDS.exaggerations.forEach((p) => add(new RegExp(`\\b${esc(p)}\\b`, "i"), "exag", "May sound exaggerated — use evidence"));
  Object.entries(WORDS.misspellings).forEach(([w, r]) => add(new RegExp(`\\b${w}\\b`, "i"), "typo", `Spelling: did you mean “${r}”?`));
  add(PASSIVE, "passive", "Passive voice — say who did it");
  add(/(?<![\w/-])(\d+(?:[.,]\d+)?\s?%|\d+\+|(?:ksh|kes|\$|£|€)\s?\d[\d,]*|\b\d{1,3}(?:,\d{3})+\b|\b(?!(?:19|20)\d{2}\b)\d+\b(?=\s+(?:people|students|users|clients|customers|members|posts|events|issues|projects|pupils|responses|hours|days|weeks|staff|volunteers|sales|tickets|reports|participants)))/i, "num", "Measurable result ✓");
  // Action verbs at the start of lines
  let offset = 0;
  for (const line of text.split("\n")) {
    const stripped = line.replace(BULLET, "");
    const lead = line.length - stripped.trimStart().length;
    const first = stripped.trimStart().split(/\s+/)[0] || "";
    const clean = first.toLowerCase().replace(/[^a-z]/g, "");
    if (WORDS.actionVerbs.includes(clean)) marks.push({ start: offset + lead, end: offset + lead + first.replace(/[^A-Za-z]+$/, "").length, type: "verb", label: "Strong action verb ✓" });
    // Numbers inside experience-style lines (skip contact lines and years)
    if (!/@|\+\d{3}|linkedin|phone/i.test(line) && (BULLET.test(line) || WORDS.actionVerbs.includes(clean))) {
      const re = /\b\d[\d,.]*\s?%?|\b(one|two|three|four|five|six|seven|eight|nine|ten|dozen|hundred)\b/gi;
      let m;
      while ((m = re.exec(line))) {
        if (/^(19|20)\d{2}$/.test(m[0].trim())) continue;
        marks.push({ start: offset + m.index, end: offset + m.index + m[0].trimEnd().length, type: "num", label: "Measurable detail ✓" });
      }
    }
    offset += line.length + 1;
  }

  marks.sort((a, b) => a.start - b.start || b.end - a.end);
  const kept = [];
  let lastEnd = -1;
  for (const m of marks) if (m.start >= lastEnd) { kept.push(m); lastEnd = m.end; }

  const parts = [];
  let i = 0;
  for (const m of kept) {
    if (m.start > i) parts.push({ text: text.slice(i, m.start) });
    parts.push({ text: text.slice(m.start, m.end), type: m.type, label: m.label });
    i = m.end;
  }
  if (i < text.length) parts.push({ text: text.slice(i) });
  const counts = kept.reduce((c, m) => ({ ...c, [m.type]: (c[m.type] || 0) + 1 }), {});
  return { parts, counts };
}

/* ---------- Everything else ---------- */
export function buildInsights(text, type, role, job, company) {
  const d = prepare(text, role, job, company);
  const bullets = d.lines.filter((l) => BULLET.test(l)).map((l) => l.replace(BULLET, "").trim()).filter((l) => l.split(/\s+/).length >= 3);
  const statements = bullets.length >= 3 ? bullets : d.statements;
  const total = Math.max(1, statements.length);
  const verbCount = statements.filter(startsWithVerb).length;
  const numCount = statements.filter(hasNumber).length;
  const avgLen = Math.round(statements.reduce((n, l) => n + l.split(/\s+/).length, 0) / total);

  const stats = type === "cover"
    ? [
        { label: "words", value: d.words.length, good: d.words.length >= 250 && d.words.length <= 450, hint: "aim for 250–400" },
        { label: "paragraphs", value: d.paragraphs.length, good: d.paragraphs.length >= 3 && d.paragraphs.length <= 6, hint: "aim for 3–5" },
        { label: "sentences starting with “I”", value: `${Math.round((d.sentences.filter((s) => /^\s*I\b/.test(s)).length / Math.max(1, d.sentences.length)) * 100)}%`, good: d.sentences.filter((s) => /^\s*I\b/.test(s)).length / Math.max(1, d.sentences.length) <= 0.4, hint: "keep under 40%" },
        { label: "job keywords used", value: d.jobTerms.length ? `${d.matchedTerms.length}/${d.jobTerms.length}` : "–", good: d.keywordFit >= 0.5, hint: "paste a job ad" }
      ]
    : [
        { label: "words", value: d.words.length, good: d.words.length >= 250 && d.words.length <= 800, hint: "1 page ≈ 300–600" },
        { label: "bullets with action verbs", value: `${Math.round((verbCount / total) * 100)}%`, good: verbCount / total >= 0.7, hint: "aim for 70%+" },
        { label: "bullets with results", value: `${Math.round((numCount / total) * 100)}%`, good: numCount / total >= 0.3, hint: "aim for 30%+" },
        { label: "avg words per bullet", value: avgLen, good: avgLen >= 8 && avgLen <= 25, hint: "aim for 8–25" }
      ];

  // Quick wins
  const quickWins = [];
  const firstWords = statements.map((l) => (l.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, "")).filter((w) => WORDS.actionVerbs.includes(w));
  const repeats = Object.entries(firstWords.reduce((c, w) => ({ ...c, [w]: (c[w] || 0) + 1 }), {})).filter(([, n]) => n >= 3);
  repeats.forEach(([w, n]) => quickWins.push(`You start ${n} bullets with “${cap(w)}”. Mix it up — try the verb bank in “Fix my bullets”.`));
  const passive = d.lines.filter((l) => PASSIVE.test(l));
  if (passive.length) quickWins.push(`${passive.length} line${passive.length > 1 ? "s use" : " uses"} passive voice (e.g. “${passive[0].replace(BULLET, "").slice(0, 60)}…”). Say what YOU did.`);
  const long = statements.filter((l) => l.split(/\s+/).length > 30);
  if (long.length) quickWins.push(`${long.length} bullet${long.length > 1 ? "s are" : " is"} over 30 words. Split or trim so recruiters can scan quickly.`);
  const endsWithPeriod = bullets.filter((b) => /\.$/.test(b)).length;
  if (bullets.length >= 4 && endsWithPeriod > 0 && endsWithPeriod < bullets.length) quickWins.push("Some bullets end with a full stop and some don’t. Pick one style and use it everywhere.");
  if (type === "resume" && !/\b(profile|summary|objective|about me)\b/i.test(text)) quickWins.push("Add a 2–3 line profile at the top that says who you are and what role you want.");
  if (type === "resume" && /\breferences (available )?(up)?on request\b/i.test(text)) quickWins.push("“References available on request” isn’t needed — use the space for experience instead.");
  if (type === "cover" && !/\bdear\s+(mr|ms|mrs|dr|prof)\.?\s+\w+/i.test(text) && /dear (sir|madam|hiring manager|to whom)/i.test(text)) quickWins.push("If you can find the recruiter’s name (LinkedIn or the company site), address the letter to them.");
  if (type === "cover" && /\b(gain experience|build my career|help me grow)\b/i.test(text)) quickWins.push("Swap “this will help me gain experience” for what you’ll contribute to them.");

  // Bullet fixes (templates only — never invents facts)
  const bulletFixes = [];
  for (const line of d.lines) {
    if (bulletFixes.length >= 6) break;
    const clean = line.replace(BULLET, "").trim();
    const phrase = WORDS.weakPhrases.find((p) => new RegExp(`\\b${esc(p)}\\b`, "i").test(clean));
    if (phrase) {
      const rest = clean.replace(new RegExp(`^.*?\\b${esc(phrase)}\\b\\s*`, "i"), "").replace(/\.$/, "");
      const tail = hasNumber(clean) ? "" : " — [add the result or scope, only if true]";
      const firstWord = (rest.split(/\s+/)[0] || "");
      let options;
      if (/^[a-z]+ing$/i.test(firstWord) && firstWord.length > 5) {
        // "responsible for answering questions" -> "Answered questions"
        const after = rest.slice(firstWord.length).trim();
        options = [`${cap(gerundToPast(firstWord))} ${after}${tail}`, `[Action verb] ${after}${tail}`];
      } else {
        const verbs = FIX_VERBS[phrase] || ["Led", "Created", "Delivered"];
        options = verbs.map((v) => `${v} ${rest}${tail}`);
      }
      bulletFixes.push({ original: clean, problem: `“${phrase}” doesn’t show what you actually did.`, options });
    } else if (BULLET.test(line) && clean.split(/\s+/).length >= 4 && !startsWithVerb(clean) && type === "resume") {
      bulletFixes.push({
        original: clean,
        problem: "This bullet doesn’t start with an action verb.",
        options: [`[Action verb] ${clean.charAt(0).toLowerCase() + clean.slice(1).replace(/\.$/, "")}`, "Tip: pick a verb from the bank below that matches what you really did."]
      });
    }
  }

  // Interview questions
  const qs = [];
  const numberLine = statements.find(hasNumber);
  if (numberLine) qs.push(`You wrote “${trimTo(numberLine, 90)}”. How did you achieve that, and how did you measure it?`);
  const verbLines = statements.filter((l) => startsWithVerb(l) && l !== numberLine);
  if (verbLines[0]) qs.push(`Tell me about a time you ${lower1(trimTo(verbLines[0], 80))}. What was your role and what was the outcome?`);
  if (verbLines[1]) qs.push(`What was the biggest challenge when you ${lower1(trimTo(verbLines[1], 70))}?`);
  const skillsIdx = d.lines.findIndex((l) => /^(skills|technical skills|key skills)/i.test(l));
  if (skillsIdx >= 0) {
    const skills = d.lines.slice(skillsIdx, skillsIdx + 3).join(",").replace(/^[^:]*skills:?/i, "").split(/[,;•|]/).map((s) => s.trim()).filter((s) => s && s.length < 30 && !/skills/i.test(s));
    if (skills[0]) qs.push(`Give an example of how you have used ${skills[0]} in a real project or job.`);
    const soft = skills.find((s) => /communicat|team|leader|problem/i.test(s));
    if (soft) qs.push(`You list “${soft}” as a skill. Describe a situation where you showed it.`);
  }
  if (d.role) qs.push(`Why are you interested in this ${d.role} role, and why now?`);
  if (d.company) qs.push(`What do you know about ${d.company}, and why do you want to work there?`);
  if (d.missingTerms.length) qs.push(`The job mentions “${d.missingTerms[0]}”. What experience do you have with that? (Prepare an honest answer!)`);
  if (qs.length < 4) qs.push("Tell me about yourself in two minutes.", "What is one achievement you are most proud of?");

  return {
    stats, quickWins, bulletFixes, interviewQuestions: qs.slice(0, 7),
    keywords: { matched: d.matchedTerms.slice(0, 24), missing: d.missingTerms.slice(0, 24), checked: d.jobTerms.length > 0 },
    highlight: highlight(text)
  };
}
