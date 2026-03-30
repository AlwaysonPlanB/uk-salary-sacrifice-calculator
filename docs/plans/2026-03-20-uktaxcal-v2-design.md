# UK Tax Calendar v2 — Design Document

**Date:** 2026-03-20
**Status:** Approved

## Overview

Rebuild uktaxcal.com as a profile-based UK tax calculator + calendar site for the 2026/27 tax year. Preserves all existing calculation logic from the current salary sacrifice calculator, adds 7 user profiles, tax calendar with iCal export, and contextual affiliate monetization.

## Tech Stack

- Pure vanilla HTML/CSS/JS — no frameworks, no build step
- Static site deployed to GitHub Pages
- All calculations client-side, no data sent to servers
- Multi-page structure (one HTML page per profile + shared landing page)

## Architecture

```
uktaxcal/
├── index.html                  # Landing page with profile selector
├── css/
│   └── style.css               # Shared styles (responsive, dark/light)
├── js/
│   ├── tax-engine.js           # Core tax calculation engine (2026/27 rates)
│   ├── salary-sacrifice.js     # Salary sacrifice modelling
│   ├── student-loans.js        # Student loan calculations (all plans)
│   ├── bik-calculator.js       # Benefit-in-Kind / company car tax
│   ├── pension.js              # Pension calculations & allowance checks
│   ├── calendar.js             # Tax calendar rendering & filtering
│   ├── ical-export.js          # iCal/Google Calendar .ics generation
│   ├── warnings.js             # Tax trap detection & alerts
│   ├── affiliate.js            # Affiliate link configuration per profile
│   └── ui.js                   # Shared UI helpers (formatting, real-time update)
├── profiles/
│   ├── employed.html           # PAYE employee
│   ├── self-employed.html      # Sole trader
│   ├── outside-ir35.html       # Outside IR35 contractor (Ltd company)
│   ├── inside-ir35.html        # Inside IR35 / umbrella
│   ├── landlord.html           # Property income
│   ├── director.html           # Ltd company director
│   └── investor.html           # CGT / dividends / ISA
├── CNAME
└── README.md
```

## 2026/27 Tax Rates & Thresholds (HMRC Gov.uk)

### Income Tax (England, Wales & NI)
- Personal Allowance: £12,570
- Basic Rate: 20% (£12,571–£50,270)
- Higher Rate: 40% (£50,271–£125,140)
- Additional Rate: 45% (above £125,140)
- PA taper: £1 reduction per £2 above £100,000

### Scottish Income Tax
- Starter: 19% (£12,571–£16,537)
- Basic: 20% (£16,538–£29,526)
- Intermediate: 21% (£29,527–£43,662)
- Higher: 42% (£43,663–£75,000)
- Advanced: 45% (£75,001–£125,140)
- Top: 48% (above £125,140)

### National Insurance (Employee - Category A)
- LEL: £6,708/year (£129/week)
- Primary Threshold: £12,570/year (£242/week)
- UEL: £50,270/year (£967/week)
- Rate: 8% between PT and UEL, 2% above UEL
- Employer: 15% above £5,000/year (Secondary Threshold)

### Student Loan Thresholds 2026/27
| Plan | Annual Threshold | Rate |
|------|-----------------|------|
| Plan 1 | £26,065 | 9% |
| Plan 2 | £29,385 | 9% |
| Plan 4 (Scotland) | £32,745 | 9% |
| Plan 5 | £25,000 | 9% |
| Postgraduate (Plan 3) | £21,000 | 6% |

Note: Student loan repayments are assessed on original gross salary (pre salary-sacrifice).

### Dividend Tax 2026/27
- Allowance: £500
- Basic Rate: 10.75% (was 8.75%)
- Higher Rate: 35.75% (was 33.75%)
- Additional Rate: 40.64% (was 39.35%)

