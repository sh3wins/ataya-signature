"use client";

import gsap from "gsap";
import { LiquidGL, MeltSim, type Dome, type LiquidColours } from "@/lib/liquid";
import { flavourMap, type FlavourSlug, type MeltPhysics } from "@/lib/flavours";

/**
 * Plays the signature Ataya melt.
 *
 *   playMelt({ flavour, from, onCovered })
 *
 *   SOFTEN → STREAKS RUN DOWN THE CONE → POUR FROM THE TIP → PUDDLE
 *   SPREADS AND RISES → FULL COVER → (onCovered: swap the scene /
 *   navigate) → pause → it opens over the dress → the layer slides off,
 *   strands stretch and let go → the last drips fade into the page → onDone.
 *
 * `from` is the element holding the actual scoop the visitor chose, so
 * the melt starts from THAT scoop. After `onCovered`, an element marked
 * `data-melt-focus` in the new scene tells the reveal where the dress is.
 *
 * The canvas lives on <body>, so it survives client-side navigation.
 * Reduced motion (or no WebGL) → a short, branded colour dissolve.
 */

export interface PlayMeltOptions {
  flavour: FlavourSlug;
  /** Element containing the chosen scoop (its <svg data-scoop-vb>) */
  from?: Element | null;
  /** Folder of video frames (public/burst/<flavour>) of the swirl bursting */
  burst?: string;
  /** Folder of the two films (public/film/<flavour>): the cone spins and bursts, then melts off the screen */
  film?: string;
  /** Called each time a splat hits the screen (for a sound, a buzz) */
  onImpact?: () => void;
  /** Folder of splash pieces (public/splash/<flavour>) thrown as the scoop gives way */
  splash?: string;
  onCovered: () => void | Promise<void>;
  /** Called when the scoop has been handed over to the melt layer */
  onTakeover?: () => void;
  /** Called as soon as the dress is fully uncovered */
  onDone?: () => void;
  reducedMotion?: boolean;
  /** 1 = the full cinematic melt; >1 is quicker (page-to-page) */
  tempo?: number;
  /** Override colours, e.g. two flavours marbled together */
  colours?: LiquidColours;
  physics?: Partial<MeltPhysics>;
}

let running = false;
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Work out where the scoop's dome is on screen from its SVG viewBox */
function domeOf(el?: Element | null): Dome {
  const svg = el?.matches("svg[data-scoop-vb]") ? el : el?.querySelector("svg[data-scoop-vb]");
  if (svg) {
    const r = svg.getBoundingClientRect();
    const vbH = Number(svg.getAttribute("data-scoop-vb")) || 210;
    // the SVG keeps its aspect ratio, so one scale fits both axes
    const s = Math.min(r.width / 200, r.height / vbH);
    const left = r.left + (r.width - 200 * s) / 2;
    const top = r.top + (r.height - vbH * s) / 2;
    return { left, top, s, cone: vbH > 300 };
  }
  const W = window.innerWidth;
  const H = window.innerHeight;
  const s = Math.min(W, H) / 600;
  return { left: W / 2 - 100 * s, top: H / 2 - 90 * s, s };
}

