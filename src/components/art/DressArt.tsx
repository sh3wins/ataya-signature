import { useId } from "react";
import { flavourMap, type FlavourSlug } from "@/lib/flavours";
import type { Detail, Silhouette } from "@/lib/products";
import { darken, lighten, mix } from "@/lib/colour";

/**
 * Illustrated "invisible mannequin" dress.
 * A placeholder for real photography that still feels editorial:
 * fabric shading, folds, grain and a slow sway so the dress feels alive.
 */

export interface DressArtProps {
  flavour: FlavourSlug;
  silhouette: Silhouette;
  detail: Detail;
  tone?: 0 | 1 | 2 | 3;
  view?: "front" | "back";
  sway?: boolean;
  shadow?: boolean;
  className?: string;
  title?: string;
  /** Zoom into part of the dress (for detail shots) */
  viewBox?: string;
}

type P = [number, number];

/** Round so server and browser produce identical SVG paths */
const n = (v: number) => Math.round(v * 10) / 10;

interface Shape {
  waist: number;
  wl: number;
  wr: number;
  hem: number;
  hl: number;
  hr: number;
  /** For wrap: right side hem height */
  hemR?: number;
  bulge: number;
}

const shapes: Record<Silhouette, Shape> = {
  mini: { waist: 170, wl: 126, wr: 174, hem: 300, hl: 58, hr: 242, bulge: 0.55 },
  midi: { waist: 170, wl: 126, wr: 174, hem: 408, hl: 38, hr: 262, bulge: 0.5 },
  maxi: { waist: 170, wl: 126, wr: 174, hem: 496, hl: 52, hr: 248, bulge: 0.35 },
  column: { waist: 170, wl: 127, wr: 173, hem: 500, hl: 102, hr: 198, bulge: 0.15 },
  slip: { waist: 170, wl: 124, wr: 176, hem: 440, hl: 92, hr: 208, bulge: 0.2 },
  tiered: { waist: 170, wl: 126, wr: 174, hem: 450, hl: 36, hr: 264, bulge: 0.4 },
  wrap: { waist: 170, wl: 126, wr: 174, hem: 410, hemR: 350, hl: 56, hr: 238, bulge: 0.45 },
};

function hemPath(from: P, to: P, sag: number, scallops: number): string {
  const [x0, y0] = from;
  const [x1, y1] = to;
  if (!scallops) {
    const cx = (x0 + x1) / 2;
    return `Q ${cx} ${Math.max(y0, y1) + sag} ${x1} ${y1}`;
  }
  let d = "";
  for (let i = 1; i <= scallops; i++) {
    const t = i / scallops;
    const tm = (i - 0.5) / scallops;
    const arc = (t: number) => Math.sin(Math.PI * t) * sag;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t + arc(t);
    const mx = x0 + (x1 - x0) * tm;
    const my = y0 + (y1 - y0) * tm + arc(tm) + 16;
    d += ` Q ${n(mx)} ${n(my)} ${n(x)} ${n(y)}`;
  }
  return d;
}

function skirtPath(s: Shape, scallops: number): string {
  const h = s.hem - s.waist;
  const hemR = s.hemR ?? s.hem;
  const b = s.bulge;
  return [
    `M ${s.wl} ${s.waist}`,
    `C ${n(s.wl - (s.wl - s.hl) * b)} ${n(s.waist + h * 0.3)}, ${s.hl + 4} ${n(s.hem - h * 0.35)}, ${s.hl} ${s.hem}`,
    hemPath([s.hl, s.hem], [s.hr, hemR], 14, scallops),
    `C ${s.hr - 4} ${n(hemR - (hemR - s.waist) * 0.35)}, ${n(s.wr + (s.hr - s.wr) * b)} ${n(s.waist + h * 0.3)}, ${s.wr} ${s.waist}`,
    "Z",
  ].join(" ");
}

