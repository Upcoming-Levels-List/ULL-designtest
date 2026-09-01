// Content for /information that is not the guidelines: the site map, the FAQ,
// the API reference, the two legends and the contact routing.
//
// It lives here for the same reason js/_guidelines.js does — it is prose that
// changes on its own schedule, edited by people who are not editing components.
// Nothing here is fetched; the editor list on the same page comes from the API.
//
// The legends are DATA, not markup, and the colouring one names the .u-pill
// modifier from css/ull-v2.css rather than repeating a hex value. The pill scale
// and the list's own name colouring are the same scale, so a colour can only be
// changed in one place.

export const navigationData = [
    {
        group: 'Lists',
        pages: [
            {
                name: 'All Levels',
                to: '/list',
                desc: 'Every level with a conceivable chance of being verified and published, hardest first. The widest of the three tiers, and the one a level’s leaderboard points are calculated from — a record is worth what it is worth because of the level’s rank here.',
            },
            {
                name: 'Main List',
                to: '/listmain',
                desc: 'The same order with a higher bar: levels that already meet the standards required to be considered for an official rating. Shorter, and every entry is a serious candidate.',
            },
            {
                name: 'Future List',
                to: '/listfuture',
                desc: 'The strictest tier — levels with a very high likelihood of being verified and published soon. Read this one if you only want what is about to happen.',
            },
            {
                name: 'A level’s page',
                to: '/list',
                path: '/level/…',
                desc: 'One page per level: its state, how much of the decoration is done and how far the best run has got, every record and run with proof, its creators, and its rank in each tier at once.',
            },
        ],
    },
    {
        group: 'Other',
        pages: [
            {
                name: 'Upcoming Levels',
                to: '/upcoming',
                desc: 'The same unverified levels, reordered by how close they actually are to being verified rather than by how hard they are. The list of what is about to fall.',
            },
            {
                name: 'Pending List',
                to: '/pending',
                desc: 'Levels that passed selection but have no exact position yet, with the range each is expected to land in and an arrow for which way it is moving inside it.',
            },
            {
                name: 'Leaderboard',
                to: '/leaderboard',
                desc: 'Players ranked by the verifications, records and runs they hold on listed levels. Open a player to see every record behind their total and what each one is worth.',
            },
            {
                name: 'Events',
                to: '/events',
                desc: 'Three levels the list is pointing at right now: one picked for the day, one for the month, and the one closest to being verified.',
            },
            {
                name: 'Home',
                to: '/',
                desc: 'The size of each tier at a glance, the top of the list, the recent changes feed and the staff team.',
            },
        ],
    },
];

