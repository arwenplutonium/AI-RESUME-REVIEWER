// A small hand-drawn-style line chart of scores over time.
export default function ScoreChart({ reviews }) {
  const pts = [...reviews].reverse().slice(-12);
  if (pts.length < 2) return <p className="progress-text">Do two or more reviews to see your progress line ✦</p>;
  const W = 560, H = 170, P = 28;
  const x = (i) => P + (i * (W - P * 2)) / (pts.length - 1);
  const y = (s) => H - P - ((s - 30) / 70) * (H - P * 2);
  const line = pts.map((r, i) => `${x(i)},${y(Math.max(30, r.score))}`).join(" ");
  const area = `${P},${H - P} ${line} ${x(pts.length - 1)},${H - P}`;
  return (
    <svg className="score-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Score progress chart">
      {[60, 75, 90].map((b) => (
        <g key={b}>
          <line x1={P} x2={W - P} y1={y(b)} y2={y(b)} stroke="var(--pink-2)" strokeDasharray="4 6" />
          <text x={W - P + 4} y={y(b) + 4} fontSize="10" fill="var(--ink-soft)">{b}</text>
        </g>
      ))}
      <polygon points={area} fill="var(--pink)" opacity="0.6" />
      <polyline points={line} fill="none" stroke="var(--rose)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />
      {pts.map((r, i) => (
        <g key={r.date + i} className="chart-dot" style={{ animationDelay: `${i * 0.08}s` }}>
          <circle cx={x(i)} cy={y(Math.max(30, r.score))} r="8" fill={r.type === "cover" ? "var(--blue)" : "var(--yellow)"} stroke="var(--line)" strokeWidth="2.5" />
          <text x={x(i)} y={y(Math.max(30, r.score)) - 13} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)">{r.score}</text>
        </g>
      ))}
    </svg>
  );
}