function tierPaths(scallops: number): string[] {
  const tiers: Shape[] = [
    { waist: 168, wl: 124, wr: 176, hem: 262, hl: 98, hr: 202, bulge: 0.4 },
    { waist: 250, wl: 96, wr: 204, hem: 352, hl: 66, hr: 234, bulge: 0.4 },
    { waist: 340, wl: 64, wr: 236, hem: 452, hl: 36, hr: 264, bulge: 0.4 },
  ];
  return tiers.map((t) => skirtPath(t, scallops || 7));
}

const bodiceFront =
  "M 112 78 C 124 66 138 70 150 88 C 162 70 176 66 188 78 C 186 112 176 142 174 172 L 126 172 C 124 142 114 112 112 78 Z";
const bodiceSlip =
  "M 116 84 C 130 98 170 98 184 84 C 184 116 178 146 176 172 L 124 172 C 122 146 116 116 116 84 Z";
const bodiceBack =
  "M 112 96 C 130 102 170 102 188 96 C 186 124 176 146 174 172 L 126 172 C 124 146 114 124 112 96 Z";

function tonePalette(flavour: FlavourSlug, tone: number): [string, string, string] {
  const f = flavourMap[flavour];
  switch (tone) {
    case 1:
      return [lighten(f.raw.cream, 0.3), mix(f.raw.cream, f.scoop[0], 0.6), f.scoop[1]];
    case 2:
      return [lighten(f.raw.secondaryColour, 0.25), f.raw.secondaryColour, darken(f.raw.secondaryColour, 0.35)];
    case 3:
      return [lighten(f.accent, 0.3), f.accent, darken(f.accent, 0.3)];
    default:
      return f.scoop;
  }
}

