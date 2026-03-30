# UK Tax Calendar v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a profile-based UK tax calculator site for 2026/27 with real-time calculations, salary sacrifice modelling, tax calendar with iCal export, and contextual affiliate monetization — all vanilla HTML/CSS/JS on GitHub Pages.

**Architecture:** Multi-page static site. Shared JS modules handle all tax logic (pure functions). Each of 7 profile pages imports the shared engine and wires inputs to real-time output. No frameworks, no build step, no server.

**Tech Stack:** Vanilla HTML5, CSS3 (custom properties, grid, flexbox), ES6 modules, GitHub Pages

**Security Note:** All dynamic content rendering must use textContent for plain text values and safe DOM construction methods. Avoid innerHTML with user-supplied data. Calendar/affiliate rendering uses only developer-controlled string literals.

---

### Task 1: Project scaffold and CSS foundation

**Files:**
- Create: `css/style.css`
- Create: `index.html`

**Step 1: Create the shared CSS file with dark/light theme, responsive layout, all component styles (cards, forms, results, warnings, calendar, affiliates, mobile summary bar)**

**Step 2: Create landing page HTML with 7 profile cards, key changes banner, theme toggle**

**Step 3: Verify landing page renders in browser**

**Step 4: Commit**
```bash
git add index.html css/style.css
git commit -m "feat: project scaffold with landing page and CSS foundation"
```

---

### Task 2: Core tax engine (js/tax-engine.js)

**Files:**
- Create: `js/tax-engine.js`

All 2026/27 HMRC rates in a single RATES constant. Pure exported functions:

```javascript
export const RATES = { /* all thresholds */ };
export function calcPersonalAllowance(grossIncome) { /* PA taper: £1 per £2 above £100k */ }
export function calcIncomeTax(taxableIncome, isScottish) { /* returns { tax, effectiveRate, marginalRate, personalAllowance, breakdown[] } */ }
export function calcEmployeeNI(niableIncome) { /* 8% PT-UEL, 2% above */ }
export function calcEmployerNI(salary) { /* 15% above £5k */ }
export function calcSelfEmployedNI(profit) { /* Class 2 + Class 4, returns { class2, class4, total } */ }
export function calcCorporationTax(profit) { /* 19%/25% with marginal relief */ }
export function calcDividendTax(dividendIncome, otherTaxableIncome) { /* returns { tax, breakdown[] } */ }
export function calcCapitalGainsTax(gains, otherTaxableIncome, isResidential, isBADR) { /* returns { tax } */ }
export function calcTaperedAA(adjustedIncome) { /* pension annual allowance taper */ }
export function formatCurrency(amount) { /* £X,XXX */ }
export function formatPercent(rate) { /* X.X% */ }
```

Key rates to include:
- Income Tax: PA £12,570, Basic 20% (to £50,270), Higher 40% (to £125,140), Additional 45%
- Scottish: 6 bands (19%-48%)
- Employee NI: 8% (£12,570-£50,270), 2% above
- Employer NI: 15% above £5,000
- Self-employed: Class 2 £3.45/week, Class 4 6%/2%
- Student Loans: Plan 1 £26,065, Plan 2 £29,385, Plan 4 £32,745, Plan 5 £25,000, PG £21,000
- Dividends: £500 allowance, 10.75%/35.75%/40.64%
- CGT: £3,000 exempt, 18%/24%, BADR 18%
- Corp Tax: 19% (<£50k), 25% (>£250k), marginal relief between
- Pension: £60k AA, taper above £200k, minimum £10k
- BIK: Electric 4%, hybrid 4-16%, petrol 18-37%, diesel +4%
- ISA: £20k allowance

**Step 2: Verify with node**
```bash
node -e "import('./js/tax-engine.js').then(m => console.log(m.calcIncomeTax(55000), m.calcEmployeeNI(55000)))"
```

**Step 3: Commit**
```bash
git add js/tax-engine.js
git commit -m "feat: core tax engine with all 2026/27 HMRC rates and thresholds"
```

---

### Task 3: Student loan calculator (js/student-loans.js)

