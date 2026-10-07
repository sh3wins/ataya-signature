"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import DressArt from "@/components/art/DressArt";
import Scoop from "@/components/art/Scoop";
import FlavourWorld from "@/components/art/FlavourWorld";
import { ButtonLink } from "@/components/ui/Button";
import { flavourMap, type FlavourSlug } from "@/lib/flavours";
import { getProduct } from "@/lib/products";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * THE LOOKBOOK — "A day at Ataya".
 * An editorial film the user scrubs with the scroll wheel.
 * Each new hour drips down over the last like melting ice cream.
 */

interface Scene {
  time: string;
  title: string;
  line: string;
  flavour: FlavourSlug;
  dress: string;
}

const scenes: Scene[] = [
  { time: "08:00", title: "Vanilla, first thing", line: "Quiet silk before anyone else is up.", flavour: "vanilla", dress: "vanilla-bean-slip" },
  { time: "12:30", title: "Pistachio lunch", line: "A long table, a longer hemline.", flavour: "pistachio", dress: "pistachio-crema-midi" },
  { time: "16:00", title: "Strawberry hour", line: "Sweet. Dramatic. A little unnecessary.", flavour: "strawberry", dress: "strawberry-swirl" },
  { time: "19:45", title: "Blueberry dusk", line: "The light turns lilac. So do you.", flavour: "blueberry", dress: "blueberry-cheesecake-tier" },
];

const DRIP_EDGE =
  "M0 0V30 C38 30 50 128 90 128 C130 128 120 26 169 26 C196 26 208 66 226 66 C244 66 234 36 278 36 C300 36 312 94 342 94 C372 94 362 28 433 28 C482 28 494 60 516 60 C538 60 528 34 574 34 C598 34 610 138 664 138 C718 138 708 24 754 24 C778 24 790 72 806 72 C822 72 812 32 866 32 C898 32 910 106 944 106 C978 106 968 38 1017 38 C1044 38 1056 54 1076 54 C1096 54 1086 26 1127 26 C1146 26 1158 132 1204 132 C1250 132 1240 34 1298 34 C1334 34 1346 86 1372 86 C1398 86 1388 28 1440 28 V0Z";

function SceneView({ s, index }: { s: Scene; index: number }) {
  const f = flavourMap[s.flavour];
  const p = getProduct(s.dress)!;
  return (
    <div className="lb-scene absolute inset-0" style={{ zIndex: index + 1 }}>
      <div className="lb-inner absolute inset-0 overflow-hidden" style={{ background: f.colour, color: f.ink }}>
        <div className="lb-world absolute -inset-10">
          <FlavourWorld flavour={s.flavour} className="[&>div:nth-child(2)]:!left-1/2" />
        </div>
        <p aria-hidden className="lb-time absolute left-1/2 top-[16%] -translate-x-1/2 font-display text-[clamp(6rem,26vw,24rem)] leading-none opacity-15">
          {s.time}
        </p>
        <div className="lb-dress absolute inset-x-0 bottom-[4%] top-[18%] flex justify-center">
          <DressArt flavour={s.flavour} silhouette={p.silhouette} detail={p.detail} tone={p.tone} title={p.name} className="h-full w-auto" />
        </div>
        <div className="lb-scoop absolute right-[8%] top-[22%] hidden md:block">
          <Scoop flavour={s.flavour} cone rich={false} className="h-44 w-auto rotate-12" />
        </div>
        <div className="lb-text absolute bottom-8 left-5 max-w-sm sm:bottom-14 sm:left-10">
          <p className="eyebrow opacity-70">{s.time} · {f.name}</p>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95]">{s.title}</h2>
          <p className="mt-3 opacity-80">{s.line}</p>
        </div>
        <a href={`/dresses/${p.slug}`} className="lb-text absolute bottom-8 right-5 text-xs font-semibold uppercase tracking-[0.2em] underline underline-offset-4 sm:bottom-14 sm:right-10">
          {p.name} →
        </a>
      </div>
      {/* the melting lower edge of this scene */}
      {(
        <svg aria-hidden viewBox="0 0 1440 140" preserveAspectRatio="none" className="absolute left-0 top-full h-[14vh] w-full" style={{ color: f.colour }}>
          <path fill="currentColor" d={DRIP_EDGE} />
        </svg>
      )}
    </div>
  );
}

