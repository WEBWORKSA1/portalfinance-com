#!/usr/bin/env python3
"""PortalFinance.com data refresher (run by GitHub Actions every 6 hours).

- Collects public RSS/Atom headlines (title, link, source, date only) into data/news.json
- Writes data/updated.json with the refresh time
- Refreshes <lastmod> in sitemap.xml for pages whose content changes with the data
Standard library only, so it runs on any Python 3.8+.
"""
import json, os, re, sys, urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = "PortalFinance.com headline refresher (+https://portalfinance.com/about.html)"
FEEDS = [
    ("Federal Reserve", "https://www.federalreserve.gov/feeds/press_all.xml"),
    ("U.S. SEC", "https://www.sec.gov/news/pressreleases.rss"),
    ("European Central Bank", "https://www.ecb.europa.eu/rss/press.html"),
    ("Bank of Canada", "https://www.bankofcanada.ca/content_type/press-releases/feed/"),
    ("CNBC", "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114"),
    ("CNBC Personal Finance", "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=21324812"),
    ("MarketWatch", "https://feeds.content.dowjones.io/public/rss/mw_topstories"),
    ("Yahoo Finance", "https://finance.yahoo.com/news/rssindex"),
    ("Investing.com", "https://www.investing.com/rss/news_25.rss"),
]
PER_SOURCE, TOTAL = 8, 48


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read()


def parse_date(s):
    if not s:
        return None
    s = s.strip()
    try:
        d = parsedate_to_datetime(s)
    except Exception:
        try:
            d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except Exception:
            return None
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc)


def clean(t):
    t = re.sub(r"<[^>]+>", "", t or "")
    t = re.sub(r"\s+", " ", t).strip()
    return t[:220]


def items_from(xml, source):
    out = []
    root = ET.fromstring(xml)
    for it in root.iter():
        tag = it.tag.split("}")[-1]
        if tag not in ("item", "entry"):
            continue
        title = link = date = None
        for ch in it:
            ct = ch.tag.split("}")[-1]
            if ct == "title":
                title = clean(ch.text)
            elif ct == "link":
                link = (ch.text or "").strip() or ch.attrib.get("href")
            elif ct in ("pubDate", "published", "updated", "date") and not date:
                date = parse_date(ch.text)
        if title and link and link.startswith("http"):
            out.append({"title": title, "link": link, "source": source, "date": date.isoformat() if date else None})
        if len(out) >= PER_SOURCE:
            break
    return out


def main():
    all_items, seen, ok = [], set(), 0
    for source, url in FEEDS:
        try:
            got = items_from(fetch(url), source)
            ok += 1 if got else 0
            for i in got:
                key = i["title"].lower()[:90]
                if key in seen:
                    continue
                seen.add(key)
                all_items.append(i)
            print(f"{source}: {len(got)}")
        except Exception as e:  # keep going; one bad feed must not break the refresh
            print(f"{source}: failed ({e.__class__.__name__})", file=sys.stderr)

    now = datetime.now(timezone.utc)
    news_path = os.path.join(ROOT, "data", "news.json")
    if ok == 0 and os.path.exists(news_path):
        print("No feeds reachable; keeping previous headlines.")
    else:
        all_items.sort(key=lambda i: i["date"] or "", reverse=True)
        json.dump({"updated": now.isoformat(), "items": all_items[:TOTAL]}, open(news_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    json.dump({"updated": now.isoformat(), "feeds_ok": ok}, open(os.path.join(ROOT, "data", "updated.json"), "w"))

    sm = os.path.join(ROOT, "sitemap.xml")
    if os.path.exists(sm):
        today = now.date().isoformat()
        txt = open(sm, encoding="utf-8").read()
        for page in ("https://portalfinance.com/</loc>", "news.html</loc>", "markets.html</loc>"):
            txt = re.sub(r"(" + re.escape(page) + r"<lastmod>)[0-9-]+(</lastmod>)", r"\g<1>" + today + r"\g<2>", txt)
        open(sm, "w", encoding="utf-8").write(txt)
    print(f"Done: {len(all_items)} headlines from {ok} feeds.")


if __name__ == "__main__":
    main()
