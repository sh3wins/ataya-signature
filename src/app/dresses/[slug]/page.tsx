import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/product/ProductGallery";
import PurchasePanel from "@/components/product/PurchasePanel";
import ProductCard from "@/components/product/ProductCard";
import DressArt from "@/components/art/DressArt";
import Scoop from "@/components/art/Scoop";
import InView from "@/components/ui/InView";
import { flavourMap, flavourVars } from "@/lib/flavours";
import { getProduct, products } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/dresses/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProduct(slug);
  return { title: p?.name ?? "Dress", description: p?.description };
}

export default async function ProductPage(props: PageProps<"/dresses/[slug]">) {
  const { slug } = await props.params;
  const p = getProduct(slug);
  if (!p) notFound();
  const f = flavourMap[p.flavour];
  const more = [
    ...products.filter((x) => x.flavour === p.flavour && x.slug !== p.slug),
    ...products.filter((x) => x.flavour !== p.flavour && x.silhouette === p.silhouette),
  ].slice(0, 4);

  return (
    <div style={flavourVars(f)}>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[96rem] px-4 pt-24 text-xs text-muted sm:px-8">
        <Link href="/dresses" className="hover:underline">Shop</Link> <span aria-hidden>/</span>{" "}
        <Link href={`/flavours/${f.slug}`} className="hover:underline">{f.name}</Link> <span aria-hidden>/</span>{" "}
        <span aria-current="page">{p.name}</span>
      </nav>

      <section className="mx-auto grid max-w-[96rem] gap-10 px-4 pb-20 pt-6 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <ProductGallery product={p} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PurchasePanel product={p} />
        </div>
      </section>

      {/* Editorial: styling */}
      <section className="overflow-hidden py-20 md:py-28" style={{ background: f.colour, color: f.ink }}>
        <div className="mx-auto grid max-w-[96rem] items-center gap-12 px-4 sm:px-8 md:grid-cols-12">
          <InView className="md:col-span-5">
            <p className="eyebrow opacity-70">How to wear it</p>
            <p className="mt-5 font-display text-[clamp(2rem,4vw,3.6rem)] leading-[1.02]">{p.description}</p>
            <p className="mt-6 max-w-sm opacity-80">
              Style it with a bare shoulder and a bold lip, or a cropped jacket for the walk home. {f.tagline}
            </p>
          </InView>
          <InView className="relative md:col-span-6 md:col-start-7" delay={120}>
            <div className="relative grid aspect-square place-items-center rounded-full" style={{ background: f.cream }}>
              <DressArt flavour={p.flavour} silhouette={p.silhouette} detail={p.detail} garment={p.category} tone={p.tone} view="back" className="h-[92%] w-auto" title={`${p.name}, back`} />
              <Scoop flavour={p.flavour} rich={false} cone className="absolute -bottom-4 right-6 h-40 w-auto rotate-[14deg]" />
            </div>
          </InView>
        </div>
      </section>

      <section className="mx-auto max-w-[96rem] px-4 py-20 sm:px-8" aria-labelledby="more">
        <h2 id="more" className="font-display text-title">
          More sweet <span className="italic">things</span>
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {more.map((x) => (
            <li key={x.slug}>
              <ProductCard product={x} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