**Files:**
- Create: `js/student-loans.js`

```javascript
import { RATES } from './tax-engine.js';
export function calcStudentLoan(grossSalary, planType) { /* single plan */ }
export function calcCombinedStudentLoans(grossSalary, plans[]) { /* multiple plans, returns { total, monthly, breakdown[] } */ }
export function getStudentLoanPlans() { /* returns plan options with labels and thresholds */ }
```

IMPORTANT: Student loan repayments use ORIGINAL gross salary (pre salary-sacrifice) per HMRC rules.

**Step 2: Commit**
```bash
git add js/student-loans.js
git commit -m "feat: student loan calculator with all plan types and combined repayment"
```

---

### Task 4: Salary sacrifice engine (js/salary-sacrifice.js)

**Files:**
- Create: `js/salary-sacrifice.js`

```javascript
import { calcIncomeTax, calcEmployeeNI, RATES } from './tax-engine.js';
import { calcCombinedStudentLoans } from './student-loans.js';

export function calcSalarySacrifice(input) {
  // input: { grossSalary, personalPension, employerPension, cycleToWork, additionalPension, evLease, otherSacrifice, studentLoanPlans[], isScottish, bikDetails }
  // Returns: { scenarioA, scenarioB, comparison: { annualBenefit, taxSaving, niSaving }, pensionCheck }
}
```

Scenario A (with sacrifice): reduce gross by sacrifice total, calc tax/NI on reduced amount, student loan on ORIGINAL gross, BIK tax if car.
Scenario B (without sacrifice): full tax/NI on gross, deduct items from post-tax income.

Internal BIK calculation function:
- Electric: 4%, Hybrid: 4-16% by range, Petrol: 18-37% by CO2, Diesel: +4% supplement
- BIK tax = P11D value x BIK rate x marginal tax rate

**Step 2: Commit**
```bash
git add js/salary-sacrifice.js
git commit -m "feat: salary sacrifice engine with scenario A/B comparison and BIK"
```

---

### Task 5: Warnings system (js/warnings.js)

**Files:**
- Create: `js/warnings.js`

```javascript
import { RATES, calcPersonalAllowance, calcTaperedAA } from './tax-engine.js';
export function getWarnings(input) { /* returns Warning[] filtered by profile */ }
```

12 warning types, each with: id, severity (red/amber/blue), title, message, profiles[].

1. **£100k Tax Trap** (red) — PA taper, effective 60% marginal rate. Suggest pension to bring below £100k.
2. **Childcare Tax Trap** (red) — Loss of TFC + 30hrs at £100k. Shows pension needed.
3. **Pension AA Exceeded** (red) — When total contributions > annual allowance.
4. *(Student loan caveat shown as persistent UI element, not here)*
5. **Fiscal Drag** (blue) — Frozen thresholds, ~£486 extra tax.
6. **MTD Readiness** (amber) — Self-employed/landlord income >£50k.
7. **Umbrella J&SL** (amber) — Inside IR35: new April 2026 rules.
8. **Dividend Tax +2%** (blue) — Directors/investors with dividends.
9. **WFH Allowance Removed** (blue) — Employed only.
10. **BADR CGT 18%** (blue) — Directors/investors/outside IR35.
11. **ISA Cash Cap** (amber) — Investors: £12k cap from April 2027.
12. **Pension SS NI Cap** (blue) — All: £2k cap from 2029.

**Step 2: Commit**
```bash
git add js/warnings.js
git commit -m "feat: tax trap warnings system with all 12 alert types"
```

---

### Task 6: Calendar and iCal export (js/calendar.js + js/ical-export.js)

**Files:**
- Create: `js/calendar.js`
- Create: `js/ical-export.js`

calendar.js:
```javascript
export const DEADLINES = [ /* all dated deadlines + monthly/variable entries, each with profiles[] and hmrcLink */ ];
export function getProfileDeadlines(profile) { /* filtered, sorted, with urgency colour */ }
export function renderCalendar(profile, containerId) { /* builds calendar list using DOM methods */ }
```