export default function DressArt({
  flavour,
  silhouette,
  detail,
  tone = 0,
  view = "front",
  sway = true,
  shadow = true,
  className,
  title,
  viewBox = "0 0 300 540",
}: DressArtProps) {
  const uid = useId().replace(/:/g, "");
  const f = flavourMap[flavour];
  const [light, mid, deep] = tonePalette(flavour, tone);
  const accent =
    tone === 2 ? f.raw.cream : tone === 3 ? f.raw.secondaryColour : f.raw.secondaryColour;
  const s = shapes[silhouette];
  const scallops = detail === "ruffle" ? (silhouette === "mini" ? 9 : 11) : 0;
  const isTiered = silhouette === "tiered";
  const bodice = view === "back" ? bodiceBack : silhouette === "slip" ? bodiceSlip : bodiceFront;
  const g = (n: string) => `${n}-${uid}`;

  // Fold lines from the waist to the hem
  const folds = detail === "pleat" ? 13 : isTiered ? 0 : 5;
  const foldLines = Array.from({ length: folds }, (_, i) => {
    const t = (i + 1) / (folds + 1);
    const top = s.wl + (s.wr - s.wl) * t;
    const hemR = s.hemR ?? s.hem;
    const bottom = s.hl + (s.hr - s.hl) * t;
    const by = s.hem + (hemR - s.hem) * t + Math.sin(Math.PI * t) * 12;
    const bend = (t - 0.5) * 18;
    return `M ${n(top)} ${s.waist + 4} Q ${n((top + bottom) / 2 + bend)} ${n((s.waist + by) / 2)} ${n(bottom)} ${n(by - 4)}`;
  });

  const tierColours = [mid, mix(mid, light, 0.55), light];

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={g("fabric")} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={deep} />
          <stop offset="0.28" stopColor={mid} />
          <stop offset="0.46" stopColor={light} />
          <stop offset="0.7" stopColor={mid} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <linearGradient id={g("fall")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0" />
          <stop offset="0.85" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={g("fold")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={deep} stopOpacity="0" />
          <stop offset="0.5" stopColor={deep} stopOpacity="0.55" />
          <stop offset="1" stopColor={deep} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={g("sheen")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={g("floor")}>
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id={g("grain")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.7 0 0 0 -0.26" result="speck" />
          <feComposite in="speck" in2="SourceGraphic" operator="in" result="grain" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>
      </defs>

      {shadow && (
        <ellipse cx="150" cy={Math.max(s.hem, s.hemR ?? 0) + 24} rx="110" ry="12" fill={`url(#${g("floor")})`} />
      )}

      {/* Straps */}
      <g stroke={deep} strokeWidth={silhouette === "slip" ? 1.6 : 3} strokeLinecap="round" fill="none">
        <path d={view === "back" ? "M 122 98 L 128 22" : "M 119 78 L 127 20"} />
        <path d={view === "back" ? "M 178 98 L 172 22" : "M 181 78 L 173 20"} />
      </g>

      {/* Skirt (sways from the waist) */}
      <g
        style={sway ? { transformOrigin: "150px 172px", animation: "var(--animate-sway)" } : undefined}
        filter={`url(#${g("grain")})`}
      >
        {isTiered ? (
          tierPaths(scallops)
            .reverse()
            .map((d, i) => (
              <g key={i}>
                <path d={d} fill={`url(#${g("fabric")})`} />
                <path d={d} fill={tierColours[2 - i]} opacity="0.55" />
                <path d={d} fill={`url(#${g("fall")})`} />
              </g>
            ))
        ) : (
          <>
            <path d={skirtPath(s, scallops)} fill={`url(#${g("fabric")})`} />
            <path d={skirtPath(s, scallops)} fill={`url(#${g("fall")})`} />
            <g fill="none" stroke={`url(#${g("fold")})`} strokeWidth={detail === "pleat" ? 1.2 : 2.4} strokeLinecap="round" opacity="0.7">
              {foldLines.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            {silhouette === "wrap" && (
              <path
                d={`M ${s.wr} ${s.waist + 2} C 170 250 120 330 ${s.hl + 30} ${s.hem - 6}`}
                stroke={deep}
                strokeOpacity="0.55"
                strokeWidth="2"
                fill="none"
              />
            )}
            {detail === "ruffle" && (
              <path
                d={skirtPath({ ...s, waist: s.hem - 40, wl: s.hl + 8, wr: s.hr - 8, bulge: 0.2 }, scallops)}
                fill={light}
                opacity="0.35"
              />
            )}
            <path d={skirtPath(s, 0)} fill={`url(#${g("sheen")})`} opacity={silhouette === "column" || silhouette === "slip" ? 1 : 0.5} />
          </>
        )}
      </g>

      {/* Bodice */}
      <g filter={`url(#${g("grain")})`}>
        <path d={bodice} fill={`url(#${g("fabric")})`} />
        <path d={bodice} fill={`url(#${g("sheen")})`} opacity="0.6" />
        {view === "back" && <path d="M 150 102 L 150 250" stroke={deep} strokeWidth="1.4" strokeDasharray="2 3" />}
        {view === "front" && silhouette === "slip" && (
          <path d="M 122 92 Q 150 118 178 92" fill="none" stroke={deep} strokeOpacity="0.4" strokeWidth="2" />
        )}
      </g>
      <path d="M 124 172 Q 150 176 176 172" stroke={deep} strokeWidth="2.5" fill="none" opacity="0.6" />

      {/* Details */}
      {detail === "drape" && view === "front" && (
        <path
          d="M 116 80 C 140 96 150 140 176 170 C 170 132 150 104 132 76 Z"
          fill={accent}
          opacity="0.9"
          filter={`url(#${g("grain")})`}
        />
      )}
      {detail === "bow" && (
        <g transform={view === "back" ? "translate(150 176) scale(1.35)" : "translate(150 172)"}>
          <path d="M 0 0 C -22 -22 -44 -14 -40 2 C -38 16 -18 12 0 0 Z" fill={accent} />
          <path d="M 0 0 C 22 -22 44 -14 40 2 C 38 16 18 12 0 0 Z" fill={accent} />
          <path d="M -4 2 C -12 26 -20 48 -26 70 L -14 66 C -8 44 -2 24 2 4 Z" fill={darken(accent, 0.12)} />
          <path d="M 4 2 C 10 26 16 48 22 70 L 10 64 C 6 44 2 24 -2 4 Z" fill={darken(accent, 0.2)} />
          <ellipse cx="0" cy="0" rx="7" ry="8" fill={darken(accent, 0.18)} />
          <path d="M -30 -4 C -24 -12 -14 -10 -6 -3" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
        </g>
      )}
    </svg>
  );
}
