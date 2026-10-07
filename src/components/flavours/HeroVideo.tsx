"use client";

import { useEffect, useRef } from "react";

/**
 * The film behind a flavour hero. Silent, looping, fills the section.
 * If the visitor has "reduce motion" turned on, it stays on the still.
 */
export default function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // browsers only allow autoplay when the film is muted
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    v.play().catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
