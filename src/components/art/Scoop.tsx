import { useId, type CSSProperties } from "react";
import { flavourMap, type FlavourSlug } from "@/lib/flavours";
import { seeded } from "@/lib/colour";

/**
 * A physical-feeling ice-cream scoop.
 * Dome + ruffled scoop lip, soft radial lighting, a bumpy
 * surface texture, glossy highlights, flecks and a few drips.
 */

export const SCOOP_PATH = (() => {
  let d = "M 20 112 C 16 52 58 16 100 16 C 142 16 184 52 180 112";
  const bumps = 8;
  for (let i = 1; i <= bumps; i++) {
    const x0 = 180 - ((i - 1) * 160) / bumps;
    const x1 = 180 - (i * 160) / bumps;
    const mx = (x0 + x1) / 2;
    const dip = i % 2 ? 136 : 130;
    const end = i === bumps ? 112 : i % 3 === 0 ? 118 : 122;
    d += ` Q ${mx + 4} ${dip}, ${x1} ${end}`;
  }
  return d + " Z";
})();

const DRIPS = [
  "M 46 124 C 44 136 42 150 46 156 C 50 162 56 158 55 150 C 54 142 54 134 56 128 Z",
  "M 118 128 C 116 142 116 166 121 172 C 126 178 132 172 130 162 C 128 150 128 140 130 130 Z",
  "M 152 124 C 152 132 151 140 154 144 C 157 148 161 144 160 138 C 159 132 160 128 161 124 Z",
];

export interface ScoopProps {
  flavour: FlavourSlug;
  className?: string;
  style?: CSSProperties;
  /** A tiny drip falls from the scoop */
  dripping?: boolean;
  /** Heavier texture filter; keep for large scoops */
  rich?: boolean;
  shadow?: boolean;
  /** Sit the scoop on a waffle cone */
  cone?: boolean;
  title?: string;
}

function Flecks({ flavour, colour }: { flavour: FlavourSlug; colour: string }) {
  const fl = flavourMap[flavour].fleck;
  const r = seeded(flavour.length * 97 + 13);
  const pts = Array.from({ length: fl === "swirl" ? 0 : 22 }, () => {
    const a = r() * Math.PI;
    const rad = 20 + r() * 58;
    const q = (v: number) => Math.round(v * 10) / 10;
    return [q(100 + Math.cos(a + Math.PI) * rad), q(96 - Math.sin(a) * rad * 0.9 + 8), q(r())];
  });
  if (fl === "swirl") {
    return (
      <g fill="none" stroke={colour} strokeLinecap="round" opacity="0.55">
        <path d="M 40 92 C 60 70 82 104 104 80 C 122 60 142 86 160 70" strokeWidth="6" />
        <path d="M 50 60 C 70 44 90 66 112 48" strokeWidth="4" opacity="0.7" />
        <path d="M 60 112 C 84 98 108 118 146 100" strokeWidth="5" opacity="0.6" />
      </g>
    );
  }
  return (
    <g fill={colour}>
      {pts.map(([x, y, t], i) => {
        if (fl === "seed")
          return <ellipse key={i} cx={x} cy={y} rx="1.6" ry="2.6" transform={`rotate(${Math.round(t * 60 - 30)} ${x} ${y})`} opacity="0.8" />;
        if (fl === "bean") return <circle key={i} cx={x} cy={y} r={0.8 + t * 0.9} opacity="0.75" />;
        if (fl === "chip")
          return <path key={i} d={`M ${x} ${y} l ${3 + t * 3} ${-1} l ${-1} ${3 + t * 2} z`} opacity="0.85" />;
        return <path key={i} d={`M ${x} ${y} l 4 -2 l 1 4 l -4 1 z`} opacity="0.7" />;
      })}
    </g>
  );
}

export default function Scoop({
  flavour,
  className,
  style,
  dripping,
  rich = true,
  shadow = true,
  cone = false,
  title,
}: ScoopProps) {
  const uid = useId().replace(/:/g, "");
  const g = (n: string) => `${n}-${uid}`;
  const f = flavourMap[flavour];
  const [light, mid, deep] = f.scoop;

  return (
    <svg
      viewBox={cone ? "0 0 200 330" : "0 0 200 210"}
      data-scoop-vb={cone ? 330 : 210}
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      overflow="visible"
    >
      <defs>
        <radialGradient id={g("body")} cx="0.36" cy="0.3" r="0.78">
          <stop offset="0" stopColor={light} />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="1" stopColor={deep} />
        </radialGradient>
        <linearGradient id={g("lip")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.6" stopColor={deep} stopOpacity="0" />
          <stop offset="1" stopColor={deep} stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id={g("gloss")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g("shadow")}>
          <stop offset="0" stopColor="#000" stopOpacity="0.3" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id={g("tex")} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency={rich ? 0.045 : 0.06} numOctaves="3" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={rich ? 3 : 2} xChannelSelector="R" yChannelSelector="G" result="shape" />
          {rich ? (
            <>
              <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="11" result="bump" />
              <feDiffuseLighting in="bump" surfaceScale="0.6" lightingColor="#fff" diffuseConstant="1" result="lit">
                <feDistantLight azimuth="225" elevation="55" />
              </feDiffuseLighting>
              <feComposite in="shape" in2="lit" operator="arithmetic" k1="0.32" k2="0.74" k3="0" k4="0" />
            </>
          ) : null}
        </filter>
      </defs>

      {shadow && !cone && <ellipse cx="100" cy="196" rx="70" ry="9" fill={`url(#${g("shadow")})`} />}
      {cone && (
        <g>
          <pattern id={g("waffle")} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="14" height="14" fill="#DDAE6C" />
            <path d="M0 0 H14 M0 0 V14" stroke="#B5813F" strokeWidth="2.2" />
          </pattern>
          <linearGradient id={g("coneShade")} x1="0" x2="1">
            <stop offset="0" stopColor="#5a3510" stopOpacity="0.35" />
            <stop offset="0.4" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="1" stopColor="#5a3510" stopOpacity="0.45" />
          </linearGradient>
          <path d="M 34 112 L 166 112 L 104 318 Q 100 326 96 318 Z" fill={`url(#${g("waffle")})`} />
          <path d="M 34 112 L 166 112 L 104 318 Q 100 326 96 318 Z" fill={`url(#${g("coneShade")})`} />
        </g>
      )}

      <g className="scoop-dome">
      <g filter={`url(#${g("tex")})`}>
        <path d={SCOOP_PATH} fill={`url(#${g("body")})`} />
        {DRIPS.map((d, i) => (
          <path key={i} d={d} fill={mid} />
        ))}
        <path d={SCOOP_PATH} fill={`url(#${g("lip")})`} />
        <Flecks flavour={flavour} colour={f.fleckColour} />
      </g>

      {/* Gloss */}
      <ellipse cx="70" cy="50" rx="30" ry="18" fill={`url(#${g("gloss")})`} transform="rotate(-28 70 50)" />
      <ellipse cx="62" cy="44" rx="6" ry="3.5" fill="#fff" opacity="0.55" transform="rotate(-28 62 44)" />
      <path d="M 120 158 C 121 164 124 168 126 166" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 48 142 C 48 148 50 152 52 150" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {dripping && (
        <g style={{ transformOrigin: "124px 172px", animation: "var(--animate-drip)" }}>
          <path d="M 124 170 C 120 178 120 184 124 186 C 128 184 128 178 124 170 Z" fill={mid} />
        </g>
      )}
      </g>
    </svg>
  );
}