Deadlines include: tax year start/end, P60, P11D, MTD quarterly updates (Jul/Oct/Jan/Apr), SA deadline, payment on account, ISA deadline, corp tax/accounts (variable), VAT (variable), CGT 60-day (variable), monthly umbrella payslip review.

Urgency: green (>30 days), amber (<30 days), red (<7 days or overdue).

ical-export.js:
```javascript
import { getProfileDeadlines } from './calendar.js';
export function generateICS(profile, profileLabel) { /* returns .ics string with VALARM reminders */ }
export function downloadICS(profile, profileLabel) { /* creates blob and triggers download */ }
export function googleCalendarLink(deadline) { /* returns Google Calendar URL */ }
```

Each event: summary, description with HMRC link, 1-week reminder, 1-day reminder.

**IMPORTANT:** Calendar rendering must use safe DOM methods (createElement, textContent) instead of innerHTML for any deadline data.

**Step 3: Commit**
```bash
git add js/calendar.js js/ical-export.js
git commit -m "feat: tax calendar with profile filtering, iCal export, and Google Calendar links"
```

---

### Task 7: Affiliate recommendations (js/affiliate.js)

**Files:**
- Create: `js/affiliate.js`

```javascript
export function getRecommendations(input) { /* returns affiliate[] based on profile + inputs */ }
export function renderAffiliates(containerId, recommendations) { /* renders affiliate cards using DOM methods */ }
```

Affiliate categories: accounting (FreeAgent, Xero, QuickBooks), pension (PensionBee, Vanguard SIPP), ISA (HL, Vanguard, AJ Bell), EV (Electric Car Scheme, Octopus), insurance (Qdos, Dinghy), umbrella (Parasol, Brookson), banking (Starling, Tide), accountant (ICAEW), mortgage (CMME), property (Simply Business), cycle (Cyclescheme).

All URLs are placeholder `#name` — to be replaced with actual affiliate links.
All cards labelled "Affiliate links" in the section header.

Trigger logic per profile:
- employed: EV/cycle if selected, pension, ISA if >£50k
- self-employed: MTD software if >£50k, accounting, bank, accountant
- outside-ir35: accountant, IR35 insurance, PI, bank, pension
- inside-ir35: umbrella comparison, contractor mortgage, IR35 review
- landlord: MTD if >£50k, landlord insurance, accountant
- director: accountant, pension, bank, EV if selected
- investor: ISA platforms, accountant if gains >£3k

Cross-profile: pension if approaching £100k.

**IMPORTANT:** Affiliate rendering must use safe DOM methods instead of innerHTML.

**Step 2: Commit**
```bash
git add js/affiliate.js
git commit -m "feat: contextual affiliate recommendations per profile and input triggers"
```

---

### Task 8: UI helpers (js/ui.js)

**Files:**
- Create: `js/ui.js`

```javascript
import { formatCurrency } from './tax-engine.js';
export function wireRealTimeCalc(containerSelector, calcFn) { /* binds input/change events to recalc */ }
export function setResult(id, value, options) { /* sets textContent with formatting */ }
export function getNumericInput(id, defaultVal) { /* parses numeric input */ }
export function getSelectValue(id, defaultVal) { /* gets select value */ }
export function getCheckbox(id) { /* gets checkbox state */ }
export function renderWarnings(containerId, warnings) { /* renders warning divs using DOM methods */ }
export function showIf(id, condition) { /* show/hide element */ }
export function setupCollapsibles() { /* wire collapsible sections */ }
export function updateMobileSummary(yearly, monthly) { /* update fixed bottom bar */ }
export function setupTabs(containerId, onTabChange) { /* tab switching */ }
export function setupTheme() { /* dark/light toggle with localStorage */ }
```

**IMPORTANT:** All rendering functions must use safe DOM methods (createElement, textContent, appendChild) instead of innerHTML. This is critical for security.

**Step 2: Commit**
```bash
git add js/ui.js
git commit -m "feat: shared UI helpers for real-time calculation, formatting, and interactivity"
```

---

### Task 9: Employed (PAYE) profile page

**Files:**
- Create: `profiles/employed.html`

