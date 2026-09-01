import { store } from "../main.js";
import { fetchEditors, fetchList, fetchPending, fetchLevelMonth, fetchLevelVerif } from "../content.js";
import { recordScore, verificationScore, layoutCompletionScore, isLayoutCompletion } from "../formulas.js";
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
<div class="mob m2 ull2" :class="{ dark: store.dark }">

    <!-- Top bar. The destinations that used to live behind its "Pages" button
         are the tab bar at the bottom now, within reach of a thumb. -->
    <header class="mob-topbar m2-top">
        <router-link to="/mobile/home" class="mob-topbar-logo">
            <span class="m2-top__mark">ULL</span>
            <span class="m2-top__ver">v2.0.0</span>
        </router-link>
        <nav class="m2-top__acts">
            <button class="mob-topbar-btn m2-top__btn" :class="{ active: mobileStore.openMenu === 'settings' }" @click="toggleMenu('settings')" title="Settings">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/></svg>
            </button>
            <a href="https://discord.gg/QRX47v2qyC" target="_blank" class="mob-topbar-btn m2-top__btn" title="Discord">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.3.5c1.6.4 2.9 1 4.1 1.8a13.9 13.9 0 0 0-14.4 0c1.2-.8 2.6-1.4 4.1-1.8L8.6 3a19.8 19.8 0 0 0-4.9 1.4C1.6 8 1 11.5 1.3 15a19.9 19.9 0 0 0 6 3l1.2-1.7c-1-.4-1.9-.9-2.7-1.4l.5-.4a14.2 14.2 0 0 0 11.4 0l.5.4c-.8.5-1.7 1-2.7 1.4l1.2 1.7a19.9 19.9 0 0 0 6-3c.4-4.1-.6-7.6-2.4-10.6ZM8.5 12.9c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.8.9 1.7 1.9c0 1-.7 1.9-1.7 1.9Zm7 0c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.8.9 1.7 1.9c0 1-.7 1.9-1.7 1.9Z"/></svg>
            </a>
        </nav>
    </header>

    <!-- Loading -->
    <div v-if="mobileStore.loading" class="mob-content" style="display:flex;align-items:center;justify-content:center;">
        <Spinner />
    </div>

    <!-- Page content via router-view -->
    <div v-else class="mob-content" :class="{ 'mob-content-home': $route.path === '/mobile/home' }" ref="mobContent">
        <router-view></router-view>
        <div class="mob-footer">
            <h3>Upcoming Levels List</h3>
            <p>A community-maintained catalogue of the hardest upcoming levels in Geometry Dash.</p>
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
                    <a href="https://discord.gg/QRX47v2qyC" target="_blank">Discord</a>
                    <a href="https://x.com/ull_gd" target="_blank" rel="noopener">X (@ull_gd)</a>
                </div>
            </div>
            <div class="mob-footer-bottom">
                <p>&copy; 2024–2026 Upcoming Levels List. Not affiliated with RobTop Games.</p>
            </div>
        </div>
    </div>

    <!-- Tab bar -->
    <nav class="m2-nav">
        <router-link class="m2-nav__item" :class="{ 'is-on': $route.path === '/mobile/home' }" to="/mobile/home">
            <svg class="m2-nav__ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.8 8 2.5l5.5 4.3V13a.9.9 0 0 1-.9.9H3.4a.9.9 0 0 1-.9-.9V6.8Z"/><path d="M6.4 13.9V9.2h3.2v4.7"/></svg>
            Home
        </router-link>
        <router-link class="m2-nav__item" :class="{ 'is-on': isListRoute }" to="/mobile/all">
            <svg class="m2-nav__ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01"/></svg>
            Levels
        </router-link>
        <router-link class="m2-nav__item" :class="{ 'is-on': $route.path === '/mobile/info' }" to="/mobile/info">
            <svg class="m2-nav__ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.3v4M8 4.9h.01"/></svg>
            Information
        </router-link>
        <button class="m2-nav__item" type="button" :class="{ 'is-on': isOtherRoute || mobileStore.openMenu === 'pages' }" @click="toggleMenu('pages')">
            <svg class="m2-nav__ic" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="3.2" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="12.8" cy="8" r="1.3"/></svg>
            Other
        </button>
    </nav>

    <!-- Sheets. The overlay keeps its old class name: it is the scrim, it
         covers the whole viewport, and tapping it closes whatever is open. -->
    <template v-if="mobileStore.openMenu">
        <div class="mob-popup-overlay m2-sheet-scrim" @click="mobileStore.openMenu = null"></div>
        <div class="m2-sheet" @click.stop>
            <div class="m2-sheet__grip"></div>

            <!-- Other pages -->
            <template v-if="mobileStore.openMenu === 'pages'">
                <div class="m2-sheet__head"><h2>Other pages</h2></div>
                <div class="m2-sheet__body m2-pages">
                    <div class="m2-pages__label">Lists</div>
                    <button class="m2-page" :class="{ 'is-on': $route.path === '/mobile/all' }" @click="goPage('all')">All Levels</button>
                    <button class="m2-page" :class="{ 'is-on': $route.path === '/mobile/main' }" @click="goPage('main')">Main List</button>
                    <button class="m2-page" :class="{ 'is-on': $route.path === '/mobile/future' }" @click="goPage('future')">Future List</button>
                    <div class="m2-pages__label">Other</div>
                    <button class="m2-page" :class="{ 'is-on': $route.path === '/mobile/leaderboard' }" @click="goPage('leaderboard')">Leaderboard</button>
                    <button class="m2-page" :class="{ 'is-on': $route.path === '/mobile/upcoming' }" @click="goPage('upcoming')">Upcoming Levels</button>
                    <button class="m2-page" :class="{ 'is-on': $route.path === '/mobile/pending' }" @click="goPage('pending')">Pending List</button>
                    <button class="m2-page" :class="{ 'is-on': $route.path === '/mobile/info' }" @click="goPage('info')">Information</button>
                    <button class="m2-page" :class="{ 'is-on': $route.path === '/mobile/events' }" @click="goPage('events')">Events</button>
                </div>
            </template>

            <!-- Filters -->
            <template v-if="mobileStore.openMenu === 'filters'">
                <div class="m2-sheet__head">
                    <h2>Filters</h2>
                    <span v-if="activeFilterCount" class="u-chip u-chip--round">{{ activeFilterCount }} active</span>
                </div>
                <div class="m2-sheet__body">
                    <div class="m2-nums">
                        <div class="m2-num">
                            <label>Min decoration</label>
                            <input type="number" min="0" max="100" v-model.number="mobileStore.minDecoration" placeholder="0" />
                        </div>
                        <div class="m2-num">
                            <label>Min verification</label>
                            <input type="number" min="0" max="100" v-model.number="mobileStore.minVerification" placeholder="0" />
                        </div>
                    </div>
                    <div class="m2-filters">
                        <template v-for="(item, index) in mobileStore.filtersList" :key="index">
                            <button v-if="!item.separator" class="m2-filter" :class="{ 'is-on': item.active }" @click="toggleFilter(index)">{{ item.name }}</button>
                        </template>
                    </div>
                </div>
                <div class="m2-sheet__foot">
                    <button class="u-btn u-btn--ghost" @click="doResetFilters()">Reset</button>
                    <button class="u-btn" @click="applyFilters(); mobileStore.openMenu = null">Apply filters</button>
                </div>
            </template>

            <!-- Settings -->
            <template v-if="mobileStore.openMenu === 'settings'">
                <div class="m2-sheet__head"><h2>Settings</h2></div>
                <div class="m2-sheet__body mob-settings-list">
                    <div class="m2-setting mob-setting-row">
                        <span class="m2-setting__label mob-setting-label">Thumbnails</span>
                        <div class="m2-toggle mob-toggle">
                            <button :class="{ 'is-on': !mobileStore.showThumbnails, active: !mobileStore.showThumbnails }" @click="mobileStore.showThumbnails = false">OFF</button>
                            <button :class="{ 'is-on': mobileStore.showThumbnails, active: mobileStore.showThumbnails }" @click="mobileStore.showThumbnails = true">ON</button>
                        </div>
                    </div>
                    <div class="m2-setting mob-setting-row">
                        <span class="m2-setting__label mob-setting-label">Level Coloring</span>
                        <div class="m2-toggle mob-toggle">
                            <button :class="{ 'is-on': !mobileStore.showColors, active: !mobileStore.showColors }" @click="mobileStore.showColors = false">OFF</button>
                            <button :class="{ 'is-on': mobileStore.showColors, active: mobileStore.showColors }" @click="mobileStore.showColors = true">ON</button>
                        </div>
                    </div>
                    <div class="m2-setting mob-setting-row">
                        <span class="m2-setting__label mob-setting-label">Benchmark Mode</span>
                        <div class="m2-toggle mob-toggle">
                            <button :class="{ 'is-on': !mobileStore.benchmarkMode, active: !mobileStore.benchmarkMode }" @click="setBenchmarkMode(false)">OFF</button>
                            <button :class="{ 'is-on': mobileStore.benchmarkMode, active: mobileStore.benchmarkMode }" @click="setBenchmarkMode(true)">ON</button>
                        </div>
                    </div>
                    <div class="m2-setting mob-setting-row">
                        <span class="m2-setting__label mob-setting-label">Theme</span>
                        <div class="m2-toggle mob-toggle">
                            <button :class="{ 'is-on': !store.dark, active: !store.dark }" @click="store.dark && store.toggleDark()">Dark</button>
                            <button :class="{ 'is-on': store.dark, active: store.dark }" @click="store.dark || store.toggleDark()">Light</button>
                        </div>
                    </div>
                </div>
                <div class="m2-sheet__foot">
                    <a href="https://x.com/ull_gd" target="_blank" rel="noopener" class="u-btn u-btn--ghost">Follow @ull_gd</a>
                    <a href="https://discord.gg/QRX47v2qyC" target="_blank" class="u-btn">Contact support</a>
                </div>
            </template>
        </div>
    </template>

