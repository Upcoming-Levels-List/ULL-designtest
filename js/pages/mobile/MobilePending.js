import { mobileStore } from './mobileStore.js';

export default {
    template: `
        <div>
            <div class="mob-pending-section">
                <h3>Pending Placements</h3>
                <div v-if="mobileStore.pendingPlacements.length > 0">
                    <div v-for="level in mobileStore.pendingPlacements" class="mob-pending-row">
                        <img :src="'/assets/' + (level.placement === '?' ? 'question' : level.placement) + '.svg'" />
                        {{ level.name }}
                    </div>
                </div>
                <p v-else style="opacity:0.6;">No pending placements.</p>
            </div>
            <div class="mob-pending-section">
                <h3>Pending Movements</h3>
                <div v-if="mobileStore.pendingMovements.length > 0">
                    <div v-for="level in mobileStore.pendingMovements" class="mob-pending-row">
                        <img :src="'/assets/move-' + (level.placement === 'up' ? 'up' : 'down') + '.svg'" />
                        {{ level.name }}
                    </div>
                </div>
                <p v-else style="opacity:0.6;">No pending movements.</p>
            </div>
        </div>
    `,
    data: () => ({
        mobileStore,
    }),
};
