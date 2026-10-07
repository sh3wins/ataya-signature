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
      <svg viewBox="0 0 80 100" className="absolute bottom-0 left-1/2 h-24 w-20 -translate-x-1/2">
        <defs>
          <pattern id="waffle" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="10" fill="#D9A864" />
            <path d="M0 0 H10 M0 0 V10" stroke="#B07E3E" strokeWidth="1.6" />
          </pattern>
        </defs>
        <path d="M 4 4 L 76 4 L 42 98 Q 40 100 38 98 Z" fill="url(#waffle)" />
        <path d="M 4 4 L 76 4 L 42 98 Q 40 100 38 98 Z" fill="none" stroke="#9A6A30" strokeOpacity=".4" />
      </svg>
    </div>
  );
}
