"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DressArt from "@/components/art/DressArt";
import { flavourMap } from "@/lib/flavours";
import { getProduct } from "@/lib/products";
import { STUDIO_NAME, kindLabel, reactions, timeAgo, type Comment, type Post, type ReactionId } from "@/lib/community";
import FruitFace, { FruitAct } from "./FruitFace";

export function Avatar({ name, studio, colour, small }: { name: string; studio?: boolean; colour?: string; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full font-display ${small ? "h-8 w-8 text-sm" : "h-11 w-11 text-lg"} ${
        studio ? "bg-ink text-paper" : "text-ink"
      }`}
      style={studio ? undefined : { background: colour ?? "var(--fl-vanilla)" }}
    >
      {studio ? "A" : name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function StudioBadge() {
  return <span className="rounded-full bg-ink px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-paper">Studio</span>;
}

function when(item: { ago?: string; at?: number }, now: number) {
  return item.ago ?? (item.at ? timeAgo(item.at, now) : "");
}

export default function PostCard({
  post,
  comments,
  mine,
  now,
  studioView,
  canComment,
  onReact,
  onComment,
  onPin,
  onRemove,
}: {
  post: Post;
  comments: Comment[];
  mine: ReactionId | null;
  now: number;
  studioView: boolean;
  canComment: boolean;
  onReact: (id: ReactionId) => void;
  onComment: (text: string) => void;
  onPin: () => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(comments.length > 0 && comments.length <= 2);
  const f = post.flavour ? flavourMap[post.flavour] : undefined;
  const dress = post.dress ? getProduct(post.dress) : undefined;
  const dressFlavour = dress ? flavourMap[dress.flavour] : undefined;
  const [picker, setPicker] = useState(false);
  const [hint, setHint] = useState<ReactionId | null>(null);
  const [popped, setPopped] = useState<ReactionId | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // close the fruit bowl when clicking away or pressing Escape
  useEffect(() => {
    if (!picker) return;
    const away = (e: PointerEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setPicker(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicker(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [picker]);

  const tally = reactions
    .map((r) => ({ ...r, count: (post.reactions[r.id] ?? 0) + (mine === r.id ? 1 : 0) }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  // the fruit currently giving its one-second performance
  const [acting, setActing] = useState<ReactionId | null>(null);
  const actTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(actTimer.current), []);

  const choose = (id: ReactionId) => {
    const adding = mine !== id;
    onReact(id);
    setPicker(false);
    setHint(null);
    clearTimeout(actTimer.current);
    if (!adding) return setActing(null);
    // restart cleanly if they pick another one straight away
    setActing(null);
    requestAnimationFrame(() => setActing(id));
    setPopped(id);
    actTimer.current = setTimeout(() => {
      setActing(null);
      setPopped(null);
    }, 1550);
  };
  const actingNow = reactions.find((r) => r.id === acting);
  const hinted = reactions.find((r) => r.id === hint);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onComment(text);
    setDraft("");
    setOpen(true);
  };

  return (
    <article
      aria-label={`${kindLabel[post.kind]} from ${post.author}`}
      className={`rounded-[var(--radius-soft)] bg-paper p-5 shadow-[var(--shadow-soft)] sm:p-7 ${post.studio ? "ring-1 ring-ink/10" : ""}`}
    >
      <header className="flex items-start gap-3">
        <Avatar name={post.author} studio={post.studio} colour={f?.colour} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
            {post.author}
            {post.studio && <StudioBadge />}
          </p>
          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted">
            {kindLabel[post.kind]} · {when(post, now)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {post.pinned && <span className="rounded-full border border-line px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em]">Pinned</span>}
          {f && (
            <Link
              href={`/flavours/${f.slug}`}
              className="rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] hover:brightness-95"
              style={{ background: f.colour, color: f.ink }}
            >
              {f.name}
            </Link>
          )}
        </div>
      </header>

      <p className={`mt-4 ${post.kind === "question" ? "font-display text-2xl leading-snug sm:text-[1.7rem]" : "text-[1.02rem] leading-relaxed"}`}>{post.text}</p>

      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element -- a photo the visitor just added, kept in their browser
        <img src={post.image} alt={`Photo shared by ${post.author}`} className="mt-5 max-h-[34rem] w-full rounded-2xl object-cover" />
      )}

      {dress && dressFlavour && (
        <Link
          href={`/dresses/${dress.slug}`}
          className="group mt-5 flex items-center gap-4 overflow-hidden rounded-2xl p-3 pr-5 transition-transform duration-500 ease-[var(--ease-silk)] hover:-translate-y-0.5"
          style={{ background: dressFlavour.colour, color: dressFlavour.ink }}
        >
          <span className="grid h-28 w-24 shrink-0 place-items-center rounded-xl" style={{ background: dressFlavour.cream }}>
            <DressArt flavour={dress.flavour} silhouette={dress.silhouette} detail={dress.detail} tone={dress.tone} sway={false} shadow={false} className="h-[92%] w-auto" />
          </span>
          <span className="min-w-0">
            <span className="eyebrow block opacity-70">{post.studio ? "On the table" : "Wearing"}</span>
            <span className="mt-1 block font-display text-2xl leading-tight group-hover:underline group-hover:underline-offset-4">{dress.name}</span>
            <span className="mt-1 block text-xs uppercase tracking-[0.16em] opacity-70">See the dress →</span>
          </span>
        </Link>
      )}

      <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-sm">
        {actingNow && (
          <span className="pointer-events-none absolute bottom-[calc(100%-0.5rem)] left-2 z-20 block h-28 w-28 origin-bottom sm:h-32 sm:w-32" style={{ animation: "ff-stage 1.55s var(--ease-scoop) both" }}>
            <FruitAct id={actingNow.id} act={actingNow.act} className="h-full w-full" />
          </span>
        )}
        {/* fruit already left on this post */}
        {tally.map((r) => (
          <button
            key={r.id}
            onClick={() => choose(r.id)}
            aria-pressed={mine === r.id}
            aria-label={`${r.name}, ${r.count}. ${mine === r.id ? "Take yours back" : "Add yours"}`}
            title={r.name}
            className={`flex items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-3 transition-[transform,border-color,background-color] duration-200 active:scale-95 ${
              mine === r.id ? "border-ink bg-ink/[0.06]" : "border-line hover:border-ink/50"
            }`}
          >
            <FruitFace id={r.id} className={`h-7 w-7 ${popped === r.id ? "animate-[jiggle_0.9s_var(--ease-melt)]" : ""}`} />
            <span className="tabular-nums">{r.count}</span>
          </button>
        ))}

        {/* the fruit bowl */}
        <div ref={pickerRef} className="relative">
          <button
            onClick={() => setPicker((v) => !v)}
            aria-expanded={picker}
            aria-haspopup="true"
            className="flex items-center gap-2 rounded-full border border-line px-3.5 py-2 hover:border-ink/50"
          >
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="10" cy="10" r="8" />
              <path d="M6.6 11.8c1.800 2.400 5 2.400 6.800 0M7.3 7.8h.01M12.7 7.8h.01" />
            </svg>
            {mine ? "Change" : "React"}
          </button>
          {picker && (
            <div
              role="group"
              aria-label="Pick a fruit"
              className="absolute bottom-[calc(100%+0.6rem)] left-0 z-10 w-max max-w-[calc(100vw-3.5rem)] rounded-[1.6rem] border border-line bg-paper p-2 shadow-[var(--shadow-float)]"
            >
              <div className="flex">
                {reactions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => choose(r.id)}
                    onPointerEnter={() => setHint(r.id)}
                    onPointerLeave={() => setHint(null)}
                    onFocus={() => setHint(r.id)}
                    onBlur={() => setHint(null)}
                    aria-pressed={mine === r.id}
                    aria-label={`${r.name}: ${r.means}`}
                    className={`rounded-2xl p-1.5 transition-transform duration-200 ease-[var(--ease-scoop)] hover:-translate-y-1.5 hover:scale-125 focus-visible:-translate-y-1.5 focus-visible:scale-125 ${
                      mine === r.id ? "bg-ink/[0.08]" : ""
                    }`}
                  >
                    <span className="block" style={hint === r.id ? { animation: `${r.act} 1s var(--ease-melt) infinite` } : undefined}>
                      <FruitFace id={r.id} className="h-10 w-10 sm:h-11 sm:w-11" />
                    </span>
                  </button>
                ))}
              </div>
              <p className="px-2 pb-1 pt-1.5 text-center text-xs text-muted" aria-hidden>
                {hinted ? `${hinted.name} · ${hinted.means}` : "How does this taste?"}
              </p>
            </div>
          )}
        </div>
        <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="rounded-full border border-line px-3.5 py-2 hover:border-ink/50">
          {comments.length === 0 ? "Reply" : `${comments.length} ${comments.length === 1 ? "reply" : "replies"}`}
        </button>
        {studioView && (
          <span className="ml-auto flex gap-2 text-xs">
            <button onClick={onPin} className="rounded-full border border-line px-3 py-2 uppercase tracking-[0.14em] hover:border-ink/50">
              {post.pinned ? "Unpin" : "Pin"}
            </button>
            <button onClick={onRemove} className="rounded-full border border-cherry/40 px-3 py-2 uppercase tracking-[0.14em] text-cherry hover:bg-cherry hover:text-paper">
              Remove
            </button>
          </span>
        )}
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className={`flex gap-3 rounded-2xl p-3 ${c.studio ? "bg-ink/[0.05]" : ""}`}>
              <Avatar name={c.author} studio={c.studio} small />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
                  {c.author}
                  {c.studio && <StudioBadge />}
                  <span className="text-xs font-normal text-muted">{when(c, now)}</span>
                </p>
                <p className="mt-1 text-[0.95rem] leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <label className="sr-only" htmlFor={`reply-${post.id}`}>
              Reply to {post.author}
            </label>
            <input
              id={`reply-${post.id}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={400}
              placeholder={studioView ? `Reply as ${STUDIO_NAME}` : canComment ? "Write a reply" : "Add your name above to reply"}
              disabled={!canComment}
              className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm placeholder:text-muted focus:border-ink focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!canComment || !draft.trim()}
              className="rounded-full bg-ink px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-paper transition-opacity disabled:opacity-35"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
