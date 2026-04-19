import { store } from '../main.js';
import { fetchEditors, fetchLevelMonth, fetchLevelVerif } from '../content.js';
import { guidelinesData } from '../_guidelines.js';
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
<main class="info-page surface">
    <!-- Hero -->
    <section class="info-hero">
        <h1>Upcoming Levels List</h1>
        <p>
            The Upcoming Levels List (ULL) is a comprehensive catalogue of upcoming Top 1\u2013100 Extreme Demons
            projected to be verified and placed on Pointercrate. The list aims to forecast the future of
            the Demonlist, and also features unrated Extreme Demons that may have qualified for a rating
            at the time of their creation.
        </p>
    </section>

    <!-- Cards -->
    <div class="info-content">
        <div class="info-cards">

            <!-- List Editors -->
            <div class="info-card">
                <div class="info-card__title">List Editors</div>
                <p class="info-coloring-desc">
                     Trusted group of dedicated members responsible for maintaining the Upcoming Levels List. Their work includes adding new levels, editing existing ones, and ensuring the list stays accurate.
                </p>
                <div class="info-editors">
                    <div v-for="editor in editors" class="info-editor">
                        <img :src="'/assets/' + (roleIconMap[editor.role] || 'user-lock') + (store.dark ? '' : '-dark') + '.svg'" :alt="editor.role" />
                        <a v-if="editor.link && editor.link !== '#'" :href="editor.link" target="_blank">{{ editor.name }}</a>
                        <span v-else class="info-editor__name">{{ editor.name }}</span>
                        <span class="info-role" :class="'info-role-' + editor.role">{{ roleLabel(editor.role) }}</span>
                    </div>
                </div>
            </div>

            <!-- Level Coloring -->
            <div class="info-card">
                <div class="info-card__title">Level Coloring</div>
                <p class="info-coloring-desc">
                    When Level Coloring is enabled, level names in the list are color-coded
                    based on their decoration progress and verification status.
                </p>
                <div class="info-legend">
                    <div class="info-legend-row">
                        <span class="info-legend-dot" style="background:#5599ff"></span>
                        On layout state
                        <span class="info-legend-label">Deco 0%</span>
                    </div>
                    <div class="info-legend-row">
                        <span class="info-legend-dot" style="background:#33dddd"></span>
                        Deco is 1%\u201329% finished
                        <span class="info-legend-label">Early deco</span>
                    </div>
                    <div class="info-legend-row">
                        <span class="info-legend-dot" style="background:#55ee55"></span>
                        Deco is 30%\u201369% finished
                        <span class="info-legend-label">Mid deco</span>
                    </div>
                    <div class="info-legend-row">
                        <span class="info-legend-dot" style="background:#ffee55"></span>
                        Deco is 70%\u201399% finished
                        <span class="info-legend-label">Late deco</span>
                    </div>
                    <div class="info-legend-row">
                        <span class="info-legend-dot" style="background:#ffaa44"></span>
                        Decoration finished
                        <span class="info-legend-label">Deco 100%</span>
                    </div>
                    <div class="info-legend-row">
                        <span class="info-legend-dot" style="background:#ff6622"></span>
                        Verification progress 30%\u201359%
                        <span class="info-legend-label">Early verify</span>
                    </div>
                    <div class="info-legend-row">
                        <span class="info-legend-dot" style="background:#ff5555"></span>
                        Verification progress 60%\u201399%
                        <span class="info-legend-label">Late verify</span>
                    </div>
                    <div class="info-legend-row">
                        <span class="info-legend-dot" style="background:#bbbbbb"></span>
                        Verified, not rated
                    </div>
                    <div class="info-legend-row">
                        <span class="info-legend-dot" style="background:#ffffff; border:1px solid #555;"></span>
                        Verified and rated
                    </div>
                    <div class="info-legend-row">
                        <span style="font-size:0.7rem; width:0.7rem; text-align:center; flex-shrink:0;">\u{1F6AB}</span>
                        Pending for removal
                    </div>
                </div>
            </div>

            <!-- Pending List Legend (full width) -->
            <div class="info-card" style="grid-column: 1 / -1;">
                <div class="info-card__title">Pending List Legend</div>
                <div class="info-pending">
                    <div class="info-pending-row"><img src="/assets/move-up.svg" alt="up" />Moving Up</div>
                    <div class="info-pending-row"><img src="/assets/move-down.svg" alt="down" />Moving Down</div>
                    <div class="info-pending-row"><img src="/assets/1.svg" alt="1" />Pending #1</div>
                    <div class="info-pending-row"><img src="/assets/10.svg" alt="10" />Pending Top 10</div>
                    <div class="info-pending-row"><img src="/assets/20.svg" alt="20" />Pending Top 20</div>
                    <div class="info-pending-row"><img src="/assets/30.svg" alt="30" />Pending Top 30</div>
                    <div class="info-pending-row"><img src="/assets/50.svg" alt="50" />Pending Top 50</div>
                    <div class="info-pending-row"><img src="/assets/75.svg" alt="75" />Pending Top 75</div>
                    <div class="info-pending-row"><img src="/assets/question.svg" alt="?" />Unknown Placement</div>
                </div>
            </div>
        </div>

        <!-- LotM + CTV -->
        <div class="home-grid-2col" style="margin-bottom:1.5rem;" v-if="levelMonth || levelVerif">
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
                            <span class="home-level-sep">·</span>
                            <span class="home-level-id">{{ levelMonth.id }}</span>
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
        </div>

        <!-- Guidelines -->
        <div class="info-guidelines">
            <div class="info-guidelines-header">
                <div>
                    <h2>Guidelines</h2>
                    <p>How the Upcoming Levels List works \u2014 rules, criteria, and procedures</p>
                </div>
                <input class="info-guidelines-search" type="text" placeholder="Search guidelines..." v-model="glSearch" />
            </div>
            <div class="info-guidelines-body" ref="glBody">
                <nav class="info-toc" :style="{ overflowY: glBodyVisible ? 'auto' : 'hidden' }">
                    <template v-for="group in filteredGuidelines" :key="group.id">
                        <div class="info-toc-group">{{ group.group }}</div>
                        <a v-for="section in group.sections" :key="section.id"
                           class="info-toc-link"
                           :class="{ active: activeSection === section.id }"
                           @click="scrollToSection(section.id)">
                            {{ section.title }}
                        </a>
                    </template>
                </nav>
                <div class="info-guidelines-content" ref="glContent" @scroll="onGlScroll" :style="{ overflowY: glBodyVisible ? 'auto' : 'hidden' }">
                    <template v-if="filteredGuidelines.length">
                        <template v-for="group in filteredGuidelines" :key="group.id">
                            <div class="info-gl-group-header" :id="'gl-group-' + group.id">
                                <h2>{{ group.group }}</h2>
                            </div>
                            <div v-if="group.intro" class="info-gl-intro" v-html="group.intro"></div>
                            <div v-for="section in group.sections" :key="section.id"
                                 :id="'gl-' + section.id"
                                 class="info-gl-section">
                                <h3>{{ section.title }}</h3>
                                <div v-html="section.content"></div>
                            </div>
                        </template>
                    </template>
                    <div v-else class="info-gl-no-results">
                        <span>\u{1F50D}</span>
                        <p>No guidelines match your search.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <Footer />
