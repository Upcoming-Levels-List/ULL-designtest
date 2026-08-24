-- ULL D1 schema migrations.
-- Run these in the Cloudflare D1 Console (or with
--   wrangler d1 execute d1-template-database --remote --file=scripts/schema-migrations.sql
-- ) BEFORE deploying the matching worker/worker.js.
--
-- Every statement is safe to re-run except the ALTER TABLEs: a
-- "duplicate column name" error just means that column already exists — ignore it
-- and continue with the next statement. (Run the ALTERs one at a time in the
-- Console so one duplicate doesn't abort the rest.)
--
-- No BEGIN/COMMIT: D1 forbids SQL transaction statements.

-- ── Manual ordering of List Editors ───────────────────────────────────────────
-- The editors list is arranged in the admin panel (Editors tab → ▲ / ▼), never
-- sorted alphabetically. GET /api/editors orders by sort_order ASC, id ASC.
ALTER TABLE editor_keys ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Seed a sensible starting order (owner → admin → seniormod → mod → dev, then by
-- id) so the list isn't all-zero before anyone touches the arrows. Safe to re-run:
-- it only rewrites sort_order, which the admin panel owns from then on.
UPDATE editor_keys SET sort_order = (
    SELECT COUNT(*) FROM editor_keys AS e2
    WHERE (CASE e2.role
             WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'seniormod' THEN 2
             WHEN 'mod' THEN 3 WHEN 'dev' THEN 4 ELSE 5 END,
           e2.id)
        < (CASE editor_keys.role
             WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'seniormod' THEN 2
             WHEN 'mod' THEN 3 WHEN 'dev' THEN 4 ELSE 5 END,
           editor_keys.id)
);

-- ── Recent Changes feed ───────────────────────────────────────────────────────
-- One row per change line. `date` is free text ("April 18, 2026") so entries can
-- be backdated; ordering is controlled entirely by sort_order, which the admin
-- panel's Changes tab rewrites with ▲ / ▼.
CREATE TABLE IF NOT EXISTS recent_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    change TEXT NOT NULL,
    sort_order INTEGER
);

-- ── Existing extras (kept here so one file sets up a fresh DB) ────────────────
ALTER TABLE levels ADD COLUMN frameCounter TEXT;
ALTER TABLE levels ADD COLUMN benchmark INTEGER DEFAULT 0;
ALTER TABLE pending ADD COLUMN indefinite INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    editor_name TEXT,
    action TEXT,
    target TEXT,
    details TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
