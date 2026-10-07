"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Wordmark from "@/components/ui/Wordmark";
import { useScoop } from "@/components/providers/ScoopProvider";
import { useExperience } from "@/components/providers/ExperienceProvider";
import SearchOverlay from "./SearchOverlay";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/collections", label: "Collections" },
  { href: "/dresses", label: "Dresses" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
];

const extra = [
  { href: "/lab", label: "The Flavour Lab" },
  { href: "/build", label: "Build Your Ataya" },
];

function SoundToggle() {
  const { soundOn, toggleSound } = useExperience();
  return (
    <button
      onClick={toggleSound}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Mute sound" : "Turn sound on"}
      className="flex items-center gap-1.5 rounded-full px-2 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] hover:opacity-70"
    >
      <span aria-hidden className="flex h-3 items-end gap-[2px]">
        {[0.5, 1, 0.7].map((h, i) => (
          <span
            key={i}
            className="w-[2px] origin-bottom rounded bg-current transition-transform duration-300"
            style={{ height: `${h * 100}%`, transform: soundOn ? "scaleY(1)" : "scaleY(0.25)" }}
          />
        ))}
      </span>
      <span className="hidden lg:inline">{soundOn ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { count, setOpen } = useScoop();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [bump, setBump] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close menu on navigation
  useEffect(() => setMenu(false), [pathname]);

  // A little bounce whenever something lands in the scoop
  useEffect(() => {
    if (!count) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- animation trigger
    setBump(true);
    const t = setTimeout(() => setBump(false), 500);
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/") || (href === "/collections" && pathname.startsWith("/flavours"));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <nav
          aria-label="Main"
          className={`mx-auto flex h-16 items-center justify-between px-4 transition-[background-color,border-color] duration-500 sm:px-8 ${
            scrolled
              ? "border-b border-line bg-[color-mix(in_srgb,var(--color-paper)_82%,transparent)] backdrop-blur-md"
              : "border-b border-transparent bg-[color-mix(in_srgb,var(--color-paper)_55%,transparent)] backdrop-blur-sm"
          }`}
        >
          <Link href="/" aria-label="Ataya Signature home" className="text-xl">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-7 lg:flex xl:gap-9">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active(l.href) ? "page" : undefined}
                  className="group relative text-[0.7rem] font-medium uppercase tracking-[0.24em]"
                >
                  {l.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-current transition-transform duration-500 ease-[var(--ease-silk)] ${
                      active(l.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setSearch(true)}
              className="hidden px-2 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] hover:opacity-70 lg:block"
            >
              Search
            </button>
            <div className="hidden lg:block">
              <SoundToggle />
            </div>
            <ThemeToggle />
            <button
              onClick={() => setMenu(true)}
              className="px-2 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
            >
              Menu
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-2 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] hover:opacity-70"
              aria-label={`Your scoop, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <span>Your Scoop</span>
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.62rem] tracking-normal text-paper transition-transform duration-300 ease-[var(--ease-scoop)] ${
                  bump ? "scale-125" : ""
                }`}
              >
                {count}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!menu}
        className="fixed inset-0 z-[60] flex flex-col bg-cream px-6 pb-10 pt-5 lg:hidden"
      >
        <div className="flex items-center justify-between">
          <Wordmark className="text-xl" />
          <button onClick={() => setMenu(false)} className="px-2 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em]" autoFocus>
            Close
          </button>
        </div>
        <ul className="mt-14 space-y-3">
          {[...links, ...extra].map((l, i) => (
            <li key={l.href} className="rise" style={{ animationDelay: `${i * 60}ms` }}>
              <Link href={l.href} className="font-display text-5xl leading-tight">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={() => {
              setMenu(false);
              setSearch(true);
            }}
            className="text-[0.72rem] font-semibold uppercase tracking-[0.22em]"
          >
            Search
          </button>
          <SoundToggle />
        </div>
      </div>

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}
