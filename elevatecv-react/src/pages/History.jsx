import Mochi from "../components/Mochi.jsx";

export default function History({ reviews, clear, go }) {
  return (
    <>
      <div className="page-head">
        <div className="kicker">☆ your progress scrapbook</div>
        <h1>Review <span>history</span></h1>
        <p>Saved only in this browser — no CV text is stored, just your scores.</p>
      </div>
      {reviews.length === 0 ? (
        <div className="empty card dotted">
          <Mochi className="mochi" mood="sleepy" />
          <p>Nothing here yet… Mochi is napping. Wake them up with your first review!</p>
          <button className="btn" onClick={() => go("reviewer")}>✦ start a review</button>
        </div>
      ) : (
        <>
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
    </>
  );
}
