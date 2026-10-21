# UKTaxCal: accuracy fixes, MileLog placement, accountant matching skeleton

21 October 2026. Status: PLAN ONLY, nothing built yet. Awaiting approval.

Sources: `docs/2026-10-21-govuk-accuracy-audit.md` (audit IDs below refer to it) and the user's "UKTaxCal Accountant Matching Plan" (19 Oct 2026).

## Ground rules for all work

- No assumptions. Anything not in the repo, the audit, GOV.UK or the user's words is asked, not guessed.
- No em dashes or double hyphens in any new or edited copy.
- Calculator URLs, titles, meta descriptions and page structure stay as they are unless a fix requires a wording change (the audit item says which).
- One audit item per commit, commit message starts with the audit ID (for example `L1: ...`). A running `CHANGELOG.md` in the repo lists every change with its ID, file and before/after example. This is how nothing gets lost.
- Each phase is its own git branch. Nothing reaches `main` (which is what GitHub Pages serves) until the user has reviewed it.
- Every calculation fix is checked against the worked example in the audit (input, expected GOV.UK result) before and after, and the before/after numbers go in the changelog.

## Answer to "now or later" for the lead gen work

**Do it after Phase 1 is live, as a separate phase. Do not mix it into the fix commits.**

1. The user's own plan says the HMRC accuracy fixes ship first and matching never goes live on an unfixed site.
2. The calculators are the asset. If rankings or engagement move after a deploy, we need to know whether the cause was a calculation fix or a lead gen change. Mixed deploys make that impossible to tell.
3. The lead gen work is almost entirely new files (new pages, one data file, one form). It barely touches existing pages, so keeping it separate costs nothing.
4. The plan's own rollout already staggers it: hub pages first, two weeks to index, then prompts on one calculator.

So: Phase 1 (fixes and MileLog placement), review, deploy, check for a few days. Then Phase 2 (lead gen skeleton) on its own branch. Phase 2 can be drafted while Phase 1 is in review, but it only merges after Phase 1 is live.

## Phase 1: calculation fixes and MileLog placement

Branch: `fix/2026-10-govuk-accuracy`

### 1A. Logic fixes (audit L1 to L18), in this order

| Order | ID | What | Pages affected |
|:-|:-|:-|:-|
| 1 | L1 | 45% band starts at £125,140, not £112,570 (rUK and Scotland) | all calculators via tax-engine.js |
| 2 | L2 | Scottish taper zone marginal rate 67.5% | employed, Scottish option |
| 3 | L4, L5, L6 | Dividend engine: unused PA against dividends, fixed basic band, £500 allowance uses band | director, outside-ir35, investor, optimal salary tables |
| 4 | L3 + F16 | Class 2 not charged at profits of £7,105 or more; fix the matching page text and meta | self-employed, index, llms.txt |
| 5 | L7 + F15 | Pension annual allowance taper: threshold income over £200,000 and adjusted income over £260,000 | employed, warnings |
| 6 | L8 | Director page passes salary as BIK rate | director |
| 7 | L9 | Company car BIK tables to GOV.UK 2026/27 | employed, inside-ir35 (salary sacrifice) |
| 8 | L10 | Section 24 credit capped per GOV.UK | landlord |
| 9 | L11 | Payments on account: income tax plus Class 4 only, none under £1,000 | self-employed |
| 10 | L12 | MTD warning based on turnover, not profit plus other income | self-employed, landlord |
| 11 | L13 to L18 | Adjusted net income after salary sacrifice, CT marginal relief saving, warnings wiring, £100,000 boundary, employer NI basis, Employment Allowance | employed, director, outside-ir35, inside-ir35 |

Calculator page wording that would contradict a fixed number is fixed in the same commit (noted in the table). Items marked UNVERIFIED in the audit (U1 to U5) are not changed. They come back to the user as questions.

### 1B. Stated facts on calculator pages and tools (audit F1 to F16, F36, F37)

Wrong figures in warnings, FAQ, calendar and links on the calculator pages: for example MTD quarterly deadlines (F12), WFH relief (F8), umbrella liability (F9), salary sacrifice 2029 (F10), thresholds frozen to 2031 (F6), broken GOV.UK links (F36). One commit each.

