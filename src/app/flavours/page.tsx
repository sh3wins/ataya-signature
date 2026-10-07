import type { Metadata } from "next";
import Link from "next/link";
import FlavourShowcase from "@/components/flavours/FlavourShowcase";
import { ICE_CREAM, chapterLabel } from "@/lib/collections";

export const metadata: Metadata = { title: ICE_CREAM.name, description: "Every dress has a taste." };

export default function FlavoursPage() {
  return (
    <>
      <header className="mx-auto max-w-[96rem] px-4 pt-36 sm:px-8">
        <p className="eyebrow rise text-muted">
          <Link href="/collections" className="underline-offset-4 hover:underline">
            ← All collections
          </Link>
        </p>
        <p className="eyebrow rise mt-6 text-muted">
          {chapterLabel(ICE_CREAM.chapter)} · {ICE_CREAM.name} · Five flavours, one freezer
        </p>
        <h1 className="rise mt-4 font-display text-display" style={{ animationDelay: "80ms" }}>
          The <span className="italic">Flavours</span>
        </h1>
        <p className="rise mt-6 max-w-md text-lg text-muted" style={{ animationDelay: "160ms" }}>
          We were going to stop at three flavours. We didn&apos;t. Hover to taste, click to melt into the collection.
        </p>
      </header>
      <FlavourShowcase heading={false} />
    </>
  );
}
