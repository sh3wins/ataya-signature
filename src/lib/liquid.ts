/**
 * THE ATAYA MELT — soft liquid engine
 *
 * The melt follows what a real scoop does on a warm day:
 *   1. it softens and starts to sag
 *   2. melt runs down the cone in uneven streaks, slow at first
 *   3. the streaks meet at the tip and pour off in one thin thread
 *   4. a puddle lands, spreads sideways with a rounded front, then rises
 *   5. the puddle swallows the cone, the scoop and finally the screen
 * For the reveal the layer slides down and off, leaving a few slow
 * streaks behind, and it opens over the dress first.
 *
 * The ice cream is drawn as one continuous material (metaballs):
 * many soft circles are summed into a "field", and wherever the field is
 * thick enough there is ice cream. Circles close together merge, so drips
 * stay attached to the scoop and flow into each other — no pieces, no shards.
 *
 * Rendering is two small WebGL passes:
 *   1. FIELD  – every blob is splatted into a half-resolution texture
 *               (red = ice cream, green = where it has drained away).
 *               The puddle and the draining edge are drawn as soft strips.
 *   2. SHADE  – the field becomes a glossy, creamy surface with soft lighting,
 *               a rounded rim and a gentle shadow on the page underneath.
 *
 * `MeltSim` decides where everything is for any moment of the melt, so the
 * animation is fully controlled by a progress value (GSAP drives it).
 */

import type { MeltPhysics } from "./flavours";
import { seeded } from "./colour";

export interface Blob {
  x: number;
  y: number;
  r: number;
  /** 0 = ice cream, 1 = hole, 2 = ice cream that sits over the gap (strands, drips) */
  k: 0 | 1 | 2;
}

export interface Dome {
  /** screen position of the scoop's SVG origin, and px per SVG unit */
  left: number;
  top: number;
  s: number;
  /** true when the scoop sits on a cone, so the melt runs down it */
  cone?: boolean;
}

export interface LiquidColours {
  light: string;
  mid: string;
  deep: string;
  /** optional second flavour, marbled through (Flavour Lab) */
  swirl?: string;
}

/** A soft edge across the whole screen: one y value per sample, left to right. */
export interface Strip {
  /** x of the first sample and the gap between samples, in px */
  x0: number;
  step: number;
  y: number[];
}

export interface MeltFrame {
  blobs: Blob[];
  flood: number;
  /** surface of the puddle rising from the bottom of the screen */
  pool?: Strip;
}

/** The gap that opens as the layer slides away: clear between `top` and `bottom`. */
export interface Gap {
  x0: number;
  step: number;
  top: number[];
  bottom: number[];
}

export interface RevealFrame {
  blobs: Blob[];
  flood: number;
  holeFlood: number;
  drain: Gap;
  /** 1 → 0 as the last of it fades into the page */
  alpha: number;
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 2.4);
/** Thick liquid starting to move: sticks, lets go, then runs at a steady pace. */
const STICK = 0.18;
const creep = (a: number) => (a <= 0 ? 0 : a - STICK * (1 - Math.exp(-a / STICK)));
/** how long `creep` takes to cover a distance of 1 */
const CREEP_DONE = 1.18;

/* ——— The scoop, described as soft circles in the Scoop SVG's own units ——— */
const DOME: [number, number, number][] = [
  // x, y, r (viewBox units; the dome spans x 20–180, y 16–130)
  [74, 44, 24], [100, 38, 26], [126, 44, 24],
  [48, 66, 23], [76, 64, 25], [104, 62, 25], [132, 64, 25], [154, 68, 22],
  [36, 88, 21], [62, 86, 24], [90, 84, 25], [116, 84, 25], [142, 86, 24], [166, 90, 19],
  [30, 108, 18], [54, 106, 22], [80, 106, 23], [104, 106, 23], [128, 106, 23], [152, 106, 21], [172, 108, 15],
  // the ruffled scoop lip
  [34, 122, 12], [52, 126, 14], [72, 123, 12], [92, 127, 14], [112, 124, 12], [132, 127, 14], [152, 123, 12], [168, 120, 11],
];
const LIP_Y = 126;
/** the point of the cone, in Scoop SVG units */
const TIP: [number, number] = [100, 321];
/** how much of the melt (0–1) a streak needs to run from the lip to the tip */
const RUN_TIME = 0.2;
const FALL_WAIT = 0.035;
const FALL_TIME = 0.1;
const HANG_TIME = 0.3;
const SAMPLE = 8;
const PAD = 60;

