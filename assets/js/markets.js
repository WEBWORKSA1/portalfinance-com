/* PortalFinance.com — live market widgets (TradingView embeds, CoinGecko, Frankfurter/ECB) */
(function () {
  "use strict";
  var PF = window.PF || {}; var $ = PF.$, $$ = PF.$$;
  var TV = "https://s3.tradingview.com/external-embedding/embed-widget-";
  var PRESETS = {
    "ticker-tape": function (t) { return { symbols: [
      { proName: "FOREXCOM:SPXUSD", title: "S&P 500" }, { proName: "FOREXCOM:NSXUSD", title: "Nasdaq 100" }, { proName: "FOREXCOM:DJI", title: "Dow 30" },
      { proName: "FX_IDC:EURUSD", title: "EUR/USD" }, { proName: "FX_IDC:USDCAD", title: "USD/CAD" }, { proName: "FX_IDC:USDINR", title: "USD/INR" },
      { proName: "OANDA:XAUUSD", title: "Gold" }, { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" }, { proName: "BITSTAMP:ETHUSD", title: "Ethereum" }],
      showSymbolLogo: true, isTransparent: true, displayMode: "adaptive", colorTheme: t, locale: "en" }; },
    "market-overview": function (t) { return { colorTheme: t, dateRange: "12M", showChart: true, locale: "en", width: "100%", height: "100%", largeChartUrl: "", isTransparent: true, showSymbolLogo: true, showFloatingTooltip: true,
      tabs: [
        { title: "Indices", symbols: [{ s: "FOREXCOM:SPXUSD", d: "S&P 500" }, { s: "FOREXCOM:NSXUSD", d: "Nasdaq 100" }, { s: "FOREXCOM:DJI", d: "Dow 30" }, { s: "INDEX:NKY", d: "Nikkei 225" }, { s: "INDEX:DEU40", d: "DAX" }, { s: "FOREXCOM:UKXGBP", d: "FTSE 100" }] },
        { title: "Forex", symbols: [{ s: "FX:EURUSD", d: "EUR to USD" }, { s: "FX:GBPUSD", d: "GBP to USD" }, { s: "FX:USDJPY", d: "USD to JPY" }, { s: "FX:USDCAD", d: "USD to CAD" }, { s: "FX_IDC:USDINR", d: "USD to INR" }, { s: "FX:AUDUSD", d: "AUD to USD" }] },
        { title: "Commodities", symbols: [{ s: "OANDA:XAUUSD", d: "Gold" }, { s: "OANDA:XAGUSD", d: "Silver" }, { s: "TVC:USOIL", d: "Crude oil" }, { s: "TVC:UKOIL", d: "Brent" }] },
        { title: "Crypto", symbols: [{ s: "BITSTAMP:BTCUSD", d: "Bitcoin" }, { s: "BITSTAMP:ETHUSD", d: "Ethereum" }, { s: "COINBASE:SOLUSD", d: "Solana" }, { s: "BITSTAMP:XRPUSD", d: "XRP" }] }
      ] }; },
    "stock-heatmap": function (t) { return { exchanges: [], dataSource: "SPX500", grouping: "sector", blockSize: "market_cap_basic", blockColor: "change", locale: "en", symbolUrl: "", colorTheme: t, hasTopBar: false, isDataSetEnabled: false, isZoomEnabled: true, hasSymbolTooltip: true, isMonoSize: false, width: "100%", height: "100%" }; },
    "crypto-coins-heatmap": function (t) { return { dataSource: "Crypto", blockSize: "market_cap_calc", blockColor: "24h_close_change|5", locale: "en", symbolUrl: "", colorTheme: t, hasTopBar: false, isDataSetEnabled: false, isZoomEnabled: true, hasSymbolTooltip: true, isMonoSize: false, width: "100%", height: "100%" }; },
    "events": function (t) { return { colorTheme: t, isTransparent: true, width: "100%", height: "100%", locale: "en", importanceFilter: "0,1", countryFilter: "us,eu,gb,ca,in,jp,cn,au" }; },
    "forex-cross-rates": function (t) { return { width: "100%", height: "100%", currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "INR"], isTransparent: true, colorTheme: t, locale: "en" }; },
    "timeline": function (t) { return { feedMode: "all_symbols", isTransparent: true, displayMode: "regular", width: "100%", height: "100%", colorTheme: t, locale: "en" }; }
  };
  function mount(el) {
    var kind = el.getAttribute("data-tv"); if (!PRESETS[kind]) return;
    var theme = PF.theme ? PF.theme() : "light";
    el.innerHTML = '<div class="tradingview-widget-container" style="height:100%;width:100%"><div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div></div>';
    var s = document.createElement("script"); s.src = TV + kind + ".js"; s.async = true; s.type = "text/javascript";
    s.textContent = JSON.stringify(PRESETS[kind](theme)); el.firstChild.appendChild(s);
  }
  function mountAll() {
    var els = $$("[data-tv]"); if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(mount); return; }
    var io = new IntersectionObserver(function (ents) { ents.forEach(function (e) { if (e.isIntersecting) { mount(e.target); io.unobserve(e.target); } }); }, { rootMargin: "300px" });
    els.forEach(function (el) { io.observe(el); });
  }
  document.addEventListener("pf:theme", function () { $$("[data-tv]").forEach(function (el) { if (el.querySelector(".tradingview-widget-container")) mount(el); }); });

  /* Crypto table (CoinGecko public API) */
  var usd = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  var big = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
  function chg(v) { if (v == null) return "—"; var c = v >= 0 ? "up" : "down"; return '<span class="chg ' + c + '">' + (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2) + "%</span>"; }
  function crypto(el) {
    var n = +el.getAttribute("data-crypto") || 10;
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=" + n + "&page=1&sparkline=false&price_change_percentage=24h,7d")
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (rows) {
        el.innerHTML = '<div class="table-wrap" style="max-height:none"><table><caption class="sr-only">Top cryptocurrencies by market value</caption><thead><tr><th scope="col">Coin</th><th scope="col">Price</th><th scope="col">24h</th><th scope="col">7d</th><th scope="col">Market cap</th></tr></thead><tbody>' +
          rows.map(function (c) { return '<tr><td><span class="coin"><img src="' + PF.esc(c.image) + '" alt="" loading="lazy" width="20" height="20">' + PF.esc(c.name) + ' <span class="muted small">' + PF.esc(String(c.symbol).toUpperCase()) + "</span></span></td><td>" + usd.format(c.current_price) + "</td><td>" + chg(c.price_change_percentage_24h_in_currency) + "</td><td>" + chg(c.price_change_percentage_7d_in_currency) + "</td><td>" + big.format(c.market_cap) + "</td></tr>"; }).join("") +
          '</tbody></table></div><p class="small muted" style="margin-top:.5rem">Data: CoinGecko. Refreshes every 60 seconds. Updated ' + new Date().toLocaleTimeString() + ".</p>";
      })
      .catch(function () { if (!el.querySelector("table")) el.innerHTML = '<p class="muted">Live crypto prices are busy right now (free data limits). The heatmap below still updates in real time.</p>'; });
  }
  /* FX board (ECB reference rates) */
  function fxBoard(el) {
    fetch("https://api.frankfurter.dev/v1/latest?base=USD").then(function (r) { return r.json(); }).then(function (d) {
      var list = ["EUR", "GBP", "CAD", "INR", "JPY", "AUD", "CHF", "CNY", "SGD", "MXN"];
      el.innerHTML = '<div class="table-wrap" style="max-height:none"><table><caption class="sr-only">US dollar exchange rates</caption><thead><tr><th scope="col">Currency</th><th scope="col">1 USD buys</th><th scope="col">Cost of 1 unit</th></tr></thead><tbody>' +
        list.filter(function (c) { return d.rates[c]; }).map(function (c) { return "<tr><td>" + c + "</td><td>" + d.rates[c].toFixed(4) + "</td><td>" + usd.format(1 / d.rates[c]) + "</td></tr>"; }).join("") +
        '</tbody></table></div><p class="small muted" style="margin-top:.5rem">European Central Bank reference rates via Frankfurter, as of ' + d.date + ".</p>";
    }).catch(function () { el.innerHTML = '<p class="muted">Exchange rates are temporarily unavailable.</p>'; });
  }
  function init() {
    mountAll();
    $$("[data-crypto]").forEach(function (el) { crypto(el); setInterval(function () { if (!document.hidden) crypto(el); }, 60000); });
    $$("[data-fx]").forEach(fxBoard);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
