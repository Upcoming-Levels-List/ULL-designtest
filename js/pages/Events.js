import { store } from '../main.js';
import { fetchLevelMonth, fetchLevelVerif, fetchList } from '../content.js';
import Footer from '../components/Footer.js';

function ytThumb(url) {
    if (!url) return '';
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : url;
}

function pickDailyLevel(list) {
    const valid = list.filter(([l, e]) => l && !e);
    if (!valid.length) return null;
    const d = new Date();
    const seed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) >>> 0;
    const hash = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0;
    return valid[hash % valid.length][0];
}

export default {
    components: { Footer },
    template: `
<main class="info-page surface">
    <section class="info-hero">
        <h1>Events</h1>
        <p>Featured level highlights — Level of the Month, the level closest to verification, and today's featured level.</p>
    </section>

    <div class="info-content">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem;margin-bottom:2rem;">

            <!-- Level of the Month -->
            <div class="home-card home-lotm-card" v-if="levelMonth">
                <div class="home-card__title">Level of the Month</div>
                <div class="home-level-header">
                    <div class="home-level-thumb">
                        <img v-if="ytThumb(levelMonth.thumbnail)" :src="ytThumb(levelMonth.thumbnail)" alt="" />
                    </div>
                    <div class="home-level-meta">
                        <div class="home-level-name">{{ levelMonth.name }}</div>
                        <div class="home-level-info">
                            <span class="home-level-rank">#{{ levelMonth.rank }}</span>
                            <span class="home-level-sep">·</span>
                            <span class="home-level-author">by {{ levelMonth.author }}</span>
                            <span v-if="levelMonth.id" class="home-level-sep">·</span>
                            <span v-if="levelMonth.id" class="home-level-id">{{ levelMonth.id }}</span>
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
                        <img v-if="ytThumb(levelVerif.thumbnail)" :src="ytThumb(levelVerif.thumbnail)" alt="" />
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

            <!-- Level of the Day -->
            <div class="home-card home-lotd-card" v-if="levelDay">
                <div class="home-card__title">Level of the Day</div>
                <div class="home-level-header">
                    <div class="home-level-thumb">
                        <img v-if="ytThumb(levelDay.thumbnail)" :src="ytThumb(levelDay.thumbnail)" alt="" />
                    </div>
                    <div class="home-level-meta">
                        <div class="home-level-name">{{ levelDay.name }}</div>
                        <div class="home-level-info">
                            <span class="home-level-rank">{{ levelDay.rankNum }}</span>
                            <span class="home-level-sep">·</span>
                            <span class="home-level-author">by {{ levelDay.author }}</span>
                            <span v-if="levelDay.id" class="home-level-sep">·</span>
                            <span v-if="levelDay.id" class="home-level-id">{{ levelDay.id }}</span>
                        </div>
                    </div>
                </div>
                <div class="home-record-box" v-if="lotdRecord || lotdRun">
                    <a v-if="lotdRecord" :href="lotdRecord.link || '#'" class="home-record-row">
                        <span class="home-record-pct">{{ lotdRecord.percent }}%</span>
                        <span class="home-record-player">{{ lotdRecord.user }}</span>
                        <span class="home-record-label">Best from zero</span>
                    </a>
                    <a v-if="lotdRun" :href="lotdRun.link || '#'" class="home-record-row">
                        <span class="home-record-pct">{{ lotdRun.percent }}</span>
                        <span class="home-record-player">{{ lotdRun.user }}</span>
                        <span class="home-record-label">Best run</span>
                    </a>
                </div>
            </div>

        </div>
    </div>

    <Footer />
</main>
    `,
    data: () => ({
        store,
        levelMonth: null,
        levelVerif: null,
        levelDay: null,
    }),
    computed: {
        lotdRecord() {
            const recs = this.levelDay?.records;
            if (!recs?.length) return null;
            return recs.reduce((b, r) => Number(r.percent) > Number(b.percent) ? r : b);
        },
        lotdRun() {
            return this.levelDay?.run?.[0] ?? null;
        },
    },
    methods: { ytThumb },
    async mounted() {
        const [lm, lv, list] = await Promise.all([
            fetchLevelMonth(),
            fetchLevelVerif(),
            fetchList(),
        ]);
        this.levelMonth = lm;
        this.levelVerif = lv;
        if (list?.length) this.levelDay = pickDailyLevel(list);
    },
};
