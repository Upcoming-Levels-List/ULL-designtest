import { mobileStore } from './mobileStore.js';

export default {
    template: `
        <div class="mob-list m2-page-body">
            <section class="m2-hero">
                <h1>Leaderboard</h1>
                <p>Top players ranked by their records on upcoming levels and their verifications of Demonlist levels.</p>
                <div class="m2-figs">
                    <span class="m2-fig m2-fig--lead"><b>{{ mobileStore.players.length }}</b><span>players</span></span>
                </div>
            </section>

            <div class="m2-search">
                <input v-model="playerSearch" type="text" placeholder="Search players..." />
            </div>

            <div v-if="podium.length === 3 && !playerSearch.trim()" class="m2-podium">
                <button v-for="p in podium" :key="p.name" class="m2-pod" :class="'m2-pod--' + p.globalRank" @click="selectByName(p.name)">
                    <span class="m2-pod__p">{{ ordinal(p.globalRank) }}</span>
                    <span class="m2-pod__n">{{ p.name }}</span>
                    <span class="m2-pod__s">{{ p.total.toFixed(1) }}</span>
                </button>
            </div>

            <div v-if="!filteredPlayers.length && playerSearch.trim()" class="u-empty">
                <div class="u-empty__t">No players match your search</div>
                <div class="u-empty__d">Try part of a name, or clear the box to see everyone.</div>
            </div>

            <div class="m2-rows">
                <div v-for="(player, i) in filteredPlayers" :key="player.name" class="mob-level-row">
                    <button class="m2-row" :class="{ 'is-on': playerSelected === i }" @click="playerSelected = playerSelected === i ? -1 : i">
                        <span class="mob-rank m2-row__rank"><span>#{{ player.globalRank }}</span></span>
                        <span class="m2-row__body"><span class="m2-row__name">{{ player.name }}</span></span>
                        <span class="m2-row__end">{{ player.total.toFixed(3) }}</span>
                    </button>

                    <!-- The row above already states the total, so the panel goes
                         straight to what earned it. -->
                    <div v-if="playerSelected === i" class="m2-detail">
                        <div class="m2-detail__body">
                            <h3 class="u-eyebrow">Records <span class="u-count">{{ player.records.length }}</span></h3>
                            <div>
                                <div v-for="rec in player.records" :key="rec.levelName + rec.percent + rec.type" class="m2-rec">
                                    <span class="m2-rec__score">+{{ rec.score.toFixed(1) }}</span>
                                    <span class="m2-rec__lvl">{{ rec.levelName }}<span class="m2-rec__rank">#{{ rec.levelRank }}</span></span>
                                    <span class="m2-rec__type">{{ recordLabel(rec) }}</span>
                                </div>
                            </div>
                            <p v-if="!player.records.length" class="u-empty__d">No scoring records.</p>
                        </div>
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
        // Second, first, third — so the winner stands in the middle.
        podium() {
            const [first, second, third] = mobileStore.players;
            return [second, first, third].filter(Boolean).length === 3 ? [second, first, third] : [];
        },
        filteredPlayers() {
            if (!this.playerSearch.trim()) return mobileStore.players;
            const q = this.playerSearch.toLowerCase().trim();
            return mobileStore.players.filter(p => p.name.toLowerCase().includes(q));
        },
    },
    methods: {
        ordinal(n) {
            const tens = n % 100;
            if (tens >= 11 && tens <= 13) return `${n}th`;
            return `${n}${['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`;
        },
        // A verification and a layout completion say what they are; a record and
        // a run say how far the player got.
        recordLabel(rec) {
            if (rec.type === 'verification') return 'Verification';
            if (rec.type === 'layout') return 'Layout completion';
            if (rec.type === 'run') return `${rec.displayPercent}%`;
            return `${rec.percent}%`;
        },
        selectByName(name) {
            const at = this.filteredPlayers.findIndex((p) => p.name === name);
            if (at >= 0) this.playerSelected = at;
        },
    },
};
