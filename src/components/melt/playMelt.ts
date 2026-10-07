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

export async function playMelt({
  flavour,
  from,
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

  const sim = new MeltSim(domeOf(from), gl.W, gl.H, phys, flavour.length * 31 + 7);
  const onResize = () => gl?.resize();
  window.addEventListener("resize", onResize);
  const t0 = performance.now();
  const time = () => (performance.now() - t0) / 1000;
  const look = { colours: palette, gloss: phys.gloss, shine: phys.shine };

  // The first frame is the scoop itself, so the hand-over is seamless
  const first = sim.melt(0, 0);
  gl.render(first.blobs, { ...look, flood: first.flood, pool: first.pool, time: 0 });
  // hide the SVG ice cream (not the cone): the liquid layer now IS the scoop
  const domes = Array.from(from?.querySelectorAll<SVGGElement>(".scoop-dome") ?? []);
  domes.forEach((d) => (d.style.opacity = "0"));
  onTakeover?.();

  // THE MELT — slower, heavier flavours take their time
  const meltDuration = (3.5 / Math.max(0.6, phys.speed)) / tempo;
  const state = { p: 0, q: 0 };
  await gsap.to(state, {
    p: 1,
    duration: meltDuration,
    ease: "none",
    onUpdate: () => {
      const m = sim.melt(state.p, time());
      gl!.render(m.blobs, { ...look, flood: m.flood, pool: m.pool, time: time() });
    },
  });

  // Swap the scene underneath while the screen is covered
  await onCovered();
  await frame();
  await frame();
  const focus = focusRect();

  // THE REVEAL — pause, open over the dress, slide away
  await gsap.to(state, {
    q: 1,
    duration: 2.9 / tempo,
    ease: "none",
    onUpdate: () => {
      const r = sim.reveal(state.q, time(), focus);
      gl!.render(r.blobs, { ...look, flood: r.flood, holeFlood: r.holeFlood, drain: r.drain, time: time() });
      canvas.style.opacity = String(r.alpha);
    },
  });

  window.removeEventListener("resize", onResize);
  domes.forEach((d) => (d.style.opacity = ""));
  gl.destroy();
  canvas.remove();
  finish();
}
