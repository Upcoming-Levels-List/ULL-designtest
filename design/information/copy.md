# /information — draft copy

Sections 3 (what the list is, where is what) and 4 (FAQ) did not exist, so this
is the first draft of both, plus the contact block section 5 needs. It is
separate from the templates on purpose: the four templates are four ways of
*arranging* this text, and whichever one wins, this is what goes in it.

Everything here is either taken from `js/_guidelines.js` and `README.md` or
derived from code that ships (`js/formulas.js` for the point figures). Two
answers are marked **[confirm]** — they describe staff procedure that is not
written down anywhere I could read, so a staff member should check the wording
before it goes live.

---

## 3. What this list is

**Lead.** The Upcoming Levels List catalogues upcoming Top 1–100 Extreme Demons
in Geometry Dash that are projected to be verified and placed on the Demonlist,
along with unrated Extreme Demons that would have qualified for a rating when
they were made. It is a forecast of what the Demonlist is about to look like —
not a record of what has already happened.

Nothing here is official. Positions are estimates made by the list staff against
written criteria, and they move as levels progress.

### Where is what

| Page | What it holds |
|---|---|
| **All Levels** `/list` | The widest tier: every level with a conceivable chance of being verified and published. A level's rank *here* is what its leaderboard points are calculated from. |
| **Main List** `/listmain` | The same order, higher bar: levels that meet the standards required to be considered for an official rating. |
| **Future List** `/listfuture` | The highest bar of the three: levels very likely to be verified and published soon. |
| **Pending** `/pending` | Levels that passed selection but have no exact position yet, with the range they are expected to land in and whether they are moving up or down. |
| **Upcoming** `/upcoming` | The same levels ordered by how close they are to being verified, rather than by how hard they are. |
| **Leaderboard** `/leaderboard` | Players ranked by the points their records, runs and verifications are worth. |
| **Events** `/events` | Level of the Day, Level of the Month, and the level closest to verification. |
| **A level's own page** `/level/<name>` | One page per level: status, decoration and verification progress, records, creators, and its rank in each tier. |

### How to read a level

- **The name's colour** is its state, from layout through decoration and
  verification to rated. The full scale is in the colouring legend.
- **Two percentages** follow every level: how much of the decoration is done,
  and how far the best run has got.
- **The badges** are its position in each of the three tiers — a level can be
  #4 in All Levels and #2 in Future List at the same time.
- Level colouring is a setting. If names look plain white, turn it on in
  settings.

---

## 4. FAQ

### Getting on the list

**How does a level get on the list?**
Staff select it. There is no queue a creator joins: moderators assess levels
against the Level Selection criteria in the guidelines — classic gameplay, a
public recording, an intended official-server release, and a credible chance of
being rated — and place the ones that pass on the Pending List until an exact
position is settled.

**My level isn't listed. Can I put it forward?** **[confirm]**
Yes — raise it in `#list-discussion` on the Discord server with a public
recording of the level's current state. It is not a submission form and staff
are not obliged to add it; it goes through the same selection criteria as
anything else.

**What is the difference between All Levels, Main List and Future List?**
The order of levels is the same in all three. What changes is the threshold to
appear at all: All Levels takes anything with a conceivable chance, Main List
takes levels that meet rate-worthy standards, and Future List takes only levels
very likely to be verified and published soon.

**Why is a level on Pending and not on the list?**
It has passed selection, but its exact position hasn't been decided. Pending
shows the range it is expected to land in and an arrow for whether it is moving
up or down inside that range.

**A level's information is wrong or out of date.**
Report it in `#level-update-reporting` with something to back it up — gameplay
footage, a statement from the creator, tester feedback. Positions are adjusted
on that kind of evidence.

**Why is a level marked 🚫?**
It is pending removal: it no longer meets the criteria it was added under, and
will come off the list unless that changes.

### Records

