import type { Metadata } from "next";
import DressBrowser from "@/components/product/DressBrowser";
import { getFlavour } from "@/lib/flavours";

export const metadata: Metadata = { title: "Shop", description: "Every Ataya Signature dress, skirt and top, in every flavour." };

export default async function DressesPage(props: PageProps<"/dresses">) {
  const sp = await props.searchParams;
  const sort = sp.sort === "fresh" || sp.sort === "price-asc" || sp.sort === "price-desc" ? sp.sort : "featured";
  const flavour = typeof sp.flavour === "string" ? getFlavour(sp.flavour)?.slug : undefined;
  return (
    <div className="mx-auto max-w-[96rem] px-4 pb-24 pt-32 sm:px-8">
      <header className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
        <h1 className="rise font-display text-headline">
          The <span className="italic">Shop</span>
        </h1>
        <p className="rise max-w-sm text-lg text-muted md:justify-self-end" style={{ animationDelay: "100ms" }}>
          Dresses, skirts and tops, every flavour in one freezer. Filter by piece, taste, shape or price.
        </p>
      </header>
      <DressBrowser initialSort={sort} initialFlavour={flavour} />
    </div>
  );
}
