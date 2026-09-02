# Home — four templates, two per surface

Home was rebuilt once already, and that pass fixed the biggest thing wrong with
it: [the landing page of a level list now shows levels](../README.md). What it
did not fix is **the geometry those levels sit on and the weight the page gives
each block**, on either surface.

These are **two ways to answer that on the desktop and two on the phone**. A and
C are one idea on two surfaces; B and D are the other. A decision here is A+C or
B+D, not four separate calls.

Nothing is built yet. Open `preview.html` in a browser, or the standalone pages
on a real screen. Rebuild after editing anything:

```sh
node design/home/build-preview.mjs
```

```
design/home/
  templates/_blocks.html      the shared kit (CSS only) and the chrome blocks
  templates/a-spotlight.html  desktop — the page it is, on one measure
  templates/b-board.html      desktop — three lanes of the list's live state
  templates/c-deck.html       phone — A at 390px
  templates/d-segments.html   phone — B at 390px
  preview.shell.html          the review deck's chrome
  page.shell.html             chrome-free wrapper: the page as a route renders it
  build-preview.mjs           builds both outputs
  preview.html                GENERATED — the four templates with the argument beside them
  pages/*.html                GENERATED — each one on its own, openable anywhere
```

Every output reads `css/ull-v2.css` and `css/pages/mobile-v2.css` **as they
ship** rather than a copy, so a mockup cannot claim a component the site does not
have, and every output inlines the site's own icons, so each file is
self-contained. The `theme` button on a standalone page is a preview control, not
part of the design.

## What is wrong with the page today

Measured on the shipped page in Chromium against the live list — 479 levels, 12
editors, 42 changes over 3 days — at 1440×900, 1920×1080 and 390×844.

| Reading | What it is |
| --- | --- |
| **72px / 312px** | The gap between the hero's left edge and the body's left edge, at 1440 and at 1920. `.home-hero` pads 2.5rem off the main region; `.home-content` is a 1100px column centred in whatever is left. The page has two left margins and two right ones, and the wider the window the worse it gets. |
| **736px of 1740px** | What the hero uses of the band it sits on at 1920. The lead is capped at 40rem and nothing is placed beside it, so 58% of the first screen is a tinted empty rectangle. |
| **907px** | The distance from a level's name to its status pill in a home row at 1440 (1007px at 1920). `.u-row` pushes its last child right with `margin-left: auto`, which is correct in a 360px phone row and an eye-journey in a 1036px desktop one. |
| **2162px in 387px** | The Recent Changes feed and the window it scrolls inside — 5.6 screens of nested scroll on the desktop, and **2513px in 286px**, 8.8 screens, on the phone. Both sit inside a page that is itself scrolling; on a touch screen a swipe that lands inside the box scrolls the wrong thing. |
| **465px / 499px** | The editors card, desktop and phone. On the phone that is a quarter of the whole page, for twelve names that are also on `/information`. |
| **321px of 792px** | What comes before the first level on the phone: 41% of the window is hero and credentials. |
| **0** | Progress meters on home. Decoration and verification percentage are the two numbers the list sorts by, colours names by and draws as meters on `/level/<slug>` and `/upcoming`. Home writes one of them into a pill and never draws either. |

Two smaller things the templates also settle:

- **The three hero buttons are the sidebar.** *View All Levels*, *Explore Future
  List* and *Learn More* point at three entries that are permanently on screen
  180px to the left. That is dead weight on the desktop, though not on the phone,
  where there is no sidebar.
- **The feed has nowhere to go.** There is no changelog route, so the nested
  window is not an index into a longer page — it is the only place those 42
  entries exist. Every template here keeps them on the page and folds the older
  ones open in place instead.

## The four

### A. Spotlight — the page it is, on one measure · desktop

Keeps every block and fixes what carries them. One column runs the hero, the
credentials, the rows and the feed, so there is a single left edge. The half of
the hero that is empty at every width goes to the level the page is about: **#1
drawn the way `/level/<slug>` draws it** — blurred thumbnail, status pill, both
meters, one button. The remaining rows carry their pill beside the name and a
meter under it, and the editors card becomes a line of names.

