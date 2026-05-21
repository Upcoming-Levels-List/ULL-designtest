import { store } from '../main.js';
import AdminLogin from '../components/AdminLogin.js';
import Footer from '../components/Footer.js';

const API = 'https://d1-wrkr.ullteam.workers.dev';

const AVAILABLE_TAGS = [
    'Public', 'Finished', 'Verifying', 'Layout', 'Unrated', 'Rated',
    'Medium', 'Long', 'XL', 'XXL', 'NC', 'Remake', 'NONG', 'Quality',
];

const ROLE_OPTIONS = ['owner', 'admin', 'seniormod', 'mod', 'dev'];

const emptyLotm = () => ({
    name: '', author: '', rank: '', id: '', thumbnail: '',
    record: { percent: '', player: '', link: '' },
    run:    { percent: '', player: '', link: '' },
});
const emptyCtv = () => ({
    name: '', author: '', verifier: '', rank: '', thumbnail: '',
    record: { percent: '', player: '', link: '' },
    run:    { percent: '', player: '', link: '' },
});

export default {
    components: { AdminLogin, Footer },
    template: `
<main class="admin-page surface">
    <AdminLogin v-if="!store.authKey" />
    <div v-else class="admin-content">
        <div class="admin-header">
            <h1 class="admin-title">Admin Panel</h1>
            <button class="admin-logout-btn" @click="store.authKey = ''">Log out</button>
        </div>

        <div class="admin-tabs">
            <button class="admin-tab" :class="{ active: activeTab === 'levels' }" @click="activeTab = 'levels'">Levels</button>
            <button class="admin-tab" :class="{ active: activeTab === 'events' }" @click="activeTab = 'events'">Events</button>
            <button class="admin-tab" :class="{ active: activeTab === 'editors' }" @click="activeTab = 'editors'">Editors</button>
            <button class="admin-tab" :class="{ active: activeTab === 'audit' }" @click="activeTab = 'audit'">Audit Log</button>
        </div>

        <!-- ── LEVELS ── -->
        <template v-if="activeTab === 'levels'">
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
                            <input v-model.number="level._newPos" type="number" min="1" :max="levels.length" class="admin-pos-input" @keydown.enter="moveLevel(level)" />
                            <button class="admin-btn admin-btn--move" :disabled="level._moving" @click="moveLevel(level)">{{ level._moving ? '…' : 'Move' }}</button>
                        </td>
                        <td class="admin-td admin-td--action" @click.stop>
                            <button class="admin-btn admin-btn--delete" :disabled="level._deleting" @click="deleteLevel(level)">{{ level._deleting ? '…' : 'Delete' }}</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>

        <!-- ── EVENTS ── -->
        <template v-if="activeTab === 'events'">
            <div class="admin-events-grid">

                <div class="admin-card">
                    <div class="admin-card-title">Level of the Month</div>
                    <div class="admin-edit-group">
                        <label>Level Name</label>
                        <input v-model="lotm.name" type="text" />
                    </div>
                    <div class="admin-edit-row">
                        <div class="admin-edit-group">
                            <label>Author</label>
                            <input v-model="lotm.author" type="text" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Rank</label>
                            <input v-model.number="lotm.rank" type="number" min="1" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Level ID</label>
                            <input v-model="lotm.id" type="text" />
                        </div>
                    </div>
                    <div class="admin-edit-group">
                        <label>Thumbnail (YouTube or image URL)</label>
                        <input v-model="lotm.thumbnail" type="url" placeholder="https://youtu.be/..." />
                    </div>
                    <div class="admin-card-subhead">Best Record</div>
                    <div class="admin-edit-row">
                        <div class="admin-edit-group">
                            <label>Percent</label>
                            <input v-model="lotm.record.percent" type="text" placeholder="e.g. 85%" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Player</label>
                            <input v-model="lotm.record.player" type="text" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Link</label>
                            <input v-model="lotm.record.link" type="url" />
                        </div>
                    </div>
                    <div class="admin-card-subhead">Best Run</div>
                    <div class="admin-edit-row">
                        <div class="admin-edit-group">
                            <label>Percent / Range</label>
                            <input v-model="lotm.run.percent" type="text" placeholder="e.g. 50-100" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Player</label>
                            <input v-model="lotm.run.player" type="text" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Link</label>
                            <input v-model="lotm.run.link" type="url" />
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.65rem;margin-top:0.85rem;">
                        <button class="admin-btn admin-btn--move" :disabled="eventsSaving === 'lotm'" @click="saveLotm()">{{ eventsSaving === 'lotm' ? 'Saving…' : 'Save LotM' }}</button>
                        <span v-if="eventsSaved === 'lotm'" style="font-size:0.78rem;color:#10b981;">Saved!</span>
                    </div>
                </div>

                <div class="admin-card">
                    <div class="admin-card-title">Closest to Verification</div>
                    <div class="admin-edit-group">
                        <label>Level Name</label>
                        <input v-model="ctv.name" type="text" />
                    </div>
                    <div class="admin-edit-row">
                        <div class="admin-edit-group">
                            <label>Author</label>
                            <input v-model="ctv.author" type="text" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Verifier</label>
                            <input v-model="ctv.verifier" type="text" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Rank</label>
                            <input v-model.number="ctv.rank" type="number" min="1" />
                        </div>
                    </div>
                    <div class="admin-edit-group">
                        <label>Thumbnail (YouTube or image URL)</label>
                        <input v-model="ctv.thumbnail" type="url" placeholder="https://youtu.be/..." />
                    </div>
                    <div class="admin-card-subhead">Best Record</div>
                    <div class="admin-edit-row">
                        <div class="admin-edit-group">
                            <label>Percent</label>
                            <input v-model="ctv.record.percent" type="text" placeholder="e.g. 85%" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Player</label>
                            <input v-model="ctv.record.player" type="text" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Link</label>
                            <input v-model="ctv.record.link" type="url" />
                        </div>
                    </div>
                    <div class="admin-card-subhead">Best Run</div>
                    <div class="admin-edit-row">
                        <div class="admin-edit-group">
                            <label>Percent / Range</label>
                            <input v-model="ctv.run.percent" type="text" placeholder="e.g. 50-100" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Player</label>
                            <input v-model="ctv.run.player" type="text" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Link</label>
                            <input v-model="ctv.run.link" type="url" />
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.65rem;margin-top:0.85rem;">
                        <button class="admin-btn admin-btn--move" :disabled="eventsSaving === 'ctv'" @click="saveCtv()">{{ eventsSaving === 'ctv' ? 'Saving…' : 'Save CTV' }}</button>
                        <span v-if="eventsSaved === 'ctv'" style="font-size:0.78rem;color:#10b981;">Saved!</span>
                    </div>
                </div>

            </div>
        </template>

        <!-- ── EDITORS ── -->
        <template v-if="activeTab === 'editors'">
            <div v-if="editorsLoading" class="admin-loading">Loading editors…</div>
            <template v-else>
                <div v-if="!editors.length" class="admin-empty">No editors found. Make sure the Worker and DB are updated.</div>
                <table v-else class="admin-table">
                    <thead>
                        <tr>
                            <th class="admin-th">Name</th>
                            <th class="admin-th admin-th--type">Role</th>
                            <th class="admin-th">Link</th>
                            <th class="admin-th" style="width:4.5rem;"></th>
                            <th class="admin-th" style="width:4.5rem;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ed in editors" :key="ed.name" class="admin-row">
                            <td class="admin-td" style="font-weight:600;">{{ ed.name }}</td>
                            <td class="admin-td">
                                <span class="admin-badge admin-badge--main">{{ ed.role || 'mod' }}</span>
                            </td>
                            <td class="admin-td" style="font-size:0.78rem;opacity:0.55;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ ed.link || '—' }}</td>
                            <td class="admin-td admin-td--action">
                                <button class="admin-btn admin-btn--move" @click="openEditEditor(ed)">Edit</button>
                            </td>
                            <td class="admin-td admin-td--action">
                                <button class="admin-btn admin-btn--delete" @click="deleteEditor(ed)">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="admin-card" style="margin-top:1.5rem;">
                    <div class="admin-card-title">Add Editor</div>
                    <div class="admin-edit-row">
                        <div class="admin-edit-group">
                            <label>Name</label>
                            <input v-model="newEditor.name" type="text" placeholder="Display name" />
                        </div>
                        <div class="admin-edit-group">
                            <label>Role</label>
                            <select v-model="newEditor.role" class="admin-select">
                                <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="admin-edit-group">
                        <label>Profile Link</label>
                        <input v-model="newEditor.link" type="url" placeholder="https://youtube.com/@..." />
                    </div>
                    <div class="admin-edit-group">
                        <label>API Key</label>
                        <div style="display:flex;gap:0.5rem;">
                            <input v-model="newEditor.key" type="text" placeholder="Click Generate, then copy before saving" style="flex:1;font-family:monospace;font-size:0.78rem;" />
                            <button type="button" class="admin-btn admin-btn--move" @click="generateKey()">Generate</button>
                        </div>
                        <p style="font-size:0.7rem;opacity:0.4;margin:0.3rem 0 0;">Copy this key and give it privately to the editor — it won't be shown again after saving.</p>
                    </div>
                    <div style="margin-top:0.75rem;">
                        <button class="admin-btn admin-btn--move" :disabled="editorSubmitting" @click="addEditor()">{{ editorSubmitting ? 'Adding…' : 'Add Editor' }}</button>
                    </div>
                </div>
            </template>
        </template>

        <!-- ── AUDIT LOG ── -->
        <template v-if="activeTab === 'audit'">
            <div class="admin-toolbar">
                <span style="font-size:0.8rem;opacity:0.55;">Last 100 operations, newest first.</span>
                <button class="admin-btn admin-btn--move" @click="loadAuditLog()" :disabled="auditLoading" style="margin-left:auto;">{{ auditLoading ? 'Loading…' : 'Refresh' }}</button>
            </div>
            <div v-if="auditLoading" class="admin-loading">Loading audit log…</div>
            <div v-else-if="!auditLog.length" class="admin-empty">No entries yet. The audit_log table may need to be created — see setup guide.</div>
            <table v-else class="admin-table">
                <thead>
                    <tr>
                        <th class="admin-th" style="width:11rem;">Time (UTC)</th>
                        <th class="admin-th" style="width:7rem;">Editor</th>
                        <th class="admin-th" style="width:8rem;">Action</th>
                        <th class="admin-th">Target</th>
                        <th class="admin-th">Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in auditLog" :key="entry.id" class="admin-row">
                        <td class="admin-td admin-td--pos" style="font-size:0.72rem;white-space:nowrap;opacity:0.55;">{{ entry.timestamp }}</td>
                        <td class="admin-td" style="font-size:0.8rem;font-weight:600;">{{ entry.editor_name }}</td>
                        <td class="admin-td"><span class="admin-badge admin-badge--main" style="font-size:0.58rem;">{{ entry.action }}</span></td>
                        <td class="admin-td" style="font-size:0.8rem;">{{ entry.target }}</td>
                        <td class="admin-td" style="font-size:0.72rem;opacity:0.5;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ entry.details }}</td>
                    </tr>
                </tbody>
            </table>
        </template>

        <Footer />
    </div>

    <!-- ── LEVEL EDIT MODAL ── -->
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
                    <label><input type="checkbox" v-model="editLevel.benchmark" /> Benchmark</label>
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
                <button class="admin-btn admin-btn--move" :disabled="editSubmitting" @click="saveEdit()">{{ editSubmitting ? 'Saving…' : 'Save Changes' }}</button>
                <button type="button" class="admin-btn" @click="closeEdit()">Cancel</button>
            </div>
        </div>
    </div>

    <!-- ── EDITOR EDIT MODAL ── -->
    <div v-if="editEditor" class="admin-edit-overlay" @click.self="editEditor = null">
        <div class="admin-edit-modal" style="max-width:420px;">
            <div class="admin-edit-header">
                <h2 class="admin-edit-title">Edit Editor</h2>
                <button class="admin-edit-close" @click="editEditor = null">&times;</button>
            </div>
            <div class="admin-edit-form">
                <div class="admin-edit-group">
                    <label>Name (cannot change)</label>
                    <input :value="editEditor.name" type="text" disabled style="opacity:0.4;" />
                </div>
                <div class="admin-edit-group">
                    <label>Role</label>
                    <select v-model="editEditor.role" class="admin-select">
                        <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
                    </select>
                </div>
                <div class="admin-edit-group">
                    <label>Profile Link</label>
                    <input v-model="editEditor.link" type="url" placeholder="https://youtube.com/@..." />
                </div>
            </div>
            <div class="admin-edit-footer">
                <button class="admin-btn admin-btn--move" :disabled="editorSubmitting" @click="saveEditEditor()">{{ editorSubmitting ? 'Saving…' : 'Save' }}</button>
                <button class="admin-btn" @click="editEditor = null">Cancel</button>
            </div>
        </div>
    </div>
</main>
    `,
    data: () => ({
        store,
        activeTab: 'levels',
        // Levels
        levels: [],
        search: '',
        loading: false,
        editLevel: null,
        editCreatorsStr: '',
        editSubmitting: false,
        availableTags: AVAILABLE_TAGS,
        // Events
        eventsLoaded: false,
        lotm: emptyLotm(),
        ctv: emptyCtv(),
        eventsSaving: null,
        eventsSaved: null,
        // Editors
        editors: [],
        editorsLoaded: false,
        editorsLoading: false,
        editEditor: null,
        newEditor: { name: '', key: '', role: 'mod', link: '' },
        editorSubmitting: false,
        roleOptions: ROLE_OPTIONS,
        // Audit Log
        auditLog: [],
        auditLoading: false,
        auditLoaded: false,
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
        activeTab(tab) {
            if (tab === 'events' && !this.eventsLoaded) this.loadEvents();
            if (tab === 'editors' && !this.editorsLoaded) this.loadEditors();
            if (tab === 'audit' && !this.auditLoaded) this.loadAuditLog();
        },
    },
    async mounted() {
        if (store.authKey) this.loadLevels();
    },
    methods: {
        // ── LEVELS ──
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
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.authKey}` },
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
                    this.levels.forEach((l, i) => { l._rank = i + 1; l._newPos = i + 1; });
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
            if (!data.frameCounter) data.frameCounter = null;
            data.length = Number(data.length);
            data.percentToQualify = Number(data.percentToQualify);
            data.percentFinished = Number(data.percentFinished);
            if (!isNaN(Number(data.id))) data.id = Number(data.id);
            if (data.records.length === 0) data.records.push({ user: 'none', link: '', percent: 0, hz: 0 });
            if (data.run.length === 0) data.run.push({ user: 'none', link: '', percent: '0', hz: 0 });
            try {
                const res = await fetch(`${API}/api/levels`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.authKey}` },
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

        // ── EVENTS ──
        async loadEvents() {
            try {
                const [lm, lv] = await Promise.all([
                    fetch(`${API}/api/level-month`).then(r => r.json()).catch(() => null),
                    fetch(`${API}/api/level-verif`).then(r => r.json()).catch(() => null),
                ]);
                if (lm) this.lotm = {
                    ...emptyLotm(), ...lm,
                    record: { ...emptyLotm().record, ...(lm.record || {}) },
                    run: { ...emptyLotm().run, ...(lm.run || {}) },
                };
                if (lv) this.ctv = {
                    ...emptyCtv(), ...lv,
                    record: { ...emptyCtv().record, ...(lv.record || {}) },
                    run: { ...emptyCtv().run, ...(lv.run || {}) },
                };
            } catch { /* ignore */ }
            this.eventsLoaded = true;
        },
        async saveLotm() {
            this.eventsSaving = 'lotm';
            try {
                const res = await fetch(`${API}/api/config`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.authKey}` },
                    body: JSON.stringify({ levelMonth: this.lotm }),
                });
                if (res.ok) {
                    this.eventsSaved = 'lotm';
                    setTimeout(() => { if (this.eventsSaved === 'lotm') this.eventsSaved = null; }, 2500);
                } else { alert('Failed to save.'); }
            } catch { alert('Network error.'); }
            this.eventsSaving = null;
        },
        async saveCtv() {
            this.eventsSaving = 'ctv';
            try {
                const res = await fetch(`${API}/api/config`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.authKey}` },
                    body: JSON.stringify({ levelVerif: this.ctv }),
                });
                if (res.ok) {
                    this.eventsSaved = 'ctv';
                    setTimeout(() => { if (this.eventsSaved === 'ctv') this.eventsSaved = null; }, 2500);
                } else { alert('Failed to save.'); }
            } catch { alert('Network error.'); }
            this.eventsSaving = null;
        },

        // ── EDITORS ──
        async loadEditors() {
            this.editorsLoading = true;
            try {
                const res = await fetch(`${API}/api/editors`);
                this.editors = await res.json();
            } catch { alert('Failed to load editors.'); }
            this.editorsLoading = false;
            this.editorsLoaded = true;
        },
        openEditEditor(ed) {
            this.editEditor = { ...ed };
            this.editorSubmitting = false;
        },
        async saveEditEditor() {
            this.editorSubmitting = true;
            try {
                const res = await fetch(`${API}/api/editors`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.authKey}` },
                    body: JSON.stringify({ name: this.editEditor.name, role: this.editEditor.role, link: this.editEditor.link }),
                });
                if (res.ok) {
                    const i = this.editors.findIndex(e => e.name === this.editEditor.name);
                    if (i !== -1) this.editors[i] = { ...this.editEditor };
                    this.editEditor = null;
                } else { alert('Failed to save editor.'); }
            } catch { alert('Network error.'); }
            this.editorSubmitting = false;
        },
        async deleteEditor(ed) {
            if (!confirm(`Remove "${ed.name}"? This revokes their API access immediately.`)) return;
            try {
                const res = await fetch(`${API}/api/editors/${encodeURIComponent(ed.name)}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${store.authKey}` },
                });
                if (res.ok) {
                    this.editors = this.editors.filter(e => e.name !== ed.name);
                } else { alert('Failed to delete editor.'); }
            } catch { alert('Network error.'); }
        },
        generateKey() {
            const arr = new Uint8Array(32);
            crypto.getRandomValues(arr);
            this.newEditor.key = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
        },
        async addEditor() {
            if (!this.newEditor.name || !this.newEditor.key) { alert('Name and key are required.'); return; }
            this.editorSubmitting = true;
            try {
                const res = await fetch(`${API}/api/admin/add-key`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.authKey}` },
                    body: JSON.stringify({ name: this.newEditor.name, key: this.newEditor.key, role: this.newEditor.role, link: this.newEditor.link }),
                });
                if (res.ok) {
                    await this.loadEditors();
                    this.newEditor = { name: '', key: '', role: 'mod', link: '' };
                } else {
                    const body = await res.json().catch(() => ({}));
                    alert(body.error || 'Failed to add editor.');
                }
            } catch { alert('Network error.'); }
            this.editorSubmitting = false;
        },

        // ── AUDIT LOG ──
        async loadAuditLog() {
            this.auditLoading = true;
            try {
                const res = await fetch(`${API}/api/audit-log`, {
                    headers: { Authorization: `Bearer ${store.authKey}` },
                });
                this.auditLog = await res.json();
            } catch { alert('Failed to load audit log.'); }
            this.auditLoading = false;
            this.auditLoaded = true;
        },
    },
};
