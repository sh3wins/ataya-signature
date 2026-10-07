"use client";

import { useState } from "react";
import type { Hotspot } from "@/lib/products";

/** Little "+" markers on a dress that open detail notes on hover or tap. */
export default function Hotspots({ spots }: { spots: Hotspot[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      {spots.map((h, i) => (
        <div key={i} className="absolute" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(i)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(null)}
            aria-expanded={open === i}
            aria-label={`Detail: ${h.label}`}
            className="relative -ml-4 -mt-4 grid h-8 w-8 place-items-center rounded-full bg-paper/85 text-ink shadow-[var(--shadow-soft)] backdrop-blur transition-transform duration-300 hover:scale-110"
          >
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-paper/50 [animation-duration:2.4s]" />
            <span aria-hidden className="relative text-lg leading-none">
              {open === i ? "–" : "+"}
            </span>
          </button>
          {open === i && (
            <div
              role="note"
              className={`rise absolute top-2 z-10 w-52 rounded-2xl bg-paper p-4 text-ink shadow-[var(--shadow-float)] ${h.x > 50 ? "right-6" : "left-6"}`}
            >
              <p className="eyebrow">{h.label}</p>
              <p className="mt-1.5 text-sm leading-snug text-muted">{h.text}</p>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
