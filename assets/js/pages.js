/* PortalFinance.com — page behaviours: support, contests quiz, careers, advertise */
(function () {
  "use strict";
  var PF = window.PF, $ = PF.$, $$ = PF.$$, CFG = window.PF_CONFIG || {};
  var page = document.body.getAttribute("data-page");
  function reveal(id, focusSel) { var s = $(id); if (!s) return; s.hidden = false; s.scrollIntoView({ behavior: "smooth", block: "start" }); var f = focusSel && s.querySelector(focusSel); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 350); }

  /* ---------- support ---------- */
  if (page === "support") {
    var d = CFG.donate || {}, fmt = new Intl.NumberFormat(undefined, { style: "currency", currency: d.currency || "USD", maximumFractionDigits: 0 });
    var pctRaised = d.goal ? Math.min(100, (d.raised || 0) / d.goal * 100) : 0;
    $("#meter i").style.width = pctRaised + "%"; $("#meter").setAttribute("aria-valuenow", Math.round(pctRaised));
    $("#goalNums").textContent = (d.raised ? fmt.format(d.raised) + " raised of " : "Goal: ") + fmt.format(d.goal || 10000) + (d.raised ? "" : ". Be a founding supporter.");
    $("#tiers").addEventListener("click", function (e) {
      var b = e.target.closest("[data-amount]"); if (!b) return;
      var amt = b.getAttribute("data-amount"); if (amt === "custom") { amt = $("#customAmt").value; if (!amt || +amt < 1) { $("#customAmt").focus(); PF.toast("Enter an amount first"); return; } }
      var monthly = $("#monthly").checked;
      var link = d.stripe || d.paypal || d.buymeacoffee;
      if (link) { window.open(link, "_blank", "noopener"); return; }
      $("#dAmt").value = amt; $("#dFreq").value = monthly ? "Monthly" : "One-time"; reveal("#pledge", "#dName");
    });
  }

  /* ---------- contests ---------- */
  if (page === "contests") {
    var Q = [
      ["Which factor carries the most weight in a FICO credit score?", ["Credit mix", "Payment history", "Length of credit history", "Number of cards"], 1, "Payment history is about 35% of a FICO score, the largest single factor."],
      ["Using the rule of 72, about how long does money take to double at 6% a year?", ["6 years", "8 years", "12 years", "20 years"], 2, "72 ÷ 6 = 12 years."],
      ["Under the 50/30/20 rule, what share of take-home pay goes to savings and extra debt payments?", ["10%", "20%", "30%", "50%"], 1, "20% for savings and extra debt payments; 50% needs, 30% wants."],
      ["Which payoff method always costs the least total interest?", ["Debt snowball", "Debt avalanche", "Paying minimums only", "Paying the newest debt first"], 1, "The avalanche targets the highest rate first, which minimizes interest."],
      ["A typical emergency fund target is how many months of essential expenses?", ["Half a month", "1 month", "3 to 6 months", "24 months"], 2, "Three to six months, more if your income is irregular."],
      ["What is a fund's expense ratio?", ["Its yearly fee as a percentage of your investment", "Its average return", "The share of stocks it holds", "A tax on withdrawals"], 0, "It's the annual cost of owning the fund, taken from your returns."],
      ["Your savings earn 4% while inflation is 5%. Your real return is about:", ["+9%", "+1%", "−1%", "0%"], 2, "Real return ≈ nominal return minus inflation: 4% − 5% = −1%."],
      ["Someone you met online offers to teach you crypto trading on an app they recommend. Best move?", ["Start small to test it", "Send funds once you see gains", "Stop and verify independently; don't send money", "Ask them for a referral bonus"], 2, "This is the classic pattern of relationship investment scams."],
      ["A fiduciary financial advisor must:", ["Guarantee returns", "Act in your best interest", "Only sell their firm's products", "Charge commissions"], 1, "Fiduciaries are obliged to put your interests first."],
      ["On a conventional mortgage, PMI is usually required when the down payment is below:", ["5%", "10%", "20%", "35%"], 2, "Below 20% down, lenders typically require private mortgage insurance."]
    ];
    var qi = 0, score = 0;
    function render() {
      var q = Q[qi]; $("#qNum").textContent = "Question " + (qi + 1) + " of " + Q.length; $("#qScore").textContent = "Score: " + score;
      $("#qBar").style.width = ((qi + 1) / Q.length * 100) + "%"; $("#qText").textContent = q[0]; $("#qExplain").textContent = ""; $("#qNext").hidden = true;
      $("#qOpts").innerHTML = q[1].map(function (o, i) { return '<button type="button" data-i="' + i + '">' + PF.esc(o) + "</button>"; }).join("");
    }
    $("#qOpts").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || $("#qOpts").dataset.done === String(qi)) return; $("#qOpts").dataset.done = String(qi);
      var q = Q[qi], pick = +b.getAttribute("data-i"), btns = $$("#qOpts button");
      btns[q[2]].classList.add("right"); if (pick !== q[2]) b.classList.add("wrong"); else score++;
      btns.forEach(function (x) { x.disabled = true; });
      $("#qExplain").innerHTML = (pick === q[2] ? "<strong>Correct.</strong> " : "<strong>Not quite.</strong> ") + PF.esc(q[3]); $("#qScore").textContent = "Score: " + score;
      $("#qNext").textContent = qi === Q.length - 1 ? "See my result" : "Next question"; $("#qNext").hidden = false; $("#qNext").focus();
    });
    $("#qNext").addEventListener("click", function () {
      if (qi < Q.length - 1) { qi++; render(); return; }
      var pass = score >= 8;
      $("#quizBox").innerHTML = '<h3 style="font-size:1.6rem">You scored ' + score + " out of " + Q.length + ".</h3><p>" + (pass ? "Excellent. You qualify for this month's prize draw below." : "Good effort. Score 8 or more to enter the draw. The <a href=\"guides/\">guides</a> cover every question.") + '</p><button class="btn btn-ghost btn-sm" type="button" onclick="location.reload()">Try again</button>';
      if (pass) { $("#quizScore").value = score + "/10"; reveal("#quizEntry", "#qName"); }
    });
    render();
    $$("[data-enter]").forEach(function (b) { b.addEventListener("click", function () { var n = b.getAttribute("data-enter"); $("#entryName").textContent = n; $("#entryContest").value = n; reveal("#entry", "#eName"); }); });
  }

  /* ---------- careers ---------- */
  if (page === "careers") {
    $$("[data-role]").forEach(function (a) { a.addEventListener("click", function () { $("#aRole").value = a.getAttribute("data-role"); setTimeout(function () { $("#aName").focus({ preventScroll: true }); }, 400); }); });
  }

  /* ---------- advertise ---------- */
  if (page === "advertise") {
    $$("[data-pkg]").forEach(function (b) { b.addEventListener("click", function () { $("#pkg").value = b.getAttribute("data-pkg"); reveal("#inquiry", "#adName"); }); });
  }
})();