### Capital Gains Tax 2026/27
- Annual Exempt Amount: £3,000
- Basic Rate: 18%
- Higher Rate: 24%
- BADR: 18% (was 14%)
- Residential Property: 18% / 24%

### Pension
- Annual Allowance: £60,000
- Tapered AA: Income >£200k (adjusted income >£260k), reduces £1 per £2, minimum £10,000
- Money Purchase AA: £10,000
- Salary sacrifice pension fully NI-exempt until April 2029 cap (£2,000)

### BIK Rates 2026/27 (Company Cars)
- Electric (0g CO2): 4%
- Plug-in hybrid ≤50g CO2: 8–20% (by electric range)
- Petrol: 18–37% (by CO2)
- Diesel supplement: +4% (capped at 37%)

### ISA
- Annual Allowance: £20,000
- Cash ISA: full £20k (last year before 2027 under-65 cap of £12k)
- Stocks & Shares ISA: up to £20k

## Core Calculation Engine

### Tax Calculation Flow
1. Accept gross salary input
2. Calculate salary sacrifice total (pension + EV + cycle + other)
3. Determine taxable income (gross − sacrifice − personal allowance)
4. Apply PA taper if income > £100k
5. Calculate income tax per band (England/Wales or Scottish)
6. Calculate employee NI (8% PT–UEL, 2% above)
7. Calculate student loan on ORIGINAL gross (pre-sacrifice)
8. Calculate BIK tax if company car provided
9. Calculate dividend tax if applicable (director/investor profiles)
10. Produce take-home: gross − sacrifices − tax − NI − student loan − BIK tax
11. Run Scenario A vs B comparison (with/without sacrifice)

### Real-Time Update
All calculations re-run on every input change event. No submit button needed. Currency formatted as £X,XXX.

## Tax Trap Warnings

### Preserved from Current Site
1. **£100k Tax Trap** — PA taper creates effective 60% marginal rate between £100k–£125,140. Suggest pension contributions to bring adjusted net income below £100k.
2. **Childcare Tax Trap** — At £100k: loss of Tax-Free Childcare (£2k/child/year) and 30 hours free childcare (~£9,400/year value). Warning triggers at £95k+.
3. **Pension Annual Allowance** — Alert when combined employer + personal contributions exceed £60k (or tapered/MPAA limit).
4. **Student Loan Pre-Sacrifice** — Caveat that repayments are on original gross, not reduced salary.

### New Warnings for 2026/27
5. **Fiscal Drag** — "Your PA would be ~£15,000 if indexed to inflation. You're paying ~£486 extra per year in tax due to frozen thresholds."
6. **MTD Readiness** — Self-employed/landlords with income >£50k: "Making Tax Digital is mandatory from April 2026. You need MTD-compatible software."
7. **Umbrella Company NI** — Inside IR35: "New joint & several liability rules from April 2026 mean agencies/end clients share responsibility for PAYE/NIC debts."
8. **Dividend Tax Increase** — Directors: "Dividend tax rates increased 2% from April 2026."
9. **WFH Allowance Removed** — Employed: "The £6/week working from home tax relief has been removed from April 2026."
10. **BADR CGT Increase** — Directors/Investors: "Business Asset Disposal Relief CGT rate rose from 14% to 18%."
11. **ISA Cash Cap Coming** — Investors: "From April 2027, under-65s will be limited to £12k in Cash ISAs. Consider Stocks & Shares ISA."
12. **Pension Salary Sacrifice NI Cap Coming** — All profiles: "From April 2029, NI relief on pension salary sacrifice will be capped at £2,000/year."

## 7 User Profiles

### 1. Employed (PAYE)
**Calculator:** Gross salary → take-home after tax, NI, student loan, pension, salary sacrifice
**Salary Sacrifice:** Pension, EV (BIK at 4%), Cycle to Work, childcare vouchers
**Key Warnings:** £100k trap, childcare trap, WFH allowance removed, fiscal drag
**Calendar:** P60 (31 May), P11D (6 Jul), SA deadline if applicable (31 Jan), tax code check
**Monetization:** Pension comparison, ISA platforms, EV lease schemes, cycle to work providers

