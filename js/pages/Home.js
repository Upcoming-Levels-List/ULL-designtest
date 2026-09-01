import { store } from '../main.js';
import { fetchEditors, fetchRecentChanges, fetchList, fetchPending } from '../content.js';
import { levelThumbnail, levelSlug, levelStatus } from '../util.js';
import Footer from '../components/Footer.js';

const roleIconMap = {
    owner: 'crown',
    admin: 'user-gear',
    seniormod: 'user-shield',
    mod: 'user-lock',
    dev: 'code',
};

const roleLabelMap = {
    owner: 'Owner',
    admin: 'Admin',
    seniormod: 'Elder Mod',
    mod: 'Mod',
    dev: 'Dev',
};

// Editors are shown in the order the database gives them, grouped by seniority.
// The groups only decide the sub-headings; within a group the DB order stands.
const roleGroups = [
    { label: 'Owner & admin', roles: ['owner', 'admin'] },
    { label: 'Elder moderators', roles: ['seniormod'] },
    { label: 'Moderators', roles: ['mod'] },
    { label: 'Developers', roles: ['dev'] },
];

// The landing page of a level list used to show no levels: a paragraph, three
// buttons all styled as the primary one, and two cards. It now opens with what
// the list currently holds and the top of it, built from the same list the
// other pages already fetch — no field on a level that was not there before.
export default {
    components: { Footer },
    template: `
<main class="home-page surface ull2">

    <section class="home-hero">
        <div class="home-hero-content">
            <div class="home-hero-eyebrow">Geometry Dash &middot; Extreme Demons</div>
            <h1 class="home-hero-title">Upcoming Levels List</h1>
            <p class="home-hero-desc">
                Upcoming Levels List (ULL) is a community-maintained catalogue of upcoming Top 1-100 Extreme Demons in Geometry Dash projected to place on the Demonlist. It aims to forecast future rankings with the inclusion of worthy unrates.
            </p>
            <div class="home-hero-actions">
                <router-link to="/list" class="u-btn">View All Levels</router-link>
                <router-link to="/listfuture" class="u-btn u-btn--ghost">Explore Future List</router-link>
                <router-link to="/information" class="u-btn u-btn--ghost">Learn More</router-link>
            </div>
            <div class="home-hero-social">
                <a href="https://discord.gg/QRX47v2qyC" target="_blank" class="home-social-btn">
                    <img src="/assets/discord.svg" :style="store.dark ? 'filter:invert(1)' : ''" alt="" />
                    Discord
                </a>
                <a href="https://x.com/ull_gd" target="_blank" rel="noopener" class="home-social-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                </a>
            </div>
        </div>
    </section>

    <div v-if="counts" class="home-pulse">
        <div class="home-pulse__cell home-pulse__cell--lead">
            <b>{{ counts.all }}</b><span>Levels tracked</span>
        </div>
        <router-link class="home-pulse__cell" to="/listmain"><b>{{ counts.main }}</b><span>Main List</span></router-link>
        <router-link class="home-pulse__cell" to="/listfuture"><b>{{ counts.future }}</b><span>Future List</span></router-link>
        <div class="home-pulse__cell"><b>{{ counts.verified }}</b><span>Verified</span></div>
        <router-link class="home-pulse__cell" to="/pending"><b>{{ counts.pending }}</b><span>Pending</span></router-link>
    </div>

    <div class="home-content">

        <section v-if="topLevels.length" class="home-section">
            <div class="home-section__head">
                <h2 class="u-eyebrow u-eyebrow--lg">Top of the list</h2>
                <router-link class="home-more" to="/list">All {{ counts ? counts.all : '' }} levels &rarr;</router-link>
            </div>
            <div class="home-top">
                <router-link v-for="entry in topLevels" :key="entry.slug" class="u-row home-top__row" :to="'/level/' + entry.slug">
                    <span class="u-row__lead">#{{ entry.rank }}</span>
                    <img class="u-row__thumb" :src="entry.thumbnail" alt="" loading="lazy" />
                    <span class="u-row__body">
                        <span class="u-row__name">{{ entry.level.name }}</span>
                        <span class="u-row__sub">by {{ entry.level.author }} &middot; {{ entry.level.verifier }}</span>
                    </span>
                    <span class="u-pill" :class="'u-pill--' + entry.status.tone"><i></i>{{ entry.status.label }}</span>
                </router-link>
            </div>
        </section>

        <div class="home-grid-2col">

            <section class="home-card home-card--scroll">
                <div class="home-section__head">
                    <h2 class="u-eyebrow">Recent changes</h2>
                </div>
                <!-- The window is positioned out of flow inside this wrapper, so the
                     feed's length never sets the card's height — the editors card
                     beside it does, and the feed scrolls inside whatever that is. -->
                <div class="home-changes-wrap">
                    <div class="home-changes">
                    <template v-if="recentChanges.length">
                        <template v-for="group in recentChanges" :key="group.date">
                            <div class="home-changes-date">{{ group.date }}</div>
                            <div v-for="entry in group.entries" :key="entry" class="home-change">
                                <span class="home-change__dot" :class="changeTone(entry)"></span>
                                <span class="home-change__text" v-html="formatChange(entry)"></span>
                            </div>
                        </template>
                    </template>
                    <div v-else class="u-empty">
                        <div class="u-empty__t">Nothing logged yet</div>
                        <div class="u-empty__d">Placement changes show up here as the staff team makes them.</div>
                    </div>
                    </div>
                </div>
            </section>

            <section class="home-card">
                <div class="home-section__head">
                    <h2 class="u-eyebrow">List editors <span class="u-count">{{ editors.length }}</span></h2>
                </div>
                <p class="home-editors-desc">Trusted members responsible for maintaining the Upcoming Levels List &mdash; adding levels, updating placements, and keeping the list accurate.</p>
                <div class="home-editors">
                    <!-- Each group gets its own .home-editors-grid. Putting the
                         headings straight into one shared grid made them take a
                         cell of their own, which shuffled the names into it. -->
                    <div v-for="group in editorGroups" :key="group.label" class="home-editors-group">
                        <div class="home-editors-group__label">{{ group.label }}</div>
                        <div class="home-editors-grid">
                            <div v-for="editor in group.editors" :key="editor.name" class="home-editor">
                                <img :src="'/assets/' + (roleIconMap[editor.role] || 'user-lock') + (store.dark ? '' : '-dark') + '.svg'" :alt="editor.role" />
                                <a v-if="editor.link && editor.link !== '#'" :href="editor.link" target="_blank">{{ editor.name }}</a>
                                <span v-else class="home-editor__name">{{ editor.name }}</span>
                                <span class="home-role" :class="'home-role-' + editor.role">{{ roleLabel(editor.role) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>

    </div>

    <Footer />

</main>
    `,
    data: () => ({
        store,
        editors: [],
        recentChanges: [],
        counts: null,
        topLevels: [],
        roleIconMap,
    }),
    computed: {
        // Grouped for the sub-headings, but never reordered inside a group: the
        // e2e test pins editors to the order the database returns.
        editorGroups() {
            return roleGroups
                .map((g) => ({ label: g.label, editors: this.editors.filter((e) => g.roles.includes(e.role)) }))
                .filter((g) => g.editors.length);
        },
    },
    async mounted() {
        const [editors, recentChanges, list, pending] = await Promise.all([
            fetchEditors(),
            fetchRecentChanges(),
            fetchList(),
            fetchPending(),
        ]);

        this.editors = (editors || []).map((e) => (typeof e === 'string' ? { name: e, role: 'mod', link: '' } : e));
        this.recentChanges = recentChanges || [];

        const levels = (list || []).map(([level]) => level).filter(Boolean);
        if (!levels.length) return;

        this.counts = {
            all: levels.length,
            main: levels.filter((l) => l.isMain || l.isVerified).length,
            future: levels.filter((l) => l.isFuture || l.isVerified).length,
            verified: levels.filter((l) => l.isVerified).length,
            pending: (pending || []).length,
        };

        const paths = levels.map((l) => l.path);
        this.topLevels = levels.slice(0, 5).map((level, i) => ({
            level,
            rank: i + 1,
            slug: levelSlug(level.path, paths),
            thumbnail: levelThumbnail(level),
            status: levelStatus(level),
        }));
    },
    methods: {
        roleLabel(role) { return roleLabelMap[role] || role; },
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
            return (text || '')
                .split(/(\*\*[^*]+\*\*)/)
                .map(part => part.startsWith('**') && part.endsWith('**')
                    ? `<strong>${esc(part.slice(2, -2))}</strong>`
                    : part ? `<span class="dim">${esc(part)}</span>` : '')
                .join('');
        },
    },
};
