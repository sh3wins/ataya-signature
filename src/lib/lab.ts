import type { FlavourSlug } from "./flavours";
import { products, type Detail, type Mood, type Product, type Silhouette } from "./products";

/* ————————————————————————————————————————————————————————————
 * FLAVOUR LAB
 * Mixes are resolved through a `MixResolver`. Right now it is a
 * curated lookup table. Later you can swap in an AI-powered
 * resolver (e.g. an API route) without touching the UI.
 * ———————————————————————————————————————————————————————————— */

export interface Mix {
  a: FlavourSlug;
  b: FlavourSlug;
  name: string;
  note: string;
  lookSlug: string;
}

export type MixResolver = (a: FlavourSlug, b: FlavourSlug) => Promise<Mix>;

const key = (a: FlavourSlug, b: FlavourSlug) => [a, b].sort().join("+");

const curated: Record<string, Omit<Mix, "a" | "b">> = {
  [key("strawberry", "vanilla")]: {
    name: "Strawberry Vanilla",
    note: "Pink swirled through ivory. The first dress we ever drew.",
    lookSlug: "strawberry-swirl",
  },
  [key("strawberry", "pistachio")]: {
    name: "Strawberry Pistachio",
    note: "Pink and green, the most Ataya pairing there is.",
    lookSlug: "berry-ripple-mini",
  },
  [key("strawberry", "blueberry")]: {
    name: "Mixed Berry",
    note: "Two berries, one bold hemline.",
    lookSlug: "lilac-sorbet-wrap",
  },
  [key("vanilla", "pistachio")]: {
    name: "Pistachio Cream",
    note: "Soft, green, a little nutty. Made for garden parties.",
    lookSlug: "pistachio-crema-midi",
  },
  [key("vanilla", "blueberry")]: {
    name: "Blueberry Cheesecake",
    note: "Layers of blue into cream. A classic in tiers.",
    lookSlug: "blueberry-cheesecake-tier",
  },
  [key("pistachio", "blueberry")]: {
    name: "Blue Pistachio",
    note: "Cool green, cool blue. Surprisingly calm.",
    lookSlug: "salted-pistachio-maxi",
  },
};

export const curatedResolver: MixResolver = async (a, b) => {
  const hit = curated[key(a, b)];
  if (hit) return { a, b, ...hit };
  // Same flavour twice: double scoop
  const cap = a[0].toUpperCase() + a.slice(1);
  const look = products.find((p) => p.flavour === a)!;
  return { a, b, name: `Double ${cap}`, note: "Twice as much. No regrets.", lookSlug: look.slug };
};

/* ————————————————————————————————————————————————————————————
 * BUILD YOUR ATAYA
 * Scores every dress against the choices and returns the closest.
 * ———————————————————————————————————————————————————————————— */

export interface BuildChoice {
  flavour: FlavourSlug;
  silhouette: Silhouette;
  detail: Detail;
  mood: Mood;
}

export function matchProduct(c: BuildChoice): Product {
  let best = products[0];
  let bestScore = -1;
  for (const p of products) {
    let score = 0;
    if (p.flavour === c.flavour) score += 4;
    if (p.silhouette === c.silhouette) score += 3;
    if (p.detail === c.detail) score += 2;
    if (p.mood.includes(c.mood)) score += 1;
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return best;
}

export const moods: { id: Mood; label: string; line: string }[] = [
  { id: "dreamy", label: "Dreamy", line: "Soft focus, slow afternoons." },
  { id: "bold", label: "Bold", line: "Walk in, turn heads." },
  { id: "sultry", label: "Sultry", line: "Low light, long night." },
  { id: "playful", label: "Playful", line: "A wink in dress form." },
  { id: "calm", label: "Calm", line: "Easy, quiet, certain." },
];