The most comprehensive profile. Inputs:
- Annual gross salary
- Scottish tax toggle
- Childcare toggle
- Student loan plan(s) — Plan 1/2/4/5 + Postgraduate (can have both)
- Employee pension (salary sacrifice)
- Employer pension
- Additional pension sacrifice
- Cycle to Work
- EV lease (salary sacrifice) + BIK details (P11D, CO2, fuel type, electric range)

Results panel:
- Full tax breakdown (gross, sacrifice, taxable, PA, tax, NI, student loan, BIK, take-home)
- Effective/marginal rates
- BIK breakdown (when car entered)
- Scenario A vs B comparison with savings badge
- Tax/NI saving amounts

Also includes: warnings, calendar, affiliates, mobile summary bar, tax rates reference (collapsible), disclaimer.

Student loan note shown as persistent blue info box: "Repayments are calculated on your original gross salary (before salary sacrifice), per HMRC rules."

Script imports all modules and wires wireRealTimeCalc on main container.

**Step 2: Verify key scenarios in browser:**
- £55k with Plan 2 → correct tax/NI/student loan
- £105k → £100k trap warning + PA taper shown
- £95k with childcare → childcare approaching warning
- £5k pension sacrifice → savings badge shows benefit
- EV lease → BIK section appears with 4% rate

**Step 3: Commit**
```bash
git add profiles/employed.html
git commit -m "feat: employed (PAYE) profile with full calculator, warnings, calendar, affiliates"
```

---

### Task 10: Self-Employed profile page

**Files:**
- Create: `profiles/self-employed.html`

Inputs: turnover, expenses, other income, Scottish toggle, student loans, pension contribution, childcare toggle.

Results: turnover → expenses → profit → pension → PA → income tax → Class 2 NI → Class 4 NI → student loan → take-home.

Extra sections:
- Payment on account calculator (50% of tax bill each, Jan + Jul)
- Pension benefit breakdown (basic relief auto, higher relief via SA, total saving)

Warnings: MTD, fiscal drag, £100k trap, childcare, pension AA.
Calendar: SA deadlines, MTD quarterly, payment on account.
Affiliates: MTD software, accountant, bank.

**Step 2: Commit**
```bash
git add profiles/self-employed.html
git commit -m "feat: self-employed profile with Class 2/4 NI, payment on account, MTD warnings"
```

---

### Task 11: Outside IR35 Contractor profile page

**Files:**
- Create: `profiles/outside-ir35.html`

Inputs: day rate, working days per year (default 220), business expenses, pension (employer contribution via Ltd), EV via Ltd, student loans.

Calculation flow:
1. Annual revenue = day rate x working days
2. Business profit = revenue - expenses - employer pension - salary
3. Corporation tax on profit (19%/25%/marginal relief)
4. Optimal salary = £12,570 (NI-free below secondary threshold £5,000 option too)
5. Employer NI on salary
6. Retained profit = profit - corp tax
7. Dividends = retained profit (or user-specified)
8. Personal tax on salary + dividend tax on dividends
9. Total extraction = salary + dividends - personal tax - dividend tax
10. Total combined tax burden % = (corp tax + employer NI + personal tax + dividend tax) / revenue

Show optimal salary comparison: £12,570 vs £5,000 vs £0 salary scenarios.

Warnings: dividend tax +2%, BADR 18%, IR35 status review, pension AA.
Calendar: corp tax, annual accounts, confirmation statement, SA, VAT.
Affiliates: accountant, PI insurance, IR35 review, bank, pension.

**Step 2: Commit**
```bash
git add profiles/outside-ir35.html
git commit -m "feat: outside IR35 profile with salary/dividend optimizer and corp tax"
```

---

### Task 12: Inside IR35 Contractor profile page

**Files:**
- Create: `profiles/inside-ir35.html`

Inputs: assignment rate (daily), working days, umbrella margin (default £25/week), pension sacrifice, student loans.