export const faqData = [
    {
        group: 'Getting on the list',
        questions: [
            {
                q: 'How does a level get on the list?',
                a: `<p>Staff select it. There is no queue a creator joins: moderators assess levels against the
                    Level Selection criteria in the guidelines — classic gameplay, a public recording, an
                    intended release on the official servers and a credible chance of being rated — and place
                    the ones that pass on the Pending List until an exact position is settled.</p>`,
            },
            {
                q: 'My level isn’t listed. Can I put it forward?',
                a: `<p>Raise it in <code>#list-discussion</code> on the Discord server with a public recording of
                    its current state. It is not a submission form and the staff are not obliged to add it; it
                    goes through the same criteria as everything else.</p>`,
            },
            {
                q: 'Why is a level on Pending and not on the list?',
                a: `<p>It passed selection but has no exact position yet. The Pending List shows the range it is
                    expected to land in and an arrow for which way it is moving inside that range. A level with
                    no usable estimate at all sits under <em>Pending Indefinitely</em>.</p>`,
            },
            {
                q: 'A level’s information is wrong or out of date.',
                a: `<p>Report it in <code>#level-update-reporting</code> with something to back it up — gameplay
                    footage, a statement from the creator, tester feedback. Positions are adjusted on that kind
                    of evidence.</p>`,
            },
            {
                q: 'Why is a level marked 🚫?',
                a: `<p>It is pending removal: it no longer meets the criteria it was added under, and will come
                    off the list unless that changes.</p>`,
            },
        ],
    },
    {
        group: 'Records',
        questions: [
            {
                q: 'How do I submit a record?',
                a: `<p>Through the list’s Discord server. Read <em>Acceptance of Records</em> in the guidelines
                    first — a record that arrives without the required proof is rejected before anyone assesses
                    it, not sent back for more.</p>`,
            },
            {
                q: 'What proof does a record need?',
                a: `<p>A complete, uncut playthrough of the record (if your video has cuts, attach the raw
                    footage as well), the level’s audio or your clicks, and a cheat indicator and fps/tps
                    display where your mod menu provides them. The record has to be on the version of the level
                    this site lists. The full requirements, including what may be blurred and what may not, are
                    in <em>Requirements for proof of legitimacy</em>.</p>`,
            },
            {
                q: 'What counts as a world record here?',
                a: `<p>Two things are tracked separately: the best completion from 0%, and the world record run
                    — the longest single segment on the current version of the level, measured from where it
                    started to where it ended.</p>`,
            },
            {
                q: 'My record was rejected. Can it be reviewed?',
                a: `<p>A record rejected because the player changed the level can be reviewed if the creator
                    later made the same change in a new version; ask the staff. Anything rejected for missing
                    proof needs to be resubmitted with the proof.</p>`,
            },
        ],
    },
    {
        group: 'Points and the leaderboard',
        questions: [
            {
                q: 'How are leaderboard points calculated?',
                a: `<p>From two things: the level’s rank in <strong>All Levels</strong>, and the percentage of
                    your record. A verification is worth twice a 100% record on the same level, and completing
                    a level that is not verified yet — a layout completion — is worth 0.8 of a verification.</p>
                    <table class="info-tbl info-tbl--num">
                        <thead><tr><th></th><th>#1</th><th>#10</th><th>#50</th><th>#100</th></tr></thead>
                        <tbody>
                            <tr><td>100% record</td><td>1459</td><td>1196</td><td>663</td><td>425</td></tr>
                            <tr><td>50% record</td><td>851</td><td>698</td><td>387</td><td>248</td></tr>
                            <tr><td>Verification</td><td>2919</td><td>2392</td><td>1325</td><td>849</td></tr>
                        </tbody>
                    </table>
                    <p>Position is worth far more than percentage: a 50% on #1 beats a 100% on #100.</p>`,
            },
            {
                q: 'Why did my total change when I didn’t submit anything?',
                a: `<p>Because points are calculated from a level’s <em>current</em> rank, and on a list of
                    upcoming levels ranks move constantly. Every record on a level that moves is worth a
                    different number of points afterwards.</p>`,
            },
            {
                q: 'What is “layout verified”?',
                a: `<p>A 100% completion of a level that has not been verified yet — someone beat it in its
                    undecorated state. It is scored as its own thing, at 0.8 of a verification.</p>`,
            },
        ],
    },
    {
        group: 'The list itself',
        questions: [
            {
                q: 'What do the colours in the list mean?',
                a: `<p>They are the level’s state, from layout through decoration and verification to rated. The
                    full scale is in the Reference block on this page, and it is the same scale as the status
                    pill on a level’s own page. Level colouring is a setting — if names look plain, turn it on
                    in Settings.</p>`,
            },
            {
                q: 'Is this the Demonlist? Is it official?',
                a: `<p>No. ULL is a community project and is not affiliated with RobTop Games. Levels that are
                    already rated are placed in strict accordance with their ranking on
                    <a href="https://pointercrate.com" target="_blank" rel="noopener">Pointercrate</a>, and
                    these guidelines are adapted from the Global Demonlist Guidelines with credit to their
                    authors — but nothing here is an official ranking.</p>`,
            },
            {
                q: 'The rules changed and I didn’t know.',
                a: `<p>Changes are announced in the Discord server. The guidelines on this page are always the
                    current version.</p>`,
            },
        ],
    },
];

