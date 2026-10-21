# Search Console keyword review

21 October 2026. Source: Google Search Console, domain property uktaxcal.com, last 3 months (20 July to 19 October 2026), read only. Nothing was changed in Search Console.

## Headline numbers

| Measure | Value |
|:-|:-|
| Clicks | 17.1k |
| Impressions | 1.24 million |
| Average CTR | 1.4% |
| Average position | 8.1 |
| Pages indexed | 6 (plus 4 not indexed: 3 redirects such as http and www versions, 1 duplicate with a correct canonical, both normal) |
| Sitemap submitted | **None** |
| Core Web Vitals (real visitors) | Good on all 7 measured URLs, mobile and desktop |
| Search Console alert | "take home pay calculator uk" impressions down 92% recently |

## Which pages Google serves

| Page | Clicks | Impressions | Avg position |
|:-|:-|:-|:-|
| Homepage | 8,912 | 623,422 | 8.9 |
| Employed (PAYE) | 5,693 | 531,221 | 7.5 |
| Inside IR35 | 2,309 | 69,276 | 6.7 |
| Investor | 274 | 37,754 | 9.1 |
| Landlord | 42 | 3,042 | 9.0 |
| Self-employed | 8 | 1,354 | 15.0 |
| MTD article | 0 | 643 | 20.3 |
| Director, Outside IR35, 4 other articles | 0 | 0 | not served |

## Demand by topic (1,000 top queries)

| Topic | Clicks | Impressions | Avg position | Ranking page |
|:-|:-|:-|:-|:-|
| Salary / take-home pay / PAYE | 1,824 | 527,431 | 8.3 | Homepage and Employed both (competing) |
| Salary sacrifice (pension) | 6,058 | 78,622 | 5.6 | Homepage (#2.5 "salary sacrifice calculator"), Employed (#1.9 "salary sacrifice pension calculator") |
| 2026/27 "tax calculator" terms | 1,125 | 76,676 | 6.1 | Homepage |
| IR35 / contractor | 1,746 | 38,537 | 6.1 | Inside IR35 (Outside IR35 not served) |
| Car / EV salary sacrifice | 690 | 27,406 | 6.2 | Homepage (feature lives on Employed) |
| Pension (other) | 1,555 | 24,367 | 5.6 | Employed |
| Capital gains / investor | 89 | 19,526 | 9.5 | Investor |
| Scotland | 95 | 18,580 | 8.0 | Homepage and Employed |
| National Insurance | 33 | 6,216 | 9.5 | Mixed |
| Self-employed, landlord, director, MTD | about 45 | about 2,150 | 9 to 32 | Barely visible |
| Mileage | 0 | 0 | none | New article in Phase 1 |

Largest single opportunities: "salary calculator" 231,152 impressions at 8.4 (0.1% CTR), "salary calculator uk" 62,699 at 8.0, "uk tax calculator" 51,751 at 9.3, "tax calculator 2026" 36,765 at 5.9, "take home pay calculator uk" 30,695 at 8.1. Moving from position 8 to 3 on queries this size typically multiplies clicks several times.

## Recommendations

### P0: indexing (no ranking risk, do first)

1. **Submit the sitemap** in Search Console (Indexing, Sitemaps, enter `sitemap.xml`). Best done right after Phase 1 is deployed, so Google reads the sitemap with all 15 pages. Seven pages, including the Director and Outside IR35 calculators and four articles, are not being served at all today.
2. **Request indexing** (URL inspection) after deploy for: profiles/director.html, profiles/outside-ir35.html, the 6 articles and privacy.html.

Both are actions in your Search Console account, so they are yours to do (or tell me to do them).

### P1: titles and descriptions (need your approval; rankings depend on them)

| Page | Now | Proposed | Why |
|:-|:-|:-|:-|
| Employed | PAYE Tax & Salary Sacrifice Calculator 2026/27 | **Take-Home Pay & Salary Calculator 2026/27 UK** (H1: Take-Home Pay & Salary Calculator 2026/27) | 527k impressions for salary / take-home terms at position 8. Keep "salary sacrifice" in the meta description and the first paragraph, which protects its #2 rank for "salary sacrifice pension calculator" (863 clicks). |
| Homepage | UK Tax & Salary Sacrifice Calculator 2026/27 | Keep the title; change the description to lead with "UK tax calculator 2026/27" and send take-home pay searchers to the Employed calculator | The homepage ranks #2.5 for "salary sacrifice calculator" (2,304 clicks): do not touch its title. Pointing take-home terms to one page ends the two pages competing at position 8. |
| Investor | Investor Tax Calculator 2026/27 (CGT & ISA) | **Capital Gains Tax Calculator 2026/27: CGT, Dividends & ISA** | Investor page demand is CGT: "capital gains tax calculator" 6,093, "capital gains tax uk calculator" 2,570, "cgt calculator" 2,427, all at about 9.6. |

Make one title change at a time (Employed first), and check rankings for 2 to 3 weeks before the next, so any drop can be traced and reversed.

### P2: new pages with proven demand (proposal)

1. **Car and EV salary sacrifice calculator** (27,406 impressions, homepage at 5 to 7 even though the calculation lives on the Employed page). A focused page using the existing BIK engine, with the 2026/27 company car table.
2. **Scottish take-home pay calculator** (18,580 impressions at 8.0). One page with real Scottish content: the 6 bands, how they differ from rUK, worked examples. Not a copy of the employed page.

### Not recommended

- Meta keywords: Google ignores them.
- FAQ markup for rich results: Google limits them to government and health sites.
- City or near-duplicate pages: thin content, against the plan's rules.

### Watch

- "take home pay calculator uk" impressions down 92% recently: check again after the title change and sitemap submission.
- Core Web Vitals are already "Good" for real visitors, so the self-hosted fonts change is a lab improvement, not a fix for a real-user problem.
