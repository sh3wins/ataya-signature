import type { Metadata } from "next";
import Scoop from "@/components/art/Scoop";
import DressArt from "@/components/art/DressArt";
import InView from "@/components/ui/InView";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "About", description: "We wondered what would happen if a dress tasted like dessert." };

export default function AboutPage() {
  return (
    <div className="pt-24">
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-32">
        <h1 className="rise font-display text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.95]">
          We wondered what would happen if a dress <span className="italic">tasted like dessert.</span>
        </h1>
      </section>

      <section className="grid min-h-[80vh] place-items-center overflow-hidden bg-[var(--fl-strawberry)] px-5 py-20">
        <InView className="flex items-end gap-4">
          <Scoop flavour="strawberry" cone className="h-[50vh] w-auto -rotate-6" />
          <Scoop flavour="vanilla" cone className="hidden h-[40vh] w-auto rotate-6 sm:block" />
        </InView>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24 text-right sm:px-8 md:py-36">
        <InView as="h2" className="font-display text-display">
          So we <span className="italic">made one.</span>
        </InView>
      </section>

      <section className="grid min-h-[90vh] place-items-center overflow-hidden bg-[var(--fl-vanilla)] px-5 py-16">
        <InView>
          <DressArt flavour="strawberry" silhouette="midi" detail="bow" className="h-[80vh] w-auto" title="The first Ataya dress" />
        </InView>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-36">
        <InView as="h2" className="font-display text-display">
          Then we made <span className="italic">another.</span>
        </InView>
      </section>

      <section className="grid grid-cols-2 gap-2 px-2 md:grid-cols-4" aria-label="The flavours">
        {(
          [
            ["strawberry", "mini", "ruffle", "var(--fl-strawberry)"],
            ["vanilla", "slip", "none", "var(--fl-vanilla)"],
            ["pistachio", "midi", "pleat", "var(--fl-pistachio)"],
            ["blueberry", "tiered", "bow", "var(--fl-blueberry)"],
          ] as const
        ).map(([f, s, d, bg], i) => (
          <InView key={f} delay={i * 100} className="grid aspect-[3/4] place-items-center rounded-[var(--radius-soft)]">
            <div className="grid h-full w-full place-items-center rounded-[var(--radius-soft)]" style={{ background: bg }}>
              <DressArt flavour={f} silhouette={s} detail={d} className="h-[88%] w-auto" />
            </div>
          </InView>
        ))}
      </section>

      <section className="px-5 py-32 text-center sm:px-8 md:py-48">
        <InView>
          <p className="eyebrow text-muted">Nairobi, with an outrageous imagination</p>
          <h2 className="mt-6 font-display text-display">
            Welcome to <span className="italic">Ataya Signature.</span>
          </h2>
          <ButtonLink href="/flavours" className="mt-12">
            Choose your flavour
          </ButtonLink>
        </InView>
      </section>
    </div>
  );
}
