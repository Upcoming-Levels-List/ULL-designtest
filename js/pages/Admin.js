import { store } from '../main.js';
import AdminLogin from '../components/AdminLogin.js';
import Footer from '../components/Footer.js';

const API = 'https://d1-wrkr.ullteam.workers.dev';

export default {
    components: { AdminLogin, Footer },
    template: `
<main class="admin-page surface">
    <AdminLogin v-if="!store.authKey" />
    <div v-else class="admin-content">
        <div class="admin-header">
            <h1 class="admin-title">Level Manager</h1>
            <button class="admin-logout-btn" @click="store.authKey = ''">Log out</button>
        </div>

        <div class="admin-toolbar">
            <input v-model="search" class="admin-search" placeholder="Search by name or author…" />
            <span class="admin-count">{{ filteredLevels.length }} levels</span>
        </div>

        <div v-if="loading" class="admin-loading">Loading levels…</div>

        <div v-else-if="!filteredLevels.length" class="admin-empty">No levels match your search.</div>

        <table v-else class="admin-table">
            <thead>
                <tr>
                    <th class="admin-th admin-th--pos">#</th>
                    <th class="admin-th">Level</th>
                    <th class="admin-th admin-th--type">Type</th>
                    <th class="admin-th admin-th--move">Move to</th>
                    <th class="admin-th admin-th--action"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="level in filteredLevels" :key="level.path" class="admin-row">
                    <td class="admin-td admin-td--pos">{{ level.sort_order + 1 }}</td>
                    <td class="admin-td admin-td--name">
                        <div class="admin-level-name">{{ level.name }}</div>
                        <div class="admin-level-author">{{ level.author }}</div>
                    </td>
                    <td class="admin-td admin-td--type">
                        <span v-if="level.isVerified" class="admin-badge admin-badge--verified">Verified</span>
                        <span v-else-if="level.isMain" class="admin-badge admin-badge--main">Main</span>
                        <span v-else-if="level.isFuture" class="admin-badge admin-badge--future">Future</span>
                    </td>
                    <td class="admin-td admin-td--move">
                        <input
                            v-model.number="level._newPos"
                            type="number"
                            min="1"
                            :max="levels.length"
                            class="admin-pos-input"
                            @keydown.enter="moveLevel(level)"
                        />
                        <button
                            class="admin-btn admin-btn--move"
                            :disabled="level._moving"
                            @click="moveLevel(level)"
                        >{{ level._moving ? '…' : 'Move' }}</button>
                    </td>
                    <td class="admin-td admin-td--action">
                        <button
                            class="admin-btn admin-btn--delete"
                            :disabled="level._deleting"
                            @click="deleteLevel(level)"
                        >{{ level._deleting ? '…' : 'Delete' }}</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <Footer />
    </div>
</main>
    `,
    data: () => ({
        store,
        levels: [],
        search: '',
        loading: false,
    }),
    computed: {
        filteredLevels() {
            if (!this.search.trim()) return this.levels;
            const q = this.search.toLowerCase();
            return this.levels.filter(l =>
                l.name?.toLowerCase().includes(q) || l.author?.toLowerCase().includes(q)
            );
        },
    },
    watch: {
        'store.authKey'(val) {
            if (val) this.loadLevels();
        },
    },
    async mounted() {
        if (store.authKey) this.loadLevels();
    },
    methods: {
        async loadLevels() {
            this.loading = true;
            try {
                const res = await fetch(`${API}/api/list`);
                const data = await res.json();
                this.levels = data.map(l => ({ ...l, _newPos: l.sort_order + 1, _moving: false, _deleting: false }));
            } catch {
                alert('Failed to load levels.');
            }
            this.loading = false;
        },
        async moveLevel(level) {
            const newPos = level._newPos;
            if (!newPos || newPos < 1 || newPos > this.levels.length || newPos === level.sort_order + 1) return;
            level._moving = true;
            try {
                const res = await fetch(`${API}/api/levels/move`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${store.authKey}`,
                    },
                    body: JSON.stringify({ path: level.path, newPosition: newPos }),
                });
                if (res.ok) {
                    await this.loadLevels();
                } else {
                    alert('Failed to move level.');
                    level._moving = false;
                }
            } catch {
                alert('Network error.');
                level._moving = false;
            }
        },
        async deleteLevel(level) {
            if (!confirm(`Delete "${level.name}"? This cannot be undone.`)) return;
            level._deleting = true;
            try {
                const res = await fetch(`${API}/api/levels/${encodeURIComponent(level.path)}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${store.authKey}` },
                });
                if (res.ok) {
                    this.levels = this.levels.filter(l => l.path !== level.path);
                    this.levels.forEach((l, i) => { l.sort_order = i; l._newPos = i + 1; });
                } else {
                    alert('Failed to delete level.');
                    level._deleting = false;
                }
            } catch {
                alert('Network error.');
                level._deleting = false;
            }
        },
    },
};
