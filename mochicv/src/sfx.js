// Tiny sound effects made with the Web Audio API — no audio files needed.
let ctx;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}
function tone(freq, endFreq, duration, type = "sine", volume = 0.15, delay = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}
export const sfx = {
  pop: () => tone(520 + Math.random() * 300, 1400, 0.09, "sine", 0.18),
  chime: () => { tone(880, 880, 0.18, "triangle", 0.12); tone(1320, 1320, 0.25, "triangle", 0.1, 0.12); },
  sparkle: () => [0, 0.08, 0.16, 0.24].forEach((d, i) => tone(1046 * (1 + i * 0.25), 1046 * (1 + i * 0.25), 0.15, "triangle", 0.07, d)),
  boop: () => tone(330, 660, 0.12, "square", 0.05),
  fanfare: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.22, "triangle", 0.1, i * 0.11))
};
