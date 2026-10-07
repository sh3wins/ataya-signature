"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ReactionId } from "@/lib/community";

/**
 * The Parlour's reactions: fruit with feelings.
 * Each one is drawn here (lit, glossy, with its own skin texture) so they
 * look the same on every phone and belong to Ataya Signature alone.
 *
 * `FruitDefs` holds the shared lighting and must be on the page once
 * (the community page includes it). To add a fruit: draw it in `art`,
 * then list it in `reactions` in src/lib/community.ts.
 */

const INK = "#24120e";
const u = (id: string) => `url(#ff-${id})`;

/* ——— shapes used more than once ——— */
const APPLE = "M24 14.5C19 9 6.5 10.5 6.5 24.5 6.5 36 14.5 45 20 45c2 0 3-1 4-1s2 1 4 1c5.5 0 13.5-9 13.5-20.5C41.5 10.5 29 9 24 14.5Z";
const BERRY = "M24 45.5C13.5 40.5 5.5 30 6.6 20.2 7.6 12.4 15 10.6 24 12.8c9-2.2 16.4-.4 17.4 7.4C42.5 30 34.5 40.5 24 45.5Z";
const AVO_SKIN = "M24 3.5c-6.6 0-9 7.6-10.8 14.5C10.8 25 7.5 30 7.5 34.5 7.5 41.5 15 46.5 24 46.5s16.5-5 16.5-12c0-4.5-3.3-9.5-5.7-16.5C33 11.1 30.6 3.5 24 3.5Z";
const AVO_FLESH = "M24 6.8c-5 0-7 6.7-8.5 12.6C13.7 25.4 10.8 29.9 10.8 34c0 5.5 6 9.4 13.2 9.4S37.2 39.5 37.2 34c0-4.1-2.9-8.6-4.7-14.6C31 13.5 29 6.8 24 6.8Z";
const MANGO = "M8.5 30.5C6 20 15 7 28 7c10.5 0 15.5 8.5 13.5 19C39.5 37.5 30 45 20.5 44 13.5 43 9.8 37.5 8.5 30.5Z";

