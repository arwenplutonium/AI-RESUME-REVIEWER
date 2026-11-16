import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Mochi from "./components/Mochi.jsx";
import Bubbles from "./components/Bubbles.jsx";
import SparkleTrail from "./components/SparkleTrail.jsx";
import Confetti from "./components/Confetti.jsx";
import Home from "./pages/Home.jsx";
import Reviewer from "./pages/Reviewer.jsx";
import History from "./pages/History.jsx";
import Guide from "./pages/Guide.jsx";
import Admin from "./pages/Admin.jsx";
import { useStored } from "./storage.js";
import { sfx } from "./sfx.js";
import { DEFAULT_LINKS, PAGE_HINTS, STICKERS, TIPS } from "./data.js";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function normalizeUrl(value, platform) {
  const v = (value || "").trim();
  if (/^https?:\/\//i.test(v)) return v;
  const name = v.replace(/^@/, "") || "Cvreviewer";
  return platform === "instagram" ? `https://www.instagram.com/${name}/` : `https://www.tiktok.com/@${name}`;
}
function playlistEmbed(url) {
  try {
    const list = new URL(url).searchParams.get("list");
    if (list) return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}`;
  } catch { /* fall through */ }
  return "https://www.youtube.com/embed/videoseries?list=PLhjLO-ekrsRu1FXl1Sx3yAl0pL_5c75bv";
}

export default function App() {
  const [page, setPage] = useState("home");
  const [reviews, setReviews] = useStored("elevatecv_reviews_v2", []);
  const [settings, setSettings] = useStored("elevatecv_footer", DEFAULT_LINKS);
  const [popped, setPopped] = useStored("elevatecv_popped", 0);
  const [night, setNight] = useStored("elevatecv_night", false);
  const [sound, setSound] = useStored("elevatecv_sound", false);
  const [bubblesOn, setBubblesOn] = useStored("elevatecv_bubbles", true);
  const [mood, setMood] = useStored("elevatecv_mood", 0);
  const [calm, setCalm] = useState(false);
  const [toast, setToast] = useState(null);
  const [say, setSay] = useState(PAGE_HINTS.home);
  const [mochiAction, setMochiAction] = useState(null);
  const [confetti, setConfetti] = useState({ n: 0, hearts: false });
  const titleClicks = useRef(0);
  const toastTimer = useRef();

  const play = useCallback((name) => { if (sound) sfx[name]?.(); }, [sound]);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const animateMochi = useCallback((action) => {
    setMochiAction(null);
    requestAnimationFrame(() => setMochiAction(action));
    setTimeout(() => setMochiAction(null), action === "dance" ? 3100 : 650);
  }, []);

  const go = (p) => {
    setPage(p);
    setSay(PAGE_HINTS[p]);
    window.scrollTo({ top: document.querySelector(".nav-band")?.offsetTop - 20 || 0, behavior: "smooth" });
    play("boop");
  };

  // Bubble popping + sticker milestones
  const onPop = useCallback((gold) => {
    play(gold ? "sparkle" : "pop");
    setPopped((p) => {
      const nextCount = p + (gold ? 5 : 1);
      const sticker = STICKERS.find((s) => p < s.at && nextCount >= s.at);
      if (sticker) {
        setTimeout(() => {
          notify(`New sticker unlocked: ${sticker.emoji} ${sticker.name}!`);
          setConfetti((c) => ({ n: c.n + 1, hearts: false }));
          play("fanfare");
        }, 50);
      } else if (gold) {
        setTimeout(() => notify(`★ Lucky bubble! ${TIPS[Math.floor(Math.random() * TIPS.length)]}`), 50);
      }
      return nextCount;
    });
  }, [notify, play, setPopped]);

  // Mochi click → hop + random tip
  const onMochiClick = () => {
    animateMochi("hop");
    play("boop");
    setSay(TIPS[Math.floor(Math.random() * TIPS.length)]);
  };

  // Title clicked 5 times → dance party
  const onTitleClick = () => {
    titleClicks.current += 1;
    play("pop");
    if (titleClicks.current >= 5) {
      titleClicks.current = 0;
      animateMochi("dance");
      setSay("Dance party! ♪ ┏(・o･)┛ ♪ ┗( ･o･)┓ ♪");
      notify("✦ secret found: dance party! ✦");
    }
  };

  // Konami code + typing "mochi"
  useEffect(() => {
    let seq = [];
    let typed = "";
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      seq = [...seq, key].slice(-KONAMI.length);
      if (seq.join() === KONAMI.join()) {
        setConfetti((c) => ({ n: c.n + 1, hearts: true }));
        notify("♡ secret unlocked: heart rain! ♡");
        setSay("You found the secret code! You’re amazing ٩(◕‿◕)۶");
        play("fanfare");
        seq = [];
      }
      typed = (typed + key).slice(-5);
      if (typed === "mochi") { animateMochi("hop"); setSay("You called? (｡•̀ᴗ-)✧ I’m always here to help!"); play("chime"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notify, play, animateMochi]);

  // New review result
  const onResult = (r) => {
    setReviews((rs) => [{ type: r.type, role: r.role, company: r.company, score: r.score, band: r.band, words: r.words, improvements: r.priorities.length, date: r.date }, ...rs].slice(0, 30));
    if (r.score >= 75) { setConfetti((c) => ({ n: c.n + 1, hearts: false })); play("fanfare"); animateMochi("dance"); }
    else { play("chime"); animateMochi("hop"); }
    setSay(r.score >= 90 ? "WOW! That’s excellent! 🏆 Just a few tiny touches left." :
      r.score >= 75 ? "Great work! A few targeted fixes and you’re there 🌷" :
      r.score >= 60 ? "Good start! Let’s work on the top three priorities together 🌱" :
      "Don’t worry — every great CV starts somewhere. Follow the action plan ♡");
  };

  const links = useMemo(() => ({
    instagram: normalizeUrl(settings.instagram, "instagram"),
    tiktok: normalizeUrl(settings.tiktok, "tiktok")
  }), [settings]);

  const stars = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i, left: Math.random() * 100, top: Math.random() * 100, delay: Math.random() * 3
  })), []);

  useEffect(() => { document.documentElement.classList.toggle("night", night); }, [night]);

  // Mochi's speech bubble fades away by itself after a few seconds
  useEffect(() => {
    if (!say) return;
    const t = setTimeout(() => setSay(null), window.innerWidth < 700 ? 5000 : 9000);
    return () => clearTimeout(t);
  }, [say]);

  return (
    <>
      <div className="page-blobs" aria-hidden="true"><span /><span /><span /></div>
      {night && <div className="night-stars" aria-hidden="true">{stars.map((s) => <i key={s.id} style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }} />)}</div>}

      <Bubbles enabled={bubblesOn} calm={calm} onPop={onPop} />
      <SparkleTrail enabled={bubblesOn} />
      <Confetti fire={confetti.n} hearts={confetti.hearts} />

      <div className="window-wrap">
        <div className="window">
          <span className="ear left" /><span className="ear right" />
          <Header page={page} go={go} links={links} onTitleClick={onTitleClick} mochiAction={mochiAction} onMochiClick={onMochiClick} />
          <main className="content">
            <div className="page-enter" key={page}>
              {page === "home" && <Home go={go} reviews={reviews} popped={popped} links={links} mood={mood} setMood={setMood} onMochiClick={onMochiClick} mochiAction={mochiAction} notify={notify} />}
              {page === "reviewer" && <Reviewer onResult={onResult} notify={notify} setCalm={setCalm} />}
              {page === "history" && <History reviews={reviews} go={go} clear={() => { if (confirm("Clear all review history in this browser?")) { setReviews([]); notify("History cleared ✿"); } }} />}
              {page === "guide" && <Guide />}
              {page === "admin" && <Admin settings={settings} setSettings={setSettings} notify={notify} />}
            </div>
          </main>
          <Footer embedUrl={playlistEmbed(settings.playlist)} links={links} />
        </div>
      </div>

      {/* Floating toolbar */}
      <div className="toolbar">
        <div className="pop-counter" title="bubbles popped">🫧 {popped}</div>
        <button className={`tool ${bubblesOn ? "" : "off"}`} onClick={() => setBubblesOn((b) => !b)} aria-label="Toggle bubbles">🫧<span className="tip">bubbles {bubblesOn ? "on" : "off"}</span></button>
        <button className={`tool ${sound ? "" : "off"}`} onClick={() => { setSound((s) => !s); if (!sound) sfx.chime(); }} aria-label="Toggle sound">{sound ? "🔔" : "🔕"}<span className="tip">sound {sound ? "on" : "off"}</span></button>
        <button className="tool" onClick={() => { setNight((n) => !n); play("sparkle"); }} aria-label="Toggle night mode">{night ? "☀️" : "🌙"}<span className="tip">{night ? "day" : "night"} mode</span></button>
      </div>

      {/* Mochi helper */}
      <div className="helper">
        {say && <div className="speech" key={say} role="status">{say}<button onClick={() => setSay(null)} aria-label="Close">×</button></div>}
        <Mochi className="mochi" action={mochiAction} onClick={onMochiClick} title="Mochi the helper — click for a tip" />
      </div>

      {toast && <div className="toast" key={toast} role="status">{toast}</div>}
    </>
  );
}