### 2. Self-Employed (Sole Trader)
**Calculator:** Turnover → profit → Class 2 NI (£3.45/week if profit >£12,570) + Class 4 NI (6% £12,570–£50,270, 2% above) + income tax
**Salary Sacrifice:** Personal pension contributions (tax relief at source)
**Key Warnings:** MTD mandatory (income >£50k), payment on account trap, fiscal drag
**Calendar:** SA registration, quarterly MTD submissions (Jul/Oct/Jan/Apr), payment on account (31 Jan/31 Jul), SA deadline (31 Jan/31 Oct paper)
**Monetization:** MTD software (FreeAgent, Xero, QuickBooks), accountant referral, business bank accounts

### 3. Outside IR35 Contractor
**Calculator:** Day rate → annual revenue → salary + dividend split optimiser → total tax burden (Corp tax 19%/25% + personal tax + employer NI)
**Salary Sacrifice:** Pension via Ltd company (employer contribution), EV via Ltd
**Key Warnings:** Dividend tax +2%, BADR CGT 18%, optimal salary level (NI-free at £12,570), IR35 status review
**Calendar:** Corporation tax (9 months + 1 day after year end), annual accounts (9 months), confirmation statement (annual), SA (31 Jan), VAT quarters (if registered)
**Monetization:** Accountant referral, business insurance (PI/PL), IR35 contract review services, business bank accounts

### 4. Inside IR35 Contractor
**Calculator:** Assignment rate → umbrella deductions (employer NI 15%, apprenticeship levy 0.5%, margin) → take-home. Option for student loan, pension sacrifice
**Salary Sacrifice:** Pension (if umbrella offers), limited other options
**Key Warnings:** Umbrella joint & several liability (new April 2026), high employer NI erosion, check umbrella compliance
**Calendar:** Payslip review monthly, SA if other income (31 Jan), student loan via PAYE
**Monetization:** Umbrella company comparison, contractor mortgage brokers, IR35 assessment tools

### 5. Landlord
**Calculator:** Rental income → mortgage interest restriction (20% tax credit only) → Class 2/4 NI if trading → income tax → net profit
**Salary Sacrifice:** Personal pension (reduce taxable income)
**Key Warnings:** MTD mandatory (income >£50k), mortgage interest restriction, CGT on property disposal (18%/24%), fiscal drag
**Calendar:** SA (31 Jan), payment on account (31 Jan/31 Jul), quarterly MTD submissions, CGT 60-day report on sale
**Monetization:** Property accounting software, landlord insurance, MTD tools, remortgage comparison

### 6. Company Director
**Calculator:** Optimal salary/dividend calculator — finds tax-efficient extraction (salary at £12,570 or £5,000 + dividends). Corp tax at 19% (<£50k profit) / 25% (>£250k) / marginal relief. Employer NI on salary.
**Salary Sacrifice:** Pension (employer contribution via Ltd — Corp tax deductible), EV via Ltd
**Key Warnings:** Dividend tax +2%, optimal salary review, BADR CGT 18%, pension AA, IR35 if personal service company
**Calendar:** Corp tax, confirmation statement, annual accounts, SA (31 Jan), dividend vouchers, RTI submissions
**Monetization:** Accountant referral, director's insurance, pension SIPP providers, business software

### 7. Investor
**Calculator:** Capital gains calculator (disposal proceeds − cost − £3k exempt), dividend income calculator (income − £500 allowance), ISA vs GIA comparison showing tax saved
**Salary Sacrifice:** N/A (investment-focused)
**Key Warnings:** CGT annual exempt only £3k, BADR 18%, ISA cash cap coming 2027, dividend allowance only £500, IHT relief changes (BPR/APR capped at £1m)
**Calendar:** SA for CGT/dividends (31 Jan), ISA deadline (5 Apr), CGT payment deadline (31 Jan following tax year)
**Monetization:** ISA platforms (Hargreaves Lansdown, Vanguard, AJ Bell), tax-loss harvesting guides, financial planning referrals

