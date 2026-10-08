"use client";

import Link from "next/link";
import { useRef, useState, useId } from "react";
import gsap from "gsap";
import Scoop, { SCOOP_PATH } from "@/components/art/Scoop";
import DressArt from "@/components/art/DressArt";
import { ButtonLink, Button } from "@/components/ui/Button";
import { flavours, flavourMap, type FlavourSlug } from "@/lib/flavours";
import { curatedResolver, type Mix, type MixResolver } from "@/lib/lab";
import { getProduct, formatKES } from "@/lib/products";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { playMelt } from "@/components/melt/playMelt";
import { mix as mixColour } from "@/lib/colour";

/** A marbled scoop: flavour A rippled with ribbons of flavour B. */
function MixedScoop({ a, b, className }: { a: FlavourSlug; b: FlavourSlug; className?: string }) {
  const id = useId().replace(/:/g, "");
  const A = flavourMap[a];
  const B = flavourMap[b];
  return (
    <svg viewBox="0 0 200 330" className={className} aria-hidden>
      <defs>
        <radialGradient id={`ma-${id}`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor={A.scoop[0]} />
          <stop offset="0.5" stopColor={A.scoop[1]} />
          <stop offset="1" stopColor={A.scoop[2]} />
        </radialGradient>
        <linearGradient id={`mb-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={B.scoop[2]} />
          <stop offset="0.5" stopColor={B.scoop[0]} />
          <stop offset="1" stopColor={B.scoop[1]} />
        </linearGradient>
        <clipPath id={`mc-${id}`}>
          <path d={SCOOP_PATH} />
        </clipPath>
        <pattern id={`mw-${id}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="#DDAE6C" />
          <path d="M0 0 H14 M0 0 V14" stroke="#B5813F" strokeWidth="2.2" />
        </pattern>
      </defs>
      <path d="M 34 112 L 166 112 L 104 318 Q 100 326 96 318 Z" fill={`url(#mw-${id})`} />
      <g clipPath={`url(#mc-${id})`}>
        <path d={SCOOP_PATH} fill={`url(#ma-${id})`} />
        <g className="lab-swirl" style={{ transformOrigin: "100px 80px" }} fill="none" stroke={`url(#mb-${id})`} strokeLinecap="round">
          <path d="M 10 70 C 50 30 80 110 120 60 C 150 25 180 70 200 50" strokeWidth="18" />
          <path d="M 0 110 C 40 80 90 130 130 100 C 160 80 180 110 200 96" strokeWidth="12" />
          <path d="M 40 30 C 70 10 100 40 140 20" strokeWidth="9" />
        </g>
      </g>
      <ellipse cx="70" cy="50" rx="26" ry="14" fill="#fff" opacity="0.4" transform="rotate(-28 70 50)" />
    </svg>
  );
}

/** A cone for the lab: the photo when there is one, the drawn scoop otherwise */
function LabScoop({ flavour, photo, className }: { flavour: FlavourSlug; photo?: string; className: string }) {
  const size = "h-64 w-auto md:h-80";
  if (!photo) return <Scoop flavour={flavour} cone rich={false} className={`${className} ${size}`} />;
  return (
    <span className={`${className} relative inline-block`}>
      {/* kept (invisible) so the melt knows where the ice cream is */}
      <Scoop flavour={flavour} cone rich={false} className={`${size} opacity-0`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="" draggable={false} className="scoop-photo pointer-events-none absolute inset-0 h-full w-full select-none object-contain" />
    </span>
  );
}

function Picker({ label, value, other, onPick }: { label: string; value: FlavourSlug | null; other: FlavourSlug | null; onPick: (f: FlavourSlug) => void }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3 text-paper/60">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {flavours.map((f) => (
          <button
            key={f.slug}
            type="button"
            onClick={() => onPick(f.slug)}
            aria-pressed={value === f.slug}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
              value === f.slug ? "border-paper bg-paper text-ink" : "border-paper/25 hover:border-paper"
            } ${other === f.slug && value !== f.slug ? "opacity-60" : ""}`}
          >
            <span className="h-3 w-3 rounded-full" style={{ background: f.scoop[1] }} aria-hidden />
            {f.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * THE FLAVOUR LAB — pick two flavours and see what happens.
 * `resolver` is swappable: today curated, tomorrow AI.
 */
export default function FlavourLab({
  resolver = curatedResolver,
  pictures = {},
  mixes = {},
  splashes = {},
}: {
  resolver?: MixResolver;
  pictures?: Record<string, string>;
  mixes?: Record<string, string>;
  splashes?: Record<string, string>;
}) {
  const [a, setA] = useState<FlavourSlug | null>("strawberry");
  const [b, setB] = useState<FlavourSlug | null>("vanilla");
  const [mix, setMix] = useState<Mix | null>(null);
  const [busy, setBusy] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const { reducedMotion, play } = useExperience();

  const run = async () => {
    if (!a || !b || busy) return;
    setBusy(true);
    setMix(null);
    play("scoop");
    const result = await resolver(a, b);
    const A = flavourMap[a];
    const B = flavourMap[b];
    const q = stage.current ? gsap.utils.selector(stage.current) : null;
    if (!reducedMotion && q) {
      // the two scoops lean in and touch…
      await gsap
        .timeline()
        .to(q(".lab-a"), { x: "34%", rotate: 10, duration: 0.55, ease: "power3.in" })
        .to(q(".lab-b"), { x: "-34%", rotate: -10, duration: 0.55, ease: "power3.in" }, 0)
        .to(q(".lab-plus"), { opacity: 0, duration: 0.2 }, 0)
        .then();
    }
    play("drip");
    // …and melt into each other, marbled, revealing the result underneath
    await playMelt({
      flavour: a,
      from: q ? q(".lab-b-wrap")[0] : null,
      splash: splashes[a],
      onImpact: () => play("splat"),
      reducedMotion,
      tempo: 1.35,
      colours: { light: mixColour(A.scoop[0], B.scoop[0], 0.5), mid: A.scoop[1], deep: A.scoop[2], swirl: B.scoop[1] },
      onCovered: () =>
        new Promise<void>((resolve) => {
          setMix(result);
          setBusy(false);
          requestAnimationFrame(() => {
            stage.current?.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
            resolve();
          });
        }),
      onDone: () => {
        if (reducedMotion || !stage.current) return;
        const r = gsap.utils.selector(stage.current);
        gsap.from(r(".lab-result > *"), { y: 20, opacity: 0, stagger: 0.08, duration: 0.7 });
      },
    });
    setBusy(false);
  };

  const reset = () => {
    setMix(null);
  };

  const A = a ? flavourMap[a] : null;
  const B = b ? flavourMap[b] : null;
  const look = mix ? getProduct(mix.lookSlug) : null;

  return (
    <section
      className="on-dark relative min-h-dvh overflow-hidden bg-ink px-4 pb-20 pt-32 text-paper transition-[background] duration-1000 sm:px-8"
      style={
        A && B
          ? { background: `radial-gradient(circle at 25% 60%, ${A.scoop[1]}55, transparent 45%), radial-gradient(circle at 75% 60%, ${B.scoop[1]}55, transparent 45%), #1d1916` }
          : undefined
      }
    >
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-paper/60 rise">Experimental</p>
        <h1 className="rise mt-4 font-display text-headline" style={{ animationDelay: "80ms" }}>
          The Flavour <span className="italic">Lab</span>
        </h1>
        <p className="rise mt-4 max-w-md text-lg text-paper/70" style={{ animationDelay: "160ms" }}>
          Some combinations shouldn&apos;t work. We made them anyway.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Picker label="First scoop" value={a} other={b} onPick={(f) => (setA(f), reset())} />
          <Picker label="Second scoop" value={b} other={a} onPick={(f) => (setB(f), reset())} />
        </div>

        <div ref={stage} className="relative mt-12 grid min-h-[28rem] items-center gap-10 md:grid-cols-2">
          {!mix ? (
            <>
              <div className="flex items-end justify-center gap-2 md:col-span-2">
                {a && <LabScoop flavour={a} photo={pictures[a]} className="lab-a" />}
                <span className="lab-plus font-display text-6xl text-paper/40" aria-hidden>+</span>
                {b && (
                  <div className="lab-b-wrap">
                    <LabScoop flavour={b} photo={pictures[b]} className="lab-b" />
                  </div>
                )}
              </div>
              <div className="text-center md:col-span-2">
                <Button onClick={run} disabled={!a || !b || busy} className="!bg-paper !text-ink">
                  {busy ? "Mixing…" : "Mix the flavours"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div data-melt-focus className="flex items-end justify-center gap-4">
                {mixes[`${mix.a}-${mix.b}`] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mixes[`${mix.a}-${mix.b}`]} alt="" className="lab-mixed h-72 w-auto md:h-96" />
                ) : (
                  <MixedScoop a={mix.a} b={mix.b} className="lab-mixed h-72 w-auto md:h-96" />
                )}
                {look && (
                  <DressArt flavour={look.flavour} silhouette={look.silhouette} detail={look.detail} tone={look.tone} className="lab-mixed h-80 w-auto md:h-[28rem]" title={look.name} />
                )}
              </div>
              <div className="lab-result" aria-live="polite">
                <p className="eyebrow text-paper/60">
                  {flavourMap[mix.a].name} + {flavourMap[mix.b].name}
                </p>
                <h2 className="mt-3 font-display text-[clamp(2.8rem,6vw,5.5rem)] uppercase leading-[0.9]">{mix.name}</h2>
                <p className="mt-4 max-w-sm text-lg text-paper/75">{mix.note}</p>
                {look && (
                  <p className="mt-6 text-sm text-paper/70">
                    The look:{" "}
                    <Link href={`/dresses/${look.slug}`} className="underline underline-offset-4">
                      {look.name}
                    </Link>{" "}
                    · {formatKES(look.price)}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  {look && (
                    <ButtonLink href={`/dresses/${look.slug}`} className="!bg-paper !text-ink">
                      See the look
                    </ButtonLink>
                  )}
                  <Button variant="outline" onClick={reset}>
                    Mix again
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
