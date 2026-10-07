"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { products, formatKES } from "@/lib/products";
import { flavours, flavourMap } from "@/lib/flavours";
import Scoop from "@/components/art/Scoop";

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return products.filter((p) =>
      [p.name, p.flavour, p.silhouette, p.fabric, p.detail].join(" ").toLowerCase().includes(t),
    );
  }, [q]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 z-[70] overflow-y-auto bg-cream/97 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-6 sm:px-8">
        <div className="flex justify-end">
          <button onClick={onClose} className="px-2 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em]">
            Close
          </button>
        </div>
        <label htmlFor="search" className="eyebrow mt-10 block text-muted">
          What are you craving?
        </label>
        <input
          ref={input}
          id="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Strawberry, maxi, silk…"
          className="mt-3 w-full border-b border-ink bg-transparent pb-3 font-display text-4xl outline-none placeholder:text-ink/25 sm:text-6xl"
          autoComplete="off"
        />

        {!q && (
          <div className="mt-10 flex flex-wrap gap-3">
            {flavours.map((f) => (
              <button
                key={f.slug}
                onClick={() => setQ(f.name)}
                className="flex items-center gap-2 rounded-full border border-line py-1.5 pl-1.5 pr-4 text-sm hover:border-ink"
              >
                <Scoop flavour={f.slug} rich={false} shadow={false} className="h-7 w-7" />
                {f.name}
              </button>
            ))}
          </div>
        )}

        {q && (
          <p className="mt-8 text-sm text-muted" aria-live="polite">
            {results.length ? `${results.length} ${results.length === 1 ? "dress" : "dresses"}` : "Nothing in the freezer by that name. Try a flavour."}
          </p>
        )}
        <ul className="mt-4 divide-y divide-line">
          {results.map((p) => (
            <li key={p.slug}>
              <Link href={`/dresses/${p.slug}`} onClick={onClose} className="flex items-center justify-between gap-4 py-4 hover:opacity-70">
                <span className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: flavourMap[p.flavour].scoop[1] }} />
                  <span className="font-display text-2xl">{p.name}</span>
                </span>
                <span className="text-sm text-muted">{formatKES(p.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
