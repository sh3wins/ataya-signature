"use client";

import Link from "next/link";
import { useState } from "react";
import Wordmark from "@/components/ui/Wordmark";
import { flavours } from "@/lib/flavours";
import { useExperience } from "@/components/providers/ExperienceProvider";

/** The footer hides a cherry. Click it. */
function Cherry() {
  const { setCherry, cherry, toast, play } = useExperience();
  const [dropped, setDropped] = useState(false);
  return (
    <button
      onClick={() => {
        setDropped(true);
        play("drip");
        setCherry(!cherry);
        toast(cherry ? "Cherry returned. Back to basics." : "You found the cherry on top. It's yours for the rest of your visit.");
        setTimeout(() => setDropped(false), 900);
      }}
      aria-label="A tiny cherry"
      className={`inline-block align-top transition-transform duration-700 ease-[var(--ease-scoop)] ${dropped ? "translate-y-3 rotate-12" : "hover:-rotate-12"}`}
    >
      <svg viewBox="0 0 20 24" className="h-4 w-3.5">
        <path d="M10 10 C 10 5 12 2 16 1" stroke="#3F5B24" strokeWidth="1.6" fill="none" />
        <circle cx="9" cy="16" r="7" fill="#B3122B" />
        <circle cx="6.5" cy="13.5" r="2" fill="#fff" opacity=".6" />
      </svg>
    </button>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-paper on-dark">
      {/* melting top edge */}
      <svg aria-hidden viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute -top-px left-0 h-10 w-full rotate-180 text-[var(--page-bg)]">
        <path
          fill="currentColor"
          d="M0 60V20 C46 20 58 50 84 50 C110 50 100 24 150 24 C178 24 190 32 204 32 C218 32 208 16 255 16 C280 16 292 58 326 58 C360 58 350 22 406 22 C440 22 452 36 470 36 C488 36 478 26 544 26 C588 26 600 54 640 54 C680 54 670 14 716 14 C740 14 752 30 766 30 C780 30 770 20 813 20 C834 20 846 46 868 46 C890 46 880 24 942 24 C982 24 994 58 1030 58 C1066 58 1056 16 1108 16 C1138 16 1150 34 1166 34 C1182 34 1172 22 1219 22 C1244 22 1256 52 1284 52 C1312 52 1302 18 1348 18 C1372 18 1384 34 1396 34 C1408 34 1398 24 1440 24 V60Z"
        />
      </svg>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-10 pt-24 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-4xl">
            <Wordmark /> <Cherry />
          </p>
          <p className="mt-6 max-w-xs text-sm text-paper/60">Clothes with a taste. Designed in Nairobi, made to be noticed.</p>
        </div>
        <div>
          <p className="eyebrow text-paper/50">Ice Cream Collection</p>
          <ul className="mt-4 space-y-2 text-sm">
            {flavours.map((f) => (
              <li key={f.slug}>
                <Link href={`/flavours/${f.slug}`} className="hover:underline">
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-paper/50">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/collections" className="hover:underline">Collections</Link></li>
            <li><Link href="/dresses" className="hover:underline">Shop everything</Link></li>
            <li><Link href="/lookbook" className="hover:underline">Lookbook</Link></li>
            <li><Link href="/community" className="hover:underline">The Parlour (community)</Link></li>
            <li><Link href="/lab" className="hover:underline">The Flavour Lab</Link></li>
            <li><Link href="/build" className="hover:underline">Build your Ataya</Link></li>
            <li><Link href="/about" className="hover:underline">About</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-paper/50">Help</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/scoop" className="hover:underline">Your scoop</Link></li>
            <li><span className="text-paper/60">Worldwide delivery</span></li>
            <li><span className="text-paper/60">Free returns within 48 hours</span></li>
            <li><a href="mailto:hello@ataya.example" className="hover:underline">hello@ataya.example</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl justify-between border-t border-paper/15 px-5 py-6 text-xs text-paper/50 sm:px-8">
        <span>© {new Date().getFullYear()} Ataya Signature</span>
        <span>Keep it cold.</span>
      </div>
    </footer>
  );
}
