/* Tracker: assignments and tests.

   Sort order encodes the priority rule: unfinished before finished,
   tests before assignments, then earliest due date. A Chem test on
   Thursday should be the thing at the top of the list on Tuesday. */
window.AP = window.AP || {}; AP.views = AP.views || {};

AP.views.tracker = (function () {
  "use strict";
  var U = AP.util, S = AP.store.data;
  var kind = "work";

  function byPriority(a, b) {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.kind !== b.kind) return a.kind === "test" ? -1 : 1;
    if (!a.due) return 1;
    if (!b.due) return -1;
    return a.due < b.due ? -1 : 1;
  }

  function add() {
    var what = U.el("tk-what").value.trim();
    if (!what) { U.el("tk-what").focus(); return; }
    S.track.push({
      id:   "t" + Date.now() + Math.floor(Math.random() * 999),
      what: what,
      c:    U.el("tk-cls").value,
      due:  U.el("tk-due").value || "",
      kind: kind,
      done: false
    });
    AP.store.save();
    U.el("tk-what").value = "";
    U.el("tk-due").value  = "";
    paint();
  }

  function paint() {
    var now = U.today();
    var rows = S.track.slice().sort(byPriority);

    U.el("tk-count").textContent = S.track.filter(function (r) { return !r.done; }).length + " open";

    if (!rows.length) {
      U.el("tk-list").innerHTML = '<p class="empty">Nothing tracked yet. Add an assignment or a test date above.</p>';
      return;
    }

    U.el("tk-list").innerHTML = rows.map(function (r) {
      var late = !r.done && r.due && new Date(r.due + "T00:00:00").getTime() < now;
      var when = r.due
        ? new Date(r.due + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "no date";
      return '<div class="tkrow' + (r.kind === "test" ? " test" : "") +
             (r.done ? " done" : "") + (late ? " overdue" : "") + '" data-id="' + r.id + '">' +
             '<input type="checkbox"' + (r.done ? " checked" : "") + '>' +
             '<span class="what">' + U.esc(r.what) + '</span>' +
             '<span class="cls">' + U.esc(AP.CMAP[r.c] ? AP.CMAP[r.c].short : r.c) + '</span>' +
             '<span class="due">' + U.esc(when) + (late ? " · late" : "") + '</span>' +
             '<button class="kill" title="Remove">×</button></div>';
    }).join("");

    U.el("tk-list").querySelectorAll(".tkrow").forEach(function (row) {
      var id = row.dataset.id;
      row.querySelector('input[type="checkbox"]').addEventListener("change", function (e) {
        S.track.forEach(function (r) { if (r.id === id) r.done = e.target.checked; });
        AP.store.save();
        paint();
      });
      row.querySelector(".kill").addEventListener("click", function () {
        S.track = AP.store.data.track = S.track.filter(function (r) { return r.id !== id; });
        AP.store.save();
        paint();
      });
    });
  }

  function bind() {
    U.el("tk-cls").innerHTML = AP.COURSES.map(function (c) {
      return '<option value="' + c.k + '">' + U.esc(c.short) + '</option>';
    }).join("");

    U.el("tk-kind").addEventListener("click", function () {
      kind = kind === "work" ? "test" : "work";
      U.el("tk-kind").textContent = "Type: " + (kind === "work" ? "Assignment" : "Test");
    });

    U.el("tk-add").addEventListener("click", add);
    U.el("tk-what").addEventListener("keydown", function (e) {
      if (e.key === "Enter") add();
    });
  }

  return { paint: paint, bind: bind };
})();
