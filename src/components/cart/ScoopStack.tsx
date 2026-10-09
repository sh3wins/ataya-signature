import Scoop from "@/components/art/Scoop";
import type { FlavourSlug } from "@/lib/flavours";

/** A cone with a scoop for every dress in your bag. */
export default function ScoopStack({ flavours, className = "" }: { flavours: FlavourSlug[]; className?: string }) {
  const shown = flavours.slice(0, 5);
  return (
    <div className={`relative mx-auto w-28 ${className}`} aria-hidden>
      <div className="relative flex flex-col-reverse items-center" style={{ paddingBottom: 70 }}>
        {shown.map((f, i) => (
          <Scoop
            key={`${f}-${i}`}
            flavour={f}
            rich={false}
            shadow={false}
            className="rise -mt-9 h-20 w-20 first:mt-0"
            style={{ animationDelay: `${i * 80}ms`, zIndex: 10 - i, transform: `rotate(${(i % 2 ? -1 : 1) * 4}deg)` }}
          />
        ))}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/scoops/cone-empty.webp" alt="" className="absolute bottom-0 left-1/2 h-28 w-auto -translate-x-1/2" />
    </div>
  );
}
