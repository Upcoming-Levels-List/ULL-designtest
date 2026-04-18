import { store } from '../main.js';
import { fetchEditors, fetchLevelMonth, fetchLevelVerif } from '../content.js';
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
                    <div class="home-changes-date">April 18, 2026</div>
                    <div class="home-change"><span class="dim">— </span><strong>Furioso</strong><span class="dim"> has been moved down from #43 to #86, above </span><strong>Graveyard</strong><span class="dim"> and below </span><strong>Redemption</strong></div>
                    <div class="home-change"><span class="dim">— </span><strong>Abyss of Darkness</strong><span class="dim"> has been moved up from #112 to #78, above </span><strong>Bloodlust</strong></div>

                    <div class="home-changes-date">April 15, 2026</div>
                    <div class="home-change"><span class="dim">— </span><strong>Silent Circles</strong><span class="dim"> has been added to the list at #55, above </span><strong>Athanatos</strong></div>
                    <div class="home-change"><span class="dim">— </span><strong>Tartarus Redux</strong><span class="dim"> has been moved down from #28 to #41, below </span><strong>Cataclysm</strong><span class="dim"> and above </span><strong>Plasma Pulse</strong></div>

                    <div class="home-changes-date">April 11, 2026</div>
                    <div class="home-change"><span class="dim">— </span><strong>Fearless</strong><span class="dim"> has been added to the list at #8, above </span><strong>Sonic Wave Infinity</strong></div>
                    <div class="home-change"><span class="dim">— </span><strong>The Hell Zone</strong><span class="dim"> has been removed from the list (rated)</span></div>

                    <div class="home-changes-date">April 7, 2026</div>
                    <div class="home-change"><span class="dim">— </span><strong>Halo</strong><span class="dim"> has been moved up from #31 to #19, above </span><strong>The Eschaton</strong></div>
                    <div class="home-change"><span class="dim">— </span><strong>Zodiac II</strong><span class="dim"> has been added to the list at #67</span></div>

                    <div class="home-changes-date">April 3, 2026</div>
                    <div class="home-change"><span class="dim">— </span><strong>Avernus</strong><span class="dim"> has been moved down from #14 to #22, below </span><strong>Digital Descent</strong></div>
                    <div class="home-change"><span class="dim">— </span><strong>Pixel Heaven 2.0</strong><span class="dim"> has been added to the list at #103</span></div>

                    <div class="home-changes-date">March 29, 2026</div>
                    <div class="home-change"><span class="dim">— </span><strong>Acheron</strong><span class="dim"> has been designated Level of the Month</span></div>
                    <div class="home-change"><span class="dim">— </span><strong>Slaughterhouse</strong><span class="dim"> has been moved down from #5 to #11, below </span><strong>Plasma Pulse Finale</strong></div>
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
            <div class="home-card" v-if="levelMonth">
                <div class="home-card__title">Level of the Month</div>
                <div class="home-level-name">{{ levelMonth.name }}</div>
                <div class="home-level-info">
                    <span class="home-level-rank">#{{ levelMonth.rank }}</span>
                    <span class="home-level-sep">·</span>
                    <span class="home-level-author">by {{ levelMonth.author }}</span>
                    <span class="home-level-sep">·</span>
                    <span class="home-level-id">{{ levelMonth.id }}</span>
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
            </div>

            <!-- Closest to Verification -->
            <div class="home-card home-ctv-card" v-if="levelVerif">
                <div class="home-card__title">Closest to Verification</div>
                <div class="home-level-name">{{ levelVerif.name }}</div>
                <div class="home-level-info">
                    <span class="home-level-rank">#{{ levelVerif.rank }}</span>
                    <span class="home-level-sep">·</span>
                    <span class="home-level-author">by {{ levelVerif.author }}</span>
                    <span class="home-level-sep">·</span>
                    <span class="home-level-author">Verifier: {{ levelVerif.verifier }}</span>
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
        roleIconMap,
        levelMonth: null,
        levelVerif: null,
    }),
    computed: {
        lotmPeriod() {
            if (!this.levelMonth?.periodStart) return '';
            const [y, m, d] = this.levelMonth.periodStart.split('-').map(Number);
            const start = new Date(y, m - 1, d);
            const end = new Date(y, m, d);
            const fmt = date => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            return `${fmt(start)} – ${fmt(end)}`;
        },
    },
    async mounted() {
        [this.editors, this.levelMonth, this.levelVerif] = await Promise.all([
            fetchEditors(),
            fetchLevelMonth(),
            fetchLevelVerif(),
        ]);
        if (!this.editors) this.editors = [];
    },
    methods: {
        roleLabel(role) { return roleLabelMap[role] || role; },
    },
};
