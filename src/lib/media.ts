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

/**
 * Photo-real scoops for the opening screen. Same idea as the films:
 * drop a cut-out picture (transparent background, 200:330 frame, the cone
 * upright and centred) in /public/scoops/ named after the flavour.
 *
 *   public/scoops/strawberry.png   (png or webp)
 *
 * A flavour with no picture keeps its drawn scoop.
 */
export function scoopPictures(): Record<string, string> {
  return picturesIn("scoops");
}

/** The splash pieces thrown when the scoop is tapped: public/splash/<flavour>/<piece>.webp */
export function splashPictures(): Record<string, string> {
  const dir = path.join(process.cwd(), "public", "splash");
  const out: Record<string, string> = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    if (fs.existsSync(path.join(dir, f, "radial.webp"))) out[f] = `/splash/${f}`;
  }
  return out;
}

/** Two flavours swirled on one cone, for the Flavour Lab: public/mix/<first>-<second>.webp */
export function mixPictures(): Record<string, string> {
  return picturesIn("mix");
}

/** The swirl bursting, as video frames: public/burst/<flavour>/00.webp … */
export function burstPictures(): Record<string, string> {
  const dir = path.join(process.cwd(), "public", "burst");
  const out: Record<string, string> = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) if (fs.existsSync(path.join(dir, f, "00.webp"))) out[f] = `/burst/${f}`;
  return out;
}

/** The two films (the cone spinning and bursting, then melting off): public/film/<flavour>/a00.webp … */
export function filmPictures(): Record<string, string> {
  const dir = path.join(process.cwd(), "public", "film");
  const out: Record<string, string> = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) if (fs.existsSync(path.join(dir, f, "a00.webp"))) out[f] = `/film/${f}`;
  return out;
}

function picturesIn(folder: string): Record<string, string> {
  const dir = path.join(process.cwd(), "public", folder);
  const out: Record<string, string> = {};
  if (!fs.existsSync(dir)) return out;
  for (const file of fs.readdirSync(dir)) {
    const m = /^([a-z-]+)\.(png|webp)$/.exec(file);
    if (m) out[m[1]] = `/${folder}/${file}`;
  }
  return out;
}
