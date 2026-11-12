/* PortalFinance.com — shared site behaviour */
(function () {
  "use strict";
  var CFG = window.PF_CONFIG || {};
  var scriptEl = document.currentScript;
  var ROOT = scriptEl ? scriptEl.getAttribute("src").replace(/assets\/js\/site\.js.*$/, "") : "";
  var PAGE = document.body.getAttribute("data-page") || "";
  var PF = (window.PF = window.PF || {});
  PF.root = ROOT;

  /* ---------- helpers ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  PF.$ = $; PF.$$ = $$; PF.esc = esc; PF.store = store;
  PF.toast = function (msg) {
    var t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2600);
  };
  /* Contact address: decoded only at use time, never inserted into the DOM. */
  function addr() { var k = CFG._k || []; var s = ""; for (var i = k.length - 1; i >= 0; i--) s += String.fromCharCode(k[i] - 7); return s; }
  PF.openMail = function (subject, body) {
    var u = "mailto:" + addr() + "?subject=" + encodeURIComponent(subject || "PortalFinance.com inquiry");
    if (body) u += "&body=" + encodeURIComponent(body);
    window.location.href = u;
  };

  /* ---------- icons ---------- */
  var IC = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'
  };
  PF.logo = '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.1"><ellipse cx="20" cy="20" rx="17" ry="9" transform="rotate(0 20 20)" stroke="var(--green)"/><ellipse cx="20" cy="20" rx="17" ry="9" transform="rotate(60 20 20)" stroke="var(--green)"/><ellipse cx="20" cy="20" rx="17" ry="9" transform="rotate(120 20 20)" stroke="var(--gold)"/></g><circle cx="20" cy="20" r="5.2" fill="var(--ink)"/></svg>';

  /* ---------- theme ---------- */
  function applyTheme(t) { document.documentElement.setAttribute("data-theme", t); var b = $("#themeBtn"); if (b) { b.innerHTML = t === "dark" ? IC.sun : IC.moon; b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme"); } }
  PF.theme = function () { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; };

  /* ---------- header ---------- */
  var NAV = [
    ["calculators", "calculators/", "Calculators"], ["markets", "markets.html", "Markets"], ["guides", "guides/", "Guides"],
    ["videos", "videos.html", "Videos"], ["news", "news.html", "News"], ["contests", "contests.html", "Contests"], ["support", "support.html", "Support us"]
  ];
  function header() {
    var h = $(".site-header"); if (!h) return;
    var links = NAV.map(function (n) { return '<a href="' + ROOT + n[1] + '"' + (PAGE === n[0] ? ' aria-current="page"' : "") + ">" + n[2] + "</a>"; }).join("");
    h.innerHTML = '<div class="wrap header-row"><a class="brand" href="' + ROOT + 'index.html" aria-label="PortalFinance home">' + PF.logo + '<span>Portal<b>Finance</b></span></a>' +
      '<nav class="nav" id="mainNav" aria-label="Main">' + links + '<a class="nav-cta" href="' + ROOT + 'free-plan.html"' + (PAGE === "plan" ? ' aria-current="page"' : "") + '>Get a free plan</a></nav>' +
      '<button class="icon-btn" id="searchBtn" type="button" aria-label="Search the site (Ctrl K)">' + IC.search + '</button>' +
      '<button class="icon-btn" id="themeBtn" type="button"></button>' +
      '<button class="icon-btn menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav">' + IC.menu + "</button></div>";
    applyTheme(PF.theme());
    $("#themeBtn").addEventListener("click", function () { var t = PF.theme() === "dark" ? "light" : "dark"; store("pf-theme", t); applyTheme(t); document.dispatchEvent(new CustomEvent("pf:theme", { detail: t })); });
    var mb = $("#menuBtn"), nav = $("#mainNav");
    mb.addEventListener("click", function () { var o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); mb.innerHTML = o ? IC.close : IC.menu; });
    $("#searchBtn").addEventListener("click", openSearch);
  }

  /* ---------- footer ---------- */
  function footer() {
    var f = $(".site-footer"); if (!f) return;
    var y = new Date().getFullYear();
    function col(t, items) { return "<div><h4>" + t + "</h4><ul>" + items.map(function (i) { return '<li><a href="' + ROOT + i[0] + '">' + i[1] + "</a></li>"; }).join("") + "</ul></div>"; }
    f.innerHTML = '<div class="wrap"><div class="foot-grid"><div><a class="brand" href="' + ROOT + 'index.html">' + PF.logo + '<span>Portal<b>Finance</b></span></a>' +
      '<p class="muted" style="margin-top:.8rem;max-width:34ch">Free calculators, live markets and plain-English guides for the money decisions that matter.</p>' +
      '<form class="newsletter-mini" data-pf-form="Newsletter signup" data-inline-ok="You\'re on the list. Watch for The Portal Brief.">' +
      '<label class="sr-only" for="nlFoot">Email address</label><input id="nlFoot" type="email" name="email" placeholder="Your email" required autocomplete="email">' +
      '<input type="hidden" name="list" value="' + esc(CFG.newsletterName || "Newsletter") + '"><button class="btn btn-primary btn-sm" type="submit">Subscribe</button></form>' +
      '<p class="form-status small" aria-live="polite"></p></div>' +
      col("Calculators", [["calculators/mortgage.html", "Mortgage"], ["calculators/compound-interest.html", "Compound interest"], ["calculators/retirement.html", "Retirement"], ["calculators/debt-payoff.html", "Debt payoff"], ["calculators/currency.html", "Currency converter"], ["calculators/", "All calculators"]]) +
      col("Learn", [["guides/", "Guides"], ["glossary.html", "Glossary"], ["videos.html", "Videos"], ["markets.html", "Markets"], ["news.html", "News"], ["money-checklist.html", "Money checklist"]]) +
      col("Get involved", [["free-plan.html", "Free financial plan"], ["support.html", "Support us"], ["contests.html", "Contests & prizes"], ["careers.html", "Careers"], ["advertise.html", "Advertise & partner"]]) +
      col("Company", [["about.html", "About & editorial policy"], ["contact.html", "Contact"], ["privacy.html", "Privacy & cookies"], ["terms.html", "Terms of use"], ["disclaimer.html", "Disclaimers"], ["sitemap.xml", "Sitemap"]]) +
      '</div><div class="foot-legal"><p><strong>Not financial advice.</strong> PortalFinance.com publishes general education and tools. Nothing here is personalised investment, tax, legal or credit advice; talk to a licensed professional before acting. Market data may be delayed.</p>' +
      '<p><strong>Advertiser disclosure.</strong> We earn money from display advertising (Google AdSense), sponsorships and, where stated, referral partnerships. Compensation never changes calculator math or a guide\'s conclusions. <a href="' + ROOT + 'disclaimer.html#advertiser">How we make money</a>.</p>' +
      '<p><strong>Trademark &amp; copyright.</strong> &copy; ' + y + ' PortalFinance.com. All rights reserved. PortalFinance.com is an independent publisher and is not affiliated with, endorsed by or sponsored by any bank, lender, broker, government agency, or any company, product or crypto protocol that uses the word &ldquo;Portal&rdquo; in its name. Third-party names, logos, market data and videos belong to their respective owners and are used for identification or under their embed terms. <a href="' + ROOT + 'disclaimer.html#trademark">Full disclosure</a>.</p>' +
      '<p>Data refreshed: <span data-updated>daily</span> &middot; <a href="' + CFG.interestUrl + '" target="_blank" rel="noopener">Interested in this website or domain?</a></p></div></div>';
    fetch(ROOT + "data/updated.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.updated) $$("[data-updated]").forEach(function (el) { el.textContent = new Date(d.updated).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); });
    }).catch(function () {});
  }

  /* ---------- mail links ---------- */
  function mailLinks() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-mail]");
      if (!a) return; e.preventDefault(); PF.openMail(a.getAttribute("data-mail") || "PortalFinance.com inquiry");
    });
  }

  /* ---------- forms (FormSubmit AJAX) ---------- */
  PF.send = function (subject, data) {
    var target = CFG.formAlias ? CFG.formAlias : addr();
    var payload = Object.assign({}, data, {
      _subject: subject, _template: "table", _captcha: "false",
      page: location.href.split("#")[0], submitted_at: new Date().toISOString()
    });
    return fetch("https://formsubmit.co/ajax/" + target, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === "false" || j.success === false) throw new Error(j.message || "Send failed"); return j; }); });
  };
  PF.formData = function (form) {
    var d = {}; new FormData(form).forEach(function (v, k) { if (k === "_honey") return; d[k] = d[k] ? d[k] + ", " + v : v; }); return d;
  };
  function bindForms(scope) {
    $$("form[data-pf-form]", scope).forEach(function (form) {
      if (form._pf) return; form._pf = true;
      if (!form.querySelector('[name="_honey"]')) { var hp = document.createElement("div"); hp.className = "hp"; hp.setAttribute("aria-hidden", "true"); hp.innerHTML = '<label>Leave empty<input type="text" name="_honey" tabindex="-1" autocomplete="off"></label>'; form.appendChild(hp); }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (form.hasAttribute("data-custom")) return; /* handled by page script */
        PF.submitForm(form);
      });
    });
  }
  PF.bindForms = bindForms;
  PF.submitForm = function (form, extra, subjectOverride) {
    var status = form.nextElementSibling && form.nextElementSibling.classList.contains("form-status") ? form.nextElementSibling : form.querySelector(".form-status");
    var hp = form.querySelector('[name="_honey"]'); if (hp && hp.value) return Promise.resolve();
    if (!form.checkValidity()) { form.reportValidity(); return Promise.resolve(); }
    var btn = form.querySelector('[type="submit"]'); var label = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    if (status) { status.className = status.className.replace(/\b(ok|err)\b/g, "").trim(); status.textContent = ""; }
    var data = Object.assign(PF.formData(form), extra || {});
    var subject = subjectOverride || ("[PortalFinance] " + form.getAttribute("data-pf-form"));
    return PF.send(subject, data).then(function () {
      var ok = form.getAttribute("data-inline-ok");
      var redirect = form.getAttribute("data-redirect");
      if (redirect) { location.href = ROOT + redirect; return; }
      if (ok && status) { status.classList.add("ok"); status.textContent = ok; form.reset(); }
      else { form.outerHTML = '<div class="success-card" role="status"><h3>Thanks, we received it.</h3><p>' + esc(form.getAttribute("data-success") || "We reply to every message within one business day.") + "</p></div>"; }
      form.dispatchEvent(new CustomEvent("pf:sent", { bubbles: true }));
      try { if (window.gtag) gtag("event", "generate_lead", { form: form.getAttribute("data-pf-form") }); } catch (e) {}
    }).catch(function () {
      if (status) { status.classList.add("err"); status.innerHTML = 'The form could not send. Check your connection and try again, or <a href="#" data-mail="' + esc(subject) + '">email us directly</a>.'; }
    }).then(function () { if (btn && document.body.contains(btn)) { btn.disabled = false; btn.textContent = label; } });
  };

  /* ---------- search ---------- */
  var searchIndex = null;
  function openSearch() {
    var m = $("#searchModal");
    if (!m) {
      m = document.createElement("div"); m.className = "modal"; m.id = "searchModal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", "Search PortalFinance");
      m.innerHTML = '<div class="modal-card search-card"><button class="icon-btn modal-x" type="button" aria-label="Close search">' + IC.close + '</button><h2>Search</h2><label class="sr-only" for="searchInput">Search calculators, guides and terms</label><input id="searchInput" type="search" placeholder="Try “mortgage”, “ETF” or “credit score”" autocomplete="off"><ul class="search-results" id="searchResults"></ul></div>';
      document.body.appendChild(m);
      m.addEventListener("click", function (e) { if (e.target === m || e.target.closest(".modal-x")) closeModal(m); });
      $("#searchInput").addEventListener("input", runSearch);
    }
    openModal(m); $("#searchInput").focus();
    if (!searchIndex) fetch(ROOT + "data/site-index.json").then(function (r) { return r.json(); }).then(function (d) { searchIndex = d; runSearch(); }).catch(function () { searchIndex = []; });
  }
  function runSearch() {
    var q = ($("#searchInput").value || "").toLowerCase().trim(); var out = $("#searchResults");
    if (!searchIndex) { out.innerHTML = "<li class='muted'>Loading…</li>"; return; }
    var terms = q.split(/\s+/).filter(Boolean);
    var res = searchIndex.map(function (p) {
      var hay = (p.t + " " + p.d + " " + (p.k || "")).toLowerCase(); var s = 0;
      terms.forEach(function (t) { if (p.t.toLowerCase().indexOf(t) > -1) s += 3; if (hay.indexOf(t) > -1) s += 1; });
      return { p: p, s: terms.length ? s : 1 };
    }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 12);
    out.innerHTML = res.length ? res.map(function (r) { return '<li><a href="' + ROOT + r.p.u + '">' + esc(r.p.t) + "<small>" + esc(r.p.d) + "</small></a></li>"; }).join("") : "<li class='muted' style='padding:.7rem 0'>No matches. Try a broader word like “loan” or “invest”.</li>";
  }
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
    if (e.key === "Escape") $$(".modal.open").forEach(closeModal);
  });

  /* ---------- modal helpers ---------- */
  var lastFocus = null;
  function openModal(m) { lastFocus = document.activeElement; m.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeModal(m) { m.classList.remove("open"); document.body.style.overflow = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  PF.openModal = openModal; PF.closeModal = closeModal;

  /* ---------- consent ---------- */
  function consent() {
    if (store("pf-consent")) return;
    var c = document.createElement("div"); c.className = "consent show"; c.setAttribute("role", "region"); c.setAttribute("aria-label", "Cookie notice");
    c.innerHTML = '<p>We use cookies to keep the site working, remember your settings and show ads through Google AdSense, which may personalise ads. See our <a href="' + ROOT + 'privacy.html">privacy &amp; cookie policy</a>.</p><div class="btn-row"><button class="btn btn-primary btn-sm" type="button" data-c="all">Accept all</button><button class="btn btn-ghost btn-sm" type="button" data-c="essential">Essential only</button></div>';
    document.body.appendChild(c);
    c.addEventListener("click", function (e) {
      var b = e.target.closest("[data-c]"); if (!b) return; var v = b.getAttribute("data-c"); store("pf-consent", v);
      if (v === "essential") { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; }
      c.remove();
    });
  }
  if (store("pf-consent") === "essential") { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; }

  /* ---------- lead magnet modal + sticky CTA ---------- */
  function leadMagnet() {
    if (/^(plan|thanks|checklist|404)$/.test(PAGE)) return;
    var last = +store("pf-magnet") || 0; if (Date.now() - last < 7 * 864e5) return;
    var shown = false;
    function show() {
      if (shown || $(".modal.open")) return; shown = true; store("pf-magnet", String(Date.now()));
      var m = document.createElement("div"); m.className = "modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "mgTitle");
      m.innerHTML = '<div class="modal-card"><button class="icon-btn modal-x" type="button" aria-label="Close">' + IC.close + '</button>' +
        '<h2 id="mgTitle">Get the free 25-point Money Checklist</h2><p class="muted">The yearly checklist we use to spot leaks in a budget, debt plan, investments and insurance. Printable, one page, no spam.</p>' +
        '<form class="form" data-pf-form="Money Checklist download" data-redirect="money-checklist.html"><div class="field"><label for="mgName">First name</label><input id="mgName" name="name" type="text" autocomplete="given-name" required></div>' +
        '<div class="field"><label for="mgEmail">Email</label><input id="mgEmail" name="email" type="email" autocomplete="email" required></div>' +
        '<label class="check"><input type="checkbox" name="newsletter_optin" value="yes" checked> Also send me The Portal Brief (weekly, unsubscribe anytime).</label>' +
        '<button class="btn btn-primary" type="submit">Send me the checklist</button></form><p class="form-status small" aria-live="polite"></p></div>';
      document.body.appendChild(m); bindForms(m); openModal(m);
      m.addEventListener("click", function (e) { if (e.target === m || e.target.closest(".modal-x")) closeModal(m); });
    }
    document.addEventListener("mouseout", function (e) { if (!e.relatedTarget && e.clientY < 8) show(); });
    var timer = setTimeout(function () {
      window.addEventListener("scroll", function onS() { var p = (window.scrollY + innerHeight) / document.documentElement.scrollHeight; if (p > .7) { window.removeEventListener("scroll", onS); show(); } }, { passive: true });
    }, 15000);
  }
  function stickyCta() {
    if (/^(plan|thanks|404)$/.test(PAGE)) return;
    var s = document.createElement("div"); s.className = "sticky-cta"; s.innerHTML = '<p><strong style="color:#fff">Free financial game plan</strong><br>2 minutes, no cost.</p><a class="btn btn-gold btn-sm" href="' + ROOT + 'free-plan.html">Start</a>';
    document.body.appendChild(s);
    window.addEventListener("scroll", function () { var on = window.scrollY > 600; s.classList.toggle("show", on); document.body.classList.toggle("has-sticky", on); }, { passive: true });
  }

  /* ---------- lite YouTube ---------- */
  PF.liteYT = function (scope) {
    $$(".lite-yt[data-id]", scope).forEach(function (el) {
      if (el._yt) return; el._yt = true; var id = el.getAttribute("data-id");
      el.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
      if (!el.querySelector(".play")) el.insertAdjacentHTML("beforeend", '<span class="play" aria-hidden="true"></span>');
      el.addEventListener("click", function () {
        el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + esc(el.getAttribute("aria-label") || "YouTube video") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
      });
    });
  };

  /* ---------- manual ad slots (only when configured) ---------- */
  function adSlots() {
    var slots = CFG.adSlots || {};
    $$("[data-ad]").forEach(function (el) {
      var id = slots[el.getAttribute("data-ad")]; if (!id) { el.remove(); return; }
      el.className = "ad-slot"; el.innerHTML = '<span class="ad-label">Advertisement</span><ins class="adsbygoogle" style="display:block" data-ad-client="' + CFG.adsenseClient + '" data-ad-slot="' + id + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  /* ---------- guilloché rosette ---------- */
  PF.rosette = function (svg) {
    /* Banknote-style guilloché: woven bands of phase-shifted sine rings */
    var size = 400, c = size / 2, out = "";
    function ring(R, A, k, phase, steps) {
      var p = "";
      for (var i = 0; i <= steps; i++) {
        var t = (i / steps) * Math.PI * 2, r = R + A * Math.sin(k * t + phase);
        p += (i ? "L" : "M") + (c + r * Math.cos(t)).toFixed(1) + " " + (c + r * Math.sin(t)).toFixed(1);
      }
      return p + "Z";
    }
    function band(R, A, k, n) { var s = ""; for (var j = 0; j < n; j++) s += '<path d="' + ring(R, A, k, j * Math.PI * 2 / n, 540) + '"/>'; return s; }
    out += '<g class="r1">' + band(176, 17, 16, 18) + "</g>";
    out += '<g class="r2">' + band(150, 6, 32, 6) + "</g>";
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.innerHTML = out;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) { $$("path", svg).forEach(function (p) { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); }); svg.classList.add("draw"); }
  };

  /* ---------- news widget ---------- */
  PF.loadNews = function (el, limit) {
    fetch(ROOT + "data/news.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      var items = (d.items || []).slice(0, limit || 8);
      if (!items.length) { el.innerHTML = "<li class='muted'>Headlines refresh daily. Check back shortly, or open the live wire on the markets page.</li>"; return; }
      el.innerHTML = items.map(function (i) {
        var dt = i.date ? new Date(i.date) : null;
        return '<li><a href="' + esc(i.link) + '" target="_blank" rel="noopener nofollow">' + esc(i.title) + '</a><span class="meta">' + esc(i.source) + (dt && !isNaN(dt) ? ", " + dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "") + "</span></li>";
      }).join("");
    }).catch(function () { el.innerHTML = "<li class='muted'>Headlines are temporarily unavailable.</li>"; });
  };

  /* ---------- copy link ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-copy-link]"); if (!b) return;
    var url = location.href; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { PF.toast("Link copied"); }).catch(function () { prompt("Copy this link:", url); });
  });
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-print]"); if (b) window.print(); });

  /* ---------- init ---------- */
  function init() {
    header(); footer(); mailLinks(); bindForms(document); consent(); adSlots(); PF.liteYT(document);
    $$("svg[data-rosette]").forEach(PF.rosette);
    $$("[data-news]").forEach(function (el) { PF.loadNews(el, +el.getAttribute("data-news") || 8); });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    setTimeout(leadMagnet, 1200); stickyCta();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
