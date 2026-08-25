/* Write: free-response prompts with the real rubric underneath.

   Nothing here is auto-graded, and that is deliberate. Scoring your
   own writing against the actual criteria is the skill — an automatic
   score would take away the part that teaches you. */
window.AP = window.AP || {}; AP.views = AP.views || {};

AP.views.write = (function () {
  "use strict";
  var U = AP.util, S = AP.store.data;

  function maxPoints(f) {
    return f.rows.reduce(function (a, r) { return a + parseInt(r[0], 10); }, 0);
  }

  function earned(f, fi) {
    return f.rows.reduce(function (a, r, ri) {
      return a + (S.rubric["f" + fi + "-" + ri] ? parseInt(r[0], 10) : 0);
    }, 0);
  }

  function paint() {
    U.el("wr-list").innerHTML = AP.FRQ.map(function (f, fi) {
      var rows = f.rows.map(function (r, ri) {
        var id = "f" + fi + "-" + ri;
        return '<label class="rline"><input type="checkbox" data-rid="' + id + '"' +
               (S.rubric[id] ? " checked" : "") + '>' +
               '<span class="pt">' + r[0] + ' pt</span><span>' + r[1] + '</span></label>';
      }).join("");

      return '<details class="acc"><summary>' + U.esc(AP.CMAP[f.c].short) + " — " + U.esc(f.title) +
             '<span class="tail">' + U.esc(f.tail) + '</span></summary>' +
             '<div class="acc-body">' +
               '<div class="prompt">' + f.prompt + '</div>' +
               '<textarea placeholder="Draft here. Nothing you type is scored automatically — the point is to write it, then judge it honestly against the rubric below."></textarea>' +
               '<div><div class="eyebrow" style="padding-bottom:6px">Score yourself</div><div>' + rows + '</div></div>' +
               '<div class="tally" data-tally="' + fi + '"><b>' + earned(f, fi) + '</b> / ' + maxPoints(f) + ' points</div>' +
             '</div></details>';
    }).join("");

    U.el("wr-list").querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        if (cb.checked) S.rubric[cb.dataset.rid] = true;
        else delete S.rubric[cb.dataset.rid];
        AP.store.save();

        var fi = cb.dataset.rid.slice(1).split("-")[0];
        var f = AP.FRQ[parseInt(fi, 10)];
        var tally = U.el("wr-list").querySelector('[data-tally="' + fi + '"]');
        if (tally) tally.innerHTML = "<b>" + earned(f, fi) + "</b> / " + maxPoints(f) + " points";
      });
    });
  }

  return { paint: paint };
})();
