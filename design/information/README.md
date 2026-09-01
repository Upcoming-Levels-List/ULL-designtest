# /information — four approaches

The one page the [main redesign](../README.md) skipped. This deck is not one
template per page; it is **four templates of the same page**, to pick between.

```
design/information/
  templates/*.html      four static mockups, each with a meta block saying what
                        the idea is, how it settles the weighting, what it costs
                        and what to watch for
  copy.md               draft copy for the two sections that do not exist yet
                        (what the list is / where is what, and the FAQ), plus
                        the contact block
  preview.shell.html    the review deck's chrome
  build-preview.mjs     stitches the templates + css/ull-v2.css into preview.html
  preview.html          GENERATED — open this in a browser
```

Rebuild after editing anything:

```sh
node design/information/build-preview.mjs
```

The mockups are live: blocks open, the index switches topics, the overlay
closes. Click inside them. The deck reads `css/ull-v2.css` directly, so nothing
in a mockup can claim a component the site does not have.

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
   `css/ull-v2.css`. All four templates draw the legend with the pills
   themselves, so the legend cannot drift from the thing it explains.
4. **Nothing tells a first-time visitor where anything is.** The hero defines
   the list in four lines and the next thing on the page is a list of editors.
   There is no map of the site, and no answer to the two questions that bring
   people here — how to submit, how points are earned — anywhere on it.
5. **The card hover from the pending page is here too.** `.info-guidelines:hover`
   applies `transform: scale(1.006)`, which nudges the layout under the pointer.
   The same tic was removed from the other pages in the last pass.

## The five sections, as agreed

1. Guidelines — exists, rebuilt.
2. The two legends — exist, demoted to reference.
3. What the list is and where is what — **new**, drafted in `copy.md`.
4. FAQ — **new**, drafted in `copy.md`. "How do I submit" and "how are points
   calculated" are questions here, not sections of their own.
5. Staff and contact points — **new** as a proper block; the editor list exists.

A glossary belongs inside the guidelines, as a section of *General*.

## The four

They differ in exactly one decision: **how much of the page is visible before
you ask for it.**

| | Visible on arrival | Guidelines are read | Cost | Best for |
|---|---|---|---|---|
| **A. Shelf** | Six block faces, one screen | Full page width, in place | Smallest | Someone who knows which of the five things they came for |
| **B. Manual** | An index of everything, one topic | Full width, one topic at a time | Largest, needs routing | A reference people link into and search |
| **C. Hub** | The answers, plus three doors | Full screen, over the page | Middling | A first-time visitor who needs the map, not the rules |
| **D. Document** | The whole page, in order | In line, three quarters of the page | Smallest, deletes the most | Skimming, Ctrl+F, printing, deep links |

Each template's meta block argues its own case, including against itself; the
deck renders those notes beside the mockup.

**A and D are near-opposite bets** — A assumes people arrive knowing what they
want and should not be made to scroll past four other things to get it; D
assumes they do not know, and that a page which hides itself cannot be skimmed.
**B is D with the reading turned into navigation**, and is the only one that
needs real routes. **C is the only one that treats the page's job as
orientation** rather than reference, which is why it is the only one whose front
screen is mostly the site map.

Two things every one of them does, whichever wins:

- the guidelines are read at the width of the page, with **one** scroll —
  which removes the nested pane and the observer that patches it;
- the legends are drawn with `.u-pill`, so they stay in step with the list.

## Not covered

- Mobile. `/mobile/info` has its own deck in [`design/mobile/`](../mobile/) and
  is untouched here, as asked.
- Any change to `js/` or `css/`. Nothing has been built yet — these are
  templates to choose from.
