import { store } from "../main.js";
import { fetchPending, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import Footer from "../components/Footer.js";

export default {
    components: { Spinner, Footer },
    template: `
        <main v-if="loading" class="surface" style="display:flex;align-items:center;justify-content:center;">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-pending surface ull2">
            <!-- Hero -->
            <section class="pending-hero">
                <h1>Pending List</h1>
                <p>Levels awaiting a decision from the staff team &mdash; a first placement, a move up or down, a removal, or a hold with no decision expected soon.</p>
                <div class="pending-counts">
                    <button class="pending-count" type="button" @click="jumpTo('place')"><b>{{ pendingPlacements.length }}</b><span>placements</span></button>
                    <button class="pending-count" type="button" @click="jumpTo('move')"><b>{{ pendingMovements.length }}</b><span>movements</span></button>
                    <button class="pending-count" type="button" @click="jumpTo('remove')"><b>{{ removalCandidates.length }}</b><span>removals</span></button>
                    <button class="pending-count" type="button" @click="jumpTo('hold')"><b>{{ pendingIndefinite.length }}</b><span>on hold</span></button>
                </div>
            </section>

            <!-- Two columns of stacked lanes rather than one grid. In a grid
                 every card shares a row, so a short lane left the card beneath
                 it waiting on the tall lane beside it. -->
            <div class="pending-content">
                <div class="pending-cards">
                    <div class="pending-col">
                        <section class="pending-card pending-card--place" ref="place">
                            <h2 class="u-eyebrow pending-card__title">Pending Placements <span class="u-count">{{ pendingPlacements.length }}</span></h2>
                            <div v-if="pendingPlacements.length" class="pending-rows">
                                <div v-for="level in pendingPlacements" :key="level.name" class="pending-row">
                                    <img class="pending-row__icon" :src="getIconPath(level.placement === '?' ? 'question' : level.placement)" alt="" />
                                    <a v-if="level.link" :href="level.link" class="pending-row__name">{{ level.name }}</a>
                                    <span v-else class="pending-row__name">{{ level.name }}</span>
                                    <span class="pending-row__target">{{ placementLabel(level.placement) }}</span>
                                </div>
                            </div>
                            <p v-else class="pending-empty">No pending placements.</p>
                        </section>
                        <template v-if="!placementsDominate">
                        <section class="pending-card pending-card--hold" ref="hold">
                            <h2 class="u-eyebrow pending-card__title">Pending Indefinitely <span class="u-count">{{ pendingIndefinite.length }}</span></h2>
                            <div v-if="pendingIndefinite.length" class="pending-rows">
                                <div v-for="level in pendingIndefinite" :key="level.name" class="pending-row">
                                    <img class="pending-row__icon" :src="getIconPath(level.placement === '?' ? 'question' : level.placement)" alt="" />
                                    <a v-if="level.link" :href="level.link" class="pending-row__name">{{ level.name }}</a>
                                    <span v-else class="pending-row__name">{{ level.name }}</span>
                                    <span class="pending-row__target">{{ placementLabel(level.placement) }}</span>
                                </div>
                            </div>
                            <p v-else class="pending-empty">No levels pending indefinitely.</p>
                        </section>
                        </template>
                    </div>
                    <div class="pending-col">
                        <!-- Placements can run longer than the other three put
                             together. When it does, the hold lane moves over so
                             the second column is not left short. -->
                        <template v-if="placementsDominate">
                        <section class="pending-card pending-card--hold" ref="hold">
                            <h2 class="u-eyebrow pending-card__title">Pending Indefinitely <span class="u-count">{{ pendingIndefinite.length }}</span></h2>
                            <div v-if="pendingIndefinite.length" class="pending-rows">
                                <div v-for="level in pendingIndefinite" :key="level.name" class="pending-row">
                                    <img class="pending-row__icon" :src="getIconPath(level.placement === '?' ? 'question' : level.placement)" alt="" />
                                    <a v-if="level.link" :href="level.link" class="pending-row__name">{{ level.name }}</a>
                                    <span v-else class="pending-row__name">{{ level.name }}</span>
                                    <span class="pending-row__target">{{ placementLabel(level.placement) }}</span>
                                </div>
                            </div>
                            <p v-else class="pending-empty">No levels pending indefinitely.</p>
                        </section>
                        </template>
                        <section class="pending-card pending-card--move" ref="move">
                            <h2 class="u-eyebrow pending-card__title">Pending Movements <span class="u-count">{{ pendingMovements.length }}</span></h2>
                            <div v-if="pendingMovements.length" class="pending-rows">
                                <div v-for="level in pendingMovements" :key="level.name" class="pending-row">
                                    <img class="pending-row__icon" :src="'/assets/move-' + (level.placement === 'up' ? 'up' : 'down') + '.svg'" alt="" />
                                    <a v-if="level.link" :href="level.link" class="pending-row__name">{{ level.name }}</a>
                                    <span v-else class="pending-row__name">{{ level.name }}</span>
                                    <span class="pending-row__target">{{ level.placement === 'up' ? 'Move up' : 'Move down' }}</span>
                                </div>
                            </div>
                            <p v-else class="pending-empty">No pending movements.</p>
                        </section>
                        <section class="pending-card pending-card--remove" ref="remove">
                            <h2 class="u-eyebrow pending-card__title">Pending Removals <span class="u-count">{{ removalCandidates.length }}</span></h2>
                            <div v-if="removalCandidates.length" class="pending-rows">
                                <div v-for="level in removalCandidates" :key="level.name" class="pending-row">
                                    <span class="pending-row__icon pending-row__icon--mark">&times;</span>
                                    <a v-if="level.link" :href="level.link" class="pending-row__name">{{ level.name }}</a>
                                    <span v-else class="pending-row__name">{{ level.name }}</span>
                                    <span class="pending-row__target">#{{ level.rank }}</span>
                                </div>
                            </div>
                            <p v-else class="pending-empty">No pending removals.</p>
                        </section>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <Footer />
        </main>
    `,
    data: () => ({
        pendingPlacements: [],
        pendingMovements: [],
        pendingIndefinite: [],
        removalCandidates: [],
        loading: true,
        store,
    }),
    async mounted() {
        const [pending, list] = await Promise.all([fetchPending(), fetchList()]);

        if (pending) {
            const isMove = (p) => ["up", "down"].includes((p.placement || "").toLowerCase());
            const byPlacement = (a, b) => {
                const getVal = (p) => p === "?" ? 999999 : (parseInt(p) || 999999);
                return getVal(a.placement) - getVal(b.placement) || a.name.localeCompare(b.name);
            };

            this.pendingPlacements = pending
                .filter(p => !isMove(p) && !p.indefinite)
                .sort(byPlacement);

            this.pendingMovements = pending.filter(isMove);

            this.pendingIndefinite = pending
                .filter(p => !isMove(p) && p.indefinite)
                .sort(byPlacement);
        }

        if (list) {
            const now = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);

            this.removalCandidates = list
                .map(([level, err], i) => {
                    if (err || !level || level.isVerified) return null;
                    if (!level.lastUpd) return null;
                    const parts = level.lastUpd.split('.');
                    if (parts.length !== 3) return null;
                    const levelDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                    if (levelDate >= oneYearAgo) return null;
                    // Removal candidates come from the level list, not the
                    // pending table, so they carry no link of their own — fall
                    // back to the level's showcase (then verification) video.
                    return { name: level.name, rank: i + 1, link: level.showcase || level.verification || '' };
                })
                .filter(Boolean);
        }

        this.loading = false;
    },
    computed: {
        // Rows, not pixels: the lanes are all the same shape, so their row
        // counts stand in for their heights without measuring anything.
        placementsDominate() {
            return this.pendingPlacements.length
                > this.pendingMovements.length + this.removalCandidates.length + this.pendingIndefinite.length;
        },
    },
    methods: {
        jumpTo(lane) {
            const el = this.$refs[lane];
            const target = Array.isArray(el) ? el[0] : el;
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        // The placement a level is waiting for is the one thing this page
        // exists to say, and it used to be encoded only in which of six icons
        // was drawn. The icon stays for scanning; the words say it outright.
        placementLabel(placement) {
            return !placement || placement === '?' ? 'No info' : `Top ${placement}`;
        },
        getIconPath(icon) {
            return `/assets/${icon}.svg`;
        },
    },
};
