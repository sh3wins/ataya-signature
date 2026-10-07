import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Community from "@/components/community/Community";
import type { FruitFx } from "@/components/community/FruitFace";
import { reactions, type ReactionId } from "@/lib/community";

export const metadata: Metadata = {
  title: "The Parlour — Community",
  description: "The Ataya Signature community. Share your look, ask the studio anything and vote on what we make next.",
};

/**
 * Reaction pictures. Drop a file named after the fruit into /public/reactions
 * (apple.png, avocado.png, strawberry.png, orange.png, blueberry.png, mango.png)
 * and it replaces the drawn version. Fruits without a picture keep the drawing.
 */
function reactionPictures(): Partial<Record<ReactionId, string>> {
  const dir = path.join(process.cwd(), "public", "reactions");
  const found: Partial<Record<ReactionId, string>> = {};
  for (const r of reactions) {
    const ext = ["png", "webp"].find((e) => fs.existsSync(path.join(dir, `${r.id}.${e}`)));
    if (ext) found[r.id] = `/reactions/${r.id}.${ext}`;
  }
  return found;
}

/** The moving pieces (popping eyes, falling tears) that go with those pictures */
function reactionEffects(pictures: Partial<Record<ReactionId, string>>): Partial<Record<ReactionId, FruitFx>> {
  try {
    const all = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "reactions", "effects.json"), "utf8")) as Partial<Record<ReactionId, FruitFx>>;
    // only for fruits that are using a picture
    return Object.fromEntries(Object.entries(all).filter(([id]) => pictures[id as ReactionId]));
  } catch {
    return {};
  }
}

export default function CommunityPage() {
  const pictures = reactionPictures();
  return <Community pictures={pictures} effects={reactionEffects(pictures)} />;
}
