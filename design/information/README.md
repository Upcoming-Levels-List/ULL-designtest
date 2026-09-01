# /information — the hub

The one page the [main redesign](../README.md) skipped, rebuilt as a hub: a
front screen that answers the easy questions itself and opens the long reads in
a reader over the page.

```
design/information/
  templates/hub.html      the mockup, with a meta block saying what the idea is,
                          how it settles the weighting, what it costs and what
                          to watch for
  templates/_modals.html  the reader the blocks open
  copy.md                 draft copy for the sections that do not exist yet —
                          what the list is, the navigation, the FAQ, the API —
                          plus the contact block
  page.shell.html         chrome-free wrapper: the page as the route renders it
  preview.shell.html      the review deck's chrome
  build-preview.mjs       builds both outputs from the template + css/ull-v2.css
  preview.html            GENERATED — the mockup with the argument beside it
  pages/c-hub.html        GENERATED — the page on its own
```

Rebuild after editing anything:

```sh
node design/information/build-preview.mjs
```

Both outputs are self-contained — the icons are inlined — and both read
`css/ull-v2.css` directly, so nothing in the mockup can claim a component the
site does not have. The mockup is live: every door opens and closes. The small
`theme` button on the standalone page is a preview control, not part of the
design.

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
   `css/ull-v2.css`. The template draws the legend with the pills themselves, so
   it cannot drift from the thing it explains.
4. **Nothing tells a first-time visitor where anything is.** The hero defines
   the list in four lines and the next thing on the page is a list of editors.
5. **The card hover from the pending page is here too.** `.info-guidelines:hover`
   applies `transform: scale(1.006)`, which nudges the layout under the pointer.

## The page

A hero — what the list is, the full version offered at the end of the sentence,
and one search field over everything on the page — then six blocks:

| | | Opens |
|---|---|---|
| **FAQ** | Quarter width, first: it is what most visitors arrive wanting | a reader |
| **Navigation** | Guidelines width. Every page on the site with a paragraph on what is in it, grouped as the sidebar groups them | in place |
| **Guidelines** | Eight of twelve columns, three rows tall. Carries its own contents — all thirteen sections | a reader |
| **Reference** | Both legends in one block, two columns, small type | nothing — it is printed |
| **Staff & contact** | The team, and where to take a record, a correction or a bug | a reader |
| **API documentation** | Nine public endpoints, the level object, an example, fair use | a reader |

Row 1 is 4 + 8 and the rows under it are 8 + 4, so the navigation and the
guidelines are the same width and the page's outer edges hold, while the FAQ
sits top-left where reading starts. The internal column edge moves between row 1
and row 2; that is deliberate, and it is the one thing to look at twice.

The guidelines block and the right-hand stack are balanced to within a pixel at
1440 px — the legends went to two columns for that reason, and the guidelines
carry their contents rather than five group names spread over three rows' height.

## The six sections

1. Guidelines — exists, rebuilt.
2. The two legends — exist, merged into one Reference block.
3. What the list is — **new**, in the hero and its reader.
4. FAQ — **new**. "How do I submit" and "how are points calculated" are
   questions here, not sections of their own.
5. Staff and contact points — **new** as a block; the editor list exists.
6. **Navigation** and **API documentation** — new. The API block is taken from
   `worker/worker.js` and the repository README, not invented; `copy.md` flags
   the two undocumented routes (`/api/leaderboard`, `/api/upcoming`) that answer
   but that the site never calls, and that public reads have no rate limit.

A glossary belongs inside the guidelines, as a section of *General*.

## Not covered

- Mobile. `/mobile/info` has its own deck in [`design/mobile/`](../mobile/).
- Any change to `js/` or `css/`. Nothing has been built yet.
- The four approaches this was chosen from — A. Shelf, B. Manual, D. Document,
  E. Tiles. All are in git history.
