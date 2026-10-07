import Link from "next/link";
import ProductMedia from "./ProductMedia";
import { flavourMap } from "@/lib/flavours";
import { formatKES, isSoldOut, type Product } from "@/lib/products";

/** Practical product card: front view, back view on hover, clear price and stock. */
export default function ProductCard({ product, tall = false, className = "" }: { product: Product; tall?: boolean; className?: string }) {
  const f = flavourMap[product.flavour];
  const soldOut = isSoldOut(product);
  return (
    <Link href={`/dresses/${product.slug}`} className={`group block ${className}`} data-flavour-colour={f.colour}>
      <div
        className={`relative overflow-hidden rounded-[var(--radius-soft)] ${tall ? "aspect-[3/4.4]" : "aspect-[3/4]"}`}
        style={{ background: f.colour }}
      >
        <div className="absolute inset-0 grid place-items-center transition-all duration-700 ease-[var(--ease-silk)] group-hover:-translate-y-2 group-hover:opacity-0">
          <ProductMedia product={product} sway={false} className="h-[88%] w-auto" />
        </div>
        <div className="absolute inset-0 grid place-items-center opacity-0 transition-all duration-700 ease-[var(--ease-silk)] group-hover:-translate-y-2 group-hover:opacity-100">
          <ProductMedia product={product} view="back" sway={false} className="h-[88%] w-auto" />
        </div>
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.fresh && <span className="rounded-full bg-paper/85 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink">Fresh</span>}
          {soldOut && <span className="rounded-full bg-ink px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-paper">Sold out</span>}
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl leading-tight group-hover:underline group-hover:underline-offset-4">{product.name}</h3>
          <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-muted">{f.name} · {product.silhouette}</p>
        </div>
        <p className={`shrink-0 text-sm ${soldOut ? "text-muted" : ""}`}>{formatKES(product.price)}</p>
      </div>
    </Link>
  );
}
