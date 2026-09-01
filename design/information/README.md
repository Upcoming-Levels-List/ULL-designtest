# /information — three approaches

The one page the [main redesign](../README.md) skipped. This deck is not one
template per page; it is **three templates of the same page**, to pick between.

```
design/information/
  templates/*.html      three mockups — shelf, hub, tiles — each with a meta
                        block saying what the idea is, how it settles the
                        weighting, what it costs and what to watch for
  templates/_modals.html  the reader all three open, shared so that what is
                        being compared is the surface, not the contents
  copy.md               draft copy for the three sections that do not exist yet
                        (what the list is / where is what, the FAQ, the API),
                        plus the contact block
  page.shell.html       chrome-free wrapper: the page as the route renders it
  preview.shell.html    the review deck's chrome
  build-preview.mjs     builds both outputs from the templates + css/ull-v2.css
  preview.html          GENERATED — all three side by side, with the notes
  pages/*.html          GENERATED — one standalone page each, no deck around it
```

Rebuild after editing anything:

```sh
node design/information/build-preview.mjs
```

Open `pages/a-shelf.html`, `pages/c-hub.html` or `pages/e-tiles.html` to judge a
design on its own; open `preview.html` to compare them with the argument written
beside each. Both are self-contained — the icons are inlined — and both read
`css/ull-v2.css` directly, so nothing in a mockup can claim a component the site
does not have. Every mockup is live: blocks and doors and tiles open, tiles fill
in on hover, windows close. The small `theme` button on a standalone page is a
preview control, not part of the design.

## What is wrong with the page today

1. **The legends outweigh the guidelines.** `.info-cards` is a `1fr 1fr` grid
   and the Pending legend is given `grid-column: 1 / -1` by an inline style, so
   nine icon rows take the full page width while the entire rulebook is read
   through a `max-height: 600px` pane underneath it.
2. **The guidelines scroll inside a page that scrolls.**
   `.info-guidelines-content` is its own scroll container inside `.info-page`,
   so the wheel does one thing or the other depending on where the pointer is.
   `Information.js` carries an IntersectionObserver whose only job is to switch
   that inner `overflow-y` on and off — a workaround for a nesting that does not
   need to exist.
3. **The colouring legend redraws a component the site already has.** Ten
   swatches are written as inline `style="background:#5599ff"`, and those ten
   hex values are the same scale as `.u-pill--blue` … `.u-pill--done` in
   `css/ull-v2.css`. All three templates draw the legend with the pills
   themselves, so it cannot drift from the thing it explains.
4. **Nothing tells a first-time visitor where anything is.** The hero defines
   the list in four lines and the next thing on the page is a list of editors.
   There is no map of the site, and no answer to the questions that bring people
   here — how to submit, how points are earned — anywhere on it.
5. **The card hover from the pending page is here too.** `.info-guidelines:hover`
   applies `transform: scale(1.006)`, which nudges the layout under the pointer.
   The same tic was removed from the other pages in the last pass.

## The six sections

1. Guidelines — exists, rebuilt.
2. The two legends — exist, demoted to reference.
3. What the list is and where is what — **new**, drafted in `copy.md`.
4. FAQ — **new**. "How do I submit" and "how are points calculated" are
   questions here, not sections of their own.
5. Staff and contact points — **new** as a block; the editor list exists.
6. **API documentation** — new. Nine public endpoints, the level object, an
   example, and what counts as fair use. Taken from `worker/worker.js` and the
   repository README, not invented; `copy.md` flags the two undocumented routes
   (`/api/leaderboard`, `/api/upcoming`) that answer but that the site never
   calls.

A glossary belongs inside the guidelines, as a section of *General*.

## The three

They open the same reader. They differ in **what the page says before you open
anything**.

| | The page at rest | Reference legends | Best for |
|---|---|---|---|
| **A. Shelf** | Seven blocks, each with a name, a sentence and its size | A small row of their own under the shelf | Someone who knows which of the six things they came for |
| **C. Hub** | The site map, four doors, and both legends in full | Printed on the page — nineteen short rows | A first-time visitor who needs orientation, not rules |
| **E. Tiles** | Seven names and seven counts. No prose at all | Two short strips along the bottom | A page that has to read as a menu in one glance |

Each template's meta block argues its own case, including against itself; the
deck renders those notes beside the mockup. In short:

- **A** is the plainest and the cheapest, and the page can never outgrow one
  screen however much the guidelines gain — but everything is behind a click, so
  search has to reach inside closed blocks or it is decoration.
- **C** is the only one that treats the page's job as orientation. It is also
  the longest first screen, and the only one where the legends are never hidden.
- **E** is the same machinery as A with a third state in front of it. It reads
  best and risks most: hover does not exist for touch or keyboard, so the
  resting counts have to carry the page on their own.

What all three do, whichever wins:

- the guidelines are read in a window at the width of the page, with **one**
  scroll — which removes the nested pane and the observer that patches it;
- the legends are drawn with `.u-pill`, so they stay in step with the list;
- the reader is one component, so a section added later is a new entry, not a
  new layout.

## Not covered

- Mobile. `/mobile/info` has its own deck in [`design/mobile/`](../mobile/) and
  is untouched here, as asked.
- Any change to `js/` or `css/`. Nothing has been built yet — these are
  templates to choose from.
- **B. Manual** (index + reader) and **D. Document** (one long scroll) from the
  first round. Both are in git history if either is wanted back.
