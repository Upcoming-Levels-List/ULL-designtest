# ULL Backend / Database Reference

> **Read this first.** This project's backend (Cloudflare Worker + D1 database) lives
> **outside this git repository** — it is hosted on the Cloudflare dashboard and cannot
> be viewed from the repo or from a Claude session. This document is the single source of
> truth a new agent needs to understand and continue the work. If anything here conflicts
> with what you observe by actually calling the live API, trust the live API and update
> this file.

---

## 1. Architecture at a glance

- **Frontend**: static site in this repo. Vue 3 (CDN global build, no bundler), Vue Router
  (hash mode), plain ES modules. Entry point: `index.html` → `js/main.js`.
- **Backend**: a single **Cloudflare Worker** (plain JavaScript) that exposes a REST-ish JSON
  API. **Its source code is NOT in this repo** — it is edited via the Cloudflare dashboard
  ("Workers & Pages" → the worker → **Quick Edit**).
- **Database**: **Cloudflare D1** (SQLite). Database name: `d1-template-database`. Bound to
  the Worker as `env.DB`. Edited via the Cloudflare dashboard → D1 → the database → **Console**
  tab (run SQL there).
- **API base URL**: `https://d1-wrkr.ullteam.workers.dev`
  (defined as `const api`/`API` in `js/content.js`, `js/pages/Admin.js`,
  `js/components/AdminLogin.js`, `js/pages/LevelGenerator.js`).

### How auth works
- Editors have an **API key** (a secret string). Only its **SHA-256 hash** is stored in the
  DB (`editor_keys.key_hash`). The plaintext key is never stored.
- The frontend sends `Authorization: Bearer <key>` on write requests.
- The Worker hashes the incoming key and looks it up in `editor_keys`. The `authed()` helper
  returns the **editor's name** (string) if valid, or `null` if not — write endpoints log
  who did what to `audit_log`.
- The admin login (`js/components/AdminLogin.js`) validates a key by calling
  **`GET /api/auth/validate`** with the Bearer header and checking for a 200.

---

## 2. IMPORTANT: the repo does not contain the real Worker

> **Update:** a corrected, known-good copy of the Worker now lives in this repo at
> **`worker/worker.js`** (kept for reference/version control — the *live* Worker is still
> edited via the Cloudflare dashboard and is authoritative). This copy fixes the
> `editor_keys` column bug (`name` → real column `editor_name`), adds the missing
> `GET /api/auth/validate` login endpoint, and renames `GET /api/changes` →
> `GET /api/recent-changes` to match the frontend. If you change the live Worker, update
> this file too so they don't drift.


Last session the Worker source was **reconstructed from memory and pasted into chat** for the
user to deploy. That reconstruction is a best-effort copy, not the canonical file. Two
endpoints the frontend actually depends on were **missing / renamed** in that reconstruction:

| Frontend calls (must exist)      | Reconstructed Worker had        | Status |
|----------------------------------|---------------------------------|--------|
| `GET /api/auth/validate`         | *(absent)*                      | ⚠️ must be present or login breaks |
| `GET /api/recent-changes`        | `GET /api/changes`              | ⚠️ name mismatch → Recent Changes empty |

**Before changing the Worker, always fetch the live endpoints and confirm what actually
exists** rather than trusting the reconstructed copy. The live deployed Worker is
authoritative; the pasted code is not.

If asked to output "the full Worker," reconstruct from BOTH this file's endpoint list
(section 5) AND the exact endpoint names the frontend uses (section 6) — do not drop
`/api/auth/validate` or rename `/api/recent-changes`.

---

## 3. Database schema (D1 / SQLite)

Inferred from Worker queries and frontend payloads. To see the real schema run
`PRAGMA table_info(<table>);` in the D1 console.

### `levels`
The main list. One row per level. Ordering is controlled by `sort_order` (0- or 1-based
integer; the Worker treats position N as the Nth row when ordered `ORDER BY sort_order ASC`).

