import { store } from '../../main.js';
import { guidelinesData } from '../../_guidelines.js';
import { mobileStore } from './mobileStore.js';

const roleIconMap = {
    owner: 'crown',
    admin: 'user-gear',
    seniormod: 'user-shield',
    mod: 'user-lock',
    dev: 'code',
};

export default {
    template: `
        <div class="mob-info">
            <!-- Hero -->
            <div class="mob-info-hero">
                <h1>Upcoming Levels List</h1>
                <p>The Upcoming Levels List (ULL) is a comprehensive catalogue of upcoming Top 1–100 Extreme Demons projected to be verified and placed on Pointercrate.</p>
            </div>

            <!-- Cards -->
            <div class="mob-info-content">
                <!-- List Editors -->
                <div class="mob-info-card">
                    <div class="mob-info-card__title">List Editors</div>
                    <div class="mob-info-editors">
                        <div v-for="editor in mobileStore.editors" class="mob-info-editor">
                            <img :src="'/assets/' + (roleIconMap[editor.role] || 'user-lock') + (store.dark ? '' : '-dark') + '.svg'" :alt="editor.role" />
                            <a v-if="editor.link && editor.link !== '#'" :href="editor.link" target="_blank">{{ editor.name }}</a>
                            <span v-else>{{ editor.name }}</span>
                            <span class="mob-info-role" :class="'mob-info-role-' + editor.role">{{ roleLabelMap[editor.role] || editor.role }}</span>
                        </div>
                    </div>
                </div>

                <!-- Level Coloring -->
                <div class="mob-info-card">
                    <div class="mob-info-card__title">Level Coloring</div>
                    <p class="mob-info-coloring-desc">When Level Coloring is enabled, level names in the list are color-coded based on their decoration progress and verification status.</p>
                    <div class="mob-info-legend">
                        <div class="mob-info-legend-row"><span class="mob-info-legend-dot" style="background:#5599ff"></span>On layout state<span class="mob-info-legend-label">Deco 0%</span></div>
                        <div class="mob-info-legend-row"><span class="mob-info-legend-dot" style="background:#33dddd"></span>Deco is 1%–29% finished<span class="mob-info-legend-label">Early deco</span></div>
                        <div class="mob-info-legend-row"><span class="mob-info-legend-dot" style="background:#55ee55"></span>Deco is 30%–69% finished<span class="mob-info-legend-label">Mid deco</span></div>
                        <div class="mob-info-legend-row"><span class="mob-info-legend-dot" style="background:#ffee55"></span>Deco is 70%–99% finished<span class="mob-info-legend-label">Late deco</span></div>
                        <div class="mob-info-legend-row"><span class="mob-info-legend-dot" style="background:#ffaa44"></span>Decoration finished<span class="mob-info-legend-label">Deco 100%</span></div>
                        <div class="mob-info-legend-row"><span class="mob-info-legend-dot" style="background:#ff6622"></span>Verification progress 30%–59%<span class="mob-info-legend-label">Early verify</span></div>
                        <div class="mob-info-legend-row"><span class="mob-info-legend-dot" style="background:#ff5555"></span>Verification progress 60%–99%<span class="mob-info-legend-label">Late verify</span></div>
                        <div class="mob-info-legend-row"><span class="mob-info-legend-dot" style="background:#bbbbbb"></span>Verified, not rated</div>
                        <div class="mob-info-legend-row"><span class="mob-info-legend-dot" style="background:#ffffff; border:1px solid #555;"></span>Verified and rated</div>
                        <div class="mob-info-legend-row"><span style="font-size:0.65rem; width:0.65rem; text-align:center; flex-shrink:0;">🚫</span>Pending for removal</div>
                    </div>
                </div>

                <!-- Pending List Legend -->
                <div class="mob-info-card">
                    <div class="mob-info-card__title">Pending List Legend</div>
                    <div class="mob-info-pending">
                        <div class="mob-info-pending-row"><img src="/assets/move-up.svg" alt="up" />Moving Up</div>
                        <div class="mob-info-pending-row"><img src="/assets/move-down.svg" alt="down" />Moving Down</div>
                        <div class="mob-info-pending-row"><img src="/assets/1.svg" alt="1" />Pending #1</div>
                        <div class="mob-info-pending-row"><img src="/assets/10.svg" alt="10" />Pending Top 10</div>
                        <div class="mob-info-pending-row"><img src="/assets/20.svg" alt="20" />Pending Top 20</div>
                        <div class="mob-info-pending-row"><img src="/assets/30.svg" alt="30" />Pending Top 30</div>
                        <div class="mob-info-pending-row"><img src="/assets/50.svg" alt="50" />Pending Top 50</div>
                        <div class="mob-info-pending-row"><img src="/assets/75.svg" alt="75" />Pending Top 75</div>
                        <div class="mob-info-pending-row"><img src="/assets/question.svg" alt="?" />Unknown Placement</div>
                    </div>
                </div>

                <!-- Guidelines -->
                <div class="mob-info-gl">
                    <div class="mob-info-gl-header">
                        <h2>Guidelines</h2>
                        <p>How the Upcoming Levels List works — rules, criteria, and procedures</p>
                        <input class="mob-info-gl-search" type="text" placeholder="Search guidelines..." v-model="mobGlSearch" />
                    </div>
                    <div class="mob-info-toc">
                        <template v-for="group in mobFilteredGuidelines" :key="group.id">
                            <div class="mob-info-toc-group">{{ group.group }}</div>
                            <a v-for="section in group.sections" :key="section.id"
                               class="mob-info-toc-link"
                               :class="{ active: mobActiveSection === section.id }"
                               @click="mobScrollToSection(section.id)">
                                {{ section.title }}
                            </a>
                        </template>
                    </div>
                    <div class="mob-info-gl-content" ref="mobGlContent">
                        <template v-if="mobFilteredGuidelines.length">
                            <template v-for="group in mobFilteredGuidelines" :key="group.id">
                                <div class="mob-info-gl-group-header" :id="'mob-gl-group-' + group.id">
                                    <h2>{{ group.group }}</h2>
                                </div>
                                <div v-if="group.intro" class="mob-info-gl-intro" v-html="group.intro"></div>
                                <div v-for="section in group.sections" :key="section.id"
                                     :id="'mob-gl-' + section.id"
                                     class="mob-info-gl-section">
                                    <h3>{{ section.title }}</h3>
                                    <div v-html="section.content"></div>
                                </div>
                            </template>
                        </template>
                        <div v-else class="mob-info-gl-no-results">
                            <span>🔍</span>
                            <p>No guidelines match your search.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="mob-info-footer">
                <h3>Upcoming Levels List</h3>
                <p>A community-maintained catalogue forecasting the future of the Geometry Dash Demonlist.</p>
                <div class="mob-info-footer-links">
                    <div class="mob-info-footer-col">
                        <h4>Navigate</h4>
                        <router-link to="/mobile/all">All Levels</router-link>
                        <router-link to="/mobile/leaderboard">Leaderboard</router-link>
                        <router-link to="/mobile/pending">Pending List</router-link>
                    </div>
                    <div class="mob-info-footer-col">
                        <h4>Community</h4>
                        <a href="https://discord.gg/9wVWSgJSe8" target="_blank">Discord Server</a>
                        <a href="https://docs.google.com/document/d/13dmRfx2OCiLEaM2EcgEd-mKdok11_k8k7HsA5a-K6nY/edit?usp=sharing" target="_blank">Full Guidelines Doc</a>
                    </div>
                </div>
                <div class="mob-info-footer-bottom">
                    <p>&copy; 2024–2026 Upcoming Levels List. Not affiliated with RobTop Games or Pointercrate.</p>
                </div>
            </div>
        </div>
    `,
    data: () => ({
        store,
        mobileStore,
        roleIconMap,
        roleLabelMap: { owner: 'Owner', admin: 'Admin', seniormod: 'Sr. Mod', mod: 'Mod', dev: 'Dev' },
        mobGlSearch: '',
        mobActiveSection: guidelinesData.length && guidelinesData[0].sections.length ? guidelinesData[0].sections[0].id : '',
    }),
    computed: {
        mobFilteredGuidelines() {
            const q = this.mobGlSearch.trim().toLowerCase();
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
        mobScrollToSection(id) {
            const el = document.getElementById('mob-gl-' + id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.mobActiveSection = id;
            }
        },
    },
};
