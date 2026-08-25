/* Service worker — offline support and silent self-updating.
 *
 * Strategy: stale-while-revalidate for everything on our own origin.
 * A request is answered from cache immediately (fast, works offline),
 * while a fresh copy is fetched in the background for next time.
 *
 * When a background fetch comes back DIFFERENT from what was cached,
 * the worker messages the page, which shows a "new version" banner.
 *
 * The point of doing it this way: you never have to bump a version
 * number by hand. Edit a file, commit it, and the app picks it up on
 * its own. CACHE_VERSION below only needs changing if the logic in
 * THIS file changes — not when you edit content.
 */

const CACHE_VERSION = "apcc-v2";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/data/courses.js",
  "./js/data/questions.js",
  "./js/data/cards.js",
  "./js/data/frq.js",
  "./js/data/videos.js",
  "./js/state.js",
  "./js/views/today.js",
  "./js/views/practice.js",
  "./js/views/cards.js",
  "./js/views/write.js",
  "./js/views/tracker.js",
  "./js/views/watch.js",
  "./js/app.js",
  "./js/pwa.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION && k !== CACHE_VERSION + "-fonts" && k !== FLAG_CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

const FLAG_CACHE = "apcc-flags";
const FLAG_URL = "./__update-pending";

/* Record that something changed, two ways.
 *
 * postMessage handles the case where a page is open right now. But a
 * background revalidation often finishes while the page is still
 * parsing, before any listener exists, and postMessage does not queue.
 * So we also drop a marker in a cache the page reads on startup. Belt
 * and braces, because a missed update notice is invisible and confusing.
 */
async function announceUpdate(url) {
  const cache = await caches.open(FLAG_CACHE);
  await cache.put(FLAG_URL, new Response(JSON.stringify({ url: url, at: Date.now() }), {
    headers: { "content-type": "application/json" }
  }));

  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((c) => c.postMessage({ type: "content-updated", url: url }));
}

/* Two responses are "the same" if GitHub Pages gives us matching ETags.
   Falling back to Last-Modified, then content-length, covers hosts that
   do not send one. If we can compare nothing, assume unchanged rather
   than nagging on every single load. */
function changed(oldRes, newRes) {
  const pick = (res, h) => res.headers.get(h);
  const etagOld = pick(oldRes, "etag"), etagNew = pick(newRes, "etag");
  if (etagOld && etagNew) return etagOld !== etagNew;

  const lmOld = pick(oldRes, "last-modified"), lmNew = pick(newRes, "last-modified");
  if (lmOld && lmNew) return lmOld !== lmNew;

  const lenOld = pick(oldRes, "content-length"), lenNew = pick(newRes, "content-length");
  if (lenOld && lenNew) return lenOld !== lenNew;

  return false;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* Google Fonts get their own cache and never raise the banner — a font
     refresh is not worth interrupting anyone for. */
  if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com")) {
    event.respondWith(fontsFirst(event));
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("__update-pending")) return;

  event.respondWith(staleWhileRevalidate(event));
});

async function fontsFirst(event) {
  const cache = await caches.open(CACHE_VERSION + "-fonts");
  const hit = await cache.match(event.request);
  const network = fetch(event.request)
    .then((res) => { cache.put(event.request, res.clone()); return res; })
    .catch(() => hit);
  event.waitUntil(network);
  return hit || network;
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE_VERSION);
  const hit = await cache.match(event.request);

  /* no-store so this always reaches the server. Without it the browser's
     own HTTP cache can answer, we compare a response against itself, and
     a real change goes unnoticed. These files are small; the extra
     request is worth never missing an update. */
  const network = fetch(event.request, { cache: "no-store" })
    .then(async (res) => {
      if (res && res.status === 200 && res.type === "basic") {
        if (hit && changed(hit, res)) await announceUpdate(new URL(event.request.url).pathname);
        await cache.put(event.request, res.clone());
      }
      return res;
    })
    .catch(() => hit);   /* offline: the cached copy is the answer */

  /* THE IMPORTANT LINE. respondWith resolves the moment we hand back the
     cached copy, and without waitUntil the browser is free to shut the
     worker down mid-revalidation — so the update never lands. */
  event.waitUntil(network);

  return hit || network;
}

/* The page asks for this when the user taps Reload on the banner —
   clearing the cache guarantees the next load is genuinely fresh. */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "flush") {
    event.waitUntil(
      Promise.all([caches.delete(CACHE_VERSION), caches.delete(FLAG_CACHE)]).then(() => {
        if (event.ports && event.ports[0]) event.ports[0].postMessage({ ok: true });
      })
    );
  }
});
