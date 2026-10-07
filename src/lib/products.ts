import type { FlavourSlug } from "./flavours";
import { ICE_CREAM } from "./collections";

export type Silhouette =
  | "mini"
  | "midi"
  | "maxi"
  | "column"
  | "slip"
  | "tiered"
  | "wrap";

export type Detail = "bow" | "ruffle" | "pleat" | "drape" | "none";

/** What kind of piece it is. Leave it out for a dress. */
export type Category = "dress" | "skirt" | "top";
export const CATEGORIES: { id: Category; label: string; plural: string }[] = [
  { id: "dress", label: "Dress", plural: "Dresses" },
  { id: "skirt", label: "Skirt", plural: "Skirts" },
  { id: "top", label: "Top", plural: "Tops" },
];

export type Size = "XS" | "S" | "M" | "L" | "XL";

export interface Hotspot {
  /** Position on the dress art, in % of the frame */
  x: number;
  y: number;
  label: string;
  text: string;
}

export interface Product {
  slug: string;
  name: string;
  flavour: FlavourSlug;
  collection: string;
  category?: Category;
  /** the cut. For a skirt it is the length; a top ignores it */
  silhouette: Silhouette;
  detail: Detail;
  fabric: string;
  fit: string;
  /** Price in Kenyan shillings */
  price: number;
  /** Stock per size. 0 = sold out */
  stock: Record<Size, number>;
  short: string;
  description: string;
  hotspots: Hotspot[];
  mood: Mood[];
  /** Colourway for the illustration: 0 mid, 1 light, 2 deep, 3 accent */
  tone?: 0 | 1 | 2 | 3;
  fresh?: boolean;
  favourite?: boolean;
  /**
   * Real photography, when you have it. Put files in /public/dresses/
   * and list them here, e.g. { front: "/dresses/strawberry-swirl-front.jpg" }.
   * Until then the illustrated dress is used.
   */
  images?: { front?: string; back?: string; detail?: string };
}

export type Mood = "dreamy" | "bold" | "sultry" | "playful" | "calm";

export const SIZES: Size[] = ["XS", "S", "M", "L", "XL"];

const s = (xs: number, sm: number, m: number, l: number, xl: number) => ({
  XS: xs,
  S: sm,
  M: m,
  L: l,
  XL: xl,
});