function focusRect() {
  const el = document.querySelector("[data-melt-focus]");
  const W = window.innerWidth;
  const H = window.innerHeight;
  if (!el) return { x: W / 2, y: H / 2, w: W * 0.4, h: H * 0.6 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
}

async function dissolve(colour: string, onCovered: () => void | Promise<void>) {
  const veil = document.createElement("div");
  Object.assign(veil.style, { position: "fixed", inset: "0", zIndex: "45", background: colour, opacity: "0", pointerEvents: "none" });
  document.body.appendChild(veil);
  await gsap.to(veil, { opacity: 1, duration: 0.35, ease: "power2.out" });
  await onCovered();
  await frame();
  await frame();
  await gsap.to(veil, { opacity: 0, duration: 0.6, ease: "power2.inOut" });
  veil.remove();
}

/** The splash pictures in public/splash/<flavour>/ (size and where the liquid's heart sits) */
const PIECES = {
  radial: { w: 1024, h: 979, cx: 0.486, cy: 0.516 },
  messy: { w: 1264, h: 1263, cx: 0.605, cy: 0.549 },
  throw: { w: 1264, h: 718, cx: 0.411, cy: 0.506 },
  drops: { w: 1264, h: 1219, cx: 0.472, cy: 0.454 },
  splat: { w: 1244, h: 1217, cx: 0.496, cy: 0.508 },
  drip: { w: 978, h: 1262, cx: 0.482, cy: 0.355 },
  messy2: { w: 1024, h: 850, cx: 0.405, cy: 0.538 },
  throw2: { w: 1024, h: 409, cx: 0.366, cy: 0.51 },
} as const;
type PieceName = keyof typeof PIECES;

/** Have every splash piece for a flavour downloaded before it is needed */
export function preloadSplash(base: string) {
  return (Object.keys(PIECES) as PieceName[]).map((n) => {
    const img = new Image();
    img.src = `${base}/${n}.webp`;
    return img;
  });
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/* ——— THE BURST VIDEO: the soft-serve swirl bursting into cream, as frames ——— */
const BURST_FRAMES = 68;
/** frame where the spinning cone gives way and the cream explodes */
const BURST_AT = 27;
const BURST_FPS = 15 * 1.3; // played a little faster than filmed
/** where the (square) video sits around the cone, in the scoop's 200×330 units */
const BURST_PLACE = { left: -63.77, top: 0.5, size: 330.98 };
const burstCache = new Map<string, HTMLImageElement[]>();

export function preloadBurst(base: string) {
  if (burstCache.has(base)) return;
  new Image().src = `${base.replace(/\/[^/]+$/, "")}/cone.webp`;
  burstCache.set(
    base,
    Array.from({ length: BURST_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = `${base}/${String(i).padStart(2, "0")}.webp`;
      return img;
    }),
  );
}

function burstReady(base: string) {
  preloadBurst(base);
  return Promise.all(burstCache.get(base)!.map((f) => f.decode().catch(() => {})));
}

/**
 * Plays the burst: the cone spins up where it stands, then explodes. From
 * that moment the cone (its own still picture) stays put and only the cream
 * flies out towards you, until it fills the whole screen.
 * Returns the cone and cream elements (the cream still showing its last frame).
 */
function playBurst(base: string, dome: Dome, photos: HTMLElement[], tempo: number, onBurst?: () => void) {
  const frames = burstCache.get(base)!;
  const n = 704;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const size = BURST_PLACE.size * dome.s;
  const left = dome.left + BURST_PLACE.left * dome.s;
  const top = dome.top + BURST_PLACE.top * dome.s;
  const box = { position: "fixed", left: `${left}px`, top: `${top}px`, width: `${size}px`, height: `${size}px`, pointerEvents: "none" };

  const cone = document.createElement("img");
  cone.src = `${base.replace(/\/[^/]+$/, "")}/cone.webp`;
  cone.alt = "";
  cone.setAttribute("aria-hidden", "true");
  Object.assign(cone.style, box, { zIndex: "44", opacity: "0" });
  document.body.appendChild(cone);

  const cv = document.createElement("canvas");
  cv.width = cv.height = n;
  cv.setAttribute("aria-hidden", "true");
  // the cream grows out of the top of the cone
  const ox = 0.46;
  const oy = 0.5;
  Object.assign(cv.style, box, { zIndex: "46", transformOrigin: `${ox * 100}% ${oy * 100}%`, willChange: "transform" });
  const c = cv.getContext("2d")!;
  const show = (i: number) => {
    c.clearRect(0, 0, n, n);
    const f = frames[Math.min(i, BURST_FRAMES - 1)];
    if (f.complete && f.naturalWidth) c.drawImage(f, 0, 0, n, n);
  };
  show(0);
  document.body.appendChild(cv);
  photos.forEach((p) => (p.style.opacity = "0"));

  // how big the cream must get, around that point, to reach past every edge of the screen
  const px = left + ox * size;
  const py = top + oy * size;
  const cover = 1.2 * Math.max(px / (ox * size), (W - px) / ((1 - ox) * size), py / (oy * size), (H - py) / ((1 - oy) * size));

  const length = BURST_FRAMES / BURST_FPS / tempo;
  void cover;
  const st = { t: 0 };
  let burst = false;
  const done = gsap
    .to(st, {
      t: length,
      duration: length,
      ease: "none",
      onUpdate: () => {
        const i = Math.floor(st.t * BURST_FPS * tempo);
        if (!burst && i >= BURST_AT) {
          burst = true;
          cone.style.opacity = "1";
          onBurst?.();
        }
        show(i);
      },
    })
    .then();
  return { els: [cv, cone] as HTMLElement[], done };
}

/* ——— THE FILMS: one shot of the cone spinning, bursting and covering the screen (a),
       then one of the cream melting down and off the screen (b), both as frames ——— */
const FILM = { a: 64, b: 71, w: 960, h: 540, fpsA: 12 * 1.3, fpsB: 12 * 1.5 };
/** where the film frame sits around the cone at the start, in the scoop's 200×330 units */
const FILM_PLACE = { left: -193.05, top: 9.08, width: 573.22, height: 322.43 };
const filmCache = new Map<string, { a: HTMLImageElement[]; b: HTMLImageElement[] }>();

/* Browsers that can play a see-through video (Chrome, Edge, Firefox, Android) get the real
   films: full size, 24 frames a second. Apple's engine (every iPhone browser, Safari)
   can't, so it plays the films as picture frames instead. */
const FILM_SRC = { w: 1366, h: 768 };
const videoCache = new Map<string, { a: HTMLVideoElement; b: HTMLVideoElement }>();
function alphaVideoOk() {
  if (typeof document === "undefined") return false;
  if (/Apple/.test(navigator.vendor)) return false;
  return document.createElement("video").canPlayType('video/webm; codecs="vp9"') !== "";
}
function filmVideo(src: string) {
  const v = document.createElement("video");
  v.src = src;
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.setAttribute("aria-hidden", "true");
  v.load();
  return v;
}
const canPlay = (v: HTMLVideoElement, ms: number) =>
  v.readyState >= 3
    ? Promise.resolve(true)
    : new Promise<boolean>((r) => {
        const t = setTimeout(() => r(false), ms);
        v.addEventListener("canplaythrough", () => (clearTimeout(t), r(true)), { once: true });
        v.addEventListener("error", () => (clearTimeout(t), r(false)), { once: true });
      });

export function preloadFilm(base: string) {
  if (alphaVideoOk()) {
    if (!videoCache.has(base)) videoCache.set(base, { a: filmVideo(`${base}/a.webm`), b: filmVideo(`${base}/b.webm`) });
    return;
  }
  if (filmCache.has(base)) return;
  const load = (p: string, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const img = new Image();
      img.src = `${base}/${p}${String(i).padStart(2, "0")}.webp`;
      return img;
    });
  filmCache.set(base, { a: load("a", FILM.a), b: load("b", FILM.b) });
}

const loaded = (img: HTMLImageElement) =>
  img.complete && img.naturalWidth ? Promise.resolve() : new Promise<void>((r) => ((img.onload = () => r()), (img.onerror = () => r())));

/** A full-screen canvas that draws film frames, cropped to fill the screen */
function filmCanvas(z: number) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const cv = document.createElement("canvas");
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, { position: "fixed", left: "0", top: "0", width: `${W}px`, height: `${H}px`, zIndex: String(z), pointerEvents: "none", transformOrigin: "0 0", willChange: "transform, opacity" });
  const c = cv.getContext("2d")!;
  const k = Math.max(cv.width / FILM.w, cv.height / FILM.h);
  const dw = FILM.w * k;
  const dh = FILM.h * k;
  const dx = (cv.width - dw) / 2;
  const dy = (cv.height - dh) / 2;
  const draw = (img?: HTMLImageElement) => {
    c.clearRect(0, 0, cv.width, cv.height);
    if (img && img.complete && img.naturalWidth) c.drawImage(img, dx, dy, dw, dh);
  };
  // where (in CSS px) the film frame lands when it fills the screen
  const frame = { left: dx / dpr, top: dy / dpr, width: dw / dpr, height: dh / dpr };
  document.body.appendChild(cv);
  return { cv, draw, frame };
}