| Column            | Type    | Notes |
|-------------------|---------|-------|
| `path`            | TEXT    | Unique slug / identifier. Primary key in practice. Used in URLs and as the key for update/delete/move. |
| `name`            | TEXT    | Level name |
| `author`          | TEXT    | |
| `creators`        | TEXT    | JSON array of strings |
| `verifier`        | TEXT    | |
| `verification`    | TEXT    | YouTube URL |
| `showcase`        | TEXT    | YouTube URL |
| `thumbnail`       | TEXT    | image/YouTube URL, nullable |
| `frameCounter`    | TEXT    | **added** — "Frame Windows Counter" YouTube link, nullable/empty for most levels |
| `id`             | TEXT    | in-game level ID (or "private") |
| `password`        | TEXT    | |
| `difficulty`      | TEXT/INT| |
| `rating`          | INTEGER | |
| `length`          | INTEGER | seconds |
| `percentToQualify`| INTEGER | |
| `percentFinished` | INTEGER | |
| `lastUpd`         | TEXT    | date string, format **`DD.MM.YYYY`** |
| `tags`            | TEXT    | JSON array of strings (see tag list below) |
| `records`         | TEXT    | JSON array of `{user, link, percent, hz}` |
| `run`             | TEXT    | JSON array of `{user, link, percent, hz}` |
| `isVerified`      | INTEGER | 0/1 |
| `isMain`          | INTEGER | 0/1 (on the Main list) |
| `isFuture`        | INTEGER | 0/1 (on the Future list) |
| `benchmark`       | INTEGER | **added** — 0/1 |
| `sort_order`      | INTEGER | ranking. Contiguous; shifted on insert/delete/move |

Empty `records`/`run` are stored as a single sentinel row `{user:'none',...}` so the frontend
can distinguish "no records" from "not loaded". The admin panel filters `user === 'none'` out
on edit and re-adds the sentinel on save.

Available **manual tags** (from `js/pages/Admin.js` `AVAILABLE_TAGS`):
`Public, Finished, Layout, Unrated, Rated, Medium, Long, XL, XXL, NC, Remake, NONG, Quality`.
The `Layout` tag has special meaning in the frontend age-filtering (see section 7).
Some tags are **auto-assigned by the frontend** and are NOT manually editable: `Open Verification`
(verifier == "open verification"), `Pending Removal` (stale & unverified), and `Verifying`
(see section 7). Auto tags are computed on load and override any stored value.

### `editor_keys`
**Confirmed live schema** (via `PRAGMA table_info(editor_keys)` on 2026-07-08):

| Column        | Type    | Notes |
|---------------|---------|-------|
| `id`          | INTEGER | PRIMARY KEY (autoincrement) |
| `editor_name` | TEXT    | display name, shown in "List Editors" and audit log. **The column is `editor_name`, NOT `name`.** |
| `key_hash`    | TEXT    | SHA-256 hex of the editor's API key |
| `role`        | TEXT    | one of `owner, admin, seniormod, mod, dev` (DEFAULT `'mod'`) |
| `link`        | TEXT    | profile URL (YouTube etc.), DEFAULT `''` |

> ⚠️ **Critical gotcha (caused the editor-list / login outage):** the real column is
> **`editor_name`**. An earlier Worker reconstruction queried `name` everywhere, which
> throws a SQLite error → Cloudflare **Error 1101** on `/api/editors`, and broke `authed()`
> (so *all* logged-in writes failed). The corrected `worker/worker.js` uses `editor_name`
> in every query and exposes it to the frontend as `name` via
> `SELECT editor_name AS name` (the frontend expects a `name` field). Do not "fix" this by
> renaming the DB column — conform the Worker to the DB, not the other way around.

