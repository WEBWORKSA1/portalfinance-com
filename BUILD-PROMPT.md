# PortalFinance.com — Idea & Phase-wise Build Prompt

## 1. The winning idea

**PortalFinance.com = a free "money-decision portal": calculators first, live markets second, plain-English guides third, with a high-intent lead-generation funnel ("Get your free financial game plan") running underneath everything.**

### Why this beats the alternatives

| Option | Traffic potential | Revenue/visit | Approval and trademark risk | Verdict |
|---|---|---|---|---|
| Finance news site | High, but you're up against CNBC, Yahoo and Reuters | Medium | High (news needs authority) | Reject |
| Crypto/trading portal | Volatile | Medium | High: a crypto fintech already uses the name "Portal" and the handle @portal_finance | Reject |
| Stock screener/data terminal | Niche | Low (subscription game) | Medium | Reject |
| **Calculators + guides + advisor/lender lead gen** | **Evergreen, huge search volume ("mortgage calculator", "compound interest calculator")** | **Highest (finance CPC plus lead fees)** | **Low (publisher model)** | **Build** |

### Revenue logic (estimates, not guarantees)
- **AdSense:** personal-finance pages are among the highest-CPC verticals. Working assumption: $15–$40 RPM on US/CA/UK traffic. 50,000 pageviews/month × $20 RPM ≈ **$1,000/month**.
- **Lead gen (the real engine):** advisor, mortgage, debt-relief and insurance leads sell for roughly $20–$250 each (Empower's disclosures reference referral payments of up to $250 per lead). 25,000 sessions × 1% conversion = 250 leads × $40 average ≈ **$10,000/month potential**.
- **Sponsorships:** sponsored calculators, category ownership and newsletter sponsorship (rates listed on /advertise).
- **Donations:** a supporter tier funds operations, promotion, hiring and contest prizes.

**Conclusion:** AdSense pays the hosting bill and lead gen builds the business. Every calculator result ends in a lead CTA.

## 2. Research summary (37 sites reviewed)

NerdWallet, Bankrate, Yahoo Finance, Google Finance, CNBC, Morningstar, Motley Fool, Kiplinger, TradingView, Finviz, Investing.com, Zacks, SmartAsset, Credit Karma, Empower, Ramsey Solutions, Forbes Advisor, Money.com, WalletHub, LendingTree, Credible, Policygenius, Calculator.net, Wealthsimple, Ratehub.ca, MoneySense, Finder, StockAnalysis, Macrotrends, Simply Wall St, Benzinga, Koyfin, MoneySavingExpert, Investor.gov, ConsumerFinance.gov, Seeking Alpha, Experian (Ask Experian). Investopedia, MarketWatch and The Balance blocked automated access.

**Patterns adopted:**
1. **Calculator hubs** (Calculator.net lists 71; Bankrate, SmartAsset and Ratehub use calculators as traffic magnets). We ship 10 high-volume calculators, each with charts and an explainer.
2. **Matching funnels** (SmartAsset: answer a few questions, get matched, free intro call; LendingTree: answer, compare, choose; Policygenius: product, details, licensed agent). Our funnel is a 5-step "Free Financial Game Plan" with lead scoring.
3. **Live market strip** (Yahoo, Fool, Finviz, Google Finance): ticker tape, market overview, heatmaps, economic calendar, crypto table and FX converter.
4. **Trust stack** (Bankrate "how we're paid", Forbes Advisor advertiser disclosure, LendingTree editorial guidelines, Finder "not financial advice"): editorial policy, advertiser disclosure, financial disclaimer, and a trademark/copyright disclosure.
5. **Education layer** (Investor.gov glossary, quizzes and scam alerts; Experian Q&A): guides, a glossary, a scam red-flags guide and a Money IQ quiz.
6. **Newsletter capture** (Kiplinger, Money.com, MSE weekly email) plus a lead magnet (printable Money Checklist).
7. **Dark/light themes** (Google Finance, Finviz, StockAnalysis).
8. **Community and contests** (MSE forums, Seeking Alpha contributors, Wealthsimple giveaway sign-up): contests with official rules, and a contributor/careers program.

## 3. Phase-wise build prompt

> Copy any phase below into an AI coding assistant. Each phase is self-contained and builds on the previous one.

### Phase 0 — Guardrails (apply to every phase)
- Domain: PortalFinance.com. Static site deployable on **GitHub Pages free plan, main branch, repo root**. Relative URLs only (the site must work both at `/portalfinance-com/` and at the custom domain root).
- AdSense publisher `ca-pub-6620975821265271`. Put this in `<head>` of every content page:
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>`
  Do NOT load it on 404 or thank-you pages (no-content pages violate policy).
- `ads.txt` at root: `google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`.
- On top of **every** page show: "Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership", linked to `https://web.works/contact`.
- One contact email for the whole site, **never rendered or stored in plain text**: keep it char-code encoded in `config.js`, decode at runtime only to (a) POST forms to FormSubmit's AJAX endpoint and (b) open `mailto:` on click. Grep the build: the address must not appear anywhere.
- Brand as "PortalFinance" (one word, own logo). Never present the site as a lender, broker, adviser, bank or crypto exchange. Include a trademark/copyright disclosure: independent publisher, not affiliated with any company or protocol using the word "Portal", third-party marks belong to their owners.
- YMYL hygiene: author/editorial policy, sources linked, last-updated dates, financial disclaimer, advertiser disclosure.

### Phase 1 — Design system and architecture
- Identity: banknote/stock-certificate engraving. A guilloché rosette (SVG spirograph) is the "portal" motif and the one bold element; everything else stays quiet.
- Tokens: Spruce ink `#12352E`, Certificate paper `#F3F6F2`, Engraving green `#2F7D5B`, Seal gold `#C9A227` (sparing), Ledger red `#B3412E` (losses only), dark mode inverse.
- Type: Gloock (display), Hanken Grotesk (UI/body, tabular numerals for figures). Sentence case, no all-caps labels.
- Files: `assets/css/site.css`, `assets/js/config.js` (all business settings), `assets/js/site.js` (shared header/footer injection, theme, search, consent, forms, modals, lite YouTube), `assets/js/calc.js` (calculator engine plus SVG charts), `assets/js/markets.js` (live crypto/FX).
- Accessibility: skip link, visible focus, `prefers-reduced-motion`, 4.5:1 contrast, labelled inputs, keyboard-operable modals.

### Phase 2 — Global chrome and core pages
- Top interest bar (above), sticky header with nav (Calculators, Markets, Guides, Videos, News, Free plan), search (Ctrl/Cmd+K over `data/site-index.json`), and a theme toggle.
- Footer: sitemap columns, newsletter, disclosures summary, trademark notice, auto "data refreshed" stamp.
- Pages: Home, About (mission, editorial policy, how we make money), Contact, Privacy (cookies, AdSense/DoubleClick, consent), Terms, Disclaimer (financial + advertiser + trademark/copyright), 404, Thank-you.

### Phase 3 — Calculator suite (traffic engine)
Ten pages under `/calculators/`, each with inputs, instant results, an SVG chart, a formula explainer, an FAQ, related links and a lead CTA:
mortgage (amortization, taxes/insurance, schedule), loan, compound interest, retirement, debt payoff (snowball vs avalanche, multiple debts), 50/30/20 budget, savings goal, inflation, FIRE number, currency converter (live rates). Shareable URLs (inputs in the query string), copy-result and print buttons.

### Phase 4 — Live markets (self-updating)
`markets.html`: TradingView free widgets (ticker tape, market overview, stock heatmap, crypto heatmap, economic calendar, forex cross rates), a CoinGecko live crypto table (60s refresh) and a Frankfurter (ECB) FX converter. Graceful fallbacks if an API is down.

### Phase 5 — Content for AdSense approval and SEO
- 12 original 800–1,100-word guides (budgeting, emergency fund, debt payoff, credit scores, compound interest, index funds/ETFs, home affordability, retirement by age, 4% rule/FIRE, inflation, choosing an adviser, scam red flags), with Article/FAQ schema, a table of contents, sources and last-updated dates.
- Glossary of 70+ terms with instant filter. Video library (16 curated educational YouTube videos, lite click-to-load embeds, category filters). News page (TradingView live timeline plus auto-refreshed headlines from `data/news.json`).

### Phase 6 — Lead generation (highest-value section)
- `free-plan.html`: a 5-step quiz (goal, timeline, income/savings, region/age, contact plus explicit consent), progress bar, lead scoring (hot/warm/cool in the subject line), and an instant personalized next-steps screen.
- Entry points: home band, every calculator result, guide end-cards, exit-intent/scroll modal offering the printable Money Checklist (email capture, max once per 7 days), and a mobile sticky CTA.
- Partner side: `advertise.html` (media kit, CPL partnerships, sponsorship packages, inquiry form).

### Phase 7 — Monetization and support
- AdSense Auto ads plus optional manual slots (`config.js` → `adSlots`; renders only when slot IDs are set; no empty placeholders).
- `support.html`: donation tiers ($5/$25/$100/$500/custom), transparent allocation (operations, promotion and marketing, hiring talent, contests and prizes, reserve), founding-supporter wall, and PayPal/Stripe/Buy Me a Coffee links from `config.js`. Falls back to a pledge form until links are set.

### Phase 8 — Community: contests and careers
- `contests.html`: Money IQ quiz (interactive, scored), Budget Makeover Challenge, 60-second Money Tip creator contest, student essay award; entry forms; official rules (no purchase necessary, eligibility, judging, prize delivery, void where prohibited).
- `careers.html`: open roles (finance writer, video creator, SEO, front-end dev, community moderator, partnerships manager), perks and an application form (portfolio link).

### Phase 9 — Automation
- GitHub Action `update-data.yml` (daily cron plus manual run): `scripts/update_data.py` pulls public RSS headlines (Federal Reserve, SEC, CNBC, MarketWatch, Yahoo Finance) into `data/news.json` (title, link, source, date only), refreshes `sitemap.xml` lastmod and `data/updated.json`, and commits on change. Pages redeploys automatically.

### Phase 10 — SEO, performance and compliance QA
- Unique title/description per page, canonical to `https://portalfinance.com/…`, Open Graph, JSON-LD (Organization, WebSite+SearchAction, Article, FAQPage, BreadcrumbList), `sitemap.xml`, `robots.txt`.
- No external JS other than AdSense, TradingView widgets and the APIs. Lazy-load embeds. Lighthouse 90+.
- QA: every link resolves, no plaintext email, consent banner works, forms deliver (first FormSubmit submission sends an activation email you must confirm once).

### Phase 11 — Deploy
1. Push to `github.com/WEBWORKSA1/portalfinance-com` (main).
2. Settings → Pages → Deploy from branch → `main` / root.
3. Custom domain: add `portalfinance.com` in Pages settings (creates `CNAME`), then set DNS: four A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, plus `www` CNAME → `webworksa1.github.io`. Tick "Enforce HTTPS".
4. AdSense → Sites → add portalfinance.com → request review. Turn on AdSense **Privacy & messaging → European regulations** message (Google-certified CMP) before review.
