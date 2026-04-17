import { store } from '../../main.js';
import { embed } from '../../util.js';
import { mobileStore, applyFilters } from './mobileStore.js';

export default {
    props: {
        pageType: { type: String, default: 'all' },
    },
    template: `
        <div class="mob-list">
            <div class="mob-page-hero">
                <h1 v-if="pageType === 'main'">Main List</h1>
                <h1 v-else-if="pageType === 'future'">Future List</h1>
                <h1 v-else>All Levels</h1>
                <p v-if="pageType === 'main'">Levels projected to enter the top 150 of the Demonlist upon verification.</p>
                <p v-else-if="pageType === 'future'">Levels expected to place beyond the top 150 — the next wave of Extreme Demons.</p>
                <p v-else>Every level tracked for future placement on the Geometry Dash Demonlist.</p>
            </div>
            <input v-model="mobileStore.search" @input="applyFilters()" class="mob-search" type="text" placeholder="Search levels..." />
            <div v-if="noResults" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;opacity:0.25;gap:0.5rem;text-align:center;color:var(--color-on-background);">
                <span style="font-size:1.5rem;">🔍</span>
                <p style="font-size:0.8rem;font-family:'Lexend Deca',sans-serif;">No levels match your search.</p>
            </div>
            <div v-for="([level, err], i) in displayList" :key="i" class="mob-level-row" v-show="!level?.isHidden">
                <button class="mob-level-btn" :class="{ active: selected === i }" @click="selected = selected === i ? -1 : i">
                    <span class="mob-rank" :style="mobileStore.showColors ? getLevelNameStyle(level, selected === i) : {}">
                        <span v-if="i + 1 <= 500">#{{ i + 1 }}</span>
                        <span v-else>{{ pageType === 'all' ? 'Londenberg' : pageType === 'main' ? 'Leg' : 'Legacy' }}</span>
                    </span>
                    <img v-if="mobileStore.showThumbnails && level" class="mob-thumb" :src="getThumbnail(level)" alt="" />
                    <div class="mob-level-info">
                        <div class="mob-level-name" :style="mobileStore.showColors ? getLevelNameStyle(level, selected === i) : {fontWeight: level?.isVerified ? 'bold' : 'normal', color: level?.isVerified ? (selected === i ? (!store.dark ? '#ffffff' : '#000000') : '#bbbbbb') : ''}">
                            {{ level?.name ? (mobileStore.showColors && isOldLevel(level) && !level?.isVerified ? level.name + ' \u{1F6AB}' : level.name) : \`Error (\${err}.json)\` }}
                        </div>
                        <div class="mob-level-sub" v-if="level">
                            {{ level.author }} · {{ level.verifier }}
                        </div>
                    </div>
                </button>
                <div v-if="selected === i && level" class="mob-level-detail">
                    <div class="mob-author-block">
                        <div class="mob-author-row"><span class="mob-author-label">Level Author</span><span class="mob-author-value">{{ level.author }}</span></div>
                        <div class="mob-author-row" v-if="level.creators && level.creators.length"><span class="mob-author-label">Creators</span><span class="mob-author-value">{{ level.creators.join(', ') }}</span></div>
                        <div class="mob-author-row"><span class="mob-author-label">{{ level.isVerified ? 'Verified by' : 'To be verified by' }}</span><span class="mob-author-value">{{ level.verifier }}</span></div>
                    </div>
                    <div class="mob-tags" v-if="level.tags && level.tags.length">
                        <span v-for="tag in level.tags" class="mob-tag">{{ tag }}</span>
                    </div>
                    <div class="mob-status">
                        <template v-if="level.isVerified">Status: Verified</template>
                        <template v-else-if="level.percentFinished == 0">Status: Layout</template>
                        <template v-else-if="level.percentFinished == 100">Status: Being Verified</template>
                        <template v-else>Status: Decoration {{ level.percentFinished }}% done</template>
                    </div>
                    <div v-if="!level.isVerified && level.records[0].percent != 100">
                        <div v-if="level.records[0].percent != 0" class="mob-wr">
                            WR From 0: <a v-if="level.records[0].link && level.records[0].link != '#'" :href="level.records[0].link" target="_blank">{{ level.records[0].percent }}% by {{ level.records[0].user }}</a><template v-else>{{ level.records[0].percent }}% by {{ level.records[0].user }}</template>
                        </div>
                        <div v-else class="mob-wr">WR From 0: None</div>
                        <div v-if="level.run[0].percent != '0'" class="mob-wr">
                            WR Run: <a v-if="level.run[0].link && level.run[0].link != '#'" :href="level.run[0].link" target="_blank">{{ level.run[0].percent }}% by {{ level.run[0].user }}</a><template v-else>{{ level.run[0].percent }}% by {{ level.run[0].user }}</template>
                        </div>
                        <div v-else class="mob-wr">WR Run: None</div>
                    </div>
                    <div v-if="!level.isVerified && level.records[0].percent == 100" class="mob-wr">
                        Layout verified by {{ level.records[0].user }}
                    </div>
                    <div v-if="level.isVerified" class="mob-showcase-tabs">
                        <button class="mob-showcase-tab" :class="{ active: toggledShowcase }" @click="toggledShowcase = true">Showcase</button>
                        <button class="mob-showcase-tab" :class="{ active: !toggledShowcase }" @click="toggledShowcase = false">Verification</button>
                    </div>
                    <iframe class="mob-video" :src="getVideo(level)" frameborder="0" allowfullscreen></iframe>
                    <div class="mob-stats">
                        <dl class="mob-stat"><dt>ID</dt><dd>{{ (level.id === 'private' && level.leakID != null) ? level.leakID : level.id }}</dd></dl>
                        <dl class="mob-stat"><dt>Length</dt><dd>{{ Math.floor(level.length/60) }}m {{ level.length%60 }}s</dd></dl>
                        <dl class="mob-stat"><dt>Updated</dt><dd>{{ level.lastUpd }}</dd></dl>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: () => ({
        store,
        mobileStore,
        selected: -1,
        toggledShowcase: false,
    }),
    computed: {
        displayList() {
            if (this.pageType === 'main') return mobileStore.rawList.filter(([l]) => l?.isMain);
            if (this.pageType === 'future') return mobileStore.rawList.filter(([l]) => l?.isFuture);
            return mobileStore.rawList;
        },
        noResults() {
            if (!mobileStore.search.trim()) return false;
            return this.displayList.every(([level]) => !level || level.isHidden);
        },
    },
    methods: {
        applyFilters,
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
            return embed(this.toggledShowcase || !level.isVerified ? toStr(level.showcase) : toStr(level.verification));
        },
        getLevelNameStyle(level, isSelected) {
            if (!level) return {};
            const dark = !this.store.dark;
            if (level.tags?.includes('Unrated')) {
                const c = isSelected ? (dark ? '#dddddd' : '#888888') : (dark ? '#bbbbbb' : '#666666');
                return { color: c, fontWeight: level.isVerified ? 'bold' : 'normal' };
            }
            if (level.tags?.includes('Rated')) return { color: dark ? '#ffffff' : '#000000', fontWeight: level.isVerified ? 'bold' : 'normal' };
            if (level.isVerified) {
                return { color: isSelected ? (dark ? '#ffffff' : '#000000') : '#bbbbbb', fontWeight: 'bold' };
            }
            const rP = Math.max(0, ...((level.records || []).map(r => Number(r.percent) || 0)));
            const runP = Math.max(0, ...((level.run || []).map(r => {
                const p = String(r.percent).split('-').map(Number);
                return p.length === 2 ? Math.abs(p[1] - p[0]) : 0;
            })));
            const vP = Math.max(rP, runP);
            const pf = level.percentFinished ?? 0;
            let color;
            if (pf === 100 && vP >= 60) color = dark ? (isSelected ? '#ff9999' : '#ff5555') : (isSelected ? '#cc7a7a' : '#cc4444');
            else if (pf === 100 && vP >= 30) color = dark ? (isSelected ? '#ffaa66' : '#ff6622') : (isSelected ? '#cc8851' : '#cc511b');
            else if (pf === 100) color = dark ? (isSelected ? '#ffcc77' : '#ffaa44') : (isSelected ? '#cca35f' : '#cc8836');
            else if (pf >= 70) color = dark ? (isSelected ? '#ffff77' : '#ffee55') : (isSelected ? '#cccc5f' : '#ccbe44');
            else if (pf >= 30) color = dark ? (isSelected ? '#88ff88' : '#55ee55') : (isSelected ? '#6ccc6c' : '#44be44');
            else if (pf >= 1) color = dark ? (isSelected ? '#66ffff' : '#33dddd') : (isSelected ? '#51cccc' : '#28b0b0');
            else color = dark ? (isSelected ? '#88bbff' : '#5599ff') : (isSelected ? '#6c95cc' : '#447acc');
            return { color, fontWeight: 'normal' };
        },
        isOldLevel(level) {
            if (!level.lastUpd) return false;
            const p = level.lastUpd.split('.');
            if (p.length !== 3) return false;
            const d = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
            const ago = new Date(); ago.setFullYear(ago.getFullYear() - 1);
            return d < ago;
        },
    },
};
