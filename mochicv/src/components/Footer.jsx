export default function Footer({ embedUrl, links }) {
  return (
    <footer className="footer">
      <div className="footer-stripes" />
      <div className="footer-inner">
        <div>
          <h3>✿ about MochiCV</h3>
          <p>Clearer CVs. Stronger applications. Better next steps. Built by students, for students ♡</p>
          <p>Follow us for more career tips:</p>
          <div className="chip-links" style={{ justifyContent: "flex-start" }}>
            <a className="chip" href={links.instagram} target="_blank" rel="noopener noreferrer">◎ Instagram</a>
            <a className="chip" href={links.tiktok} target="_blank" rel="noopener noreferrer">♪ TikTok</a>
            <a className="chip" href={links.youtube} target="_blank" rel="noopener noreferrer">▶ YouTube</a>
          </div>
          <p className="cute-only" style={{ fontFamily: "var(--hand)", fontSize: 16, marginTop: 16 }}>psst… try the arrow keys: ↑ ↑ ↓ ↓ ← → ← → B A</p>
        </div>
        <div id="tv">
          <h3>📺 mochi cvs tv</h3>
          <div className="tv">
            <div className="tv-screen">
              <iframe title="MochiCV career tips playlist" src={embedUrl} loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
            <div className="tv-knobs"><i /><i /><i /></div>
          </div>
          <p style={{ textAlign: "center", marginTop: 12 }}><a className="chip" href={links.youtube} target="_blank" rel="noopener noreferrer">▶ Subscribe to MochiCV on YouTube</a></p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MochiCV ♡ made with love & bubbles</span>
        <span className="company-badge">✦ a <b>Bubblebyte Labs</b> project ✦</span>
      </div>
    </footer>
  );
}
