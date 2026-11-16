import { useEffect, useState } from "react";

const COLORS = ["#f28bb0", "#a9d4fb", "#ffd166", "#9bd17d", "#c7b4ff", "#ffc2d6"];

// Drop confetti (or hearts) whenever `fire` changes to a new number.
export default function Confetti({ fire, hearts = false }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!fire) return;
    const n = window.innerWidth < 700 ? 45 : 80;
    setPieces(Array.from({ length: n }, (_, i) => ({
      id: `${fire}-${i}`,
      left: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      dx: `${(Math.random() - 0.5) * 220}px`,
      rot: `${Math.random() * 900 - 450}deg`,
      dur: 2.2 + Math.random() * 1.8,
      delay: Math.random() * 0.6,
      round: Math.random() < 0.4
    })));
    const t = setTimeout(() => setPieces([]), 4800);
    return () => clearTimeout(t);
  }, [fire]);
  if (!pieces.length) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <i
          key={p.id}
          className={hearts ? "heart" : ""}
          style={{
            left: `${p.left}%`, background: p.color, color: p.color, borderRadius: p.round ? "50%" : undefined,
            "--dx": p.dx, "--rot": p.rot, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`
          }}
        >{hearts ? "♡" : null}</i>
      ))}
    </div>
  );
}