export default function Lookbook() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sceneEls = gsap.utils.toArray<HTMLElement>(".lb-scene");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ".lb-stage", start: "top top", end: `+=${(scenes.length + 2) * 110}%`, pin: true, scrub: 0.8 },
        });

        // Opening title
        // the title is there on arrival; scrolling sends it away
        gsap.from(".lb-intro-word", { yPercent: 110, stagger: 0.12, duration: 1.2, ease: "power4.out", delay: 0.2 });
        tl.to(".lb-intro", { yPercent: -30, opacity: 0, duration: 0.6 }, 0.3);

        sceneEls.forEach((el, i) => {
          const dress = el.querySelector(".lb-dress");
          const text = el.querySelectorAll(".lb-text");
          const time = el.querySelector(".lb-time");
          const scoop = el.querySelector(".lb-scoop");
          const at = `scene${i}`;
          tl.addLabel(at);
          // the new hour melts down over the last one
          tl.fromTo(el, { yPercent: -115 }, { yPercent: 0, duration: 1, ease: "power1.inOut" }, at)
            .fromTo(dress, { scale: 0.86, y: 60 }, { scale: 1, y: 0, duration: 1.3, ease: "power2.out" }, at)
            .fromTo(time, { yPercent: 30 }, { yPercent: -20, duration: 2 }, at)
            .fromTo(el.querySelector(".lb-world"), { y: 30 }, { y: -30, duration: 2 }, at)
            .fromTo(scoop, { y: -200, rotate: -30 }, { y: 80, rotate: 20, duration: 2 }, at)
            .fromTo(text, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, `${at}+=0.6`);
          if (sceneEls[i - 1]) tl.to(sceneEls[i - 1].querySelector(".lb-dress"), { scale: 1.12, y: 80, duration: 1 }, at);
          tl.to({}, { duration: 0.6 });
        });

        // TOO SWEET? → NEVER.
        tl.fromTo(".lb-q", { yPercent: -115 }, { yPercent: 0, duration: 1, ease: "power1.inOut" })
          .from(".lb-q-word", { yPercent: 110, stagger: 0.12, duration: 0.5 }, "-=0.3")
          .to({}, { duration: 0.6 })
          .to(".lb-q-word", { yPercent: -110, stagger: 0.08, duration: 0.4 })
          .from(".lb-never", { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)" })
          .from(".lb-end", { opacity: 0, y: 20, duration: 0.4 })
          .to({}, { duration: 0.6 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div className="lb-stage relative h-dvh overflow-hidden bg-cream motion-reduce:h-auto motion-reduce:overflow-visible">
        {/* intro */}
        <div className="lb-intro absolute inset-0 z-0 grid place-content-center px-5 text-center motion-reduce:static motion-reduce:py-40">
          <p className="eyebrow text-muted">The Ataya World</p>
          <h1 className="mt-4 font-display text-display">
            {["A day", "at Ataya"].map((w, i) => (
              <span key={w} className="block overflow-hidden">
                <span className={`lb-intro-word block ${i ? "italic" : ""}`}>{w}</span>
              </span>
            ))}
          </h1>
          <p className="mt-6 text-sm text-muted">Scroll to press play.</p>
        </div>

        {scenes.map((s, i) => (
          <div key={s.time} className="contents motion-reduce:relative motion-reduce:block motion-reduce:h-dvh">
            <SceneView s={s} index={i} />
          </div>
        ))}

        {/* finale */}
        <div className="lb-q absolute inset-0 z-20 grid place-content-center bg-cream px-5 text-center motion-reduce:static motion-reduce:py-40">
          <p className="font-display text-display">
            <span className="block overflow-hidden">
              <span className="lb-q-word block">Too</span>
            </span>
            <span className="block overflow-hidden">
              <span className="lb-q-word block italic">sweet?</span>
            </span>
          </p>
          <p className="lb-never absolute inset-0 grid place-content-center font-display text-display italic text-cherry motion-reduce:static">Never.</p>
          <div className="lb-end absolute inset-x-0 bottom-12 flex justify-center gap-3 motion-reduce:static motion-reduce:mt-10">
            <ButtonLink href="/dresses">Shop the day</ButtonLink>
            <ButtonLink href="/flavours" variant="outline">
              The flavours
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
