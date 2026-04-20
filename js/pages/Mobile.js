import { store } from "../main.js";
import { fetchEditors, fetchList, fetchPending, fetchLevelMonth, fetchLevelVerif } from "../content.js";
import { recordScore } from "../formulas.js";
import { mobileStore, applyFilters, resetFilters } from "./mobile/mobileStore.js";

import Spinner from "../components/Spinner.js";

const roleIconMap = {
    owner: 'crown',
    admin: 'user-gear',
    seniormod: 'user-shield',
    mod: 'user-lock',
    dev: 'code',
};

export default {
    components: { Spinner },
    template: `
<div class="mob" :class="{ dark: store.dark }">

    <!-- New top bar -->
    <header v-if="$route.path !== '/mobile/home'" class="mob-topbar">
        <router-link to="/mobile/home" class="mob-topbar-logo">
            <span class="mob-topbar-logo-mark">ULL</span>
            <span class="mob-topbar-logo-ver">v1.2.0</span>
        </router-link>
        <nav class="mob-topbar-nav">
            <button
                v-if="$route.path !== '/mobile/pending' && $route.path !== '/mobile/info' && $route.path !== '/mobile/events'"
                class="mob-topbar-btn" :class="{ active: openMenu === 'filters' }"
                @click="toggleMenu('filters')" title="Filters">
                <i class="fa-solid fa-sliders"></i>
            </button>
            <button class="mob-topbar-btn" :class="{ active: openMenu === 'pages' }" @click="toggleMenu('pages')" title="Pages">
                <i class="fa-solid fa-grip"></i>
            </button>
            <button class="mob-topbar-btn" :class="{ active: openMenu === 'settings' }" @click="toggleMenu('settings')" title="Settings">
                <i class="fa-solid fa-gear"></i>
            </button>
            <a href="https://discord.gg/9wVWSgJSe8" target="_blank" class="mob-topbar-btn" title="Discord">
                <img src="/assets/discord.svg" :style="!store.dark ? 'filter:invert(1)' : ''" class="mob-topbar-discord-icon" />
            </a>
        </nav>
    </header>

    <!-- Popup overlay -->
    <div v-if="openMenu" class="mob-popup-overlay" @click="openMenu = null">
        <div class="mob-popup" @click.stop>

            <!-- Pages -->
            <div v-if="openMenu === 'pages'" class="mob-pages-grid">
                <div class="mob-pages-col">
                    <h4>Lists</h4>
                    <button class="mob-page-link" :class="{ active: $route.path === '/mobile/all' }" @click="goPage('all')">All Levels</button>
                    <button class="mob-page-link" :class="{ active: $route.path === '/mobile/main' }" @click="goPage('main')">Main List</button>
                    <button class="mob-page-link" :class="{ active: $route.path === '/mobile/future' }" @click="goPage('future')">Future List</button>
                </div>
                <div class="mob-pages-col">
                    <h4>Other</h4>
                    <button class="mob-page-link" :class="{ active: $route.path === '/mobile/leaderboard' }" @click="goPage('leaderboard')">Leaderboard</button>
                    <button class="mob-page-link" :class="{ active: $route.path === '/mobile/upcoming' }" @click="goPage('upcoming')">Upcoming Levels</button>
                    <button class="mob-page-link" :class="{ active: $route.path === '/mobile/pending' }" @click="goPage('pending')">Pending List</button>
                    <button class="mob-page-link" :class="{ active: $route.path === '/mobile/info' }" @click="goPage('info')">Information</button>
                    <button class="mob-page-link" :class="{ active: $route.path === '/mobile/events' }" @click="goPage('events')">Events</button>
                </div>
            </div>

            <!-- Filters -->
            <div v-if="openMenu === 'filters'" class="mob-filters-popup">
                <div class="mob-filters-nums">
                    <div class="mob-filter-num-group">
                        <label>Min Decoration %</label>
                        <input type="number" min="0" max="100" v-model.number="mobileStore.minDecoration" placeholder="0" />
                    </div>
                    <div class="mob-filter-num-group">
                        <label>Min Verification %</label>
                        <input type="number" min="0" max="100" v-model.number="mobileStore.minVerification" placeholder="0" />
                    </div>
                </div>
                <template v-for="(item, index) in mobileStore.filtersList" :key="index">
                    <div v-if="item.separator" class="mob-filter-separator"></div>
                    <div v-else class="mob-filter-tag" :class="{ active: item.active }" @click="toggleFilter(index)">
                        <div class="mob-check"></div>
                        {{ item.name }}
                    </div>
                </template>
                <div class="mob-filter-actions">
                    <button class="mob-filter-apply" @click="applyFilters(); openMenu = null">Apply Filters</button>
                    <button class="mob-filter-reset" @click="doResetFilters()">Reset Filters</button>
                </div>
            </div>

            <!-- Settings -->
            <div v-if="openMenu === 'settings'" class="mob-settings-list">
                <div class="mob-setting-row">
                    <span class="mob-setting-label">Thumbnails</span>
                    <div class="mob-toggle">
                        <button :class="{ active: !mobileStore.showThumbnails }" @click="mobileStore.showThumbnails = false">OFF</button>
                        <button :class="{ active: mobileStore.showThumbnails }" @click="mobileStore.showThumbnails = true">ON</button>
                    </div>
                </div>
                <div class="mob-setting-row">
                    <span class="mob-setting-label">Level Coloring</span>
                    <div class="mob-toggle">
                        <button :class="{ active: !mobileStore.showColors }" @click="mobileStore.showColors = false">OFF</button>
                        <button :class="{ active: mobileStore.showColors }" @click="mobileStore.showColors = true">ON</button>
                    </div>
                </div>
                <div class="mob-setting-row">
                    <span class="mob-setting-label">Benchmark Mode</span>
                    <div class="mob-toggle">
                        <button :class="{ active: !mobileStore.benchmarkMode }" @click="setBenchmarkMode(false)">OFF</button>
                        <button :class="{ active: mobileStore.benchmarkMode }" @click="setBenchmarkMode(true)">ON</button>
                    </div>
                </div>
                <div class="mob-setting-row">
                    <span class="mob-setting-label">Theme</span>
                    <div class="mob-toggle">
                        <button :class="{ active: !store.dark }" @click="store.dark && store.toggleDark()">Dark</button>
                        <button :class="{ active: store.dark }" @click="store.dark || store.toggleDark()">Light</button>
                    </div>
                </div>
                <a href="https://discord.gg/9wVWSgJSe8" target="_blank" class="mob-contact-btn">
                    <img src="/assets/discord.svg" /> Contact Support
                </a>
            </div>

        </div>
    </div>

    <!-- Loading -->
    <div v-if="mobileStore.loading" class="mob-content" style="display:flex;align-items:center;justify-content:center;">
        <Spinner />
    </div>

    <!-- Page content via router-view -->
    <div v-else class="mob-content" :class="{ 'mob-content-home': $route.path === '/mobile/home' }" ref="mobContent">
        <router-view></router-view>
        <div class="mob-footer">
            <h3>Upcoming Levels List</h3>
            <p>A community-maintained catalogue forecasting the future of the Geometry Dash Demonlist.</p>
            <div class="mob-footer-links">
                <div class="mob-footer-col">
                    <h4>Navigate</h4>
                    <router-link to="/mobile/all">All Levels</router-link>
                    <router-link to="/mobile/leaderboard">Leaderboard</router-link>
                    <router-link to="/mobile/pending">Pending List</router-link>
                    <router-link to="/mobile/upcoming">Upcoming Levels</router-link>
                </div>
                <div class="mob-footer-col">
                    <h4>Community</h4>
                    <a href="https://discord.gg/9wVWSgJSe8" target="_blank">Discord Server</a>
                    <a href="#" target="_blank">Telegram</a>
                    <a href="https://docs.google.com/document/d/13dmRfx2OCiLEaM2EcgEd-mKdok11_k8k7HsA5a-K6nY/edit?usp=sharing" target="_blank">Full Guidelines Doc</a>
                </div>
            </div>
            <div class="mob-footer-bottom">
                <p>&copy; 2024\u20132026 Upcoming Levels List. Not affiliated with RobTop Games or Pointercrate.</p>
            </div>
        </div>
    </div>

</div>
    `,
    data: () => ({
        store,
        mobileStore,
        openMenu: null,
    }),
    async mounted() {
        try {
            [mobileStore.levelMonth, mobileStore.levelVerif] = await Promise.all([fetchLevelMonth(), fetchLevelVerif()]);
            mobileStore.rawList = await fetchList() || [];
            // Compute per-list ranks for Upcoming Levels position display
            let allRank = 0, mainRank = 0, futureRank = 0;
            mobileStore.rawList.forEach(([level, err], i) => {
                if (err || !level) return;
                level.allLevelsRank = i + 1;
                if (!level.isVerified) { allRank++; level.allLevelsNonVerifiedRank = allRank; }
                if (level.isMain) { mainRank++; level.mainRank = mainRank; }
                if (level.isFuture) { futureRank++; level.futureRank = futureRank; }
            });
            mobileStore.editors = await fetchEditors() || [];
            const pending = await fetchPending();
            if (pending) {
                mobileStore.pendingPlacements = pending
                    .filter(p => !['up', 'down'].includes(p.placement.toLowerCase()))
                    .sort((a, b) => {
                        const v = p => p === '?' ? 999999 : (parseInt(p) || 999999);
                        return v(a.placement) - v(b.placement) || a.name.localeCompare(b.name);
                    });
                mobileStore.pendingMovements = pending.filter(p => ['up', 'down'].includes(p.placement.toLowerCase()));
            }
            // Auto-assign Open Verification tag
            mobileStore.rawList.forEach(item => {
                const l = item[0]; if (!l) return;
                if (l.verifier?.toLowerCase() === 'open verification') {
                    if (!l.tags) l.tags = [];
                    if (!l.tags.includes('Open Verification')) l.tags.push('Open Verification');
                }
            });
            // Auto-assign Pending Removal tag
            const isOldLevel = (level) => {
                if (!level.lastUpd) return false;
                const p = level.lastUpd.split('.');
                if (p.length !== 3) return false;
                const d = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
                const ago = new Date(); ago.setFullYear(ago.getFullYear() - 1);
                return d < ago;
            };
            mobileStore.rawList.forEach(item => {
                const l = item[0]; if (!l) return;
                if (!l.isVerified && isOldLevel(l)) {
                    if (!l.tags) l.tags = [];
                    if (!l.tags.includes('Pending Removal')) l.tags.push('Pending Removal');
                }
            });
            // Build player leaderboard
            const playerMap = {};
            mobileStore.rawList.forEach(([level, err], rank) => {
                if (err || !level) return;
                const levelRank = rank + 1;
                const levelName = level.name;
                if (level.isVerified && level.verifier) {
                    const key = level.verifier.toLowerCase();
                    if (!playerMap[key]) playerMap[key] = { name: level.verifier, records: [] };
                    const sc = recordScore(levelRank, 100) * 2;
                    playerMap[key].records.push({ levelName, levelRank, percent: 100, score: sc, type: 'verification' });
                    return;
                }
                if (level.records) {
                    level.records.forEach(record => {
                        if (!record.user || record.percent <= 0) return;
                        const key = record.user.toLowerCase();
                        if (!playerMap[key]) playerMap[key] = { name: record.user, records: [] };
                        const percent = Number(record.percent);
                        playerMap[key].records.push({ levelName, levelRank, percent, score: recordScore(levelRank, percent), type: 'record' });
                    });
                }
                if (level.run) {
                    level.run.forEach(runRecord => {
                        if (!runRecord.user) return;
                        const parts = String(runRecord.percent).split('-').map(Number);
                        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return;
                        const percent = Math.abs(parts[1] - parts[0]);
                        if (percent <= 0) return;
                        const key = runRecord.user.toLowerCase();
                        if (!playerMap[key]) playerMap[key] = { name: runRecord.user, records: [] };
                        playerMap[key].records.push({ levelName, levelRank, percent, displayPercent: String(runRecord.percent), score: recordScore(levelRank, percent), type: 'run' });
                    });
                }
            });
            mobileStore.players = Object.values(playerMap).map(p => {
                p.records.sort((a, b) => b.score - a.score);
                p.total = p.records.reduce((sum, r) => sum + r.score, 0);
                return p;
            }).sort((a, b) => b.total - a.total);
            mobileStore.players.forEach((p, i) => { p.globalRank = i + 1; });
        } catch (e) {
            console.error('Mobile data load error:', e);
        } finally {
            mobileStore.loading = false;
        }
    },
    watch: {
        '$route'() {
            this.$nextTick(() => {
                if (this.$refs.mobContent) this.$refs.mobContent.scrollTop = 0;
            });
        },
    },
    methods: {
        applyFilters,
        toggleMenu(name) { this.openMenu = this.openMenu === name ? null : name; },
        goPage(page) { this.$router.push('/mobile/' + page); this.openMenu = null; },
        toggleFilter(index) {
            if (mobileStore.filtersList[index].separator) return;
            mobileStore.filtersList[index].active = !mobileStore.filtersList[index].active;
        },
        doResetFilters() { resetFilters(); this.openMenu = null; },
        setBenchmarkMode(value) {
            store.benchmarkMode = value;
            mobileStore.benchmarkMode = value;
            applyFilters();
        },
    },
};
