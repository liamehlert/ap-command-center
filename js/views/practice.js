/* Practice: multiple choice built around documented scoring traps.
   Results are written to state on every answer, not at the end of a
   run, so closing the tab mid-quiz loses nothing. */
window.AP = window.AP || {}; AP.views = AP.views || {};

AP.views.practice = (function () {
  "use strict";
  var U = AP.util, S = AP.store.data;
  var run = { course: null, i: 0, right: 0, missed: [] };

  function paint() {
    U.el("pr-picker").innerHTML = AP.COURSES.map(function (c) {
      var bank = AP.QUESTIONS[c.k] || [], done = 0, right = 0;
      bank.forEach(function (_, i) {
        var r = S.quiz[c.k + "-" + i];
        if (r) { done++; if (r === "right") right++; }
      });
      var pct = bank.length ? Math.round(done / bank.length * 100) : 0;
      return '<button class="pick" data-c="' + c.k + '">' +
             '<span class="cn">' + U.esc(c.name) + '</span>' +
             '<span class="bar"><i style="width:' + pct + '%"></i></span>' +
             '<span class="cm">' + (done ? done + " of " + bank.length + " done · " + right + " right"
                                         : bank.length + " questions") + '</span></button>';
    }).join("");

    U.el("pr-picker").querySelectorAll(".pick").forEach(function (b) {
      b.addEventListener("click", function () { start(b.dataset.c); });
    });
  }

  function start(k) {
    run = { course: k, i: 0, right: 0, missed: [] };
    U.el("pr-home").style.display = "none";
    U.el("pr-quiz").style.display = "";
    U.el("pr-live").style.display = "";
    U.el("pr-done").style.display = "none";
    question();
  }

  function question() {
    var bank = AP.QUESTIONS[run.course], q = bank[run.i];
    U.el("pr-tag").textContent = q.t;
    U.el("pr-n").textContent = (run.i + 1) + " / " + bank.length;

    var setup = U.el("pr-setup");
    if (q.s) { setup.innerHTML = q.s; setup.style.display = ""; }
    else { setup.style.display = "none"; }

    U.el("pr-stem").textContent = q.q;

    var box = U.el("pr-opts");
    box.innerHTML = "";
    q.o.forEach(function (text, idx) {
      var b = document.createElement("button");
      b.className = "opt";
      b.type = "button";
      b.innerHTML = '<span class="k">' + AP.LET[idx] + '</span><span>' + U.esc(text) + '</span>';
      b.addEventListener("click", function () { answer(idx); });
      box.appendChild(b);
    });

    U.el("pr-fb").classList.add("hide");
    U.el("pr-next").classList.add("hide");
  }

  function answer(pick) {
    var bank = AP.QUESTIONS[run.course], q = bank[run.i];
    var btns = U.el("pr-opts").children;
    if (btns[0].disabled) return;             /* already answered */

    var ok = pick === q.a;
    if (ok) run.right++; else run.missed.push(q);

    S.quiz[run.course + "-" + run.i] = ok ? "right" : "wrong";
    AP.store.save();

    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      if (i === q.a) btns[i].classList.add("right");
      else if (i === pick) btns[i].classList.add("wrong");
      else btns[i].classList.add("dim");
    }

    var head = U.el("pr-fbh");
    head.textContent = ok ? "Correct" : "Not quite";
    head.className = "fbh " + (ok ? "ok" : "no");
    U.el("pr-why").innerHTML = q.w;
    U.el("pr-trap").innerHTML = "<b>Why this costs points</b>" + q.p;
    U.el("pr-fb").classList.remove("hide");

    var next = U.el("pr-next");
    next.textContent = (run.i === bank.length - 1) ? "See results" : "Next question";
    next.classList.remove("hide");
  }

  function advance() {
    var bank = AP.QUESTIONS[run.course];
    if (run.i < bank.length - 1) {
      run.i++;
      question();
      U.el("pr-stem").scrollIntoView({ block: "center", behavior: "smooth" });
    } else {
      finish();
    }
  }

  function finish() {
    var bank = AP.QUESTIONS[run.course];
    U.el("pr-live").style.display = "none";
    U.el("pr-done").style.display = "";
    U.el("pr-tag").textContent = "Results";
    U.el("pr-n").textContent = "";
    U.el("pr-dc").textContent = AP.CMAP[run.course].name;
    U.el("pr-score").innerHTML = run.right + "<span> / " + bank.length + "</span>";
    U.el("pr-miss").innerHTML = run.missed.length
      ? '<div class="eyebrow">Worth another look</div>' + run.missed.map(function (q) {
          return '<div class="duerow"><span>' + U.esc(q.t) + " — " + U.esc(q.q) + '</span></div>';
        }).join("")
      : '<div class="why">Clean sweep. Worth re-running in a few weeks to see whether it stuck.</div>';
    window.scrollTo(0, 0);
  }

  function home() {
    U.el("pr-quiz").style.display = "none";
    U.el("pr-home").style.display = "";
    paint();
    window.scrollTo(0, 0);
  }

  function bind() {
    U.el("pr-next").addEventListener("click", advance);
    U.el("pr-back").addEventListener("click", home);
    U.el("pr-again").addEventListener("click", home);
  }

  return { paint: paint, bind: bind };
})();