export const products: Product[] = [
  // ——— Strawberry
  {
    slug: "strawberry-swirl",
    name: "Strawberry Swirl",
    flavour: "strawberry",
    collection: ICE_CREAM.name,
    silhouette: "midi",
    detail: "bow",
    fabric: "Silk-cotton taffeta",
    fit: "Fitted bodice, full A-line skirt. True to size.",
    price: 18500,
    stock: s(2, 4, 5, 3, 0),
    short: "Sweet. Dramatic. A little unnecessary.",
    description:
      "A swirl of pink taffeta with a strawberry-red bow at the waist. The skirt holds its shape and moves when you do.",
    hotspots: [
      { x: 50, y: 40, label: "The bow", text: "Hand-tied, oversized, removable if you must." },
      { x: 30, y: 72, label: "Taffeta skirt", text: "Crisp silk-cotton that rustles like a paper cone." },
      { x: 62, y: 20, label: "Sweetheart neckline", text: "Structured with soft boning for all-day comfort." },
    ],
    mood: ["dreamy", "playful"],
    fresh: true,
    favourite: true,
  },
  {
    slug: "berry-ripple-mini",
    tone: 0,
    name: "Berry Ripple Mini",
    flavour: "strawberry",
    collection: ICE_CREAM.name,
    silhouette: "mini",
    detail: "ruffle",
    fabric: "Crinkle chiffon",
    fit: "Relaxed through the body. Size down for a closer fit.",
    price: 14200,
    stock: s(3, 5, 4, 2, 1),
    short: "Ripples of red through soft pink.",
    description:
      "Tiered ruffles that fall like a ripple through ice cream. Short, swingy and made for dancing.",
    hotspots: [
      { x: 50, y: 70, label: "Ripple hem", text: "Three layers of crinkle chiffon, edge-finished by hand." },
      { x: 50, y: 26, label: "Square neck", text: "Clean and low, with adjustable straps." },
    ],
    mood: ["playful", "bold"],
    fresh: true,
  },
  {
    slug: "sundae-best-maxi",
    tone: 2,
    name: "Sundae Best Maxi",
    flavour: "strawberry",
    collection: ICE_CREAM.name,
    silhouette: "maxi",
    detail: "drape",
    fabric: "Satin-back crepe",
    fit: "Bias-draped. Skims the body.",
    price: 26500,
    stock: s(0, 1, 2, 2, 0),
    short: "For the occasion that deserves dessert.",
    description:
      "A floor-length column of strawberry red with a soft pink drape across the shoulder.",
    hotspots: [
      { x: 42, y: 22, label: "Shoulder drape", text: "Pinned once, falls forever." },
      { x: 54, y: 82, label: "Sweep hem", text: "Just kisses the floor in a 7cm heel." },
    ],
    mood: ["sultry", "bold"],
  },
  // ——— Vanilla
  {
    slug: "vanilla-bean-slip",
    tone: 1,
    name: "Vanilla Bean Slip",
    flavour: "vanilla",
    collection: ICE_CREAM.name,
    silhouette: "slip",
    detail: "none",
    fabric: "Washed silk charmeuse",
    fit: "Bias cut. Fluid, true to size.",
    price: 16800,
    stock: s(4, 6, 6, 4, 2),
    short: "The classic, taken seriously.",
    description:
      "Ivory silk cut on the bias so it pours over the body. Speckled with tiny vanilla-bean embroidery at the hem.",
    hotspots: [
      { x: 50, y: 88, label: "Bean embroidery", text: "Hundreds of tiny hand-stitched specks." },
      { x: 50, y: 18, label: "Cowl neck", text: "A gentle cowl that catches the light." },
    ],
    mood: ["calm", "dreamy"],
    favourite: true,
  },
  {
    slug: "soft-serve-gown",
    name: "Soft Serve Gown",
    flavour: "vanilla",
    collection: ICE_CREAM.name,
    silhouette: "tiered",
    detail: "ruffle",
    fabric: "Cotton organza",
    fit: "Fitted bodice, voluminous tiers.",
    price: 31500,
    stock: s(1, 2, 2, 1, 1),
    short: "Swirled, stacked, served.",
    description:
      "Tiers of warm cream organza that stack like a soft-serve swirl. Light as air, dramatic as anything.",
    hotspots: [
      { x: 50, y: 60, label: "Organza tiers", text: "Four tiers, each 30% fuller than the last." },
      { x: 50, y: 28, label: "Corset bodice", text: "Lined in cotton so it breathes." },
    ],
    mood: ["dreamy", "bold"],
    fresh: true,
  },
  {
    slug: "french-vanilla-wrap",
    tone: 3,
    name: "French Vanilla Wrap",
    flavour: "vanilla",
    collection: ICE_CREAM.name,
    silhouette: "wrap",
    detail: "bow",
    fabric: "Linen-viscose twill",
    fit: "Adjustable wrap. Fits a wide range.",
    price: 13900,
    stock: s(5, 5, 5, 5, 5),
    short: "Easy like a Sunday cone.",
    description:
      "A pale beige wrap with a side bow and an asymmetric hem. Desk to dinner without trying.",
    hotspots: [
      { x: 60, y: 42, label: "Side bow", text: "Ties at the waist, sits just off centre." },
      { x: 44, y: 80, label: "Asymmetric hem", text: "Longer at the back, shows off the shoe." },
    ],
    mood: ["calm", "playful"],
  },
  // ——— Pistachio
  {
    slug: "pistachio-crema-midi",
    name: "Pistachio Crema Midi",
    flavour: "pistachio",
    collection: ICE_CREAM.name,
    silhouette: "midi",
    detail: "pleat",
    fabric: "Cotton poplin",
    fit: "Relaxed tea-dress fit.",
    price: 15900,
    stock: s(3, 4, 4, 3, 2),
    short: "An acquired taste. Acquire it.",
    description:
      "A muted pistachio tea dress with soft pleats and a subtle yellow piping. Made for long lunches.",
    hotspots: [
      { x: 50, y: 30, label: "Yellow piping", text: "A thin line of butter yellow on every seam." },
      { x: 36, y: 72, label: "Soft pleats", text: "Released pleats that swing, not stiff." },
    ],
    mood: ["calm", "playful"],
    fresh: true,
    favourite: true,
  },
  {
    slug: "salted-pistachio-maxi",
    tone: 1,
    name: "Salted Pistachio Maxi",
    flavour: "pistachio",
    collection: ICE_CREAM.name,
    silhouette: "maxi",
    detail: "ruffle",
    fabric: "Cotton voile",
    fit: "Flowing. True to size.",
    price: 21500,
    stock: s(2, 3, 3, 1, 0),
    short: "Breezy with a salty edge.",
    description:
      "A floor-sweeping voile maxi with a single deep ruffle at the hem. Light enough for Nairobi afternoons.",
    hotspots: [
      { x: 50, y: 88, label: "Ruffle hem", text: "One generous ruffle, gathered by hand." },
    ],
    mood: ["dreamy", "calm"],
  },
  // ——— Blueberry
  {
    slug: "blueberry-cheesecake-tier",
    name: "Blueberry Cheesecake Tier",
    flavour: "blueberry",
    collection: ICE_CREAM.name,
    silhouette: "tiered",
    detail: "bow",
    fabric: "Silk-blend faille",
    fit: "Fitted bodice, full tiered skirt.",
    price: 28500,
    stock: s(1, 3, 3, 2, 1),
    short: "Cool, a little moody, entirely delicious.",
    description:
      "Tiers melting from blueberry to lilac to cream, like the layers of a cheesecake. Finished with a lilac bow.",
    hotspots: [
      { x: 50, y: 40, label: "Lilac bow", text: "Silk faille, stiffened to hold its shape." },
      { x: 50, y: 70, label: "Ombré tiers", text: "Dyed in three baths, blue into cream." },
    ],
    mood: ["dreamy", "bold"],
    favourite: true,
  },
  {
    slug: "midnight-berry-gown",
    tone: 2,
    name: "Midnight Berry Gown",
    flavour: "blueberry",
    collection: ICE_CREAM.name,
    silhouette: "column",
    detail: "pleat",
    fabric: "Plissé satin",
    fit: "Fluid column. True to size.",
    price: 32500,
    stock: s(2, 2, 1, 1, 0),
    short: "Blueberry after dark.",
    description:
      "Deep blue plissé that shimmers like syrup under the lights. Made for long nights.",
    hotspots: [
      { x: 50, y: 60, label: "Plissé", text: "Micro-pleated satin that catches every light." },
    ],
    mood: ["sultry", "calm"],
    fresh: true,
  },
  {
    slug: "lilac-sorbet-wrap",
    tone: 3,
    name: "Lilac Sorbet Wrap",
    flavour: "blueberry",
    collection: ICE_CREAM.name,
    silhouette: "wrap",
    detail: "ruffle",
    fabric: "Crepe de chine",
    fit: "Adjustable wrap.",
    price: 16400,
    stock: s(3, 4, 4, 4, 3),
    short: "A palate cleanser you can wear.",
    description:
      "A soft lilac wrap with a fluttering ruffle along the hem. Light, cool, easy.",
    hotspots: [
      { x: 44, y: 80, label: "Flutter hem", text: "A narrow ruffle along the wrap edge." },
    ],
    mood: ["playful", "dreamy"],
  },
  // ——— Mango
  {
    slug: "mango-sorbet-wrap",
    name: "Mango Sorbet Wrap",
    flavour: "mango",
    collection: ICE_CREAM.name,
    silhouette: "wrap",
    detail: "none",
    fabric: "Cotton sateen",
    fit: "Wraps and ties at the waist. True to size.",
    price: 17500,
    stock: s(3, 5, 5, 3, 2),
    short: "Bright. Juicy. Impossible to ignore.",
    description:
      "A wrap dress in warm mango orange with an uneven hem that swings when you walk. Sunshine, churned.",
    hotspots: [
      { x: 58, y: 34, label: "Wrap tie", text: "Ties at the side, so you set the fit." },
      { x: 44, y: 76, label: "Uneven hem", text: "Longer on one side, for movement." },
    ],
    mood: ["bold", "playful"],
    fresh: true,
    favourite: true,
  },
  // ——— Skirts (the three fabrics: pink, green, orange)
  {
    slug: "strawberry-scoop-skirt",
    name: "Strawberry Scoop Skirt",
    category: "skirt",
    flavour: "strawberry",
    collection: ICE_CREAM.name,
    silhouette: "midi",
    detail: "pleat",
    fabric: "Cotton sateen",
    fit: "Sits at the waist. True to size.",
    price: 9800,
    stock: s(3, 5, 5, 3, 2),
    short: "A full scoop of pink.",
    description: "A pleated midi skirt in strawberry pink. Full enough to twirl, neat enough for a Monday.",
    hotspots: [
      { x: 50, y: 24, label: "Waistband", text: "Flat at the front, a little stretch at the back." },
      { x: 40, y: 66, label: "Pleats", text: "Pressed in, so they hold their line." },
    ],
    mood: ["playful", "dreamy"],
    fresh: true,
  },
  {
    slug: "pistachio-pleat-skirt",
    name: "Pistachio Pleat Skirt",
    category: "skirt",
    flavour: "pistachio",
    collection: ICE_CREAM.name,
    silhouette: "maxi",
    detail: "pleat",
    fabric: "Cotton sateen",
    fit: "Sits at the waist. True to size.",
    price: 10500,
    stock: s(2, 4, 5, 3, 1),
    short: "Long, green and easy.",
    description: "A long pleated skirt in pistachio green. It moves like a slow afternoon.",
    hotspots: [
      { x: 50, y: 20, label: "Waistband", text: "Flat at the front, a little stretch at the back." },
      { x: 56, y: 70, label: "Pleats", text: "Pressed in, so they hold their line." },
    ],
    mood: ["calm", "dreamy"],
    fresh: true,
  },
  {
    slug: "mango-ripple-skirt",
    name: "Mango Ripple Skirt",
    category: "skirt",
    flavour: "mango",
    collection: ICE_CREAM.name,
    silhouette: "mini",
    detail: "ruffle",
    fabric: "Cotton sateen",
    fit: "Sits at the waist. True to size.",
    price: 8900,
    stock: s(3, 4, 4, 2, 1),
    short: "Short, sweet, very orange.",
    description: "A mini skirt in mango orange with a rippled hem. Made for dancing and for being looked at.",
    hotspots: [
      { x: 50, y: 28, label: "Waistband", text: "Flat at the front, a little stretch at the back." },
      { x: 50, y: 70, label: "Ripple hem", text: "A ruffle all the way round." },
    ],
    mood: ["playful", "bold"],
    fresh: true,
  },
  // ——— Tops
  {
    slug: "strawberry-bow-top",
    name: "Strawberry Bow Top",
    category: "top",
    flavour: "strawberry",
    collection: ICE_CREAM.name,
    silhouette: "mini",
    detail: "bow",
    fabric: "Cotton sateen",
    fit: "Fitted, with a small flare at the hem. True to size.",
    price: 6800,
    stock: s(3, 5, 5, 3, 2),
    short: "Sweet on top.",
    description: "A fitted top in strawberry pink with a bow at the waist. Goes with the skirt, or with jeans.",
    hotspots: [
      { x: 50, y: 62, label: "The bow", text: "Stitched at the waist, tied by hand." },
      { x: 50, y: 30, label: "Neckline", text: "A soft sweetheart shape." },
    ],
    mood: ["playful", "dreamy"],
    fresh: true,
  },
  {
    slug: "pistachio-cami-top",
    name: "Pistachio Cami",
    category: "top",
    flavour: "pistachio",
    collection: ICE_CREAM.name,
    silhouette: "slip",
    detail: "none",
    fabric: "Cotton sateen",
    fit: "Relaxed, with adjustable straps.",
    price: 5900,
    stock: s(4, 5, 5, 3, 2),
    short: "The easy one.",
    description: "A simple cami in pistachio green. Thin straps, clean lines, goes with everything.",
    hotspots: [{ x: 50, y: 30, label: "Straps", text: "Thin and adjustable." }],
    mood: ["calm", "playful"],
    fresh: true,
  },
  {
    slug: "mango-ruffle-top",
    name: "Mango Ruffle Top",
    category: "top",
    flavour: "mango",
    collection: ICE_CREAM.name,
    silhouette: "mini",
    detail: "ruffle",
    fabric: "Cotton sateen",
    fit: "Fitted, with a ruffled hem. True to size.",
    price: 6500,
    stock: s(3, 4, 5, 3, 1),
    short: "A little orange drama.",
    description: "A fitted top in mango orange with a ruffled hem. Bright enough to be the whole outfit.",
    hotspots: [
      { x: 50, y: 66, label: "Ruffle hem", text: "Flares out just below the waist." },
      { x: 50, y: 30, label: "Neckline", text: "A soft sweetheart shape." },
    ],
    mood: ["bold", "playful"],
    fresh: true,
  },
];

export const productMap = Object.fromEntries(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return productMap[slug];
}

export function productsByFlavour(flavour: FlavourSlug): Product[] {
  return products.filter((p) => p.flavour === flavour);
}

export const categoryOf = (p: Product): Category => p.category ?? "dress";

/** "midi skirt", "top", "wrap" — the short label under a piece */
export function cutLabel(p: Product): string {
  const c = categoryOf(p);
  return c === "top" ? "top" : c === "skirt" ? `${p.silhouette} skirt` : p.silhouette;
}

export function isSoldOut(p: Product): boolean {
  return Object.values(p.stock).every((n) => n === 0);
}

export function formatKES(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}