</div>
    `,
    data: () => ({
        store,
        mobileStore,
    }),
    computed: {
        // Levels covers all three list pages; Other covers everything that
        // opens from its sheet.
        isListRoute() {
            return ['/mobile/all', '/mobile/main', '/mobile/future'].includes(this.$route.path);
        },
        isOtherRoute() {
            return ['/mobile/leaderboard', '/mobile/upcoming', '/mobile/pending', '/mobile/events'].includes(this.$route.path);
        },
        activeFilterCount() {
            return mobileStore.filtersList.filter((f) => !f.separator && f.active).length;
        },
    },
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
                if (level.isMain || level.isVerified) { mainRank++; level.mainRank = mainRank; }
                if (level.isFuture || level.isVerified) { futureRank++; level.futureRank = futureRank; }
            });
            mobileStore.editors = await fetchEditors() || [];
            const pending = await fetchPending();
            mobileStore.pending = pending || [];
            if (pending) {
                const isMove = p => ['up', 'down'].includes((p.placement || '').toLowerCase());
                const byPlacement = (a, b) => {
                    const v = p => p === '?' ? 999999 : (parseInt(p) || 999999);
                    return v(a.placement) - v(b.placement) || a.name.localeCompare(b.name);
                };
                mobileStore.pendingPlacements = pending.filter(p => !isMove(p) && !p.indefinite).sort(byPlacement);
                mobileStore.pendingMovements = pending.filter(isMove);
                mobileStore.pendingIndefinite = pending.filter(p => !isMove(p) && p.indefinite).sort(byPlacement);
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
            // Auto-assign Verifying tag — same trigger as the orange/red name coloring.
            const verifyProgress = (l) => Math.max(
                0,
                ...((l.records || []).map(r => Number(r.percent) || 0)),
                ...((l.run || []).map(r => {
                    const parts = String(r.percent).split('-').map(Number);
                    return (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) ? Math.abs(parts[1] - parts[0]) : 0;
                }))
            );
            mobileStore.rawList.forEach(item => {
                const l = item[0]; if (!l) return;
                if (!l.tags) l.tags = [];
                const beingVerified = !l.isVerified && (l.percentFinished ?? 0) === 100 && verifyProgress(l) >= 30;
                if (beingVerified && !l.tags.includes('Verifying')) l.tags.push('Verifying');
                if (!beingVerified && l.tags.includes('Verifying')) l.tags = l.tags.filter(t => t !== 'Verifying');
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
                    const sc = verificationScore(levelRank);
                    playerMap[key].records.push({ levelName, levelRank, percent: 100, score: sc, type: 'verification' });
                    return;
                }
                if (level.records) {
                    level.records.forEach(record => {
                        if (!record.user || record.percent <= 0) return;
                        const key = record.user.toLowerCase();
                        if (!playerMap[key]) playerMap[key] = { name: record.user, records: [] };
                        const percent = Number(record.percent);
                        // 100% on a not-yet-verified level is a layout completion (0.8
                        // of a verification), not an ordinary record. Keep in sync with
                        // js/pages/Leaderboard.js.
                        const layout = isLayoutCompletion(level, percent);
                        const sc = layout ? layoutCompletionScore(levelRank) : recordScore(levelRank, percent);
                        playerMap[key].records.push({ levelName, levelRank, percent, score: sc, type: layout ? 'layout' : 'record' });
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
        toggleMenu(name) { mobileStore.openMenu = mobileStore.openMenu === name ? null : name; },
        goPage(page) { this.$router.push('/mobile/' + page); mobileStore.openMenu = null; },
        toggleFilter(index) {
            if (mobileStore.filtersList[index].separator) return;
            mobileStore.filtersList[index].active = !mobileStore.filtersList[index].active;
        },
        doResetFilters() { resetFilters(); mobileStore.openMenu = null; },
        setBenchmarkMode(value) {
            store.benchmarkMode = value;
            mobileStore.benchmarkMode = value;
            applyFilters();
        },
    },
};
