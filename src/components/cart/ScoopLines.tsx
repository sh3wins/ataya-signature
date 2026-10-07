"use client";

import Link from "next/link";
import { useScoop } from "@/components/providers/ScoopProvider";
import DressArt from "@/components/art/DressArt";
import { flavourMap } from "@/lib/flavours";
import { formatKES } from "@/lib/products";

/** Line items for the drawer and the full cart page. */
export default function ScoopLines({ onNavigate }: { onNavigate?: () => void }) {
  const { items, setQty, remove } = useScoop();
  return (
    <ul className="divide-y divide-line">
      {items.map((i) => {
        const f = flavourMap[i.product.flavour];
        const max = i.product.stock[i.size];
        return (
          <li key={`${i.slug}-${i.size}`} className="flex gap-4 py-5">
            <Link
              href={`/dresses/${i.slug}`}
              onClick={onNavigate}
              className="grid h-28 w-22 shrink-0 place-items-center rounded-xl"
              style={{ background: f.colour }}
              aria-label={i.product.name}
            >
              <DressArt flavour={i.product.flavour} silhouette={i.product.silhouette} detail={i.product.detail} tone={i.product.tone} sway={false} shadow={false} className="h-24" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/dresses/${i.slug}`} onClick={onNavigate} className="font-display text-xl leading-tight hover:underline">
                    {i.product.name}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                    {f.name} · Size {i.size}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatKES(i.lineTotal)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center rounded-full border border-line" role="group" aria-label={`Quantity for ${i.product.name}`}>
                  <button className="h-8 w-8 text-lg" onClick={() => setQty(i.slug, i.size, i.qty - 1)} aria-label="Decrease quantity">
                    −
                  </button>
                  <span className="w-6 text-center text-sm" aria-live="polite">
                    {i.qty}
                  </span>
                  <button
                    className="h-8 w-8 text-lg disabled:opacity-30"
                    onClick={() => setQty(i.slug, i.size, i.qty + 1)}
                    disabled={i.qty >= max}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button onClick={() => remove(i.slug, i.size)} className="text-xs uppercase tracking-[0.16em] text-muted underline-offset-4 hover:underline">
                  Remove
                </button>
              </div>
              {i.qty >= max && <p className="mt-2 text-xs text-muted">That&apos;s the last of size {i.size}.</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