/** Shared gradients, textures and clips. Render once per page. */
export function FruitDefs() {
  const body = (id: string, stops: [number, string][], cx = 0.34, cy = 0.28, r = 0.82) => (
    <radialGradient id={`ff-${id}`} cx={cx} cy={cy} r={r}>
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </radialGradient>
  );
  return (
    <svg aria-hidden width="0" height="0" className="pointer-events-none absolute">
      <defs>
        {body("apple", [[0, "#FF8A6A"], [0.32, "#E8322B"], [0.72, "#B5141B"], [1, "#6E070F"]])}
        {body("berry", [[0, "#FF8B93"], [0.3, "#EE2E46"], [0.72, "#BE1230"], [1, "#74081D"]])}
        {body("orange", [[0, "#FFD98A"], [0.3, "#FFA62B"], [0.72, "#EE7C0A"], [1, "#A84C02"]])}
        {body("blue", [[0, "#A9B4FA"], [0.3, "#5D6BDD"], [0.72, "#343FA6"], [1, "#161B5C"]])}
        {body("mango", [[0, "#FFF0A0"], [0.32, "#FFC53A"], [0.75, "#F09A14"], [1, "#B86404"]])}
        {body("skin", [[0, "#6F9A48"], [0.4, "#3C6230"], [1, "#16260F"]])}
        {body("flesh", [[0, "#FBF6C0"], [0.5, "#E3EC98"], [0.86, "#B5D46A"], [1, "#7FAE45"]], 0.5, 0.62, 0.62)}
        {body("pit", [[0, "#DDA468"], [0.4, "#9A5E2C"], [1, "#43210B"]], 0.36, 0.3, 0.8)}
        {body("leaf", [[0, "#9BD86A"], [0.5, "#4E9A3C"], [1, "#22561F"]], 0.3, 0.2, 0.9)}
        {body("eye", [[0, "#5a4038"], [0.5, INK], [1, "#000"]], 0.35, 0.3, 0.8)}
        {body("white", [[0, "#ffffff"], [0.7, "#eef0ff"], [1, "#b9bfe6"]], 0.4, 0.35, 0.75)}
        {body("heart", [[0, "#ffffff"], [0.55, "#FFD9DF"], [1, "#F78FA0"]], 0.35, 0.3, 0.8)}
        {body("mouth", [[0, "#3a0b0b"], [1, "#8a1c1c"]], 0.5, 0.1, 0.9)}
        {body("tongue", [[0, "#FF9AA8"], [1, "#D9475E"]], 0.4, 0.3, 0.8)}
        {body("tear", [[0, "#E6F6FF"], [0.5, "#7CC6F5"], [1, "#2F7FC2"]], 0.35, 0.3, 0.85)}
        {body("seed", [[0, "#FFF0A8"], [1, "#C98F2A"]], 0.4, 0.3, 0.8)}
        <radialGradient id="ff-blush" cx="0.7" cy="0.3" r="0.6">
          <stop offset="0" stopColor="#E3362A" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#EE5A2A" stopOpacity="0.45" />
          <stop offset="1" stopColor="#EE5A2A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ff-green" cx="0.2" cy="0.85" r="0.5">
          <stop offset="0" stopColor="#8DB83A" stopOpacity="0.7" />
          <stop offset="1" stopColor="#8DB83A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ff-stem" x1="0" x2="1">
          <stop offset="0" stopColor="#9A6A3A" />
          <stop offset="1" stopColor="#4A2A12" />
        </linearGradient>
        <radialGradient id="ff-floor">
          <stop offset="0" stopColor="#000" stopOpacity="0.38" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* soft light */}
        <filter id="ff-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <filter id="ff-blur-s" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        {/* skin texture: pores on the orange, bumps on the avocado, bloom on the blueberry */}
        <filter id="ff-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 1.9" result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
        </filter>
        <filter id="ff-bloom" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="3" seed="9" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.5" result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
        </filter>
        <clipPath id="ff-clip-apple"><path d={APPLE} /></clipPath>
        <clipPath id="ff-clip-berry"><path d={BERRY} /></clipPath>
        <clipPath id="ff-clip-skin"><path d={AVO_SKIN} /></clipPath>
        <clipPath id="ff-clip-flesh"><path d={AVO_FLESH} /></clipPath>
        <clipPath id="ff-clip-mango"><path d={MANGO} /></clipPath>
        <clipPath id="ff-clip-round"><circle cx="24" cy="27" r="19" /></clipPath>
      </defs>
    </svg>
  );
}

/* ——— small parts ——— */
const Floor = ({ rx = 15 }: { rx?: number }) => <ellipse cx="24" cy="45.8" rx={rx} ry="2.2" fill={u("floor")} />;

/** the soft window-light every glossy fruit has, plus a sharp glint */
function Gloss({ x, y, rx, ry, rot = -28, strong = 0.6 }: { x: number; y: number; rx: number; ry: number; rot?: number; strong?: number }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" opacity={strong} filter={u("blur")} transform={`rotate(${rot} ${x} ${y})`} />
      <ellipse cx={x - rx * 0.25} cy={y - ry * 0.3} rx={rx * 0.3} ry={ry * 0.18} fill="#fff" opacity="0.85" transform={`rotate(${rot} ${x} ${y})`} />
    </>
  );
}

/** darkening towards the underside, so the fruit sits in light */
const Under = ({ clip }: { clip: string }) => (
  <g clipPath={u(`clip-${clip}`)}>
    <ellipse cx="29" cy="50" rx="24" ry="13" fill="#000" opacity="0.3" filter={u("blur")} />
  </g>
);

