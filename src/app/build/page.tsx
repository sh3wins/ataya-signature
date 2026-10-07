import type { Metadata } from "next";
import BuildYourAtaya from "@/components/build/BuildYourAtaya";

export const metadata: Metadata = { title: "Build your Ataya", description: "Flavour, silhouette, detail, mood. Find your dress." };

export default function BuildPage() {
  return <BuildYourAtaya />;
}
