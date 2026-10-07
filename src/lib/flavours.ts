/**
 * Flavour themes are data-driven.
 * Add a new object here and it appears across the whole site:
 * entrance, flavours section, collections, lab, builder and lookbook.
 */

import { ICE_CREAM } from "./collections";

export type FlavourSlug =
  | "strawberry"
  | "vanilla"
  | "pistachio"
  | "blueberry"
  | "mango";

export type Fleck = "seed" | "bean" | "chip" | "nut" | "swirl";

/**
 * How a flavour behaves when it melts. Same universe, different physics.
 * speed: how fast it melts · gloss/shine: how wet it looks
 * thickness: drip width · heaviness: how hard it collapses
 * elastic: drips that bounce a little · drips: how many streams
 */
export interface MeltPhysics {
  speed: number;
  gloss: number;
  shine: number;
  thickness: number;
  heaviness: number;
  elastic: number;
  drips: number;
}

export interface Flavour {
  slug: FlavourSlug;
  name: string;
  /**
   * Surfaces. These four follow the light / dark theme: they point at the
   * `--fl-...` colours in src/app/globals.css, so change them there.
   * Main colour of the flavour world (backgrounds).
   */
  colour: string;
  /** Deeper supporting colour (type accents, shadows) */
  secondaryColour: string;
  /** Small accent (soft gold, subtle yellow, lilac...) */
  accent: string;
  /** The "cream" that pairs with this flavour */
  cream: string;
  /** Text colour that reads well on `colour` */
  ink: string;
  /** The flavour's true colours, the same in every theme (used to draw the dresses and swatches) */
  raw: { colour: string; secondaryColour: string; cream: string };
  /** Set to true for a deep, dark flavour so text and buttons switch to light */
  dark?: boolean;
  /** Scoop shading: light → mid → shadow */
  scoop: [string, string, string];
  /** Little bits inside the ice cream */
  fleck: Fleck;
  fleckColour: string;
  /** the collection this flavour belongs to (Ice Cream, for now) */
  collection: string;
  tagline: string;
  description: string;
  /** Slug of the hero dress revealed after the melt */
  heroDress: string;
  /** Optional real photography later: /public/flavours/<slug>.jpg */
  iceCreamImage?: string;
  melt: MeltPhysics;
  /** A small line of brand voice for this flavour */
  moment: string;
}

