"use client";

import { useEffect, useState } from "react";

/** Switches between Daylight (light) and Midnight (dark), and remembers the choice. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the look chosen before the page loaded
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("ataya-theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to Daylight, the light look" : "Switch to Midnight, the dark look"}
      className={`flex items-center gap-1.5 rounded-full px-2 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] hover:opacity-70 ${className}`}
    >
      <svg aria-hidden viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        {dark ? (
          <>
            <circle cx="10" cy="10" r="3.6" />
            <path d="M10 1.6v2M10 16.4v2M1.6 10h2M16.4 10h2M4 4l1.4 1.4M14.6 14.6 16 16M4 16l1.4-1.4M14.6 5.4 16 4" />
          </>
        ) : (
          <path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z" strokeLinejoin="round" />
        )}
      </svg>
      <span className="hidden xl:inline">{dark ? "Daylight" : "Midnight"}</span>
    </button>
  );
}
