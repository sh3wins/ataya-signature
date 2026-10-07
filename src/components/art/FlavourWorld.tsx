import { flavourMap, type FlavourSlug } from "@/lib/flavours";
import { alpha, seeded } from "@/lib/colour";

/**
 * Each flavour is a room in the same house.
 * Light, texture and a few small details change; the architecture
 * (the arch, the melted edge) stays, so every room is clearly Ataya.
 */
export default function FlavourWorld({ flavour, className = "" }: { flavour: FlavourSlug; className?: string }) {
  const f = flavourMap[flavour];
  const r = seeded(flavour.length * 13 + 3);
  const q = (v: number) => Math.round(v * 10) / 10;
  const bits = Array.from({ length: 26 }, () => [q(r() * 100), q(r() * 100), q(r())]);
  const dark = Boolean(f.dark);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ background: f.colour }}>
      {/* the light in the room */}
      {flavour === "strawberry" && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 70% 30%, ${alpha(f.cream, 0.8)}, transparent 70%), radial-gradient(40% 40% at 10% 90%, ${f.accent}55, transparent 70%)` }} />
      )}
      {flavour === "vanilla" && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(115deg, transparent 20%, ${alpha(f.cream, 0.87)} 42%, transparent 62%), radial-gradient(50% 60% at 75% 40%, ${alpha(f.cream, 0.67)}, transparent 70%)` }} />
      )}
      {flavour === "pistachio" && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(45% 45% at 80% 20%, ${f.accent}88, transparent 70%), radial-gradient(60% 50% at 30% 80%, ${alpha(f.cream, 0.6)}, transparent 70%)` }} />
      )}
      {flavour === "blueberry" && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(50% 50% at 25% 30%, ${f.accent}aa, transparent 70%), radial-gradient(50% 60% at 80% 70%, ${alpha(f.cream, 0.53)}, transparent 70%)` }} />
      )}

      {flavour === "mango" && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(55% 50% at 78% 22%, ${f.accent}77, transparent 70%), radial-gradient(55% 55% at 20% 85%, ${alpha(f.cream, 0.7)}, transparent 70%)` }} />
      )}

      {/* the architecture every room shares */}
      <div
        className="absolute left-1/2 top-[15%] h-[95%] w-[min(86vw,38rem)] -translate-x-1/2 rounded-t-full md:left-[66%]"
        style={{ background: `linear-gradient(${f.cream}, ${f.colour} 85%)`, opacity: dark ? 0.1 : 0.6 }}
      />

      {/* small details, one kind per room */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {flavour === "strawberry" &&
          bits.slice(0, 18).map(([x, y, s], i) => (
            <ellipse key={i} cx={x} cy={y} rx={0.18 + s * 0.12} ry={0.3 + s * 0.2} fill={f.fleckColour} opacity={0.12 + s * 0.12} transform={`rotate(${Math.round(s * 60 - 30)} ${x} ${y})`} />
          ))}
        {flavour === "vanilla" &&
          bits.map(([x, y, s], i) => <circle key={i} cx={x} cy={y} r={0.1 + s * 0.12} fill={f.fleckColour} opacity={0.12 + s * 0.1} />)}
      </svg>
      {flavour === "pistachio" &&
        bits.slice(0, 7).map(([x, y, s], i) => (
          <div key={i} className="absolute rounded-full blur-2xl" style={{ left: `${x}%`, top: `${y}%`, width: `${6 + s * 10}rem`, height: `${6 + s * 10}rem`, background: i % 2 ? f.accent : f.cream, opacity: 0.35 }} />
        ))}
      {flavour === "blueberry" &&
        bits.slice(0, 5).map(([x, y, s], i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${0.8 + s * 1.6}rem`,
              height: `${0.8 + s * 1.6}rem`,
              background: `radial-gradient(circle at 35% 30%, #c9ccf5, ${f.raw.secondaryColour} 70%)`,
              opacity: 0.55,
              filter: s > 0.5 ? "blur(2px)" : undefined,
            }}
          />
        ))}

      {/* a soft melted edge, left behind by the scoop */}
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute left-0 top-16 h-14 w-full md:h-20" style={{ color: f.scoop[1] }}>
        <path
          fill="currentColor"
          d="M0 0V34 C22 34 34 58 52 58 C70 58 60 30 98 30 C114 30 126 96 160 96 C194 96 184 40 236 40 C266 40 278 52 292 52 C306 52 296 32 334 32 C350 32 362 74 388 74 C414 74 404 38 464 38 C502 38 514 114 562 114 C610 114 600 28 646 28 C670 28 682 60 700 60 C718 60 708 36 750 36 C770 36 782 46 796 46 C810 46 800 30 866 30 C910 30 922 100 960 100 C998 100 988 40 1042 40 C1074 40 1086 64 1108 64 C1130 64 1120 32 1162 32 C1182 32 1194 50 1210 50 C1226 50 1216 36 1268 36 C1298 36 1310 108 1352 108 C1394 108 1384 30 1440 30 V0Z"
        />
      </svg>
    </div>
  );
}