### `pending`
Backs the **Pending List** page (`js/pages/ListPending.js`, `MobilePending.js`) and the admin
**Pending** tab. Also holds public "suggest a level" submissions (legacy; no live submit UI).
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK AUTOINCREMENT | |
| `name` | TEXT | level name |
| `placement` | TEXT | drives the row icon. A tier (`1,10,20,30,50,75`), `?` (question.svg), or `up`/`down` (move-*.svg). |
| `link` | TEXT | optional level/video link |
| `indefinite` | INTEGER | **added 2026-07-08** — 0/1. `1` = show in the "Pending Indefinitely" section |
| `author`, `reason` | TEXT | legacy submission fields |
| `status` | TEXT | legacy: `pending` / editor-set |
| `notes` | TEXT | legacy editor notes |
| `created_at` | TEXT/timestamp | legacy; **may not exist** on the real table. ⚠️ `GET /api/pending` must NOT `ORDER BY created_at` — that threw Error 1101 and emptied the Pending List. It now does a plain `SELECT * FROM pending` and the frontend/admin sort client-side. |

**Which Pending List section a row shows in** (same logic in frontend + admin):
- `placement` is `up`/`down` → **Pending Movements**
- else if `indefinite = 1` → **Pending Indefinitely**
- else → **Pending Placements**

(Pending **Removals** is a 4th section but is *computed on the frontend* from stale levels —
`lastUpd` ≥ 1 year old & unverified — it is **not** stored in this table.)

### `config`
Key/value store for singletons (Level of the Month, Closest to Verification).
| Column | Type | Notes |
|--------|------|-------|
| `key`   | TEXT PK | e.g. `levelMonth`, `levelVerif` |
| `value` | TEXT    | JSON blob |

### `audit_log`
Who-did-what log (written by every authenticated write endpoint).
```sql
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    editor_name TEXT,
    action TEXT,       -- INSERT/UPDATE/MOVE/DELETE/CONFIG_UPDATE/EDITOR_ADD/...
    target TEXT,        -- e.g. the level path or editor name
    details TEXT,       -- freeform
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### `recent-changes` source (uncertain)
The frontend calls `GET /api/recent-changes` and expects an array of
`{ date: "...", entries: ["**bold** text", ...] }`. The backing table's exact name/shape is
uncertain (the reconstructed Worker called it `changes`). **Verify against the live Worker.**

### `leaderboard` / `upcoming`
Referenced by the reconstructed Worker; the live leaderboard computation in `content.js` is
largely commented out. Treat as low-priority / verify before relying on them.

---

## 4. Historical outage (RESOLVED — kept for reference)

> ✅ **All three were fixed.** Root cause: the deployed Worker used `name` for the `editor_keys`
> table whose real column is `editor_name` (→ Error 1101 broke `/api/editors` *and* `authed()`,
> so no logged-in writes worked), and it was missing `GET /api/auth/validate` (→ login 404'd, so
> LotM/CTV could never be saved). The corrected `worker/worker.js` fixes both. The diagnosis
> below is retained as a worked example.

Symptoms at the time:

1. **List Editors** (Home page + mobile + admin Editors tab) — showed blank / empty.
2. **Level of the Month (LotM)** — not showing on the Events page.
3. **Closest to Verification (CTV)** — not showing on the Events page.

### Most likely causes (diagnose in this order)

**List Editors:**
- The `editor_keys.link` column may never have been added. If the live Worker runs
  `SELECT name, role, link FROM editor_keys` and `link` doesn't exist, the query throws →
  `/api/editors` errors → editors are blank everywhere.
  - Fix: `ALTER TABLE editor_keys ADD COLUMN link TEXT DEFAULT '';`
  - Check first: `PRAGMA table_info(editor_keys);`
- OR: no editor rows exist yet (nobody was ever inserted/bootstrapped). Check:
  `SELECT name, role FROM editor_keys;`
- Quick live test: open `https://d1-wrkr.ullteam.workers.dev/api/editors` in a browser.
  Expect a JSON array of `{name, role, link}`. A 500 or `{error:...}` confirms a DB/column
  issue; `[]` confirms an empty table.

**LotM / CTV:**
- They read from the `config` table via `GET /api/level-month` (`key='levelMonth'`) and
  `GET /api/level-verif` (`key='levelVerif'`). If the `config` table was never created, or
  those keys were never saved from the admin Events tab, the endpoints return `null` → the
  Events cards render nothing.
  - Check table exists: `CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT);`
  - Check contents: `SELECT key FROM config;`
  - Live test: open `.../api/level-month` and `.../api/level-verif` — `null` means unset.
