import { BADGES } from "../data.js";

export default function BadgeShelf({ unlocked, compact = false }) {
  return (
    <div className={`badge-shelf ${compact ? "compact" : ""}`}>
      {BADGES.map((b) => {
        const on = unlocked.includes(b.id);
        return (
          <div key={b.id} className={`badge ${on ? "on" : ""}`} title={`${b.name}: ${b.desc}${on ? " ✓" : ""}`}>
            <span className="badge-emoji">{on ? b.emoji : "🔒"}</span>
            {!compact && <span className="badge-name">{b.name}</span>}
            {!compact && <small>{b.desc}</small>}
          </div>
        );
      })}
    </div>
  );
}
