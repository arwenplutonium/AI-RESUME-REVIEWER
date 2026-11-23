import Mochi from "../components/Mochi.jsx";
import ScoreChart from "../components/ScoreChart.jsx";
import BadgeShelf from "../components/BadgeShelf.jsx";

export default function History({ reviews, badges, clear, go }) {
  const best = reviews.length ? Math.max(...reviews.map((r) => r.score)) : null;
  const avg = reviews.length ? Math.round(reviews.reduce((n, r) => n + r.score, 0) / reviews.length) : null;
  return (
    <>
      <div className="page-head">
        <div className="kicker">☆ your progress scrapbook</div>
        <h1>Review <span>history</span></h1>
        <p>Saved only in this browser. No CV text is stored, just your scores.</p>
      </div>
      {reviews.length === 0 ? (
        <div className="empty card dotted">
          <Mochi className="mochi" mood="sleepy" />
          <p>Nothing here yet… Mochi is napping. Wake them up with your first review!</p>
          <button className="btn" onClick={() => go("reviewer")}>✦ start a review</button>
        </div>
      ) : (
        <>
          <div className="history-top">
            <section className="card grid-paper">
              <span className="tape" />
              <h3 className="card-title">your progress</h3>
              <ScoreChart reviews={reviews} />
              <p className="progress-text">🟡 CV · 🔵 cover letter · dashed lines = 60 / 75 / 90 bands</p>
            </section>
            <section className="card">
              <h3 className="card-title">at a glance</h3>
              <div className="stat-bubbles">
                <div className="stat-bubble"><strong>{reviews.length}</strong><small>reviews</small></div>
                <div className="stat-bubble"><strong>{best}</strong><small>best score</small></div>
                <div className="stat-bubble"><strong>{avg}</strong><small>average</small></div>
              </div>
            </section>
          </div>
          <div className="history-grid">
            {reviews.map((r, i) => (
              <article className="polaroid" key={r.date + i}>
                <span className={`tape ${i % 2 ? "pink" : ""}`} />
                <div className="photo">{r.score}<small>/100</small></div>
                <h4>{r.type === "cover" ? "💌 Cover letter" : "📄 CV"} · {r.role}</h4>
                <p>{r.band || "Completed"} · {r.words} words</p>
                <p>{new Date(r.date).toLocaleString()}</p>
              </article>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 26 }}>
            <button className="btn soft" onClick={clear}>clear history</button>
          </div>
        </>
      )}
      <section className="card pinkbg" style={{ marginTop: 30 }}>
        <h3 className="card-title">badge collection</h3>
        <BadgeShelf unlocked={badges} />
      </section>
    </>
  );
}
