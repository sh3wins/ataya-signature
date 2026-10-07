"use client";

import { poll } from "@/lib/community";

/** "Which flavour next?" — one vote each; results show once you have voted. */
export default function Poll({ vote, onVote, showResults }: { vote: string | null; onVote: (id: string) => void; showResults: boolean }) {
  const total = poll.options.reduce((n, o) => n + o.votes, 0) + (vote ? 1 : 0);
  const open = showResults || Boolean(vote);
  return (
    <section aria-labelledby="poll-title" className="rounded-[var(--radius-soft)] bg-paper p-6 shadow-[var(--shadow-soft)]">
      <p className="eyebrow text-muted">The vote</p>
      <h2 id="poll-title" className="mt-3 font-display text-3xl leading-[1.05]">
        {poll.question}
      </h2>
      <ul className="mt-5 space-y-2.5">
        {poll.options.map((o) => {
          const votes = o.votes + (vote === o.id ? 1 : 0);
          const pct = Math.round((votes / total) * 100);
          const mine = vote === o.id;
          return (
            <li key={o.id}>
              <button
                onClick={() => onVote(o.id)}
                aria-pressed={mine}
                className={`relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-full border px-4 py-3 text-left text-sm transition-colors duration-300 ${
                  mine ? "border-ink" : "border-line hover:border-ink/50"
                }`}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-[var(--ease-silk)]"
                  style={{ width: open ? `${Math.max(pct, 6)}%` : "0%", background: o.colour, opacity: 0.75 }}
                />
                <span className="relative flex items-center gap-2.5 font-medium">
                  <span aria-hidden className="h-3 w-3 rounded-full border border-ink/15" style={{ background: o.colour }} />
                  {o.label}
                </span>
                <span className="relative text-xs tabular-nums text-muted">{open ? `${pct}%` : mine ? "Your vote" : ""}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted" aria-live="polite">
        {vote ? `Thank you. ${total} votes so far. You can change yours.` : "Tap a flavour to vote."}
      </p>
    </section>
  );
}
