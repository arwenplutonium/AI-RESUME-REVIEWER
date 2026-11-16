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

## Fun things to find
- 🫧 **Bubbles**: pop them to collect 8 stickers in the treasure box. Golden ★ bubbles are worth 5 and give a lucky tip.
- 🐰 **Mochi** (the mascot): its eyes follow your mouse. Click it for a tip; it hops, blinks and dances.
- ✨ **Sparkle trail** follows your cursor on desktop.
- 🎉 **Confetti** for scores of 75 or more, and when you unlock a sticker.
- 🌙 **Night mode**, 🔔 **sound effects** (off by default) and a bubble on/off switch, all in the bottom-left toolbar.
- 🤫 **Secrets**: click the MochiCV title 5 times; type `mochi` anywhere on the page; try the Konami code ↑ ↑ ↓ ↓ ← → ← → B A.
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
  storage.js            saves settings/history in the browser
  sfx.js                tiny sound effects (no audio files)
  components/           Header, Footer, Mochi, Bubbles, SparkleTrail, Confetti, Typewriter, Results, Icons
  pages/                Home, Reviewer, History, Guide, Admin
```

### Easy edits
- **Colours**: change the variables at the top of `src/styles.css`.
- **Tips, stickers, message-board updates**: `src/data.js`.
- **Rubric wording or points**: `src/rubric.js`.

## Prototype limitations (before going live)
- The review is **rule-based keyword and pattern matching**, not real AI. Connect a server-side AI endpoint for genuine analysis, and keep API keys on the server.
- PDF/DOCX text isn't extracted yet: paste the text, or upload a .txt file.
- The admin passcode (`elevate-admin`) is in `src/data.js`, so anyone can see it. Settings save only in that browser. Add real login and a database before launch.
- History stores only scores (no CV text), in the visitor's own browser.