interface Run {
  x: number; // svg units along the lip
  start: number; // progress when it lets go
  speed: number;
  width: number; // svg units
  phase: number;
  /** runs down the cone to the tip; otherwise it hangs off the rim */
  onCone: boolean;
  maxLen: number; // px, for hanging drips
}

/** A strand left hanging from the top as the layer slides away */
interface Strand {
  x: number;
  w: number; // half width, px
  rest: number; // length once it has let go, px
  /** how far down the screen the layer gets before this strand lets go (0 = never attached) */
  hold: number;
  phase: number;
}

export class MeltSim {
  private runs: Run[] = [];
  private strands: Strand[] = [];
  private swells: { x: number; y: number; r: number; ph: number }[] = [];
  private lean: number;
  /** progress at which melt first drops off the cone, and first reaches the floor */
  private pTip = 1;
  private pLand = 1;
  private landX: number[] = [];
  private samples: number;

  constructor(
    private dome: Dome,
    private W: number,
    private H: number,
    private phys: MeltPhysics,
    seed: number,
  ) {
    const rnd = seeded(seed);
    const s = dome.s;
    const cone = Boolean(dome.cone);
    this.lean = (rnd() - 0.5) * 2;
    this.samples = Math.ceil((W + PAD * 2) / SAMPLE) + 1;

    // The first streak: slightly off-centre, clearly visible.
    this.runs.push({ x: 116, start: 0.07, speed: 1, width: 9, phase: 0, onCone: cone, maxLen: Infinity });
    // Then an uneven family — different widths, timing, pace.
    const n = Math.max(3, Math.round(phys.drips));
    for (let i = 0; i < n; i++) {
      let x = 36 + ((i + 0.15 + rnd() * 0.7) / n) * 130;
      if (Math.abs(x - 116) < 9) x += 16;
      const rim = x < 46 || x > 156;
      const short = cone ? rim : rnd() < 0.3;
      this.runs.push({
        x,
        start: 0.14 + rnd() * 0.3,
        speed: 0.6 + rnd() * 0.7,
        width: 5.5 + rnd() * 7,
        phase: rnd() * 6.28,
        onCone: cone && !rim,
        maxLen: short ? (26 + rnd() * 60) * s : Infinity,
      });
    }

    // When does the melt leave the cone, and when does it reach the floor?
    const sp = Math.max(0.5, phys.speed);
    for (const r of this.runs) {
      if (r.onCone) {
        this.pTip = Math.min(this.pTip, r.start + (CREEP_DONE * RUN_TIME) / r.speed / sp);
      } else if (r.maxLen === Infinity) {
        const land = r.start + HANG_TIME / Math.sqrt(r.speed) / sp;
        if (land < this.pLand) this.pLand = land;
        this.landX.push(this.sx(r.x));
      }
    }
    if (cone) {
      this.pLand = this.pTip + (FALL_WAIT + FALL_TIME) / sp;
      this.landX = [this.sx(TIP[0])];
    }
    this.pLand = Math.min(this.pLand, 0.6);
    if (!this.landX.length) this.landX = [this.sx(100)];

    // Soft swells that give the full-screen layer a living surface
    this.swells = Array.from({ length: 9 }, () => ({ x: rnd(), y: rnd(), r: 0.12 + rnd() * 0.1, ph: rnd() * 6.28 }));

    // Reveal: strands that stretch from the top as the layer slides away
    const wide = Math.max(0.75, Math.min(1.25, W / 1200));
    const count = Math.max(6, Math.round(W / 105));
    for (let i = 0; i < count; i++) {
      const long = rnd() < 0.42;
      this.strands.push({
        x: ((i + 0.1 + rnd() * 0.8) / count) * W,
        w: (long ? 13 + rnd() * 13 : 8 + rnd() * 9) * wide,
        rest: (long ? 34 + rnd() * 52 : 8 + rnd() * 26) * wide,
        hold: long ? 0.3 + rnd() * 0.62 : 0,
        phase: rnd() * 6.28,
      });
    }
  }

  private sx(x: number) {
    return this.dome.left + x * this.dome.s;
  }
  private sy(y: number) {
    return this.dome.top + y * this.dome.s;
  }

