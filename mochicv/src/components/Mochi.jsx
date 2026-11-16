import { useEffect, useRef, useState } from "react";

/*
  Mochi — MochiCV's original mascot (a cream bunny holding a tiny CV).
  - Eyes follow the mouse (track)
  - Blinks on its own
  - mood: "happy" | "wow" | "sleepy"
  - action: "hop" | "dance" | null  (adds a CSS animation)
*/
export default function Mochi({ track = true, mood = "happy", action = null, className = "", onClick, title = "Mochi" }) {
  const ref = useRef(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  // Eye tracking
  useEffect(() => {
    if (!track) return;
    const move = (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.65);
      const dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, dist / 300);
      setLook({ x: (dx / dist) * 2.6 * k, y: (dy / dist) * 2.2 * k });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [track]);

  // Random blinking
  useEffect(() => {
    let t;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, 2500 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  const L = "#9a6b55";
  const closed = blink || mood === "sleepy";

  return (
    <svg
      ref={ref}
      viewBox="0 0 120 132"
      className={`mochi ${action || ""} ${className}`}
      onClick={onClick}
      role="img"
      aria-label={title}
    >
      <g className="m-body">
        <g className="breathe">
          {/* Ears */}
          <g className="ear-l">
            <g transform="rotate(-14 42 50)">
              <ellipse cx="42" cy="26" rx="11" ry="26" fill="#fffaf2" stroke={L} strokeWidth="3" />
              <ellipse cx="42" cy="28" rx="5" ry="17" fill="#ffc6d8" />
            </g>
          </g>
          <g className="ear-r">
            <g transform="rotate(20 80 50)">
              <ellipse cx="80" cy="28" rx="11" ry="24" fill="#fffaf2" stroke={L} strokeWidth="3" />
              <ellipse cx="80" cy="30" rx="5" ry="15" fill="#ffc6d8" />
            </g>
            {/* Bow */}
            <g transform="translate(90 47) rotate(15)">
              <path d="M0 0 L-12 -8 Q-15 0 -12 8 Z" fill="#f28bb0" stroke={L} strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M0 0 L12 -8 Q15 0 12 8 Z" fill="#f28bb0" stroke={L} strokeWidth="2.2" strokeLinejoin="round" />
              <circle r="4" fill="#ffc6d8" stroke={L} strokeWidth="2.2" />
            </g>
          </g>

          {/* Body */}
          <path
            d="M60 46 C 96 46 109 70 107 93 C 105 117 85 126 60 126 C 35 126 15 117 13 93 C 11 70 24 46 60 46 Z"
            fill="#fffaf2" stroke={L} strokeWidth="3"
          />
          {/* Cheeks */}
          <ellipse cx="33" cy="92" rx="7.5" ry="4.5" fill="#ffb3c9" opacity="0.85" />
          <ellipse cx="87" cy="92" rx="7.5" ry="4.5" fill="#ffb3c9" opacity="0.85" />

          {/* Eyes */}
          <g transform={`translate(${look.x} ${look.y})`}>
            {closed ? (
              <>
                <path d="M38 84 q5 4 10 0" stroke="#4a2f27" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                <path d="M72 84 q5 4 10 0" stroke="#4a2f27" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              </>
            ) : mood === "wow" ? (
              <>
                <circle cx="43" cy="83" r="6.5" fill="#4a2f27" />
                <circle cx="77" cy="83" r="6.5" fill="#4a2f27" />
                <circle cx="45" cy="80.5" r="2.4" fill="#fff" /><circle cx="79" cy="80.5" r="2.4" fill="#fff" />
                <circle cx="41" cy="85.5" r="1.1" fill="#fff" /><circle cx="75" cy="85.5" r="1.1" fill="#fff" />
              </>
            ) : (
              <>
                <ellipse cx="43" cy="84" rx="4.6" ry="5.6" fill="#4a2f27" />
                <ellipse cx="77" cy="84" rx="4.6" ry="5.6" fill="#4a2f27" />
                <circle cx="44.6" cy="82" r="1.7" fill="#fff" /><circle cx="78.6" cy="82" r="1.7" fill="#fff" />
              </>
            )}
          </g>

          {/* Mouth (ω) */}
          {mood === "wow" ? (
            <ellipse cx="60" cy="95" rx="3.5" ry="4" fill="#e9839f" stroke={L} strokeWidth="2" />
          ) : (
            <path d="M54 92 q3 3.5 6 0 q3 3.5 6 0" stroke={L} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          )}

          {/* Tiny CV + paws */}
          <g transform="rotate(-6 60 112)">
            <rect x="45" y="101" width="30" height="21" rx="3" fill="#fff" stroke={L} strokeWidth="2.4" />
            <line x1="50" y1="107" x2="62" y2="107" stroke="#f28bb0" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="50" y1="112" x2="70" y2="112" stroke="#d6c3b8" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="50" y1="116.5" x2="66" y2="116.5" stroke="#d6c3b8" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M69 104.5 l1.2 2.4 2.6.4 -1.9 1.8 .5 2.6 -2.4-1.3 -2.4 1.3 .5-2.6 -1.9-1.8 2.6-.4z" fill="#ffd166" />
          </g>
          <ellipse cx="44" cy="111" rx="6" ry="5" fill="#fffaf2" stroke={L} strokeWidth="2.4" />
          <ellipse cx="76" cy="111" rx="6" ry="5" fill="#fffaf2" stroke={L} strokeWidth="2.4" />
        </g>
      </g>
    </svg>
  );
}