function playFrames(frames: HTMLImageElement[], fps: number, draw: (img: HTMLImageElement) => void, onFrame?: (i: number, p: number) => void) {
  const length = frames.length / fps;
  const st = { t: 0 };
  return gsap
    .to(st, {
      t: length,
      duration: length,
      ease: "none",
      onUpdate: () => {
        const i = Math.min(frames.length - 1, Math.floor(st.t * fps));
        draw(frames[i]);
        onFrame?.(i, st.t / length);
      },
    })
    .then();
}

/** Solid cream behind the film once it has filled the screen, so no gap ever shows through */
function backing(colour: string) {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, { position: "fixed", inset: "0", zIndex: "45", background: colour, opacity: "0", pointerEvents: "none" });
  document.body.appendChild(el);
  return el;
}

/** A soft oval mask so the film's rectangle never shows; it widens to nothing as the film fills the screen */
function softEdges(el: HTMLElement) {
  const mask = "radial-gradient(ellipse calc(50% * var(--m)) calc(50% * var(--m)) at 50% 50%, #000 72%, transparent 100%)";
  el.style.setProperty("--m", "1");
  el.style.maskImage = mask;
  el.style.webkitMaskImage = mask;
  return (duration: number, delay: number) =>
    gsap.to(el, {
      "--m": 2.1,
      duration,
      delay,
      ease: "power2.in",
      onComplete: () => {
        el.style.maskImage = "";
        el.style.webkitMaskImage = "";
      },
    });
}