export const flavours: Flavour[] = [
  {
    slug: "strawberry",
    name: "Strawberry",
    colour: "var(--fl-strawberry)",
    secondaryColour: "var(--fl-strawberry-deep)",
    accent: "#E8707F",
    cream: "var(--fl-strawberry-cream)",
    ink: "var(--fl-strawberry-ink)",
    raw: { colour: "#F1B5C0", secondaryColour: "#B8283A", cream: "#FBEEEA" },
    scoop: ["#F9D3DA", "#EE9FAE", "#C46677"],
    fleck: "seed",
    fleckColour: "#8E1F2E",
    collection: ICE_CREAM.name,
    tagline: "Sweet. Dramatic. A little unnecessary.",
    description:
      "Soft pinks cut with strawberry red. Volume, ruffles and a bow you did not need but absolutely do.",
    heroDress: "strawberry-swirl",
    melt: { speed: 1.15, gloss: 0.95, shine: 70, thickness: 1, heaviness: 1, elastic: 0.3, drips: 7 },
    moment: "This one melts quickly.",
  },
  {
    slug: "vanilla",
    name: "Vanilla",
    colour: "var(--fl-vanilla)",
    secondaryColour: "var(--fl-vanilla-deep)",
    accent: "#D6BD8E",
    cream: "var(--fl-vanilla-cream)",
    ink: "var(--fl-vanilla-ink)",
    raw: { colour: "#EFE2C6", secondaryColour: "#8E6B3E", cream: "#FFFAF0" },
    scoop: ["#FFF8E8", "#F1E0BC", "#CDB386"],
    fleck: "bean",
    fleckColour: "#3A2716",
    collection: ICE_CREAM.name,
    tagline: "The classic, taken seriously.",
    description:
      "Ivory, warm cream and pale beige. Quiet shapes, bias cuts and the kind of simple that takes years.",
    heroDress: "vanilla-bean-slip",
    melt: { speed: 0.85, gloss: 0.5, shine: 22, thickness: 1.3, heaviness: 0.9, elastic: 0.1, drips: 5 },
    moment: "Plain? Never. Classic.",
  },
  {
    slug: "pistachio",
    name: "Pistachio",
    colour: "var(--fl-pistachio)",
    secondaryColour: "var(--fl-pistachio-deep)",
    accent: "#E6DA92",
    cream: "var(--fl-pistachio-cream)",
    ink: "var(--fl-pistachio-ink)",
    raw: { colour: "#C5D3A6", secondaryColour: "#5E7A3C", cream: "#F7F5E7" },
    scoop: ["#E1EAC8", "#BFCF98", "#8DA266"],
    fleck: "nut",
    fleckColour: "#6E8A3E",
    collection: ICE_CREAM.name,
    tagline: "An acquired taste. Acquire it.",
    description:
      "Muted green with a whisper of yellow. Tea dresses and easy maxis for long lunches that turn into dinner.",
    heroDress: "pistachio-crema-midi",
    melt: { speed: 1, gloss: 0.4, shine: 18, thickness: 0.95, heaviness: 0.8, elastic: 1, drips: 6 },
    moment: "An acquired taste. Acquire it.",
  },
  {
    slug: "blueberry",
    name: "Blueberry",
    colour: "var(--fl-blueberry)",
    secondaryColour: "var(--fl-blueberry-deep)",
    accent: "#C7B3E5",
    cream: "var(--fl-blueberry-cream)",
    ink: "var(--fl-blueberry-ink)",
    raw: { colour: "#A8B2DE", secondaryColour: "#34409A", cream: "#F2F0FA" },
    scoop: ["#D2D6F2", "#A3ABDD", "#6C73B4"],
    fleck: "swirl",
    fleckColour: "#4B3C8E",
    collection: ICE_CREAM.name,
    tagline: "Cool, a little moody, entirely delicious.",
    description:
      "Blue into lilac with a cream finish. Tiers, sheen and hemlines that move like a slow spoon.",
    heroDress: "blueberry-cheesecake-tier",
    melt: { speed: 1.08, gloss: 1, shine: 110, thickness: 0.9, heaviness: 1, elastic: 0.5, drips: 8 },
    moment: "Best enjoyed slightly dreamy.",
  },
  {
    slug: "mango",
    name: "Mango",
    colour: "var(--fl-mango)",
    secondaryColour: "var(--fl-mango-deep)",
    accent: "#FFD27A",
    cream: "var(--fl-mango-cream)",
    ink: "var(--fl-mango-ink)",
    raw: { colour: "#F9CF9B", secondaryColour: "#C2570C", cream: "#FFF4E3" },
    scoop: ["#FFDDA8", "#FBB04A", "#D98426"],
    fleck: "swirl",
    fleckColour: "#E07A1F",
    collection: ICE_CREAM.name,
    tagline: "Bright. Juicy. Impossible to ignore.",
    description:
      "Warm orange running into gold. Easy shapes that swing, made for afternoons that run late.",
    heroDress: "mango-sorbet-wrap",
    melt: { speed: 1.05, gloss: 0.9, shine: 80, thickness: 1.05, heaviness: 1, elastic: 0.4, drips: 7 },
    moment: "Sunshine, churned.",
  },
];

export const flavourMap = Object.fromEntries(
  flavours.map((f) => [f.slug, f]),
) as Record<FlavourSlug, Flavour>;

export function getFlavour(slug: string): Flavour | undefined {
  return flavourMap[slug as FlavourSlug];
}

/** CSS custom properties for a flavour world. Spread into `style`. */
export function flavourVars(f: Flavour): React.CSSProperties {
  return {
    "--f-colour": f.colour,
    "--f-deep": f.secondaryColour,
    "--f-accent": f.accent,
    "--f-cream": f.cream,
    "--f-ink": f.ink,
    "--f-scoop-1": f.scoop[0],
    "--f-scoop-2": f.scoop[1],
    "--f-scoop-3": f.scoop[2],
  } as React.CSSProperties;
}
