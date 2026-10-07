"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useScoop } from "@/components/providers/ScoopProvider";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { flavourMap } from "@/lib/flavours";
import { SIZES, formatKES, isSoldOut, type Product, type Size } from "@/lib/products";

/** Clear, practical purchasing. The playful part is the label, never the logic. */
export default function PurchasePanel({ product }: { product: Product }) {
  const f = flavourMap[product.flavour];
  const { add, setOpen } = useScoop();
  const { play } = useExperience();
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const soldOut = isSoldOut(product);
  const stock = size ? product.stock[size] : 0;

  const availability = soldOut
    ? "Sold out in every size"
    : size
      ? stock <= 2
        ? `Only ${stock} left in ${size}`
        : `In stock in ${size}`
      : "In stock — choose a size";

  const submit = () => {
    if (!size) {
      setMsg({ ok: false, text: "Please choose a size first." });
      return;
    }
    const r = add(product.slug, size, qty);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) {
      play("scoop");
      setTimeout(() => setOpen(true), 350);
    }
  };

  return (
    <div>
      <p className="eyebrow text-muted">
        {f.name} · {product.collection}
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,4.5rem)] leading-[0.95]">{product.name}</h1>
      <p className="mt-3 font-display text-xl italic" style={{ color: f.dark ? f.accent : f.secondaryColour }}>
        {product.short}
      </p>
      <p className="mt-6 text-2xl">{formatKES(product.price)}</p>
      <p className={`mt-1 text-sm ${soldOut ? "font-semibold text-cherry" : "text-muted"}`} aria-live="polite">
        {availability}
      </p>

      <fieldset className="mt-8" disabled={soldOut}>
        <legend className="eyebrow mb-3 flex w-full justify-between">
          <span>Size</span>
          <span className="font-normal normal-case tracking-normal text-muted">XS = UK 6 · XL = UK 14</span>
        </legend>
        <div className="grid grid-cols-5 gap-2">
          {SIZES.map((s) => {
            const out = product.stock[s] === 0;
            return (
              <button
                key={s}
                type="button"
                disabled={out}
                aria-pressed={size === s}
                aria-label={out ? `${s}, sold out` : `Size ${s}`}
                onClick={() => {
                  setSize(s);
                  setQty(1);
                  setMsg(null);
                }}
                className={`relative h-12 rounded-full border text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  size === s ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                } disabled:cursor-not-allowed disabled:border-dashed disabled:text-muted/60`}
              >
                {s}
                {out && <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] font-normal">sold out</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-10 flex gap-3">
        <div className="flex items-center rounded-full border border-line" role="group" aria-label="Quantity">
          <button type="button" className="h-12 w-11 text-lg disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)} aria-label="Decrease quantity">
            −
          </button>
          <span className="w-6 text-center" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            className="h-12 w-11 text-lg disabled:opacity-30"
            disabled={!size || qty >= stock}
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button onClick={submit} disabled={soldOut} className="flex-1">
          {soldOut ? "Sold out" : "Add to scoop"}
        </Button>
      </div>
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`mt-3 text-sm ${msg.ok ? "text-muted" : "text-cherry"}`}>
          {msg.text}
        </p>
      )}
      <p className="mt-3 text-xs text-muted">&ldquo;Scoop&rdquo; is your shopping bag. Free delivery in Nairobi over KES 15,000.</p>

      <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
        {[
          ["Product", product.name],
          ["Flavour", f.name],
          ["Collection", product.collection],
          ["Fabric", product.fabric],
          ["Fit", product.fit],
          ["Sizes", SIZES.filter((s) => product.stock[s] > 0).join(", ") || "None available"],
          ["Price", formatKES(product.price)],
          ["Availability", soldOut ? "Sold out" : "Available"],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3">
            <dt className="eyebrow pt-0.5 text-muted">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <details className="group border-b border-line py-4 text-sm">
        <summary className="flex cursor-pointer list-none justify-between font-semibold">
          Delivery & returns <span className="transition-transform group-open:rotate-45">+</span>
        </summary>
        <p className="mt-3 text-muted">Delivery across Kenya in 1–4 working days. Free returns within 14 days, unworn with tags.</p>
      </details>
      <details className="group border-b border-line py-4 text-sm">
        <summary className="flex cursor-pointer list-none justify-between font-semibold">
          Care <span className="transition-transform group-open:rotate-45">+</span>
        </summary>
        <p className="mt-3 text-muted">Keep it cool. Dry clean or gentle hand wash. Store away from direct sun, like any good dessert.</p>
      </details>
    </div>
  );
}