/** The real films, as see-through videos. Resolves false if they won't play (then frames are used). */
async function playFilmVideo(
  vids: { a: HTMLVideoElement; b: HTMLVideoElement },
  dome: Dome,
  photos: HTMLElement[],
  tempo: number,
  onImpact: () => void,
  onCovered: () => void | Promise<void>,
  colour: string,
) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const k = Math.max(W / FILM_SRC.w, H / FILM_SRC.h);
  const fr = { width: FILM_SRC.w * k, height: FILM_SRC.h * k, left: (W - FILM_SRC.w * k) / 2, top: (H - FILM_SRC.h * k) / 2 };
  const place = (v: HTMLVideoElement, z: number) => {
    Object.assign(v.style, {
      position: "fixed",
      left: `${fr.left}px`,
      top: `${fr.top}px`,
      width: `${fr.width}px`,
      height: `${fr.height}px`,
      zIndex: String(z),
      pointerEvents: "none",
      transformOrigin: "0 0",
      opacity: "1",
      // the site's base styles shrink videos to fit; this one must stay bigger than the screen
      maxWidth: "none",
      maxHeight: "none",
      objectFit: "fill",
    });
    document.body.appendChild(v);
  };
  const { a, b } = vids;
  a.currentTime = 0;
  b.currentTime = 0;
  place(a, 46);
  const k0 = (FILM_PLACE.width * dome.s) / fr.width;
  gsap.set(a, { transformOrigin: "0 0", x: dome.left + FILM_PLACE.left * dome.s - fr.left * k0, y: dome.top + FILM_PLACE.top * dome.s - fr.top * k0, scale: k0 });
  const rateA = 1.3 * tempo;
  a.playbackRate = rateA;
  try {
    await a.play();
  } catch {
    a.remove();
    return false;
  }
  photos.forEach((p) => (p.style.opacity = "0"));
  // same moments as the frame version, in seconds of film
  gsap.to(a, { x: 0, y: 0, scale: 1, duration: 1.0 / rateA, delay: 2.92 / rateA, ease: "power2.in" });
  softEdges(a)(1.0 / rateA, 2.92 / rateA);
  const back = backing(colour);
  gsap.to(back, { opacity: 1, duration: 0.8 / rateA, delay: 3.4 / rateA });
  gsap.delayedCall(2.83 / rateA, onImpact);
  b.load();
  await new Promise<void>((r) => {
    a.addEventListener("ended", () => r(), { once: true });
    setTimeout(r, 9000);
  });

  await onCovered();
  await frame();
  await frame();

  place(b, 47);
  b.playbackRate = 1.5 * tempo;
  await canPlay(b, 3000);
  try {
    await b.play();
  } catch {
    /* it will just show its first frame and fade */
  }
  await gsap.to([a, back], { opacity: 0, duration: 0.25 / tempo, ease: "power1.out" }).then();
  a.remove();
  back.remove();
  const fade = () => {
    const p = b.duration ? b.currentTime / b.duration : 0;
    if (p > 0.82) b.style.opacity = String(Math.max(0, 1 - (p - 0.82) / 0.18));
  };
  gsap.ticker.add(fade);
  await new Promise<void>((r) => {
    b.addEventListener("ended", () => r(), { once: true });
    setTimeout(r, 8000);
  });
  gsap.ticker.remove(fade);
  b.remove();
  gsap.set([a, b], { clearProps: "transform,opacity" });
  return true;
}

async function playFilm(
  base: string,
  dome: Dome,
  photos: HTMLElement[],
  tempo: number,
  onImpact: () => void,
  onCovered: () => void | Promise<void>,
  colour: string,
) {
  preloadFilm(base);
  const vids = videoCache.get(base);
  if (vids && (await canPlay(vids.a, 5000)) && (await playFilmVideo(vids, dome, photos, tempo, onImpact, onCovered, colour))) return;
  // (no see-through video here: picture frames)
  videoCache.delete(base);
  if (!filmCache.has(base)) {
    const load = (p: string, n: number) =>
      Array.from({ length: n }, (_, i) => {
        const img = new Image();
        img.src = `${base}/${p}${String(i).padStart(2, "0")}.webp`;
        return img;
      });
    filmCache.set(base, { a: load("a", FILM.a), b: load("b", FILM.b) });
  }
  const { a, b } = filmCache.get(base)!;
  // the first frames must be ready; the rest stream in while it plays
  await Promise.all([...a.slice(0, 24), ...b.slice(0, 6)].map(loaded));

  // FILM A — starts exactly over the cone on the page, then settles to fill the screen
  const A = filmCanvas(46);
  const startLeft = dome.left + FILM_PLACE.left * dome.s;
  const startTop = dome.top + FILM_PLACE.top * dome.s;
  const k0 = (FILM_PLACE.width * dome.s) / A.frame.width;
  gsap.set(A.cv, { transformOrigin: "0 0", x: startLeft - A.frame.left * k0, y: startTop - A.frame.top * k0, scale: k0 });
  A.draw(a[0]);
  photos.forEach((p) => (p.style.opacity = "0"));
  const fpsA = FILM.fpsA * tempo;
  // it spins at the size of the cone on the page; only once the exploding cream
  // has hidden the cone does it fill the screen (so the cone never flies at you)
  gsap.to(A.cv, { x: 0, y: 0, scale: 1, duration: 12 / fpsA, delay: 35 / fpsA, ease: "power2.in" });
  softEdges(A.cv)(12 / fpsA, 35 / fpsA);
  const back = backing(colour);
  gsap.to(back, { opacity: 1, duration: 10 / fpsA, delay: 41 / fpsA });
  let hit = false;
  await playFrames(a, fpsA, A.draw, (i) => {
    if (!hit && i >= 34) {
      hit = true;
      onImpact();
    }
  });

  // the screen is covered: swap the page underneath
  await onCovered();
  await frame();
  await frame();

  // FILM B — the cream melts down and off, uncovering the new page
  const B = filmCanvas(47);
  B.draw(b[0]);
  await gsap.to([A.cv, back], { opacity: 0, duration: 0.25 / tempo, ease: "power1.out" }).then();
  A.cv.remove();
  back.remove();
  await playFrames(b, FILM.fpsB * tempo, B.draw, (_, p) => {
    // the last strip fades away instead of sitting at the bottom
    if (p > 0.82) B.cv.style.opacity = String(Math.max(0, 1 - (p - 0.82) / 0.18));
  });
  B.cv.remove();
}