Calculation flow:
1. Annual assignment revenue = rate x days
2. Deduct: employer NI (15% of gross above £5k), apprenticeship levy (0.5%), umbrella margin
3. Resulting gross salary = revenue - employer NI - levy - margin
4. Standard PAYE: income tax + employee NI + student loan on gross salary
5. Pension sacrifice reduces gross before tax/NI (student loan still on original)
6. Take-home = gross - tax - NI - student loan - pension

Show "rate erosion" breakdown:
- What you bill: £X/day → £Y/year
- Employer NI takes: -£Z (X%)
- Apprenticeship levy: -£Z (X%)
- Umbrella margin: -£Z
- Your gross salary: £X
- Tax + NI + SL: -£Z
- Your take-home: £X (Y% of billing rate)

Warnings: umbrella J&SL (April 2026), NI erosion, FCSA compliance check.
Calendar: monthly payslip review, SA if other income.
Affiliates: umbrella comparison, contractor mortgages, IR35 review.

**Step 2: Commit**
```bash
git add profiles/inside-ir35.html
git commit -m "feat: inside IR35 profile with umbrella deductions and NI erosion calculator"
```

---

### Task 13: Landlord profile page

**Files:**
- Create: `profiles/landlord.html`

Inputs: annual rental income, mortgage interest paid, other allowable expenses, other personal income (employment etc), pension, student loans, Scottish toggle.

Calculation flow:
1. Rental profit = income - expenses (EXCLUDING mortgage interest since Section 24)
2. Total income = rental profit + other income
3. Income tax on total income (standard bands)
4. Mortgage interest tax credit = 20% of mortgage interest (Section 24 restriction)
5. Net tax = income tax - mortgage interest credit
6. NI: only if property letting is a trade (checkbox), otherwise no NI
7. Student loan on total income
8. Take-home = total income - pension - net tax - NI - student loan

Section 24 explainer box: "Since April 2020, mortgage interest is no longer deducted from rental income. Instead, you receive a 20% tax credit. Higher/additional rate taxpayers pay more than before."

CGT on property disposal calculator (separate section):
- Sale price, purchase price, costs → gain
- CGT at 18%/24% (residential rates)
- Reminder: 60-day reporting requirement

Warnings: MTD (>£50k), mortgage interest restriction, fiscal drag, £100k trap.
Calendar: SA, payment on account, MTD quarterly, CGT 60-day report.
Affiliates: property accounting, landlord insurance, MTD tools, accountant.

**Step 2: Commit**
```bash
git add profiles/landlord.html
git commit -m "feat: landlord profile with Section 24 mortgage interest restriction and property CGT"
```

---

### Task 14: Company Director profile page

**Files:**
- Create: `profiles/director.html`

Inputs: company profit (before salary), salary amount (default £12,570), dividend amount, employer pension contribution, EV via Ltd, student loans.

