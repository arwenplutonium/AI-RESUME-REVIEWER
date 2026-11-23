import { useEffect, useRef, useState } from "react";
import Mochi from "./Mochi.jsx";

/*
  Mochi AI chat window.
  - Sends the conversation to /api/mochi (a Netlify function that holds the API key)
  - Adds "site context": current page, theme and the latest review summary
  - Remembers the chat for this browser tab only
*/
const CHAT_KEY = "mochicv_chat";
const ERRORS = {
  missing_key: "My AI brain isn't connected yet. (Site admin: add ANTHROPIC_API_KEY in Netlify → Site configuration → Environment variables, then redeploy.)",
  bad_key: "My AI key isn't working. (Site admin: check the ANTHROPIC_API_KEY value in Netlify.)",
  rate_limited: "Whoa, that's a lot of questions at once! Give me a minute and try again.",
  busy: "I'm a bit busy right now. Please try again in a moment.",
  network: "I couldn't reach my AI brain. Check your internet and try again.",
  upstream: "Something went wrong on my side. Please try again.",
  default: "Something went wrong. Please try again."
};

function loadChat() {
  try { return JSON.parse(sessionStorage.getItem(CHAT_KEY)) || []; } catch { return []; }
}

// Turns simple markdown (bold, bullets, numbered lists, `code`) into safe React elements
function inline(text, keyBase) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={`${keyBase}-${i}`}>{part.slice(2, -2)}</strong>;
    if (/^`[^`]+`$/.test(part)) return <code key={`${keyBase}-${i}`}>{part.slice(1, -1)}</code>;
    return part;
  });
}
function RichText({ text }) {
  const blocks = [];
  let list = null;
  text.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-•*]\s+(.*)/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) { list = { type, items: [] }; blocks.push(list); }
      list.items.push((bullet || numbered)[1]);
    } else {
      list = null;
      if (line.trim()) blocks.push({ type: "p", text: line.replace(/^#+\s*/, "") });
    }
  });
  return blocks.map((b, i) =>
    b.type === "p" ? <p key={i}>{inline(b.text, i)}</p>
      : b.type === "ul" ? <ul key={i}>{b.items.map((t, j) => <li key={j}>{inline(t, `${i}-${j}`)}</li>)}</ul>
      : <ol key={i}>{b.items.map((t, j) => <li key={j}>{inline(t, `${i}-${j}`)}</li>)}</ol>
  );
}

export default function MochiChat({ open, setOpen, pro, context, onReply }) {
  const [messages, setMessages] = useState(loadChat);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { try { sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-30))); } catch { /* ignore */ } }, [messages]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading, open]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const greeting = pro
    ? "Hi, I'm Mochi, your CV assistant. Ask me about your review, rewriting a bullet, cover letters or interview prep."
    : "Hi! I'm Mochi ♡ Ask me anything about your CV, your score, cover letters or interviews!";
  const suggestions = [
    "How does MochiCV work?",
    context?.latestReview ? "Explain my latest score" : "What makes a strong CV?",
    "Help me rewrite a bullet point",
    "Give me interview tips"
  ];

  async function send(text) {
    const content = (text ?? input).trim().slice(0, 1500);
    if (!content || loading) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/mochi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => !m.error), context })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) throw new Error(data.error || "default");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      onReply?.();
    } catch (err) {
      const msg = ERRORS[err.message] || (err.message === "Failed to fetch" ? ERRORS.network : ERRORS.default);
      setMessages((m) => [...m, { role: "assistant", content: msg, error: true }]);
    } finally {
      setLoading(false);
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (!open) return null;
  return (
    <section className="chat-panel" role="dialog" aria-label="Chat with Mochi">
      <header className="chat-head">
        <div className="chat-avatar"><Mochi className="keep" track={false} /></div>
        <div className="chat-title">
          <strong>Mochi</strong>
          <small><span className="chat-dot" /> AI CV helper</small>
        </div>
        {messages.length > 0 && (
          <button className="chat-icon" onClick={() => setMessages([])} title="Start a new chat" aria-label="Start a new chat">↺</button>
        )}
        <button className="chat-icon" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
      </header>

      <div className="chat-list" ref={listRef} aria-live="polite">
        <div className="chat-msg bot"><RichText text={greeting} /></div>
        {messages.length === 0 && (
          <div className="chat-suggest">
            {suggestions.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role === "user" ? "me" : "bot"} ${m.error ? "err" : ""}`}>
            {m.role === "user" ? <p>{m.content}</p> : <RichText text={m.content} />}
          </div>
        ))}
        {loading && <div className="chat-msg bot typing" aria-label="Mochi is typing"><i /><i /><i /></div>}
      </div>

      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          maxLength={1500}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask Mochi anything…"
          aria-label="Message Mochi"
        />
        <button type="submit" disabled={!input.trim() || loading} aria-label="Send">➤</button>
      </form>
      <p className="chat-note">Mochi is AI and can make mistakes. Please don't share ID numbers or your home address.</p>
    </section>
  );
}
