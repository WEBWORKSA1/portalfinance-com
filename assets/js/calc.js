/* PortalFinance.com — calculator engine + SVG charts */
(function () {
  "use strict";
  var PF = window.PF || {}; var $ = PF.$, $$ = PF.$$;
  var kind = document.body.getAttribute("data-calc");
  var form = $("#calcForm"); if (!kind || !form) return;

  /* ---------- formatting ---------- */
  var cur0 = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  var cur2 = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function $0(v) { return isFinite(v) ? cur0.format(v) : "—"; }
  function $2(v) { return isFinite(v) ? cur2.format(v) : "—"; }
  function short(v) { var a = Math.abs(v); if (a >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B"; if (a >= 1e6) return "$" + (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M"; if (a >= 1e3) return "$" + Math.round(v / 1e3) + "k"; return "$" + Math.round(v); }
  function pct(v, d) { return (v * 100).toFixed(d == null ? 1 : d) + "%"; }
  function num(name) { var el = form.elements[name]; if (!el) return 0; var v = parseFloat(String(el.value).replace(/[, $%]/g, "")); return isFinite(v) ? v : 0; }
  function val(name) { var el = form.elements[name]; return el ? el.value : ""; }
  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function monthsLabel(m) { if (!isFinite(m)) return "Never at this payment"; var y = Math.floor(m / 12), r = Math.round(m % 12); return (y ? y + " yr" + (y > 1 ? "s" : "") : "") + (y && r ? " " : "") + (r ? r + " mo" : "") || "0 mo"; }
  function dateAfter(m) { var d = new Date(); d.setMonth(d.getMonth() + Math.round(m)); return d.toLocaleDateString(undefined, { month: "short", year: "numeric" }); }
  function pmt(rateM, n, pv) { return rateM === 0 ? pv / n : pv * rateM / (1 - Math.pow(1 + rateM, -n)); }

  /* ---------- chart ---------- */
  var COLORS = ["var(--c1)", "var(--c2)", "var(--c3)"];
  function lineChart(host, opt) {
    if (!host) return;
    var W = Math.max(300, Math.round(host.clientWidth || 720)), H = W < 520 ? 230 : 300, m = { l: 58, r: 14, t: 14, b: 32 };
    var labels = opt.labels, series = opt.series, n = labels.length; if (n < 2) { host.innerHTML = ""; return; }
    var stacked = !!opt.stacked, maxY = 0;
    for (var i = 0; i < n; i++) { var s = 0; series.forEach(function (se) { var v = Math.max(0, se.values[i] || 0); if (stacked) s += v; else s = Math.max(s, v); }); maxY = Math.max(maxY, s); }
    if (opt.min0 !== false) maxY = maxY * 1.06 || 1;
    var step = niceStep(maxY / 4); maxY = Math.ceil(maxY / step) * step;
    var x = function (i) { return m.l + (i / (n - 1)) * (W - m.l - m.r); };
    var y = function (v) { return H - m.b - (v / maxY) * (H - m.t - m.b); };
    var svg = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + PF.esc(opt.title || "Chart") + '"><g class="grid">';
    for (var g = 0; g <= maxY + 1e-9; g += step) svg += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(g) + '" y2="' + y(g) + '"/><text x="' + (m.l - 8) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + short(g) + "</text>";
    svg += "</g>";
    var every = Math.max(1, Math.ceil(n / (W < 520 ? 4 : 8)));
    for (var j = 0; j < n; j += every) svg += '<text x="' + x(j) + '" y="' + (H - 10) + '" text-anchor="middle">' + PF.esc(labels[j]) + "</text>";
    var base = new Array(n).fill(0);
    series.forEach(function (se, k) {
      var col = se.color || COLORS[k % 3], pts = [], lower = [];
      for (var i2 = 0; i2 < n; i2++) { var v = Math.max(0, se.values[i2] || 0); var top = stacked ? base[i2] + v : v; pts.push(x(i2).toFixed(1) + "," + y(top).toFixed(1)); lower.push(x(i2).toFixed(1) + "," + y(stacked ? base[i2] : 0).toFixed(1)); if (stacked) base[i2] = top; }
      if (stacked || se.area) svg += '<polygon points="' + pts.join(" ") + " " + lower.reverse().join(" ") + '" fill="' + col + '" fill-opacity="' + (stacked ? .55 : .14) + '"/>';
      svg += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"' + (se.dash ? ' stroke-dasharray="6 5"' : "") + "/>";
    });
    svg += '<line class="xh" x1="0" x2="0" y1="' + m.t + '" y2="' + (H - m.b) + '" stroke="var(--muted)" stroke-width="1" opacity="0"/><g class="dots"></g><rect class="hit" x="' + m.l + '" y="' + m.t + '" width="' + (W - m.l - m.r) + '" height="' + (H - m.t - m.b) + '" fill="transparent"/></svg>';
    var legend = series.length > 1 ? '<div class="legend-row">' + series.map(function (se, k) { return '<span><i style="background:' + (se.color || COLORS[k % 3]) + '"></i>' + PF.esc(se.name) + "</span>"; }).join("") + "</div>" : "";
    host.innerHTML = legend + '<div class="chart-wrap">' + svg + '<div class="chart-tip"></div></div>';
    var el = host.querySelector("svg"), tip = host.querySelector(".chart-tip"), xh = el.querySelector(".xh"), dots = el.querySelector(".dots");
    function move(ev) {
      var r = el.getBoundingClientRect(); var px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) / r.width * W;
      var i = Math.round((px - m.l) / (W - m.l - m.r) * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
      xh.setAttribute("x1", x(i)); xh.setAttribute("x2", x(i)); xh.setAttribute("opacity", ".6");
      var acc = 0, d = "", rows = "";
      series.forEach(function (se, k) { var v = Math.max(0, se.values[i] || 0); acc = stacked ? acc + v : v; d += '<circle cx="' + x(i) + '" cy="' + y(acc) + '" r="4.5" fill="' + (se.color || COLORS[k % 3]) + '" stroke="var(--surface)" stroke-width="2"/>'; rows += "<br>" + PF.esc(se.name) + ": " + $0(se.values[i]); });
      dots.innerHTML = d;
      tip.innerHTML = "<strong>" + PF.esc(opt.xName ? opt.xName + " " + labels[i] : labels[i]) + "</strong>" + rows;
      tip.style.left = (x(i) / W * r.width) + "px"; tip.style.top = (m.t / H * r.height + 6) + "px"; tip.style.opacity = 1;
    }
    function leave() { tip.style.opacity = 0; xh.setAttribute("opacity", "0"); dots.innerHTML = ""; }
    var hit = el.querySelector(".hit"); hit.addEventListener("mousemove", move); hit.addEventListener("touchmove", move, { passive: true }); hit.addEventListener("mouseleave", leave); hit.addEventListener("touchend", leave);
  }
  function niceStep(raw) { if (raw <= 0) return 1; var p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
  PF.lineChart = lineChart;
  function stackbar(id, parts) {
    var total = parts.reduce(function (a, p) { return a + Math.max(0, p.v); }, 0) || 1;
    set(id, '<div class="stackbar" role="img" aria-label="' + parts.map(function (p) { return p.name + " " + Math.round(p.v / total * 100) + "%"; }).join(", ") + '">' + parts.filter(function (p) { return p.v > 0; }).map(function (p, i) { return '<span style="width:' + (p.v / total * 100) + "%;background:" + (p.color || COLORS[i % 3]) + '" title="' + PF.esc(p.name) + '"></span>'; }).join("") + '</div><div class="legend-row">' + parts.map(function (p, i) { return '<span><i style="background:' + (p.color || COLORS[i % 3]) + '"></i>' + PF.esc(p.name) + " " + $0(p.v) + "</span>"; }).join("") + "</div>");
  }
  function table(id, head, rows) {
    set(id, '<div class="table-wrap"><table><thead><tr>' + head.map(function (h) { return "<th scope='col'>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>");
  }

  /* ---------- calculators ---------- */
  var C = {};

  C.mortgage = function () {
    var price = num("price"), downPct = num("downPct") / 100, rate = num("rate") / 100, years = num("years") || 30;
    var taxPct = num("tax") / 100, ins = num("insurance"), hoa = num("hoa"), pmiPct = num("pmi") / 100, extra = num("extra");
    var down = price * downPct, loan = Math.max(0, price - down), n = years * 12, r = rate / 12;
    var pi = loan > 0 ? pmt(r, n, loan) : 0, tax = price * taxPct / 12, insM = ins / 12, pmi = downPct < .2 ? loan * pmiPct / 12 : 0;
    var total = pi + tax + insM + pmi + hoa;
    function amort(extraPay) { var b = loan, months = 0, int = 0, yearly = [], yb = [loan], yi = 0, yp = 0, cumInt = [0]; while (b > .005 && months < 1200) { var i = b * r, p = Math.min(b, pi + extraPay - i); if (p <= 0) { months = Infinity; break; } b -= p; int += i; yi += i; yp += p; months++; if (months % 12 === 0 || b <= .005) { yearly.push([Math.ceil(months / 12), yp, yi, Math.max(0, b)]); yb.push(Math.max(0, b)); cumInt.push(int); yi = 0; yp = 0; } } return { months: months, interest: int, yearly: yearly, yb: yb, cumInt: cumInt }; }
    var base = amort(0), ex = extra > 0 ? amort(extra) : null;
    set("rTotal", $2(total)); set("rPI", $2(pi)); set("rLoan", $0(loan) + ' <span class="small muted">(' + $0(down) + " down)</span>");
    set("rInterest", $0(base.interest)); set("rPayoff", dateAfter((ex || base).months));
    set("rSaved", ex ? $0(base.interest - ex.interest) + ' <span class="small muted">and ' + monthsLabel(base.months - ex.months) + " sooner</span>" : '<span class="muted">Add an extra payment to see savings</span>');
    stackbar("rBreak", [{ name: "Principal & interest", v: pi }, { name: "Property tax", v: tax }, { name: "Insurance, PMI & HOA", v: insM + pmi + hoa }]);
    var labels = base.yb.map(function (_, i) { return "Yr " + i; });
    var ser = [{ name: "Balance", values: base.yb }, { name: "Interest paid to date", values: base.cumInt }];
    if (ex) { var eb = ex.yb.slice(); while (eb.length < labels.length) eb.push(0); ser.push({ name: "Balance with extra payment", values: eb, dash: true }); }
    lineChart($("#chart"), { title: "Mortgage balance over time", labels: labels, series: ser });
    table("schedule", ["Year", "Principal", "Interest", "Ending balance"], (ex || base).yearly.map(function (y) { return [y[0], $0(y[1]), $0(y[2]), $0(y[3])]; }));
    return "My mortgage estimate: " + $2(total) + "/month on a " + $0(price) + " home.";
  };

  C.loan = function () {
    var amt = num("amount"), rate = num("rate") / 100, months = num("term") * (val("termUnit") === "years" ? 12 : 1), extra = num("extra");
    var r = rate / 12, pay = pmt(r, months, amt), b = amt, k = 0, int = 0, bal = [amt], rows = [], yi = 0, yp = 0;
    while (b > .005 && k < 1200) { var i = b * r, p = Math.min(b, pay + extra - i); b -= p; int += i; yi += i; yp += p; k++; if (k % 12 === 0 || b <= .005) { bal.push(Math.max(0, b)); rows.push([Math.ceil(k / 12), $0(yp), $0(yi), $0(Math.max(0, b))]); yi = 0; yp = 0; } }
    set("rPay", $2(pay + extra)); set("rInterest", $0(int)); set("rTotal", $0(amt + int)); set("rPayoff", monthsLabel(k) + ' <span class="small muted">(' + dateAfter(k) + ")</span>");
    stackbar("rBreak", [{ name: "Principal", v: amt }, { name: "Interest", v: int }]);
    lineChart($("#chart"), { title: "Loan balance", labels: bal.map(function (_, i) { return "Yr " + i; }), series: [{ name: "Balance", values: bal, area: true }] });
    table("schedule", ["Year", "Principal", "Interest", "Ending balance"], rows);
    return "Loan payment: " + $2(pay + extra) + "/month, total interest " + $0(int) + ".";
  };

  C.compound = function () {
    var P = num("initial"), PMT = num("monthly"), rate = num("rate") / 100, years = Math.min(80, num("years")), f = +val("freq") || 12, grow = num("raise") / 100;
    var bal = P, contrib = P, labels = ["Now"], cs = [P], gs = [0], rows = [], monthlyRate = Math.pow(1 + rate / f, f / 12) - 1, dep = PMT;
    for (var yr = 1; yr <= years; yr++) {
      for (var mo = 0; mo < 12; mo++) { bal = bal * (1 + monthlyRate) + dep; contrib += dep; }
      labels.push("Yr " + yr); cs.push(contrib); gs.push(Math.max(0, bal - contrib)); rows.push([yr, $0(contrib), $0(bal - contrib), $0(bal)]); dep *= 1 + grow;
    }
    set("rFinal", $0(bal)); set("rContrib", $0(contrib)); set("rGrowth", $0(bal - contrib)); set("rMult", (contrib > 0 ? (bal / contrib).toFixed(2) + "×" : "—"));
    lineChart($("#chart"), { title: "Growth of your money", labels: labels, stacked: true, series: [{ name: "Your contributions", values: cs }, { name: "Interest earned", values: gs }] });
    table("schedule", ["Year", "Total contributed", "Total interest", "Balance"], rows);
    return "With compound interest my money grows to " + $0(bal) + " in " + years + " years.";
  };

  C.retirement = function () {
    var age = num("age"), ret = num("retireAge"), life = num("lifeAge"), sav = num("savings"), mon = num("monthly"), rPre = num("returnPre") / 100, rPost = num("returnPost") / 100, need = num("income"), infl = num("inflation") / 100, other = num("other");
    var yrsTo = Math.max(0, ret - age), yrsIn = Math.max(1, life - ret);
    var needAtRet = Math.max(0, need - other) * Math.pow(1 + infl, yrsTo);
    var realPost = (1 + rPost) / (1 + infl) - 1;
    var required = realPost === 0 ? needAtRet * yrsIn : needAtRet * (1 - Math.pow(1 + realPost, -yrsIn)) / realPost * (1 + realPost);
    var b = sav, labels = [], vals = [], req = [], mr = Math.pow(1 + rPre, 1 / 12) - 1;
    for (var a = age; a <= life; a++) {
      labels.push(String(a)); vals.push(Math.max(0, b)); req.push(required);
      if (a < ret) { for (var k = 0; k < 12; k++) b = b * (1 + mr) + mon; }
      else { var draw = Math.max(0, need - other) * Math.pow(1 + infl, a - age); b = b * (1 + rPost) - draw; }
    }
    var proj = vals[Math.min(vals.length - 1, yrsTo)];
    var gap = required - proj, fvf = mr === 0 ? yrsTo * 12 : (Math.pow(1 + mr, yrsTo * 12) - 1) / mr, extraNeeded = gap > 0 && fvf > 0 ? gap / fvf : 0;
    var runOut = labels[vals.findIndex(function (v, i) { return i > yrsTo && v <= 0; })];
    set("rProj", $0(proj)); set("rReq", $0(required)); set("rGap", gap > 0 ? '<span class="down">' + $0(gap) + " short</span>" : '<span class="up">' + $0(-gap) + " ahead</span>");
    set("rExtra", gap > 0 ? $0(extraNeeded) + '<span class="small muted"> more per month</span>' : '<span class="up">On track</span>');
    set("rLast", runOut ? "Money runs out around age " + runOut : "Savings last past age " + life);
    lineChart($("#chart"), { title: "Projected retirement savings by age", xName: "Age", labels: labels, series: [{ name: "Projected savings", values: vals, area: true }, { name: "Needed at retirement", values: req, dash: true }] });
    return "My retirement projection: " + $0(proj) + " at " + ret + " vs " + $0(required) + " needed.";
  };

  /* debt payoff */
  function readDebts() {
    return $$(".debt-row").map(function (row) {
      return { name: row.querySelector("[data-f=name]").value || "Debt", bal: parseFloat(row.querySelector("[data-f=bal]").value) || 0, apr: (parseFloat(row.querySelector("[data-f=apr]").value) || 0) / 100, min: parseFloat(row.querySelector("[data-f=min]").value) || 0 };
    }).filter(function (d) { return d.bal > 0; });
  }
  function simulate(debts, extra, order) {
    var ds = debts.map(function (d) { return Object.assign({}, d); }), months = 0, int = 0, hist = [ds.reduce(function (a, d) { return a + d.bal; }, 0)], paidOff = [];
    var budget = ds.reduce(function (a, d) { return a + d.min; }, 0) + extra;
    while (ds.some(function (d) { return d.bal > .005; }) && months < 600) {
      ds.forEach(function (d) { if (d.bal > 0) { var i = d.bal * d.apr / 12; d.bal += i; int += i; } });
      var left = budget;
      ds.forEach(function (d) { if (d.bal > 0) { var p = Math.min(d.bal, d.min); d.bal -= p; left -= p; } });
      var active = ds.filter(function (d) { return d.bal > .005; }).sort(order);
      for (var k = 0; k < active.length && left > .005; k++) { var p2 = Math.min(active[k].bal, left); active[k].bal -= p2; left -= p2; }
      months++;
      ds.forEach(function (d) { if (d.bal <= .005 && !d.done) { d.done = true; d.bal = 0; paidOff.push(d.name + " (" + monthsLabel(months) + ")"); } });
      hist.push(ds.reduce(function (a, d) { return a + Math.max(0, d.bal); }, 0));
    }
    return { months: months >= 600 ? Infinity : months, interest: int, hist: hist, order: paidOff };
  }
  C.debt = function () {
    var debts = readDebts(), extra = num("extra");
    if (!debts.length) { set("rSnow", "—"); set("rAva", "—"); return ""; }
    var snow = simulate(debts, extra, function (a, b) { return a.bal - b.bal; });
    var ava = simulate(debts, extra, function (a, b) { return b.apr - a.apr; });
    var min = simulate(debts, 0, function (a, b) { return b.apr - a.apr; });
    set("rSnow", monthsLabel(snow.months) + '<span class="small muted"><br>' + $0(snow.interest) + " interest</span>");
    set("rAva", monthsLabel(ava.months) + '<span class="small muted"><br>' + $0(ava.interest) + " interest</span>");
    set("rMin", monthsLabel(min.months) + '<span class="small muted"><br>' + $0(min.interest) + " interest</span>");
    var best = ava.interest <= snow.interest ? "Avalanche" : "Snowball", diff = Math.abs(snow.interest - ava.interest);
    var saveVsMin = $0(Math.max(0, min.interest - Math.min(ava.interest, snow.interest)));
    set("rBest", (diff < 1 ? "Either method: same result here" : best + " saves " + $0(diff)) + ' <span class="small muted">' + (diff < 1 ? "Your smallest debt also has the highest rate. " : "") + "Your extra payment saves " + saveVsMin + " in interest vs paying minimums only.</span>");
    set("rOrderSnow", snow.order.map(function (o) { return "<li>" + PF.esc(o) + "</li>"; }).join(""));
    set("rOrderAva", ava.order.map(function (o) { return "<li>" + PF.esc(o) + "</li>"; }).join(""));
    var len = Math.max(snow.hist.length, ava.hist.length), labels = [], s = [], a = [];
    for (var i = 0; i < len; i++) { labels.push("Mo " + i); s.push(snow.hist[i] || 0); a.push(ava.hist[i] || 0); }
    lineChart($("#chart"), { title: "Total debt balance by month", labels: labels, series: [{ name: "Snowball", values: s }, { name: "Avalanche", values: a, dash: true }] });
    return "Debt-free in " + monthsLabel(Math.min(snow.months, ava.months)) + " with the " + best.toLowerCase() + " method.";
  };

  C.budget = function () {
    var inc = num("income"), needs = num("needs"), wants = num("wants"), save = num("save");
    set("rNeeds", $0(inc * .5)); set("rWants", $0(inc * .3)); set("rSave", $0(inc * .2));
    stackbar("rTarget", [{ name: "Needs 50%", v: inc * .5 }, { name: "Wants 30%", v: inc * .3 }, { name: "Savings & debt 20%", v: inc * .2 }]);
    var actual = needs + wants + save, msgs = [];
    if (actual > 0) {
      stackbar("rActual", [{ name: "Your needs", v: needs }, { name: "Your wants", v: wants }, { name: "Your savings & debt", v: save }]);
      if (needs > inc * .5) msgs.push("Needs run " + $0(needs - inc * .5) + " over target. Housing and transport are usually the biggest levers.");
      if (wants > inc * .3) msgs.push("Wants are " + $0(wants - inc * .3) + " above 30%. Trim subscriptions and dining first.");
      if (save < inc * .2) msgs.push("Savings fall " + $0(inc * .2 - save) + " short of 20%. Automate a transfer on payday.");
      if (actual > inc) msgs.push("You're spending " + $0(actual - inc) + " more than you earn each month.");
      if (!msgs.length) msgs.push("Your budget meets the 50/30/20 targets.");
      set("rAdvice", msgs.map(function (m) { return "<li>" + m + "</li>"; }).join(""));
    }
    return "50/30/20 budget on " + $0(inc) + "/month: needs " + $0(inc * .5) + ", wants " + $0(inc * .3) + ", savings " + $0(inc * .2) + ".";
  };

  C.savings = function () {
    var goal = num("goal"), cur = num("current"), rate = num("rate") / 100, years = num("years"), mon = num("monthly"), r = Math.pow(1 + rate, 1 / 12) - 1, n = Math.round(years * 12);
    var fvCur = cur * Math.pow(1 + r, n), need = goal - fvCur, monthlyNeeded = need <= 0 ? 0 : (r === 0 ? need / n : need * r / (Math.pow(1 + r, n) - 1));
    var b = cur, k = 0; while (b < goal && k < 1200) { b = b * (1 + r) + mon; k++; }
    set("rNeeded", $2(monthlyNeeded)); set("rTime", k >= 1200 ? "Over 100 years" : monthsLabel(k) + ' <span class="small muted">(' + dateAfter(k) + ")</span>");
    var labels = [], v = [], g = [], bb = cur; for (var i = 0; i <= n; i++) { if (i % 12 === 0 || i === n) { labels.push(i % 12 === 0 ? "Yr " + i / 12 : "End"); v.push(bb); g.push(goal); } bb = bb * (1 + r) + monthlyNeeded; }
    lineChart($("#chart"), { title: "Path to your goal", labels: labels, series: [{ name: "Savings balance", values: v, area: true }, { name: "Goal", values: g, dash: true }] });
    return "To reach " + $0(goal) + " in " + years + " years I need to save " + $2(monthlyNeeded) + "/month.";
  };

  C.inflation = function () {
    var amt = num("amount"), rate = num("rate") / 100, years = Math.min(100, num("years")), fut = amt * Math.pow(1 + rate, years), pp = amt / Math.pow(1 + rate, years);
    set("rFuture", $0(fut)); set("rPower", $0(pp)); set("rLoss", pct(1 - pp / amt)); set("rRule", rate > 0 ? (Math.log(2) / Math.log(1 + rate)).toFixed(1) + " years" : "Never");
    var labels = [], a = [], b = []; for (var y = 0; y <= years; y++) { labels.push("Yr " + y); a.push(amt / Math.pow(1 + rate, y)); b.push(amt * Math.pow(1 + rate, y)); }
    lineChart($("#chart"), { title: "Inflation impact", labels: labels, series: [{ name: "Cost of the same goods", values: b }, { name: "Purchasing power of today's amount", values: a, area: true }] });
    return "At " + pct(rate) + " inflation, " + $0(amt) + " today costs " + $0(fut) + " in " + years + " years.";
  };

  C.fire = function () {
    var exp = num("expenses"), wr = num("withdraw") / 100 || .04, port = num("portfolio"), save = num("saving"), ret = num("return") / 100, age = num("age");
    var target = exp / wr, b = port, y = 0, labels = ["Now"], vals = [port], t = [target];
    while (b < target && y < 70) { b = b * (1 + ret) + save; y++; labels.push(String(age + y)); vals.push(b); t.push(target); }
    if (b >= target) { for (var e = 0; e < 5; e++) { b = b * (1 + ret) + save; y++; labels.push(String(age + y)); vals.push(b); t.push(target); } }
    var yearsTo = vals.findIndex(function (v) { return v >= target; });
    var coast = target / Math.pow(1 + ret, Math.max(0, 65 - age));
    set("rTarget", $0(target)); set("rYears", yearsTo < 0 ? "70+ years" : yearsTo + " years"); set("rAge", yearsTo < 0 ? "—" : "Age " + (age + yearsTo)); set("rCoast", $0(coast) + ' <span class="small muted">' + (port >= coast ? "reached" : $0(coast - port) + " to go") + "</span>");
    lineChart($("#chart"), { title: "Path to financial independence", xName: "Age", labels: labels, series: [{ name: "Portfolio", values: vals, area: true }, { name: "FIRE number", values: t, dash: true }] });
    return "My FIRE number is " + $0(target) + "; I could reach it in " + (yearsTo < 0 ? "70+" : yearsTo) + " years.";
  };

  /* currency (live ECB reference rates via Frankfurter) */
  var fxRates = null, fxBase = null, fxDate = "";
  C.currency = function () {
    var amt = num("amount"), from = val("from"), to = val("to");
    function render() {
      if (!fxRates || fxBase !== from) return;
      var rate = from === to ? 1 : fxRates[to];
      set("rOut", rate ? (amt * rate).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + to : "—");
      set("rRate", rate ? "1 " + from + " = " + rate.toFixed(4) + " " + to + '<span class="small muted"> · ECB reference rate, ' + fxDate + "</span>" : "");
      var pop = ["USD", "EUR", "GBP", "CAD", "INR", "JPY", "AUD", "CHF", "CNY", "LKR", "AED", "SGD"].filter(function (c) { return c !== from && (fxRates[c] || c === from); });
      table("schedule", ["Currency", amt.toLocaleString() + " " + from + " buys", "Rate"], pop.filter(function (c) { return fxRates[c]; }).map(function (c) { return [c, (amt * fxRates[c]).toLocaleString(undefined, { maximumFractionDigits: 2 }), fxRates[c].toFixed(4)]; }));
    }
    if (fxBase !== from) {
      set("rOut", "Loading…");
      fetch("https://api.frankfurter.dev/v1/latest?base=" + from).then(function (r) { return r.json(); }).then(function (d) { fxRates = d.rates; fxBase = from; fxDate = d.date; render(); history30(from, to); })
        .catch(function () { set("rOut", "Rates unavailable"); set("rRate", "The rates service didn't respond. Try again in a minute."); });
    } else { render(); history30(from, to); }
    return amt + " " + from + " in " + to;
  };
  var lastHist = "";
  function history30(from, to) {
    if (from === to) { set("chart", ""); return; }
    var key = from + to; if (key === lastHist) return; lastHist = key;
    var d = new Date(); d.setDate(d.getDate() - 45); var start = d.toISOString().slice(0, 10);
    fetch("https://api.frankfurter.dev/v1/" + start + "..?base=" + from + "&symbols=" + to).then(function (r) { return r.json(); }).then(function (j) {
      var keys = Object.keys(j.rates || {}).sort(); if (keys.length < 2) return;
      var vals = keys.map(function (k) { return j.rates[k][to]; }), mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
      var W = Math.max(300, Math.round(($("#chart") || {}).clientWidth || 720)), H = 240, l = 64, r = 12, t = 12, b = 30, sx = function (i) { return l + i / (keys.length - 1) * (W - l - r); }, sy = function (v) { return H - b - (v - mn) / ((mx - mn) || 1) * (H - t - b); };
      var pts = vals.map(function (v, i) { return sx(i).toFixed(1) + "," + sy(v).toFixed(1); }).join(" ");
      var lab = "";
      [mn, (mn + mx) / 2, mx].forEach(function (v) { lab += '<line x1="' + l + '" x2="' + (W - r) + '" y1="' + sy(v) + '" y2="' + sy(v) + '" stroke="var(--line)"/><text x="' + (l - 6) + '" y="' + (sy(v) + 4) + '" text-anchor="end">' + v.toFixed(4) + "</text>"; });
      [0, Math.floor(keys.length / 2), keys.length - 1].forEach(function (i) { lab += '<text x="' + sx(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + keys[i].slice(5) + "</text>"; });
      set("chart", '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + from + " to " + to + ' over the last 45 days">' + lab + '<polyline points="' + pts + '" fill="none" stroke="var(--c1)" stroke-width="2"/></svg>');
    }).catch(function () {});
  }

  /* ---------- wiring ---------- */
  var KEY = { mortgage: "mortgage", loan: "loan", compound: "compound", retirement: "retirement", debt: "debt", budget: "budget", savings: "savings", inflation: "inflation", fire: "fire", currency: "currency" }[kind];
  var summary = "";
  function run() { try { summary = C[KEY]() || summary; } catch (e) { if (window.console) console.error(e); } saveState(); }
  function saveState() {
    var p = new URLSearchParams(); $$("input[name],select[name]", form).forEach(function (el) { if (el.type === "checkbox" ? el.checked : el.value !== "") p.set(el.name, el.type === "checkbox" ? "1" : el.value); });
    if (kind === "debt") { p.set("debts", JSON.stringify(readDebts().map(function (d) { return [d.name, d.bal, +(d.apr * 100).toFixed(2), d.min]; }))); }
    try { history.replaceState(null, "", "?" + p.toString()); } catch (e) {}
  }
  function loadState() {
    var p = new URLSearchParams(location.search);
    p.forEach(function (v, k) { var el = form.elements[k]; if (el && el.tagName) { if (el.type === "checkbox") el.checked = v === "1"; else el.value = v; } });
    if (kind === "debt" && p.get("debts")) { try { var arr = JSON.parse(p.get("debts")); if (arr.length) { $("#debtList").innerHTML = ""; arr.forEach(function (d) { addDebt(d[0], d[1], d[2], d[3]); }); } } catch (e) {} }
  }
  function addDebt(name, bal, apr, min) {
    var list = $("#debtList"), idx = list.children.length + 1, row = document.createElement("div"); row.className = "debt-row";
    row.innerHTML = '<div class="field"><label>Name</label><input type="text" data-f="name" value="' + PF.esc(name || "Debt " + idx) + '"></div><div class="field"><label>Balance ($)</label><input type="number" min="0" step="1" data-f="bal" value="' + (bal || 0) + '"></div><div class="field"><label>APR %</label><input type="number" min="0" step=".01" data-f="apr" value="' + (apr || 0) + '"></div><div class="field"><label>Min. payment ($)</label><input type="number" min="0" step="1" data-f="min" value="' + (min || 0) + '"></div><button class="icon-btn" type="button" aria-label="Remove this debt" data-remove>&times;</button>';
    list.appendChild(row);
  }
  if (kind === "debt") {
    $("#addDebt").addEventListener("click", function () { addDebt(); run(); });
    $("#debtList").addEventListener("click", function (e) { if (e.target.closest("[data-remove]")) { e.target.closest(".debt-row").remove(); run(); } });
    $("#debtList").addEventListener("input", run);
  }
  if (kind === "currency") {
    var sw = $("#swap"); if (sw) sw.addEventListener("click", function () { var f = form.elements.from.value; form.elements.from.value = form.elements.to.value; form.elements.to.value = f; run(); });
  }
  /* range <-> number sync */
  $$("[data-sync]", form).forEach(function (rng) { var other = form.elements[rng.getAttribute("data-sync")]; if (!other) return; rng.value = other.value; rng.addEventListener("input", function () { other.value = rng.value; run(); }); other.addEventListener("input", function () { rng.value = other.value; }); });
  loadState(); form.addEventListener("input", run); form.addEventListener("change", run); form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  document.addEventListener("pf:theme", run);
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { if (kind === "currency") lastHist = ""; run(); }, 200); });
  var share = $("#shareResult"); if (share) share.addEventListener("click", function () { var t = summary + " " + location.href; (navigator.share ? navigator.share({ title: document.title, text: summary, url: location.href }) : navigator.clipboard.writeText(t).then(function () { PF.toast("Result link copied"); })).catch(function () {}); });
  /* pass calculator context into the lead CTA */
  $$("[data-plan-link]").forEach(function (a) { a.addEventListener("click", function () { try { sessionStorage.setItem("pf-calc", kind + ": " + summary); } catch (e) {} }); });
  run();
})();
