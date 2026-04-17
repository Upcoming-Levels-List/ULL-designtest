import { embed } from '../../util.js';
import { mobileStore } from './mobileStore.js';

export default {
    template: `
        <div class="mob-list">
            <div class="mob-page-hero">
                <h1>Upcoming Levels</h1>
                <p>Levels closest to verification — ranked by highest recorded progress.</p>
            </div>
            <div v-for="([level, err], i) in lbList" :key="i" class="mob-level-row">
                <button class="mob-level-btn" :class="{ active: lbSelected === i }" @click="lbSelected = lbSelected === i ? -1 : i">
                    <span class="mob-rank">#{{ i + 1 }}</span>
                    <img v-if="mobileStore.showThumbnails && level" class="mob-thumb" :src="getThumbnail(level)" alt="" />
                    <div class="mob-level-info">
                        <div class="mob-level-name">{{ level?.name || \`Error (\${err}.json)\` }}</div>
                        <div class="mob-level-sub" v-if="level">
                            <template v-if="getLbBestRecord(level)">WR: {{ getLbBestRecord(level).percent }}%</template>
                            <template v-if="getLbBestRecord(level) && getLbBestRun(level)"> · </template>
                            <template v-if="getLbBestRun(level)">Run: {{ getLbBestRun(level).percent }}</template>
                        </div>
                    </div>
                </button>
                <div v-if="lbSelected === i && level" class="mob-level-detail">
                    <div class="mob-author-block">
                        <div class="mob-author-row"><span class="mob-author-label">Level Author</span><span class="mob-author-value">{{ level.author }}</span></div>
                        <div class="mob-author-row" v-if="level.creators && level.creators.length"><span class="mob-author-label">Creators</span><span class="mob-author-value">{{ level.creators.join(', ') }}</span></div>
                    </div>
                    <div v-if="getLbBestRecord(level)" class="mob-wr">
                        Best from 0: <a v-if="getLbBestRecord(level).link && getLbBestRecord(level).link != '#'" :href="getLbBestRecord(level).link" target="_blank" style="color:#00b825;text-decoration:underline;">{{ getLbBestRecord(level).percent }}%</a><template v-else><span style="color:#00b825;">{{ getLbBestRecord(level).percent }}%</span></template> by {{ getLbBestRecord(level).user }}
                    </div>
                    <div v-if="getLbBestRun(level)" class="mob-wr">
                        Best run: <a v-if="getLbBestRun(level).link && getLbBestRun(level).link != '#'" :href="getLbBestRun(level).link" target="_blank" style="color:#00b825;text-decoration:underline;">{{ getLbBestRun(level).percent }}%</a><template v-else><span style="color:#00b825;">{{ getLbBestRun(level).percent }}%</span></template> by {{ getLbBestRun(level).user }}
                    </div>
                    <iframe class="mob-video" :src="getVideo(level)" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    `,
    data: () => ({
        mobileStore,
        lbSelected: -1,
    }),
    computed: {
        lbList() {
            if (!mobileStore.rawList.length) return [];
            return mobileStore.rawList
                .filter(([l]) => l && !l.isVerified)
                .filter(([l]) => !((l.records || []).some(r => Number(r.percent) >= 100)))
                .map(([l, e]) => {
                    const maxP = Math.max(0, ...((l.records || []).map(r => Number(r.percent) || 0)));
                    const maxR = Math.max(0, ...((l.run || []).map(r => {
                        const p = String(r.percent).split('-').map(Number);
                        return p.length === 2 ? Math.abs(p[1] - p[0]) : 0;
                    })));
                    l.rankingScore = Math.max(maxP, maxR) ** 2 + Math.min(maxP, maxR) ** 1.8;
                    return [l, e];
                })
                .filter(([l]) => l.rankingScore > 0)
                .sort((a, b) => b[0].rankingScore - a[0].rankingScore);
        },
    },
    methods: {
        getThumbnail(level) {
            if (level.thumbnail) return level.thumbnail;
            const yt = url => {
                if (!url || typeof url !== 'string') return '';
                const m = url.match(/.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/);
                return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : '';
            };
            return yt(level.verification) || yt(level.showcase) || '';
        },
        getVideo(level) {
            const toStr = v => (v && typeof v === 'string') ? v : '';
            if (!level.showcase) return embed(toStr(level.verification));
            return embed(toStr(level.showcase));
        },
        getLbBestRecord(level) {
            if (!level?.records?.length) return null;
            const s = [...level.records].sort((a, b) => b.percent - a.percent);
            return s[0].percent === 0 ? null : s[0];
        },
        getLbBestRun(level) {
            if (!level?.run?.length) return null;
            const s = [...level.run].sort((a, b) => {
                const diff = r => { const p = String(r.percent).split('-').map(Number); return p.length === 2 ? p[1] - p[0] : 0; };
                return diff(b) - diff(a);
            });
            const best = s[0];
            const p = String(best.percent).split('-').map(Number);
            return p.length === 2 && p[1] - p[0] > 0 ? best : null;
        },
    },
};