function Eye({ x, y, r = 2.3 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={r} ry={r * 1.12} fill={u("eye")} />
      <circle cx={x - r * 0.35} cy={y - r * 0.4} r={r * 0.34} fill="#fff" />
      <circle cx={x + r * 0.35} cy={y + r * 0.45} r={r * 0.16} fill="#fff" opacity="0.7" />
    </>
  );
}

function Tear({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0C-2.8 4.2-2.6 7.6 0 7.6S2.8 4.2 0 0Z" fill={u("tear")} stroke="#2F7FC2" strokeWidth="0.3" />
      <ellipse cx="-0.8" cy="5" rx="0.5" ry="1" fill="#fff" opacity="0.9" />
    </g>
  );
}

function Leaf({ d, vein }: { d: string; vein: string }) {
  return (
    <>
      <path d={d} fill={u("leaf")} stroke="#1E4A1B" strokeWidth="0.4" />
      <path d={vein} stroke="#CDEFA6" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.8" />
    </>
  );
}

const stroke = (w = 2.2, c = INK) => ({ fill: "none", stroke: c, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

function Heart({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 3.8C-6 -0.4-3.8-5.2 0-2 3.8-5.2 6-0.4 0 3.8Z" fill={u("heart")} stroke="#7A0C22" strokeWidth="0.6" />
      <ellipse cx="-1.7" cy="-1.3" rx="0.9" ry="0.55" fill="#fff" transform="rotate(-30 -1.7 -1.3)" />
    </g>
  );
}

const seeds: [number, number][] = [[12.5, 24], [35.5, 24], [24, 19.5], [10.5, 31], [37.5, 31], [16, 37.5], [32, 37.5], [24, 42], [24, 36.8]];

const art: Record<ReactionId, ReactNode> = {
  // Loving Strawberry
  strawberry: (
    <>
      <Floor rx={12} />
      <path d={BERRY} fill={u("berry")} />
      <Under clip="berry" />
      {seeds.map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x + 0.25} cy={y + 0.35} rx="1.35" ry="1.8" fill="#5E0516" opacity="0.55" />
          <ellipse cx={x} cy={y} rx="0.85" ry="1.3" fill={u("seed")} />
          <ellipse cx={x - 0.25} cy={y - 0.4} rx="0.25" ry="0.4" fill="#fff" opacity="0.8" />
        </g>
      ))}
      <Gloss x={14.5} y={19.5} rx={4.2} ry={5.4} strong={0.5} />
      <ellipse cx="24" cy="15.5" rx="9" ry="2.2" fill="#4A0612" opacity="0.45" filter={u("blur-s")} />
      <path d="M24 13c-.2-3 .4-6 1.8-8.5" {...stroke(2.4, "#2E6A2A")} />
      <path d="M24.5 12.5c-.1-2.5.4-5 1.5-7" {...stroke(0.7, "#9BD86A")} opacity="0.7" />
      <Leaf d="M24 14.5C20.5 8 13 7 9.5 10.5c4 .5 6.5 2.5 8 5.5 1.8-3 4.5-3.2 6.5-.2 2-3 4.7-2.8 6.5.2 1.5-3 4-5 8-5.5C35 7 27.5 8 24 14.5Z" vein="M12 10.5c2.5.5 4.5 1.8 5.8 3.7M36 10.5c-2.5.5-4.5 1.8-5.8 3.7M24 14v-2.5" />
      <Heart x={17} y={26.5} />
      <Heart x={31} y={26.5} />
      <path d="M18.8 32.2c2.3 5.2 8.1 5.2 10.4 0Z" fill={u("mouth")} stroke="#4A0612" strokeWidth="0.4" />
      <path d="M21.3 35.2c1.7-1.2 3.7-1.2 5.4 0-1.5 1.4-3.9 1.4-5.4 0Z" fill={u("tongue")} />
    </>
  ),
  // Smiling Avocado
  avocado: (
    <>
      <Floor rx={13} />
      <path d={AVO_SKIN} fill={u("skin")} />
      <g clipPath={u("clip-skin")}>
        <path d={AVO_SKIN} fill="#0B1707" opacity="0.55" filter={u("grain")} />
        <path d="M13.5 16c1.4-5.5 3.6-10.5 8.5-11.5" {...stroke(1.4, "#B9DC8A")} opacity="0.45" filter={u("blur-s")} />
      </g>
      <path d={AVO_FLESH} fill={u("flesh")} />
      <path d={AVO_FLESH} fill="none" stroke="#5E8E34" strokeWidth="0.9" opacity="0.7" />
      <g clipPath={u("clip-flesh")}>
        <path d="M17.5 21c1-5.2 2.6-10.5 6.5-11.5" {...stroke(2.2, "#ffffff")} opacity="0.55" filter={u("blur-s")} />
        <ellipse cx="25.5" cy="36.8" rx="8" ry="7.5" fill="#3F5E1E" opacity="0.45" filter={u("blur")} />
      </g>
      <circle cx="24" cy="34.5" r="6.9" fill={u("pit")} />
      <ellipse cx="21.6" cy="31.8" rx="2.2" ry="1.5" fill="#fff" opacity="0.55" filter={u("blur-s")} transform="rotate(-30 21.6 31.8)" />
      <ellipse cx="21.2" cy="31.4" rx="0.8" ry="0.45" fill="#fff" opacity="0.9" transform="rotate(-30 21.2 31.4)" />
      <path d="M16.8 19.8q2.2-3.2 4.4 0M26.8 19.8q2.2-3.2 4.4 0" {...stroke(1.9)} />
      <path d="M20 23q4 3.8 8 0" {...stroke(1.9)} />
      <ellipse cx="15.6" cy="23.6" rx="2.2" ry="1.5" fill="#F4879A" opacity="0.7" filter={u("blur-s")} />
      <ellipse cx="32.4" cy="23.6" rx="2.2" ry="1.5" fill="#F4879A" opacity="0.7" filter={u("blur-s")} />
    </>
  ),
  // Laughing Orange
  orange: (
    <>
      <Floor />
      <circle cx="24" cy="27" r="19" fill={u("orange")} />
      <g clipPath={u("clip-round")}>
        <circle cx="24" cy="27" r="19" fill="#8A3A00" opacity="0.38" filter={u("grain")} />
        <ellipse cx="29" cy="50" rx="24" ry="13" fill="#000" opacity="0.28" filter={u("blur")} />
      </g>
      <Gloss x={14.5} y={18} rx={4.8} ry={6.2} strong={0.55} />
      <ellipse cx="24" cy="9.8" rx="5" ry="1.8" fill="#7A3A00" opacity="0.5" filter={u("blur-s")} />
      <path d="M24 10.2l-2.6-1.2 1-1.8 1.6.9 1.6-.9 1 1.8Z" fill="#3E7A2E" stroke="#1E4A1B" strokeWidth="0.3" />
      <Leaf d="M24.5 9c1-4 5-6.5 10-5.8C34 8 29.5 10.8 24.5 9Z" vein="M25.5 8.5c2.5-.5 5.5-2 8-4.5" />
      <path d="M12.5 21.5l6.5 3-6.5 3M35.5 21.5l-6.5 3 6.5 3" {...stroke(2.3)} />
      <path d="M14 30.2c2.5 12.3 17.5 12.3 20 0Z" fill={u("mouth")} stroke="#4A1500" strokeWidth="0.5" />
      <path d="M15.3 30.9h17.4c-.3 1.2-.7 2.2-1.2 3.1H16.5c-.5-.9-.9-1.9-1.2-3.1Z" fill="#fff" />
      <path d="M18.5 36.8c3-2.6 8-2.6 11 0-2.8 3.3-8.2 3.3-11 0Z" fill={u("tongue")} />
      <Tear x={8} y={27.5} s={0.9} />
      <Tear x={40} y={27.5} s={0.9} />
    </>
  ),
  // Shocked Blueberry
  blueberry: (
    <>
      <Floor />
      <circle cx="24" cy="27" r="19" fill={u("blue")} />
      <g clipPath={u("clip-round")}>
        <circle cx="19" cy="22" r="20" fill="#DCE2FF" opacity="0.3" filter={u("bloom")} />
        <ellipse cx="29" cy="50" rx="24" ry="13" fill="#000" opacity="0.32" filter={u("blur")} />
      </g>
      <Gloss x={14.5} y={18.5} rx={4.2} ry={5.6} strong={0.42} />
      <path d="M17 11l3.4-4.6 3.6 3.8 3.6-3.8L31 11l-2.6 3.8h-8.8Z" fill="#1B2270" stroke="#0E1245" strokeWidth="0.4" strokeLinejoin="round" />
      <path d="M20.4 13.2l1.4-2.4 2.2 1.8 2.2-1.8 1.4 2.4Z" fill="#0A0D33" />
      <path d="M17.6 10.8l2.8-3.8 3.6 3.7" {...stroke(0.5, "#7C88E8")} opacity="0.7" />
      <path d="M12.8 17.2q3.8-3.4 7.6-1.4M27.6 15.8q3.8-2 7.6 1.4" {...stroke(1.9)} />
      <ellipse cx="17" cy="25.2" rx="5" ry="5.4" fill="#0E1245" opacity="0.35" filter={u("blur-s")} />
      <ellipse cx="31" cy="25.2" rx="5" ry="5.4" fill="#0E1245" opacity="0.35" filter={u("blur-s")} />
      <circle cx="17" cy="24.8" r="4.8" fill={u("white")} />
      <circle cx="31" cy="24.8" r="4.8" fill={u("white")} />
      <Eye x={17} y={25.3} r={2.1} />
      <Eye x={31} y={25.3} r={2.1} />
      <ellipse cx="24" cy="37" rx="3.7" ry="4.7" fill={u("mouth")} stroke="#0E1245" strokeWidth="0.7" />
      <path d="M21.8 40.2q2.2 1.4 4.4 0" {...stroke(0.6, "#A9B4FA")} opacity="0.7" />
    </>
  ),
  // Crying Mango
  mango: (
    <>
      <Floor rx={13} />
      <path d={MANGO} fill={u("mango")} />
      <g clipPath={u("clip-mango")}>
        <rect x="4" y="4" width="40" height="42" fill={u("blush")} />
        <rect x="4" y="4" width="40" height="42" fill={u("green")} />
        <path d={MANGO} fill="#FFF6C8" opacity="0.28" filter={u("grain")} />
        <ellipse cx="27" cy="50" rx="24" ry="12" fill="#000" opacity="0.28" filter={u("blur")} />
      </g>
      <Gloss x={16.5} y={17.5} rx={4.2} ry={6.2} rot={-35} strong={0.6} />
      <ellipse cx="28.5" cy="8.2" rx="3" ry="1.2" fill="#7A3A00" opacity="0.5" filter={u("blur-s")} />
      <path d="M28.3 8.5c.2-1.6.6-2.8 1.4-3.8" {...stroke(1.8, "#5A3A1A")} />
      <Leaf d="M29.5 6c1.5-3.5 5.5-5 10-3.8C38.5 6 34 8 29.5 6Z" vein="M30.8 5.6c2.4-.2 5-1.2 7.6-3" />
      <path d="M14.3 22.8l5.7-2.9M34.7 22.8L29 19.9" {...stroke(2)} />
      <Eye x={18.5} y={26.8} r={2.3} />
      <Eye x={30.5} y={26.8} r={2.3} />
      <path d="M17 29.2q1.5.9 3 0M29 29.2q1.5.9 3 0" {...stroke(0.7, "#7CC6F5")} />
      <path d="M20.3 36.8q1.3-2.3 2.9-1.6t2.7 0 2.7 1.6" {...stroke(2)} />
      <Tear x={16.3} y={30} />
      <Tear x={32.7} y={30} />
    </>
  ),
  // Angry Apple
  apple: (
    <>
      <Floor rx={13} />
      <path d={APPLE} fill={u("apple")} />
      <g clipPath={u("clip-apple")}>
        <g stroke="#FFD08A" strokeLinecap="round" fill="none" opacity="0.3">
          <path d="M30 14c4 6 5 17 2 27" strokeWidth="1.1" />
          <path d="M34.5 15c3 6 3.5 15 1 23" strokeWidth="0.8" />
          <path d="M26.5 15.5c2 8 2 18 0 26" strokeWidth="0.7" />
          <path d="M17 15c-3 7-3.5 17-1 26" strokeWidth="0.8" />
        </g>
        <path d={APPLE} fill="#FFE6B0" opacity="0.22" filter={u("grain")} />
        <ellipse cx="29" cy="51" rx="24" ry="13" fill="#000" opacity="0.34" filter={u("blur")} />
        <ellipse cx="24" cy="13.8" rx="6.5" ry="3" fill="#3E0408" opacity="0.65" filter={u("blur")} />
      </g>
      <Gloss x={14} y={20.5} rx={4.2} ry={6.4} strong={0.6} />
      <path d="M24 15.5c-.2-4 .8-7.6 3-10.5" {...stroke(2.6, u("stem"))} />
      <path d="M23.6 15c-.1-3.5.7-6.6 2.5-9.3" {...stroke(0.6, "#D9A36A")} opacity="0.7" />
      <Leaf d="M27 8c3-4.3 8.3-5 11-3.3C36.5 9.2 31.2 10.8 27 8Z" vein="M28.5 7.8c2.8-.3 5.8-1.3 8.3-2.8" />
      <path d="M12 20.5l8.6 4M36 20.5l-8.6 4" {...stroke(2.8, "#2A0607")} />
      <Eye x={18} y={28.2} r={2.4} />
      <Eye x={30} y={28.2} r={2.4} />
      <path d="M18.5 38.2q5.5-5.2 11 0" {...stroke(2.3, "#2A0607")} />
      <path d="M19.5 39.6q4.5-3.6 9 0" {...stroke(0.6, "#FF8A6A")} opacity="0.6" />
    </>
  ),
};

