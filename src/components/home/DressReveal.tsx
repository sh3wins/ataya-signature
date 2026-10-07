"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Hotspots from "@/components/product/Hotspots";
import DressArt from "@/components/art/DressArt";
import FlavourWorld from "@/components/art/FlavourWorld";
import { ButtonLink } from "@/components/ui/Button";
import { flavourMap, flavourVars, type FlavourSlug } from "@/lib/flavours";
import { getProduct } from "@/lib/products";
import { useExperience } from "@/components/providers/ExperienceProvider";

/**
 * After the melt: the dress is the star.
 * It sits under the melted ice cream from the start (so the melt reveals
 * it, it never fades in). Only once it is uncovered — `ready` — does the
 * name arrive, then the line, then the few controls.
 */
export default function DressReveal({
  flavour,
  ready,
  onChooseAgain,
}: {
  flavour: FlavourSlug;
  ready: boolean;
  onChooseAgain: () => void;
}) {
  const f = flavourMap[flavour];
  const p = getProduct(f.heroDress)!;
  const root = useRef<HTMLElement>(null);
  const { reducedMotion } = useExperience();
  const dark = Boolean(f.dark);
  const [first, ...rest] = p.name.split(" ");

  // Hold the words back until the dress has been revealed
  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.set(".rv-word", { yPercent: 110 });
      gsap.set(".rv-fade", { opacity: 0, y: 14 });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (!ready || reducedMotion) return;
      gsap
        .timeline({ delay: 0.35, defaults: { ease: "power4.out" } })
        .to(".rv-word", { yPercent: 0, duration: 1.4, stagger: 0.14 })
        .to(".rv-fade", { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 0.7);
    },
    { scope: root, dependencies: [ready] },
  );

  // Pointer parallax across depths (after the reveal)
  useEffect(() => {
    if (reducedMotion || !ready) return;
    const el = root.current;
    if (!el) return;
    const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", el);
    const setters = layers.map((l) => ({
      x: gsap.quickTo(l, "x", { duration: 1.4, ease: "power3.out" }),
      y: gsap.quickTo(l, "y", { duration: 1.4, ease: "power3.out" }),
      d: Number(l.dataset.depth),
    }));
    const move = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      setters.forEach((s) => {
        s.x(nx * s.d);
        s.y(ny * s.d);
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reducedMotion, ready]);

  return (
    <section
      ref={root}
      aria-label={`${p.name}, ${f.name}`}
      className={`relative min-h-dvh overflow-hidden ${dark ? "on-dark" : ""}`}
      style={{ ...flavourVars(f), color: f.ink }}
    >
      <div data-depth="10" className="absolute -inset-6">
        <FlavourWorld flavour={flavour} />
      </div>

      <div className="relative mx-auto grid min-h-dvh max-w-[90rem] items-end gap-4 px-5 pb-10 pt-24 sm:px-10 md:grid-cols-[0.9fr_1.1fr] md:items-center md:pb-16">
        {/* the dress — biggest thing on the page */}
        <div data-depth="18" className="relative order-1 flex justify-center md:order-2">
          <div data-melt-focus className="relative w-fit">
            <DressArt
              flavour={flavour}
              silhouette={p.silhouette}
              detail={p.detail}
              tone={p.tone}
              title={`${p.name} dress`}
              className="h-[46vh] w-auto md:h-[84vh]"
            />
            {ready && <Hotspots spots={p.hotspots} />}
          </div>
        </div>

        {/* quiet type */}
        <div data-depth="-8" className="relative z-10 order-2 md:order-1 md:pb-10">
          <p className="rv-fade eyebrow opacity-70">{f.moment}</p>
          <h1 className="mt-3 font-display text-[clamp(2.8rem,8.5vw,8rem)] leading-[0.86] tracking-[-0.035em]">
            <span className="block overflow-hidden pb-1">
              <span className="rv-word block">{first}</span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span className="rv-word block italic" style={{ color: dark ? f.accent : f.secondaryColour }}>
                {rest.join(" ")}
              </span>
            </span>
          </h1>
          <p className="rv-fade mt-5 max-w-xs text-lg">{p.short}</p>
          <div className="rv-fade mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href={`/dresses/${p.slug}`} variant={dark ? "flavour" : "solid"} className={dark ? "!bg-f-cream !text-ink" : ""}>
              Discover the dress
            </ButtonLink>
            <a href={`/flavours/${flavour}`} className="text-xs font-semibold uppercase tracking-[0.2em] underline-offset-4 hover:underline">
              More {f.name.toLowerCase()} dresses →
            </a>
          </div>
          <button onClick={onChooseAgain} className="rv-fade mt-8 text-xs font-semibold uppercase tracking-[0.2em] opacity-70 underline-offset-4 hover:underline hover:opacity-100">
            What happens if you choose another flavour? ↺
          </button>
        </div>
      </div>
    </section>
  );
}
