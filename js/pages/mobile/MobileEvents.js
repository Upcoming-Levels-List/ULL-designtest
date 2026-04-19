import { store } from '../../main.js';
import { fetchLevelMonth, fetchLevelVerif } from '../../content.js';

function ytThumb(url) {
    if (!url) return '';
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : url;
}

export default {
    template: `
        <div class="mob-events-page">
            <div class="mob-pending-hero">
                <h1>Events</h1>
                <p>Featured level highlights — Level of the Month and the level closest to verification.</p>
            </div>

            <div class="mob-events-content">

                <!-- Level of the Month -->
                <div class="mob-info-card" v-if="levelMonth">
                    <div class="mob-info-card__title">Level of the Month</div>
                    <div v-if="lotmThumb" class="mob-events-thumb">
                        <img :src="lotmThumb" alt="" />
                    </div>
                    <div class="mob-events-level-name">{{ levelMonth.name }}</div>
                    <div class="mob-events-level-meta">
                        <span class="mob-events-rank">#{{ levelMonth.rank }}</span>
                        <span class="mob-events-sep">·</span>
                        <span class="mob-events-author">by {{ levelMonth.author }}</span>
                        <span v-if="levelMonth.id" class="mob-events-sep">·</span>
                        <span v-if="levelMonth.id" class="mob-events-id">{{ levelMonth.id }}</span>
                    </div>
                    <div class="mob-events-records">
                        <a :href="levelMonth.record?.link || '#'" class="mob-events-record-row">
                            <span class="mob-events-record-pct">{{ levelMonth.record?.percent }}</span>
                            <span class="mob-events-record-player">{{ levelMonth.record?.player }}</span>
                            <span class="mob-events-record-label">Best from zero</span>
                        </a>
                        <a :href="levelMonth.run?.link || '#'" class="mob-events-record-row">
                            <span class="mob-events-record-pct">{{ levelMonth.run?.percent }}</span>
                            <span class="mob-events-record-player">{{ levelMonth.run?.player }}</span>
                            <span class="mob-events-record-label">Best run</span>
                        </a>
                    </div>
                    <a href="https://discord.gg/9wVWSgJSe8" target="_blank" class="mob-events-discord-btn">
                        <img src="/assets/discord.svg" :style="store.dark ? 'filter:invert(1)' : ''" alt="Discord" />
                        Visit our Discord Server
                    </a>
                </div>

                <!-- Closest to Verification -->
                <div class="mob-info-card" v-if="levelVerif">
                    <div class="mob-info-card__title">Closest to Verification</div>
                    <div v-if="ctvThumb" class="mob-events-thumb">
                        <img :src="ctvThumb" alt="" />
                    </div>
                    <div class="mob-events-level-name">{{ levelVerif.name }}</div>
                    <div class="mob-events-level-meta">
                        <span class="mob-events-rank">#{{ levelVerif.rank }}</span>
                        <span class="mob-events-sep">·</span>
                        <span class="mob-events-author">by {{ levelVerif.author }}</span>
                        <span class="mob-events-sep">·</span>
                        <span class="mob-events-author">Verifier: {{ levelVerif.verifier }}</span>
                    </div>
                    <div class="mob-events-records">
                        <a :href="levelVerif.record?.link || '#'" class="mob-events-record-row">
                            <span class="mob-events-record-pct">{{ levelVerif.record?.percent }}</span>
                            <span class="mob-events-record-player">{{ levelVerif.record?.player }}</span>
                            <span class="mob-events-record-label">Best from zero</span>
                        </a>
                        <a :href="levelVerif.run?.link || '#'" class="mob-events-record-row">
                            <span class="mob-events-record-pct">{{ levelVerif.run?.percent }}</span>
                            <span class="mob-events-record-player">{{ levelVerif.run?.player }}</span>
                            <span class="mob-events-record-label">Best run</span>
                        </a>
                    </div>
                    <router-link to="/mobile/upcoming" class="mob-events-ctv-btn">Go to Upcoming Levels →</router-link>
                </div>

                <div v-if="!levelMonth && !levelVerif && !loading" style="padding:3rem 1rem;text-align:center;opacity:0.3;">
                    <p style="font-size:0.85rem;">No events available right now.</p>
                </div>

            </div>
        </div>
    `,
    data: () => ({
        store,
        levelMonth: null,
        levelVerif: null,
        loading: true,
    }),
    computed: {
        lotmThumb() { return ytThumb(this.levelMonth?.thumbnail); },
        ctvThumb()  { return ytThumb(this.levelVerif?.thumbnail); },
    },
    async mounted() {
        [this.levelMonth, this.levelVerif] = await Promise.all([fetchLevelMonth(), fetchLevelVerif()]);
        this.loading = false;
    },
};
