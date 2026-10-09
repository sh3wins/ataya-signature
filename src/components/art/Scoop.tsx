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

const CONE_PATH = "M 34 112 L 166 112 L 104 318 Q 100 326 96 318 Z";

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
  /** Draw it instead of using the photo (cones only) */
  drawn?: boolean;
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
  drawn = false,
}: ScoopProps) {
  const uid = useId().replace(/:/g, "");
  // Without a cone: just the real swirl (public/scoops/<flavour>-top.webp)
  if (!cone && !drawn) {
    return (
      <svg
        viewBox="0 0 200 210"
        data-scoop-vb={210}
        className={className}
        style={style}
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        overflow="visible"
      >
        {shadow && <ellipse cx="100" cy="204" rx="54" ry="6" fill="#000" opacity="0.2" style={{ filter: "blur(4px)" }} />}
        <image href={`/scoops/${flavour}-top.webp`} x="0" y="0" width="200" height="210" preserveAspectRatio="xMidYMid meet" />
      </svg>
    );
  }
  // Cones use the real soft-serve photo (public/scoops/<flavour>.webp, made to fit this exact frame)
  if (cone && !drawn) {
    return (
      <svg
        viewBox="0 0 200 330"
        data-scoop-vb={330}
        className={className}
        style={style}
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        overflow="visible"
      >
        {shadow && <ellipse cx="100" cy="326" rx="42" ry="6" fill="#000" opacity="0.18" style={{ filter: "blur(4px)" }} />}
        <image href={`/scoops/${flavour}.webp`} x="0" y="0" width="200" height="330" preserveAspectRatio="xMidYMid meet" />
      </svg>
    );
  }
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
        {rich ? (
          /* 3D: the shape's own silhouette becomes a height map (a dome with
             churned ridges), which is then lit from the top left */
          <filter id={g("tex")} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="7" result="wob" />
            <feDisplacementMap in="SourceGraphic" in2="wob" scale="3" xChannelSelector="R" yChannelSelector="G" result="shape" />
            <feColorMatrix in="shape" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="a" />
            <feGaussianBlur in="a" stdDeviation="4" result="b1" />
            <feGaussianBlur in="a" stdDeviation="13" result="b2" />
            <feGaussianBlur in="a" stdDeviation="30" result="b3" />
            <feComposite in="b1" in2="b2" operator="arithmetic" k1="0" k2="0.16" k3="0.3" k4="0" result="h12" />
            <feComposite in="h12" in2="b3" operator="arithmetic" k1="0" k2="1" k3="0.34" k4="0" result="dome" />
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.055" numOctaves="3" seed="23" result="churn" />
            <feColorMatrix in="churn" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="churnA" />
            <feComposite in="dome" in2="churnA" operator="arithmetic" k1="0" k2="1" k3="0.17" k4="0" result="height" />
            <feDiffuseLighting in="height" surfaceScale="30" diffuseConstant="1" lightingColor="#fff" result="lit0">
              <feDistantLight azimuth="228" elevation="58" />
            </feDiffuseLighting>
            <feGaussianBlur in="lit0" stdDeviation="1.3" result="lit" />
            <feComposite in="shape" in2="lit" operator="arithmetic" k1="0.78" k2="0.4" k3="0" k4="0" result="col" />
            <feSpecularLighting in="height" surfaceScale="30" specularConstant="0.2" specularExponent="18" lightingColor="#fff" result="spec0">
              <feDistantLight azimuth="228" elevation="62" />
            </feSpecularLighting>
            <feGaussianBlur in="spec0" stdDeviation="1.6" result="spec" />
            <feComposite in="spec" in2="col" operator="arithmetic" k1="0" k2="0.8" k3="1" k4="0" result="shiny" />
            <feComposite in="shiny" in2="shape" operator="in" />
          </filter>
        ) : (
          <filter id={g("tex")} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        )}
        <filter id={g("emboss")} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="lum" />
          <feGaussianBlur in="lum" stdDeviation="0.9" result="hm" />
          <feDiffuseLighting in="hm" surfaceScale="7" diffuseConstant="1" lightingColor="#fff" result="lit">
            <feDistantLight azimuth="228" elevation="50" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="0.7" k2="0.44" k3="0" k4="0" result="col" />
          <feComposite in="col" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {shadow && !cone && <ellipse cx="100" cy="196" rx="70" ry="9" fill={`url(#${g("shadow")})`} />}
      {cone && (
        <g>
          <pattern id={g("waffle")} width="15" height="15" patternUnits="userSpaceOnUse" patternTransform="rotate(45) skewX(-8)">
            <rect width="15" height="15" fill="#DDAE6C" />
            <rect x="2.4" y="2.4" width="10.2" height="10.2" rx="1.6" fill="#CF9C58" />
            <path d="M0 0 H15 M0 0 V15" stroke="#EDC88A" strokeWidth="3" />
          </pattern>
          <linearGradient id={g("coneShade")} x1="0" x2="1">
            <stop offset="0" stopColor="#4a2a0c" stopOpacity="0.5" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="0.52" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#3d2209" stopOpacity="0.68" />
          </linearGradient>
          <linearGradient id={g("coneTop")} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2e1806" stopOpacity="0.6" />
            <stop offset="0.24" stopColor="#2e1806" stopOpacity="0" />
          </linearGradient>
          <path d={CONE_PATH} fill={`url(#${g("waffle")})`} filter={`url(#${g("emboss")})`} />
          <path d={CONE_PATH} fill={`url(#${g("coneShade")})`} />
          <path d={CONE_PATH} fill={`url(#${g("coneTop")})`} />
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
      <ellipse cx="70" cy="50" rx="30" ry="18" fill={`url(#${g("gloss")})`} opacity={rich ? 0.3 : 1} transform="rotate(-28 70 50)" />
      <ellipse cx="62" cy="44" rx="6" ry="3.5" fill="#fff" opacity={rich ? 0.4 : 0.55} transform="rotate(-28 62 44)" />
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
