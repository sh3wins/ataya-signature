import Link from "next/link";
import Entrance from "@/components/home/Entrance";
import { burstPictures, filmPictures, scoopPictures, splashPictures } from "@/lib/media";
import FlavourShowcase from "@/components/flavours/FlavourShowcase";
import ProductCard from "@/components/product/ProductCard";
import Scoop from "@/components/art/Scoop";
import DressArt from "@/components/art/DressArt";
import InView from "@/components/ui/InView";
import { ButtonLink } from "@/components/ui/Button";
import { products } from "@/lib/products";

export default function Home() {
  const fresh = products.filter((p) => p.fresh);
  const favourites = products.filter((p) => p.favourite);

  return (
    <>
      <Entrance pictures={scoopPictures()} splashes={splashPictures()} bursts={burstPictures()} films={filmPictures()} />

      <FlavourShowcase />

      {/* FRESH OUT THE FREEZER — editorial first, grid second */}
      <section className="mx-auto max-w-[96rem] px-4 py-20 sm:px-8 md:py-28" aria-labelledby="fresh">
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-12">
          <InView className="md:col-span-5 md:pt-24">
            <p className="eyebrow text-muted">New this season</p>
            <h2 id="fresh" className="mt-4 font-display text-headline">
              Fresh out <br />
              <span className="italic">the freezer</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg text-muted">Just scooped. Still cold. Sizes are going fast.</p>
            <ButtonLink href="/dresses?sort=fresh" variant="outline" className="mt-8">
              See everything new
            </ButtonLink>
          </InView>
          <InView className="md:col-span-7" delay={100}>
            <ProductCard product={fresh[0]} tall />
          </InView>
          <InView className="md:col-span-4 md:col-start-2 md:-mt-40">
            <ProductCard product={fresh[1]} />
          </InView>
          <InView className="relative md:col-span-4 md:col-start-7 md:-mt-10" delay={120}>
            <ProductCard product={fresh[2]} />
            <Scoop flavour={fresh[2].flavour} rich={false} className="pointer-events-none absolute -right-6 -top-10 hidden h-20 w-20 rotate-12 md:block" />
          </InView>
        </div>
      </section>

      {/* EVERYONE'S FAVOURITE FLAVOURS */}
      <section className="py-20 md:py-28" aria-labelledby="faves">
        <div className="mx-auto flex max-w-[96rem] items-end justify-between gap-6 px-4 sm:px-8">
          <h2 id="faves" className="font-display text-title">
            Everyone&apos;s favourite <span className="italic">flavours</span>
          </h2>
          <Link href="/dresses" className="eyebrow shrink-0 underline-offset-4 hover:underline">
            Shop everything →
          </Link>
        </div>
        <ul className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-8 [scrollbar-width:thin]">
          {favourites.map((p) => (
            <li key={p.slug} className="w-[72vw] shrink-0 snap-start sm:w-[22rem]">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>

      {/* LAB + BUILD */}
      <section className="mx-auto grid max-w-[96rem] gap-4 px-4 py-16 sm:px-8 md:grid-cols-2">
        <InView>
          <Link href="/lab" className="group relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[var(--radius-soft)] on-dark bg-ink p-8 text-paper">
            <p className="eyebrow text-paper/60">Experimental</p>
            <div aria-hidden className="absolute right-6 top-1/2 flex -translate-y-1/2">
              <Scoop flavour="strawberry" rich={false} shadow={false} className="h-32 w-32 transition-transform duration-700 ease-[var(--ease-silk)] group-hover:translate-x-8 group-hover:rotate-12" />
              <Scoop flavour="pistachio" rich={false} shadow={false} className="-ml-10 h-32 w-32 transition-transform duration-700 ease-[var(--ease-silk)] group-hover:-translate-x-8 group-hover:-rotate-12" />
            </div>
            <div className="relative">
              <h2 className="font-display text-5xl md:text-6xl">
                The Flavour <span className="italic">Lab</span>
              </h2>
              <p className="mt-3 max-w-xs text-paper/70">Some combinations shouldn&apos;t work. We made them anyway.</p>
            </div>
          </Link>
        </InView>
        <InView delay={120}>
          <Link href="/build" className="group relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[var(--radius-soft)] bg-[var(--fl-vanilla)] p-8 text-[var(--fl-vanilla-ink)]">
            <p className="eyebrow text-muted">Styling studio</p>
            <div aria-hidden className="absolute bottom-0 right-8 h-[90%] transition-transform duration-700 ease-[var(--ease-silk)] group-hover:-translate-y-4">
              <DressArt flavour="blueberry" silhouette="tiered" detail="bow" shadow={false} className="h-full w-auto" />
            </div>
            <div className="relative">
              <h2 className="font-display text-5xl md:text-6xl">
                Build your <span className="italic">Ataya</span>
              </h2>
              <p className="mt-3 max-w-[14rem] text-muted">Flavour, silhouette, detail, mood. We&apos;ll find your dress.</p>
            </div>
          </Link>
        </InView>
      </section>

      {/* COMMUNITY TEASER */}
      <section className="px-4 sm:px-8">
        <InView>
          <Link href="/community" className="group relative mx-auto flex max-w-[96rem] flex-col justify-between gap-10 overflow-hidden rounded-[var(--radius-soft)] bg-[var(--fl-pistachio)] p-8 text-[var(--fl-pistachio-ink)] md:min-h-[20rem] md:flex-row md:items-end md:p-12">
            <div>
              <p className="eyebrow opacity-70">The community</p>
              <h2 className="mt-4 font-display text-5xl md:text-7xl">
                Come into the <span className="italic">Parlour</span>
              </h2>
              <p className="mt-4 max-w-md opacity-80">Share your look, ask the studio anything, and vote on the next flavour.</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] underline underline-offset-4 transition-transform duration-500 ease-[var(--ease-silk)] group-hover:translate-x-1">
              Join the conversation →
            </span>
          </Link>
        </InView>
      </section>

      {/* LOOKBOOK TEASER */}
      <section className="px-4 py-24 text-center sm:px-8 md:py-36">
        <InView>
          <p className="eyebrow text-muted">The Lookbook</p>
          <Link href="/lookbook" className="group mt-6 inline-block font-display text-display">
            Too <span className="italic transition-colors duration-500 group-hover:text-cherry">sweet?</span>
          </Link>
          <p className="mt-6 text-muted">
            <Link href="/lookbook" className="underline underline-offset-4">
              Step into the Ataya universe
            </Link>
          </p>
        </InView>
      </section>
    </>
  );
}
