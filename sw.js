/* Service worker — makes the app installable and usable offline.
 *
 * Strategy is deliberately boring: precache the whole app on install,
 * then serve from cache first. The app is a few hundred KB of static
 * files with no server behind it, so there is nothing to be clever about.
 *
 * Bump CACHE_VERSION whenever you change any file in SHELL, or browsers
 * will keep serving the old copy.
 */

const CACHE_VERSION = "apcc-v1";

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
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      /* addAll fails the whole install if any single file 404s, which is
         the behaviour we want — a half-cached app is worse than none. */
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* Google Fonts: stale-while-revalidate. Serve the cached copy instantly,
     refresh in the background. Offline, the CSS fallback stack takes over. */
  if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com")) {
    event.respondWith(
      caches.open(CACHE_VERSION + "-fonts").then((cache) =>
        cache.match(req).then((hit) => {
          const fetching = fetch(req)
            .then((res) => { cache.put(req, res.clone()); return res; })
            .catch(() => hit);
          return hit || fetching;
        })
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          /* cache anything new we fetch successfully from our own origin */
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          /* offline and uncached: for navigations, fall back to the shell */
          if (req.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});
