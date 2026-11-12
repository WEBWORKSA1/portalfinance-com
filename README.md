# PortalFinance.com

Free money calculators, live markets, plain-English guides and a lead-generation funnel. Static HTML/CSS/JS, hosted free on GitHub Pages from the `main` branch, monetised with Google AdSense (`ca-pub-6620975821265271`).

## What's inside

| Area | Files |
|---|---|
| Home, hubs | `index.html`, `calculators/index.html`, `guides/index.html` |
| 10 calculators | `calculators/*.html` + `assets/js/calc.js` (SVG charts, shareable URLs) |
| Live markets | `markets.html`, `news.html` + `assets/js/markets.js` (TradingView, CoinGecko, ECB via Frankfurter) |
| 12 guides, glossary, videos | `guides/*.html`, `glossary.html`, `videos.html` |
| Lead generation | `free-plan.html` + `assets/js/plan.js` (5-step funnel, lead scoring), plus CTAs on every calculator and guide, the exit-intent checklist offer and a mobile sticky CTA |
| Monetisation & community | `support.html` (donations), `contests.html` (quiz + contests + rules), `careers.html`, `advertise.html` |
| Trust & legal | `about.html`, `contact.html`, `privacy.html`, `terms.html`, `disclaimer.html` (financial, advertiser, trademark & copyright) |
| AdSense / SEO | `ads.txt`, `robots.txt`, `sitemap.xml`, JSON-LD on every page |
| Automation | `.github/workflows/update-data.yml` runs `scripts/update_data.py` every 6 hours to refresh `data/news.json`, `data/updated.json` and the sitemap |

## Settings you can change

Everything business-related is in **`assets/js/config.js`**:

- `adSlots`: add AdSense ad-unit IDs after approval to show manual units (Auto ads work without this).
- `donate.paypal` / `donate.stripe` / `donate.buymeacoffee`: paste a payment link and the support buttons go straight to checkout. Until then, supporters send a pledge form.
- `donate.goal` / `donate.raised`: launch-fund progress bar.
- `formAlias`: optional FormSubmit alias (see below).

## Forms and the contact address

All forms post through FormSubmit's AJAX endpoint. The contact address is stored only as encoded character codes in `config.js` and is decoded in the visitor's browser at the moment a form is sent or "Email us" is clicked. It never appears in the HTML, the page or the repository as text.

**One-time step:** the first form submission triggers a FormSubmit activation email to the site's inbox. Click **Activate** once and all forms start delivering. FormSubmit can then also give you a random alias string; put it in `formAlias` to stop the decoded address from being used even in network requests.

## Deploy (GitHub Pages, free)

1. Settings → Pages → Build and deployment → **Deploy from a branch** → `main` / `(root)` → Save.
2. Custom domain: enter `portalfinance.com`, then at your DNS provider add A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `www` CNAME to `webworksa1.github.io`. Tick **Enforce HTTPS** once the certificate is issued.
3. Settings → Actions → General → Workflow permissions: leave the default; the workflow requests `contents: write` itself. Run **Refresh headlines and data** once from the Actions tab to confirm.

## AdSense approval checklist

- [x] AdSense code in `<head>` of every content page (not on 404 or thank-you pages)
- [x] `ads.txt` at the root
- [x] Privacy policy with Google cookie and opt-out disclosures, terms, disclaimers, about and contact pages
- [x] 40+ indexable pages of original content, clear navigation, sitemap, mobile-friendly
- [ ] Site live on `portalfinance.com` (AdSense won't approve a `github.io` address)
- [ ] AdSense → Privacy & messaging → turn on the European regulations (GDPR) message
- [ ] AdSense → Sites → add `portalfinance.com` → Request review

## Adding a page

Copy any existing page, keep the `<head>` block (AdSense, fonts, CSS), the interest bar, the header and footer placeholders and the scripts at the bottom, then replace the content inside `<main>`. Add the URL to `sitemap.xml` and an entry to `data/site-index.json` so it appears in site search.

## Trademark & copyright

PortalFinance.com is an independent publisher and isn't affiliated with any company, product or crypto protocol using the word "Portal". Content © PortalFinance.com, all rights reserved. Third-party marks and data belong to their owners. See `disclaimer.html#trademark`.
