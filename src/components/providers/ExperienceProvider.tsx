"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { sounds, type SoundName } from "@/lib/sound";

/* ——— Global experience state: sound, motion, toasts, easter eggs ——— */

interface ExperienceCtx {
  soundOn: boolean;
  toggleSound: () => void;
  play: (s: SoundName) => void;
  reducedMotion: boolean;
  toast: (message: string) => void;
  toastMessage: string | null;
  cherry: boolean;
  setCherry: (v: boolean) => void;
}

const Ctx = createContext<ExperienceCtx | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [soundOn, setSoundOn] = useState(false);
  const [reducedMotion, setReduced] = useState(false);
  const [toastMessage, setToast] = useState<string | null>(null);
  const [cherry, setCherry] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a saved preference
      if (localStorage.getItem("ataya-sound") === "on") setSoundOn(true);
    } catch {}
    // A little note for the curious
    console.log(
      "%cATAYA%c\nYou opened the kitchen door. Every dress has a taste.",
      "font: 32px serif; letter-spacing: .1em",
      "font: 12px sans-serif",
    );
    return () => mq.removeEventListener("change", update);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      try {
        localStorage.setItem("ataya-sound", next ? "on" : "off");
      } catch {}
      if (next) sounds.tap();
      return next;
    });
  }, []);

  const play = useCallback(
    (s: SoundName) => {
      if (soundOn) sounds[s]();
    },
    [soundOn],
  );

  const toast = useCallback((m: string) => {
    setToast(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  const value = useMemo(
    () => ({ soundOn, toggleSound, play, reducedMotion, toast, toastMessage, cherry, setCherry }),
    [soundOn, toggleSound, play, reducedMotion, toast, toastMessage, cherry],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExperience() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useExperience must be used inside ExperienceProvider");
  return c;
}
