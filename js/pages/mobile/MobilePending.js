import { mobileStore } from './mobileStore.js';

export default {
    template: `
        <div class="mob-pending-page m2-page-body">
            <section class="m2-hero">
                <h1>Pending List</h1>
                <p>Levels awaiting a decision from the staff team — a first placement, a move up or down, a removal, or a hold.</p>
                <div class="m2-figs">
                    <span class="m2-fig"><b>{{ mobileStore.pendingPlacements.length }}</b><span>placements</span></span>
                    <span class="m2-fig"><b>{{ mobileStore.pendingMovements.length }}</b><span>movements</span></span>
                    <span class="m2-fig"><b>{{ removalCandidates.length }}</b><span>removals</span></span>
                    <span class="m2-fig"><b>{{ mobileStore.pendingIndefinite.length }}</b><span>on hold</span></span>
                </div>
            </section>

            <div class="m2-body">
                <section class="mob-pending-card u-card m2-lane m2-lane--place">
                    <h2 class="u-eyebrow">Pending Placements <span class="u-count">{{ mobileStore.pendingPlacements.length }}</span></h2>
                    <div v-if="mobileStore.pendingPlacements.length" class="m2-plist">
                        <div v-for="level in mobileStore.pendingPlacements" :key="level.name" class="mob-pending-row m2-prow">
                            <img class="m2-prow__icon" :src="getIconPath(level.placement)" alt="" />
                            <a v-if="level.link" :href="level.link" class="m2-prow__name">{{ level.name }}</a>
                            <span v-else class="m2-prow__name">{{ level.name }}</span>
                            <span class="m2-prow__target">{{ placementLabel(level.placement) }}</span>
                        </div>
                    </div>
                    <p v-else class="u-empty__d">No pending placements.</p>
                </section>

                <section class="mob-pending-card u-card m2-lane m2-lane--move">
                    <h2 class="u-eyebrow">Pending Movements <span class="u-count">{{ mobileStore.pendingMovements.length }}</span></h2>
                    <div v-if="mobileStore.pendingMovements.length" class="m2-plist">
                        <div v-for="level in mobileStore.pendingMovements" :key="level.name" class="mob-pending-row m2-prow">
                            <img class="m2-prow__icon" :src="'/assets/move-' + (level.placement === 'up' ? 'up' : 'down') + '.svg'" alt="" />
                            <a v-if="level.link" :href="level.link" class="m2-prow__name">{{ level.name }}</a>
                            <span v-else class="m2-prow__name">{{ level.name }}</span>
                            <span class="m2-prow__target">{{ level.placement === 'up' ? 'Move up' : 'Move down' }}</span>
                        </div>
                    </div>
                    <p v-else class="u-empty__d">No pending movements.</p>
                </section>

                <section class="mob-pending-card u-card m2-lane m2-lane--remove">
                    <h2 class="u-eyebrow">Pending Removals <span class="u-count">{{ removalCandidates.length }}</span></h2>
                    <div v-if="removalCandidates.length" class="m2-plist">
                        <div v-for="level in removalCandidates" :key="level.name" class="mob-pending-row m2-prow">
                            <span class="m2-prow__icon m2-prow__icon--mark">&times;</span>
                            <a v-if="level.link" :href="level.link" class="m2-prow__name">{{ level.name }}</a>
                            <span v-else class="m2-prow__name">{{ level.name }}</span>
                            <span class="m2-prow__target">#{{ level.rank }}</span>
                        </div>
                    </div>
                    <p v-else class="u-empty__d">No pending removals.</p>
                </section>

                <section class="mob-pending-card u-card m2-lane m2-lane--hold">
                    <h2 class="u-eyebrow">Pending Indefinitely <span class="u-count">{{ mobileStore.pendingIndefinite.length }}</span></h2>
                    <div v-if="mobileStore.pendingIndefinite.length" class="m2-plist">
                        <div v-for="level in mobileStore.pendingIndefinite" :key="level.name" class="mob-pending-row m2-prow">
                            <img class="m2-prow__icon" :src="getIconPath(level.placement)" alt="" />
                            <a v-if="level.link" :href="level.link" class="m2-prow__name">{{ level.name }}</a>
                            <span v-else class="m2-prow__name">{{ level.name }}</span>
                            <span class="m2-prow__target">{{ placementLabel(level.placement) }}</span>
                        </div>
                    </div>
                    <p v-else class="u-empty__d">No levels pending indefinitely.</p>
                </section>
            </div>
        </div>
    `,
    data: () => ({ mobileStore }),
    computed: {
        removalCandidates() {
            if (!mobileStore.rawList.length) return [];
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            return mobileStore.rawList
                .map(([level, err], i) => {
                    if (err || !level || level.isVerified) return null;
                    if (!level.lastUpd) return null;
                    const parts = level.lastUpd.split('.');
                    if (parts.length !== 3) return null;
                    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                    if (d >= oneYearAgo) return null;
                    // Removal candidates come from the level list, not the
                    // pending table, so they carry no link of their own — fall
                    // back to the level's showcase (then verification) video.
                    return { name: level.name, rank: i + 1, link: level.showcase || level.verification || '' };
                })
                .filter(Boolean);
        },
    },
    methods: {
        getIconPath(placement) {
            return `/assets/${placement === '?' || !placement ? 'question' : placement}.svg`;
        },
        // The placement a level waits for is the one thing this page exists to
        // say, and it used to be encoded only in which of six icons was drawn.
        placementLabel(placement) {
            return !placement || placement === '?' ? 'No info' : `Top ${placement}`;
        },
    },
};
