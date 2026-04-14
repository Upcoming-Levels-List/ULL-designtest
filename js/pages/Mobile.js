import { store } from "../main.js";
import { fetchEditors, fetchList, fetchPending } from "../content.js";
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

    <!-- Header 1 -->
    <header class="mob-header1">
        <div class="logo">
            <h2>ULL</h2>
            <p>v1.2.0</p>
        </div>
    </header>

    <!-- Header 2 -->
    <div class="mob-header2">
        <div class="mob-header2-left">
            <button class="mob-tab-btn" :class="{ active: openMenu === 'pages' }" @click="toggleMenu('pages')">Pages</button>
            <button v-if="$route.path !== '/mobile/pending'" class="mob-tab-btn" :class="{ active: openMenu === 'filters' }" @click="toggleMenu('filters')">Filters</button>
            <button class="mob-tab-btn" :class="{ active: openMenu === 'settings' }" @click="toggleMenu('settings')">Settings</button>
        </div>
        <a href="https://discord.gg/9wVWSgJSe8" target="_blank" class="mob-discord-btn">
            <img src="/assets/discord.svg" alt="Discord" :style="!store.dark ? 'filter:invert(1)' : ''" />
        </a>
    </div>

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
    <div v-else class="mob-content">
        <router-view></router-view>
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
            mobileStore.rawList = await fetchList() || [];
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
    methods: {
        applyFilters,
        toggleMenu(name) { this.openMenu = this.openMenu === name ? null : name; },
        goPage(page) { this.$router.push('/mobile/' + page); this.openMenu = null; },
        toggleFilter(index) {
            if (mobileStore.filtersList[index].separator) return;
            mobileStore.filtersList[index].active = !mobileStore.filtersList[index].active;
        },
        doResetFilters() { resetFilters(); this.openMenu = null; },
    },
};
