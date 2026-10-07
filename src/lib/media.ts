import fs from "node:fs";
import path from "node:path";

/**
 * Hero films for the flavour pages. No code needed to add one:
 * drop a file in /public/flavours/ named after the flavour and it shows up.
 *
 *   public/flavours/strawberry.mp4   ← the film (mp4 or webm)
 *   public/flavours/strawberry.jpg   ← optional still, shown while the film loads
 *
 * A flavour with no film keeps its illustrated hero.
 */
export interface HeroMedia {
  video?: string;
  poster?: string;
}

const DIR = path.join(process.cwd(), "public", "flavours");

function find(slug: string, extensions: string[]): string | undefined {
  const ext = extensions.find((e) => fs.existsSync(path.join(DIR, `${slug}.${e}`)));
  return ext ? `/flavours/${slug}.${ext}` : undefined;
}

export function flavourHeroMedia(slug: string): HeroMedia {
  return {
    video: find(slug, ["mp4", "webm"]),
    poster: find(slug, ["jpg", "jpeg", "png", "webp"]),
  };
}
