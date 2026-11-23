# MochiCV ✿ soft on you, sharp on your CV

*A Bubblebyte Labs project.*

A cosy, pastel CV and cover-letter reviewer built with **React + Vite**. It scores documents with the Harvard-based rubric and is full of little surprises.

## Run it in VS Code
You need **Node.js 20.19 or newer** (check with `node -v`).

```bash
npm install      # first time only
npm run dev      # opens a local site, usually http://localhost:5173
```
Open the link shown in the terminal. The page reloads every time you save a file.

To make a version you can upload anywhere (GitHub Pages, Netlify, etc.):
```bash
npm run build    # creates the dist/ folder
```

## Reviewer features
- 📄 **Reads PDF, DOCX and TXT files** privately in the browser (drag and drop works). Scanned-image PDFs have no text to read.
- ⚡ **Live check**: a score that updates as you type, plus the next best fix.
- ✨ **Try a sample** to see a full review instantly. Your draft is saved in the tab, and **Ctrl + Enter** runs the review.
- 📊 **Overview**: score, band, change since your last review, CV health stats, top priorities, quick wins, job-keyword match (green = found, pink = missing), rubric scores, detailed feedback, action plan and ethical check.
- 🖍 **Highlighter**: your text with action verbs, numbers, weak phrases, passive voice, spelling, exaggeration and private info marked.
- ✎ **Fix my bullets**: honest rewrite templates for weak lines (e.g. “Responsible for answering…” → “Answered…”) plus a clickable action-verb bank. It never invents results; you fill the [brackets] with true details.
- 💬 **Interview prep**: questions an employer might ask based on your document, with STAR answer prompts.
- 📋 Copy a text summary, or print / save as PDF.

## Mochi AI chat 🐰💬
Mochi is an AI helper powered by Claude. In cute mode, click the floating Mochi. In professional mode, use the **Ask Mochi** button or the sidebar card. She can explain your latest score, help rewrite bullets (without inventing facts), and give cover letter and interview tips.

**How it stays safe:** the API key lives only on the server, in `netlify/functions/mochi-chat.mjs`, and never in the website code. The site calls `/api/mochi`, the function adds the key, and it asks Claude. Only your messages and a short summary of your latest review are sent, never your CV text, unless you paste it into the chat.

### Setup on Netlify
1. Get an API key at platform.claude.com, under **API keys**. Set a monthly **spend limit** in the Console too.
2. In Netlify, go to your site, then **Site configuration → Environment variables → Add a variable**. Key: `ANTHROPIC_API_KEY`. Value: your key.
3. Go to **Deploys → Trigger deploy → Deploy site**.

Optional variables: `MOCHI_MODEL` (default `claude-haiku-5-5`, which is fast and low cost) and `ANTHROPIC_WORKSPACE_ID`, if your key needs one.

### Testing on your PC
Copy `.env.example` to `.env`, paste your key in, then run `npm run dev`. `.env` is in `.gitignore`, so it never gets pushed. **Never put your key in any file under `src/`.**

## Two themes: cute ✿ and professional ▢
Use the switch in the header (or the round button in the floating toolbar) to flip between:
- **Cute**: the pastel Mochi design, with bubbles, sparkles, sounds, confetti and the Mochi helper.
- **Professional**: the original clean ElevateCV look, with a left sidebar, purple and navy colours, Manrope and DM Sans fonts, flat white cards and a navy footer. The playful extras are switched off.

The choice is saved in the browser. All of the professional styling sits under `.pro` at the end of `src/styles.css`. `.cute-only` and `.pro-only` classes show content in just one theme.

## Fun things to find
- 🫧 **Bubbles**: pop them to collect 8 stickers in the treasure box. Golden ★ bubbles are worth 5 and give a lucky tip.
- 🐰 **Mochi** (the mascot): its eyes follow your mouse. Click it for a tip; it hops, blinks and dances.
- ✨ **Sparkle trail** follows your cursor on desktop.
- 🎉 **Confetti** for scores of 75 or more, and when you unlock a sticker.
- 🌙 **Night mode**, 🔔 **sound effects** (off by default) and a bubble on/off switch, all in the bottom-left toolbar.
- 🤫 **Secrets**: click the MochiCV title 5 times; type `mochi` anywhere on the page; try the Konami code ↑ ↑ ↓ ↓ ← → ← → B A.
- 🏅 **10 badges** to earn (including 🎭 Switch-up for trying both themes) (first review, score 90+, glow-up, night owl, secret finder…).
- 📈 **Progress chart** on the History page.
- Bubbles fade while you type in the reviewer, so they never get in the way.

## Project structure
```
index.html              page shell + Google Fonts
src/
  main.jsx              starts React
  App.jsx               layout, pages, toolbar, Mochi helper, secrets
  styles.css            all styling (colours at the top in :root)
  data.js               tips, moods, stickers, updates, admin passcode
  rubric.js             Harvard-based rubric: categories, points, bands, word lists
  reviewEngine.js       the scoring logic (rule-based demo)
  insights.js           highlighter, quick wins, bullet fixes, interview questions
  extractText.js        reads PDF / DOCX / TXT in the browser
  samples.js            sample CV, job ad and cover letter
  storage.js            saves settings/history in the browser
  sfx.js                tiny sound effects (no audio files)
  components/MochiChat.jsx  the AI chat window
netlify/functions/mochi-chat.mjs  server function that talks to Claude (holds the API key)
netlify.toml            Netlify build + functions settings
.env.example            template for your local API key
  components/           Header, Footer, Mochi, Bubbles, SparkleTrail, Confetti, Typewriter, Results, Icons
  pages/                Home, Reviewer, History, Guide, Admin
```

### Easy edits
- **Colours**: change the variables at the top of `src/styles.css`.
- **Tips, stickers, message-board updates**: `src/data.js`.
- **Rubric wording or points**: `src/rubric.js`.

## Prototype limitations (before going live)
- The review is **rule-based keyword and pattern matching**, not real AI. Connect a server-side AI endpoint for genuine analysis, and keep API keys on the server.
- Old .doc files and scanned PDFs can't be read. Save as .docx or a text-based PDF instead.
- The admin passcode (`elevate-admin`) is in `src/data.js`, so anyone can see it. Settings save only in that browser. Add real login and a database before launch.
- History stores only scores (no CV text), in the visitor's own browser.
