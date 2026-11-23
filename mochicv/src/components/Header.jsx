import Mochi from "./Mochi.jsx";
import Typewriter from "./Typewriter.jsx";
import { InstagramIcon, TikTokIcon, YouTubeIcon } from "./Icons.jsx";
import ThemeSwitch from "./ThemeSwitch.jsx";

const NAV = [
  { id: "home", label: "home", proLabel: "Overview" },
  { id: "reviewer", label: "cv reviewer", proLabel: "CV reviewer", badge: "new" },
  { id: "history", label: "history", proLabel: "Review history" },
  { id: "guide", label: "cv guide", proLabel: "CV guide" },
  { id: "admin", label: "admin", proLabel: "Admin settings" }
];
const PHRASES = ["clearer CVs ✿", "stronger cover letters ✉", "honest, helpful feedback ♡", "your next opportunity ☆"];

export default function Header({ page, go, links, pro, onToggleTheme, onOpenChat, onTitleClick, mochiAction, onMochiClick }) {
  return (
    <>
      <div className="top-band" />
      <div className="scallop" />
      <div className="header-row">
        <span className="pill status-pill"><span className="dot" /> <span className="cute-only">reviews: OPEN!</span><span className="pro-only">Your workspace</span></span>
        <button className="pill title-pill" onClick={onTitleClick} title="psst… click me a few times">
          <span className="pro-only brand-mark">M</span>MochiCV
          <small>soft on you, sharp on your CV</small>
        </button>
        <div className="icon-row">
          <ThemeSwitch pro={pro} onToggle={onToggleTheme} />
          <a className="icon-btn c1" href={links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
          <a className="icon-btn c2" href={links.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TikTokIcon /></a>
          <a className="icon-btn c3" href={links.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><YouTubeIcon /></a>
        </div>
      </div>

      <div className="banner">
        <BannerScene />
        <div className="banner-text">
          <h1>Let’s make your CV <em>shine</em> ✦</h1>
          <Typewriter phrases={PHRASES} />
        </div>
        <div className="banner-mochi"><Mochi action={mochiAction} onClick={onMochiClick} /></div>
        <span className="banner-credit">♡ illustrated for MochiCV</span>
      </div>

      <nav className="nav-band" aria-label="Main">
        <span className="pro-only side-label">WORKSPACE</span>
        <span className="nav-flower">✿</span>
        {NAV.map((n) => (
          <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => go(n.id)} aria-current={page === n.id ? "page" : undefined}>
            <span className="cute-only">{n.label}</span><span className="pro-only">{n.proLabel}</span>{n.badge && <span className="badge">{n.badge}</span>}
          </button>
        ))}
        <span className="nav-flower">✿</span>
        <div className="pro-only side-help">
          <div className="side-help-avatar"><Mochi className="keep" track={false} /></div>
          <strong>Need a hand?</strong>
          <p>Mochi, our AI helper, can explain your score or help you rewrite a bullet.</p>
          <button onClick={onOpenChat}>Ask Mochi <span>→</span></button>
        </div>
      </nav>
    </>
  );
}

function Cloud({ x, y, s = 1, slow }) {
  return (
    <g className={`cloud ${slow ? "slow" : ""}`}>
      <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity="0.95">
        <circle cx="0" cy="10" r="18" /><circle cx="22" cy="0" r="24" /><circle cx="48" cy="8" r="20" /><rect x="-10" y="8" width="70" height="20" rx="10" />
      </g>
    </g>
  );
}

function Paper({ x, y, r, cls }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <g className={`float-paper ${cls}`}>
        <rect width="38" height="48" rx="4" fill="#fff" stroke="#9a6b55" strokeWidth="2.5" />
        <rect x="7" y="8" width="14" height="4" rx="2" fill="#f28bb0" />
        <rect x="7" y="17" width="24" height="3" rx="1.5" fill="#e3d2c8" />
        <rect x="7" y="24" width="20" height="3" rx="1.5" fill="#e3d2c8" />
        <rect x="7" y="31" width="24" height="3" rx="1.5" fill="#e3d2c8" />
        <path d="M30 37 l2 4 4 .6 -3 2.8 .8 4 -3.8-2 -3.8 2 .8-4 -3-2.8 4-.6z" fill="#ffd166" />
      </g>
    </g>
  );
}

function BannerScene() {
  return (
    <svg className="scene" viewBox="0 0 1000 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe7ff" /><stop offset="0.7" stopColor="#ffeef5" />
        </linearGradient>
      </defs>
      <rect width="1000" height="250" fill="url(#sky)" />
      <circle cx="880" cy="55" r="34" fill="#fff1bd" opacity="0.9" />
      <Cloud x={60} y={40} s={1} />
      <Cloud x={420} y={70} s={0.8} slow />
      <Cloud x={720} y={30} s={1.1} slow />
      <path d="M0 190 Q150 130 330 175 T700 165 T1000 150 V250 H0Z" fill="#ffd6e3" />
      <path d="M0 215 Q200 170 420 205 T820 195 T1000 185 V250 H0Z" fill="#d9f2cf" />
      <path d="M0 235 Q250 205 520 228 T1000 220 V250 H0Z" fill="#c6eab8" />
      {[[120, 222], [300, 230], [460, 218], [610, 232], [760, 214]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-5" rx="3.4" ry="5" fill={i % 2 ? "#fff" : "#ffc2d6"} transform={`rotate(${a})`} />)}
          <circle r="2.6" fill="#ffd166" />
        </g>
      ))}
      <Paper x={560} y={60} r={-12} cls="" />
      <Paper x={650} y={110} r={10} cls="d2" />
      <Paper x={480} y={125} r={-4} cls="d3" />
      <text x="620" y="70" fill="#f28bb0" fontSize="20">♡</text>
      <text x="530" y="200" fill="#a9d4fb" fontSize="18">✦</text>
      <text x="720" y="95" fill="#ffd166" fontSize="22">✦</text>
    </svg>
  );
}
