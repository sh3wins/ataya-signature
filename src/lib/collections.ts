/**
 * Ataya Signature is the house. Each collection is a room in it.
 * Ice Cream is the first. Add an object here and it appears on the
 * Collections page; give it `status: "open"` and an `href` once its
 * pages exist.
 */
export interface Collection {
  slug: string;
  /** order it was released in, shown as "Chapter 01" */
  chapter: number;
  name: string;
  status: "open" | "soon";
  /** where the collection lives; leave out until it is ready */
  href?: string;
  line: string;
  description: string;
  /** card colour and the text colour that reads well on it */
  colour: string;
  ink: string;
}

export const collections: Collection[] = [
  {
    slug: "ice-cream",
    chapter: 1,
    name: "The Ice Cream Collection",
    status: "open",
    href: "/flavours",
    line: "Every dress has a taste.",
    description: "Where it started. Dresses, skirts and tops in strawberry, vanilla, pistachio, blueberry and mango. Pick a flavour and let it melt.",
    colour: "var(--fl-strawberry)",
    ink: "var(--fl-strawberry-ink)",
  },
  {
    slug: "next",
    chapter: 2,
    name: "Next on the menu",
    status: "soon",
    line: "Something new is in the kitchen.",
    description: "A second collection is on its way. We are not saying what yet, only that it is not ice cream.",
    colour: "#1d1916",
    ink: "#fcf9f3",
  },
];

/** The collection all current flavours and dresses belong to */
export const ICE_CREAM = collections[0];

export const chapterLabel = (n: number) => `Chapter ${String(n).padStart(2, "0")}`;
