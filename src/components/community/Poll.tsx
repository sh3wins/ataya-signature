"use client";

import { poll } from "@/lib/community";

/** "Which flavour next?" — one vote each; results show once you have voted. */
export default function Poll({ vote, onVote, showResults }: { vote: string | null; onVote: (id: string) => void; showResults: boolean }) {
  const total = poll.options.reduce((n, o) => n + o.votes, 0) + (vote ? 1 : 0);
  const open = showResults || Boolean(vote);
  const leader = [...poll.options].sort((x, y) => y.votes + (vote === y.id ? 1 : 0) - (x.votes + (vote === x.id ? 1 : 0)))[0];
  return (
    <section aria-labelledby="poll-title" className="lux-card relative overflow-hidden rounded-[var(--radius-soft)] border border-line bg-paper p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">The vote</p>
        <span className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted">
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-cherry" /> Open
        </span>
      </div>
      <h2 id="poll-title" className="mt-4 font-display text-[2rem] leading-[1.05]">
        {poll.question}
      </h2>
      <ul className="mt-6 space-y-1">
        {poll.options.map((o, i) => {
          const votes = o.votes + (vote === o.id ? 1 : 0);
          const pct = Math.round((votes / total) * 100);
          const mine = vote === o.id;
          return (
            <li key={o.id}>
              <button
                onClick={() => onVote(o.id)}
                aria-pressed={mine}
                className={`group w-full rounded-xl px-3 py-3 text-left transition-colors duration-300 ${mine ? "bg-ink/[0.05]" : "hover:bg-ink/[0.03]"}`}
              >
                <span className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-3 font-medium">
                    <span className="w-4 text-[0.65rem] tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span aria-hidden className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/10" style={{ background: o.colour }} />
                    {o.label}
                    {mine && <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted">· Your vote</span>}
                  </span>
                  <span className="font-display text-lg tabular-nums">{open ? `${pct}%` : ""}</span>
                </span>
                {/* a fine result line under each option */}
                <span aria-hidden className="mt-2.5 block h-[3px] overflow-hidden rounded-full bg-ink/[0.07]">
                  <span
                    className="block h-full rounded-full transition-[width] duration-1000 ease-[var(--ease-silk)]"
                    style={{ width: open ? `${Math.max(pct, 3)}%` : "0%", background: o.colour }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 border-t border-line pt-4 text-xs text-muted" aria-live="polite">
        {vote
          ? `Thank you. ${total} votes so far, ${leader.label} is leading. You can change yours.`
          : "Tap a flavour to vote. Results show once you have voted."}
      </p>
    </section>
  );
}
