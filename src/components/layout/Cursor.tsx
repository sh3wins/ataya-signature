"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/components/providers/ExperienceProvider";

/**
 * Custom cursor: a dot and a soft ring that follows with a little lag.
 * Grows over interactive things and takes on the nearest flavour colour.
 * Only on mouse/trackpad devices, never with reduced motion.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const { reducedMotion, cherry } = useExperience();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || reducedMotion) return;
    document.documentElement.classList.add("has-cursor");

    let x = -100,
      y = -100,
      rx = x,
      ry = y,
      scale = 1,
      target = 1,
      raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = e.target as HTMLElement;
      const interactive = el.closest("a,button,[role=button],input,select,textarea,label,[data-cursor]");
      target = interactive ? 2.1 : 1;
      const fl = el.closest<HTMLElement>("[data-flavour-colour]");
      if (ring.current) ring.current.style.backgroundColor = interactive && fl ? fl.dataset.flavourColour! : "transparent";
      if (ring.current) ring.current.dataset.label = (el.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "");
    };
    const down = () => (target *= 0.8);
    const up = () => (target /= 0.8);
    const leave = () => {
      x = y = -100;
    };

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      scale += (target - scale) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <div
        ref={ring}
        className="absolute -left-5 -top-5 h-10 w-10 rounded-full border border-ink/60 mix-blend-multiply transition-[background-color] duration-300"
      />
      <div ref={dot} className="absolute -left-1 -top-1 h-2 w-2">
        {cherry ? (
          <svg viewBox="0 0 20 24" className="-ml-2 -mt-3 h-6 w-5">
            <path d="M10 10 C 10 5 12 2 16 1" stroke="#3F5B24" strokeWidth="1.6" fill="none" />
            <circle cx="9" cy="16" r="7" fill="#B3122B" />
            <circle cx="6.5" cy="13.5" r="2" fill="#fff" opacity=".6" />
          </svg>
        ) : (
          <div className="h-2 w-2 rounded-full bg-ink" />
        )}
      </div>
    </div>
  );
}
