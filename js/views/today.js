/* Today: a read-only dashboard. Every number here is derived from
   what you have actually done — nothing is stored twice. */
window.AP = window.AP || {}; AP.views = AP.views || {};

AP.views.today = (function () {
  "use strict";
  var U = AP.util, S = AP.store.data;

  function dueCardCount(now) {
    var n = 0;
    AP.COURSES.forEach(function (c) {
      (AP.CARDS[c.k] || []).forEach(function (_, i) {
        var rec = S.cards[c.k + "-" + i];
        if (!rec || (rec.due || 0) <= now) n++;   /* unseen cards count as due */
      });
    });
    return n;
  }

  function paint() {
    var now = U.today();

    U.el("cd").innerHTML = AP.COURSES.map(function (c) {
      var left = U.days(new Date(c.exam + "T00:00:00").getTime() - now);
      return '<div class="cd"><span class="subj">' + U.esc(c.short) + '</span>' +
             '<span class="days">' + left + '</span>' +
             '<span class="when">' + U.esc(c.when) + '</span></div>';
    }).join("");

    var cards = dueCardCount(now);
    var open  = S.track.filter(function (r) { return !r.done; }).length;
    var late  = S.track.filter(function (r) {
      return !r.done && r.due && new Date(r.due + "T00:00:00").getTime() < now;
    }).length;
    var done  = Object.keys(S.quiz).length;

    U.el("dues").innerHTML =
      row(cards, "cards due for review") +
      row(open,  "open items in the tracker" + (late ? ", <strong>" + late + "</strong> overdue" : "")) +
      row(done,  "practice questions answered so far");

    U.el("weak").innerHTML = weakSpots() ||
      '<p class="empty">Answer at least three questions in a subject and anything you’re under 75% on shows up here.</p>';
  }

  function row(n, label) {
    return '<div class="duerow' + (n ? "" : " zero") + '"><span class="n">' + n + '</span><span>' + label + '</span></div>';
  }

  /* A subject only appears once there is enough data to mean something.
     Three questions is a low bar, but one wrong answer out of one is noise. */
  function weakSpots() {
    var out = [];
    AP.COURSES.forEach(function (c) {
      var total = 0, right = 0;
      (AP.QUESTIONS[c.k] || []).forEach(function (_, i) {
        var r = S.quiz[c.k + "-" + i];
        if (r) { total++; if (r === "right") right++; }
      });
      if (total >= 3) {
        var pct = Math.round(right / total * 100);
        if (pct < 75) {
          out.push('<div class="duerow"><span class="n">' + pct + '%</span><span>' +
                   U.esc(c.name) + ' — ' + right + ' of ' + total + ' right. Worth a second pass.</span></div>');
        }
      }
    });
    return out.join("");
  }

  return { paint: paint };
})();
