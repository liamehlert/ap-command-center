/* ---------------------------------------------------------------
   State: everything the app remembers about you.

   Two storage backends, picked automatically:

   1. Published as an Artifact -> the hidden <div id="state"> IS the
      record. The runtime saves DOM changes caused by your clicks, so
      writing JSON into that div persists it across devices.

   2. Anywhere else (GitHub Pages, a local file) -> localStorage,
      which is per-browser and does not sync.

   Same API either way. Views never care which one is live.
   --------------------------------------------------------------- */
window.AP = window.AP || {};

AP.store = (function () {
  "use strict";

  var KEY = "ap-command-center-v1";
  var EMPTY = { quiz: {}, cards: {}, rubric: {}, track: [] };

  function node() { return document.getElementById("state"); }

  function readRaw() {
    var el = node();
    if (el && (el.textContent || "").trim()) return el.textContent.trim();
    try { return window.localStorage.getItem(KEY) || ""; } catch (e) { return ""; }
  }

  function load() {
    var out = { quiz: {}, cards: {}, rubric: {}, track: [] };
    try {
      var raw = readRaw();
      if (!raw) return out;
      var p = JSON.parse(raw);
      if (p && typeof p === "object") {
        out.quiz   = p.quiz   || {};
        out.cards  = p.cards  || {};
        out.rubric = p.rubric || {};
        out.track  = Array.isArray(p.track) ? p.track : [];
      }
    } catch (e) {
      /* Corrupt or unreadable state should never break the page.
         Starting clean is better than a white screen. */
    }
    return out;
  }

  var data = load();

  function save() {
    var json = JSON.stringify(data);
    var el = node();
    if (el) el.textContent = json;          /* artifact runtime picks this up */
    try { window.localStorage.setItem(KEY, json); } catch (e) { /* private mode */ }
  }

  return {
    data: data,
    save: save,
    reset: function () {
      data.quiz = {}; data.cards = {}; data.rubric = {}; data.track = [];
      save();
    },
    EMPTY: EMPTY
  };
})();

/* Small shared helpers used by more than one view. */
AP.util = {
  today: function () {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  },
  days: function (ms) { return Math.round(ms / 86400000); },
  esc: function (s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  },
  el: function (id) { return document.getElementById(id); }
};