  /** Soften → streaks down the cone → pour from the tip → puddle → cover. */
  melt(p: number, t: number): MeltFrame {
    const { phys, dome, W, H } = this;
    const s = dome.s;
    const sp = Math.max(0.5, phys.speed);
    const blobs: Blob[] = [];
    const soften = smooth(0, 0.18, p);
    const slump = smooth(0.1, 0.92, p) * clamp(phys.heaviness, 0.75, 1.3);

    // The scoop: loses its shape from the top, sags, and spreads over the cone
    for (let i = 0; i < DOME.length; i++) {
      const [x, y, r] = DOME[i];
      const rel = clamp((LIP_Y - y) / 110); // 0 at the lip, 1 at the top
      const wob = Math.sin(t * (3.2 + phys.elastic * 2.5) + i * 1.7) * soften * (1 - slump) * 0.9;
      const bx = 100 + (x - 100) * (1 + 0.26 * slump * (1 - rel * 0.6)) + this.lean * slump * rel * 9 + wob;
      const by = y + soften * 2.5 * rel + slump * (rel * 66 + (1 - rel) * 16);
      // it gets smaller as the melt leaves it
      blobs.push({ x: this.sx(bx), y: this.sy(by), r: r * s * (1 + 0.05 * soften - slump * (0.1 + 0.2 * rel)), k: 0 });
    }

    const lipY = LIP_Y + slump * 15;
    const tipX = this.sx(TIP[0]);
    const tipY = this.sy(TIP[1]);

    for (const run of this.runs) {
      const age = (p - run.start) * sp;
      const x0svg = 100 + (run.x - 100) * (1 + 0.26 * slump);
      const ax = this.sx(run.onCone ? clamp(x0svg, 40, 160) : x0svg);
      const ay = this.sy(lipY);
      const w = run.width * s * phys.thickness;

      // before it lets go, a bead swells on the lip
      if (age <= 0) {
        const bead = smooth(run.start - 0.12, run.start, p);
        if (bead > 0) blobs.push({ x: ax, y: ay + w * 0.5 * bead, r: w * 0.95 * bead, k: 0 });
        continue;
      }
      // the longer it runs, the more melt follows it down
      const flow = smooth(0, 0.4, age);

      if (run.onCone) {
        // down the cone, straight towards the tip
        const dx = tipX - ax;
        const dy = tipY - ay;
        const D = Math.hypot(dx, dy);
        const travel = Math.min(1, creep((age * run.speed) / RUN_TIME));
        const d = D * travel;
        const arrived = travel >= 1;
        const rTrail = w * (0.5 + 0.75 * flow);
        const n = Math.min(70, Math.max(2, Math.ceil(d / (rTrail * 0.55))));
        const nx = -dy / D;
        const ny = dx / D;
        for (let k = 0; k <= n; k++) {
          const u = k / n;
          const len = d * u;
          // streaks wander a little over the waffle
          const wander = Math.sin(len / (15 * s) + run.phase) * w * 0.3 * Math.min(1, len / (24 * s)) * (1 - (len / D) ** 3);
          let r = rTrail * (1 - 0.22 * Math.sin(u * Math.PI));
          // a fat, rounded head leads the way
          if (!arrived && u > 0.82) r = lerp(r, w * 1.08, (u - 0.82) / 0.18);
          // everything narrows as the cone does
          r *= 1 - 0.3 * (len / D) ** 2;
          blobs.push({ x: ax + (dx / D) * len + nx * wander, y: ay + (dy / D) * len + ny * wander, r, k: 0 });
        }
      } else {
        // off the rim: hangs, stretches, thins
        const room = H - ay + 60;
        const bounce = phys.elastic * Math.sin(t * 6 + run.phase) * Math.exp(-age * 5) * w * 0.7;
        const L = Math.min(run.maxLen, room * Math.pow((age * Math.sqrt(run.speed)) / HANG_TIME, 2.3) + age * 46 * s);
        const stretch = clamp(L / (w * 10));
        const rNeck = Math.max(3.2, w * (1 - 0.35 * stretch) * (0.75 + 0.25 * flow));
        const rMid = Math.max(3.2, w * (0.72 - 0.36 * stretch));
        const n = Math.min(200, Math.max(2, Math.ceil(L / (rMid * 0.95))));
        for (let k = 0; k <= n; k++) {
          const u = k / n;
          const len = L * u + (u === 1 ? bounce : 0);
          const rHead = Math.max(4.5, w * 1.05);
          const r = u < 0.78 ? lerp(rNeck, rMid, u / 0.78) : lerp(rMid, rHead, (u - 0.78) / 0.22);
          blobs.push({ x: ax + Math.sin(len / (90 * s) + run.phase) * 2 * s * u, y: ay + len - rHead * 0.2 * u, r, k: 0 });
        }
      }
    }

    // Where the streaks meet: a bead on the tip, then one thread to the floor
    if (dome.cone && p > this.pTip - 0.06) {
      const age = (p - this.pTip) * sp;
      const gather = smooth(-0.06, 0.03, age);
      const feed = smooth(0, 0.45, age);
      const bead = (4 + 5.5 * gather + 4 * feed) * s;
      blobs.push({ x: tipX, y: tipY - bead * 0.2, r: bead, k: 0 });
      const fall = clamp((age - FALL_WAIT) / FALL_TIME);
      if (fall > 0) {
        const room = H - tipY + 70;
        const L = room * fall * fall;
        const landed = fall >= 1;
        const thread = Math.max(3.2, (2.6 + 5.4 * feed) * s * Math.min(1.25, phys.thickness));
        const n = Math.min(200, Math.max(2, Math.ceil(L / (thread * 0.7))));
        for (let k = 1; k <= n; k++) {
          const u = k / n;
          const len = L * u;
          let r = thread * (1 - 0.25 * Math.sin(u * Math.PI));
          if (!landed && u > 0.85) r = lerp(r, thread * 1.9, (u - 0.85) / 0.15);
          const sway = Math.sin(t * 2.4 + len / (70 * s)) * 1.6 * s * u;
          blobs.push({ x: tipX + sway, y: tipY + len, r, k: 0 });
        }
      }
    }

    // The puddle: lands, spreads sideways with a rounded front, then rises
    let pool: Strip | undefined;
    const u = clamp((p - this.pLand) / (1 - this.pLand));
    if (u > 0) {
      const half = lerp(24 * s, W * 1.25, Math.pow(clamp(u / 0.62), 1.15));
      const mound = H * 0.1 * easeOut(u / 0.4) * (1 - 0.5 * smooth(0.55, 1, u));
      const rise = H * 1.4 * Math.pow(clamp((u - 0.36) / 0.64), 1.7);
      const waves = smooth(0.04, 0.3, u);
      const pour = smooth(0, 0.06, u) * (1 - smooth(0.6, 0.9, u));
      const y: number[] = new Array(this.samples);
      for (let i = 0; i < this.samples; i++) {
        const x = -PAD + i * SAMPLE;
        let shape = 0;
        let splash = 0;
        for (const lx of this.landX) {
          const d = (x - lx) / half;
          if (Math.abs(d) < 1) shape = Math.max(shape, Math.pow(1 - d * d, 0.55));
          const near = (x - lx) / (30 * s);
          splash = Math.max(splash, Math.exp(-near * near));
        }
        const cover = smooth(0, 0.6, shape);
        const h =
          mound * shape +
          rise * cover +
          waves * cover * (Math.sin(x * 0.011 + t * 1.5) * 5 + Math.sin(x * 0.026 - t * 1.15) * 2.5) +
          pour * splash * 11 * s;
        y[i] = H + 6 - h;
      }
      pool = { x0: -PAD, step: SAMPLE, y };
      // whatever the puddle has swallowed is gone: no shapes showing through
      const kept = blobs.filter((b) => {
        const i = clamp(Math.round((b.x + PAD) / SAMPLE), 0, this.samples - 1);
        return b.y - b.r < y[i] + 46;
      });
      return { blobs: kept, flood: smooth(0.86, 1, p) * 0.3, pool };
    }

    return { blobs, flood: smooth(0.86, 1, p) * 0.3, pool };
  }

