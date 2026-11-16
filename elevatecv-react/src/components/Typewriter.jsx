import { useEffect, useState } from "react";

// Types out each phrase, deletes it, then moves to the next one.
export default function Typewriter({ phrases, speed = 55, pause = 1600 }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = phrases[i % phrases.length];
    let t;
    if (!deleting && text === full) t = setTimeout(() => setDeleting(true), pause);
    else if (deleting && text === "") { setDeleting(false); setI((n) => n + 1); }
    else t = setTimeout(() => setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1)), deleting ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [text, deleting, i, phrases, speed, pause]);

  return <span className="typewriter">{text}</span>;
}
