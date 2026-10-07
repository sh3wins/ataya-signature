"use client";

import { useState } from "react";
import DressArt from "@/components/art/DressArt";
import Scoop from "@/components/art/Scoop";
import { Button, ButtonLink } from "@/components/ui/Button";
import { flavours, flavourMap, flavourVars, type FlavourSlug } from "@/lib/flavours";
import { matchProduct, moods, type BuildChoice } from "@/lib/lab";
import { formatKES, type Detail, type Mood, type Silhouette } from "@/lib/products";
import { useExperience } from "@/components/providers/ExperienceProvider";

const silhouettes: { id: Silhouette; label: string }[] = [
  { id: "mini", label: "Mini" },
  { id: "midi", label: "Midi" },
  { id: "maxi", label: "Maxi" },
  { id: "column", label: "Column" },
  { id: "slip", label: "Slip" },
  { id: "tiered", label: "Tiered" },
  { id: "wrap", label: "Wrap" },
];
const details: { id: Detail; label: string }[] = [
  { id: "bow", label: "Bow" },
  { id: "ruffle", label: "Ruffle" },
  { id: "pleat", label: "Pleats" },
  { id: "drape", label: "Drape" },
  { id: "none", label: "Nothing. Clean." },
];
const moodTone: Record<Mood, 0 | 1 | 2 | 3> = { dreamy: 1, bold: 2, sultry: 2, playful: 3, calm: 0 };

const moodLight: Record<Mood, string> = {
  dreamy: "radial-gradient(60% 50% at 50% 30%, rgba(255,255,255,0.55), transparent 70%)",
  bold: "radial-gradient(70% 60% at 50% 45%, transparent 55%, rgba(0,0,0,0.22))",
  sultry: "linear-gradient(180deg, rgba(20,8,6,0.05), rgba(20,8,6,0.38))",
  playful: "radial-gradient(30% 25% at 20% 20%, rgba(255,255,255,0.45), transparent 70%), radial-gradient(25% 20% at 85% 70%, rgba(255,255,255,0.35), transparent 70%)",
  calm: "linear-gradient(180deg, rgba(255,255,255,0.12), transparent)",
};

const steps = ["Flavour", "Silhouette", "Detail", "Mood"] as const;