### 1C. Blog corrections (audit F17 to F35)

Separate commits after 1A and 1B, because the blogs are long and the numbers in them depend on the fixed engine. Blog URLs and titles stay the same; only the wrong figures and sentences change, and each article gets an "Updated 2026" note at the bottom saying what was corrected.

### 1D. MileLog placement

Today MileLog is the 2nd or 3rd card in "Recommended Tools", which sits below the tax calendar near the bottom of the page. It only appears on 4 of the 7 calculators. Proposal:

1. **Next to the expenses field** on self-employed, landlord and outside-ir35 (where users are already thinking about expenses). One plain line under the input, same site style:
   "Driving for work? HMRC allows 55p a mile for the first 10,000 business miles. MileLog, our own £1.99 app, logs it for you."
   It sits on the input side, so it never stacks with a future accountant prompt under the result.
2. **First card in Recommended Tools** wherever MileLog applies, labelled "Our app".
3. **Added to employed and director**, where mileage is a real claim (employees using their own car can claim Mileage Allowance Relief; directors can be paid mileage by their company). Not added to investor.
4. **Copy fixes:** 45p changes to 55p (F1). Price "£2" changes to the real "£1.99". The inside-ir35 card currently says users can claim mileage on their commute; ordinary commuting is not claimable, so that sentence is replaced (I will check the exact GOV.UK wording before writing it).
5. **Measuring it without new trackers:** use an App Store Connect campaign link (a `ct=` campaign name per page) so downloads from UKTaxCal show up in App Store Connect analytics. No extra script on the site. Needs the provider token from App Store Connect, which I can read once you are signed in.

### 1E. Legal safety fixes needed regardless of lead gen

These exist today and should be fixed in Phase 1:

1. **False disclosure.** The Recommended Tools box says "We are not sponsored by or associated with any of the tools listed below". MileLog is your own app, so that statement is untrue. New wording names MileLog as our own product and keeps the commission statement for the referral links. (ASA CAP Code: marketing must be obviously identifiable.)
2. **No privacy notice.** The site has no privacy page, yet it runs Google Analytics on every page. Phase 2 will also collect names and emails, which makes a privacy notice essential. I add `/privacy/` in Phase 1, covering analytics only, and extend it in Phase 2 for enquiries.
3. **Analytics cookies with no notice.** Google Analytics loads on every page with no cookie notice or choice. The safe option is a small consent banner that loads analytics only after "Accept". It can cut analytics numbers, so this is your decision (see Decisions).

### 1F. SEO enhancements (added 21 Oct 2026 at the user's request)

Baseline taken first with Google Lighthouse 13.5.0 (GoogleChrome/lighthouse) on all 13 live pages, mobile. Reports saved in `/Users/ven/Dev/Dwija/backups/uktaxcal/lighthouse-baseline-2026-10-21/`.

