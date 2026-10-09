import type { Metadata } from "next";
import Link from "next/link";
import Scoop from "@/components/art/Scoop";
import InView from "@/components/ui/InView";
import { chapterLabel, collections } from "@/lib/collections";
import { flavours } from "@/lib/flavours";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "The Collections",
  description: "Ataya Signature dresses come in collections. Ice Cream is the first.",
};

/** Something still under the lid */
function Cloche({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/cloche.webp" alt="" aria-hidden className={`${className} drop-shadow-[0_30px_30px_rgb(0_0_0/0.45)]`} />;
}

export default function CollectionsPage() {
  const open = collections.filter((c) => c.status === "open");
  return (
    <div className="pb-24 pt-28 md:pt-36">
      <header className="mx-auto max-w-[96rem] px-5 sm:px-8">
        <p className="eyebrow rise text-muted">Ataya Signature</p>
        <h1 className="rise mt-4 font-display text-[clamp(3.2rem,10vw,9rem)] leading-[0.9]" style={{ animationDelay: "80ms" }}>
          The <span className="italic">Collections</span>
        </h1>
        <p className="rise mt-6 max-w-xl text-lg text-muted" style={{ animationDelay: "160ms" }}>
          Our dresses come in collections, and each one starts with something delicious.{" "}
          {open.length === 1 ? "The first is open. The next is in the kitchen." : `${open.length} are open.`}
        </p>
      </header>

      <div className="mx-auto mt-12 grid max-w-[96rem] gap-4 px-4 sm:px-8 lg:grid-cols-[1.55fr_1fr]">
        {collections.map((c, i) => {
          const live = c.status === "open" && c.href;
          const inner = (
            <>
              <div className="relative flex items-start justify-between gap-4">
                <p className="eyebrow opacity-70">{chapterLabel(c.chapter)}</p>
                <p className={`rounded-full px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] ${live ? "bg-ink text-paper" : "border border-current/40"}`}>
                  {live ? "Open now" : "Coming soon"}
                </p>
              </div>

              {c.slug === "ice-cream" ? (
                <div aria-hidden className="pointer-events-none relative my-8 flex items-end justify-center">
                  {flavours.map((f, n) => (
                    <Scoop
                      key={f.slug}
                      flavour={f.slug}
                      cone
                      rich={false}
                      className={`h-40 w-auto transition-transform duration-700 ease-[var(--ease-silk)] sm:h-56 md:h-64 ${n ? "-ml-6 sm:-ml-8" : ""} ${
                        n % 2 ? "translate-y-3 group-hover:translate-y-0" : "group-hover:-translate-y-3"
                      }`}
                      style={{ rotate: `${(n - 1.5) * 5}deg` }}
                    />
                  ))}
                </div>
              ) : (
                <div aria-hidden className="relative my-8 flex justify-center">
                  <Cloche className="h-36 w-auto sm:h-44" />
                </div>
              )}

              <div className="relative">
                <h2 className="font-display text-[clamp(2.2rem,4.6vw,4.5rem)] leading-[0.95]">{c.name}</h2>
                <p className="mt-3 font-display text-xl italic opacity-80">{c.line}</p>
                <p className="mt-3 max-w-md opacity-80">{c.description}</p>
                {live ? (
                  <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.2em]">
                    <span className="underline underline-offset-4">Step inside →</span>
                    <span className="opacity-60">
                      {flavours.length} flavours · {products.length} pieces
                    </span>
                  </p>
                ) : (
                  <Link href="/community" className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.2em] underline underline-offset-4">
                    Tell us what you are hungry for →
                  </Link>
                )}
              </div>
            </>
          );
          const shell = "group relative flex h-full min-h-[30rem] flex-col justify-between overflow-hidden rounded-[var(--radius-soft)] p-7 md:min-h-[38rem] md:p-10";
          return (
            <InView key={c.slug} delay={i * 120}>
              {live ? (
                <Link href={c.href!} className={shell} style={{ background: c.colour, color: c.ink }} aria-label={`${c.name}. Open now. Step inside.`}>
                  {inner}
                </Link>
              ) : (
                <div className={`${shell} on-dark`} style={{ background: c.colour, color: c.ink }}>
                  {inner}
                </div>
              )}
            </InView>
          );
        })}
      </div>
    </div>
  );
}
