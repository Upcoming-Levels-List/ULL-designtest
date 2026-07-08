const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
function err(msg, status = 400) {
  return json({ error: msg }, status);
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Returns editor name (string) if authenticated, null if not.
// NOTE: the real DB column is `editor_name`, not `name`.
async function authed(req, db) {
  const auth = req.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const hash = await sha256(token);
  const row = await db.prepare('SELECT editor_name FROM editor_keys WHERE key_hash = ?').bind(hash).first();
  return row ? row.editor_name : null;
}

async function log(db, editor, action, target, details = '') {
  try {
    await db.prepare(
      'INSERT INTO audit_log (editor_name, action, target, details) VALUES (?, ?, ?, ?)'
    ).bind(editor, action, target, details).run();
  } catch { /* never fail the main request */ }
}

function parseLevel(row) {
  return {
    path: row.path,
    name: row.name,
    author: row.author,
    creators: tryJSON(row.creators, []),
    verifier: row.verifier,
    verification: row.verification,
    showcase: row.showcase,
    thumbnail: row.thumbnail,
    frameCounter: row.frameCounter || null,
    id: row.id,
    password: row.password,
    difficulty: row.difficulty,
    rating: row.rating,
    length: row.length,
    percentToQualify: row.percentToQualify,
    percentFinished: row.percentFinished,
    lastUpd: row.lastUpd,
    tags: tryJSON(row.tags, []),
    records: tryJSON(row.records, []),
    run: tryJSON(row.run, []),
    isVerified: row.isVerified === 1,
    isMain: row.isMain === 1,
    isFuture: row.isFuture === 1,
    benchmark: row.benchmark === 1,
    sort_order: row.sort_order,
  };
}

function tryJSON(val, fallback) {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

export default {
  async fetch(req, env) {
    const db = env.DB;
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (method === 'OPTIONS') return new Response(null, { headers: CORS });

    // ── GET /api/list ──────────────────────────────────────────
    if (method === 'GET' && path === '/api/list') {
      const { results } = await db.prepare(
        'SELECT * FROM levels ORDER BY sort_order ASC'
      ).all();
      return json(results.map(parseLevel));
    }

    // ── GET /api/list/main ─────────────────────────────────────
    if (method === 'GET' && path === '/api/list/main') {
      const { results } = await db.prepare(
        'SELECT * FROM levels WHERE isMain = 1 AND isVerified = 0 ORDER BY sort_order ASC'
      ).all();
      return json(results.map(parseLevel));
    }

    // ── GET /api/list/future ───────────────────────────────────
    if (method === 'GET' && path === '/api/list/future') {
      const { results } = await db.prepare(
        'SELECT * FROM levels WHERE isFuture = 1 AND isVerified = 0 ORDER BY sort_order ASC'
      ).all();
      return json(results.map(parseLevel));
    }

    // ── GET /api/levels/:position ──────────────────────────────
    const posMatch = path.match(/^\/api\/levels\/(\d+)$/);
    if (method === 'GET' && posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const { results } = await db.prepare(
        'SELECT * FROM levels ORDER BY sort_order ASC LIMIT 1 OFFSET ?'
      ).bind(pos - 1).all();
      if (!results.length) return err('Not found', 404);
      return json(parseLevel(results[0]));
    }

    // ── GET /api/pending ───────────────────────────────────────
    if (method === 'GET' && path === '/api/pending') {
      const { results } = await db.prepare(
        'SELECT * FROM pending ORDER BY created_at DESC'
      ).all();
      return json(results);
    }

    // ── GET /api/editors ───────────────────────────────────────
    // FIX: real column is `editor_name`; alias it back to `name`
    // so the frontend still receives objects shaped like {name, role, link}.
    if (method === 'GET' && path === '/api/editors') {
      const { results } = await db.prepare(
        'SELECT editor_name AS name, role, link FROM editor_keys ORDER BY editor_name ASC'
      ).all();
      return json(results);
    }

    // ── GET /api/auth/validate ─────────────────────────────────
    // NEW: the admin login calls this to check a key. 200 = valid, 401 = not.
    if (method === 'GET' && path === '/api/auth/validate') {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      return json({ ok: true, name: editor });
    }

    // ── GET /api/audit-log ─────────────────────────────────────
    if (method === 'GET' && path === '/api/audit-log') {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const { results } = await db.prepare(
        'SELECT * FROM audit_log ORDER BY id DESC LIMIT 100'
      ).all();
      return json(results);
    }

    // ── GET /api/level-month ───────────────────────────────────
    if (method === 'GET' && path === '/api/level-month') {
      const row = await db.prepare(
        "SELECT value FROM config WHERE key = 'levelMonth'"
      ).first();
      return json(row ? tryJSON(row.value, null) : null);
    }

    // ── GET /api/level-verif ───────────────────────────────────
    if (method === 'GET' && path === '/api/level-verif') {
      const row = await db.prepare(
        "SELECT value FROM config WHERE key = 'levelVerif'"
      ).first();
      return json(row ? tryJSON(row.value, null) : null);
    }

    // ── GET /api/recent-changes ────────────────────────────────
    // FIX: the frontend calls /api/recent-changes (was named /api/changes here).
    if (method === 'GET' && path === '/api/recent-changes') {
      const { results } = await db.prepare(
        'SELECT * FROM changes ORDER BY sort_order ASC'
      ).all();
      return json(results.map(r => ({ date: r.date, entries: tryJSON(r.entries, []) })));
    }

    // ── GET /api/leaderboard ───────────────────────────────────
    if (method === 'GET' && path === '/api/leaderboard') {
      const { results } = await db.prepare(
        'SELECT * FROM leaderboard ORDER BY score DESC'
      ).all();
      return json(results);
    }

    // ── GET /api/upcoming ──────────────────────────────────────
    if (method === 'GET' && path === '/api/upcoming') {
      const { results } = await db.prepare(
        'SELECT * FROM upcoming ORDER BY sort_order ASC'
      ).all();
      return json(results.map(r => ({ ...r, tags: tryJSON(r.tags, []) })));
    }

    // ── PUT /api/levels (insert or update) ────────────────────
    if (method === 'PUT' && path === '/api/levels') {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const body = await req.json();
      const {
        path: lpath, name, author, creators, verifier, verification, showcase,
        thumbnail, frameCounter, id, password, difficulty, rating, length,
        percentToQualify, percentFinished, lastUpd, tags, records, run,
        isVerified, isMain, isFuture, benchmark, insertAt,
      } = body;

      const existing = await db.prepare('SELECT sort_order FROM levels WHERE path = ?').bind(lpath).first();

      if (existing) {
        // Update existing
        await db.prepare(`
          UPDATE levels SET
            name=?, author=?, creators=?, verifier=?, verification=?, showcase=?,
            thumbnail=?, frameCounter=?, id=?, password=?, difficulty=?, rating=?,
            length=?, percentToQualify=?, percentFinished=?, lastUpd=?, tags=?,
            records=?, run=?, isVerified=?, isMain=?, isFuture=?, benchmark=?
          WHERE path=?
        `).bind(
          name, author, JSON.stringify(creators), verifier, verification, showcase,
          thumbnail, frameCounter || null, String(id), password, difficulty, rating,
          length, percentToQualify, percentFinished, lastUpd, JSON.stringify(tags),
          JSON.stringify(records), JSON.stringify(run),
          isVerified ? 1 : 0, isMain ? 1 : 0, isFuture ? 1 : 0, benchmark ? 1 : 0,
          lpath
        ).run();
        await log(db, editor, 'UPDATE', lpath, `${name} by ${author}`);
      } else {
        // Insert new — shift everything at insertAt and below down by 1
        const target = insertAt || 1;
        await db.prepare(
          'UPDATE levels SET sort_order = sort_order + 1 WHERE sort_order >= ?'
        ).bind(target).run();
        await db.prepare(`
          INSERT INTO levels
            (path, name, author, creators, verifier, verification, showcase,
             thumbnail, frameCounter, id, password, difficulty, rating,
             length, percentToQualify, percentFinished, lastUpd, tags,
             records, run, isVerified, isMain, isFuture, benchmark, sort_order)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).bind(
          lpath, name, author, JSON.stringify(creators), verifier, verification, showcase,
          thumbnail, frameCounter || null, String(id), password, difficulty, rating,
          length, percentToQualify, percentFinished, lastUpd, JSON.stringify(tags),
          JSON.stringify(records), JSON.stringify(run),
          isVerified ? 1 : 0, isMain ? 1 : 0, isFuture ? 1 : 0, benchmark ? 1 : 0,
          target
        ).run();
        await log(db, editor, 'INSERT', lpath, `${name} at pos ${target}`);
      }
      return json({ ok: true });
    }

    // ── POST /api/levels/move ──────────────────────────────────
    if (method === 'POST' && path === '/api/levels/move') {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const { path: lpath, newPosition } = await req.json();
      if (!lpath || !newPosition) return err('path and newPosition required');

      // Fetch all sort_orders in order to get current rank without arithmetic
      const { results: all } = await db.prepare(
        'SELECT path, sort_order FROM levels ORDER BY sort_order ASC'
      ).all();
      const currentIndex = all.findIndex(r => r.path === lpath);
      if (currentIndex === -1) return err('Level not found', 404);

      const currentSortOrder = all[currentIndex].sort_order;
      const targetIndex = Math.max(0, Math.min(newPosition - 1, all.length - 1));
      const targetSortOrder = all[targetIndex].sort_order;

      if (currentSortOrder === targetSortOrder) return json({ ok: true });

      if (currentSortOrder < targetSortOrder) {
        // Moving down: shift levels in between up by 1
        await db.prepare(
          'UPDATE levels SET sort_order = sort_order - 1 WHERE sort_order > ? AND sort_order <= ?'
        ).bind(currentSortOrder, targetSortOrder).run();
      } else {
        // Moving up: shift levels in between down by 1
        await db.prepare(
          'UPDATE levels SET sort_order = sort_order + 1 WHERE sort_order >= ? AND sort_order < ?'
        ).bind(targetSortOrder, currentSortOrder).run();
      }
      await db.prepare('UPDATE levels SET sort_order = ? WHERE path = ?')
        .bind(targetSortOrder, lpath).run();

      await log(db, editor, 'MOVE', lpath, `to position ${newPosition}`);
      return json({ ok: true });
    }

    // ── DELETE /api/levels/:path ───────────────────────────────
    const delLevelMatch = path.match(/^\/api\/levels\/(.+)$/);
    if (method === 'DELETE' && delLevelMatch && !path.startsWith('/api/levels/move')) {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const lpath = decodeURIComponent(delLevelMatch[1]);
      // Don't match numeric paths (those are GET /api/levels/:position)
      if (/^\d+$/.test(lpath)) return err('Not found', 404);
      const row = await db.prepare('SELECT sort_order, name FROM levels WHERE path = ?').bind(lpath).first();
      if (!row) return err('Not found', 404);
      await db.prepare('DELETE FROM levels WHERE path = ?').bind(lpath).run();
      await db.prepare('UPDATE levels SET sort_order = sort_order - 1 WHERE sort_order > ?').bind(row.sort_order).run();
      await log(db, editor, 'DELETE', lpath, row.name);
      return json({ ok: true });
    }

    // ── PUT /api/pending (submit or update) ───────────────────
    if (method === 'PUT' && path === '/api/pending') {
      const body = await req.json();
      const isEditor = !!(await authed(req, db));

      if (isEditor) {
        // Editor updating status/notes
        const { id, status, notes } = body;
        if (!id) return err('id required');
        await db.prepare('UPDATE pending SET status=?, notes=? WHERE id=?')
          .bind(status || 'pending', notes || '', id).run();
        const editor = await authed(req, db);
        await log(db, editor, 'PENDING_UPDATE', String(id), `status=${status}`);
        return json({ ok: true });
      } else {
        // Public submission
        const { name, author, link, reason } = body;
        if (!name || !author) return err('name and author required');
        await db.prepare(
          'INSERT INTO pending (name, author, link, reason, status) VALUES (?, ?, ?, ?, ?)'
        ).bind(name, author, link || '', reason || '', 'pending').run();
        return json({ ok: true });
      }
    }

    // ── DELETE /api/pending/:id ────────────────────────────────
    const delPendMatch = path.match(/^\/api\/pending\/(\d+)$/);
    if (method === 'DELETE' && delPendMatch) {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const id = delPendMatch[1];
      await db.prepare('DELETE FROM pending WHERE id = ?').bind(id).run();
      await log(db, editor, 'PENDING_DELETE', id);
      return json({ ok: true });
    }

    // ── POST /api/admin/pending (create a Pending List entry) ──
    // placement drives the icon (a tier number, "?", or "up"/"down").
    // indefinite = 1 puts the entry in the "Pending Indefinitely" section.
    if (method === 'POST' && path === '/api/admin/pending') {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const { name, placement, link, indefinite } = await req.json();
      if (!name) return err('name required');
      await db.prepare(
        'INSERT INTO pending (name, placement, link, indefinite) VALUES (?, ?, ?, ?)'
      ).bind(name, placement || '?', link || '', indefinite ? 1 : 0).run();
      await log(db, editor, 'PENDING_ADD', name, `placement=${placement || '?'} indefinite=${indefinite ? 1 : 0}`);
      return json({ ok: true });
    }

    // ── PUT /api/admin/pending (update a Pending List entry) ──
    if (method === 'PUT' && path === '/api/admin/pending') {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const { id, name, placement, link, indefinite } = await req.json();
      if (!id) return err('id required');
      if (!name) return err('name required');
      await db.prepare(
        'UPDATE pending SET name = ?, placement = ?, link = ?, indefinite = ? WHERE id = ?'
      ).bind(name, placement || '?', link || '', indefinite ? 1 : 0, id).run();
      await log(db, editor, 'PENDING_EDIT', String(id), `${name} placement=${placement || '?'} indefinite=${indefinite ? 1 : 0}`);
      return json({ ok: true });
    }

    // ── PUT /api/config ────────────────────────────────────────
    if (method === 'PUT' && path === '/api/config') {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const body = await req.json();
      for (const [key, value] of Object.entries(body)) {
        const existing = await db.prepare('SELECT key FROM config WHERE key = ?').bind(key).first();
        if (existing) {
          await db.prepare('UPDATE config SET value = ? WHERE key = ?')
            .bind(JSON.stringify(value), key).run();
        } else {
          await db.prepare('INSERT INTO config (key, value) VALUES (?, ?)')
            .bind(key, JSON.stringify(value)).run();
        }
        await log(db, editor, 'CONFIG_UPDATE', key);
      }
      return json({ ok: true });
    }

    // ── PATCH /api/editors ─────────────────────────────────────
    // FIX: match on editor_name, not name.
    if (method === 'PATCH' && path === '/api/editors') {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const { name, role, link } = await req.json();
      if (!name) return err('name required');
      await db.prepare('UPDATE editor_keys SET role = ?, link = ? WHERE editor_name = ?')
        .bind(role || 'mod', link || '', name).run();
      await log(db, editor, 'EDITOR_UPDATE', name, `role=${role}`);
      return json({ ok: true });
    }

    // ── DELETE /api/editors/:name ──────────────────────────────
    // FIX: match on editor_name, not name.
    const delEditorMatch = path.match(/^\/api\/editors\/(.+)$/);
    if (method === 'DELETE' && delEditorMatch) {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const name = decodeURIComponent(delEditorMatch[1]);
      await db.prepare('DELETE FROM editor_keys WHERE editor_name = ?').bind(name).run();
      await log(db, editor, 'EDITOR_DELETE', name);
      return json({ ok: true });
    }

    // ── POST /api/admin/bootstrap ──────────────────────────────
    // FIX: insert into editor_name, not name.
    if (method === 'POST' && path === '/api/admin/bootstrap') {
      const body = await req.json();
      const { secret, name, key, role, link } = body;
      if (secret !== env.BOOTSTRAP_SECRET) return err('Forbidden', 403);
      const hash = await sha256(key);
      await db.prepare(
        'INSERT INTO editor_keys (editor_name, key_hash, role, link) VALUES (?, ?, ?, ?)'
      ).bind(name || 'admin', hash, role || 'admin', link || '').run();
      return json({ ok: true });
    }

    // ── POST /api/admin/add-key ────────────────────────────────
    // FIX: select/insert using editor_name, not name.
    if (method === 'POST' && path === '/api/admin/add-key') {
      const editor = await authed(req, db);
      if (!editor) return err('Unauthorized', 401);
      const { name, key, role, link } = await req.json();
      if (!name || !key) return err('name and key required');
      const hash = await sha256(key);
      const existing = await db.prepare('SELECT editor_name FROM editor_keys WHERE editor_name = ?').bind(name).first();
      if (existing) return err(`Editor "${name}" already exists`);
      await db.prepare(
        'INSERT INTO editor_keys (editor_name, key_hash, role, link) VALUES (?, ?, ?, ?)'
      ).bind(name, hash, role || 'mod', link || '').run();
      await log(db, editor, 'EDITOR_ADD', name, `role=${role || 'mod'}`);
      return json({ ok: true });
    }

    return err('Not found', 404);
  },
};
