/* PortalFinance.com — free financial plan funnel (5 steps, lead scoring, instant next steps) */
(function () {
  "use strict";
  var PF = window.PF, $ = PF.$, $$ = PF.$$;
  var form = $("#planForm"); if (!form) return;
  var steps = $$(".step", form), cur = 0;
  var NAMES = ["Your goal", "Your timeline", "Your finances", "About you", "Your plan"];
  var next = $("#nextBtn"), back = $("#backBtn"), status = $("#planStatus");

  /* prefill from ?goal= and calculator context */
  var q = new URLSearchParams(location.search), g = q.get("goal");
  if (g) { var r = form.querySelector('input[name="goal"][value="' + g.replace(/"/g, "") + '"]'); if (r) r.checked = true; }
  try { var ctx = sessionStorage.getItem("pf-calc"); if (ctx) $("#calcContext").value = ctx; } catch (e) {}

  function show(i) {
    steps.forEach(function (s, k) { s.classList.toggle("active", k === i); });
    cur = i; $("#stepLabel").textContent = "Step " + (i + 1) + " of " + steps.length; $("#stepName").textContent = NAMES[i];
    $("#stepBar").style.width = ((i + 1) / steps.length * 100) + "%";
    back.style.visibility = i ? "visible" : "hidden";
    next.textContent = i === steps.length - 1 ? "Get my free plan" : "Continue";
    status.textContent = ""; status.className = "form-status small";
    var first = steps[i].querySelector("input:not([type=hidden]),select"); if (first && i) first.focus({ preventScroll: true });
  }
  function valid(i) {
    var s = steps[i], ok = true, groups = {};
    $$("input[type=radio][required]", s).forEach(function (r) { groups[r.name] = true; });
    Object.keys(groups).forEach(function (n) { if (!s.querySelector('input[name="' + n + '"]:checked')) ok = false; });
    if (!ok) { status.textContent = "Choose one option to continue."; status.classList.add("err"); return false; }
    var fields = $$("input:not([type=radio]):not([type=hidden]),select", s);
    for (var k = 0; k < fields.length; k++) { if (!fields[k].checkValidity()) { fields[k].reportValidity(); return false; } }
    return true;
  }
  /* auto-advance on single-choice steps */
  form.addEventListener("change", function (e) {
    if (e.target.type === "radio" && (cur === 0 || (cur === 1 && e.target.name === "timeline"))) setTimeout(function () { if (valid(cur)) show(cur + 1); }, 220);
  });
  back.addEventListener("click", function () { if (cur > 0) show(cur - 1); });
  next.addEventListener("click", function () {
    if (!valid(cur)) return;
    if (cur < steps.length - 1) { show(cur + 1); return; }
    submit();
  });
  form.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); next.click(); } });

  function score(d) {
    var s = 0;
    if (/\$100k–\$200k|\$200k\+/.test(d.income)) s += 2;
    if (/\$100k–\$500k/.test(d.assets)) s += 2; if (/\$500k|\$1M/.test(d.assets)) s += 4;
    if (/Right away|Within 3 months/.test(d.timeline)) s += 2;
    if (/Introduce|free call/.test(d.contact_preference)) s += 2;
    if (d.phone) s += 1;
    if (/\$10k–\$50k|\$50k\+/.test(d.debt) && d.goal === "Pay off debt") s += 1;
    return { n: s, label: s >= 7 ? "HOT" : s >= 4 ? "WARM" : "COOL" };
  }
  var R = PF.root;
  var PLAYBOOK = {
    "Retirement planning": [["Capture every dollar of employer match", "It's an instant 50–100% return. Check your plan's match formula this week.", "calculators/retirement.html", "Run the retirement calculator"], ["Find your gap", "Compare projected savings with what you'll need, then set the monthly amount that closes it.", "guides/retirement-planning-by-age.html", "Retirement planning by age"], ["Cut fund fees below 0.25%", "Low-cost index funds can leave you tens of thousands richer at retirement.", "guides/index-funds-and-etfs.html", "Index funds and ETFs explained"]],
    "Pay off debt": [["List every debt with its rate", "Balance, APR and minimum payment, all in one place.", "calculators/debt-payoff.html", "Open the debt payoff calculator"], ["Pick snowball or avalanche", "Avalanche saves the most interest; snowball builds momentum. Both work if you stick to one.", "guides/debt-snowball-vs-avalanche.html", "Compare the two methods"], ["Protect the plan with a starter emergency fund", "One month of essentials stops new debt when something breaks.", "guides/emergency-fund.html", "How big should it be?"]],
    "Buy a home / mortgage": [["Set a payment you can live with", "Aim for total housing costs near 28% of gross income or less.", "calculators/mortgage.html", "Run the mortgage calculator"], ["Know your true budget", "Factor in tax, insurance, PMI, closing costs and repairs.", "guides/how-much-house-can-you-afford.html", "How much house can you afford?"], ["Polish your credit before applying", "A higher score can lower your rate and save thousands.", "guides/how-credit-scores-work.html", "How credit scores work"]],
    "Invest and grow wealth": [["Automate a monthly contribution", "Consistency beats timing. Pick an amount and a date.", "calculators/compound-interest.html", "See what it grows to"], ["Start with broad, low-cost index funds", "Diversified, cheap and easy to hold for decades.", "guides/index-funds-and-etfs.html", "Index funds and ETFs explained"], ["Use tax-advantaged accounts first", "401(k)/IRA, RRSP/TFSA, ISA or PPF/NPS, depending on where you live.", "guides/compound-interest-explained.html", "Why time matters most"]],
    "Insurance and protection": [["Cover your income first", "Term life and disability cover protect the people who depend on your paycheck.", "guides/how-to-choose-a-financial-advisor.html", "Who to ask for help"], ["Build an emergency fund", "Cash covers deductibles and gaps insurance won't.", "guides/emergency-fund.html", "Emergency fund guide"], ["Review your policies once a year", "Life changes such as a home, a baby or a raise change what you need.", "money-checklist.html", "Use the yearly money checklist"]],
    "Taxes": [["Max out tax-advantaged accounts", "Retirement and health savings accounts lower taxable income.", "guides/retirement-planning-by-age.html", "Retirement accounts by age"], ["Hold investments in the right accounts", "Asset location can lift after-tax returns.", "guides/index-funds-and-etfs.html", "Index funds and ETFs"], ["Keep a simple records system", "Receipts and statements in one folder make deductions easy to claim.", "money-checklist.html", "Use the money checklist"]],
    "Business funding": [["Separate business and personal money", "A dedicated account makes lending decisions and taxes simpler.", "guides/how-to-build-a-budget.html", "Budgeting basics"], ["Know the real cost of borrowing", "Compare APR and total cost, not just the monthly payment.", "calculators/loan.html", "Run the loan calculator"], ["Check your personal credit", "Lenders review the owner's credit for most small-business loans.", "guides/how-credit-scores-work.html", "How credit scores work"]],
    "Not sure yet": [["Know where your money goes", "Run your take-home pay through the 50/30/20 split.", "calculators/budget.html", "Open the budget calculator"], ["Build a cushion", "Start with one month of essentials, then grow to three to six.", "guides/emergency-fund.html", "Emergency fund guide"], ["Pick one goal for the next 90 days", "Debt, saving or investing: one focus beats three half-starts.", "money-checklist.html", "Use the money checklist"]]
  };
  function submit() {
    var d = PF.formData(form); var hp = form.querySelector('[name="_honey"]'); if (hp && hp.value) return;
    var sc = score(d); d.lead_score = sc.label + " (" + sc.n + ")";
    next.disabled = true; next.textContent = "Sending…";
    PF.send("[" + sc.label + " LEAD] " + d.goal + ", " + (d.assets || "") + ", " + (d.country || ""), d).then(function () {
      result(d, true);
    }).catch(function () {
      next.disabled = false; next.textContent = "Get my free plan";
      status.className = "form-status small err"; status.innerHTML = 'We couldn\'t send your answers. Check your connection and try again, or <a href="#" data-mail="Free financial plan request">email us</a>.';
    });
  }
  function result(d) {
    var steps = PLAYBOOK[d.goal] || PLAYBOOK["Not sure yet"];
    var html = '<div class="success-card" role="status"><h2 style="font-size:1.6rem">Thanks, ' + PF.esc(d.name || "") + '. Here are your first three moves.</h2><p class="muted">Your written plan for <strong>' + PF.esc(d.goal) + "</strong> is on its way to " + PF.esc(d.email) + ' within one business day. Check your spam folder if it hasn\'t arrived.</p><ol style="padding-left:1.2rem">';
    steps.forEach(function (s) { html += '<li style="margin:.9rem 0"><strong>' + s[0] + ".</strong> " + s[1] + ' <a href="' + R + s[2] + '">' + s[3] + "</a></li>"; });
    html += "</ol>" + (/Introduce|call/.test(d.contact_preference) ? '<p class="small muted">You asked for a call. We\'ll email you to confirm a time before anyone phones you.</p>' : "") + "</div>";
    form.hidden = true; var out = $("#planResult"); out.innerHTML = html; out.hidden = false; out.scrollIntoView({ behavior: "smooth", block: "start" });
    try { sessionStorage.removeItem("pf-calc"); } catch (e) {}
  }
  show(g ? 1 : 0);
})();