/** Real pictures for some or all fruits (see src/app/community/page.tsx) */
export const FruitPictures = createContext<Partial<Record<ReactionId, string>>>({});

/**
 * Moving pieces cut out of a fruit picture, listed in /public/reactions/effects.json.
 * Positions are in % of the picture. If a picture is replaced, its entry there
 * must be redone (or removed) or the pieces will sit in the wrong place.
 */
interface Piece {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** how far it pops out (bulge) */
  pop?: number;
  /** the point it grows from (swell) */
  origin?: string;
}
export interface FruitFx {
  /** false = leave out the little flying hearts / tears / sparkles */
  bits?: boolean;
  /** eyes that pop out of the face */
  bulge?: Piece[];
  /** tears that swell */
  swell?: Piece[];
  /** drops that fall from these points */
  drops?: { src: string; w: number; from: { x: number; y: number }[] };
}
export const FruitEffects = createContext<Partial<Record<ReactionId, FruitFx>>>({});

export default function FruitFace({ id, className = "" }: { id: ReactionId; className?: string }) {
  const picture = useContext(FruitPictures)[id];
  if (picture) {
    // eslint-disable-next-line @next/next/no-img-element -- small cut-out picture, already the right size
    return <img src={picture} alt="" aria-hidden className={`object-contain ${className}`} />;
  }
  return (
    <svg aria-hidden viewBox="0 0 48 48" className={className} overflow="visible">
      {art[id]}
    </svg>
  );
}

