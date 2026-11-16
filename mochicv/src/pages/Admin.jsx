import { useState } from "react";
import { ADMIN_PASSCODE, DEFAULT_LINKS } from "../data.js";

export default function Admin({ settings, setSettings, notify }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(settings);

  function unlock(e) {
    e.preventDefault();
    if (pass === ADMIN_PASSCODE) { setUnlocked(true); setError(""); notify("Welcome back, admin ✿"); }
    else setError("That passcode isn’t right (｡•́︿•̀｡)");
  }
  function saveForm(e) {
    e.preventDefault();
    setSettings({
      playlist: form.playlist.trim() || DEFAULT_LINKS.playlist,
      instagram: form.instagram.trim() || DEFAULT_LINKS.instagram,
      tiktok: form.tiktok.trim() || DEFAULT_LINKS.tiktok
    });
    notify("Saved on this device ♡");
  }

  return (
    <>
      <div className="page-head">
        <div className="kicker">⚙ site management</div>
        <h1>Admin <span>settings</span></h1>
        <p>Manage the video playlist and social links.</p>
      </div>
      <div className="admin-box">
        <div className="warn"><b>⚠ Prototype only:</b> this passcode lives in the code and settings save only in this browser. Add real server-side login before launching.</div>
        {!unlocked ? (
          <form className="card" onSubmit={unlock}>
            <h3 className="card-title">admin sign in</h3>
            <label className="field-label" htmlFor="pass">Passcode</label>
            <input id="pass" type="password" className="input" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="enter passcode" />
            <p className="error">{error}</p>
            <button className="btn" type="submit">unlock ✦</button>
          </form>
        ) : (
          <form className="card" onSubmit={saveForm}>
            <h3 className="card-title">footer content</h3>
            <label className="field-label" htmlFor="pl">YouTube playlist URL</label>
            <input id="pl" className="input" value={form.playlist} onChange={(e) => setForm({ ...form, playlist: e.target.value })} />
            <label className="field-label" htmlFor="ig">Instagram username or URL</label>
            <input id="ig" className="input" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            <label className="field-label" htmlFor="tt">TikTok username or URL</label>
            <input id="tt" className="input" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn" type="submit">save ♡</button>
              <button className="btn soft" type="button" onClick={() => { setUnlocked(false); setPass(""); }}>lock</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