- Saving from the admin panel uses `PUT /api/config` (requires a valid API key). If login is
  broken (see below), saves won't work either.

**Cross-cutting suspect — login may be broken:**
- If the live Worker was replaced with the reconstructed copy that lacked
  `GET /api/auth/validate`, the admin login returns non-200 → nobody can log in → LotM/CTV/
  editors can't be edited. Verify `/api/auth/validate` exists (200 with a valid Bearer key).

---

## 5. Worker API endpoints (canonical list to maintain)

Every endpoint the system needs. Verify each against the live Worker; add any that are
missing.

**Public GET (no auth):**
- `GET /api/list` — all levels, `ORDER BY sort_order ASC`
- `GET /api/list/main` — `isMain=1 AND isVerified=0`
- `GET /api/list/future` — `isFuture=1 AND isVerified=0`
- `GET /api/levels/:position` — the Nth level (1-based) by sort order
- `GET /api/pending`
- `GET /api/editors` — returns `[{name, role, link}]`
- `GET /api/level-month` — JSON of `config.levelMonth` or `null`
- `GET /api/level-verif` — JSON of `config.levelVerif` or `null`
- `GET /api/recent-changes` — **note the name**; array of `{date, entries[]}`

**Auth GET:**
- `GET /api/auth/validate` — 200 if Bearer key valid (used by login), else 401
- `GET /api/audit-log` — last 100 audit rows, newest first

**Auth writes (Bearer key required; each logs to `audit_log`):**
- `PUT /api/levels` — insert (with `insertAt`) or update (by `path`). 25 columns incl.
  `frameCounter` and `benchmark`.
- `POST /api/levels/move` — body `{path, newPosition}`. Uses rank-lookup (fetch all
  sort_orders, shift the range between current and target) to avoid off-by-N bugs.
- `DELETE /api/levels/:path` — delete + close the `sort_order` gap. Must NOT match numeric
  paths (those are the GET-by-position route).
- `PUT /api/pending` — editor update (status/notes) if authed; public submission if not.
- `DELETE /api/pending/:id`
- `PUT /api/config` — upsert arbitrary `{key: value}` pairs (used for `levelMonth`,
  `levelVerif`).
- `PATCH /api/editors` — body `{name, role, link}`; updates role/link.
- `DELETE /api/editors/:name` — revokes an editor's key.
- `POST /api/admin/add-key` — body `{name, key, role, link}`; hashes key, inserts editor.
- `POST /api/admin/pending` — body `{name, placement, link, indefinite}`; inserts a Pending
  List entry (admin Pending tab).
- `PUT /api/admin/pending` — body `{id, name, placement, link, indefinite}`; updates one.
  (Delete reuses `DELETE /api/pending/:id`.)
- `POST /api/admin/bootstrap` — body `{secret, name, key, role, link}`; one-time first-admin
  creation, gated by the `BOOTSTRAP_SECRET` Worker env var. See section 8.

CORS: the Worker returns permissive `Access-Control-Allow-*` headers and handles `OPTIONS`.

---

## 6. Frontend → endpoint map (do not break these names)

| File | Calls |
|------|-------|
| `js/content.js` | `/api/list`, `/api/editors`, `/api/pending`, `/api/recent-changes`, `/api/level-month`, `/api/level-verif` |
| `js/components/AdminLogin.js` | `/api/auth/validate` |
| `js/pages/Admin.js` | `/api/list`, `/api/levels` (PUT/DELETE), `/api/levels/move`, `/api/level-month`, `/api/level-verif`, `/api/config` (PUT), `/api/editors` (GET/PATCH/DELETE), `/api/admin/add-key`, `/api/pending` (GET), `/api/admin/pending` (POST/PUT), `/api/pending/:id` (DELETE), `/api/audit-log` |
| `js/pages/LevelGenerator.js` | `/api/levels` (PUT) |
| `js/pages/Events.js` | via `content.js`: `/api/level-month`, `/api/level-verif`, `/api/list` |

