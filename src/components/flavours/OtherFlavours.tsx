"use client";

import Link from "next/link";
import { useRef } from "react";
import Scoop from "@/components/art/Scoop";
import { flavours, type FlavourSlug } from "@/lib/flavours";
import { useMeltNavigate } from "@/components/melt/useMeltNavigate";

/** Jump between flavour worlds through the melt. */
export default function OtherFlavours({ current }: { current?: FlavourSlug }) {
  const melt = useMeltNavigate();
  const refs = useRef<Record<string, HTMLElement | null>>({});
  return (
    <ul className="flex flex-wrap justify-center gap-6 sm:gap-10">
      {flavours
        .filter((f) => f.slug !== current)
        .map((f) => (
          <li key={f.slug}>
            <Link
              href={`/flavours/${f.slug}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) return;
                e.preventDefault();
                melt(f.slug, `/flavours/${f.slug}`, refs.current[f.slug]);
              }}
              className="group flex flex-col items-center gap-3"
              data-flavour-colour={f.colour}
            >
              <span ref={(el) => void (refs.current[f.slug] = el)} className="block group-hover:animate-[jiggle_0.9s_var(--ease-melt)]">
                <Scoop flavour={f.slug} rich={false} className="h-20 w-20 sm:h-24 sm:w-24" />
              </span>
              <span className="eyebrow">{f.name}</span>
            </Link>
          </li>
        ))}
    </ul>
  );
}
