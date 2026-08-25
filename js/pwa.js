/* Progressive Web App wiring: service worker registration, the install
   button, and the ?tab= deep links used by the manifest shortcuts.

   All of it is optional. If the browser has no service worker support,
   or the page is opened from file:// where registration is not allowed,
   the app still works exactly as before — it just is not installable. */
(function () {
  "use strict";

  /* ---- 1. service worker ---- */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (err) {
        /* Registration failing is not fatal — log it and move on. */
        console.warn("Service worker registration failed:", err);
      });
    });
  }

  /* ---- 2. install button ----
     Chrome and Edge fire beforeinstallprompt when the app qualifies.
     Safari and Firefox do not, so the button simply never appears there
     and the user installs via the browser's own share/menu options. */
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

  /* ---- 3. manifest shortcuts ----
     "./?tab=practice" should open straight to that tab. */
  try {
    var wanted = new URLSearchParams(location.search).get("tab");
    if (wanted) {
      var target = document.querySelector('nav.tabs button[data-go="' + wanted + '"]');
      if (target) target.click();
    }
  } catch (e) { /* older browser, no URLSearchParams — ignore */ }
})();