/* ——— The performance: what flies off each fruit while it acts ——— */
type Bit = { x: number; y: number; dx: number; dy: number; delay: number; spin?: number; grow?: number };

const bits: Record<ReactionId, { kind: "heart" | "tear" | "steam" | "spark" | "ha" | "bang"; list: Bit[] }> = {
  strawberry: { kind: "heart", list: [
    { x: 18, y: 10, dx: -26, dy: -46, delay: 80, spin: -18 }, { x: 78, y: 8, dx: 24, dy: -52, delay: 200, spin: 16 },
    { x: 48, y: 0, dx: 4, dy: -60, delay: 340 }, { x: 8, y: 34, dx: -34, dy: -30, delay: 480, spin: -24 }, { x: 88, y: 32, dx: 34, dy: -34, delay: 560, spin: 22 },
  ] },
  avocado: { kind: "spark", list: [
    { x: 10, y: 14, dx: -22, dy: -26, delay: 60, spin: 90 }, { x: 86, y: 12, dx: 24, dy: -28, delay: 220, spin: -90 },
    { x: 48, y: -4, dx: 0, dy: -34, delay: 380, spin: 120 }, { x: 0, y: 52, dx: -28, dy: 4, delay: 500, spin: 60 }, { x: 96, y: 52, dx: 28, dy: 2, delay: 600, spin: -60 },
  ] },
  orange: { kind: "ha", list: [
    { x: 4, y: 12, dx: -30, dy: -30, delay: 60, spin: -14 }, { x: 82, y: 6, dx: 30, dy: -34, delay: 240, spin: 12 },
    { x: 40, y: -8, dx: -4, dy: -40, delay: 420, spin: -6 }, { x: 90, y: 40, dx: 36, dy: -12, delay: 580, spin: 18 },
  ] },
  blueberry: { kind: "bang", list: [
    { x: 16, y: 0, dx: -18, dy: -38, delay: 40, spin: -20 }, { x: 48, y: -10, dx: 0, dy: -44, delay: 100 }, { x: 80, y: 0, dx: 18, dy: -38, delay: 160, spin: 20 },
  ] },
  mango: { kind: "tear", list: [
    { x: 22, y: 52, dx: -16, dy: 56, delay: 120 }, { x: 74, y: 52, dx: 16, dy: 56, delay: 260 },
    { x: 18, y: 54, dx: -30, dy: 46, delay: 440 }, { x: 78, y: 54, dx: 30, dy: 46, delay: 560 }, { x: 26, y: 56, dx: -8, dy: 60, delay: 680 },
  ] },
  apple: { kind: "steam", list: [
    { x: 10, y: 16, dx: -34, dy: -26, delay: 120, grow: 2.2 }, { x: 86, y: 16, dx: 34, dy: -26, delay: 120, grow: 2.2 },
    { x: 6, y: 22, dx: -40, dy: -12, delay: 420, grow: 2.4 }, { x: 90, y: 22, dx: 40, dy: -12, delay: 420, grow: 2.4 },
    { x: 14, y: 12, dx: -24, dy: -38, delay: 640, grow: 2 }, { x: 82, y: 12, dx: 24, dy: -38, delay: 640, grow: 2 },
  ] },
};

