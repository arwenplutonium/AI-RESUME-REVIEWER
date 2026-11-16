import { useEffect } from "react";

const BITS = ["✦", "♡", "✧", "⋆", "♡"];
const COLORS = ["#f28bb0", "#a9d4fb", "#ffd166", "#c7b4ff", "#9bd17d"];

// A trail of tiny sparkles that follows the mouse (desktop only).
export default function SparkleTrail({ enabled }) {
  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = 0;
    const onMove = (e) => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      const s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = BITS[Math.floor(Math.random() * BITS.length)];
      s.style.left = `${e.clientX + 6}px`;
      s.style.top = `${e.clientY + 6}px`;
      s.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      s.style.setProperty("--dx", `${(Math.random() - 0.5) * 30}px`);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);
  return null;
}
