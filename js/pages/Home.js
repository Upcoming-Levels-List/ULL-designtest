import { store } from '../main.js';
import { fetchEditors, fetchLevelMonth, fetchLevelVerif, fetchRecentChanges } from '../content.js';
import Footer from '../components/Footer.js';

function ytThumb(url) {
    if (!url) return '';
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : url;
}

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
    seniormod: 'Sr. Mod',
    mod: 'Mod',
    dev: 'Dev',
};

export default {
    components: { Footer },
    template: `
<main class="home-page surface">

    <!-- ── HERO ── -->
    <section class="home-hero">
        <div class="home-hero-content">
            <h1 class="home-hero-title">Upcoming Levels List</h1>
            <p class="home-hero-desc">
                A community-maintained catalogue forecasting the future of the Geometry Dash Demonlist.
                Tracking upcoming Top 1–100 Extreme Demons before they reach Pointercrate.
            </p>
            <div class="home-hero-actions">
                <router-link to="/list" class="home-btn home-btn--primary">View All Levels</router-link>
                <router-link to="/listfuture" class="home-btn home-btn--primary">Explore Future List</router-link>
                <router-link to="/information" class="home-btn home-btn--primary">Learn More</router-link>
            </div>
            <div class="home-hero-social">
                <a href="https://discord.gg/9wVWSgJSe8" target="_blank" class="home-social-btn">
                    <img src="/assets/discord.svg" :style="store.dark ? 'filter:invert(1)' : ''" alt="Discord" />
                    Discord
                </a>
                <a href="#" class="home-social-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
                        <path d="M22.26 2.01L1.27 10.25c-1.42.57-1.4 1.37-.26 1.73l5.35 1.67 12.38-7.82c.58-.36 1.12-.16.68.23L8.83 16.95l-.4 5.63c.58 0 .84-.27 1.16-.58l2.79-2.71 5.8 4.28c1.07.59 1.84.29 2.1-.99l3.8-17.89c.4-1.58-.6-2.3-1.82-1.68z"/>
                    </svg>
                    Telegram
                </a>
            </div>
        </div>
    </section>

    <!-- ── CONTENT ── -->
    <div class="home-content">

        <!-- Row 1: Recent Changes + List Editors -->
        <div class="home-grid-2col">

            <!-- Recent Changes -->
            <div class="home-card home-card--scroll">
                <div class="home-card__title">Recent Changes</div>
                <div class="home-changes">
                    <template v-for="group in recentChanges" :key="group.date">
                        <div class="home-changes-date">{{ group.date }}</div>
                        <div v-for="entry in group.entries" :key="entry" class="home-change" v-html="formatChange(entry)"></div>
                    </template>
                </div>
            </div>

            <!-- List Editors -->
            <div class="home-card">
                <div class="home-card__title">List Editors</div>
                <p class="home-editors-desc">Trusted members responsible for maintaining the Upcoming Levels List — adding levels, updating placements, and keeping the list accurate.</p>
                <div class="info-editors">
                    <div v-for="editor in editors" :key="editor.name" class="info-editor">
                        <img :src="'/assets/' + (roleIconMap[editor.role] || 'user-lock') + (store.dark ? '' : '-dark') + '.svg'" :alt="editor.role" />
                        <a v-if="editor.link && editor.link !== '#'" :href="editor.link" target="_blank">{{ editor.name }}</a>
                        <span v-else class="info-editor__name">{{ editor.name }}</span>
                        <span class="info-role" :class="'info-role-' + editor.role">{{ roleLabel(editor.role) }}</span>
                    </div>
                </div>
            </div>

        </div>

        <!-- Row 2: Level of the Month + Closest to Verification -->
        <div class="home-grid-2col">

            <!-- Level of the Month -->
            <div class="home-card home-lotm-card" v-if="levelMonth">
                <div class="home-card__title">Level of the Month</div>
                <div class="home-level-header">
                    <div class="home-level-thumb">
                        <img v-if="lotmThumb" :src="lotmThumb" alt="" />
                    </div>
                    <div class="home-level-meta">
                        <div class="home-level-name">{{ levelMonth.name }}</div>
                        <div class="home-level-info">
                            <span class="home-level-rank">#{{ levelMonth.rank }}</span>
                            <span class="home-level-sep">·</span>
                            <span class="home-level-author">by {{ levelMonth.author }}</span>
                            <span class="home-level-sep">·</span>
                            <span class="home-level-id">{{ levelMonth.id }}</span>
                        </div>
                    </div>
                </div>
                <div class="home-record-box">
                    <a :href="levelMonth.record.link || '#'" class="home-record-row">
                        <span class="home-record-pct">{{ levelMonth.record.percent }}</span>
                        <span class="home-record-player">{{ levelMonth.record.player }}</span>
                        <span class="home-record-label">Best from zero</span>
                    </a>
                    <a :href="levelMonth.run.link || '#'" class="home-record-row">
                        <span class="home-record-pct">{{ levelMonth.run.percent }}</span>
                        <span class="home-record-player">{{ levelMonth.run.player }}</span>
                        <span class="home-record-label">Best run</span>
                    </a>
                </div>
                <a href="https://discord.gg/9wVWSgJSe8" target="_blank" class="home-discord-btn">
                    <img src="/assets/discord.svg" :style="store.dark ? 'filter:invert(1)' : ''" alt="Discord" />
                    Visit our Discord Server
                </a>
            </div>

            <!-- Closest to Verification -->
            <div class="home-card home-ctv-card" v-if="levelVerif">
                <div class="home-card__title">Closest to Verification</div>
                <div class="home-level-header">
                    <div class="home-level-thumb">
                        <img v-if="ctvThumb" :src="ctvThumb" alt="" />
                    </div>
                    <div class="home-level-meta">
                        <div class="home-level-name">{{ levelVerif.name }}</div>
                        <div class="home-level-info">
                            <span class="home-level-rank">#{{ levelVerif.rank }}</span>
                            <span class="home-level-sep">·</span>
                            <span class="home-level-author">by {{ levelVerif.author }}</span>
                            <span class="home-level-sep">·</span>
                            <span class="home-level-author">Verifier: {{ levelVerif.verifier }}</span>
                        </div>
                    </div>
                </div>
                <div class="home-record-box">
                    <a :href="levelVerif.record.link || '#'" class="home-record-row">
                        <span class="home-record-pct">{{ levelVerif.record.percent }}</span>
                        <span class="home-record-player">{{ levelVerif.record.player }}</span>
                        <span class="home-record-label">Best from zero</span>
                    </a>
                    <a :href="levelVerif.run.link || '#'" class="home-record-row">
                        <span class="home-record-pct">{{ levelVerif.run.percent }}</span>
                        <span class="home-record-player">{{ levelVerif.run.player }}</span>
                        <span class="home-record-label">Best run</span>
                    </a>
                </div>
                <router-link to="/upcoming" class="home-ctv-btn">Go to Upcoming Levels</router-link>
            </div>

        </div>

        <!-- Row 3: Partner Lists -->
        <div class="home-card">
            <div class="home-card__title">Partner Lists</div>
            <div class="home-partners-grid">
                <a href="#" target="_blank" class="home-partner">
                    <div class="home-partner-logo"><div class="home-partner-logo-placeholder"></div></div>
                    <div class="home-partner-name">Demonlist</div>
                    <div class="home-partner-desc">The official ranking of the hardest Geometry Dash demons, maintained by Pointercrate.</div>
                </a>
                <a href="#" target="_blank" class="home-partner">
                    <div class="home-partner-logo"><div class="home-partner-logo-placeholder"></div></div>
                    <div class="home-partner-name">Challenge List</div>
                    <div class="home-partner-desc">A community-run list tracking the hardest GD challenges and challenge levels.</div>
                </a>
                <a href="#" target="_blank" class="home-partner">
                    <div class="home-partner-logo"><div class="home-partner-logo-placeholder"></div></div>
                    <div class="home-partner-name">Platformer List</div>
                    <div class="home-partner-desc">Ranking the most difficult platformer levels in Geometry Dash 2.2.</div>
                </a>
                <a href="#" target="_blank" class="home-partner">
                    <div class="home-partner-logo"><div class="home-partner-logo-placeholder"></div></div>
                    <div class="home-partner-name">Upcoming List</div>
                    <div class="home-partner-desc">A sister list tracking upcoming levels from other regions and categories.</div>
                </a>
            </div>
        </div>

    </div>

    <Footer />

</main>
    `,
    data: () => ({
        store,
        editors: [],
        recentChanges: [],
        roleIconMap,
        levelMonth: null,
        levelVerif: null,
    }),
    computed: {
        lotmThumb() { return ytThumb(this.levelMonth?.thumbnail); },
        ctvThumb()  { return ytThumb(this.levelVerif?.thumbnail); },
    },
    async mounted() {
        [this.editors, this.recentChanges, this.levelMonth, this.levelVerif] = await Promise.all([
            fetchEditors(),
            fetchRecentChanges(),
            fetchLevelMonth(),
            fetchLevelVerif(),
        ]);
        if (!this.editors) this.editors = [];
    },
    methods: {
        roleLabel(role) { return roleLabelMap[role] || role; },
        formatChange(text) {
            const html = text
                .split(/(\*\*[^*]+\*\*)/)
                .map(part => part.startsWith('**') && part.endsWith('**')
                    ? `<strong>${part.slice(2, -2)}</strong>`
                    : part ? `<span class="dim">${part}</span>` : '')
                .join('');
            return `<span class="dim">— </span>${html}`;
        },
    },
};
