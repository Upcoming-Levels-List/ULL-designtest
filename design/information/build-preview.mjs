#!/usr/bin/env node
// Assembles design/information/preview.html from the shipped component layer
// (css/ull-v2.css) and the four templates in design/information/templates/.
// Like design/build-preview.mjs, the deck reads the real stylesheet rather than
// a copy of it, so a mockup cannot claim a component the site does not have.
//
//   node design/information/build-preview.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ORDER = ['shelf', 'manual', 'hub', 'document'];
const LETTERS = ['A', 'B', 'C', 'D'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const pages = ORDER.map((name, i) => {
    const raw = fs.readFileSync(path.join(DIR, 'templates', `${name}.html`), 'utf8');
    const meta = {};
    const block = raw.match(/<!--meta\n([\s\S]*?)\n-->/);
    if (!block) throw new Error(`${name}.html has no meta block`);
    for (const line of block[1].split('\n')) {
        const at = line.indexOf(':');
        if (at > 0) meta[line.slice(0, at).trim()] = line.slice(at + 1).trim();
    }
    return { name, letter: LETTERS[i], meta, body: raw.slice(block[0].length).trim() };
});

const component = fs.readFileSync(path.join(DIR, '..', '..', 'css', 'ull-v2.css'), 'utf8');
const shell = fs.readFileSync(path.join(DIR, 'preview.shell.html'), 'utf8');

const nav = pages
    .map((p, i) => `<a class="rail__item${i === 0 ? ' is-on' : ''}" href="#${p.name}"><b>${p.letter}. ${esc(p.meta.title)}</b><code>${esc(p.meta.tag)}</code></a>`)
    .join('\n        ');

const sections = pages
    .map((p) => `
    <section class="pg" id="${p.name}">
        <div class="pg__head">
            <div class="pg__label">
                <h2>${p.letter}. ${esc(p.meta.title)}</h2>
                <code class="pg__n">${esc(p.meta.tag)}</code>
            </div>
            <code class="pg__files">${esc(p.meta.files)}</code>
        </div>
        <p class="pg__idea">${p.meta.idea}</p>
        <div class="pg__notes">
            <div class="note note--weight">
                <div class="note__k">How it settles the weighting</div>
                <p>${p.meta.weight}</p>
            </div>
            <div class="note note--cost">
                <div class="note__k">What it costs to build</div>
                <p>${p.meta.cost}</p>
            </div>
            <div class="note note--watch">
                <div class="note__k">What to watch for</div>
                <p>${p.meta.watch}</p>
            </div>
        </div>
        <div class="frame">
            <div class="frame__bar"><span></span><span></span><span></span><code>ull.pages.dev/information</code><em>${esc(p.meta.state)}</em></div>
            <div class="frame__view root" data-mock>
${p.body}
            </div>
        </div>
    </section>`)
    .join('\n');

const out = shell
    .replace('/*__COMPONENT_CSS__*/', component)
    .replace('<!--__NAV__-->', nav)
    .replace('<!--__SECTIONS__-->', sections);

fs.writeFileSync(path.join(DIR, 'preview.html'), out);
console.log(`built design/information/preview.html from ${pages.length} templates (${(out.length / 1024).toFixed(1)} KB)`);
