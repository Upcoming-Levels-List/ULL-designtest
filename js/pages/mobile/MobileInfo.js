import { store } from '../../main.js';
import { guidelinesData } from '../../_guidelines.js';
import {
    navigationData, faqData, apiData, coloringLegend, pendingLegend, contactRouting,
} from '../../_info.js';
import {
    WINDOWS, WINDOW_TITLES, WINDOW_EYEBROWS, flatSections, searchInformation,
    sectionCount, faqCount, pageCount, markCount, endpointCount, roleIconMap, roleLabel,
} from '../../info-windows.js';
import { mobileStore } from './mobileStore.js';

// /mobile/info is the desktop hub stacked: the same hero, the same search over
// everything on the page, and the same six faces in the same order — but in one
// column, and each face raises its reader over the whole screen rather than
// putting a window in the middle of one.
//
// The two surfaces share their index (js/info-windows.js), their prose
// (js/_info.js, js/_guidelines.js) and most of their stylesheet
// (css/pages/information.css); css/pages/mobile-info.css holds only what
// genuinely differs at 390px. Everything the desktop page has is here, and
// nothing it does not — bar the Ctrl K hint on the search field, since there is
// no Ctrl key on a phone.
export default {
    template: `
<div class="info-page mob-info m2-page-body">

    <section class="info-hero">
        <h1>Information</h1>
        <p>
            The Upcoming Levels List forecasts which Extreme Demons are about to be verified and placed on
            the Demonlist. This page says how that is decided, what everything on the site means, who to
            ask, and how to read the whole list as JSON.
            <button type="button" class="info-more" @click="open('about')">What this list is, in full &rarr;</button>
        </p>
    </section>

    <!-- One field over the guidelines, the FAQ, the endpoints, the level fields
         and both legends. A hit opens the reader it lives in. -->
    <div class="mob-info-find">
        <div class="info-search" :class="{ 'is-open': query.trim().length > 0 }">
            <span class="info-mag" aria-hidden="true"></span>
            <input
                v-model="query"
                type="search"
                class="info-search__field"
                placeholder="Search the page"
                aria-label="Search this page"
                @keydown.esc="query = ''"
            />
            <div v-if="query.trim()" class="info-results">
                <button
                    v-for="hit in results"
                    :key="hit.kind + hit.label + (hit.section || '')"
                    type="button"
                    class="info-result"
                    @click="openHit(hit)"
                >
                    <span class="info-result__k">{{ hit.where }}</span>
                    <span class="info-result__t">{{ hit.label }}</span>
                    <span v-if="hit.sub" class="info-result__s">{{ hit.sub }}</span>
                </button>
                <p v-if="!results.length" class="info-result__none">Nothing on this page matches &ldquo;{{ query.trim() }}&rdquo;.</p>
            </div>
        </div>
    </div>

    <!-- ── The six faces ──────────────────────────────────────────────────
         A label, a name, one sentence and the size of what is behind it.
         Nothing on the page is the content itself. -->
    <div class="mob-info-doors">
        <button type="button" class="info-block" @click="open('faq')">
            <div class="u-eyebrow">Answers &middot; {{ faqCount }} questions</div>
            <h2>FAQ</h2>
            <p>
                Submitting a record and what proof it needs, how a level gets listed, how leaderboard points
                are worked out, and why a total changes when you have submitted nothing. {{ faqCount }} questions
                in {{ faqData.length }} groups, each answered here rather than pointed at the guidelines.
            </p>
            <span class="info-block__more">All {{ faqCount }} questions &rarr;</span>
        </button>

        <button type="button" class="info-block" @click="open('navigation')">
            <div class="u-eyebrow">Navigation &middot; {{ pageCount }} pages</div>
            <h2>What is on each page</h2>
            <p>
                Every page on the site and what you will find on it &mdash; the three list tiers and how they
                differ from each other, pending and upcoming, the leaderboard, events, and a level&rsquo;s own
                page. Written so you can tell which page answers your question before you open it.
            </p>
            <div class="info-chips">
                <span v-for="page in navPreview" :key="page" class="u-chip">{{ page }}</span>
                <span v-if="pageCount > navPreview.length" class="u-chip">+{{ pageCount - navPreview.length }}</span>
            </div>
        </button>

        <button type="button" class="info-block info-block--gl" @click="open('guidelines')">
            <div class="u-eyebrow">The rules</div>
            <h2>Guidelines</h2>
            <p>
                How records are accepted, how levels are chosen and positioned, what the staff may and may not
                do. {{ sectionCount }} sections, and the answer to most arguments.
            </p>
            <div class="info-groups">
                <div v-for="group in guidelinesData" :key="group.id">
                    {{ group.group }}<span>{{ group.sections.length }}</span>
                </div>
            </div>
            <span class="u-btn">Open the guidelines</span>
        </button>

        <button type="button" class="info-block" @click="open('reference')">
            <div class="u-eyebrow">Reference &middot; {{ markCount }} marks</div>
            <h2>What the marks mean</h2>
            <p>The colour a level&rsquo;s name is drawn in, and the icons on the Pending List.</p>
            <div class="info-marks">
                <div class="info-dots">
                    <i v-for="row in coloringLegend.slice(0, 8)" :key="row.label" :class="['info-dot', row.pill]"></i>
                </div>
                <div class="info-icons">
                    <img v-for="row in pendingLegend.slice(0, 5)" :key="row.icon" :src="'/assets/' + row.icon + '.svg'" :alt="''" />
                </div>
            </div>
        </button>

        <button type="button" class="info-block" @click="open('staff')">
            <div class="u-eyebrow">Who to talk to<template v-if="editors.length"> &middot; {{ editors.length }} people</template></div>
            <h2>Staff &amp; contact</h2>
            <p>The team that maintains the list, and where to take a record, a correction, a site bug or a complaint.</p>
        </button>

        <button type="button" class="info-block" @click="open('api')">
            <div class="u-eyebrow">Build on it &middot; {{ endpointCount }} endpoints</div>
            <h2>API documentation</h2>
            <p>The whole list as public JSON &mdash; no key, no signup, CORS open.</p>
            <div class="info-chips">
                <span class="u-chip">/api/list</span>
                <span class="u-chip">/api/pending</span>
                <span class="u-chip">+{{ endpointCount - 2 }}</span>
            </div>
        </button>
    </div>

    <!-- ── The reader ─────────────────────────────────────────────────────
         A sheet over the whole screen, tab bar included: the desktop locks the
         page behind its window, and half a phone screen is not enough to read a
         rulebook in. -->
    <div v-if="openKey" class="info-win mob-info-sheet" role="dialog" aria-modal="true" :aria-label="winTitle" ref="sheet" tabindex="-1">
        <div class="info-win__bar mob-info-sheet__bar">
            <button v-if="atSection" type="button" class="mob-info-back" @click="backToIndex()" aria-label="Back to the sections">&lsaquo;</button>
            <div class="mob-info-sheet__label">
                <span class="info-win__k">{{ winEyebrow }}</span>
                <b>{{ winTitle }}</b>
            </div>
            <button type="button" class="mob-info-x" @click="close()" aria-label="Close">&times;</button>
        </div>

        <div class="info-win__body mob-info-sheet__body" ref="body">

            <!-- What this list is -->
            <template v-if="openKey === 'about'">
                <p class="info-lead">
                    The Upcoming Levels List catalogues upcoming Top 1&ndash;100 Extreme Demons projected to
                    be verified and placed on the Demonlist, along with unrated Extreme Demons that would
                    have qualified for a rating when they were made. It is a forecast of what the Demonlist
                    is about to look like &mdash; not a record of what has already happened.
                </p>
                <div class="info-prose">
                    <p>
                        Nothing here is official. Positions are estimates made by the list staff against the
                        criteria written in the guidelines, and they move as levels progress. Levels that are
                        already rated are placed in strict accordance with their ranking on Pointercrate.
                    </p>
                    <h4>The three tiers</h4>
                    <p>The order of levels is the same in all three. What changes is the threshold to appear at all.</p>
                    <ul>
                        <li><strong>All Levels</strong> &mdash; every level with a conceivable chance of being verified and published. A level&rsquo;s rank here is what leaderboard points are calculated from.</li>
                        <li><strong>Main List</strong> &mdash; levels that meet the standards required to be considered for an official rating.</li>
                        <li><strong>Future List</strong> &mdash; levels very likely to be verified and published soon.</li>
                    </ul>
                    <h4>How to read a level</h4>
                    <p>
                        The colour of a name is the level&rsquo;s state, from layout through decoration and
                        verification to rated. Two percentages follow every level &mdash; how much of the
                        decoration is done, and how far the best run has got. The badges are its position in
                        each tier: a level can be #4 in All Levels and #2 in Future List at once.
                    </p>
                </div>
                <div class="info-winlinks">
                    <button type="button" class="u-btn u-btn--ghost" @click="open('navigation')">What is on each page &rarr;</button>
                    <button type="button" class="u-btn u-btn--ghost" @click="open('reference')">What the marks mean &rarr;</button>
                </div>
            </template>

            <!-- FAQ -->
            <template v-else-if="openKey === 'faq'">
                <div v-for="group in faqData" :key="group.group" class="info-faqg">
                    <div class="u-eyebrow">{{ group.group }}</div>
                    <div v-for="item in group.questions" :key="item.q" class="info-q">
                        <b>{{ item.q }}</b>
                        <div class="info-prose" v-html="item.a"></div>
                    </div>
                </div>
            </template>

            <!-- Navigation -->
            <template v-else-if="openKey === 'navigation'">
                <p class="info-lead">Every page on the site, grouped the way the menu groups them.</p>
                <div class="info-cols">
                    <div v-for="group in navigationData" :key="group.group">
                        <div class="u-eyebrow">{{ group.group }}</div>
                        <router-link v-for="page in group.pages" :key="page.name" :to="page.to" class="info-nav">
                            <span class="info-nav__n">{{ page.name }} <code>{{ page.path || page.to }}</code></span>
                            <span class="info-nav__d">{{ page.desc }}</span>
                        </router-link>
                    </div>
                </div>
            </template>

            <!-- Guidelines: the index, then one section over it. The desktop
                 puts the two side by side; a phone has no beside. -->
            <template v-else-if="openKey === 'guidelines' && !atSection">
                <nav class="mob-info-toc">
                    <template v-for="group in guidelinesData" :key="group.id">
                        <div class="mob-info-toc__g">{{ group.group }}<span>{{ group.sections.length }}</span></div>
                        <button
                            v-for="section in group.sections"
                            :key="section.id"
                            type="button"
                            class="mob-info-toc__a"
                            @click="goSection(section.id)"
                        >{{ section.title }}</button>
                    </template>
                </nav>
            </template>

            <template v-else-if="openKey === 'guidelines'">
                <div class="info-crumb">{{ current.group }}</div>
                <h3>{{ current.title }}</h3>
                <div class="info-prose" v-html="current.content"></div>
                <div class="mob-info-updown">
                    <button type="button" :disabled="!prevSection" @click="prevSection && goSection(prevSection.id)">
                        <span v-if="prevSection">&larr; {{ prevSection.title }}</span>
                    </button>
                    <button type="button" :disabled="!nextSection" @click="nextSection && goSection(nextSection.id)">
                        <span v-if="nextSection">{{ nextSection.title }} &rarr;</span>
                    </button>
                </div>
            </template>

            <!-- Reference -->
            <template v-else-if="openKey === 'reference'">
                <div class="info-cols">
                    <div>
                        <div class="u-eyebrow">Level colouring</div>
                        <p class="info-note">
                            A level&rsquo;s name is coloured by its state when Level Coloring is on &mdash; the
                            same scale as the status pill on the level&rsquo;s own page. If names look plain,
                            turn the setting on.
                        </p>
                        <div class="info-legend">
                            <div v-for="row in coloringLegend" :key="row.label + row.meaning">
                                <span class="u-pill" :class="row.pill">
                                    <i v-if="!row.glyph"></i>{{ row.label }}
                                </span>
                                <span>{{ row.meaning }}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="u-eyebrow">Pending list icons</div>
                        <p class="info-note">
                            Icons on the Pending List say where a level is expected to land and which way it is
                            moving inside that range.
                        </p>
                        <div class="info-legend info-legend--icons">
                            <div v-for="row in pendingLegend" :key="row.icon">
                                <img :src="'/assets/' + row.icon + '.svg'" alt="" />
                                <span>{{ row.label }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Staff & contact -->
            <template v-else-if="openKey === 'staff'">
                <p class="info-lead">
                    Moderators and Elder Moderators determine level positions, place levels, take part in
                    quality control and keep the site up to date. Admins manage a sector of the project&rsquo;s
                    operation; the List Leader oversees the list and its staff.
                </p>
                <div class="info-cols">
                    <div>
                        <div class="u-eyebrow">The team <span v-if="editors.length" class="u-count">{{ editors.length }}</span></div>
                        <div class="info-people">
                            <div v-for="(editor, i) in editors" :key="editor.name + i" class="info-person">
                                <img :src="'/assets/' + (roleIconMap[editor.role] || 'user-lock') + (store.dark ? '' : '-dark') + '.svg'" :alt="''" />
                                <a v-if="editor.link && editor.link !== '#'" :href="editor.link" target="_blank" rel="noopener">{{ editor.name }}</a>
                                <span v-else>{{ editor.name }}</span>
                                <span class="u-chip">{{ roleLabel(editor.role) }}</span>
                            </div>
                            <p v-if="!editors.length" class="info-note">The staff list could not be loaded.</p>
                        </div>
                    </div>
                    <div>
                        <div class="u-eyebrow">Where to take what</div>
                        <dl class="u-dl">
                            <template v-for="row in contactRouting" :key="row.what">
                                <dt>{{ row.what }}</dt><dd>{{ row.where }}</dd>
                            </template>
                        </dl>
                        <div class="info-winlinks">
                            <a class="u-btn" href="https://discord.gg/QRX47v2qyC" target="_blank" rel="noopener">
                                <img src="/assets/discord.svg" alt="" width="14" height="14" />discord.gg/QRX47v2qyC
                            </a>
                            <a class="u-btn u-btn--ghost" href="https://x.com/ull_gd" target="_blank" rel="noopener">@ull_gd</a>
                        </div>
                        <p class="info-note">
                            Individual handles for the people above are listed under
                            <button type="button" class="info-link" @click="goSection('contacts')">Contacts</button>
                            in the guidelines.
                        </p>
                    </div>
                </div>
            </template>

            <!-- API. The desktop's two tables are wider than a phone, so each
                 row is a line of its own rather than a sideways scroll. -->
            <template v-else-if="openKey === 'api'">
                <p class="info-lead">
                    Everything this site shows comes from a public JSON API. It needs no key, no signup and
                    no referrer, and it sends <code>Access-Control-Allow-Origin: *</code>, so a page or a bot
                    can read the list straight from the browser.
                </p>
                <h4 class="info-h4">Base URL</h4>
                <pre class="info-pre">{{ apiData.base }}</pre>
                <h4 class="info-h4">Endpoints</h4>
                <div class="mob-info-rows">
                    <div v-for="row in apiData.endpoints" :key="row.path" class="mob-info-ep">
                        <span class="mob-info-ep__p"><span class="info-get">GET</span>{{ row.path }}</span>
                        <span class="mob-info-ep__r">{{ row.returns }}</span>
                    </div>
                </div>
                <p class="info-note">
                    Writing to the list needs a staff API key and is not part of the public API. There is no
                    public leaderboard endpoint: the leaderboard is derived from <code>/api/list</code>, by the
                    rules written out under &ldquo;How are leaderboard points calculated?&rdquo; in the FAQ.
                </p>
                <h4 class="info-h4">Example</h4>
                <pre class="info-pre">{{ apiData.example }}</pre>
                <h4 class="info-h4">The level object</h4>
                <div class="mob-info-rows">
                    <div v-for="row in apiData.fields" :key="row.name" class="mob-info-fld">
                        <span class="mob-info-fld__n">{{ row.name }} <span class="mob-info-fld__t">{{ row.type }}</span></span>
                        <span class="mob-info-fld__m">{{ row.meaning }}</span>
                    </div>
                </div>
                <h4 class="info-h4">Fair use</h4>
                <div class="info-prose">
                    <ul><li v-for="rule in apiData.fairUse" :key="rule">{{ rule }}</li></ul>
                </div>
            </template>

        </div>
    </div>
</div>
    `,
    data: () => ({
        store,
        mobileStore,
        roleIconMap,
        guidelinesData,
        navigationData,
        faqData,
        apiData,
        coloringLegend,
        pendingLegend,
        contactRouting,
        sectionCount,
        faqCount,
        pageCount,
        markCount,
        endpointCount,
        query: '',
        // Whether this component pushed the ?open= entry, so closing can go back
        // rather than stacking another entry on the history.
        pushed: 0,
    }),
    computed: {
        // The staff list is loaded once by the shell, for every mobile page.
        editors() { return mobileStore.editors || []; },
        openKey() {
            const key = this.$route.query.open;
            return WINDOWS.includes(key) ? key : '';
        },
        // No ?section= means the guidelines are showing their index, which is
        // the state the desktop has no equivalent of: there, the index is always
        // beside the section.
        atSection() {
            return this.openKey === 'guidelines'
                && flatSections.some((s) => s.id === this.$route.query.section);
        },
        current() {
            return flatSections.find((s) => s.id === this.$route.query.section) || flatSections[0];
        },
        sectionIndex() {
            return flatSections.findIndex((s) => s.id === this.current.id);
        },
        prevSection() { return flatSections[this.sectionIndex - 1] || null; },
        nextSection() { return flatSections[this.sectionIndex + 1] || null; },
        navPreview() {
            return navigationData.flatMap((g) => g.pages.map((p) => p.name)).slice(0, 7);
        },
        winTitle() { return WINDOW_TITLES[this.openKey] || ''; },
        winEyebrow() {
            if (this.atSection) return `The rules · ${this.sectionIndex + 1} of ${sectionCount}`;
            if (this.openKey === 'guidelines') return `The rules · ${sectionCount} sections`;
            return WINDOW_EYEBROWS[this.openKey] || '';
        },
        results() { return searchInformation(this.query); },
    },
    methods: {
        roleLabel,
        open(key, section) {
            const query = { ...this.$route.query, open: key };
            if (section) query.section = section; else delete query.section;
            this.pushed += 1;
            this.$router.push({ query });
        },
        close() {
            if (this.pushed > 0) {
                this.pushed -= 1;
                this.$router.back();
                return;
            }
            // Arrived straight at /mobile/info?open=…: there is nothing of ours
            // to go back to, so drop the query without growing the history.
            const query = { ...this.$route.query };
            delete query.open;
            delete query.section;
            this.$router.replace({ query });
        },
        goSection(id) {
            if (this.openKey === 'guidelines') {
                this.pushed += 1;
                this.$router.push({ query: { ...this.$route.query, open: 'guidelines', section: id } });
            } else {
                this.open('guidelines', id);
            }
        },
        // Back out of a section to the index the same way Close backs out of the
        // reader, so the phone's back gesture and this button agree.
        backToIndex() {
            if (this.pushed > 0) {
                this.pushed -= 1;
                this.$router.back();
                return;
            }
            const query = { ...this.$route.query };
            delete query.section;
            this.$router.replace({ query });
        },
        openHit(hit) {
            this.query = '';
            this.open(hit.kind, hit.kind === 'guidelines' ? hit.section : undefined);
        },
        onKeydown(e) {
            if (e.key !== 'Escape') return;
            if (this.openKey) { this.close(); return; }
            if (this.query) this.query = '';
        },
        // The reader is a fixed sheet over the shell, so the page under it must
        // not scroll while it is open — the same lock the desktop puts on
        // .info-page, applied to the shell's scroll container.
        lockShell(locked) {
            const container = this._scrollEl || (this._scrollEl = this.$el.closest?.('.mob-content'));
            if (container) container.classList.toggle('mob-content--locked', locked);
        },
    },
    watch: {
        openKey(key) {
            this.lockShell(!!key);
            if (key) this.$nextTick(() => this.$refs.sheet?.focus());
        },
        // A different section is a different read: start it at the top rather
        // than wherever the previous one was scrolled to.
        current() {
            this.$nextTick(() => { if (this.$refs.body) this.$refs.body.scrollTop = 0; });
        },
    },
    mounted() {
        window.addEventListener('keydown', this.onKeydown);
        if (this.openKey) this.lockShell(true);
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.onKeydown);
        this.lockShell(false);
    },
};