  /**
   * The reveal. Full cover, a breath, then the whole layer slides down and
   * off the screen. It opens over the dress first. Strands stretch from the
   * top as it goes, thin out, let go one by one and shrink back into drips.
   */
  reveal(q: number, t: number, focus: { x: number; y: number; w: number; h: number }): RevealFrame {
    const { W, H } = this;
    const blobs: Blob[] = [];
    const diag = Math.hypot(W, H);

    // a living surface while it covers the screen
    for (const sw of this.swells) {
      blobs.push({
        x: sw.x * W + Math.sin(t * 0.8 + sw.ph) * 30,
        y: sw.y * H + Math.cos(t * 0.6 + sw.ph) * 24,
        r: sw.r * diag,
        k: 0,
      });
    }

    // what stays at the top: a melted fringe just under the menu bar
    const fringe = Math.min(92, H * 0.12);
    const START = fringe - 30;
    const END = H * 1.7;
    const goAt = (v: number) => clamp((v - 0.1) / 0.9);
    // the layer itself: slow to start, then gravity takes it
    const edgeAt = (v: number) => lerp(START, END, Math.pow(goAt(v), 1.75));
    const go = goAt(q);
    const edge = edgeAt(q);
    // it parts over the dress first
    const open = smooth(0.08, 0.5, q) * (1 - smooth(0.62, 0.95, q));
    const openDepth = (focus.y + focus.h * 0.3 - fringe) * open;
    const openHalf = Math.max(110, focus.w * 0.6);
    const settle = smooth(0, 0.25, go);

    const top: number[] = new Array(this.samples);
    const bottom: number[] = new Array(this.samples);
    for (let i = 0; i < this.samples; i++) {
      const x = -PAD + i * SAMPLE;
      const d = (x - focus.x) / openHalf;
      // the top of the sliding layer: a slow, uneven front
      const low =
        edge +
        openDepth * Math.exp(-d * d * d * d) +
        (Math.sin(x * 0.0058 + 1.3) * 30 + Math.sin(x * 0.0147 + t * 0.6) * 11) * settle;
      // the fringe left under the menu bar, gently scalloped
      const hang = (Math.sin(x * 0.021 + 0.7) * 5 + Math.sin(x * 0.047 + 2.1) * 3) * settle;
      top[i] = fringe + hang;
      bottom[i] = low;
    }

    // Strands and drips hanging from the fringe
    const lowAt = (x: number) => {
      const d = (x - focus.x) / openHalf;
      return edge + openDepth * Math.exp(-d * d * d * d) + (Math.sin(x * 0.0058 + 1.3) * 30 + Math.sin(x * 0.0147 + t * 0.6) * 11) * settle;
    };
    if (go > 0) {
      for (const st of this.strands) {
        const x = st.x + Math.sin(t * 1.3 + st.phase) * 1.5;
        const y0 = fringe - st.w * 0.6;
        let len: number;
        let neck = 0.62;
        let head = 1.08;
        let attached = false;
        if (st.hold > 0) {
          // when the layer has slid this far, the strand lets go
          const qSnap = 0.1 + 0.9 * Math.pow(clamp((st.hold * H - START) / (END - START)), 1 / 1.75);
          if (q < qSnap) {
            // still attached: it stretches with the layer and thins in the middle
            attached = true;
            len = lowAt(x) - y0 + st.w * 2.5;
            neck = lerp(0.75, 0.3, clamp(len / (st.hold * H)));
          } else {
            // let go: it springs back into a drip, with a little bounce
            const back = clamp((q - qSnap) / 0.17);
            const spring = 1 - Math.pow(1 - back, 3) + Math.sin(back * Math.PI * 2.5) * 0.07 * (1 - back);
            len = lerp(st.hold * H - y0, st.rest, spring);
            neck = lerp(0.3, 0.62, clamp(spring));
            head = lerp(0.7, 1.08, clamp(spring));
          }
        } else {
          len = st.rest * settle;
        }
        if (len < 2) continue;
        const n = Math.min(150, Math.max(2, Math.ceil(len / (Math.max(2.4, st.w * neck) * 0.75))));
        for (let k = 0; k <= n; k++) {
          const u = k / n;
          let r: number;
          if (attached) {
            // wide where it joins at both ends, thinnest in between
            r = st.w * lerp(neck, 1.05, Math.pow(Math.abs(u - 0.55) / 0.55, 2.2));
          } else {
            r = st.w * (u < 0.7 ? lerp(0.95, neck, Math.sin((u / 0.7) * Math.PI * 0.5)) : lerp(neck, head, smooth(0.7, 1, u)));
          }
          blobs.push({ x, y: y0 + len * u, r: Math.max(2.4, r), k: 2 });
        }
      }
    }

    return {
      blobs,
      flood: 0.8,
      holeFlood: 0,
      drain: { x0: -PAD, step: SAMPLE, top, bottom },
      alpha: 1 - smooth(0.86, 1, q),
    };
  }
}

