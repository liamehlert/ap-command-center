/* Watch: curated video resources.

   Every entry carries a freshness badge because the research turned up
   several famous channels that are dormant, or that teach a version of
   the course that no longer exists. A link with no warning on it is a
   link that will quietly waste your time. */
window.AP = window.AP || {}; AP.views = AP.views || {};

AP.views.watch = (function () {
  "use strict";
  var U = AP.util;

  function paint() {
    U.el("wa-list").innerHTML = AP.COURSES.map(function (c) {
      var list = AP.VIDEOS[c.k] || [];
      var items = list.map(function (v) {
        return '<div class="vitem">' +
                 '<div class="vname"><a href="' + v.u + '" target="_blank" rel="noopener">' + U.esc(v.n) + '</a>' +
                 '<span class="badge ' + v.b + '">' + U.esc(v.bl) + '</span></div>' +
                 '<div class="vfor">' + U.esc(v.d) + '</div>' +
                 (v.warn ? '<div class="vwarn"><b>Careful.</b> ' + U.esc(v.warn) + '</div>' : '') +
               '</div>';
      }).join("");

      return '<details class="acc"><summary>' + U.esc(c.name) +
             '<span class="tail">' + list.length + ' checked</span></summary>' +
             '<div class="vbody" style="padding:6px 18px 18px">' + items + '</div></details>';
    }).join("");
  }

  return { paint: paint };
})();
