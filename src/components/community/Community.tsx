"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Scoop from "@/components/art/Scoop";
import { Button } from "@/components/ui/Button";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { flavours, type FlavourSlug } from "@/lib/flavours";
import {
  STORAGE_KEY,
  STUDIO_NAME,
  emptySaved,
  kindLabel,
  samplePosts,
  shrinkPhoto,
  type Comment,
  type Post,
  type PostKind,
  type ReactionId,
  type Saved,
} from "@/lib/community";
import PostCard, { Avatar, StudioBadge } from "./PostCard";
import {
  FruitDefs,
  FruitEffects,
  FruitPictures,
  type FruitFx,
} from "./FruitFace";
import Poll from "./Poll";

type Filter = "all" | "look" | "question" | "studio";
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "look", label: "Looks" },
  { id: "question", label: "Questions" },
  { id: "studio", label: "From the studio" },
];

const stamp = () => Date.now();
const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** THE PARLOUR — where the people who wear the dresses meet the people who make them. */
export default function Community({
  pictures = {},
  effects = {},
}: {
  pictures?: Partial<Record<ReactionId, string>>;
  effects?: Partial<Record<ReactionId, FruitFx>>;
}) {
  const { toast, play } = useExperience();
  const [saved, setSaved] = useState<Saved>(emptySaved);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(0);
  const [studioView, setStudioView] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  // composer
  const [text, setText] = useState("");
  const [kind, setKind] = useState<PostKind>("look");
  const [flavour, setFlavour] = useState<FlavourSlug | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Bring back what this visitor did last time
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring saved preview data
      if (raw) setSaved({ ...emptySaved, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  const update = (fn: (s: Saved) => Saved) => {
    setSaved((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // the browser is full: keep everything except the photos
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              ...next,
              posts: next.posts.map((p) => ({ ...p, image: undefined })),
            }),
          );
        } catch {}
      }
      return next;
    });
  };

  const name = studioView ? STUDIO_NAME : saved.name.trim();
  const canPost = Boolean(name);

  const posts = useMemo(() => {
    const all: Post[] = [...saved.posts, ...samplePosts]
      .filter((p) => !saved.removed.includes(p.id))
      .map((p) => ({ ...p, pinned: saved.pins[p.id] ?? p.pinned }));
    const shown = all.filter((p) =>
      filter === "all"
        ? true
        : filter === "studio"
          ? p.studio
          : p.kind === filter,
    );
    return [
      ...shown.filter((p) => p.pinned),
      ...shown.filter((p) => !p.pinned),
    ];
  }, [saved, filter]);

  const share = () => {
    const body = text.trim();
    if (!body || !canPost) return;
    const post: Post = {
      id: uid(),
      author: name,
      studio: studioView || undefined,
      kind: photo && kind === "note" ? "look" : kind,
      flavour: flavour ?? undefined,
      text: body,
      image: photo ?? undefined,
      reactions: {},
      comments: [],
      at: stamp(),
    };
    update((s) => ({ ...s, posts: [post, ...s.posts] }));
    setText("");
    setPhoto(null);
    setFlavour(null);
    setFilter("all");
    play("scoop");
    toast(studioView ? "Posted from the studio." : "Shared with the Parlour.");
  };

  const addPhoto = async (file?: File) => {
    if (!file) return;
    try {
      setPhoto(await shrinkPhoto(file));
      setKind("look");
    } catch {
      toast("We could not read that photo. Try another one.");
    }
  };

  const comment = (postId: string, body: string) => {
    const c: Comment = {
      id: uid(),
      author: name,
      studio: studioView || undefined,
      text: body,
      at: stamp(),
    };
    update((s) => ({
      ...s,
      comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), c] },
    }));
    play("tap");
  };

  // one fruit per person per post; picking the same one again takes it back
  const react = (postId: string, id: ReactionId) => {
    update((s) => {
      const reacted = { ...s.reacted };
      if (reacted[postId] === id) delete reacted[postId];
      else reacted[postId] = id;
      return { ...s, reacted };
    });
    play("tap");
  };

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSaved(emptySaved);
    setStudioView(false);
    toast("The preview is back to how it started.");
  };

  const chip = (on: boolean) =>
    `rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ${
      on ? "border-ink bg-ink text-paper" : "border-line hover:border-ink/50"
    }`;

  return (
    <FruitPictures.Provider value={pictures}>
      <FruitEffects.Provider value={effects}>
        <div className="relative pb-24 pt-28 md:pt-36">
          <FruitDefs />
          {/* Opening */}
          <header className="relative mx-auto max-w-[84rem] px-5 sm:px-8">
            <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="eyebrow rise text-muted">
                  The Ataya Signature community
                </p>
                <h1
                  className="rise mt-4 whitespace-nowrap font-display text-[clamp(3.2rem,10vw,9rem)] leading-[0.9]"
                  style={{ animationDelay: "80ms" }}
                >
                  The <span className="italic">Parlour</span>
                </h1>
                <p
                  className="rise mt-6 max-w-xl text-lg text-muted"
                  style={{ animationDelay: "160ms" }}
                >
                  Where the people who wear the dresses meet the people who make
                  them. Share your look, ask the studio anything, and help
                  decide what we make next.
                </p>
              </div>
              <div
                aria-hidden
                className="rise hidden items-end md:flex"
                style={{ animationDelay: "220ms" }}
              >
                <Scoop
                  flavour="strawberry"
                  rich={false}
                  shadow={false}
                  className="h-28 w-28 -rotate-12"
                />
                <Scoop
                  flavour="pistachio"
                  rich={false}
                  shadow={false}
                  className="-ml-8 h-36 w-36"
                />
                <Scoop
                  flavour="blueberry"
                  rich={false}
                  shadow={false}
                  className="-ml-8 h-24 w-24 rotate-12"
                />
              </div>
            </div>

            {/* Who you are right now */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
              <p className="flex items-center gap-2.5 text-sm">
                <Avatar name={name || "?"} studio={studioView} small />
                {studioView ? (
                  <span className="flex items-center gap-2">
                    You are the studio <StudioBadge />
                  </span>
                ) : (
                  <span className="text-muted">
                    {name
                      ? `You are here as ${name}`
                      : "You are here as a guest"}
                  </span>
                )}
              </p>
              <button
                onClick={() => setStudioView((v) => !v)}
                aria-pressed={studioView}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:border-ink/50"
              >
                {studioView ? "Back to guest view" : "Switch to studio view"}
              </button>
            </div>
          </header>

          <div className="mx-auto mt-10 grid max-w-[84rem] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0">
              {/* Share something */}
              <section
                aria-label="Share something"
                className="rounded-[var(--radius-soft)] bg-paper p-5 shadow-[var(--shadow-soft)] sm:p-7"
              >
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="What are you sharing?"
                >
                  {(Object.keys(kindLabel) as PostKind[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setKind(k)}
                      aria-pressed={kind === k}
                      className={chip(kind === k)}
                    >
                      {kindLabel[k]}
                    </button>
                  ))}
                </div>

                <label htmlFor="parlour-text" className="sr-only">
                  Your post
                </label>
                <textarea
                  id="parlour-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  maxLength={600}
                  placeholder={
                    studioView
                      ? "Tell them what is on the cutting table"
                      : kind === "question"
                        ? "Ask the studio anything: fit, fabric, delivery"
                        : kind === "look"
                          ? "Where did you wear it? How did it go?"
                          : "Say hello"
                  }
                  className="mt-4 w-full resize-none rounded-2xl border border-line bg-transparent p-4 text-[1.02rem] leading-relaxed placeholder:text-muted focus:border-ink focus:outline-none"
                />

                {photo && (
                  <div className="relative mt-3 w-fit">
                    {/* eslint-disable-next-line @next/next/no-img-element -- preview of the photo being added */}
                    <img
                      src={photo}
                      alt="The photo you are about to share"
                      className="max-h-56 rounded-2xl"
                    />
                    <button
                      onClick={() => setPhoto(null)}
                      className="absolute right-2 top-2 rounded-full bg-ink px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-paper"
                    >
                      Remove photo
                    </button>
                  </div>
                )}

                <div
                  className="mt-4 flex flex-wrap items-center gap-2"
                  role="group"
                  aria-label="Flavour (optional)"
                >
                  <span className="mr-1 text-xs uppercase tracking-[0.14em] text-muted">
                    Flavour
                  </span>
                  {flavours.map((f) => {
                    const on = flavour === f.slug;
                    return (
                      <button
                        key={f.slug}
                        onClick={() => setFlavour(on ? null : f.slug)}
                        aria-pressed={on}
                        className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-xs font-medium transition-colors ${on ? "border-ink" : "border-line hover:border-ink/50"}`}
                        style={
                          on
                            ? { background: f.colour, color: f.ink }
                            : undefined
                        }
                      >
                        <span
                          aria-hidden
                          className="h-5 w-5 rounded-full border border-ink/10"
                          style={{ background: f.scoop[1] }}
                        />
                        {f.name}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                  {!studioView && (
                    <>
                      <label htmlFor="parlour-name" className="sr-only">
                        Your name
                      </label>
                      <input
                        id="parlour-name"
                        value={saved.name}
                        onChange={(e) =>
                          update((s) => ({
                            ...s,
                            name: e.target.value.slice(0, 30),
                          }))
                        }
                        placeholder="Your name"
                        autoComplete="given-name"
                        className="w-40 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
                      />
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={(e) => {
                      addPhoto(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="rounded-full border border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] hover:border-ink/50"
                  >
                    {photo ? "Change photo" : "Add a photo"}
                  </button>
                  <Button
                    onClick={share}
                    disabled={!text.trim() || !canPost}
                    className="ml-auto"
                  >
                    {studioView ? "Post as the studio" : "Share"}
                  </Button>
                </div>
                {!canPost && text.trim() && (
                  <p className="mt-3 text-xs text-muted">
                    Add your name so people know who is talking.
                  </p>
                )}
              </section>

              {/* The feed */}
              <div
                className="mt-10 flex flex-wrap gap-2"
                role="group"
                aria-label="Show"
              >
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    aria-pressed={filter === f.id}
                    className={chip(filter === f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-6">
                {posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    comments={[...p.comments, ...(saved.comments[p.id] ?? [])]}
                    mine={saved.reacted[p.id] ?? null}
                    now={now}
                    studioView={studioView}
                    canComment={canPost}
                    onReact={(id) => react(p.id, id)}
                    onComment={(body) => comment(p.id, body)}
                    onPin={() =>
                      update((s) => ({
                        ...s,
                        pins: { ...s.pins, [p.id]: !p.pinned },
                      }))
                    }
                    onRemove={() => {
                      update((s) => ({ ...s, removed: [...s.removed, p.id] }));
                      toast("Post removed. Nobody else sees it any more.");
                    }}
                  />
                ))}
                {loaded && posts.length === 0 && (
                  <p className="rounded-[var(--radius-soft)] border border-dashed border-line p-10 text-center text-muted">
                    Nothing here yet. Be the first to share.
                  </p>
                )}
              </div>
            </div>

            {/* Beside the feed */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
              <Poll
                vote={saved.vote}
                showResults={studioView}
                onVote={(id) => {
                  update((s) => ({ ...s, vote: id }));
                  play("tap");
                }}
              />

              <section className="rounded-[var(--radius-soft)] bg-ink p-6 text-paper on-dark">
                <p className="eyebrow text-paper/50">A note from the studio</p>
                <p className="mt-3 font-display text-2xl leading-snug">
                  We read everything here.{" "}
                  <span className="italic">Really.</span>
                </p>
                <p className="mt-3 text-sm text-paper/70">
                  Questions about fit, fabric or delivery get an answer from us,
                  not a robot. Replies from us carry the Studio mark.
                </p>
              </section>

              <section className="rounded-[var(--radius-soft)] border border-line p-6">
                <p className="eyebrow text-muted">House rules</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>Be kind. Everyone here has good taste.</li>
                  <li>Share your own photos only.</li>
                  <li>No selling. That is our job.</li>
                </ul>
              </section>

              <p className="text-xs leading-relaxed text-muted">
                Preview: the posts shown are samples, and anything you add is
                kept on this device only.{" "}
                <button
                  onClick={reset}
                  className="underline underline-offset-2 hover:text-ink"
                >
                  Start the preview over
                </button>
              </p>
            </aside>
          </div>
        </div>
      </FruitEffects.Provider>
    </FruitPictures.Provider>
  );
}
