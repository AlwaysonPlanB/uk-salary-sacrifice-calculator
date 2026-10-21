# Phase 1 SEO audit (before go live)

21 October 2026. Tool: Google Lighthouse 13.5.0 (github.com/GoogleChrome/lighthouse), mobile settings. Live version (tag live-backup-2026-10-21) and the Phase 1 branch were served side by side locally with gzip and caching, the same way, so scores compare like for like.

## Scores (SEO / Best practices / Accessibility / Performance)

| Page | Live | Phase 1 branch |
|:-|:-|:-|
| 404 | new page | 63/100/89/97 |
| blog_100k-tax-trap | 100/100/95/100 | 100/100/95/100 |
| blog_dividend-tax-increase-2026 | 100/100/95/100 | 100/100/95/100 |
| blog_fiscal-drag-frozen-thresholds | 100/100/95/100 | 100/100/95/100 |
| blog_ir35-umbrella-impact-2026 | 100/100/95/100 | 100/100/95/100 |
| blog_mtd-income-tax-2026 | 100/100/95/100 | 100/100/95/100 |
| index | 100/100/93/100 | 100/100/95/100 |
| profiles_director | 100/100/91/99 | 100/100/93/98 |
| profiles_employed | 100/100/91/100 | 100/100/93/99 |
| profiles_inside-ir35 | 100/100/91/100 | 100/100/93/99 |
| profiles_investor | 100/100/91/100 | 100/100/93/99 |
| profiles_landlord | 100/100/91/100 | 100/100/93/99 |
| profiles_outside-ir35 | 100/100/92/100 | 100/100/93/99 |
| profiles_self-employed | 100/100/91/100 | 100/100/93/99 |

The 404 page scores 63 for SEO by design: it is marked noindex so it never appears in search results.

## Structural checks (all 14 pages)

- Canonical URL present and correct on all 13 indexable pages
- Exactly one H1 per page
- All structured data (WebApplication, FAQPage, Article, WebSite, BreadcrumbList) parses
- No broken local links; every GOV.UK link returns 200
- sitemap.xml lists all 13 pages, all files exist, lastmod 2026-10-21
- robots.txt allows all and points to the sitemap
- No console errors on any page (Best practices 100)

## Page speed

On the live site (simulated mobile), Google Fonts and Google Analytics together cost about 3 seconds of Largest Contentful Paint:

| Live self-employed page | Score | LCP |
|:-|:-|:-|
| As it is now | 75 to 78 | 4.6 to 4.7 s |
| Google Fonts blocked | 89 | 3.5 s |
| Google Analytics blocked | 87 | 3.0 s |
| Both blocked | 98 | 1.5 s |

Phase 1 serves the fonts from uktaxcal.com, loaded asynchronously as before. With real network throttling locally, live and branch both paint at 1.3 to 1.4 s. Lighthouse's simulated mode on localhost cannot model the removed Google round trips, so the production gain is confirmed only after deploy. Rule: if live mobile LCP is not below the 4.6 s baseline after deploy, revert commit 1F.1 and its follow-up.

Google Analytics timing is a decision for the user (it affects analytics data).

## Remaining Lighthouse items (need a decision)

- Colour contrast (all pages) and links shown by colour only (8 pages): fixing changes the look (slightly darker grey text, underlined links in body text)
- Two article tables without header cells (100k tax trap, dividend tax): small markup fix


## Final audit after the user's decisions (21 October 2026, later the same day)

Added since the first audit: contrast fix, share image, privacy page with analytics opt-out, MileLog box, mileage article, dividend Option 2.

| Page | SEO | Best practices | Accessibility | Performance (local) |
|:-|:-|:-|:-|:-|
| 404 | 63 | 100 | 100 | 97 |
| blog_100k-tax-trap | 100 | 100 | 100 | 100 |
| blog_dividend-tax-increase-2026 | 100 | 100 | 100 | 100 |
| blog_fiscal-drag-frozen-thresholds | 100 | 100 | 100 | 100 |
| blog_ir35-umbrella-impact-2026 | 100 | 100 | 100 | 100 |
| blog_mileage-allowance-2026-27 | 100 | 100 | 100 | 100 |
| blog_mtd-income-tax-2026 | 100 | 100 | 100 | 100 |
| index | 100 | 100 | 100 | 100 |
| privacy | 100 | 100 | 100 | 100 |
| profiles_director | 100 | 100 | 100 | 98 |
| profiles_employed | 100 | 100 | 100 | 99 |
| profiles_inside-ir35 | 100 | 100 | 100 | 99 |
| profiles_investor | 100 | 100 | 100 | 99 |
| profiles_landlord | 100 | 100 | 100 | 99 |
| profiles_outside-ir35 | 100 | 100 | 100 | 99 |
| profiles_self-employed | 100 | 100 | 100 | 99 |

Accessibility is now 100 on every page (was 91 to 95 live). Only remaining Lighthouse note: two article tables without header cells, which no longer affect the score. Structure checks: all 16 pages pass (canonical, one H1, structured data parses, no broken local links); sitemap lists 15 pages, all present.

## Go-live conditions

1. In Google Analytics, untick "Modelling contributions & business insights" (Admin, Account details), so the privacy page statement that Google only processes data for us is fully accurate.
2. MileLog 1.2.0 (55p) must be approved and live on the App Store first: the site, the MileLog box and the new article describe the 55p version.
3. Confirm the privacy page wording "run by AlwaysOnPlanB" and the contact link alwaysonplanb.com/contact.html.
4. After deploy: run Lighthouse on the live self-employed page; if mobile LCP is not below 4.6 s, revert the self-hosted fonts commits (1F.1).