/* ———————————————————————— WebGL renderer ———————————————————————— */

const FIELD_VS = `
attribute vec2 a_pos; attribute vec3 a_blob; attribute float a_kind;
uniform vec2 u_res;
varying vec2 v_pos; varying vec3 v_blob; varying float v_kind;
void main(){
  v_pos=a_pos; v_blob=a_blob; v_kind=a_kind;
  vec2 c = a_pos / u_res * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;

const PRECISION = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif`;

const FIELD_FS = `${PRECISION}
varying vec2 v_pos; varying vec3 v_blob; varying float v_kind;
void main(){
  vec2 d = v_pos - v_blob.xy;
  float R = v_blob.z * 2.0;
  float q = dot(d,d) / (R*R);
  float v = q < 1.0 ? (1.0-q)*(1.0-q)*0.25 : 0.0;
  if (v_kind > 4.5) {
    // a soft strip: the puddle (red) or the gap left behind (green)
    float e = smoothstep(0.0, 1.0, v_blob.z);
    gl_FragColor = v_kind < 5.5 ? vec4(e*0.9,0.0,0.0,1.0) : vec4(0.0,e*0.5,0.0,1.0);
    return;
  }
  gl_FragColor = v_kind < 0.5 ? vec4(v,0.0,0.0,1.0) : v_kind < 1.5 ? vec4(0.0,v,0.0,1.0) : vec4(0.0,0.0,v,1.0);
}`;