Cheapest of the four. Page height at 1440×900 goes from **1665px to 1233px**.

### B. Board — three lanes of the list's live state · desktop

Asks what a visitor comes to a tracker for and answers all of it above the fold.
The hero shrinks to a band; the body becomes three lanes: **the top of the list**,
**the levels closest to being verified**, and **what the staff changed this
week**. The middle lane is the top of `/upcoming` in that page's own order
(`upcomingRanking()` in `js/formulas.js`), so it is a reading the site already
computes. The editors become a credit line above the footer.

The whole page fits **one screen at 1440×900**, and uses the width a 1920 window
gives it.

### C. Deck — A at 390px · phone

The hero keeps its eyebrow and title and loses two of its four lines of lead; the
credentials bar moves to the bottom. The screen a visitor lands on opens on a
level: the spotlight, then rows with their status beside the name and their
decoration as a bar. The feed comes out of its scroll box, and the editors card
becomes one 48px row.

Page height goes from **2062px to 1149px**, and the first level starts at roughly
200px instead of 321px.

### D. Segments — B at 390px · phone

Three lanes cannot sit side by side at 390px, so they become a segment bar that
sticks to the top of the scroll — Top, Closest, Changed — with one lane on screen
at a time. Nothing is two screens down: each of the three answers is one tap from
the landing screen. The editors are a credit row at the foot of every lane.

Each lane is **one screen** — 815px, 771px and 814px against a 741px window.

## What each pair costs, and what it risks

|  | A + C | B + D |
| --- | --- | --- |
| **Idea** | Same page, right geometry | Home is the state of the list |
| **New readings of the data** | None | One — `upcomingRanking()`, already called by `/upcoming` |
| **Blocks kept** | All four, re-weighted | Top of the list and the feed; the roster becomes a credit |
| **What a first-time visitor meets** | Three lines about the project and a level in full | One line about the project and three lanes of levels |
| **Biggest risk** | The spotlight is always #1, which can sit unchanged for months | It reopens a decision this repo already made: [home is not a dashboard](../README.md) |

Both pairs drop the same two things, and both are judgement calls worth arguing
about before anything is built:

1. **The editors card.** Twelve names in a bordered card become a line of chips
   (desktop) or one row (phone), linking to `/information`, which carries the
   same twelve with their roles and contact routes. If the roster is meant to be
   a credit the community reads on the landing page rather than a directory, this
   is wrong and the card should stay.
2. **Two of the three hero buttons**, on the desktop only. The phone keeps
   everything it has, because it has no sidebar.

## Constraints held

- **No new fields.** Every value in every template already exists in
  `data/<level>.json` or is derived the way the app already derives it:
  `decorationPercent`, `verificationPercent`, `levelStatus`, `bestRecord` and
  `bestRun` from `js/util.js`, and `upcomingRanking` from `js/formulas.js`.
- **No new routes and no new components.** The kit in `templates/_blocks.html`
  is layout only — a column measure, a row modifier, a spotlight wrapper, a feed
  in flow, a segment bar. Every card, pill, chip, meter, eyebrow, button and hero
  is a shipped one.
- **No per-level prose.** No template writes a description of a level.
- **The footer, the sidebar and the mobile shell are untouched.**
- **Every figure in the mockups is the real one**, read out of `data/` — the top
  of the list, the six levels closest to verification, the 42 changes over three
  days and the twelve editors. A mockup cannot claim a number the data does not
  have.

## One thing the desktop mockups do that the older decks do not

They draw the **sidebar**. `design/templates/*.html` render the main region
alone, which is right when the sidebar is not part of the argument. Here it is:
half of what these templates change follows from the fact that 180px of
navigation is permanently on screen — the three hero buttons that repeat it, and
the measure the body should be centred on. The sidebar in the mockups is a mock
(`mk-side` in the kit), not the shipped component.