function BitShape({ kind }: { kind: (typeof bits)[ReactionId]["kind"] }) {
  if (kind === "heart")
    return (
      <svg viewBox="0 0 20 18" className="h-6 w-6 drop-shadow-sm">
        <path d="M10 17C2 11 0 7 0 4.5 0 2 2 0 4.5 0 6.5 0 8.5 1 10 3c1.5-2 3.5-3 5.5-3C18 0 20 2 20 4.5 20 7 18 11 10 17Z" fill="#E8254A" />
        <ellipse cx="5.5" cy="4.5" rx="2" ry="1.3" fill="#fff" opacity="0.7" transform="rotate(-30 5.5 4.5)" />
      </svg>
    );
  if (kind === "tear")
    return (
      <svg viewBox="0 0 12 18" className="h-6 w-4">
        <path d="M6 0C1 7 0 10 0 12a6 6 0 0 0 12 0c0-2-1-5-6-12Z" fill="#6CC0F5" stroke="#2F7FC2" strokeWidth="0.6" />
        <ellipse cx="3.8" cy="11" rx="1.2" ry="2.2" fill="#fff" opacity="0.85" />
      </svg>
    );
  if (kind === "steam") return <span className="block h-4 w-4 rounded-full bg-white/90 shadow-[0_0_6px_3px_rgba(255,255,255,0.8)]" />;
  if (kind === "spark")
    return (
      <svg viewBox="0 0 20 20" className="h-6 w-6">
        <path d="M10 0c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10Z" fill="#F6C445" stroke="#C98F1A" strokeWidth="0.6" />
      </svg>
    );
  if (kind === "ha") return <span className="block font-sans text-xl font-extrabold italic text-[#E8730A] [text-shadow:0_1px_0_#fff]">ha</span>;
  return <span className="block font-display text-4xl font-bold leading-none text-[#34409A] [text-shadow:0_1px_0_#fff]">!</span>;
}