const SHADE_VS = `
attribute vec2 a_pos; varying vec2 v_uv;
void main(){ v_uv = a_pos*0.5+0.5; gl_Position = vec4(a_pos,0.0,1.0); }`;

const SHADE_FS = `${PRECISION}
varying vec2 v_uv;
uniform sampler2D u_field;
uniform vec2 u_res; uniform vec2 u_texel;
uniform vec3 u_light; uniform vec3 u_mid; uniform vec3 u_deep; uniform vec3 u_swirl;
uniform float u_swirlOn; uniform float u_flood; uniform float u_holeFlood;
uniform float u_gloss; uniform float u_shine; uniform float u_time;
const float T = 0.14;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}

// slow folds in thick cream: a warped height field for the open surface
float fold(vec2 p){
  vec2 w = p + 1.7*vec2(noise(p*0.6 + vec2(0.0, u_time*0.07)), noise(p*0.6 + vec2(7.3, -u_time*0.06)));
  return noise(w) + 0.45*noise(w*2.3 + 3.1);
}

// thickness of ice cream at a point (field minus what has drained away)
float S(vec2 uv){
  vec4 f = texture2D(u_field, uv);
  return max(f.r + u_flood - (f.g + u_holeFlood) * 7.0, -0.06) + f.b;
}
float HOLES(vec2 uv){
  return texture2D(u_field, uv).g;
}

void main(){
  float s = S(v_uv);
  vec2 dx = vec2(u_texel.x*2.0, 0.0), dy = vec2(0.0, u_texel.y*2.0);
  float gx = (S(v_uv+dx) - S(v_uv-dx)) / 4.0;
  float gy = (S(v_uv+dy) - S(v_uv-dy)) / 4.0;
  vec2 grad = vec2(gx, gy);                  // per field texel, GL orientation (y up)

  float a = smoothstep(T-0.01, T+0.01, s);
  // rounded rim: the surface curves down to meet the page
  float rim = 1.0 - smoothstep(T, T+0.08, s);
  // thin runs and drips are rounded all the way across; deep inside,
  // the melt levels out into a calm pool (no ridges or banding)
  float body = exp(-max(s - T, 0.0) * 4.2);
  vec2 outward = length(grad) > 1e-5 ? -normalize(grad) : vec2(0.0);
  // edges left by the liquid pulling back are soft and satiny
  float hEdge = smoothstep(0.01, 0.08, HOLES(v_uv));
  vec3 n = normalize(vec3(-grad*64.0*body + outward*rim*(0.75 - 0.4*hEdge), 1.0));
  // the open surface is not flat: it lies in soft, glossy folds
  float open = (1.0 - body) * a;
  vec2 fp = gl_FragCoord.xy / 200.0;
  float f0 = fold(fp);
  vec2 fg = vec2(fold(fp + vec2(0.07, 0.0)) - f0, fold(fp + vec2(0.0, 0.07)) - f0) / 0.07;
  n = normalize(vec3(n.xy - fg*0.27*open, n.z));

  vec3 L = normalize(vec3(-0.45, 0.6, 0.66));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  vec3 H = normalize(L + vec3(0.0,0.0,1.0));
  float nh = max(dot(n, H), 0.0);
  float spec = pow(nh, u_shine) * u_gloss * (1.0 - 0.75*hEdge);
  float sheen = pow(nh, u_shine*0.12) * u_gloss * 0.12;
  // the broad, soft highlight of something wet and creamy
  float wet = pow(nh, 9.0) * (0.05 + 0.1*u_gloss) * body;

  vec3 col = mix(u_deep, u_mid, smoothstep(0.12, 0.66, diff));
  col = mix(col, u_light, smoothstep(0.7, 1.0, diff) * 0.85);

  // creamy, slightly uneven material
  float cream = noise(v_uv*u_res/180.0 + vec2(0.0, u_time*0.05));
  col *= 0.97 + cream*0.06;

  // a second flavour rippling through (Flavour Lab)
  if (u_swirlOn > 0.5) {
    vec2 q = v_uv*u_res/260.0;
    float w = sin(q.x*2.1 + q.y*1.3 + noise(q*1.5+u_time*0.1)*4.0);
    float m = smoothstep(-0.4, 0.4, w);
    col = mix(col, u_swirl * (0.82 + diff*0.3), m*0.75);
  }

  // thicker liquid reads darker at the rim
  col = mix(col, u_deep, rim*0.2);
  // a slow, broad sheen drifting across the pool
  float band = sin((v_uv.x*0.8 + v_uv.y*0.6) * 3.2 - u_time*0.5);
  col += u_gloss * 0.045 * smoothstep(0.6, 1.0, band) * (1.0 - body);
  // folds: shaded troughs, and a hard wet glint along each crest
  col *= 1.0 - open * 0.07 * (1.0 - smoothstep(0.55, 0.95, f0));
  float glint = pow(nh, 90.0) * (0.14 + 0.3*u_gloss) * open;
  col += vec3(min(spec + sheen*(1.0 - 0.7*open) + wet + glint, 0.55));

  // soft shadow the ice cream casts on the page below it
  float above = S(v_uv + vec2(u_texel.x*2.0, u_texel.y*7.0));
  float shadow = smoothstep(T-0.09, T, above) * 0.075 * (1.0 - a);
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;   // dither: no banding

  gl_FragColor = vec4(col*a, a) + vec4(0.0,0.0,0.0,shadow);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export class LiquidGL {
  private gl: WebGLRenderingContext;
  private fieldProg: WebGLProgram;
  private shadeProg: WebGLProgram;
  private fbo: WebGLFramebuffer;
  private tex: WebGLTexture;
  private blobBuf: WebGLBuffer;
  private quadBuf: WebGLBuffer;
  private data = new Float32Array(0);
  private fw = 1;
  private fh = 1;
  W = 0;
  H = 0;

  static create(canvas: HTMLCanvasElement): LiquidGL | null {
    try {
      const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
      if (!gl) return null;
      return new LiquidGL(canvas, gl);
    } catch {
      return null;
    }
  }

  private constructor(
    private canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
  ) {
    this.gl = gl;
    this.fieldProg = this.program(FIELD_VS, FIELD_FS);
    this.shadeProg = this.program(SHADE_VS, SHADE_FS);
    this.tex = gl.createTexture()!;
    this.fbo = gl.createFramebuffer()!;
    this.blobBuf = gl.createBuffer()!;
    this.quadBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    this.resize();
  }

  private program(vs: string, fs: string) {
    const gl = this.gl;
    const make = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader");
      return sh;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
    return p;
  }

  resize() {
    const mobile = window.innerWidth < 700;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = Math.round(this.W * dpr);
    this.canvas.height = Math.round(this.H * dpr);
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
    // the field is smooth, so half resolution is plenty
    this.fw = Math.max(1, Math.round(this.W * (mobile ? 0.4 : 0.5)));
    this.fh = Math.max(1, Math.round(this.H * (mobile ? 0.4 : 0.5)));
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.fw, this.fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  render(
    blobs: Blob[],
    opts: { colours: LiquidColours; flood: number; holeFlood?: number; pool?: Strip; drain?: Gap; gloss: number; shine: number; time: number },
  ) {
    const gl = this.gl;
    const { W, H } = this;

    // ——— pass 1: splat blobs into the field
    const per = 6 * 6;
    const strips = (opts.pool ? opts.pool.y.length * 2 * per : 0) + (opts.drain ? opts.drain.top.length * 3 * per : 0);
    if (this.data.length < blobs.length * per + strips) this.data = new Float32Array((blobs.length * per + strips) * 2);
    const d = this.data;
    let o = 0;
    const vert = (x: number, y: number, v: number, kind: number) => {
      d[o++] = x;
      d[o++] = y;
      d[o++] = 0;
      d[o++] = 0;
      d[o++] = v;
      d[o++] = kind;
    };
    const quad = (xa: number, xb: number, ya0: number, yb0: number, ya1: number, yb1: number, v0: number, v1: number, kind: number) => {
      vert(xa, ya0, v0, kind); vert(xb, yb0, v0, kind); vert(xa, ya1, v1, kind);
      vert(xa, ya1, v1, kind); vert(xb, yb0, v0, kind); vert(xb, yb1, v1, kind);
    };
    // the puddle: solid below its surface, with a soft rounded lip
    if (opts.pool) {
      const { x0, step, y } = opts.pool;
      const band = 84;
      const floor = H + 20;
      for (let i = 0; i < y.length - 1; i++) {
        const xa = x0 + i * step, xb = xa + step;
        const ya = y[i] - 22, yb = y[i + 1] - 22;
        quad(xa, xb, ya, yb, ya + band, yb + band, 0, 1, 5);
        quad(xa, xb, ya + band, yb + band, Math.max(floor, ya + band), Math.max(floor, yb + band), 1, 1, 5);
      }
    }
    // the gap left as the layer slides away, soft on both sides
    if (opts.drain) {
      const { x0, step, top, bottom } = opts.drain;
      const band = 30;
      for (let i = 0; i < top.length - 1; i++) {
        const xa = x0 + i * step, xb = xa + step;
        const ga = bottom[i] - top[i], gb = bottom[i + 1] - top[i + 1];
        if (ga <= 0 && gb <= 0) continue;
        const ba = clamp(ga / 2, 0, band), bb = clamp(gb / 2, 0, band);
        const ta = top[i] + Math.min(0, ga) / 2, tb = top[i + 1] + Math.min(0, gb) / 2;
        const la = ta + Math.max(0, ga), lb = tb + Math.max(0, gb);
        const va = ba / band, vb = bb / band;
        vert(xa, ta, 0, 6); vert(xb, tb, 0, 6); vert(xa, ta + ba, va, 6);
        vert(xa, ta + ba, va, 6); vert(xb, tb, 0, 6); vert(xb, tb + bb, vb, 6);
        vert(xa, ta + ba, va, 6); vert(xb, tb + bb, vb, 6); vert(xa, la - ba, va, 6);
        vert(xa, la - ba, va, 6); vert(xb, tb + bb, vb, 6); vert(xb, lb - bb, vb, 6);
        vert(xa, la - ba, va, 6); vert(xb, lb - bb, vb, 6); vert(xa, la, 0, 6);
        vert(xa, la, 0, 6); vert(xb, lb - bb, vb, 6); vert(xb, lb, 0, 6);
      }
    }
    for (const b of blobs) {
      const R = b.r * 2;
      const x0 = b.x - R, x1 = b.x + R, y0 = b.y - R, y1 = b.y + R;
      const corners = [x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1];
      for (let c = 0; c < 6; c++) {
        d[o++] = corners[c * 2];
        d[o++] = corners[c * 2 + 1];
        d[o++] = b.x;
        d[o++] = b.y;
        d[o++] = b.r;
        d[o++] = b.k;
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.fw, this.fh);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.fieldProg);
    gl.uniform2f(gl.getUniformLocation(this.fieldProg, "u_res"), W, H);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.blobBuf);
    gl.bufferData(gl.ARRAY_BUFFER, d.subarray(0, o), gl.DYNAMIC_DRAW);
    const stride = 6 * 4;
    const aPos = gl.getAttribLocation(this.fieldProg, "a_pos");
    const aBlob = gl.getAttribLocation(this.fieldProg, "a_blob");
    const aKind = gl.getAttribLocation(this.fieldProg, "a_kind");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(aBlob);
    gl.vertexAttribPointer(aBlob, 3, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(aKind);
    gl.vertexAttribPointer(aKind, 1, gl.FLOAT, false, stride, 20);
    gl.drawArrays(gl.TRIANGLES, 0, o / 6);
    gl.disableVertexAttribArray(aBlob);
    gl.disableVertexAttribArray(aKind);

    // ——— pass 2: shade the surface
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const p = this.shadeProg;
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
    const qPos = gl.getAttribLocation(p, "a_pos");
    gl.enableVertexAttribArray(qPos);
    gl.vertexAttribPointer(qPos, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    const u = (n: string) => gl.getUniformLocation(p, n);
    gl.uniform1i(u("u_field"), 0);
    gl.uniform2f(u("u_res"), W, H);
    gl.uniform2f(u("u_texel"), 1 / this.fw, 1 / this.fh);
    const { colours } = opts;
    gl.uniform3fv(u("u_light"), hexToRgb(colours.light));
    gl.uniform3fv(u("u_mid"), hexToRgb(colours.mid));
    gl.uniform3fv(u("u_deep"), hexToRgb(colours.deep));
    gl.uniform3fv(u("u_swirl"), hexToRgb(colours.swirl ?? colours.mid));
    gl.uniform1f(u("u_swirlOn"), colours.swirl ? 1 : 0);
    gl.uniform1f(u("u_flood"), opts.flood);
    gl.uniform1f(u("u_holeFlood"), opts.holeFlood ?? 0);
    gl.uniform1f(u("u_gloss"), opts.gloss);
    gl.uniform1f(u("u_shine"), opts.shine);
    gl.uniform1f(u("u_time"), opts.time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  destroy() {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
