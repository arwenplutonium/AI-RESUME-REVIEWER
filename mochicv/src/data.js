// Content you can edit without touching the components.

// MochiCV's social accounts (the admin page can change these on a device)
export const DEFAULT_LINKS = {
  playlist: "https://www.youtube.com/playlist?list=PLhjLO-ekrsRu1FXl1Sx3yAl0pL_5c75bv",
  instagram: "wolf.82084202",
  tiktok: "mochicv1",
  youtube: "mochicvs"
};

export const ADMIN_PASSCODE = "elevate-admin"; // Demo only — replace with real server-side login before going live.

export const TIPS = [
  "Start each bullet with an action verb like Led, Created or Organised ✦",
  "Only add numbers you actually tracked — honesty first ♡",
  "Tailor your CV to each job. Copy key words from the job description (if they’re true for you)!",
  "Keep it to one page if you’re a student or early in your career ✿",
  "Use one date format everywhere, e.g. Jan 2024 – May 2025.",
  "Remove your date of birth, ID number and full home address — employers don’t need them.",
  "Save your CV as Firstname-Lastname-CV.pdf ☆",
  "In a cover letter, show 2–3 real examples instead of just saying “I’m hard-working”.",
  "Name the company in your cover letter — generic letters are easy to spot!",
  "Read your CV out loud once. You’ll catch typos you can’t see ♡"
];

export const MOODS = ["happy (◕‿◕)", "focused (•̀ᴗ•́)و", "sleepy (－_－) zzZ", "excited ٩(◕‿◕)۶", "cosy (っ˘ω˘ς)", "proud (๑•̀ㅂ•́)و✧"];

export const STICKERS = [
  { at: 5, emoji: "🍓", name: "strawberry" },
  { at: 15, emoji: "🎀", name: "ribbon" },
  { at: 30, emoji: "🌷", name: "tulip" },
  { at: 50, emoji: "🍰", name: "cake" },
  { at: 80, emoji: "💌", name: "love letter" },
  { at: 120, emoji: "🦋", name: "butterfly" },
  { at: 170, emoji: "🌙", name: "moon" },
  { at: 230, emoji: "👑", name: "crown" }
];

export const UPDATES = [
  { date: "16 nov", text: "New cosy look + bubbles to pop! 🫧" },
  { date: "16 nov", text: "Reviewer now uses the Harvard-based rubric ✿" },
  { date: "13 nov", text: "Cover letter reviews added ✉" },
  { date: "10 nov", text: "Rubric drafted by the team ♡" }
];

export const PAGE_HINTS = {
  home: "Hi! I’m Mochi ♡ Click me to chat with my AI brain, or pop the bubbles to collect stickers!",
  reviewer: "Paste your CV or cover letter and I’ll check it against the rubric ✦",
  history: "Here are all your past reviews. Look how far you’ve come! ٩(◕‿◕)۶",
  guide: "Little tips for a big impression ✿",
  admin: "Psst… this area is for the MochiCV team only!"
};

// Achievement badges. `earned` receives { reviews, popped, night, secret }.
export const BADGES = [
  { id: "first", emoji: "🎉", name: "First step", desc: "Complete your first review", earned: (s) => s.reviews.length >= 1 },
  { id: "good", emoji: "🌷", name: "Good vibes", desc: "Score 75 or more", earned: (s) => s.reviews.some((r) => r.score >= 75) },
  { id: "polished", emoji: "🏆", name: "Polished", desc: "Score 90 or more", earned: (s) => s.reviews.some((r) => r.score >= 90) },
  { id: "letter", emoji: "💌", name: "Letter writer", desc: "Review a cover letter", earned: (s) => s.reviews.some((r) => r.type === "cover") },
  {
    id: "glowup", emoji: "📈", name: "Glow-up", desc: "Improve a score by 10+ points",
    earned: (s) => s.reviews.some((r, i) => { const older = s.reviews.slice(i + 1).find((o) => o.type === r.type); return older && r.score - older.score >= 10; })
  },
  { id: "dedicated", emoji: "⭐", name: "Dedicated", desc: "Complete 5 reviews", earned: (s) => s.reviews.length >= 5 },
  { id: "bubbles", emoji: "🫧", name: "Bubble master", desc: "Pop 50 bubbles", earned: (s) => s.popped >= 50 },
  { id: "owl", emoji: "🦉", name: "Night owl", desc: "Try night mode", earned: (s) => s.night },
  { id: "secret", emoji: "🤫", name: "Secret finder", desc: "Find the hidden code", earned: (s) => s.secret },
  { id: "switch", emoji: "🎭", name: "Switch-up", desc: "Try both cute and professional themes", earned: (s) => s.switched }
];
