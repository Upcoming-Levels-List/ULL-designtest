import { mobileStore } from './mobileStore.js';

export default {
    template: `
        <div class="mob-list">
            <div class="mob-page-hero">
                <h1>Leaderboard</h1>
                <p>Top players ranked by their records on upcoming and unverified Demonlist levels.</p>
            </div>
            <input v-model="playerSearch" class="mob-search" type="text" placeholder="Search players..." />
            <div v-if="filteredPlayers.length === 0 && playerSearch.trim()" style="padding:2.5rem 1rem;text-align:center;opacity:0.35;font-size:0.85rem;">No players match your search.</div>
            <div v-for="(player, i) in filteredPlayers" :key="player.name" class="mob-level-row">
                <button class="mob-level-btn" :class="{ active: playerSelected === i }" @click="playerSelected = playerSelected === i ? -1 : i">
                    <span class="mob-rank">#{{ player.globalRank }}</span>
                    <div class="mob-level-info">
                        <div class="mob-level-name">{{ player.name }}</div>
                        <div class="mob-level-sub">Score: {{ player.total.toFixed(3) }}</div>
                    </div>
                </button>
                <div v-if="playerSelected === i" class="mob-level-detail">
                    <div style="font-size:15px;font-weight:600;margin-bottom:0.75rem;">Records ({{ player.records.length }})</div>
                    <div v-for="rec in player.records" :key="rec.levelName + rec.percent + rec.type" style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid rgba(128,128,128,0.1);font-size:14px;">
                        <div style="display:flex;align-items:center;gap:0.4rem;">
                            <span style="font-weight:700;color:gray;font-size:12px;">+{{ rec.score.toFixed(3) }}</span>
                            <span style="font-weight:500;">{{ rec.levelName }}</span>
                            <span style="opacity:0.5;font-size:12px;">#{{ rec.levelRank }}</span>
                        </div>
                        <span v-if="rec.type === 'verification'" style="font-weight:500;">Verification</span>
                        <span v-else-if="rec.type === 'run'" style="font-weight:500;">{{ rec.displayPercent }}%</span>
                        <span v-else style="font-weight:500;">{{ rec.percent }}%</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: () => ({
        mobileStore,
        playerSelected: -1,
        playerSearch: '',
    }),
    computed: {
        filteredPlayers() {
            if (!this.playerSearch.trim()) return mobileStore.players;
            const q = this.playerSearch.toLowerCase().trim();
            return mobileStore.players.filter(p => p.name.toLowerCase().includes(q));
        },
    },
};
