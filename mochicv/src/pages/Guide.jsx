export default function Guide() {
  return (
    <>
      <div className="page-head">
        <div className="kicker">✿ build a stronger application</div>
        <h1>The CV <span>field guide</span></h1>
        <p>Little tips for a big impression, based on Harvard career-office guidance.</p>
      </div>
      <div className="guide-grid">
        <article className="card guide-card grid-paper">
          <span className="tape" />
          <span className="guide-num">01 / the foundation</span>
          <h3>Make the first impression count</h3>
          <p>Your CV should make it easy to see who you are, what you can do and why you fit the role.</p>
          <div className="check">Clear name and contact section</div>
          <div className="check">A short, role-focused profile</div>
          <div className="check">Most relevant experience near the top</div>
        </article>
        <article className="card guide-card">
          <span className="tape pink" />
          <span className="guide-num">02 / experience</span>
          <h3>Show the impact</h3>
          <p>Start bullets with action verbs. Say what you did, how, and what changed.</p>
          <div className="compare bad"><small>LESS EFFECTIVE</small>Responsible for social media.</div>
          <div className="compare good"><small>MORE EFFECTIVE</small>Planned weekly social posts for the student club and grew engagement (add a number only if you tracked it).</div>
        </article>
        <article className="card guide-card">
          <span className="tape" />
          <span className="guide-num">03 / ats readiness</span>
          <h3>Keep it readable</h3>
          <p>Applicant-tracking systems prefer simple layouts.</p>
          <div className="check">Standard headings: Experience, Education, Skills</div>
          <div className="check">No tables, text boxes or icons for key info</div>
          <div className="check">Keywords from the job description (if true!)</div>
        </article>
        <article className="card guide-card dotted">
          <span className="tape pink" />
          <span className="guide-num">04 / cover letters</span>
          <h3>Tell a short, true story</h3>
          <p>Name the role and company, give 2–3 real examples, and say what you’ll contribute.</p>
          <div className="check">Under one page (about 250–400 words)</div>
          <div className="check">Addressed to a person if possible</div>
          <div className="check">Ends with thanks and an invitation to talk</div>
        </article>
        <article className="card guide-card span-2">
          <span className="tape" />
          <span className="guide-num">05 / how you’re scored</span>
          <h3>Score bands</h3>
          <div className="bands">
            <div><span className="band-sticker band-excellent">🏆 90–100 Excellent</span><small>Polished and targeted. Only small tweaks.</small></div>
            <div><span className="band-sticker band-good">🌷 75–89 Good</span><small>Solid, with targeted wording or evidence fixes.</small></div>
            <div><span className="band-sticker band-developing">🌱 60–74 Developing</span><small>Several important improvements needed.</small></div>
            <div><span className="band-sticker band-major">🛠️ under 60 Major revision</span><small>Needs restructuring and stronger evidence.</small></div>
          </div>
          <p className="tip-note" style={{ marginTop: 18 }}><b>♡ our promise:</b> the reviewer never invents experience, numbers or skills. Only add what’s true and what you can explain in an interview.</p>
        </article>
      </div>
    </>
  );
}
