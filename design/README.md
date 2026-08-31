# ULL redesign — templates

Six page templates that rebuild the site out of the vocabulary `/level/<slug>`
already established, plus the shared layer they are built from.

Not covered: `/information` (by request), `/admin` and `/generator` (staff
tools), and the `/mobile/*` routes, which have their own component tree.

These templates have since been built into the site. They stay here as the
reference the pages were made from, and the deck now reads the shipped
stylesheet, so it renders whatever `css/ull-v2.css` currently says.

```
design/
  templates/*.html      one static mockup per page, with a meta block saying
                        what was wrong and what the template changed
  preview.shell.html    the review deck's chrome
  build-preview.mjs     stitches the templates + css/ull-v2.css into preview.html
  preview.html          GENERATED — open this in a browser
```

The component layer itself lives at `css/ull-v2.css`, alongside the rest of the
site's stylesheets.

Rebuild the deck after editing anything:

```sh
node design/build-preview.mjs
```

## The argument

`/level/<slug>` is the newest page and the only one with a coherent design. It
introduces a level with the level's own blurred thumbnail, states where it
stands with one status pill on the same colour scale the list colours names by,
draws the two progress numbers as meters, and puts the facts in a definition
list — all in one stylesheet, with no inline styles.

Every other page says the same things in prose, at a different size, in a colour
picked for that page alone: `Status: Decoration being made - 80% done` as body
copy, `World Record - From 0: None` as body copy, cross-list ranks as dimmed
grey text, `#c084fc` as a heading colour on the pending page and nowhere else.
Six pages, six vocabularies for one set of facts.

`css/ull-v2.css` lifts the level page's vocabulary into components — `.u-eyebrow`,
`.u-card`, `.u-pill`, `.u-chip`, `.u-rank`, `.u-meter`, `.u-stat`, `.u-dl`,
`.u-btn`, `.u-phero`, `.u-hero`, `.u-row`, `.u-empty` — and each template
rebuilds a page out of them.

## Constraints held

- **No new fields.** Every value in every template already exists in
  `data/<level>.json` or is derived from it the way the app already derives it:
  the verification percentage is the same max over records and run spans that
  `LevelPage.js` computes, the counts are lengths of arrays already in memory,
  the per-record scores come from `js/leaderboard.js`.
- **No per-level prose.** No template adds a written description of a level.
- **List page structure untouched.** All Levels, Main List and Future List keep
  their hero, their 40/60 grid and their list column. Only the level container
  is rebuilt, plus the row rhythm inside the existing markup.

## Two bugs found while building this

1. **Filled buttons lose their colour on the light theme.** In
   `css/pages/level-page.css`, `.level-page a { color: inherit }` (0,1,1) beats
   `.lvl-link` (0,1,0), so the filled *Showcase video* button on every level
   page computes `rgb(0,0,0)` on its `#3e00f9` fill under `.root.dark`.
   Verified against `css/bundle.css`, and fixed: `.lvl-link` is now scoped to
   `.level-page`, and `css/ull-v2.css` scopes every component one level deeper
   (`.ull2 .u-btn`) so the cascade resolves as written.
2. **`.upcoming-hero` duplicates `.page-hero`.** The two blocks in
   `css/pages/list-hero.css` are identical rule for rule; only the class prefix
   differs. `.u-phero` replaces both.

## What shipped

- `css/ull-v2.css` — the component layer.
- `js/components/List/LevelPanel.js` + `css/pages/level-panel.css` — one level
  container, rendered by All Levels, Main List, Future List and Upcoming Levels
  in place of four near-identical copies of the old markup.
- Shared level-state helpers in `js/util.js` (`levelStatus`, `verificationPercent`,
  `bestRecord`, …), which `LevelPage.js` now uses too rather than deriving its own.
- `.u-phero` replacing `.page-hero` and its duplicate `.upcoming-hero`.
- Rebuilt `Home.js`, `Leaderboard.js`, `UpcomingLevels.js`, `ListPending.js` and
  `Events.js`, with `css/pages/events.css` taking the events rules out of
  `home.css`.
