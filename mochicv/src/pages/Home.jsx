import { useState } from "react";
import Mochi from "../components/Mochi.jsx";
import BadgeShelf from "../components/BadgeShelf.jsx";
import { BADGES } from "../data.js";
import { InstagramIcon, TikTokIcon, YouTubeIcon } from "../components/Icons.jsx";
import { MOODS, STICKERS, TIPS, UPDATES } from "../data.js";

export default function Home({ go, reviews, popped, badges, links, mood, setMood, onMochiClick, mochiAction, notify }) {
  const [tipIndex, setTipIndex] = useState(() => new Date().getDate() % TIPS.length);
  const latest = reviews[0];
  const unlocked = STICKERS.filter((s) => popped >= s.at);
  const next = STICKERS.find((s) => popped < s.at);

  return (
    <div className="home-grid">
      {/* Left column */}
      <div className="col">
        <section className="card wiggle">
          <div className="avatar-frame">
            <Mochi className="mochi" action={mochiAction} onClick={onMochiClick} />
            <div className="pro-only pro-avatar">MC</div>
          </div>
          <div className="name-tag"><span className="cute-only">mochi <span>♡</span> cv helper</span><span className="pro-only">MochiCV · career workspace</span></div>
          <ul className="status-list">
            <li><b>status</b> reviewing CVs ✎</li>
            <li><b>mood</b><button className="mood-btn" onClick={() => setMood((m) => (m + 1) % MOODS.length)} title="click to change">{MOODS[mood]}</button></li>
            <li><b>reading</b> the Harvard rubric</li>
            <li className="cute-only"><b>snack</b> strawberry milk 🍓</li>
          </ul>
          <div className="lace" />
          <div className="chip-links">
            <a className="icon-btn c1" href={links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
            <a className="icon-btn c2" href={links.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TikTokIcon /></a>
            <a className="icon-btn c3" href={links.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><YouTubeIcon /></a>
          </div>
        </section>

        <section className="card dotted">
          <h3 className="card-title">tip of the day</h3>
          <p style={{ fontSize: 14, margin: "0 0 10px", textAlign: "center" }}>{TIPS[tipIndex]}</p>
          <div style={{ textAlign: "center" }}>
            <button className="link-btn" onClick={() => { setTipIndex((i) => (i + 1) % TIPS.length); notify("New tip unlocked ✦"); }}>another tip ↻</button>
          </div>
        </section>
      </div>

      {/* Middle column */}
      <div className="col middle">
        <section className="card grid-paper welcome-card">
          <span className="tape pink" />
          <div className="wavy">˚ ༘ ♡ ⋆｡˚ welcome ˚｡⋆ ♡ ༘ ˚</div>
          <h2>Make your CV <span className="hl">stand out</span> ✿</h2>
          <p>Hello! This is your <span className="hl blue">little corner</span> for clearer CVs and stronger cover letters. Get <span className="hl yellow">honest, structured feedback</span> based on Harvard career-office guidance.</p>
          <p>Make yourself at home and have fun exploring <span className="cute-only">♡ (psst… those bubbles are poppable!)</span></p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
            <button className="btn" onClick={() => go("reviewer")}>✦ review my CV</button>
            <button className="btn soft" onClick={() => go("guide")}>read the guide</button>
          </div>
        </section>

        <section className="card">
          <h3 className="ribbon-title" style={{ marginTop: -34 }}>message board</h3>
          {UPDATES.map((u, i) => (
            <div className="board-item" key={i}><span className="board-date">{u.date}</span><span>{u.text}</span></div>
          ))}
        </section>

        <section className="card pinkbg cute-only">
          <h3 className="card-title">treasure box</h3>
          <div className="sticker-grid">
            {STICKERS.map((s) => (
              <div key={s.name} className={`sticker ${popped >= s.at ? "on" : "off"}`} title={popped >= s.at ? s.name : `pop ${s.at} bubbles`}>
                {popped >= s.at ? s.emoji : "?"}
              </div>
            ))}
          </div>
          <p className="progress-text">
            🫧 {popped} bubbles popped · {unlocked.length}/{STICKERS.length} stickers
            {next && <><br />pop {next.at - popped} more for the next sticker!</>}
          </p>
        </section>
      </div>

      {/* Right column */}
      <div className="col">
        <section className="card">
          <h3 className="card-title">your stats</h3>
          <div className="stat-bubbles">
            <div className="stat-bubble"><strong>{reviews.length}</strong><small>reviews</small></div>
            <div className="stat-bubble"><strong>{latest ? latest.score : "–"}</strong><small>latest score</small></div>
            <div className="stat-bubble"><strong>{latest ? latest.improvements : "–"}</strong><small>to improve</small></div>
          </div>
          {latest && <p className="progress-text">last: {latest.type === "cover" ? "cover letter" : "CV"} · {latest.band}</p>}
        </section>

        <section className="card dotted">
          <h3 className="card-title">recent reviews</h3>
          {reviews.length === 0 ? (
            <p style={{ fontSize: 13, textAlign: "center", margin: 0 }}>No reviews yet… your first one will appear here ♡</p>
          ) : reviews.slice(0, 3).map((r) => (
            <div className="board-item" key={r.date}>
              <span className="board-date">{r.score}</span>
              <span>{r.type === "cover" ? "Cover letter" : "CV"} · {r.role}</span>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 8 }}><button className="link-btn" onClick={() => go("history")}>see all →</button></div>
        </section>

        <section className="card pinkbg">
          <h3 className="card-title">badges</h3>
          <BadgeShelf unlocked={badges} compact />
          <p className="progress-text">{badges.length} of {BADGES.length} earned · hover to see how</p>
        </section>

        <section className="card">
          <h3 className="card-title">little links</h3>
          <div className="chip-links">
            <button className="chip" onClick={() => go("reviewer")}>✎ reviewer</button>
            <button className="chip" onClick={() => go("guide")}>✿ cv guide</button>
            <button className="chip" onClick={() => go("history")}>☆ history</button>
            <a className="chip" href="#tv">▶ tips tv</a>
          </div>
        </section>
      </div>
    </div>
  );
}