/**
 * A fruit giving its one-second performance: the orange laughs, the apple fumes...
 * Put it inside a positioned box; it fills the size you give it.
 */
export function FruitAct({ id, act, className = "" }: { id: ReactionId; act: string; className?: string }) {
  const b = bits[id];
  const fx = useContext(FruitEffects)[id];
  const place = (p: { x: number; y: number; w: number; h?: number }) => ({ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: p.h ? `${p.h}%` : undefined });
  return (
    <span aria-hidden className={`pointer-events-none relative block ${className}`}>
      <span className="relative block h-full w-full" style={{ animation: `${act} 1s var(--ease-melt) both` }}>
        <FruitFace id={id} className="h-full w-full drop-shadow-[0_10px_14px_rgba(29,25,22,0.28)]" />
        {/* tears that swell where they sit */}
        {fx?.swell?.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element -- a small piece of the fruit picture
          <img key={p.src} src={p.src} alt="" className="absolute" style={{ ...place(p), transformOrigin: p.origin ?? "50% 50%", animation: "ff-swell 1.1s ease-in-out both" }} />
        ))}
        {/* drops that fall from the eyes, three each side */}
        {fx?.drops?.from.flatMap((at, side) =>
          [0, 1, 2].map((n) => (
            // eslint-disable-next-line @next/next/no-img-element -- a small piece of the fruit picture
            <img
              key={`${side}-${n}`}
              src={fx.drops!.src}
              alt=""
              className="absolute opacity-0"
              style={{ ...place({ ...at, w: fx.drops!.w }), animation: `ff-drop 0.62s cubic-bezier(0.5, 0, 0.9, 0.5) ${140 + n * 300 + side * 110}ms both` }}
            />
          )),
        )}
        {/* eyes that pop out of the face */}
        {fx?.bulge?.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element -- a small piece of the fruit picture
          <img key={p.src} src={p.src} alt="" className="absolute" style={{ ...place(p), "--pop": p.pop ?? 1.8, animation: "ff-bulge 1.15s var(--ease-scoop) both" } as React.CSSProperties} />
        ))}
      </span>
      {fx?.bits !== false && b.list.map((p, i) => (
        <span
          key={i}
          className="absolute opacity-0"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--spin": `${p.spin ?? 0}deg`,
              "--grow": p.grow ?? 1.2,
              animation: `ff-bit 0.75s ease-out ${p.delay}ms both`,
            } as React.CSSProperties
          }
        >
          <BitShape kind={b.kind} />
        </span>
      ))}
    </span>
  );
}
