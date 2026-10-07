"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";

export default function Toast() {
  const { toastMessage } = useExperience();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
      {toastMessage && (
        <p className="rise rounded-full bg-ink px-5 py-3 text-sm text-paper shadow-[var(--shadow-soft)]">{toastMessage}</p>
      )}
    </div>
  );
}
