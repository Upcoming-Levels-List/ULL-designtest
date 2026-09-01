import { store } from '../../main.js';
import { fetchRecentChanges } from '../../content.js';
import { levelThumbnail, levelSlug, levelStatus, decorationPercent } from '../../util.js';
import { mobileStore } from './mobileStore.js';

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

export default {
    template: `
        <div class="mob-home-page m2-page-body">

            <section class="m2-hero">
                <div class="m2-hero__eyebrow">Geometry Dash · Extreme Demons</div>
                <h1>Upcoming Levels List</h1>
                <p>A community-maintained catalogue of upcoming Top 1-100 Extreme Demons in Geometry Dash, ranked by where the staff team projects each will land on the Demonlist.</p>
                <div v-if="counts" class="m2-figs">
                    <span class="m2-fig m2-fig--lead"><b>{{ counts.all }}</b><span>tracked</span></span>
                    <router-link class="m2-fig" to="/mobile/main"><b>{{ counts.main }}</b><span>main</span></router-link>
                    <router-link class="m2-fig" to="/mobile/future"><b>{{ counts.future }}</b><span>future</span></router-link>
                    <span class="m2-fig"><b>{{ counts.verified }}</b><span>verified</span></span>
                    <router-link class="m2-fig" to="/mobile/pending"><b>{{ counts.pending }}</b><span>pending</span></router-link>
                </div>
            </section>

            <div class="m2-body">

                <section v-if="topLevels.length">
                    <div class="m2-sec__head">
                        <h2 class="u-eyebrow">Top of the list</h2>
                        <router-link class="m2-more" to="/mobile/all">All {{ counts ? counts.all : '' }} →</router-link>
                    </div>
                    <div class="m2-rows m2-rows--flush">
                        <router-link v-for="entry in topLevels" :key="entry.slug" class="m2-row" :to="'/level/' + entry.slug">
                            <span class="m2-row__rank">#{{ entry.rank }}</span>
                            <img class="m2-row__thumb" :src="entry.thumbnail" alt="" loading="lazy" />
                            <span class="m2-row__body">
                                <span class="m2-row__name">{{ entry.level.name }}</span>
                                <span class="m2-row__sub">{{ entry.level.author }} · {{ entry.level.verifier }}</span>
                            </span>
                            <span class="u-pill" :class="'u-pill--' + entry.status.tone"><i></i>{{ entry.short }}</span>
                        </router-link>
                    </div>
                </section>

                <section class="u-card">
                    <h2 class="u-eyebrow">Recent changes</h2>
                    <div v-if="recentChanges.length" class="m2-changes">
                        <template v-for="group in recentChanges" :key="group.date">
                            <div class="m2-tl-date">{{ group.date }}</div>
                            <div v-for="entry in group.entries" :key="entry" class="m2-tl-item" :class="changeTone(entry)">
                                <span class="m2-tl-dot"></span>
                                <div v-html="formatChange(entry)"></div>
                            </div>
                        </template>
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
    }),
    computed: {
        counts() {
            const levels = (mobileStore.rawList || []).map(([level]) => level).filter(Boolean);
            if (!levels.length) return null;
            return {
                all: levels.length,
                main: levels.filter((l) => l.isMain || l.isVerified).length,
                future: levels.filter((l) => l.isFuture || l.isVerified).length,
                verified: levels.filter((l) => l.isVerified).length,
                pending: (mobileStore.pending || []).length,
            };
        },
        topLevels() {
            const levels = (mobileStore.rawList || []).map(([level]) => level).filter(Boolean);
            const paths = levels.map((l) => l.path);
            return levels.slice(0, 5).map((level, i) => {
                const status = levelStatus(level);
                const pf = decorationPercent(level);
                return {
                    level,
                    rank: i + 1,
                    slug: levelSlug(level.path, paths),
                    thumbnail: levelThumbnail(level),
                    status,
                    // The row has no room for "Decoration 80% done".
                    short: status.label.startsWith('Decoration') ? pf + '%'
                        : status.label === 'Being verified' ? 'Verifying' : status.label,
                };
            });
        },
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
