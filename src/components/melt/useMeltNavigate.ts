"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { playMelt } from "./playMelt";
import { useExperience } from "@/components/providers/ExperienceProvider";
import type { FlavourSlug } from "@/lib/flavours";

/** Navigate to another page through the melt: melt → route change → reveal. */
export function useMeltNavigate() {
  const router = useRouter();
  const { reducedMotion, play } = useExperience();

  return useCallback(
    (flavour: FlavourSlug, href: string, from?: Element | null) => {
      play("scoop");
      setTimeout(() => play("melt"), 300);
      return playMelt({
        flavour,
        from,
        reducedMotion,
        tempo: 1.5,
        onCovered: () =>
          new Promise<void>((resolve) => {
            router.push(href);
            const start = performance.now();
            const check = () => {
              if (window.location.pathname === href || performance.now() - start > 4000) {
                window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
                setTimeout(resolve, 120);
              } else requestAnimationFrame(check);
            };
            check();
          }),
      });
    },
    [router, reducedMotion, play],
  );
}
