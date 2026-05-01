import { store } from '../main.js';
import AdminLogin from '../components/AdminLogin.js';
import Footer from '../components/Footer.js';

const API = 'https://d1-wrkr.ullteam.workers.dev';

const AVAILABLE_TAGS = [
    'Public', 'Finished', 'Verifying', 'Layout', 'Unrated', 'Rated',
    'Medium', 'Long', 'XL', 'XXL', 'NC', 'Remake', 'NONG', 'Quality',
];

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
                <tr v-for="level in filteredLevels" :key="level.path" class="admin-row admin-row--clickable" @click="openEdit(level)">
                    <td class="admin-td admin-td--pos">{{ level._rank }}</td>
                    <td class="admin-td admin-td--name">
                        <div class="admin-level-name">{{ level.name }}</div>
                        <div class="admin-level-author">{{ level.author }}</div>
                    </td>
                    <td class="admin-td admin-td--type">
                        <span v-if="level.isVerified" class="admin-badge admin-badge--verified">Verified</span>
                        <span v-else-if="level.isFuture" class="admin-badge admin-badge--future">Future</span>
                        <span v-else-if="level.isMain" class="admin-badge admin-badge--main">Main</span>
                    </td>
                    <td class="admin-td admin-td--move" @click.stop>
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
                    <td class="admin-td admin-td--action" @click.stop>
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

    <!-- Edit Modal -->
    <div v-if="editLevel" class="admin-edit-overlay" @click.self="closeEdit()">
        <div class="admin-edit-modal">
            <div class="admin-edit-header">
                <h2 class="admin-edit-title">Edit Level</h2>
                <button class="admin-edit-close" @click="closeEdit()">&times;</button>
            </div>
            <form class="admin-edit-form" @submit.prevent="saveEdit()">

                <div class="admin-edit-group">
                    <label>Level Name</label>
                    <input v-model="editLevel.name" type="text" required />
                </div>
                <div class="admin-edit-group">
                    <label>Author</label>
                    <input v-model="editLevel.author" type="text" />
                </div>
                <div class="admin-edit-group">
                    <label>Creators (comma separated)</label>
                    <input v-model="editCreatorsStr" type="text" placeholder="Creator 1, Creator 2" />
                </div>
                <div class="admin-edit-group">
                    <label>Verifier</label>
                    <input v-model="editLevel.verifier" type="text" />
                </div>
                <div class="admin-edit-group">
                    <label>Verification Link</label>
                    <input v-model="editLevel.verification" type="url" placeholder="https://youtu.be/..." />
                </div>
                <div class="admin-edit-group">
                    <label>Showcase Link</label>
                    <input v-model="editLevel.showcase" type="url" placeholder="https://youtu.be/..." />
                </div>
                <div class="admin-edit-group">
                    <label>Thumbnail Link</label>
                    <input v-model="editLevel.thumbnail" type="url" placeholder="https://i.ytimg.com/vi/..." />
                </div>
                <div class="admin-edit-group">
                    <label>Frame Windows Counter Link</label>
                    <input v-model="editLevel.frameCounter" type="url" placeholder="https://youtu.be/..." />
                </div>
                <div class="admin-edit-group">
                    <label>Level ID</label>
                    <input v-model="editLevel.id" type="text" placeholder="private or level ID" />
                </div>
                <div class="admin-edit-group">
                    <label>Last Update (DD.MM.YYYY)</label>
                    <input v-model="editLevel.lastUpd" type="text" placeholder="DD.MM.YYYY" />
                </div>

                <div class="admin-edit-row">
                    <div class="admin-edit-group">
                        <label>Length (sec)</label>
                        <input v-model.number="editLevel.length" type="number" min="0" />
                    </div>
                    <div class="admin-edit-group">
                        <label>% to Qualify</label>
                        <input v-model.number="editLevel.percentToQualify" type="number" min="0" max="100" />
                    </div>
                    <div class="admin-edit-group">
                        <label>% Finished</label>
                        <input v-model.number="editLevel.percentFinished" type="number" min="0" max="100" />
                    </div>
                    <div class="admin-edit-group">
                        <label>Rating</label>
                        <input v-model.number="editLevel.rating" type="number" min="1" />
                    </div>
                </div>

                <div class="admin-edit-checks">
                    <label><input type="checkbox" v-model="editLevel.isVerified" /> Verified</label>
                    <label><input type="checkbox" v-model="editLevel.isMain" /> Main List</label>
                    <label><input type="checkbox" v-model="editLevel.isFuture" /> Future List</label>
                </div>

                <div class="admin-edit-group">
                    <label>Tags</label>
                    <div class="admin-edit-tags">
                        <label v-for="tag in availableTags" :key="tag">
                            <input type="checkbox" :value="tag" v-model="editLevel.tags" />
                            {{ tag }}
                        </label>
                    </div>
                </div>

                <!-- Records -->
                <div class="admin-edit-group">
                    <div class="admin-edit-subheader">
                        <label>Records</label>
                        <button type="button" class="admin-btn admin-btn--move" @click="editAddRecord()">+ Add</button>
                    </div>
                    <div v-for="(rec, i) in editLevel.records" :key="i" class="admin-edit-record">
                        <input v-model="rec.user" placeholder="User" />
                        <input v-model="rec.link" placeholder="Link" />
                        <input v-model.number="rec.percent" type="number" placeholder="%" class="admin-edit-record--sm" />
                        <input v-model.number="rec.hz" type="number" placeholder="Hz" class="admin-edit-record--sm" />
                        <button type="button" class="admin-btn admin-btn--delete" @click="editRemoveRecord(i)">X</button>
                    </div>
                    <p v-if="!editLevel.records.length" class="admin-edit-empty">No records.</p>
                </div>

                <!-- Runs -->
                <div class="admin-edit-group">
                    <div class="admin-edit-subheader">
                        <label>Runs</label>
                        <button type="button" class="admin-btn admin-btn--move" @click="editAddRun()">+ Add</button>
                    </div>
                    <div v-for="(run, i) in editLevel.run" :key="i" class="admin-edit-record">
                        <input v-model="run.user" placeholder="User" />
                        <input v-model="run.link" placeholder="Link" />
                        <input v-model="run.percent" placeholder="e.g. 50-100" class="admin-edit-record--md" />
                        <input v-model.number="run.hz" type="number" placeholder="Hz" class="admin-edit-record--sm" />
                        <button type="button" class="admin-btn admin-btn--delete" @click="editRemoveRun(i)">X</button>
                    </div>
                    <p v-if="!editLevel.run.length" class="admin-edit-empty">No runs.</p>
                </div>

            </form>
            <div class="admin-edit-footer">
                <button class="admin-btn admin-btn--move" :disabled="editSubmitting" @click="saveEdit()">
                    {{ editSubmitting ? 'Saving…' : 'Save Changes' }}
                </button>
                <button type="button" class="admin-btn" @click="closeEdit()">Cancel</button>
            </div>
        </div>
    </div>
