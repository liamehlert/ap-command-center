/* Progressive Web App wiring: service worker registration, the install
   button, the update banner, and the ?tab= deep links from the manifest
   shortcuts.

   All of it is optional. Without service worker support, or opened over
   file://, the app behaves exactly as before — it just is not
   installable and will not self-update. Nothing else depends on it. */
(function () {
  "use strict";

  var canServiceWorker = "serviceWorker" in navigator && location.protocol.startsWith("http");

  var FLAG_CACHE = "apcc-flags";
  var FLAG_URL = "./__update-pending";

  /* ---- 1. register, listen, and check for a missed notice ---- */
  if (canServiceWorker) {
    /* Registered immediately, NOT inside load. A revalidation can finish
       while the page is still parsing, and postMessage does not queue for
       listeners added later. */
    navigator.serviceWorker.addEventListener("message", function (e) {
      if (e.data && e.data.type === "content-updated") showBanner();
    });

    /* And catch anything the worker flagged before we were listening. */
    checkPendingFlag();

    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        /* An installed app can stay open for days without navigating,
           so nudge it hourly to look for a new worker. */
        setInterval(function () { reg.update(); }, 60 * 60 * 1000);
        /* Give the first round of revalidations a moment to land. */
        setTimeout(checkPendingFlag, 2500);
      }).catch(function (err) {
        console.warn("Service worker registration failed:", err);
      });
    });
  }

  function checkPendingFlag() {
    if (!window.caches) return;
    caches.open(FLAG_CACHE).then(function (cache) {
      return cache.match(FLAG_URL).then(function (hit) {
        if (!hit) return;
        return cache.delete(FLAG_URL).then(showBanner);
      });
    }).catch(function () { /* no cache API access — skip quietly */ });
  }

  /* ---- 2. update banner ----
     Built here rather than in index.html so the markup does not exist
     at all unless it is needed. Shown once per session however many
     files changed — thirteen banners for one commit helps nobody. */
  var shown = false;

  function showBanner() {
    if (shown) return;
    shown = true;

    var bar = document.createElement("div");
    bar.className = "updatebar";
    bar.setAttribute("role", "status");

    var msg = document.createElement("span");
    msg.textContent = "A new version is ready.";

    var go = document.createElement("button");
    go.className = "btn sm";
    go.textContent = "Reload";
    go.addEventListener("click", function () {
      go.disabled = true;
      go.textContent = "Reloading…";
      flushThenReload();
    });

    var later = document.createElement("button");
    later.className = "updatebar-x";
    later.setAttribute("aria-label", "Dismiss");
    later.textContent = "×";
    later.addEventListener("click", function () { bar.remove(); });

    bar.appendChild(msg);
    bar.appendChild(go);
    bar.appendChild(later);
    document.body.appendChild(bar);

    requestAnimationFrame(function () { bar.classList.add("in"); });
  }

  /* Ask the worker to drop its cache first, so the reload cannot be
     answered from the stale copy. Reload anyway if it does not reply
     within a second — a slightly stale reload beats a stuck button. */
  function flushThenReload() {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
      location.reload();
      return;
    }
    var done = false;
    var finish = function () { if (!done) { done = true; location.reload(); } };

    try {
      var ch = new MessageChannel();
      ch.port1.onmessage = finish;
      navigator.serviceWorker.controller.postMessage({ type: "flush" }, [ch.port2]);
    } catch (e) {
      finish();
    }
    setTimeout(finish, 1000);
  }

  /* ---- 3. install button ----
     Chrome and Edge fire beforeinstallprompt when the app qualifies.
     Safari and Firefox do not, so the button never appears there and
     the user installs through the browser's own menu instead. */
  var deferred = null;
  var btn = document.getElementById("install");

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    if (btn) btn.hidden = false;
  });

  if (btn) {
    btn.addEventListener("click", function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () {
        deferred = null;
        btn.hidden = true;
      });
    });
  }

  window.addEventListener("appinstalled", function () {
    deferred = null;
    if (btn) btn.hidden = true;
  });

  /* ---- 4. manifest shortcuts: "./?tab=cards" opens straight to Cards ---- */
  try {
    var wanted = new URLSearchParams(location.search).get("tab");
    if (wanted) {
      var target = document.querySelector('nav.tabs button[data-go="' + wanted + '"]');
      if (target) target.click();
    }
  } catch (e) { /* older browser without URLSearchParams — ignore */ }
})();