/** BUILD YOUR ATAYA — a visual styling game, not a form. */
export default function BuildYourAtaya() {
  const [step, setStep] = useState(0);
  const [c, setC] = useState<BuildChoice>({ flavour: "strawberry", silhouette: "midi", detail: "bow", mood: "dreamy" });
  const [done, setDone] = useState(false);
  const { play } = useExperience();
  const f = flavourMap[c.flavour];
  const match = matchProduct(c);
  const dark = Boolean(f.dark);

  const pick = <K extends keyof BuildChoice>(k: K, v: BuildChoice[K]) => {
    setC((prev) => ({ ...prev, [k]: v }));
    play("tap");
  };

  const card = (on: boolean) =>
    `group flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-300 hover:-translate-y-1 ${
      on ? "border-current bg-white/40 shadow-[var(--shadow-soft)]" : "border-transparent hover:border-current/20"
    }`;

  return (
    <section
      className={`relative min-h-dvh px-4 pb-20 pt-28 transition-colors duration-700 sm:px-8 ${dark ? "on-dark" : ""}`}
      style={{ ...flavourVars(f), background: f.colour, color: f.ink }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.1fr]">
        {/* live preview */}
        <div className="relative lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)]">
          <div className="relative grid h-[58vh] place-items-center overflow-hidden rounded-[var(--radius-soft)] lg:h-full" style={{ background: `linear-gradient(170deg, ${f.cream}, ${f.colour})` }}>
            <div aria-hidden className="absolute left-1/2 top-[12%] h-[85%] w-[60%] -translate-x-1/2 rounded-t-full" style={{ background: f.colour, opacity: 0.5 }} />
            {/* the mood changes the light in the room */}
            <div
              aria-hidden
              className="absolute inset-0 transition-[background] duration-700"
              style={{ background: moodLight[c.mood] }}
            />
            <DressArt
              key={`${c.silhouette}-${c.detail}-${c.flavour}-${c.mood}`}
              flavour={c.flavour}
              silhouette={c.silhouette}
              detail={c.detail}
              tone={moodTone[c.mood]}
              title="Your Ataya preview"
              className="rise relative h-[90%] w-auto"
            />
            <p className="absolute bottom-4 left-4 rounded-full bg-paper/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink">
              {f.name} · {c.silhouette} · {c.detail === "none" ? "clean" : c.detail} · {c.mood}
            </p>
          </div>
        </div>

        <div>
          <p className="eyebrow opacity-70">Styling studio</p>
          <h1 className="mt-3 font-display text-headline">
            Build your <span className="italic">Ataya</span>
          </h1>

          {!done ? (
            <>
              <ol className="mt-8 flex gap-2" aria-label="Steps">
                {steps.map((s, i) => (
                  <li key={s}>
                    <button
                      onClick={() => setStep(i)}
                      aria-current={step === i ? "step" : undefined}
                      className={`rounded-full border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${
                        step === i ? "border-current bg-current/10" : "border-current/25 opacity-70"
                      }`}
                    >
                      {i + 1}. {s}
                    </button>
                  </li>
                ))}
              </ol>

              <div className="mt-10 min-h-[22rem]">
                {step === 0 && (
                  <div className="rise">
                    <h2 className="font-display text-3xl">Pick a flavour</h2>
                    <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {flavours.map((fl) => (
                        <button key={fl.slug} onClick={() => pick("flavour", fl.slug as FlavourSlug)} aria-pressed={c.flavour === fl.slug} className={card(c.flavour === fl.slug)}>
                          <Scoop flavour={fl.slug} rich={false} className="h-16 w-16 transition-transform group-hover:animate-[jiggle_0.8s]" />
                          <span className="eyebrow">{fl.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div className="rise">
                    <h2 className="font-display text-3xl">Choose a silhouette</h2>
                    <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {silhouettes.map((s) => (
                        <button key={s.id} onClick={() => pick("silhouette", s.id)} aria-pressed={c.silhouette === s.id} className={card(c.silhouette === s.id)}>
                          <DressArt flavour={c.flavour} silhouette={s.id} detail="none" sway={false} shadow={false} className="h-24 w-auto" />
                          <span className="eyebrow">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="rise">
                    <h2 className="font-display text-3xl">Add a detail</h2>
                    <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {details.map((d) => (
                        <button key={d.id} onClick={() => pick("detail", d.id)} aria-pressed={c.detail === d.id} className={card(c.detail === d.id)}>
                          <DressArt flavour={c.flavour} silhouette={c.silhouette} detail={d.id} sway={false} shadow={false} className="h-24 w-auto" viewBox="40 0 220 320" />
                          <span className="eyebrow text-center">{d.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="rise">
                    <h2 className="font-display text-3xl">Set the mood</h2>
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      {moods.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => pick("mood", m.id)}
                          aria-pressed={c.mood === m.id}
                          className={`rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                            c.mood === m.id ? "border-current bg-white/40" : "border-current/20"
                          }`}
                        >
                          <span className="block font-display text-2xl italic">{m.label}</span>
                          <span className="mt-1 block text-sm opacity-75">{m.line}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)}>Next: {steps[step + 1]}</Button>
                ) : (
                  <Button
                    onClick={() => {
                      setDone(true);
                      play("scoop");
                    }}
                  >
                    Reveal my Ataya
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="rise mt-10">
              <h2 className="font-display text-headline">
                Your <span className="italic">Ataya</span>
              </h2>
              <p className="mt-4 font-display text-3xl italic opacity-90">
                A {c.mood} {c.silhouette} in {f.name.toLowerCase()}
                {c.detail !== "none" ? `, with a ${c.detail === "pleat" ? "pleated" : c.detail} finish` : ""}.
              </p>
              <div className="mt-8 rounded-[var(--radius-soft)] bg-paper p-6 text-ink shadow-[var(--shadow-soft)]">
                <p className="eyebrow text-muted">Closest in the freezer</p>
                <div className="mt-3 flex items-center gap-5">
                  <div className="grid h-32 w-24 shrink-0 place-items-center rounded-xl" style={{ background: flavourMap[match.flavour].colour }}>
                    <DressArt flavour={match.flavour} silhouette={match.silhouette} detail={match.detail} tone={match.tone} shadow={false} className="h-28 w-auto" />
                  </div>
                  <div>
                    <p className="font-display text-3xl">{match.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {flavourMap[match.flavour].name} · {match.silhouette} · {formatKES(match.price)}
                    </p>
                    <ButtonLink href={`/dresses/${match.slug}`} className="mt-4">
                      See this dress
                    </ButtonLink>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setDone(false);
                  setStep(0);
                }}
                className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] underline underline-offset-4"
              >
                Start again
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
