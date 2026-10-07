import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Scoop from "@/components/art/Scoop";
import FlavourWorld from "@/components/art/FlavourWorld";
import DressArt from "@/components/art/DressArt";
import ProductCard from "@/components/product/ProductCard";
import OtherFlavours from "@/components/flavours/OtherFlavours";
import HeroVideo from "@/components/flavours/HeroVideo";
import InView from "@/components/ui/InView";
import { ButtonLink } from "@/components/ui/Button";
import { flavours, flavourVars, getFlavour } from "@/lib/flavours";
import { formatKES, productsByFlavour } from "@/lib/products";
import { flavourHeroMedia } from "@/lib/media";

export function generateStaticParams() {
  return flavours.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata(props: PageProps<"/flavours/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const f = getFlavour(slug);
  return { title: f ? `${f.name} · ${f.collection}` : "Flavour", description: f?.description };
}

export default async function FlavourPage(props: PageProps<"/flavours/[slug]">) {
  const { slug } = await props.params;
  const f = getFlavour(slug);
  if (!f) notFound();
  const items = productsByFlavour(f.slug);
  const [lead, ...others] = items;
  const dark = Boolean(f.dark);
  const media = flavourHeroMedia(f.slug);
  const film = Boolean(media.video);

  return (
    <div style={flavourVars(f)}>
      {/* HERO — a film when there is one in /public/flavours, otherwise the flavour world */}
      <section
        className={`relative overflow-hidden ${film ? "on-dark flex min-h-[92dvh] flex-col justify-end pb-32 pt-32 md:pb-44" : `pb-28 pt-32 md:pb-40 md:pt-40 ${dark ? "on-dark" : ""}`}`}
        style={{ color: film ? "#fff7f0" : f.ink, background: f.colour }}
      >
        {media.video ? (
          <>
            <HeroVideo src={media.video} poster={media.poster} />
            {/* a soft shade so the words stay readable over any film */}
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgb(20 14 12 / 0.72), rgb(20 14 12 / 0.18) 55%, rgb(20 14 12 / 0.3))" }} />
          </>
        ) : (
          <FlavourWorld flavour={f.slug} />
        )}
        <div className="relative mx-auto grid w-full max-w-[96rem] items-end gap-10 px-5 sm:px-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow opacity-70 rise">{f.collection}</p>
            <h1 className="rise mt-4 font-display text-display" style={{ animationDelay: "80ms" }}>
              {f.name}
            </h1>
            <p className="rise mt-6 max-w-xl text-xl italic font-display" style={{ animationDelay: "160ms", color: film ? f.raw.colour : dark ? f.accent : f.secondaryColour }}>
              {f.tagline}
            </p>
            <p className="rise mt-4 max-w-md opacity-80" style={{ animationDelay: "220ms" }}>
              {f.description}
            </p>
          </div>
          {!film && (
            <div data-melt-focus className="mx-auto w-fit">
              <Scoop flavour={f.slug} cone dripping className="rise h-72 w-auto md:h-[26rem]" />
            </div>
          )}
        </div>
        {/* drips into the next section */}
        <svg aria-hidden viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute -bottom-px left-0 h-20 w-full md:h-32" style={{ color: "var(--color-cream)" }}>
          <path
            fill="currentColor"
            d="M0 120V26 C44 26 56 54 78 54 C100 54 90 30 134 30 C156 30 168 106 214 106 C260 106 250 18 291 18 C310 18 322 46 338 46 C354 46 344 26 395 26 C424 26 436 72 470 72 C504 72 494 34 548 34 C580 34 592 117 650 117 C708 117 698 16 731 16 C742 16 754 60 772 60 C790 60 780 24 837 24 C872 24 884 42 912 42 C940 42 930 30 963 30 C974 30 986 94 1026 94 C1066 94 1056 20 1103 20 C1128 20 1140 64 1160 64 C1180 64 1170 28 1201 28 C1210 28 1222 113 1272 113 C1322 113 1312 14 1346 14 C1358 14 1370 50 1392 50 C1414 50 1404 30 1440 30 V120Z"
          />
        </svg>
      </section>

      {/* EDITORIAL — lead dress */}
      {lead && (
        <section className="mx-auto grid max-w-[96rem] items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-12 md:py-28">
          <InView className="relative md:col-span-7">
            <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[var(--radius-soft)]" style={{ background: `linear-gradient(160deg, ${f.cream}, ${f.colour})` }}>
              <div aria-hidden className="absolute left-1/2 top-[12%] h-[80%] w-[64%] -translate-x-1/2 rounded-t-full" style={{ background: f.colour, opacity: 0.6 }} />
              <DressArt flavour={lead.flavour} silhouette={lead.silhouette} detail={lead.detail} tone={lead.tone} title={lead.name} className="relative h-[90%] w-auto" />
            </div>
            <Scoop flavour={f.slug} rich={false} className="absolute -right-4 top-10 hidden h-24 w-24 -rotate-12 md:block" />
          </InView>
          <InView className="md:col-span-4 md:col-start-9" delay={120}>
            <p className="eyebrow text-muted">The signature</p>
            <h2 className="mt-4 font-display text-headline">{lead.name}</h2>
            <p className="mt-6 text-lg text-muted">{lead.description}</p>
            <p className="mt-6 text-sm">
              {lead.fabric} · {formatKES(lead.price)}
            </p>
            <ButtonLink href={`/dresses/${lead.slug}`} className="mt-8">
              Discover the dress
            </ButtonLink>
          </InView>
        </section>
      )}

      {/* Oversized line */}
      <section className="overflow-hidden py-10 md:py-16" aria-hidden>
        <p className="whitespace-nowrap font-display text-[clamp(3rem,10vw,9rem)] italic leading-none" style={{ color: f.secondaryColour, opacity: 0.9 }}>
          Every {f.name.toLowerCase()} dress starts as a scoop · Every {f.name.toLowerCase()} dress starts as a scoop
        </p>
      </section>

      {/* Asymmetric, floating */}
      {others.length > 0 && (
        <section className="mx-auto grid max-w-[96rem] gap-12 px-5 py-16 sm:px-8 md:grid-cols-12 md:py-24">
          {others.map((p, i) => (
            <InView key={p.slug} className={i % 2 === 0 ? "md:col-span-5 md:col-start-2" : "md:col-span-4 md:col-start-8 md:mt-48"} delay={i * 100}>
              <ProductCard product={p} tall={i % 2 === 0} />
              <p className="mt-3 max-w-sm text-sm text-muted">{p.short}</p>
            </InView>
          ))}
        </section>
      )}

      {/* Practical: the full menu */}
      <section className="mx-auto max-w-[96rem] px-5 py-16 sm:px-8" aria-labelledby="menu">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-5">
          <h2 id="menu" className="font-display text-title">
            The full {f.name.toLowerCase()} menu
          </h2>
          <p className="text-sm text-muted">{items.length} pieces</p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {items.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 py-24 text-center sm:px-8">
        <p className="eyebrow text-muted">Change your mind?</p>
        <h2 className="mb-12 mt-3 font-display text-title">Try another flavour</h2>
        <OtherFlavours current={f.slug} />
      </section>
    </div>
  );
}
