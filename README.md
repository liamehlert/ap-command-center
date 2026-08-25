# AP Command Center

A study system for six AP courses, built around a simple idea: knowing the
material and scoring the points are different skills, and almost nobody
practises the second one.

Live site: _add your GitHub Pages URL here once it's deployed_

---

## What it does

| Tab | What it's for |
|---|---|
| **Today** | Exam countdowns, what's due, and any subject you're under 75% on |
| **Practice** | Multiple choice built from documented AP scoring traps |
| **Cards** | Spaced repetition — cards resurface right before you'd forget them |
| **Write** | Free-response prompts with the real rubric, scored by you |
| **Tracker** | Assignments and tests, sorted so tests outrank everything |
| **Watch** | Video resources, each checked for whether it's still current |

Six courses: Biology, Chemistry, U.S. History, Calculus AB, English Language,
and Psychology. Exams run May 3–14, 2027.

---

## Why the questions are what they are

Every practice question and flashcard targets something College Board's own
**chief reader reports** say students get wrong year after year. Not content
recall — the specific ways people lose points they should have earned:

- Calculus students who know the answer but describe the graph instead of
  citing the sign change in `f'`
- Chemistry students who assume the familiar metal must be the cathode
  (electrochemistry produced the lowest mean score on the 2025 exam — 1.34/4)
- History students who summarise a document instead of sourcing it
  (that rubric point averages about 0.38 out of 1)
- Psychology students who define a concept instead of applying it
  (roughly 22% and 14% earned full credit on the two EBQ explain parts in 2025)

The **Watch** tab carries freshness warnings for the same reason. Several
famous channels are dormant or teach a version of the course that no longer
exists — Bozeman Science's AP Chem series still uses the "Big Ideas" framework
College Board deleted in 2024, and every APUSH writing video currently online
teaches the pre-2027 exam format.

---

## Running it

No build step, no dependencies, no install. Open `index.html` in a browser.

```
git clone https://github.com/YOUR-USERNAME/ap-command-center.git
cd ap-command-center
open index.html          # or just double-click it
```

To deploy: push to GitHub, then **Settings → Pages → Deploy from a branch →
main → / (root)**. Live in about a minute.

---

## Installing it as an app

It's a Progressive Web App, so it installs to a home screen or a desktop
without an app store, a developer account, or a review process.

- **Android / Chrome / Edge** — an "Install as an app" button appears in the
  header, or use the browser menu → Install.
- **Chromebook** — same button, or the install icon in the address bar. It
  lands in your shelf like any other app.
- **iPhone / iPad** — Safari → Share → Add to Home Screen. iOS doesn't fire
  the install event, so the in-app button won't show; the manual route works.

Once installed it opens without browser chrome and **works fully offline** —
the service worker precaches every file on first load. Long-press the icon
for shortcuts straight into Practice, Cards, or Tracker.

Installing requires HTTPS, which GitHub Pages gives you for free. Opening
`index.html` from your filesystem works for development but won't install.

### The PWA files

```
manifest.json        name, icons, theme colours, shortcuts
sw.js                service worker — precache and offline
js/pwa.js            registration, install button, ?tab= deep links
icons/               192, 512, maskable, apple-touch, favicon
```

`js/pwa.js` is entirely optional. If a browser lacks service worker support,
or the page is opened over `file://`, the app behaves exactly as before — it
just isn't installable. Nothing else depends on it.

**When you change a file**, bump `CACHE_VERSION` in `sw.js`. Otherwise
browsers keep serving the cached copy and your edit won't appear.

---

## How it's put together

```
index.html              markup and structure only — no logic, no content
css/styles.css          one stylesheet, CSS custom properties, light + dark
js/
  data/                 pure data, no logic
    courses.js          the six courses and their exam dates
    questions.js        practice bank
    cards.js            flashcard decks
    frq.js              free-response prompts and rubrics
    videos.js           curated video resources
  state.js              storage layer + shared helpers
  views/                one file per tab, each owns its own DOM
    today.js  practice.js  cards.js  write.js  tracker.js  watch.js
  app.js                entry point — wires tabs, binds views, paints
  pwa.js                service worker registration + install button
build.js                bundles everything into one self-contained file
manifest.json           PWA metadata
sw.js                   offline caching
icons/                  app icons
```

Plain scripts loading in order, sharing a single `AP` global. No framework,
no bundler, no `node_modules`. It opens straight from the filesystem, which
means you can edit a file and hit refresh.

### Storage

`js/state.js` picks its backend automatically:

- Published as a **Claude Artifact**, the hidden `<div id="state">` is the
  record. The runtime saves DOM changes caused by user gestures, so writing
  JSON into that div persists it across devices.
- Anywhere else — GitHub Pages, a local file — it falls back to
  **localStorage**, which is per-browser and doesn't sync.

Views never know which one is live. Same API either way.

### The spaced repetition

A trimmed-down SM-2 in `js/views/cards.js`:

| Rating | Next interval |
|---|---|
| Again | today (streak resets to 0) |
| Hard | 1 day |
| Good | 3 days first time, then `previous × 2.2 + 1` |
| Easy | 6 days first time, then `previous × 3 + 3` |

Capped at 120 and 180 days so nothing disappears for a year. Unseen cards
count as due, which is why a fresh subject shows its whole deck.

---

## Building the single-file version

```
node build.js              # dist/index.html   — standalone page
node build.js --artifact   # dist/artifact.html — no document skeleton
```

The repo is organised for reading. The Artifact host wants one file with no
external references, so `build.js` inlines the stylesheet and concatenates the
scripts in dependency order. Same code, two shapes.

---

## Adding your own content

All content lives in `js/data/`. Nothing else needs to change.

A practice question:

```js
{
  t: "Unit 5 · Justification",           // topic label
  s: "Optional setup or stimulus.",      // supports HTML
  q: "The question itself?",
  o: ["Option A", "Option B", "Option C", "Option D"],
  a: 1,                                  // index of the correct option
  w: "Why the right answer is right.",   // supports HTML
  p: "Why this specific mistake costs points on the real exam."
}
```

A flashcard is just `["front", "back"]`.

---

## Accuracy

Course frameworks, unit weightings, exam dates, and format changes were taken
from College Board's published course and exam descriptions and verified in
August 2026. Exam formats change — check anything that matters against
[AP Central](https://apcentral.collegeboard.org) before relying on it.

Practice questions are written from the official frameworks and chief reader
reports. **They are not retired College Board items.** Good practice, not a
substitute for released exams.

---

## Licence

MIT.