</main>
    `,
    data: () => ({
        store,
        levels: [],
        search: '',
        loading: false,
        editLevel: null,
        editCreatorsStr: '',
        editSubmitting: false,
        availableTags: AVAILABLE_TAGS,
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
                this.levels = data.map((l, i) => ({ ...l, _rank: i + 1, _newPos: i + 1, _moving: false, _deleting: false }));
            } catch {
                alert('Failed to load levels.');
            }
            this.loading = false;
        },
        async moveLevel(level) {
            const newPos = level._newPos;
            if (!newPos || newPos < 1 || newPos > this.levels.length || newPos === level._rank) return;
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
                    this.levels.forEach((l, i) => { l.sort_order = i; l._rank = i + 1; l._newPos = i + 1; });
                } else {
                    alert('Failed to delete level.');
                    level._deleting = false;
                }
            } catch {
                alert('Network error.');
                level._deleting = false;
            }
        },
        openEdit(level) {
            this.editLevel = JSON.parse(JSON.stringify(level));
            this.editLevel.records = (this.editLevel.records || []).filter(r => r.user !== 'none');
            this.editLevel.run = (this.editLevel.run || []).filter(r => r.user !== 'none');
            this.editLevel.tags = this.editLevel.tags || [];
            this.editCreatorsStr = (this.editLevel.creators || []).join(', ');
            this.editSubmitting = false;
        },
        closeEdit() {
            this.editLevel = null;
            this.editCreatorsStr = '';
            this.editSubmitting = false;
        },
        editAddRecord() { this.editLevel.records.push({ user: '', link: '', percent: 0, hz: 0 }); },
        editRemoveRecord(i) { this.editLevel.records.splice(i, 1); },
        editAddRun() { this.editLevel.run.push({ user: '', link: '', percent: '', hz: 240 }); },
        editRemoveRun(i) { this.editLevel.run.splice(i, 1); },
        async saveEdit() {
            this.editSubmitting = true;
            const { _rank, _newPos, _moving, _deleting, ...data } = this.editLevel;
            data.creators = this.editCreatorsStr.split(',').map(s => s.trim()).filter(s => s);
            if (!data.thumbnail) data.thumbnail = null;
            data.length = Number(data.length);
            data.percentToQualify = Number(data.percentToQualify);
            data.percentFinished = Number(data.percentFinished);
            if (!isNaN(Number(data.id))) data.id = Number(data.id);
            if (data.records.length === 0) data.records.push({ user: 'none', link: '', percent: 0, hz: 0 });
            if (data.run.length === 0) data.run.push({ user: 'none', link: '', percent: '0', hz: 0 });
            try {
                const res = await fetch(`${API}/api/levels`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${store.authKey}`,
                    },
                    body: JSON.stringify({ ...data, insertAt: _rank }),
                });
                if (res.ok) {
                    this.closeEdit();
                    await this.loadLevels();
                } else {
                    const body = await res.json().catch(() => ({}));
                    alert(body.error || 'Failed to save.');
                }
            } catch {
                alert('Network error.');
            }
            this.editSubmitting = false;
        },
    },
};
