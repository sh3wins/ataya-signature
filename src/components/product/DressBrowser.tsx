"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { flavours, type FlavourSlug } from "@/lib/flavours";
import { CATEGORIES, categoryOf, products, isSoldOut, type Category, type Silhouette } from "@/lib/products";

type Sort = "featured" | "fresh" | "price-asc" | "price-desc";

const silhouettes: Silhouette[] = ["mini", "midi", "maxi", "column", "slip", "tiered", "wrap"];

/** The practical browsing grid: filter, sort, see what's in stock. */
export default function DressBrowser({ initialSort = "featured", initialFlavour }: { initialSort?: Sort; initialFlavour?: FlavourSlug }) {
  const [flavour, setFlavour] = useState<FlavourSlug | "all">(initialFlavour ?? "all");
  const [kind, setKind] = useState<Category | "all">("all");
  const [sil, setSil] = useState<Silhouette | "all">("all");
  const [sort, setSort] = useState<Sort>(initialSort);
  const [hideSoldOut, setHideSoldOut] = useState(false);

  const list = useMemo(() => {
    let l = products.filter(
      (p) =>
        (flavour === "all" || p.flavour === flavour) &&
        (kind === "all" || categoryOf(p) === kind) &&
        // a shape (mini, midi...) only means something for dresses and skirts
        (sil === "all" || (categoryOf(p) !== "top" && p.silhouette === sil)) &&
        (!hideSoldOut || !isSoldOut(p)),
    );
    if (sort === "fresh") l = [...l].sort((a, b) => Number(!!b.fresh) - Number(!!a.fresh));
    if (sort === "price-asc") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [flavour, kind, sil, sort, hideSoldOut]);

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors ${
      on ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
    }`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by kind of piece">
        <button className={chip(kind === "all")} aria-pressed={kind === "all"} onClick={() => setKind("all")}>
          Everything
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={chip(kind === c.id)} aria-pressed={kind === c.id} onClick={() => setKind(c.id)}>
            {c.plural}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by flavour">
          <button className={chip(flavour === "all")} aria-pressed={flavour === "all"} onClick={() => setFlavour("all")}>
            All flavours
          </button>
          {flavours.map((f) => (
            <button key={f.slug} className={`${chip(flavour === f.slug)} flex items-center gap-2`} aria-pressed={flavour === f.slug} onClick={() => setFlavour(f.slug)}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.scoop[1] }} aria-hidden />
              {f.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-muted">Shape</span>
            <select value={sil} onChange={(e) => setSil(e.target.value as Silhouette | "all")} className="rounded-full border border-line bg-transparent px-3 py-2 capitalize">
              <option value="all">All</option>
              {silhouettes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-muted">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full border border-line bg-transparent px-3 py-2">
              <option value="featured">Featured</option>
              <option value="fresh">Fresh out the freezer</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={hideSoldOut} onChange={(e) => setHideSoldOut(e.target.checked)} className="h-4 w-4 accent-ink" />
            Hide sold out
          </label>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? "piece" : "pieces"}
      </p>
      {list.length === 0 ? (
        <p className="py-24 text-center font-display text-3xl">Nothing like that in the freezer yet. Try another scoop.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