---

## 7. Relevant frontend behaviors tied to the data

- **Age filtering** (`js/pages/List.js`, `ListMain.js`, `ListFuture.js`): a level's `lastUpd`
  (format `DD.MM.YYYY`) drives "stale" indicators.
  - `isOldLevel`: `lastUpd` ≥ **1 year** ago.
  - `isVeryOldLevel`: ≥ **15 months** ago, OR ≥ **12 months** if the level has the `Layout` tag.
  - On Main/Future lists, old unverified levels (`isOldLevel && !isVerified`) are **hidden**.
  - Level names show `🚫` at 1y and `🚫🚫` at the "very old" threshold (gated by
    `store.levelColoring`).
- **Verified levels join Main & Future** (`List.js`/`ListMain.js`/`ListFuture.js`,
  `MobileList.js`): any level with `isVerified == true` is shown on the Main List and Future
  List regardless of its stored `isMain`/`isFuture` flags (membership filter is
  `isMain || isVerified` / `isFuture || isVerified`).
- **Automatic `Verifying` tag** (`List.js`/`ListMain.js`/`ListFuture.js` auto-tag loops,
  `Mobile.js`): applied when `!isVerified && percentFinished === 100 && verifyProgress >= 30`
  — the exact condition that colors a level's name orange (≥30) or red (≥60).
  `verifyProgress` = max of best record % and best run span. Fully automatic (removed from the
  admin/generator tag pickers); the frontend adds/removes it on load.
- **Cross-list position** (`List.js`/`ListMain.js`/`ListFuture.js`, and mobile
  `MobileList.js`): each level page shows the level's rank in the *other* two lists (e.g.
  "#12 in All Levels · #3 in Future List"), computed as `allLevelsRank` / `mainRank` /
  `futureRank` on mount (desktop pages) or in `Mobile.js` (mobile), mirroring Upcoming Levels.
- **Pending search fallback** (`List.js`/`ListMain.js`/`ListFuture.js`, `MobileList.js`): when a
  search returns **no matches, or 3 or fewer**, the page checks the pending list (`fetchPending`,
  kept in `this.pending` / `mobileStore.pending`) for an entry whose name contains the query and,
  if found, shows a "Maybe you were searching for this: …?" card below the results, with the
  level's placement icon, an estimated-position line, and a link to the Pending List. Shown when
  `pendingSuggestion && (noResults || visibleCount <= 3)`.
- **Mobile filters scroll indicator** (`Mobile.js`, `css/pages/mobile.css`): the filters popup's
  tag list is a bounded scroll area (`.mob-filters-scroll`, max-height 46vh) so Apply/Reset stay
  visible; a fade + bouncing chevron (`.mob-filters-scroll-hint`) signals more filters and hides
  once scrolled to the bottom (`filtersAtEnd`).
- **Frame Windows Counter**: if `level.frameCounter` is set, the level card shows a
  "Frame Windows Counter" row with a "Watch Here" link (List/ListMain/ListFuture pages).
- **Coming Soon popup**: Vue 3 templates can't call `window.alert()`. A shared reactive flag
  `store.comingSoon` (in `js/main.js`) plus an overlay in `index.html` handle it. Telegram
  links across the site set `store.comingSoon = true`.
- **Version**: currently **v2.0.0** (shown in `index.html` sidebar and `js/pages/Mobile.js`).
- **Partners section**: hidden with `v-if="false"` (kept in source) on Home and MobileHome.

### Routing & SEO (added 2026-07-08)
- **History-mode routing**: the router uses `VueRouter.createWebHistory()` (in `js/main.js`),
  so URLs are clean (`/list`, `/events`) with **no `#`**. It used to be
  `createWebHashHistory()` (`/#/list`). This is what makes individual pages indexable by
  Google.
