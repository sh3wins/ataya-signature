"use client";

import { useRef, useState, type PointerEvent as RPE } from "react";
import ProductMedia from "./ProductMedia";
import Hotspots from "./Hotspots";
import { flavourMap } from "@/lib/flavours";
import type { Product } from "@/lib/products";
import { useExperience } from "@/components/providers/ExperienceProvider";

type View = "turn" | "detail" | "movement";

/**
 * Explore the dress: drag to turn it (front ↔ back), zoom into details,
 * or watch it move. Everything also works with keyboard and touch.
 */
export default function ProductGallery({ product }: { product: Product }) {
  const f = flavourMap[product.flavour];
  const [view, setView] = useState<View>("turn");
  const [angle, setAngle] = useState(0);
  const [detail, setDetail] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; a: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const { reducedMotion } = useExperience();

  const cos = Math.cos((angle * Math.PI) / 180);
  const facing = cos >= 0 ? "front" : "back";
  const spot = product.hotspots[detail % product.hotspots.length];
  const zoom = spot ? `${Math.round(spot.x * 3 - 70)} ${Math.round(spot.y * 5.4 - 90)} 140 180` : undefined;

  const onDown = (e: RPE) => {
    if (view !== "turn") return;
    drag.current = { x: e.clientX, a: angle };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPE) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (!reducedMotion) setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
    if (drag.current) setAngle(drag.current.a + (e.clientX - drag.current.x) * 0.6);
  };
  const onUp = () => {
    drag.current = null;
    setDragging(false);
    // settle to the nearest side
    setAngle((a) => Math.round(a / 180) * 180);
  };

  const tabs: { id: View; label: string }[] = [
    { id: "turn", label: facing === "front" ? "Front" : "Back" },
    { id: "detail", label: "Detail" },
    { id: "movement", label: "Movement" },
  ];

  return (
    <div>
      <div
        className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden rounded-[var(--radius-soft)]"
        style={{ background: `linear-gradient(170deg, ${f.cream} 0%, ${f.colour} 70%)` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        data-cursor={view === "turn" ? "drag" : undefined}
      >
        <div
          aria-hidden
          className="absolute left-1/2 top-[10%] h-[85%] w-[62%] rounded-t-full transition-transform duration-700 ease-out"
          style={{ background: f.colour, opacity: 0.55, transform: `translate(calc(-50% + ${tilt.x * -14}px), ${tilt.y * -10}px)` }}
        />

        {view === "turn" && (
          <div
            className="absolute inset-0 grid place-items-center transition-transform duration-500 ease-out"
            style={{ transform: `translate(${tilt.x * 16}px, ${tilt.y * 12}px)` }}
          >
            <div
              className="relative h-[92%] w-fit transition-transform ease-[var(--ease-silk)]"
              style={{ transform: `scaleX(${Math.max(0.04, Math.abs(cos))})`, transitionDuration: dragging ? "0ms" : "600ms" }}
            >
              <ProductMedia product={product} view={facing} className="h-full w-auto" priority />
              {facing === "front" && Math.abs(cos) > 0.95 && <Hotspots spots={product.hotspots} />}
            </div>
          </div>
        )}

        {view === "detail" && spot && (
          <div className="absolute inset-0">
            <ProductMedia product={product} view="detail" viewBox={zoom} sway={false} className="h-full w-full" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-2xl bg-paper/90 p-4 backdrop-blur">
              <div>
                <p className="eyebrow">{spot.label}</p>
                <p className="mt-1 text-sm text-muted">{spot.text}</p>
              </div>
              {product.hotspots.length > 1 && (
                <button onClick={() => setDetail((d) => d + 1)} className="shrink-0 rounded-full border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
                  Next detail
                </button>
              )}
            </div>
          </div>
        )}

        {view === "movement" && (
          <div className="absolute inset-0 grid place-items-center">
            <div className={reducedMotion ? "" : "animate-[twirl_7s_var(--ease-melt)_infinite]"}>
              <ProductMedia product={product} className="h-[88%] max-h-[40rem] w-auto" />
            </div>
          </div>
        )}

        {view === "turn" && (
          <p className="pointer-events-none absolute left-4 top-4 rounded-full bg-paper/80 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] backdrop-blur">
            Drag to turn
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Views">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={view === t.id}
            onClick={() => (t.id === "turn" && view === "turn" ? setAngle((a) => a + 180) : setView(t.id))}
            className={`rounded-full border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors ${
              view === t.id ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
        {view === "turn" && (
          <button onClick={() => setAngle((a) => a + 180)} className="px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] underline-offset-4 hover:underline">
            Turn around ↻
          </button>
        )}
      </div>
    </div>
  );
}
