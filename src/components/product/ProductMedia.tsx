import Image from "next/image";
import DressArt from "@/components/art/DressArt";
import type { Product } from "@/lib/products";

/**
 * Shows real photography when a product has it (via next/image, lazy
 * and responsive), otherwise the illustrated dress.
 */
export default function ProductMedia({
  product,
  view = "front",
  className = "",
  sizes = "(min-width: 768px) 33vw, 90vw",
  priority,
  sway,
  viewBox,
}: {
  product: Product;
  view?: "front" | "back" | "detail";
  className?: string;
  sizes?: string;
  priority?: boolean;
  sway?: boolean;
  viewBox?: string;
}) {
  const photo = product.images?.[view];
  if (photo) {
    return (
      <div className={`relative ${className}`}>
        <Image src={photo} alt={`${product.name}, ${view} view`} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <DressArt
      flavour={product.flavour}
      silhouette={product.silhouette}
      detail={product.detail}
      tone={product.tone}
      view={view === "back" ? "back" : "front"}
      sway={sway}
      viewBox={viewBox}
      title={`${product.name}, ${view} view`}
      className={className}
    />
  );
}
