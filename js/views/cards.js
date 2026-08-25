/* Cards: spaced repetition, a simplified SM-2.

   Each rating sets the next interval:
     Again -> due today  (and the streak resets to 0)
     Hard  -> 1 day
     Good  -> first time 3 days, after that previous x 2.2 + 1
     Easy  -> first time 6 days, after that previous x 3 + 3

   Intervals cap at 120 and 180 days so nothing vanishes for a year.
   Cards you have never seen count as due, which is why a fresh
   subject shows its whole deck. */
window.AP = window.AP || {}; AP.views = AP.views || {};

AP.views.cards = (function () {
  "use strict";
  var U = AP.util, S = AP.store.data;
  var run = { course: null, queue: [], idx: 0 };

  var MAX_GOOD = 120, MAX_EASY = 180;

  function nextInterval(quality, prev) {
    if (quality === 0) return 0;
    if (quality === 1) return 1;
    if (quality === 2) return prev.n ? Math.min(Math.round((prev.iv || 1) * 2.2) + 1, MAX_GOOD) : 3;
    return prev.n ? Math.min(Math.round((prev.iv || 1) * 3) + 3, MAX_EASY) : 6;
  }

  function paint() {
    var now = U.today();
    U.el("cd-picker").innerHTML = AP.COURSES.map(function (c) {
      var deck = AP.CARDS[c.k] || [], due = 0;
      deck.forEach(function (_, i) {
        var rec = S.cards[c.k + "-" + i];
        if (!rec || (rec.due || 0) <= now) due++;
      });
      var pct = deck.length ? Math.round((deck.length - due) / deck.length * 100) : 0;
      return '<button class="pick" data-c="' + c.k + '">' +
             '<span class="cn">' + U.esc(c.name) + '</span>' +
             '<span class="bar"><i style="width:' + pct + '%"></i></span>' +
             '<span class="cm">' + (due ? due + " due now" : "nothing due") + " · " + deck.length + ' cards</span></button>';
    }).join("");

    U.el("cd-picker").querySelectorAll(".pick").forEach(function (b) {
      b.addEventListener("click", function () { start(b.dataset.c); });
    });
  }

  function start(k) {
    var now = U.today(), queue = [];
    (AP.CARDS[k] || []).forEach(function (_, i) {
      var rec = S.cards[k + "-" + i];
      if (!rec || (rec.due || 0) <= now) queue.push(i);
    });
    run = { course: k, queue: queue, idx: 0 };
    U.el("cd-home").style.display = "none";
    U.el("cd-run").style.display = "";
    U.el("cd-tag").textContent = AP.CMAP[k].name;
    show();
  }

  function show() {
    if (run.idx >= run.queue.length) {
      U.el("cd-card").style.display = "none";
      U.el("cd-rates").classList.add("hide");
      U.el("cd-empty").style.display = "";
      U.el("cd-n").textContent = "";
      return;
    }
    var card = AP.CARDS[run.course][run.queue[run.idx]];
    U.el("cd-card").style.display = "";
    U.el("cd-empty").style.display = "none";
    U.el("cd-front").textContent = card[0];
    U.el("cd-back-t").textContent = card[1];
    U.el("cd-back-t").classList.add("hide");
    U.el("cd-hint").classList.remove("hide");
    U.el("cd-rates").classList.add("hide");
    U.el("cd-n").textContent = (run.idx + 1) + " / " + run.queue.length;
  }

  function flip() {
    if (run.idx >= run.queue.length) return;
    U.el("cd-back-t").classList.remove("hide");
    U.el("cd-hint").classList.add("hide");
    U.el("cd-rates").classList.remove("hide");
  }

  function rate(e) {
    var btn = e.target.closest(".rate");
    if (!btn) return;
    var quality = parseInt(btn.dataset.q, 10);
    var id = run.course + "-" + run.queue[run.idx];
    var prev = S.cards[id] || { n: 0, iv: 0 };
    var iv = nextInterval(quality, prev);

    S.cards[id] = {
      n:  quality === 0 ? 0 : (prev.n || 0) + 1,
      iv: iv,
      due: U.today() + iv * 86400000
    };
    AP.store.save();

    run.idx++;
    show();
  }

  function home() {
    U.el("cd-run").style.display = "none";
    U.el("cd-home").style.display = "";
    paint();
    window.scrollTo(0, 0);
  }

  function bind() {
    U.el("cd-card").addEventListener("click", flip);
    U.el("cd-rates").addEventListener("click", rate);
    U.el("cd-back").addEventListener("click", home);
    U.el("cd-again").addEventListener("click", home);
  }

  return { paint: paint, bind: bind, nextInterval: nextInterval };
})();
