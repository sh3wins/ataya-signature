"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useScoop } from "@/components/providers/ScoopProvider";
import { ButtonLink, Button } from "@/components/ui/Button";
import ScoopStack from "./ScoopStack";
import ScoopLines from "./ScoopLines";
import { formatKES } from "@/lib/products";

export default function CartDrawer() {
  const { open, setOpen, items, subtotal, count } = useScoop();
  const panel = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[65] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your scoop"
        tabIndex={-1}
        inert={!open}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper outline-none transition-[transform,box-shadow] duration-700 ease-[var(--ease-silk)] ${
          open ? "translate-x-0 shadow-[var(--shadow-float)]" : "translate-x-full shadow-none"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-3xl">Your Scoop</h2>
          <button onClick={() => setOpen(false)} className="text-[0.72rem] font-semibold uppercase tracking-[0.22em]">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {open && <ScoopStack flavours={items.flatMap((i) => Array(i.qty).fill(i.product.flavour))} className="mt-8" />}
          {items.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-display text-2xl">Your scoop is empty.</p>
              <p className="mt-2 text-sm text-muted">Fresh flavours are waiting in the freezer.</p>
              <ButtonLink href="/dresses" variant="outline" className="mt-6" onClick={() => setOpen(false)}>
                Browse the shop
              </ButtonLink>
            </div>
          ) : (
            <>
              <p className="mt-6 text-center text-xs uppercase tracking-[0.18em] text-muted">
                {count} {count === 1 ? "flavour" : "flavours"} collected
              </p>
              <ScoopLines onNavigate={() => setOpen(false)} />
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-6 pb-6 pt-5">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">{formatKES(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Delivery calculated at checkout.</p>
            <Button
              className="mt-5 w-full"
              onClick={() => {
                setOpen(false);
                router.push("/checkout");
              }}
            >
              Melt into checkout <span aria-hidden>→</span>
            </Button>
            <p className="mt-2 text-center text-xs text-muted">Secure checkout. You can review everything before paying.</p>
            <ButtonLink href="/scoop" variant="ghost" className="mt-1 w-full" onClick={() => setOpen(false)}>
              View full scoop
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