</main>
    `,
    data: () => ({
        store,
        roleIconMap,
        editors: [],
        glSearch: '',
        activeSection: '',
        glBodyVisible: false,
        levelMonth: null,
        levelVerif: null,
    }),
    computed: {
        filteredGuidelines() {
            const q = this.glSearch.trim().toLowerCase();
            if (!q) return guidelinesData;
            return guidelinesData
                .map(group => {
                    const sections = group.sections.filter(s =>
                        s.title.toLowerCase().includes(q) ||
                        s.content.toLowerCase().includes(q)
                    );
                    if (!sections.length) return null;
                    return { ...group, sections };
                })
                .filter(Boolean);
        },
    },
    methods: {
        roleLabel(role) { return roleLabelMap[role] || role; },
        ytThumb(url) {
            if (!url) return '';
            const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
            return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : url;
        },
        scrollToSection(id) {
            const container = this.$refs.glContent;
            const el = document.getElementById('gl-' + id);
            if (el && container) {
                container.scrollTo({
                    top: el.offsetTop - container.offsetTop,
                    behavior: 'smooth'
                });
                this.activeSection = id;
            }
        },
        onGlScroll() {
            const container = this.$refs.glContent;
            if (!container) return;
            const sections = container.querySelectorAll('.info-gl-section');
            let current = '';
            for (const sec of sections) {
                const rect = sec.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (rect.top - containerRect.top <= 60) {
                    current = sec.id.replace('gl-', '');
                }
            }
            if (current) this.activeSection = current;
        },
    },
    async mounted() {
        [this.editors, this.levelMonth, this.levelVerif] = await Promise.all([
            fetchEditors().then(r => r || []),
            fetchLevelMonth(),
            fetchLevelVerif(),
        ]);
        if (guidelinesData.length && guidelinesData[0].sections.length) {
            this.activeSection = guidelinesData[0].sections[0].id;
        }
        this.$nextTick(() => {
            const body = this.$refs.glBody;
            if (body) {
                this._glObserver = new IntersectionObserver(([entry]) => {
                    this.glBodyVisible = entry.intersectionRatio >= 0.5;
                }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
                this._glObserver.observe(body);
            }
        });
    },
    beforeUnmount() {
        if (this._glObserver) this._glObserver.disconnect();
    },
};