/* ——— THE SPLASH VIDEO: a heavy mass of cream crashing down across the whole screen ——— */
const SV_FRAMES = 44;
const SV_W = 1024;
const SV_H = 576;
const SV_FPS = 12 * 1.15;
const svCache = new Map<string, HTMLImageElement[]>();

export function preloadSplashVideo(base: string) {
  if (svCache.has(base)) return;
  svCache.set(
    base,
    Array.from({ length: SV_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = `${base}/${String(i).padStart(2, "0")}.webp`;
      return img;
    }),
  );
}

function splashVideoReady(base: string) {
  preloadSplashVideo(base);
  return Promise.all(svCache.get(base)!.map((f) => f.decode().catch(() => {})));
}

/** Plays it over the whole screen (cropped to fill it); returns the canvas, still on its last frame */
async function playSplashVideo(base: string, tempo: number, onProgress?: (p: number) => void) {
  const frames = svCache.get(base)!;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const cv = document.createElement("canvas");
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "47", pointerEvents: "none" });
  const c = cv.getContext("2d")!;
  const k = Math.max(cv.width / SV_W, cv.height / SV_H);
  const dw = SV_W * k;
  const dh = SV_H * k;
  const dx = (cv.width - dw) / 2;
  const dy = (cv.height - dh) / 2;
  const show = (i: number) => {
    c.clearRect(0, 0, cv.width, cv.height);
    const f = frames[Math.min(i, SV_FRAMES - 1)];
    if (f.complete && f.naturalWidth) c.drawImage(f, dx, dy, dw, dh);
  };
  show(0);
  document.body.appendChild(cv);
  const length = SV_FRAMES / SV_FPS / tempo;
  const st = { t: 0 };
  await gsap
    .to(st, {
      t: length,
      duration: length,
      ease: "none",
      onUpdate: () => {
        show(Math.floor(st.t * SV_FPS * tempo));
        onProgress?.(st.t / length);
      },
    })
    .then();
  return cv;
}

/**
 * THE SPLASH: the scoop bursts, ribbons are thrown across the room,
 * droplets fly past, and thick splats slap onto the screen and slide down.
 * Solid liquid (the canvas, opened by a growing round mask) fills in last,
 * behind it all, so the whole screen ends up covered.
 */
