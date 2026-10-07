"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getProduct, type Product, type Size } from "@/lib/products";

/* ——— YOUR SCOOP (cart) ——— */

export interface ScoopItem {
  slug: string;
  size: Size;
  qty: number;
}

export interface ScoopLine extends ScoopItem {
  product: Product;
  lineTotal: number;
}

interface ScoopCtx {
  items: ScoopLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, size: Size, qty?: number) => { ok: boolean; message: string };
  setQty: (slug: string, size: Size, qty: number) => void;
  remove: (slug: string, size: Size) => void;
  clear: () => void;
}

const Ctx = createContext<ScoopCtx | null>(null);
const KEY = "ataya-scoop-v1";

export function ScoopProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<ScoopItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const rawRef = useRef<ScoopItem[]>([]);
  useEffect(() => {
    rawRef.current = raw;
  }, [raw]);

  // Load once on the client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from storage
      if (saved) setRaw(JSON.parse(saved));
    } catch {
      /* storage blocked: cart still works for this visit */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(raw));
    } catch {
      /* ignore */
    }
  }, [raw, loaded]);

  const items = useMemo<ScoopLine[]>(
    () =>
      raw.flatMap((i) => {
        const product = getProduct(i.slug);
        return product ? [{ ...i, product, lineTotal: product.price * i.qty }] : [];
      }),
    [raw],
  );

  const add = useCallback<ScoopCtx["add"]>((slug, size, qty = 1) => {
    const p = getProduct(slug);
    if (!p) return { ok: false, message: "We couldn't find that dress." };
    const stock = p.stock[size];
    if (!stock) return { ok: false, message: `Size ${size} is sold out.` };
    const existing = rawRef.current.find((i) => i.slug === slug && i.size === size);
    const current = existing?.qty ?? 0;
    const next = Math.min(stock, current + qty);
    if (next === current) {
      return { ok: false, message: `Only ${stock} left in size ${size}, and they're all in your scoop.` };
    }
    const updated = existing
      ? rawRef.current.map((i) => (i === existing ? { ...i, qty: next } : i))
      : [...rawRef.current, { slug, size, qty: next }];
    rawRef.current = updated;
    setRaw(updated);
    const ok = true;
    const message = `${p.name} (${size}) added to your scoop.`;
    return { ok, message };
  }, []);

  const setQty = useCallback((slug: string, size: Size, qty: number) => {
    const p = getProduct(slug);
    const max = p?.stock[size] ?? 0;
    setRaw((prev) =>
      prev
        .map((i) => (i.slug === slug && i.size === size ? { ...i, qty: Math.max(0, Math.min(max, qty)) } : i))
        .filter((i) => i.qty > 0),
    );
  }, []);

  const remove = useCallback((slug: string, size: Size) => {
    setRaw((prev) => prev.filter((i) => !(i.slug === slug && i.size === size)));
  }, []);

  const clear = useCallback(() => setRaw([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.lineTotal, 0),
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    }),
    [items, open, add, setQty, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useScoop() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useScoop must be used inside ScoopProvider");
  return c;
}
