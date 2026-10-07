import type { FlavourSlug } from "./flavours";

/* ————————————————————————————————————————————————————————————
 * THE PARLOUR — the Ataya Signature community
 *
 * PREVIEW VERSION. Everything here is sample content so the section
 * can be seen and clicked through. New posts, comments, reactions and votes
 * are saved in the visitor's own browser only (see `STORAGE_KEY`).
 *
 * To make it real, swap the sample posts for a database and add
 * sign-in. The screens stay the same; only where the data comes from changes.
 * ———————————————————————————————————————————————————————————— */

export const STUDIO_NAME = "Ataya Signature";
export const STORAGE_KEY = "ataya-parlour-preview-v2";

/* ——— Reactions: fruit with feelings (drawn in components/community/FruitFace.tsx) ——— */
export type ReactionId = "strawberry" | "avocado" | "orange" | "blueberry" | "mango" | "apple";

/** `act` is the one-second performance it gives when picked (keyframes in globals.css) */
export const reactions: { id: ReactionId; name: string; means: string; act: string }[] = [
  { id: "strawberry", name: "Loving Strawberry", means: "Love it", act: "ff-love" },
  { id: "avocado", name: "Smiling Avocado", means: "Nice", act: "ff-happy" },
  { id: "orange", name: "Laughing Orange", means: "Ha!", act: "ff-laugh" },
  { id: "blueberry", name: "Shocked Blueberry", means: "Wow", act: "ff-shock" },
  { id: "mango", name: "Crying Mango", means: "Aww", act: "ff-cry" },
  { id: "apple", name: "Angry Apple", means: "Not happy", act: "ff-angry" },
];

export type Tally = Partial<Record<ReactionId, number>>;

export type PostKind = "look" | "question" | "note";

export interface Comment {
  id: string;
  author: string;
  /** written by the brand */
  studio?: boolean;
  text: string;
  /** sample content carries a fixed label; real content carries a time */
  ago?: string;
  at?: number;
}

export interface Post {
  id: string;
  author: string;
  studio?: boolean;
  kind: PostKind;
  flavour?: FlavourSlug;
  text: string;
  /** a dress from the shop, shown with the post */
  dress?: string;
  /** a photo added by the visitor (kept in their browser) */
  image?: string;
  /** how many people left each fruit */
  reactions: Tally;
  comments: Comment[];
  ago?: string;
  at?: number;
  pinned?: boolean;
}

export const kindLabel: Record<PostKind, string> = {
  look: "A look",
  question: "A question",
  note: "A note",
};

export const samplePosts: Post[] = [
  {
    id: "welcome",
    author: STUDIO_NAME,
    studio: true,
    kind: "note",
    pinned: true,
    text: "Welcome to the Parlour. This is where we show you what is on the cutting table before anyone else sees it, and where you tell us what you actually want to wear. First question from us: which flavour should we make next? The vote is open.",
    reactions: { strawberry: 29, avocado: 12, orange: 5, blueberry: 2 },
    ago: "2 d",
    comments: [
      { id: "welcome-1", author: "Njeri W.", text: "Raspberry ripple. It has to be raspberry ripple.", ago: "2 d" },
      { id: "welcome-2", author: STUDIO_NAME, studio: true, text: "Noted. Loudly.", ago: "1 d" },
    ],
  },
  {
    id: "look-strawberry",
    author: "Wanjiru K.",
    kind: "look",
    flavour: "strawberry",
    dress: "strawberry-swirl",
    text: "Wore the Strawberry Swirl to my sister's ruracio and three aunties asked where it is from. The bow survived the dancing.",
    reactions: { strawberry: 22, avocado: 6, blueberry: 3 },
    ago: "5 h",
    comments: [
      { id: "look-strawberry-1", author: STUDIO_NAME, studio: true, text: "The bow is built for dancing. You looked wonderful.", ago: "4 h" },
      { id: "look-strawberry-2", author: "Achieng O.", text: "Okay, now I need it.", ago: "3 h" },
    ],
  },
  {
    id: "question-vanilla",
    author: "Amina H.",
    kind: "question",
    flavour: "vanilla",
    text: "Would the Vanilla Bean Slip work for a beach wedding in Diani in December? I am worried about the heat.",
    reactions: { avocado: 4, strawberry: 2 },
    ago: "9 h",
    comments: [
      {
        id: "question-vanilla-1",
        author: STUDIO_NAME,
        studio: true,
        text: "Yes. It is washed silk charmeuse cut on the bias, so it stays light and moves in the heat. It runs true to size.",
        ago: "8 h",
      },
    ],
  },
  {
    id: "studio-table",
    author: STUDIO_NAME,
    studio: true,
    kind: "note",
    flavour: "blueberry",
    dress: "midnight-berry-gown",
    text: "On the cutting table this week: the Midnight Berry Gown. We are deciding how long the hem should fall. Would you wear it to the floor? Tell us.",
    reactions: { strawberry: 18, blueberry: 14, avocado: 8 },
    ago: "1 d",
    comments: [{ id: "studio-table-1", author: "Naserian L.", text: "To the floor, please.", ago: "20 h" }],
  },
  {
    id: "look-pistachio",
    author: "Zawadi M.",
    kind: "look",
    flavour: "pistachio",
    dress: "pistachio-crema-midi",
    text: "Pistachio for Sunday lunch at my mum's. She says green is my colour now, so that is decided.",
    reactions: { avocado: 15, strawberry: 6, orange: 1 },
    ago: "1 d",
    comments: [],
  },
  {
    id: "question-fit",
    author: "Achieng O.",
    kind: "question",
    text: "Do you do made-to-measure? I am between M and L in most things.",
    reactions: { avocado: 6, mango: 2, apple: 1 },
    ago: "2 d",
    comments: [],
  },
];

export interface PollOption {
  id: string;
  label: string;
  colour: string;
  votes: number;
}

export const poll = {
  question: "Which flavour should we make next?",
  options: [
    { id: "raspberry", label: "Raspberry Ripple", colour: "#E0668A", votes: 64 },
    { id: "coconut", label: "Toasted Coconut", colour: "#E9DCC3", votes: 41 },
    { id: "passion", label: "Passion Fruit", colour: "#E9A64F", votes: 37 },
    { id: "lemon", label: "Lemon Sorbet", colour: "#F3EA9C", votes: 22 },
  ] as PollOption[],
};

/** What the preview remembers in the visitor's browser */
export interface Saved {
  name: string;
  posts: Post[];
  comments: Record<string, Comment[]>;
  /** the fruit this visitor left on each post */
  reacted: Record<string, ReactionId>;
  vote: string | null;
  removed: string[];
  /** ids whose pinned state was changed in studio view */
  pins: Record<string, boolean>;
}

export const emptySaved: Saved = { name: "", posts: [], comments: {}, reacted: {}, vote: null, removed: [], pins: {} };

export function timeAgo(at: number, now: number): string {
  const mins = Math.max(0, Math.round((now - at) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

/** Shrinks a photo so it is quick to show and small enough to keep */
export function shrinkPhoto(file: File, max = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo"));
    };
    img.src = url;
  });
}