async function splashCover(
  base: string,
  x: number,
  y: number,
  canvas: HTMLCanvasElement,
  draw: () => void,
  tempo: number,
  onImpact?: () => void,
  /** seconds to wait before the splats (the burst video plays first) */
  offset = 0,
) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const big = Math.max(W, H);
  const reach = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 140;
  const made: HTMLImageElement[] = [];

  /** a piece with its heart at (px, py), `width` px wide */
  const piece = (name: PieceName, px: number, py: number, width: number, z: number) => {
    const p = PIECES[name];
    const h = (width * p.h) / p.w;
    const img = document.createElement("img");
    img.src = `${base}/${name}.webp`;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    Object.assign(img.style, {
      position: "fixed",
      left: `${px - width * p.cx}px`,
      top: `${py - h * p.cy}px`,
      width: `${width}px`,
      height: `${h}px`,
      zIndex: String(z),
      pointerEvents: "none",
      willChange: "transform, opacity",
      transformOrigin: `${p.cx * 100}% ${p.cy * 100}%`,
      opacity: "0",
    });
    document.body.appendChild(img);
    made.push(img);
    return img;
  };

  // a touch of slow motion, so you can watch it happen
  const T = (t: number) => (t * 1.4) / tempo;
  const master = gsap.timeline({ paused: true });
  // nothing shows before its moment (fromTo would otherwise draw its start state at once)
  const tl = gsap.timeline({ defaults: { immediateRender: false } });
  master.add(tl, offset);
  const side = Math.random() < 0.5 ? -1 : 1; // which way most of it goes

  // 1. the burst: three lumps of cream thrown out of the scoop, lopsided
  const bursts: [PieceName, number, number, number][] = [
    ["radial", 0.95, 0, 0],
    ["messy", 0.85, side, 0.04],
    ["messy2", 0.7, -side, 0.08],
  ];
  // (when the burst video is playing, it is the burst)
  (offset ? [] : bursts).forEach(([n, k, dir, at]) => {
    const img = piece(n, x, y, big * k, 47);
    const m = Math.random() < 0.5 ? -1 : 1;
    const r0 = rand(-40, 40);
    tl.fromTo(img, { opacity: 1, scaleX: 0.05 * m, scaleY: 0.08, rotation: r0, x: 0, y: 0 },
      { scaleX: 1.08 * m, scaleY: 0.9, rotation: r0 + rand(-14, 14), x: dir * W * 0.18, y: rand(-0.08, 0.06) * H, duration: T(0.62), ease: "expo.out" }, T(at))
      // the cream wobbles as it hangs in the air…
      .to(img, { scaleX: m, scaleY: 1.04, duration: T(0.5), ease: "elastic.out(1, 0.35)" }, T(at + 0.45))
      // …then gravity takes it: it sags and stretches as it falls
      .to(img, { scaleX: 1.4 * m, scaleY: 1.6, x: dir * W * 0.3, y: `+=${H * 0.22}`, duration: T(1.1), ease: "power2.in" }, T(at + 0.75));
  });

  // 2. long ribbons thrown across the screen, one each way
  ([["throw", side], ["throw2", -side]] as [PieceName, number][]).forEach(([n, dir], i) => {
    const img = piece(n, x, y, W * 0.95, 47);
    const up = rand(-0.22, 0.12) * H;
    const r = rand(-18, 18);
    tl.fromTo(img, { opacity: 1, scaleX: 0.12 * dir, scaleY: 0.05, rotation: r, x: 0, y: 0 },
      { scaleX: 1.25 * dir, scaleY: 0.85, x: dir * W * 0.32, y: up, duration: T(0.75), ease: "power3.out" }, T(0.06 + i * 0.1))
      .to(img, { scaleX: 1.05 * dir, scaleY: 1.05, duration: T(0.6), ease: "elastic.out(1, 0.4)" }, T(0.55 + i * 0.1))
      .to(img, { x: dir * W * 0.5, y: up + H * 0.3, rotation: r + dir * 12, scaleX: 1.15 * dir, scaleY: 1.35, duration: T(0.9), ease: "power2.in" }, T(0.95 + i * 0.1));
  });

  // 3. droplets flying past, towards the screen
  [0, 1].forEach((i) => {
    const img = piece("drops", x, y, big * 1.1, 49);
    tl.fromTo(img, { opacity: 1, scale: 0.25, rotation: rand(0, 360) },
      { scale: 2.2, rotation: `+=${rand(-30, 30)}`, duration: T(0.9), ease: "power2.out" }, T(0.03 + i * 0.12))
      .to(img, { opacity: 0, duration: T(0.25) }, T(0.7 + i * 0.12));
  });

  // 4. thick splats slap onto the glass all over the screen, then slide down
  const spots: [number, number][] = [
    [0.18, 0.2], [0.82, 0.18], [0.5, 0.08], [0.1, 0.7], [0.9, 0.72], [0.5, 0.92], [0.32, 0.48], [0.7, 0.5], [0.5, 0.45],
  ];
  spots.sort(() => Math.random() - 0.5).forEach(([sx, sy], i) => {
    const n: PieceName = i % 3 === 1 ? "drip" : i % 4 === 3 ? "messy" : "splat";
    const w = big * rand(0.42, 0.66);
    const img = piece(n, sx * W + rand(-0.06, 0.06) * W, sy * H + rand(-0.06, 0.06) * H, w, 48);
    const m = Math.random() < 0.5 ? -1 : 1;
    const rot = n === "drip" ? rand(-8, 8) : rand(0, 360);
    const at = T(0.3 + i * 0.075 + rand(0, 0.05));
    // it lands as a lump and spreads out flat against the glass
    tl.fromTo(img, { opacity: 1, scaleX: 0.3 * m, scaleY: 0.3, rotation: rot, y: 0 },
      { scaleX: 1.12 * m, scaleY: 1.06, duration: T(0.12), ease: "power3.out", onStart: () => onImpact?.() }, at)
      // thick cream jiggles after it lands, side to side and up and down out of step
      .to(img, { scaleX: m, duration: T(0.7), ease: "elastic.out(1, 0.28)" }, ">")
      .to(img, { scaleY: 1, duration: T(0.8), ease: "elastic.out(1, 0.25)" }, "<0.04")
      // and creeps downwards, heavier and heavier
      .to(img, { y: H * rand(0.06, 0.14), duration: T(1.6), ease: "power2.in" }, at + T(0.25));
    if (n === "drip") {
      img.dataset.drip = "1";
      tl.to(img, { scaleY: 1.3, duration: T(1.5), ease: "power1.in" }, at + T(0.3));
    }
  });

  // 5. solid cream fills in behind everything until nothing is left uncovered
  const st = { r: 0 };
  const paint = () => {
    const mask = `radial-gradient(circle at ${x}px ${y}px, #000 ${Math.max(0, st.r - 60)}px, transparent ${st.r}px)`;
    canvas.style.maskImage = mask;
    canvas.style.webkitMaskImage = mask;
    draw();
  };
  tl.to(st, { r: reach, duration: T(1.05), ease: "power2.in", onUpdate: paint }, T(0.45));

  await Promise.all(made.map((img) => img.decode().catch(() => {})));
  paint();
  canvas.style.opacity = "1";
  const animate = () => draw();
  gsap.ticker.add(animate);
  await master.play().then();
  gsap.ticker.remove(animate);
  canvas.style.maskImage = "";
  canvas.style.webkitMaskImage = "";
  // the pieces stay stuck on: they slide off while the screen clears
  return made;
}

