import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = ["", "", "", "♡", "✿", "☆", "✦", "", "✉", ""];
let nextId = 1;

function makeBubble() {
  const size = 26 + Math.random() * 46;
  return {
    id: nextId++,
    left: Math.random() * 96,
    size,
    duration: 11 + Math.random() * 10,
    swayTime: 2 + Math.random() * 2.5,
    sway: 10 + Math.random() * 22,
    glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    gold: Math.random() < 0.05
  };
}

/*
  Floating soap bubbles. Click/tap one to pop it.
  - onPop(isGold) is called for every pop
  - calm = true makes bubbles faint and un-clickable (while typing)
*/
export default function Bubbles({ enabled, calm, onPop }) {
  const [bubbles, setBubbles] = useState([]);
  const [bursts, setBursts] = useState([]);
  const timer = useRef();

  useEffect(() => {
    if (!enabled) { setBubbles([]); return; }
    const max = window.innerWidth < 700 ? 6 : 13;
    setBubbles([makeBubble(), makeBubble()]);
    timer.current = setInterval(() => {
      if (document.hidden) return;
      setBubbles((bs) => (bs.length >= max ? bs : [...bs, makeBubble()]));
    }, 1300);
    return () => clearInterval(timer.current);
  }, [enabled]);

  const remove = (id) => setBubbles((bs) => bs.filter((b) => b.id !== id));

  const pop = useCallback((e, b) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const burst = { id: b.id, x: r.left + r.width / 2, y: r.top + r.height / 2, gold: b.gold };
    setBursts((bs) => [...bs, burst]);
    setTimeout(() => setBursts((bs) => bs.filter((x) => x.id !== b.id)), 900);
    remove(b.id);
    onPop?.(b.gold);
  }, [onPop]);

  return (
    <>
      <div className={`bubble-layer ${calm ? "calm" : ""}`} aria-hidden="true">
        {bubbles.map((b) => (
          <button
            key={b.id}
            tabIndex={-1}
            className={`bubble ${b.gold ? "gold" : ""}`}
            style={{ left: `${b.left}%`, width: b.size, height: b.size, fontSize: b.size, animationDuration: `${b.duration}s` }}
            onAnimationEnd={(e) => e.target === e.currentTarget && remove(b.id)}
            onPointerDown={(e) => pop(e, b)}
          >
            <span style={{ "--sway": `${b.sway}px`, animationDuration: `${b.swayTime}s` }}>{b.gold ? "★" : b.glyph}</span>
          </button>
        ))}
      </div>
      {bursts.map((p) => (
        <div key={p.id}>
          <div className="burst" style={{ left: p.x, top: p.y }}>
            <span className="ring" style={p.gold ? { borderColor: "#ffc94d" } : null} />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <i key={i} style={{ "--dx": `${Math.cos(a) * 44}px`, "--dy": `${Math.sin(a) * 44}px`, color: p.gold ? "#f2b632" : undefined }}>
                  {i % 2 ? "✦" : "♡"}
                </i>
              );
            })}
          </div>
          <div className="popped-float" style={{ left: p.x - 10, top: p.y - 20 }}>{p.gold ? "+5 ★" : "+1"}</div>
        </div>
      ))}
    </>
  );
}