- **`_redirects`** (repo root): Cloudflare Pages SPA fallback — `/*  /index.html  200`.
  **Required.** Without it, refreshing or deep-linking any route (e.g. `/events`) returns a
  server 404. Real files (`/css`, `/js`, `/assets`, `robots.txt`, `sitemap.xml`, images) are
  served before this rule. This only takes effect on a Cloudflare Pages deploy, not locally.
- **Old-hash migration**: on load, `js/main.js` rewrites any `#/…` URL to its clean path via
  `history.replaceState`, so old bookmarks (`/#/list`) still work.
- **404 page**: `js/pages/NotFound.js`, wired as the catch-all route
  `{ path: '/:pathMatch(.*)*', component: NotFound }` (last entry in `js/routes.js`). Note:
  the mobile auto-redirect in `main.js` `beforeEach` sends mobile users hitting unknown URLs
  to `/mobile/home` instead of the 404 page (desktop users see the 404). NotFound uses inline
  styles and must NOT put bare text in a direct child `<div>` of `<main>` — the global rule
  `main > div { overflow-y: auto }` (`css/main.css`) would add a stray scrollbar; content is
  wrapped in a container with `overflow:visible`.
- **Per-route `<title>` + canonical**: an `afterEach` hook in `js/main.js` sets a unique
  `document.title` and updates `<link rel="canonical">` per route (mobile routes canonicalize
  to their desktop equivalent). Needed because all routes serve the same `index.html`; a
  static canonical would otherwise mark every page a duplicate of home.
- **SEO tags / files**: `index.html` `<head>` has `<meta name="description">` (was missing —
  its absence let search engines auto-generate junk snippets from level records), Open
  Graph + Twitter card tags, and a `WebSite` JSON-LD block. `robots.txt` + `sitemap.xml` list
  the indexable pages. All these hard-code the domain **`https://ull.pages.dev`** — if the
  site moves to a custom domain, update: the `<head>` canonical/OG/Twitter URLs, `SITE_ORIGIN`
  in `js/main.js`, `robots.txt`, and `sitemap.xml`.

---

## 8. Operational runbook (things done "behind the scenes", not in the repo)

### D1 setup SQL (run in the D1 Console tab)
Idempotent-ish; check first with `PRAGMA table_info(<table>)` before ALTERs.
```sql
-- editor_keys extras
ALTER TABLE editor_keys ADD COLUMN role TEXT DEFAULT 'mod';   -- may already exist (harmless error)
ALTER TABLE editor_keys ADD COLUMN link TEXT DEFAULT '';

-- levels extras
ALTER TABLE levels ADD COLUMN frameCounter TEXT;
ALTER TABLE levels ADD COLUMN benchmark INTEGER DEFAULT 0;

-- pending extras (Pending List entries + the "Pending Indefinitely" section)
ALTER TABLE pending ADD COLUMN placement  TEXT DEFAULT '?';   -- may already exist
ALTER TABLE pending ADD COLUMN link       TEXT DEFAULT '';    -- may already exist
ALTER TABLE pending ADD COLUMN indefinite INTEGER DEFAULT 0;  -- NEW: powers "Pending Indefinitely"

-- singletons + logging
CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    editor_name TEXT, action TEXT, target TEXT, details TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
```
> A "duplicate column name" error on an `ALTER TABLE ... ADD COLUMN` just means that column
> already exists — it's safe to ignore and move on.

### Bootstrapping the first admin (one-time)
The D1 Console cannot make HTTP requests. The bootstrap call is an HTTP POST to the **Worker**,
so run it from a **browser DevTools console** (F12 → Console) on any page:
```javascript
fetch('https://d1-wrkr.ullteam.workers.dev/api/admin/bootstrap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret: 'THE_BOOTSTRAP_SECRET_ENV_VAR_VALUE',
    name: 'YourName',
    key: 'a-strong-secret-you-choose',   // this becomes the admin login key
    role: 'owner',
    link: ''
  })
}).then(r => r.json()).then(console.log)   // expect {ok:true}
```
- `BOOTSTRAP_SECRET` is a Worker **environment variable** set in the Cloudflare dashboard
  (Worker → Settings → Variables). It must match `secret` above. A 403 means it doesn't match.