**How do I submit a record?**
Through the list's Discord server. Read *Acceptance of Records* in the
guidelines first — a record that arrives without the required proof is rejected
before anyone assesses it, not sent back for more.

**What proof does a record need?**
A complete, uncut playthrough of the record (if your video has cuts, attach the
raw footage as well), the level's audio or your clicks, and a cheat indicator
and fps/tps display where your mod menu provides them. The record has to be on
the version of the level the site lists. The full requirements, including what
may be blurred and what may not, are in *Requirements for proof of legitimacy*.

**What counts as a world record here?**
Two things are tracked separately: the best completion from 0%, and the world
record run — the longest single segment on the current version of the level,
measured from where it started to where it ended. Both are defined in
*Definition of a World Record*.

**My record was rejected. Can it be reviewed?**
Records rejected because the player changed the level are reviewable if the
creator later made the same change in a new version. Ask the staff.
Anything rejected for missing proof needs to be resubmitted with the proof.

### Points and the leaderboard

**How are points calculated?**
From two things: the level's rank in **All Levels**, and the percentage of your
record.

```
percent factor   p ≤ 35   0.05 · (p + 10)²
                 p > 35   −0.008 · (p − 200)² + 320
rank factor      1.5 · (30000 / (rank + 40) − 2)
points           percent factor × rank factor ÷ 180
```

A verification is worth **twice** a 100% record on the same level. Completing a
level that isn't verified yet — a layout completion — is worth **0.8 of a
verification**, so 1.6× a plain 100%.

| | #1 | #10 | #50 | #100 |
|---|---|---|---|---|
| 100% record | 1459 | 1196 | 663 | 425 |
| 50% record | 851 | 698 | 387 | 248 |
| Verification | 2919 | 2392 | 1325 | 849 |

Two consequences worth knowing: the rank factor falls off steeply near the top
and flattens out lower down, and percentage is worth much less than position —
a 50% on #1 beats a 100% on #100.

**Why did my total change when I didn't submit anything?**
Because points are calculated from a level's *current* rank. When levels move —
and they move constantly on a list of upcoming levels — every record on them is
worth a different number of points.

**What is "layout verified"?**
A 100% completion of a level that hasn't been verified yet, i.e. someone beat it
in its undecorated state. It is scored as its own thing, at 0.8 of a
verification.

### The list itself

**What do the colours in the list mean?**
They are the level's state: blue for a layout, through cyan, green and yellow as
decoration progresses, amber when decoration is finished, orange and red as
verification progresses, grey when verified, white when rated. The full scale is
in the colouring legend on this page, and it is the same scale as the status
pill on a level's own page.

**Is this the Demonlist? Is it official?**
No. ULL is a community project and is not affiliated with RobTop Games. Levels
that are already rated are placed in strict accordance with their ranking on
Pointercrate, and these guidelines are adapted from the Global Demonlist
Guidelines, with credit to their authors — but nothing here is an official
ranking.

**The rules changed and I didn't know.**
Changes are announced in the Discord server. The guidelines on this page are
always the current version.

---

## 5. Contacts (block for the staff section)

| | | |
|---|---|---|
| **Upcoming Levels List** | Announcements, placements, list updates | [discord.gg/QRX47v2qyC](https://discord.gg/QRX47v2qyC) · [@ull_gd](https://x.com/ull_gd) |
| **QwidziT** — List Leader | The list and its staff team | Discord `@qwidzit` · Telegram `@qwidzit` |
| **exiled_shade** — Admin | Server management | Discord `@exiled_shade` |
| **Prometheus** — Website | Bugs and problems with the site itself | Discord `@prometheus.dev` |

Where to take what:
- **A record** → the Discord server.
- **A level that should be listed, or one whose information is wrong** →
  `#list-discussion` / `#level-update-reporting`.
- **Something broken on the website** → the site's developer, not the mods.
- **A complaint about a staff member** → an Admin, or the List Leader directly.