| Measure | Baseline |
|:-|:-|
| SEO score | 100 on all 13 pages |
| Best practices | 100 on all 13 pages |
| Performance (mobile) | 73 to 78 |
| Largest Contentful Paint (mobile) | 4.3 to 4.6 s (Google's "good" is 2.5 s or less) |
| Accessibility | 91 to 95 (colour contrast, heading order, links shown by colour only, one large table) |

Invisible or additive changes (no change to how the site looks, URLs, titles or meta, except where a meta description states a wrong fact):

1. **Page speed.** Serve the Inter and JetBrains Mono fonts from the site itself instead of Google Fonts, with a preload for the main font, and inline the small stylesheet's critical part so text appears without waiting. Same fonts, same look. Target: LCP under 2.5 s in Lighthouse mobile.
2. **Custom 404 page.** Today a broken link shows GitHub's generic page. A `404.html` in the site style with links to the 7 calculators keeps visitors on the site.
3. **Honest freshness signals.** After the fixes: `dateModified` in the Article structured data of each corrected blog post, real `lastmod` dates in `sitemap.xml` for pages that actually changed, and a visible "Rates checked against GOV.UK: October 2026" line on each calculator.
4. **Site identity structured data.** `WebSite` and `Organization` JSON-LD on the homepage, so Google can show "UKTaxCal" as the site name in results.
5. **Breadcrumbs.** `BreadcrumbList` JSON-LD on calculators and articles (Home > Calculators > Self-employed). No visible change.
6. **Heading order.** Fix headings that skip a level (for example h1 straight to h3). Same visual size via the existing CSS classes.
7. **Internal links.** Each calculator links to its matching article and each article back to its calculator, where not already done.
8. **llms.txt** updated to match the corrected figures.

Changes that alter how the site looks, so they need the user's OK first (NOT done without it):

9. **Share image (`og:image` and `twitter:image`).** No page has one, so links shared on LinkedIn, WhatsApp or X show no picture. Proposal: one 1200 x 630 image in the site colours with the UKTaxCal name, shown to you before use.
10. **Colour contrast and link underlines** (accessibility). Some grey text and coloured links fall below WCAG contrast. Fix means slightly darker greys and underlined links in body text.

Not proposed: FAQ markup on more pages (Google shows FAQ rich results only for government and health sites since 2023), and title or meta rewrites (the March SEO overhaul set them and rankings depend on them).

### 1G. SEO audit before go live

After Phase 1 is complete on the branch, and before merge:

1. Lighthouse 13.5.0 on all 13 pages (plus new pages such as 404 and privacy) against the local preview of the branch, same settings as the baseline.
2. The same manual checks as the baseline: canonical, Open Graph, JSON-LD parses, one h1, sitemap and robots.
3. Side by side table: baseline vs Phase 1, per page. Any score that drops is investigated before merge.

### Phase 1 checks before anything is merged

- Node checks run against every audit worked example (all must match the audit's expected result).
- Every calculator page loaded in the local preview with no console errors, before and after screenshots of each changed result.
- Search the changed copy for em dashes and double hyphens (must be zero).
- `CHANGELOG.md` complete. You review the branch, then merge (merge to `main` is a deploy).

## Phase 2: accountant matching skeleton

Branch: `feature/find-an-accountant`. Starts after Phase 1 is live.

### What gets built

| Page | URL | Notes |
|:-|:-|:-|
| Find an accountant (hub) | /find-an-accountant/ | How it works, the named panel, what we check, disclosure, enquiry form |
| How we make money | /how-we-make-money/ | Who pays, in broad terms, how partners are chosen |
| Self-employed | /find-an-accountant/self-employed/ | Plan phase 1 page |
| Making Tax Digital | /find-an-accountant/making-tax-digital/ | Plan phase 1 page |
| Limited company directors | /find-an-accountant/limited-company/ | Plan phase 1 page |
| Partner with us | /partner-with-us/ | Prerequisites listed first, then the accountant contact form |
| Privacy notice (extended) | /privacy/ | Adds enquiries, sharing with the chosen firm, 12 month deletion |
| Enquiry received / thank you pages | /find-an-accountant/thanks/ and /partner-with-us/thanks/ | Plain confirmation |

Phase 2 pages from the plan (landlords, contractors, CIS, do I need one) and city pages wait until there is a partner who covers them.

### The partner data file (how firms 2 and 3 get added later)

One file, `js/partners.js`, holds every firm. The hub panel, the firm dropdown on the enquiry form and the "matched to" logic all read from it. Adding a firm later means adding one entry and setting `active: true`. No page edits.

Each entry holds only what the firm has confirmed in writing:

- `id`, `name`, `active`
- `website`
- `professionalBody`, `practisingCertificate` (as shown on the body's public register)
- `amlSupervisor`, `piInsurance` (yes, confirmed in writing)
- `mtdSoftware`
- `services` (which of the 4 enquiry types they accept: one-off return, specific service, ongoing sole trader or landlord, ongoing limited company)
- `areas` (remote UK wide, or named towns for in-person)
- `responsePromise` (one working day)
- `leadEmail` (where enquiries go; NOT shown on the site)
- `agreedOn` (date of their written agreement)

Two empty slots are pre-defined with `active: false`, so they never render until filled. If a visitor's enquiry type matches no active firm, the form says plainly that we have no partner for that yet and points to the ICAEW directory, as the site does today.

### On/off switches (the plan's rollback rule)

`js/leadgen-config.js` with `hubEnabled` and one `promptEnabled` flag per calculator, all off by default. Calculator prompts are built in Phase 2 but stay off; per the plan they go on for self-employed only, two weeks after the hub is indexed, then one calculator at a time.

### Enquiry form (visitor)

- Fields: name, email, phone (optional), type of help (the 4 fee tiers), short description, firm (named; with one firm it is shown, not chosen).
- An unticked box: "Send my details to [firm name] so they can contact me about this enquiry. UKTaxCal is paid a fee by [firm name] for each introduction." Form cannot submit without it.
- Calculator inputs are NOT included at all in the skeleton (safest; the plan allows it only with a separate tick, which can come later).
- One firm per enquiry. No "get up to 3 quotes" (it is the higher risk option and still undecided).
- No tax advice anywhere in the flow.

### Partner with us (accountant contact form)

Prerequisites shown first, as a checklist taken from the plan's vetting list: membership of ICAEW, ACCA, CIOT, ATT, AAT or ICAS with a practising certificate where required; AML supervision; professional indemnity insurance; MTD for Income Tax software; fixed or clearly quoted fees; response within one working day.

Form: firm name, contact name, email, phone, website, professional body and membership number, AML supervisor, PI insurer, MTD software, services offered, areas covered, capacity for new clients before 31 January, and one tick per prerequisite. Clear line: "Submitting this does not create any agreement. We check every firm on its professional body's public register before we reply." Enquiries come to you only; you decide.

### Playing it safe without a solicitor

What the build does:

1. The disclosure line from the plan on every hub page, form and (later) prompt, and the How we make money page.
2. No reviews, star ratings, testimonials, "best" or "top" claims, or rankings. Only facts the firm confirmed in writing and that can be checked on a public register (DMCC Act 2024, CAP Code).
3. Only firms that have agreed in writing are named.
4. Consent is a separate, unticked box per enquiry; details go only to the named firm; enquiries deleted after 12 months if not converted (as the plan says).
5. Matching pages are information plus a form. No tax advice.
6. Plain, factual wording throughout; no urgency tactics, countdowns or popups.

What you need to do (I cannot do these):

1. **ICO data protection fee.** Collecting enquiries means processing personal data. Check with the ICO's online self assessment whether UKTaxCal needs to register and pay the fee, before the form goes live.
2. **Written agreement from the firm.** Even an email confirming: they agree to be named, the details in the data file, the fee per introduction, and how they want leads delivered. The plan's one-page partner agreement covers this.
3. **Firm details for the data file** (see Decisions).
4. Optional and free: the ICO has a helpline and small business guidance for checking a privacy notice.

This is a careful, low risk setup, not legal advice.

### Phase 2 checks before merge

- Forms tested end to end (test submissions reach the right inbox).
- All switches off on merge except `hubEnabled`.
- Pages checked at phone width, no console errors, no em dashes.
- Footer links added site wide: Find an accountant, How we make money, Privacy.

## Decisions needed from the user

1. **How the two forms send data.** GitHub Pages cannot process forms by itself. Options:
   - A: a form service that receives a plain HTML form (no script, no cookies) and emails it to you. I check two or three providers' current terms (data location, retention, cost) and bring you a recommendation before choosing. Recommended.
   - B: Google Forms, linked from the pages. Data stays in your Google account; visitors leave the site to fill it.
   - C: email link only. Simplest, no data stored by a third party, but lowest completion.
2. **Lead delivery to the firm.** Recommended at launch: enquiries come to you, you forward them to the firm. You see every lead, which also gives you the count for billing.
3. **Cookie consent banner for Google Analytics** (Phase 1, 1E.3): add it, or leave analytics as is for now.
4. **Firm 1 details:** firm name as it should appear, website, professional body and membership number, AML supervisor, PI insurance confirmed, MTD software, services (you said they handle everything, so all four enquiry types?), remote UK wide or specific areas, and the email for leads.
5. **Service name:** plain "Find an accountant" (recommended) or a branded name.
6. **Em dashes already on the site** (about 219): leave, or remove in a separate commit after Phase 1C.