Calculation flow:
1. Salary cost to company = salary + employer NI
2. Adjusted profit = company profit - salary cost - employer pension
3. Corporation tax on adjusted profit (19%/25%/marginal relief)
4. Retained profit = adjusted profit - corp tax
5. Max dividend = retained profit
6. Personal income tax on salary
7. Employee NI on salary
8. Dividend tax on dividends (using combined income for band placement)
9. Student loan on salary (dividends don't count for student loan)
10. Total personal take-home = salary + dividends - personal tax - NI - dividend tax - student loan

Show optimal extraction table:
| Salary | Dividends | Corp Tax | Personal Tax | Total Tax | Take-Home |
At £0, £5,000, £12,570 salary levels.

Employer pension section: show corp tax saving (pension is deductible expense).

Warnings: dividend tax +2%, BADR 18%, optimal salary review, pension AA, IR35 if PSC.
Calendar: corp tax, confirmation statement, annual accounts, SA, dividend vouchers, RTI.
Affiliates: accountant, pension SIPP, bank, EV, director's insurance.

**Step 2: Commit**
```bash
git add profiles/director.html
git commit -m "feat: director profile with optimal salary/dividend extraction calculator"
```

---

### Task 15: Investor profile page

**Files:**
- Create: `profiles/investor.html`

Inputs: other taxable income (employment etc), dividend income, capital gains (disposal proceeds + cost), whether BADR applies, whether residential property.

Three calculator sections:

**1. Dividend Income Calculator:**
- Dividend income → minus £500 allowance → tax at 10.75%/35.75%/40.64% based on combined income bands
- Show tax comparison: inside ISA vs outside ISA

**2. Capital Gains Calculator:**
- Disposal proceeds - cost - £3,000 exempt = taxable gain
- CGT at 18%/24% based on other income (basic/higher band)
- BADR option: flat 18%
- Residential property option: 18%/24%

**3. ISA vs GIA Comparison:**
- Investment amount, expected return %, holding period
- ISA: all growth tax-free
- GIA: dividend tax + CGT on growth
- Shows cumulative tax saved by using ISA over time

Warnings: CGT exempt only £3k, ISA cash cap 2027, BADR 18%, dividend allowance £500, IHT changes.
Calendar: SA for CGT/dividends, ISA deadline, CGT payment deadline.
Affiliates: ISA platforms (HL, Vanguard, AJ Bell), financial planning.

**Step 2: Commit**
```bash
git add profiles/investor.html
git commit -m "feat: investor profile with CGT, dividend, and ISA vs GIA calculators"
```

---

### Task 16: Final integration testing and polish

**Step 1: Test all profile pages in browser**

For each of the 7 profiles:
- [ ] Page loads without console errors
- [ ] Real-time calculation works on input
- [ ] Warnings trigger at correct thresholds
- [ ] Calendar renders with correct deadlines
- [ ] iCal download creates valid .ics file
- [ ] Affiliate recommendations appear correctly
- [ ] Theme toggle works (persists across pages)
- [ ] Mobile responsive (test at 375px width)
- [ ] Mobile summary bar shows on small screens
- [ ] Collapsible sections work
- [ ] All links (HMRC, nav) work correctly

**Step 2: Test key calculation scenarios**

- £55,000 PAYE with Plan 2: Tax ~£8,486, NI ~£3,416, SL ~£2,305
- £105,000 PAYE: PA should taper to £10,070, 60% marginal rate warning
- £100,000 self-employed with £20k expenses: Profit £80k, Class 4 NI calculated
- £500/day outside IR35 (220 days): Revenue £110k, show optimal split
- £400/day inside IR35 (220 days): Show umbrella erosion clearly
- £30,000 rental + £50,000 salary landlord: Combined band placement
- £150,000 director profit: Corp tax marginal relief
- £50,000 capital gains investor: CGT at 24% rate

**Step 3: Fix any issues found**

**Step 4: Create CNAME file if deploying to custom domain**
```bash
echo "uktaxcal.com" > CNAME
```

**Step 5: Final commit**
```bash
git add -A
git commit -m "feat: complete UK Tax Calendar v2 with all 7 profiles, real-time calculators, and monetization"
```

---

## Summary

| Task | Component | Key Feature |
|------|-----------|-------------|
| 1 | CSS + Landing | Dark/light theme, responsive, profile cards |
| 2 | tax-engine.js | All 2026/27 HMRC rates, income tax, NI, corp tax, CGT, dividends |
| 3 | student-loans.js | All 5 plan types, combined repayment, pre-sacrifice caveat |
| 4 | salary-sacrifice.js | Scenario A/B, BIK, pension check |
| 5 | warnings.js | 12 tax trap alerts, profile-filtered |
| 6 | calendar.js + ical-export.js | Dated deadlines, urgency colours, .ics download |
| 7 | affiliate.js | Contextual recommendations per profile/input |
| 8 | ui.js | Real-time binding, formatting, DOM helpers |
| 9 | employed.html | Full PAYE calculator — flagship profile |
| 10 | self-employed.html | Class 2/4 NI, payment on account |
| 11 | outside-ir35.html | Salary/dividend optimizer, corp tax |
| 12 | inside-ir35.html | Umbrella erosion calculator |
| 13 | landlord.html | Section 24, property CGT |
| 14 | director.html | Optimal extraction table |
| 15 | investor.html | CGT, dividends, ISA vs GIA |
| 16 | Integration | Cross-browser testing, scenario validation |
