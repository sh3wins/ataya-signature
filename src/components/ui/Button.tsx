"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost" | "flavour";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-pill)] px-6 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition-[transform,background-color,color,box-shadow] duration-200 active:scale-[0.97] active:shadow-[var(--shadow-press)] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-ink/85",
  outline: "border border-current hover:bg-ink hover:text-paper hover:border-ink",
  ghost: "px-2 py-2 underline-offset-4 hover:underline",
  flavour: "bg-f-deep text-f-cream hover:brightness-110",
};

/** A small melt fills the button from the top on hover */
function Fill({ variant }: { variant: Variant }) {
  if (variant === "ghost") return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-full origin-top scale-y-0 rounded-b-[40%] bg-white/15 transition-transform duration-500 ease-[var(--ease-silk)] group-hover/btn:scale-y-100"
    />
  );
}

interface Common {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export function Button({ variant = "solid", className = "", children, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      <Fill variant={variant} />
      <span className="relative">{children}</span>
    </button>
  );
}

export function ButtonLink({ variant = "solid", className = "", children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...rest}>
      <Fill variant={variant} />
      <span className="relative">{children}</span>
    </Link>
  );
}