- After bootstrapping you can delete the env var.

### Adding more moderators (normal flow)
Once logged into the Admin panel → **Editors** tab → fill name/role → **Generate** an API key
→ copy it and send privately → **Add Editor**. This calls `POST /api/admin/add-key`. Only the
hash is stored; a lost key means delete + re-add. The **Audit Log** tab shows who changed what.

### Deploying Worker changes
Cloudflare dashboard → Workers & Pages → the worker → **Quick Edit** → paste → **Deploy**.
There is no CI; deploys are manual through the dashboard.

### Deploying the frontend / replacing the old site
Static site. Intended host is Cloudflare Pages pointed at this repo's root; `index.html` is the
entry point and routing is **history mode** (clean URLs like `/list`) — the repo's `_redirects`
SPA fallback (`/* /index.html 200`) is required so deep links / refreshes don't 404.
To fully replace an old site: back it up, then point the host at this repo's root.

### Migrating the JSON data into D1 (`scripts/`)
The list's canonical data still lives as JSON files in `/data` (per-level `<slug>.json` +
`_list.json` order, `_pending.json`, `_levelMonth.json`, `_levelVerif.json`). To load it into
the live D1 database:

1. **Make sure `/data` is current.** The generator only sees the working tree. If `main` has
   newer data than this checkout, pull it first (`git checkout origin/main -- data/`) — otherwise
   you migrate a stale snapshot (this bit us once: 447 vs 479 levels).
2. `node scripts/build-migration.js` → regenerates `scripts/migrate.sql` (a `DELETE`+`INSERT`
   replace of `levels` and `pending`, plus a `config` upsert for `levelMonth`/`levelVerif`).
   **Editors are never touched** (key hashes aren't in the JSON).
3. Import: `wrangler d1 execute d1-template-database --remote --file=scripts/migrate.sql`.
   `wrangler ... --file` runs the file as one atomic batch, so a failure rolls back.

Gotchas learned the hard way:
- **No `BEGIN TRANSACTION`/`COMMIT`** in the SQL — D1 rejects SQL transaction statements.
- **Only insert columns that exist on the real table.** The reconstructed Worker referenced
  `password`/`difficulty` on `levels`, which don't exist live — the generator omits them.
- Run the Step-0 `ALTER TABLE` migrations (section 8, D1 setup SQL) first so `frameCounter`,
  `benchmark`, and `indefinite` exist before importing.

---

## 9. Suggested first actions for the next agent

1. Hit these live URLs in a browser and record what they return:
   `/api/editors`, `/api/level-month`, `/api/level-verif`, `/api/auth/validate` (needs a key),
   `/api/recent-changes`.
2. In the D1 Console: `PRAGMA table_info(editor_keys);`, `PRAGMA table_info(levels);`,
   `SELECT name,role,link FROM editor_keys;`, `SELECT key FROM config;`.
3. From those results, pinpoint which of section 4's causes is real and apply the matching
   fix (add the `link` column, create/seed `config`, restore `/api/auth/validate`, etc.).
4. Confirm the live Worker still has `/api/auth/validate` and `/api/recent-changes` — restore
   them if the reconstructed copy was deployed over the original.

---

## 10. Key facts cheat-sheet

- API base: `https://d1-wrkr.ullteam.workers.dev`
- D1 database name: `d1-template-database`, bound as `env.DB`
- Worker & DB are edited only in the Cloudflare dashboard; **neither is in this repo**
- Auth: `Authorization: Bearer <key>`; DB stores `sha256(key)` in `editor_keys.key_hash`
- Roles: `owner, admin, seniormod, mod, dev`
- `sort_order` = level ranking (contiguous integer, shifted on insert/delete/move)
- Dates use `DD.MM.YYYY`
- Current site version: **v2.0.0**
- Working branch: `claude/pending-removal-filter-jy7hO`
