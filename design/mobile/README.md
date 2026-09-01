# ULL mobile redesign — templates

Eight templates that rebuild the `/mobile/*` tree on the vocabulary the desktop
pages now use, plus the phone-only layer they need.

Open `preview.html` in a browser, or rebuild it after editing anything:

```sh
node design/mobile/build-preview.mjs
```

```
design/mobile/
  mob-v2.css            the proposed phone layer — the only new stylesheet
  templates/*.html      one mockup per page, with a meta block saying what is
                        wrong today and what the template changes
  preview.shell.html    the review deck's chrome
  build-preview.mjs     stitches the templates + css/ull-v2.css + mob-v2.css
  preview.html          GENERATED — open this
```

## The argument

The desktop pages speak one language now: an eyebrow for every section heading,
one status pill on the list's own colour scale, meters for the two progress
numbers, stat cards for the records, a definition list for the facts, chips for
tags and creators. The mobile tree speaks none of it — it still writes
`Status: Decoration 80% done` and `WR From 0: None` as sentences, under headings
in a purple that appears nowhere else on the site.

So these templates add very little CSS. Everything a phone shares with the
desktop comes from `css/ull-v2.css` unchanged. `mob-v2.css` holds only what
genuinely differs at 390px: one column, a detail that expands under its row
rather than sitting beside it, controls within thumb reach, and a type scale one
step down.

## Feature parity

Present on the desktop, absent on mobile today — all of it is in the templates:

| Page | Missing on mobile |
| --- | --- |
| Home | Count strip, top five levels, dated timeline with tone dots, editors grouped by role |
| Level detail | Thumbnail hero, status pill, rank chips, progress meters, record cards, creators chips, Open level page, Share level |
| Upcoming | Progress bar per row, furthest-progress lead, the level container's cards |
| Leaderboard | Podium, total as a display figure, record type pills, aligned score column |
| Pending | Per-lane counts, lane tints, the placement each level waits for spelled out |
| Events | Thumbnail hero, status pill, tags, details, and the desktop's ordering |
| `/level/<slug>` | Any mobile chrome at all — it is the one route that never redirects, so a shared link lands outside the app |

Nothing is added that the desktop does not have. No new data fields, and no
per-level prose.

## The two structural calls

Everything else is a restyle of what is already there. These two move things:

1. **The tab bar.** The eight destinations currently live behind a "Pages"
   button in the top bar, two taps from anywhere. They move to a bar along the
   bottom — the same destinations, in the order the desktop sidebar lists them,
   within thumb reach. Five fit; the rest sit under More.
2. **The bottom sheet.** Filters and settings open as a centred popup whose
   Apply and Reset buttons land in the middle of the screen. They become a
   sheet anchored to the bottom edge, and the filters a wrapped chip field
   rather than one check-box per line.

Both are re-homes of existing controls, not new features, but they are the two
things a reviewer should look at first.

## Not covered

`/mobile/info`, which mirrors the Information page — the desktop side of that
has not been reworked yet either, so the pair should move together.
