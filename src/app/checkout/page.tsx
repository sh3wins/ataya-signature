"use client";

import { useState, type FormEvent } from "react";
import { useScoop } from "@/components/providers/ScoopProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import ScoopStack from "@/components/cart/ScoopStack";
import { flavourMap } from "@/lib/flavours";
import { formatKES } from "@/lib/products";

const DELIVERY = {
  nairobi: { label: "Nairobi (1–2 days)", fee: 350 },
  kenya: { label: "Rest of Kenya (2–4 days)", fee: 650 },
  pickup: { label: "Pick up from the studio", fee: 0 },
} as const;
type DeliveryKey = keyof typeof DELIVERY;

const field = "mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-ink aria-[invalid=true]:border-cherry";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useScoop();
  const [delivery, setDelivery] = useState<DeliveryKey>("nairobi");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState<string | null>(null);

  const fee = delivery === "nairobi" && subtotal >= 15000 ? 0 : DELIVERY[delivery].fee;
  const total = subtotal + fee;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};
    if (!String(data.get("name")).trim()) errs.name = "Please enter your name.";
    if (!/^(\+?254|0)?[17]\d{8}$/.test(String(data.get("phone")).replace(/\s/g, ""))) errs.phone = "Please enter a Kenyan phone number, e.g. 0712 345 678.";
    if (!/^\S+@\S+\.\S+$/.test(String(data.get("email")))) errs.email = "Please enter a valid email.";
    if (delivery !== "pickup" && !String(data.get("address")).trim()) errs.address = "Please enter a delivery address.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setPlaced(`AT-${Math.floor(100000 + Math.random() * 900000)}`);
    clear();
  };

  if (placed)
    return (
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-36 text-center">
        <p className="eyebrow text-muted">Order {placed}</p>
        <h1 className="mt-4 font-display text-headline">
          Served. <span className="italic">Thank you.</span>
        </h1>
        <p className="mt-6 text-muted">We&apos;ve received your order and will send a confirmation shortly.</p>
        <ButtonLink href="/" className="mt-10">
          Back to Ataya
        </ButtonLink>
      </div>
    );

  if (!items.length)
    return (
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-36 text-center">
        <h1 className="font-display text-5xl">Your scoop is empty.</h1>
        <ButtonLink href="/dresses" className="mt-8">
          Browse dresses
        </ButtonLink>
      </div>
    );

  const err = (id: string) =>
    errors[id] ? (
      <p id={`${id}-err`} className="mt-1 text-sm text-cherry">
        {errors[id]}
      </p>
    ) : null;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
      <h1 className="font-display text-headline">Checkout</h1>
      <p role="note" className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-muted">
        Payments aren&apos;t connected yet. Placing an order here won&apos;t charge you.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} noValidate className="space-y-10">
          <fieldset className="space-y-4">
            <legend className="eyebrow mb-2">1. Your details</legend>
            <label className="block text-sm">
              Full name
              <input id="name" name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby="name-err" />
              {err("name")}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Phone (M-Pesa)
                <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="0712 345 678" className={field} aria-invalid={!!errors.phone} aria-describedby="phone-err" />
                {err("phone")}
              </label>
              <label className="block text-sm">
                Email
                <input id="email" name="email" type="email" autoComplete="email" className={field} aria-invalid={!!errors.email} aria-describedby="email-err" />
                {err("email")}
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="eyebrow mb-2">2. Delivery</legend>
            {(Object.keys(DELIVERY) as DeliveryKey[]).map((k) => (
              <label key={k} className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm ${delivery === k ? "border-ink" : "border-line"}`}>
                <span className="flex items-center gap-3">
                  <input type="radio" name="delivery" value={k} checked={delivery === k} onChange={() => setDelivery(k)} className="accent-ink" />
                  {DELIVERY[k].label}
                </span>
                <span>{k === "nairobi" && subtotal >= 15000 ? "Free" : DELIVERY[k].fee ? formatKES(DELIVERY[k].fee) : "Free"}</span>
              </label>
            ))}
            {delivery !== "pickup" && (
              <label className="block pt-2 text-sm">
                Delivery address
                <textarea id="address" name="address" rows={3} autoComplete="street-address" className={field} aria-invalid={!!errors.address} aria-describedby="address-err" />
                {err("address")}
              </label>
            )}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="eyebrow mb-2">3. Payment</legend>
            <label className="flex items-center gap-3 rounded-xl border border-ink px-4 py-3 text-sm">
              <input type="radio" name="pay" defaultChecked className="accent-ink" /> M-Pesa
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm">
              <input type="radio" name="pay" className="accent-ink" /> Card
            </label>
          </fieldset>

          <Button type="submit" className="w-full">
            Place order · {formatKES(total)}
          </Button>
        </form>

        <aside className="h-fit rounded-[var(--radius-soft)] bg-paper p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
          <ScoopStack flavours={items.flatMap((i) => Array(i.qty).fill(i.product.flavour))} />
          <h2 className="eyebrow mt-6">Your scoop</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={`${i.slug}-${i.size}`} className="flex justify-between gap-3">
                <span>
                  {i.product.name} <span className="text-muted">· {flavourMap[i.product.flavour].name} · {i.size} × {i.qty}</span>
                </span>
                <span className="shrink-0">{formatKES(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatKES(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{fee ? formatKES(fee) : "Free"}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatKES(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