// Endpoints and fields as the Worker actually serves them (worker/worker.js).
export const apiData = {
    base: 'https://d1-wrkr.ullteam.workers.dev',
    endpoints: [
        { path: '/api/list', returns: 'Every level, in rank order' },
        { path: '/api/list/main', returns: 'The Main List' },
        { path: '/api/list/future', returns: 'The Future List' },
        { path: '/api/levels/{position}', returns: 'One level, by its 1-based rank' },
        { path: '/api/pending', returns: 'Pending List entries' },
        { path: '/api/editors', returns: 'The staff list, in the order staff arranged it' },
        { path: '/api/level-month', returns: 'Level of the Month, or null' },
        { path: '/api/level-verif', returns: 'Closest to verification, or null' },
        { path: '/api/recent-changes', returns: 'The changes feed, grouped {date, entries[]}' },
    ],
    fields: [
        { name: 'path', type: 'string', meaning: 'Slug; the level’s page is /level/{path}' },
        { name: 'name, author', type: 'string', meaning: 'Level name and host' },
        { name: 'creators', type: 'string[]', meaning: 'Everyone credited' },
        { name: 'verifier', type: 'string', meaning: 'Verifier, or "Open Verification"' },
        { name: 'percentFinished', type: 'number', meaning: 'Decoration progress, 0–100' },
        { name: 'records, run', type: 'object[]', meaning: '{user, link, percent, hz} — completions and runs' },
        { name: 'tags', type: 'string[]', meaning: 'Public, Layout, Rated, NONG, …' },
        { name: 'isMain, isFuture, isVerified, benchmark', type: 'boolean', meaning: 'Which tiers it is on, and its state' },
        { name: 'sort_order', type: 'number', meaning: 'Rank in All Levels' },
    ],
    example: `curl https://d1-wrkr.ullteam.workers.dev/api/list

[
  {
    "path": "manray",
    "name": "M A N R A Y",
    "author": "akunakunn",
    "creators": ["akunakunn", "Wobbly"],
    "verifier": "Open Verification",
    "percentFinished": 80,
    "records": [{ "user": "Zoink", "percent": 61, "hz": 240 }],
    "isMain": true, "isFuture": false, "isVerified": false,
    "sort_order": 4
  },
  …
]`,
    fairUse: [
        'Cache what you fetch: the list changes a few times a day, not a few times a second.',
        'Identify your bot in the user agent if you are polling on a schedule.',
        'The data is community work — credit the list and link back to it.',
        'Positions are estimates and change, so treat a stored rank as a snapshot, not a fact.',
    ],
};

// The pill modifier is the source of the colour; see css/ull-v2.css.
export const coloringLegend = [
    { pill: 'u-pill--blue', label: 'Layout', meaning: 'No decoration yet' },
    { pill: 'u-pill--cyan', label: 'Early deco', meaning: '1–29% decorated' },
    { pill: 'u-pill--green', label: 'Mid deco', meaning: '30–69% decorated' },
    { pill: 'u-pill--yellow', label: 'Late deco', meaning: '70–99% decorated' },
    { pill: 'u-pill--amber', label: 'Deco done', meaning: 'Decoration finished' },
    { pill: 'u-pill--orange', label: 'Early verify', meaning: 'Best run 30–59%' },
    { pill: 'u-pill--red', label: 'Late verify', meaning: 'Best run 60–99%' },
    { pill: 'u-pill--done', label: 'Verified', meaning: 'Beaten, not yet rated' },
    { pill: '', label: 'Rated', meaning: 'Verified and rated in game' },
    { pill: 'u-pill--done', label: '🚫', meaning: 'Pending removal', glyph: true },
];

export const pendingLegend = [
    { icon: 'move-up', label: 'Moving up' },
    { icon: 'move-down', label: 'Moving down' },
    { icon: '1', label: 'Pending #1' },
    { icon: '10', label: 'Pending Top 10' },
    { icon: '20', label: 'Pending Top 20' },
    { icon: '30', label: 'Pending Top 30' },
    { icon: '50', label: 'Pending Top 50' },
    { icon: '75', label: 'Pending Top 75' },
    { icon: 'question', label: 'Unknown placement' },
];

export const contactRouting = [
    { what: 'A record', where: 'The Discord server' },
    { what: 'A level that should be listed', where: '#list-discussion' },
    { what: 'Information that is out of date', where: '#level-update-reporting' },
    { what: 'Something broken on the site', where: 'The site’s developer' },
    { what: 'A complaint about a staff member', where: 'An Admin, or the List Leader' },
];