## Monetization Strategy

### Approach: Contextual Affiliate Recommendations
No banner ads. Affiliate links appear as "Recommended Tools" sections within calculator results, triggered by the user's inputs.

### Trigger Logic
| User Action/Profile | Recommendation |
|---------------------|---------------|
| Enters salary >£50k, self-employed | "You'll need MTD-compatible software" → FreeAgent/Xero affiliate |
| Selects EV salary sacrifice | "Compare EV lease deals" → Electric Car Scheme affiliate |
| Has pension >£40k/year | "Consider a SIPP for more control" → pension provider affiliate |
| Investor with gains >£3k | "ISA shelters future gains tax-free" → ISA platform affiliate |
| Outside IR35 | "Protect your contract" → IR35 insurance/review affiliate |
| Inside IR35 umbrella | "Compare umbrella companies" → umbrella comparison affiliate |
| Any profile approaching £100k | "A pension contribution could save you £thousands" → pension/advisor affiliate |

### Revenue Model
- Affiliate commission on signups/referrals
- No user data collected or sold
- All recommendations clearly labelled as affiliate/sponsored
- Recommendations are genuinely useful (not random ads)

## Calendar & iCal Export

### Per-Profile Deadline Filtering
Each profile page shows only deadlines relevant to that user type. Deadlines are colour-coded:
- Green: >30 days away
- Amber: <30 days away
- Red: <7 days or overdue

### iCal Export
- Generate .ics file with all profile-relevant deadlines
- "Add to Google Calendar" link (webcal:// protocol)
- "Download .ics" button for Apple Calendar / Outlook
- Each event includes: summary, description with HMRC link, 1-week reminder, 1-day reminder

## UI/UX Design

### Landing Page (index.html)
- Clean hero: "UK Tax Calculator 2026/27"
- 7 profile cards with icons and one-line descriptions
- "Choose your profile to get started"
- Brief overview of April 2026 key changes

### Profile Pages
- Input section at top (salary/income fields relevant to profile)
- Real-time results panel (updates on every keystroke)
- Tax breakdown table (gross → deductions → take-home)
- Salary sacrifice comparison (Scenario A vs B)
- Warning alerts (contextual, appear when thresholds are hit)
- Tax calendar section (filtered deadlines + export buttons)
- "Recommended Tools" section (contextual affiliate links)
- April 2026 changes summary (profile-specific)

### Responsive Design
- Mobile-first layout
- Fixed bottom summary bar on mobile (yearly/monthly take-home)
- Collapsible sections for secondary info
- Touch-friendly inputs (16px+ font)

### Accessibility
- Semantic HTML5
- ARIA labels on interactive elements
- Keyboard navigable
- High contrast text

## Sources
- [GOV.UK: Rates and thresholds for employers 2026-27](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027)
- [GOV.UK: Student loans terms and conditions 2026-27](https://www.gov.uk/government/publications/student-loans-a-guide-to-terms-and-conditions/student-loans-a-guide-to-terms-and-conditions-2026-to-2027)
- [GOV.UK: Salary sacrifice for employers](https://www.gov.uk/guidance/salary-sacrifice-and-the-effects-on-paye)
- [GOV.UK: Changes to salary sacrifice for pensions from April 2029](https://www.gov.uk/government/publications/changes-to-salary-sacrifice-for-pensions-from-april-2029)
- [Deloitte: UK Tax Rates 2026/27](https://taxscape.deloitte.com/taxtables/deloitte-uk-tax-rates-2026-27.pdf)
- [Armstrong Watson: 10 key tax changes from April 2026](https://www.armstrongwatson.co.uk/news/2026/03/10-key-tax-changes-april-2026)
