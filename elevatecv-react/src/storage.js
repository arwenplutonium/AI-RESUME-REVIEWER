import { useEffect, useState } from "react";

// Reads/writes browser storage safely (some browsers block it).
export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

// useState that remembers its value between visits
export function useStored(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback));
  useEffect(() => { save(key, value); }, [key, value]);
  return [value, setValue];
}
