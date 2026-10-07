# ATAYA SIGNATURE — every dress has a taste

An immersive fashion site where the ice cream melts and reveals the dresses.
Built with Next.js, React, Tailwind CSS and GSAP.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Where things live

| What | File |
| --- | --- |
| Flavours (colours, taglines, hero dress) | `src/lib/flavours.ts` |
| Dresses, skirts and tops (name, price in KES, sizes, stock) | `src/lib/products.ts` |
| Flavour Lab mixes + Build Your Ataya matching | `src/lib/lab.ts` |
| Design tokens (colours, type, easing) | `src/app/globals.css` |
| The melt (soft liquid, WebGL) | `src/lib/liquid.ts` + `src/components/melt/playMelt.ts` |
| How each flavour melts (speed, gloss, drips…) | `melt` in `src/lib/flavours.ts` |
| Flavour rooms (light, details) | `src/components/art/FlavourWorld.tsx` |
| Opening scoop + dress reveal | `src/components/home/` |
| Cart ("Your Scoop") | `src/components/providers/ScoopProvider.tsx`, `src/components/cart/` |

## Light and dark

The site has two looks: Daylight (light) and Midnight (dark). The sun / moon button in the
menu bar switches between them and remembers the choice. Light is the default.

All the colours for both looks are at the top of `src/app/globals.css`, including four surface
colours per flavour. The ice cream, the dresses and the fruit keep their true colours in both.
To make dark the default, change the small script in `src/app/layout.tsx`.

## Collections

Ataya Signature is the house; each collection is a room in it. Ice Cream is the first.
The list lives in `src/lib/collections.ts` and shows on `/collections`.

- To announce a collection, add it with `status: "soon"`. It appears as a "coming soon" card.
- To open it, build its pages, then set `status: "open"` and its `href`.
- Flavours and dresses carry the name of the collection they belong to (Ice Cream, for now).

## Dresses, skirts and tops

Every piece is in `src/lib/products.ts`. A piece is a dress unless it says `category: "skirt"`
or `category: "top"`. The Shop page has a filter for each. Skirts and tops get their own drawing
until real photos are added.

## Add a new flavour

Add one object to `flavours` in `src/lib/flavours.ts` and give it a few dresses in
`src/lib/products.ts`. It shows up everywhere: entrance, flavours, collections, lab, builder.

## How the melt works

It behaves like a real scoop on a warm day:

1. The scoop softens and starts to sag.
2. Melt runs down the cone in uneven streaks, slow at first.
3. The streaks meet at the tip and pour off in one thin thread.
4. A puddle lands, spreads sideways, then rises until it covers the screen.
5. Underneath, the dress is already there. The ice cream opens over the dress first,
   then the whole layer slides down and off. Strands stretch from the top, let go one
   by one and shrink back into drips before fading into the page.

- It always starts from the scoop you clicked.
- Mark any element with `data-melt-focus` and the reveal opens there.
- Each flavour melts differently: change `melt` in `src/lib/flavours.ts` (speed, gloss, thickness, number of drips).
- With "reduce motion" turned on (or an old browser), it becomes a soft colour dissolve.

## Add real photos

Put images in `public/dresses/` and add them to a product:

```ts
images: { front: "/dresses/strawberry-swirl-front.jpg", back: "/dresses/strawberry-swirl-back.jpg" }
```

Photos load through `next/image` (lazy, resized). Dresses without photos use the illustration.

## Add a hero film to a flavour

Drop a video in `public/flavours/` named after the flavour. Nothing else to change.

```
public/flavours/strawberry.mp4   (the film: mp4 or webm, short loop, no sound needed)
public/flavours/strawberry.jpg   (optional still, shown while the film loads)
```

Flavours without a film keep the illustrated hero. Keep each film under about 8 MB so the page stays fast.

## The Parlour (community) — preview only

`/community` is a clickable preview of the community: posts, photos, replies, fruit reactions,
a vote on the next flavour, and a studio view where the brand can reply, pin and remove posts.

- The posts are samples (`src/lib/community.ts`). Remove them before going live.
- To use real pictures for the reactions, drop cut-out images (transparent background, square)
  into `public/reactions/` named `apple.png`, `avocado.png`, `strawberry.png`, `orange.png`,
  `blueberry.png`, `mango.png`. Each one replaces its drawing; the rest stay drawn.
- Some fruits have moving pieces cut from their pictures (the strawberry's heart eyes pop out, the
  orange and mango shed tears, the blueberry's eyes bulge). Those are listed in
  `public/reactions/effects.json`. If you replace a fruit picture, remove its entry there.
- When a fruit is picked it acts out its mood for a second (the orange laughs, the apple fumes).
  The moves are the `ff-...` keyframes in `src/app/globals.css`.
- Reactions are fruit with feelings (Angry Apple, Smiling Avocado...). They are drawn in
  `src/components/community/FruitFace.tsx` and listed in `reactions` in `src/lib/community.ts`.
- Anything a visitor adds is saved in their own browser only. Nobody else sees it.
- "Switch to studio view" is open to everyone in the preview. The real version needs sign-in.

To make it real it needs a database, accounts and a private login for the studio.

## Before going live

- The community is a preview (see above).

- Checkout is a working form, but **payments are not connected yet** (M-Pesa / card).
- The email in the footer is a placeholder.

## Hidden things

There are a few. Try the footer, the logo, and staying on the scoop for a while.
