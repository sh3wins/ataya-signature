import type { Metadata } from "next";
import FlavourLab from "@/components/lab/FlavourLab";
import { mixPictures, scoopPictures, splashPictures } from "@/lib/media";

export const metadata: Metadata = { title: "The Flavour Lab", description: "What happens when you mix two flavours?" };

export default function LabPage() {
  return <FlavourLab pictures={scoopPictures()} mixes={mixPictures()} splashes={splashPictures()} />;
}
