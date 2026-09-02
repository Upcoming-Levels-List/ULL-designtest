import { store } from '../../main.js';
import { fetchRecentChanges } from '../../content.js';
import {
    levelThumbnail, levelSlug, levelStatus,
    decorationPercent, verificationPercent, verificationLabel, verifierLine,
} from '../../util.js';
import { mobileStore } from './mobileStore.js';
import { homeStats } from '../../home-stats.js';

const roleIconMap = {
    owner: 'crown',
    admin: 'user-gear',
    seniormod: 'user-shield',
    mod: 'user-lock',
    dev: 'code',
};

const roleLabelMap = { owner: 'Owner', admin: 'Admin', seniormod: 'Elder Mod', mod: 'Mod', dev: 'Dev' };

// Editors are shown in the order the database gives them, grouped by seniority.
// The groups only decide the sub-headings; within a group the DB order stands.
const roleGroups = [
    { label: 'Owner & admin', roles: ['owner', 'admin'] },
    { label: 'Elder moderators', roles: ['seniormod'] },
    { label: 'Moderators', roles: ['mod'] },
    { label: 'Developers', roles: ['dev'] },
];

// How many days of the change feed are open before the fold.
const FEED_DAYS_OPEN = 1;

export default {
    template: `
        <div class="mob-home-page m2-page-body">

            <section class="m2-hero">
                <div class="m2-hero__eyebrow">Geometry Dash · Extreme Demons</div>
                <h1>Upcoming Levels List</h1>
                <p>Every upcoming Top 1-100 Extreme Demon, ranked by where it is projected to land on the Demonlist.</p>
            </section>

            <!-- The desktop's credentials bar, minus its third item: a phone
                 has room for two of these on one line, and the third is the
                 one a visitor can do least with. -->
            <div v-if="counts" class="u-cred">
                <div v-for="stat in stats" :key="stat.key" class="u-cred__item">
                    <svg class="u-cred__ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path v-for="d in stat.paths" :key="d" :d="d" />
                    </svg>
                    <span class="u-cred__t"><b v-if="stat.value">{{ stat.value }}</b>{{ stat.label }}</span>
                </div>
            </div>

            <!-- #1, introduced the way /level/<slug> introduces it, so the
                 screen a visitor lands on opens on a level rather than on an
                 advert. -->
            <router-link v-if="spotlight" class="mob-spot" :to="'/level/' + spotlight.slug">
                <div class="u-hero">
                    <div class="u-hero__bg" :style="{ backgroundImage: 'url(' + spotlight.thumbnail + ')' }"></div>
                    <div class="u-hero__scrim"></div>
                    <div class="u-hero__inner">
                        <div class="u-hero__body">
                            <div class="u-eyebrow mob-spot__k">Top of the list · #1</div>
                            <h2 class="u-hero__title">{{ spotlight.level.name }}</h2>
                            <p class="u-hero__by">
                                by <b>{{ spotlight.level.author }}</b><template v-if="spotlight.verifier"> · {{ spotlight.verifier.lead }} <b>{{ spotlight.verifier.name }}</b></template>
                            </p>
                        </div>
                        <span class="u-pill" :class="'u-pill--' + spotlight.status.tone"><i></i>{{ spotlight.short }}</span>
                    </div>
                </div>
                <div class="mob-spot__body">
                    <div class="u-meter">
                        <div class="u-meter__top"><span>Decoration</span><b>{{ spotlight.decoration }}%</b></div>
                        <span class="u-bar"><i :style="{ width: spotlight.decoration + '%' }"></i></span>
                    </div>
                    <div class="u-meter">
                        <div class="u-meter__top"><span>Furthest anyone has got</span><b>{{ spotlight.furthest || 'None' }}</b></div>
                        <span class="u-bar u-bar--alt"><i :style="{ width: spotlight.progress + '%' }"></i></span>
                    </div>
                    <div class="mob-spot__foot"><span class="u-btn u-btn--ghost u-btn--block">Open level page</span></div>
                </div>
            </router-link>

            <div class="m2-body">

                <section v-if="nextLevels.length">
                    <div class="m2-sec__head">
                        <h2 class="u-eyebrow">Next on the list</h2>
                        <router-link class="m2-more" to="/mobile/all">All {{ counts ? counts.all : '' }} →</router-link>
                    </div>
                    <div class="m2-rows m2-rows--flush">
                        <router-link v-for="entry in nextLevels" :key="entry.slug" class="m2-row" :to="'/level/' + entry.slug">
                            <span class="m2-row__rank">#{{ entry.rank }}</span>
                            <img class="m2-row__thumb" :src="entry.thumbnail" alt="" loading="lazy" />
                            <span class="m2-row__body">
                                <span class="mob-row__head">
                                    <span class="m2-row__name">{{ entry.level.name }}</span>
                                    <span class="u-pill" :class="'u-pill--' + entry.status.tone"><i></i>{{ entry.short }}</span>
                                </span>
                                <span class="m2-row__sub">{{ entry.level.author }}<template v-if="entry.verifier"> · {{ entry.verifier.name }}</template></span>
                                <span class="mob-row__foot">
                                    <span class="u-bar u-bar--thin"><i :style="{ width: entry.decoration + '%' }"></i></span>
                                    <span v-if="entry.furthest" class="mob-row__pct">{{ entry.furthest }} furthest</span>
                                </span>
                            </span>
                        </router-link>
                    </div>
                </section>

                <!-- No max-height and no overflow: the feed is part of the page,
                     and the page is the only thing that scrolls. It used to be
                     2513px of entries inside a 286px box inside a scrolling
                     page, which on a touch screen means a swipe that lands
                     inside the box moves the wrong thing. -->
                <section class="u-card">
                    <div class="m2-sec__head">
                        <h2 class="u-eyebrow">Recent changes</h2>
                        <span v-if="openChanges" class="m2-more">{{ openChanges }} on the latest day</span>
                    </div>
                    <div v-if="recentChanges.length" class="m2-changes">
                        <template v-for="group in openGroups" :key="group.date">
                            <div class="m2-tl-date">{{ group.date }}</div>
                            <div v-for="entry in group.entries" :key="entry" class="m2-tl-item" :class="changeTone(entry)">
                                <span class="m2-tl-dot"></span>
                                <div v-html="formatChange(entry)"></div>
                            </div>
                        </template>
                        <div v-show="feedOpen" class="m2-changes__more">
                            <template v-for="group in foldedGroups" :key="group.date">
                                <div class="m2-tl-date">{{ group.date }}</div>
                                <div v-for="entry in group.entries" :key="entry" class="m2-tl-item" :class="changeTone(entry)">
                                    <span class="m2-tl-dot"></span>
                                    <div v-html="formatChange(entry)"></div>
                                </div>
                            </template>
                        </div>
                        <button v-if="foldedChanges" class="mob-fold" type="button" @click="feedOpen = !feedOpen">
                            <template v-if="feedOpen">Show fewer ↑</template>
                            <template v-else>Show {{ foldedChanges }} older changes ↓</template>
                        </button>
                    </div>
                    <div v-else class="u-empty">
                        <div class="u-empty__t">Nothing logged yet</div>
                        <div class="u-empty__d">Placement changes show up here as the staff team makes them.</div>
                    </div>
                </section>

                <section class="u-card">
                    <h2 class="u-eyebrow">List editors <span class="u-count">{{ mobileStore.editors.length }}</span></h2>
                    <div class="m2-eds">
                        <div v-for="group in editorGroups" :key="group.label">
                            <div class="m2-eds__label">{{ group.label }}</div>
                            <div v-for="editor in group.editors" :key="editor.name" class="m2-ed">
                                <img class="m2-ed__ic" :src="'/assets/' + (roleIconMap[editor.role] || 'user-lock') + (store.dark ? '' : '-dark') + '.svg'" :alt="editor.role" />
                                <a v-if="editor.link && editor.link !== '#'" :href="editor.link" target="_blank">{{ editor.name }}</a>
                                <span v-else>{{ editor.name }}</span>
                                <span class="m2-ed__role">{{ roleLabelMap[editor.role] || editor.role }}</span>
                            </div>
                        </div>
                    </div>
                    <p class="m2-eds__note">Trusted members who add levels, update placements and keep the list accurate.</p>
                </section>

            </div>
        </div>
    `,
    data: () => ({
        store,
        mobileStore,
        roleIconMap,
        roleLabelMap,
        recentChanges: [],
        feedOpen: false,
    }),
    computed: {
        levels() {
            return (mobileStore.rawList || []).map(([level]) => level).filter(Boolean);
        },
        counts() {
            return this.levels.length ? { all: this.levels.length } : null;
        },
        // The desktop's three, first two only: js/home-stats.js.
        stats() { return homeStats(this.counts && this.counts.all).slice(0, 2); },
        entries() {
            const levels = this.levels;
            const paths = levels.map((l) => l.path);
            return levels.slice(0, 6).map((level, i) => {
                const status = levelStatus(level);
                const pf = decorationPercent(level);
                return {
                    level,
                    rank: i + 1,
                    slug: levelSlug(level.path, paths),
                    thumbnail: levelThumbnail(level),
                    status,
                    verifier: verifierLine(level),
                    decoration: pf,
                    progress: verificationPercent(level),
                    furthest: verificationLabel(level),
                    // The row has no room for "Decoration 80% done".
                    short: status.label.startsWith('Decoration') ? pf + '%'
                        : status.label === 'Being verified' ? 'Verifying' : status.label,
                };
            });
        },
        spotlight() { return this.entries[0] || null; },
        nextLevels() { return this.entries.slice(1); },
        openGroups() { return this.recentChanges.slice(0, FEED_DAYS_OPEN); },
        foldedGroups() { return this.recentChanges.slice(FEED_DAYS_OPEN); },
        openChanges() { return this.openGroups.reduce((n, g) => n + (g.entries || []).length, 0); },
        foldedChanges() { return this.foldedGroups.reduce((n, g) => n + (g.entries || []).length, 0); },
        // Grouped for the sub-headings, never reordered inside a group.
        editorGroups() {
            return roleGroups
                .map((g) => ({ label: g.label, editors: (mobileStore.editors || []).filter((e) => g.roles.includes(e.role)) }))
                .filter((g) => g.editors.length);
        },
    },
    async mounted() {
        this.recentChanges = await fetchRecentChanges() || [];
    },
    methods: {
        // A change line already says which way a level moved; the dot only
        // repeats it in colour so the feed can be scanned without reading.
        changeTone(text) {
            const t = String(text || '').toLowerCase();
            if (/\badded\b|\bplaced\b/.test(t)) return 'is-new';
            if (/\braised\b|\bmoved up\b|\bup\b/.test(t)) return 'is-up';
            if (/\blowered\b|\bmoved down\b|\bdown\b|\bremoved\b/.test(t)) return 'is-down';
            return '';
        },
        // Rendered with v-html so **bold** works — everything else is escaped so
        // stored text can never inject markup into the page.
        formatChange(text) {
            const esc = (s) => String(s)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const html = (text || '')
                .split(/(\*\*[^*]+\*\*)/)
                .map(part => part.startsWith('**') && part.endsWith('**')
                    ? `<strong>${esc(part.slice(2, -2))}</strong>`
                    : part ? `<span class="dim">${esc(part)}</span>` : '')
                .join('');
            return html;
        },
    },
};