/** The splats lose their grip one by one and slide down off the screen */
function slideOff(pieces: HTMLElement[], duration: number) {
  const H = window.innerHeight;
  const order = [...pieces].sort(() => Math.random() - 0.5);
  order.forEach((img, i) => {
    const delay = (i / order.length) * duration * 0.45 + rand(0, 0.12);
    gsap.to(img, { y: `+=${H * rand(1.1, 1.4)}`, rotation: `+=${rand(-6, 6)}`, duration: duration * rand(0.5, 0.65), delay, ease: "power2.in" });
    // it stretches as it lets go, like a thick drop pulling away
    gsap.to(img, { scaleY: img.dataset.drip ? "*=1.6" : "*=1.3", scaleX: "*=0.9", duration: duration * 0.55, delay, ease: "power1.in" });
  });
  return gsap.delayedCall(duration * 1.1, () => order.forEach((img) => img.remove()));
}

export async function playMelt({
  flavour,
  from,
  splash,
  burst,
  film,
  onImpact,
  onCovered,
  onTakeover,
  onDone,
  reducedMotion,
  tempo = 1,
  colours,
  physics,
}: PlayMeltOptions) {
  if (running) return;
  running = true;
  const f = flavourMap[flavour];
  const phys: MeltPhysics = { ...f.melt, ...physics };
  const palette: LiquidColours = colours ?? { light: f.scoop[0], mid: f.scoop[1], deep: f.scoop[2] };
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const finish = () => {
    document.body.style.overflow = prevOverflow;
    running = false;
    onDone?.();
  };

  if (reducedMotion) {
    onTakeover?.();
    await dissolve(f.colour, onCovered);
    return finish();
  }

  if (film) {
    const photos = Array.from(from?.querySelectorAll<HTMLElement>(".scoop-photo") ?? []);
    onTakeover?.();
    await playFilm(
      film,
      domeOf(from),
      photos,
      tempo,
      () => {
        onImpact?.();
        if (navigator.vibrate) navigator.vibrate(18);
      },
      onCovered,
      f.scoop[1],
    );
    photos.forEach((p) => (p.style.opacity = ""));
    return finish();
  }

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "fixed", inset: "0", zIndex: "45", pointerEvents: "none" });
  document.body.appendChild(canvas);

  let gl: LiquidGL | null = null;
  try {
    gl = LiquidGL.create(canvas);
  } catch {
    gl = null;
  }
  if (!gl) {
    canvas.remove();
    onTakeover?.();
    await dissolve(f.colour, onCovered);
    return finish();
  }

  const dome = domeOf(from);
  const sim = new MeltSim(dome, gl.W, gl.H, phys, flavour.length * 31 + 7);
  const onResize = () => gl?.resize();
  window.addEventListener("resize", onResize);
  const t0 = performance.now();
  const time = () => (performance.now() - t0) / 1000;
  const look = { colours: palette, gloss: phys.gloss, shine: phys.shine };

  const state = { p: 0, q: 0 };
  const domes = Array.from(from?.querySelectorAll<SVGGElement>(".scoop-dome") ?? []);
  const photos = Array.from(from?.querySelectorAll<HTMLImageElement>(".scoop-photo") ?? []);

  let stuck: HTMLElement[] = [];
  let videoLayers: { fade: HTMLElement; drop: HTMLElement[] } | null = null;
  if (splash) {
    // THE SPLASH — the scoop bursts and the cream hits the whole screen
    const full = sim.melt(1, 0);
    canvas.style.opacity = "0";
    onTakeover?.();
    const impact = () => {
      onImpact?.();
      if (navigator.vibrate) navigator.vibrate(18);
    };
    const draw = () => gl!.render(full.blobs, { ...look, flood: full.flood, pool: full.pool, time: time() * 2.2 });
    if (burst) {
      // THE CONE SPINS AND EXPLODES, then a mass of cream crashes down across the screen
      const sv = burst.replace("/burst/", "/splashvid/");
      await Promise.all([burstReady(burst), splashVideoReady(sv)]);
      let exploded = () => {};
      const explosion = new Promise<void>((r) => (exploded = r));
      const cone = playBurst(burst, dome, photos, tempo, () => {
        impact();
        exploded();
      });
      await explosion;
      await gsap.delayedCall(0.32 / tempo, () => {}).then();
      const tick = () => draw();
      let liquid = false;
      const splashCanvas = await playSplashVideo(sv, tempo, (p) => {
        // the burst disappears under the falling cream
        if (p > 0.3) cone.els[0].style.opacity = String(Math.max(0, 1 - (p - 0.3) / 0.2));
        // solid cream settles in underneath for the last part
        if (!liquid && p > 0.62) {
          liquid = true;
          draw();
          gsap.ticker.add(tick);
          gsap.to(canvas, { opacity: 1, duration: 0.6 / tempo, ease: "power1.in" });
        }
      });
      await cone.done;
      await gsap.delayedCall(0.15, () => {}).then();
      gsap.ticker.remove(tick);
      canvas.style.opacity = "1";
      // the cone and burst go as soon as the screen is covered; the splash fades into the liquid
      videoLayers = { fade: splashCanvas, drop: cone.els };
    } else {
      await Promise.all(preloadSplash(splash).map((i) => i.decode().catch(() => {})));
      stuck = await splashCover(splash, dome.left + 100 * dome.s, dome.top + 74 * dome.s, canvas, draw, tempo, impact);
    }
  } else {
    // The first frame is the scoop itself, so the hand-over is seamless
    const first = sim.melt(0, 0);
    gl.render(first.blobs, { ...look, flood: first.flood, pool: first.pool, time: 0 });
    // hide the SVG ice cream (not the cone): the liquid layer now IS the scoop
    domes.forEach((d) => (d.style.opacity = "0"));
    // a photo scoop: the liquid fades in over it, then the photo keeps only
    // its cone (the ice cream part is now the liquid layer)
    if (photos.length) {
      canvas.style.opacity = "0";
      await gsap.to(canvas, { opacity: 1, duration: 0.28, ease: "power1.out" });
      const mask = "linear-gradient(to bottom, transparent 33%, #000 42%)";
      photos.forEach((ph) => {
        ph.style.maskImage = mask;
        ph.style.webkitMaskImage = mask;
      });
    }
    onTakeover?.();

    // THE MELT — slower, heavier flavours take their time
    const meltDuration = (3.5 / Math.max(0.6, phys.speed)) / tempo;
    await gsap.to(state, {
      p: 1,
      duration: meltDuration,
      ease: "none",
      onUpdate: () => {
        const m = sim.melt(state.p, time());
        gl!.render(m.blobs, { ...look, flood: m.flood, pool: m.pool, time: time() });
      },
    });
  }

  // Swap the scene underneath while the screen is covered
  await onCovered();
  videoLayers?.drop.forEach((el) => el.remove());
  await frame();
  await frame();
  const focus = focusRect();

  if (stuck.length) slideOff(stuck, 2.4 / tempo);
  if (videoLayers) {
    const v = videoLayers.fade;
    gsap.to(v, { opacity: 0, duration: 0.5 / tempo, ease: "power1.inOut", onComplete: () => v.remove() });
  }

  // THE REVEAL — pause, open over the dress, slide away
  await gsap.to(state, {
    q: 1,
    duration: 2.9 / tempo,
    ease: "none",
    onUpdate: () => {
      const r = sim.reveal(state.q, time(), focus);
      gl!.render(r.blobs, { ...look, flood: r.flood, holeFlood: r.holeFlood, drain: r.drain, time: time() * (stuck.length || videoLayers ? 2.2 : 1) });
      canvas.style.opacity = String(r.alpha);
    },
  });

  window.removeEventListener("resize", onResize);
  domes.forEach((d) => (d.style.opacity = ""));
  photos.forEach((ph) => {
    ph.style.opacity = "";
    ph.style.maskImage = "";
    ph.style.webkitMaskImage = "";
  });
  gl.destroy();
  canvas.remove();
  finish();
}
