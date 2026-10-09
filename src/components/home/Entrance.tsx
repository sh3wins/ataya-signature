"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Scoop from "@/components/art/Scoop";
import { flavours, flavourMap, flavourVars, type FlavourSlug } from "@/lib/flavours";
import { playMelt, preloadBurst, preloadFilm, preloadSplash, preloadSplashVideo } from "@/components/melt/playMelt";
import { useExperience } from "@/components/providers/ExperienceProvider";
import DressReveal from "./DressReveal";

gsap.registerPlugin(useGSAP);

type Stage = "choose" | "melting" | "revealed";

/**
 * THE OPENING EXPERIENCE
 * ATAYA → a scoop drops in → CHOOSE YOUR FLAVOUR → melt → dress.
 */
export default function Entrance({
  pictures = {},
  splashes = {},
  bursts = {},
  films = {},
}: {
  pictures?: Record<string, string>;
  splashes?: Record<string, string>;
  bursts?: Record<string, string>;
  films?: Record<string, string>;
}) {
  const root = useRef<HTMLElement>(null);
  const scoopWrap = useRef<HTMLDivElement>(null);
  const scoopInner = useRef<HTMLButtonElement>(null);
  const [stage, setStage] = useState<Stage>("choose");
  const [shown, setShown] = useState<FlavourSlug>("strawberry");
  const [chosen, setChosen] = useState<FlavourSlug | null>(null);
  const { play, reducedMotion, toast } = useExperience();
  const warmTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [warm, setWarm] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // ——— Intro: wordmark rises, the scoop drops in with weight
  useGSAP(
    () => {
      if (stage !== "choose") return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const shadow = ".ent-shadow";
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".ent-letter", { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.07 })
          // it falls (the shadow gathers underneath as it gets closer)…
          .from(scoopWrap.current, { y: () => -window.innerHeight * 0.75, duration: 0.62, ease: "power2.in" }, 0.35)
          .fromTo(shadow, { scaleX: 0.25, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.62, ease: "power2.in" }, 0.35)
          // …lands, compresses, and the shadow spreads with the impact…
          .to(scoopWrap.current, { scaleY: 0.86, scaleX: 1.1, duration: 0.09, ease: "power2.out", transformOrigin: "50% 100%" })
          .to(shadow, { scaleX: 1.25, duration: 0.09, ease: "power2.out" }, "<")
          // …a small rebound, a wobble, then it settles and stays still.
          .to(scoopWrap.current, { scaleY: 1.03, scaleX: 0.98, y: -6, duration: 0.18, ease: "power2.out" })
          .to(shadow, { scaleX: 0.95, duration: 0.18 }, "<")
          .to(scoopWrap.current, { scaleY: 1, scaleX: 1, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" })
          .to(shadow, { scaleX: 1, duration: 0.6 }, "<")
          .from(".ent-ui", { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.9");
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [stage === "choose"] },
  );

  // ——— Swapping flavours squashes the scoop a little, like a fresh scoop
  const preview = useCallback(
    (f: FlavourSlug) => {
      if (stage !== "choose" || f === shown) return;
      setShown(f);
      play("tap");
      if (!reducedMotion && scoopInner.current)
        gsap.fromTo(scoopInner.current, { scaleX: 1.08, scaleY: 0.9 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.4)", transformOrigin: "50% 90%" });
    },
    [stage, shown, play, reducedMotion],
  );

  // ——— THE MELT
  const choose = useCallback(
    async (f: FlavourSlug) => {
      if (stage !== "choose") return;
      setShown(f);
      setChosen(f);
      setStage("melting");
      play("scoop");
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

      if (!reducedMotion) {
        // The room hushes; the scoop stays exactly where it is.
        gsap.to(".ent-ui, .ent-letter", { opacity: 0, y: 16, duration: 0.5, stagger: 0.02, ease: "power2.out" });
        gsap.to(".ent-shadow", { opacity: 0, duration: 1.2, delay: 0.6 });
        await gsap.delayedCall(0.35, () => {});
        play("melt");
      }

      await playMelt({
        flavour: f,
        from: scoopInner.current,
        splash: splashes[f],
        burst: bursts[f],
        film: films[f],
        onImpact: () => play("splat"),
        reducedMotion,
        onCovered: () => {
          setStage("revealed");
        },
        onDone: () => setRevealed(true),
      });
    },
    [stage, play, reducedMotion, splashes, bursts, films],
  );

  const reset = useCallback(() => {
    setChosen(null);
    setRevealed(false);
    setStage("choose");
    gsap.set(scoopWrap.current, { clearProps: "all" });
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => () => clearTimeout(warmTimer.current), []);

  // have the splash ready before the scoop is tapped
  useEffect(() => {
    const base = splashes[shown];
    if (base) preloadSplash(base);
    if (films[shown]) preloadFilm(films[shown]);
    else if (bursts[shown]) {
      preloadBurst(bursts[shown]);
      preloadSplashVideo(bursts[shown].replace("/burst/", "/splashvid/"));
    }
  }, [shown, splashes, bursts, films]);

  if (stage === "revealed" && chosen) return <DressReveal flavour={chosen} ready={revealed} onChooseAgain={reset} />;

  const f = flavourMap[shown];
  // with a film, the cone on the page is the film's own first frame, so the
  // hand-over into the film is seamless (no swap to a different cone)
  const photo = films[shown] ? `${films[shown]}/poster.webp` : pictures[shown];
  const bg = `color-mix(in srgb, var(--color-cream), ${f.colour} ${stage === "melting" ? 75 : 40}%)`;

  return (
    <section
      ref={root}
      aria-label="Choose your flavour"
      className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden px-4 pb-8 pt-24 transition-colors duration-1000 sm:pt-20"
      style={{ ...flavourVars(f), backgroundColor: bg }}
    >
      {/* soft light pool behind the scoop */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl transition-colors duration-1000"
        style={{ background: `radial-gradient(circle, ${f.cream} 0%, transparent 70%)` }}
      />

      <h1 className="relative overflow-hidden pt-2 text-center font-display text-[clamp(3.6rem,15vw,11rem)] leading-[0.9] tracking-[0.14em]">
        <span className="sr-only">Ataya Signature</span>
        <span aria-hidden className="inline-flex">
          {"ATAYA".split("").map((l, i) => (
            <span key={i} className="ent-letter inline-block">
              {l}
            </span>
          ))}
        </span>
        <span aria-hidden className="ent-letter mt-[0.9em] block pl-[0.6em] font-sans text-[clamp(0.7rem,1.6vw,1.15rem)] font-semibold uppercase leading-none tracking-[0.6em]">
          Signature
        </span>
      </h1>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <div ref={scoopWrap} className="relative will-change-transform">
          <button
            ref={scoopInner}
            onClick={() => choose(shown)}
            onPointerEnter={(e) => {
              if (e.pointerType !== "mouse") return;
              warmTimer.current = setTimeout(() => {
                setWarm(true);
                toast("Careful. It's getting warm in here.");
                play("drip");
              }, 4500);
            }}
            onPointerLeave={() => {
              clearTimeout(warmTimer.current);
              setWarm(false);
            }}
            aria-label={`Melt the ${f.name} scoop`}
            data-cursor="melt"
            data-flavour-colour={f.colour}
            className="relative block rounded-full"
          >
            <Scoop
              key={shown}
              flavour={shown}
              dripping={warm}
              cone
              className={`h-[min(62vw,19rem)] w-auto sm:h-[min(42vh,24rem)] ${photo ? "opacity-0" : "drop-shadow-[0_24px_30px_rgba(0,0,0,0.10)]"}`}
            />
            {photo && (
              // the photo sits exactly over the drawn scoop, which stays in
              // place (invisible) so the melt knows where the ice cream is
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo}
                src={photo}
                alt=""
                draggable={false}
                className="scoop-photo pointer-events-none absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.16)]"
              />
            )}
          </button>
        </div>
        <div aria-hidden className="ent-shadow -mt-1 h-3 w-20 rounded-[50%] bg-black/20 blur-[6px]" />
      </div>

      <div className="relative w-full max-w-4xl text-center">
        <p className="ent-ui eyebrow" style={{ color: f.dark ? undefined : f.secondaryColour }}>
          The Ice Cream Collection · Choose your flavour
        </p>
        <ul className="ent-ui mt-5 flex flex-wrap justify-center gap-x-2 gap-y-3 sm:gap-x-4" aria-label="Flavours">
          {flavours.map((fl) => (
            <li key={fl.slug}>
              <button
                onClick={() => choose(fl.slug)}
                onPointerEnter={(e) => e.pointerType === "mouse" && preview(fl.slug)}
                onFocus={() => preview(fl.slug)}
                aria-pressed={shown === fl.slug}
                data-flavour-colour={fl.colour}
                className={`group flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
                  shown === fl.slug ? "border-ink bg-paper/70" : "border-transparent hover:border-ink/30"
                }`}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: fl.colour }}>
                  <span className="h-4 w-4 rounded-full shadow-inner transition-transform duration-500 ease-[var(--ease-scoop)] group-hover:scale-125" style={{ background: `radial-gradient(circle at 35% 30%, ${fl.scoop[0]}, ${fl.scoop[2]})` }} />
                </span>
                {fl.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="ent-ui mt-6 text-xs text-muted">
          <span className="hidden sm:inline">Tap a flavour, or the scoop, to melt it.</span>
          <span className="sm:hidden">Tap a flavour to melt it.</span>{" "}
          <a href="#flavours" className="underline underline-offset-4">
            Or scroll to explore
          </a>
        </p>
      </div>
    </section>
  );
}
