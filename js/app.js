/* Entry point. Wires the tabs, binds each view once, paints everything.
   Load order matters: data -> state -> views -> this file. */
(function () {
  "use strict";

  var tabs = document.querySelectorAll("nav.tabs button");

  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.setAttribute("aria-selected", t === btn ? "true" : "false");
      });
      document.querySelectorAll(".panel").forEach(function (p) { p.classList.remove("on"); });
      document.getElementById("p-" + btn.dataset.go).classList.add("on");

      /* Today is the only view whose numbers can go stale while you
         are on another tab, so it repaints on every visit. */
      if (btn.dataset.go === "today") AP.views.today.paint();

      window.scrollTo(0, 0);
    });
  });

  AP.views.practice.bind();
  AP.views.cards.bind();
  AP.views.tracker.bind();

  AP.views.today.paint();
  AP.views.practice.paint();
  AP.views.cards.paint();
  AP.views.write.paint();
  AP.views.tracker.paint();
  AP.views.watch.paint();
})();
