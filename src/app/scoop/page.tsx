"use client";

import { useScoop } from "@/components/providers/ScoopProvider";
import ScoopLines from "@/components/cart/ScoopLines";
import ScoopStack from "@/components/cart/ScoopStack";
import { ButtonLink } from "@/components/ui/Button";
import { formatKES } from "@/lib/products";

export default function ScoopPage() {
  const { items, subtotal, count } = useScoop();
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
      <h1 className="font-display text-headline">
        Your <span className="italic">Scoop</span>
      </h1>
      <p className="mt-3 text-muted">Your shopping bag. {count ? `${count} ${count === 1 ? "item" : "items"}.` : ""}</p>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <ScoopStack flavours={[]} />
          <p className="mt-8 font-display text-3xl">Nothing in your scoop yet.</p>
          <ButtonLink href="/dresses" className="mt-6">
            Browse dresses
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ScoopLines />
          <aside className="h-fit rounded-[var(--radius-soft)] bg-paper p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
            <ScoopStack flavours={items.flatMap((i) => Array(i.qty).fill(i.product.flavour))} />
            <h2 className="eyebrow mt-6">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatKES(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Delivery</dt>
                <dd>{subtotal >= 15000 ? "Free in Nairobi" : "Calculated at checkout"}</dd>
              </div>
            </dl>
            <ButtonLink href="/checkout" className="mt-6 w-full">
              Melt into checkout →
            </ButtonLink>
            <p className="mt-2 text-center text-xs text-muted">Proceed to secure checkout</p>
          </aside>
        </div>
      )}
    </div>
  );
}
