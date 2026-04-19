import { store } from '../../main.js';
import { fetchRecentChanges } from '../../content.js';
import { mobileStore } from './mobileStore.js';

const roleIconMap = {
    owner: 'crown',
    admin: 'user-gear',
    seniormod: 'user-shield',
    mod: 'user-lock',
    dev: 'code',
};

const roleLabelMap = { owner: 'Owner', admin: 'Admin', seniormod: 'Sr. Mod', mod: 'Mod', dev: 'Dev' };

export default {
    template: `
        <div class="mob-home-page">

            <!-- Hero -->
            <div class="mob-home-hero">
                <h1>Upcoming Levels List</h1>
                <p>A community-maintained catalogue forecasting the future of the Geometry Dash Demonlist. Tracking upcoming Top 1–100 Extreme Demons before they reach Pointercrate.</p>
            </div>

            <!-- Actions -->
            <div class="mob-home-actions">
                <div class="mob-home-btn-row">
                    <router-link to="/mobile/all" class="mob-home-btn">View All Levels</router-link>
                    <router-link to="/mobile/future" class="mob-home-btn">Explore Future List</router-link>
                </div>
                <div class="mob-home-btn-row mob-home-social-row">
                    <a href="https://discord.gg/9wVWSgJSe8" target="_blank" class="mob-home-social-btn">
                        <img src="/assets/discord.svg" :style="store.dark ? 'filter:invert(1)' : ''" alt="Discord" />
                        Discord
                    </a>
                    <a href="#" class="mob-home-social-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
                            <path d="M22.26 2.01L1.27 10.25c-1.42.57-1.4 1.37-.26 1.73l5.35 1.67 12.38-7.82c.58-.36 1.12-.16.68.23L8.83 16.95l-.4 5.63c.58 0 .84-.27 1.16-.58l2.79-2.71 5.8 4.28c1.07.59 1.84.29 2.1-.99l3.8-17.89c.4-1.58-.6-2.3-1.82-1.68z"/>
                        </svg>
                        Telegram
                    </a>
                </div>
            </div>

            <!-- Cards -->
            <div class="mob-home-cards">

                <!-- Recent Changes -->
                <div class="mob-info-card">
                    <div class="mob-info-card__title">Recent Changes</div>
                    <div class="mob-home-changes">
                        <template v-for="group in recentChanges" :key="group.date">
                            <div class="mob-home-changes-date">{{ group.date }}</div>
                            <div v-for="entry in group.entries" :key="entry" class="mob-home-change" v-html="formatChange(entry)"></div>
                        </template>
                    </div>
                </div>

                <!-- List Editors -->
                <div class="mob-info-card">
                    <div class="mob-info-card__title">List Editors</div>
                    <div class="mob-info-editors">
                        <div v-for="editor in mobileStore.editors" :key="editor.name" class="mob-info-editor">
                            <img :src="'/assets/' + (roleIconMap[editor.role] || 'user-lock') + (store.dark ? '' : '-dark') + '.svg'" :alt="editor.role" />
                            <a v-if="editor.link && editor.link !== '#'" :href="editor.link" target="_blank">{{ editor.name }}</a>
                            <span v-else>{{ editor.name }}</span>
                            <span class="mob-info-role" :class="'mob-info-role-' + editor.role">{{ roleLabelMap[editor.role] || editor.role }}</span>
                        </div>
                    </div>
                </div>

                <!-- Partner Lists -->
                <div class="mob-info-card">
                    <div class="mob-info-card__title">Partner Lists</div>
                    <div class="mob-home-partners-grid">
                        <a href="#" target="_blank" class="mob-home-partner">
                            <div class="mob-home-partner-logo"><div class="mob-home-partner-logo-placeholder"></div></div>
                            <div class="mob-home-partner-name">Demonlist</div>
                        </a>
                        <a href="#" target="_blank" class="mob-home-partner">
                            <div class="mob-home-partner-logo"><div class="mob-home-partner-logo-placeholder"></div></div>
                            <div class="mob-home-partner-name">Challenge List</div>
                        </a>
                        <a href="#" target="_blank" class="mob-home-partner">
                            <div class="mob-home-partner-logo"><div class="mob-home-partner-logo-placeholder"></div></div>
                            <div class="mob-home-partner-name">Platformer List</div>
                        </a>
                        <a href="#" target="_blank" class="mob-home-partner">
                            <div class="mob-home-partner-logo"><div class="mob-home-partner-logo-placeholder"></div></div>
                            <div class="mob-home-partner-name">Upcoming List</div>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    `,
    data: () => ({
        store,
        mobileStore,
        roleIconMap,
        roleLabelMap,
        recentChanges: [],
    }),
    async mounted() {
        this.recentChanges = await fetchRecentChanges() || [];
    },
    methods: {
        formatChange(text) {
            const html = text
                .split(/(\*\*[^*]+\*\*)/)
                .map(part => part.startsWith('**') && part.endsWith('**')
                    ? `<strong>${part.slice(2, -2)}</strong>`
                    : part ? `<span class="dim">${part}</span>` : '')
                .join('');
            return `<span class="dim">— </span>${html}`;
        },
    },
};
