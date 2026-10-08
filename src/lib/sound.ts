/**
 * Tiny synthesised sounds (no audio files to download).
 * Only ever created after a user gesture, so browsers allow it.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freqFrom: number, freqTo: number, dur: number, gain: number, type: OscillatorType = "sine") {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freqFrom, t);
  o.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur: number, gain: number, freq: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(freq, t);
  f.frequency.exponentialRampToValueAtTime(freq / 6, t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

export const sounds = {
  scoop() {
    noise(0.18, 0.12, 1800);
    tone(220, 70, 0.22, 0.25);
  },
  drip() {
    tone(700, 1500, 0.09, 0.08);
  },
  melt() {
    noise(1.6, 0.06, 900);
    tone(160, 60, 1.2, 0.05);
  },
  /** a wet slap of thick cream hitting glass */
  splat() {
    noise(0.14, 0.09 + Math.random() * 0.05, 700 + Math.random() * 500);
    tone(150 + Math.random() * 40, 48, 0.16, 0.12);
  },
  tap() {
    tone(420, 300, 0.06, 0.05, "triangle");
  },
};

export type SoundName = keyof typeof sounds;
