"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Scoop from "@/components/art/Scoop";
import DressArt from "@/components/art/DressArt";
import { flavours, type Flavour } from "@/lib/flavours";
import { getProduct, productsByFlavour } from "@/lib/products";
import { useMeltNavigate } from "@/components/melt/useMeltNavigate";
import { useExperience } from "@/components/providers/ExperienceProvider";

/**
 * THE FLAVOURS — every flavour is an object, not a product card.
 * Hover: the scoop jiggles, a drip falls, the dress peeks out, the type opens up.
 * Click / tap: melt into the collection.
 */
function FlavourObject({ f, active, onActive }: { f: Flavour; active: boolean; onActive: (v: boolean) => void }) {
  const scoop = useRef<HTMLDivElement>(null);
  const melt = useMeltNavigate();
  const { play } = useExperience();
  const hero = getProduct(f.heroDress)!;
  const count = productsByFlavour(f.slug).length;
  const dark = Boolean(f.dark);

  return (
    <li
      className={`group/fl relative min-h-[15rem] overflow-hidden rounded-[var(--radius-soft)] transition-[flex-grow] duration-700 ease-[var(--ease-silk)] md:min-h-[34rem] ${
        active ? "md:flex-[2.2]" : "md:flex-1"
      }`}
      style={{ background: f.colour, color: f.ink }}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        onActive(true);
        play("drip");
      }}
      onPointerLeave={() => onActive(false)}
    >
      <Link
        href={`/flavours/${f.slug}`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey) return;
          e.preventDefault();
          melt(f.slug, `/flavours/${f.slug}`, scoop.current);
        }}
        onFocus={() => onActive(true)}
        onBlur={() => onActive(false)}
        data-flavour-colour={f.secondaryColour}
        data-cursor="taste"
        className="absolute inset-0 flex flex-col justify-between p-5 md:p-6"
        aria-label={`${f.name}: ${f.tagline} ${count} pieces. Enter the collection.`}
      >
        <div className="flex items-start justify-between">
          <span className="eyebrow opacity-70">{String(flavours.indexOf(f) + 1).padStart(2, "0")}</span>
          <span className="eyebrow opacity-70">{count} pieces</span>
        </div>

        {/* dress peeks up from behind the scoop */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
          <div className={`transition-all duration-700 ease-[var(--ease-silk)] ${active ? "translate-y-[8%] opacity-100" : "translate-y-[60%] opacity-0"}`}>
            <DressArt flavour={f.slug} silhouette={hero.silhouette} detail={hero.detail} tone={hero.tone} shadow={false} className="h-[26rem] w-auto" />
          </div>
        </div>

        <div
          ref={scoop}
          className={`relative mx-auto transition-transform duration-700 ease-[var(--ease-silk)] ${active ? "md:-translate-y-28 md:scale-[0.6]" : ""}`}
        >
          <div className="group-hover/fl:animate-[jiggle_0.9s_var(--ease-melt)]">
            <Scoop flavour={f.slug} rich={false} cone dripping={active} className="h-36 w-auto md:h-52" />
          </div>
        </div>

        <div className="relative">
          <h3
            className={`font-display text-4xl transition-[letter-spacing] duration-700 ease-[var(--ease-silk)] md:text-5xl ${active ? "tracking-[0.06em]" : "tracking-[-0.01em]"}`}
          >
            {f.name}
          </h3>
          <p className={`mt-1 max-w-xs text-sm transition-opacity duration-500 ${active ? "opacity-100" : "opacity-70 md:opacity-0"}`} style={{ color: dark ? f.accent : undefined }}>
            {f.tagline}
          </p>
        </div>
      </Link>
    </li>
  );
}

export default function FlavourShowcase({ heading = true }: { heading?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section id="flavours" className="mx-auto max-w-[96rem] scroll-mt-16 px-4 py-24 sm:px-8 md:py-32">
      {heading && (
        <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-muted">
              <Link href="/collections" className="underline-offset-4 hover:underline">
                Chapter 01 · The Ice Cream Collection
              </Link>
            </p>
            <h2 className="mt-4 font-display text-headline">
              The <span className="italic">Flavours</span>
            </h2>
          </div>
          <p className="max-w-xs text-lg text-muted">Every dress has a taste. Pick one and let it melt.</p>
        </div>
      )}
      <ul className="flex flex-col gap-3 md:flex-row">
        {flavours.map((f) => (
          <FlavourObject key={f.slug} f={f} active={active === f.slug} onActive={(v) => setActive(v ? f.slug : null)} />
        ))}
      </ul>
    </section>
  );
}
