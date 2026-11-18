# Report

Status as of **10 November 2026**. The site builds, validates and is ready to deploy. One input is still missing: solar-yield figures, which need a working NREL API key (see open questions).

## What was built

- **Static Astro site**, 71 pages: home with the state tool, 51 state pages, a states index, 10 kit pages and a kits index, Certification watch, updates (with RSS), About, How we verify, Disclaimer, Privacy and Affiliate disclosure. The Contact page is generated only once `CONTACT_EMAIL` is set.
- **The tool** (home page), with three ways to pick a state: a type-to-jump select, an inline SVG tile map (one keyboard-focusable square per state) and a list view. The result card is announced to screen readers and shows:
  - a status pill with a word, not just a colour;
  - a countdown to the effective date, computed in the browser;
  - the key rules, each with a source link;
  - kits with conservative verdicts, and a link to Certification watch when no kit is confirmed.
  The savings estimator shows two scenarios (20° "ideal tilt" and 90° "vertical railing") with a payback range, and a "How we calculate" disclosure. A state can be shared as `/#state-xx`.
- **Certification watch**: UL 3700 status for every kit, with scope (component vs complete system), certifier, conditions and evidence. It lists the states that require UL 3700 or complete-system certification. The email alert uses MailerLite (account 2784312, form o2Ywz2, set in `config/site.json`). Our state dropdown fills MailerLite's "State" field, and MailerLite's script loads only on this page and in the tool when a state has no compatible kit.
- **SEO**: a unique title and description per page from the data, canonical URLs, sitemap.xml, robots.txt and BreadcrumbList JSON-LD on every page. FAQPage JSON-LD appears only where a visible FAQ exists; Dataset JSON-LD is on the home page. Each state has a 1200×630 Open Graph image generated at build time. State pages link to bordering states.
- **Data safety**: zod schemas, and `npm run build` runs validation first, so the build fails on invalid data. The rules are enforced in code:
  - a "certified" kit must have certificate evidence;
  - rules can only be set for enacted laws;
  - every set rule needs a source.
- **Maintenance kit**:
  - `npm run staleness`: lists records older than 7 days, dates in the next 60 days and the retry list;
  - `npm run yield`: PVWatts, both scenarios, all states;
  - `npm run linkcheck [-- --external]`;
  - `MAINTENANCE_PROMPT.md` and `DEPLOY.md`.

## Data summary

**States by status (51):**

| Status | Count | States |
|---|---|---|
| Law in effect | 6 | CO, CT, ME, MD, UT, VT |
| Law passed, not yet in effect | 4 | CA (Jan 1 2027), NH (signed, details being verified), NJ (Mar 1 2027), VA (Jan 1 2027) |
| Bill active | 6 | DC, MA, MI, NC, NY, PA |
| Bill failed or died | 14 | AK, GA, ID, IN, IA, MN, MO, NM, OK, OR, SC, WA, WV, WY |
| Status not yet confirmed | 6 | AZ, DE, HI, IL, OH, RI |
| No bill found | 15 | AL, AR, FL, KS, KY, LA, MS, MT, NE, NV, ND, SD, TN, TX, WI |

**Kits (10), by UL 3700 status:**
- **Certified: 1.** APsystems EZ1-LV, *component only*, from a CSA certificate.
- **Claimed: 2.** Hoymiles HiFlow Pro, 391 and 420 W.
- **Not certified: 2.** Bright Saver 180 W and 360 W kits.
- **Unknown: 5.** EcoFlow (3 products) and CraftStrom (2 products).

No kit is "compatible" anywhere. No complete system has a certificate, so in every enacted state the best verdict is "check with seller".

**Prices:** EIA Form 861M, residential, rolling 12 months September 2025 – August 2026, for all 51 states and DC.
**Solar yield:** 10 states have the ideal-tilt figure (demo-key runs); all vertical figures and 41 ideal figures are pending. The site shows no estimate where a figure is missing.

## Phase 2 gap fixes (owner's item 7)

- **Session-end dates from official journals**: AK May 20, GA Apr 2, ID Apr 2, IA May 2, MO May 28, OK May 14, SC May 14. NM is still unverified (no journal found online). NCSL's calendar was wrong for GA, ID, IA and SC; those were corrected from the journals.
- **Colorado**: the Secretary of State's list of 2026 ballot measures includes no referendum on HB26-1007, so August 12, 2026 stands.
- **CraftStrom**: the spec sheet gives only "Ppeak: 350W @120V" per inverter, so the kit totals (700 W and 1,050 W) are marked *estimated*.
- **Derived dates** are labelled on the site: NJ (six months after enactment), CA (constitutional January 1 default), CO (90 days after adjournment) and ME (general effective date).

## QA results

- `npm run build`: 71 pages, **0 warnings**. `npm test`: **13 tests passing**, including 6 hand-checked calculator cases.
- Internal link check: **2,005 links, 0 broken**.
- External source check: **89 URLs; 17 not 2xx from our environment** (`research/LINKCHECK.md`). None are dead pages:
  - 10 were PVWatts API URLs needing a key; those sources now point to the PVWatts docs instead;
  - 7 are sites that block automated clients or send incomplete certificate chains (gc.nh.gov, leginfo.legislature.ca.gov, leg.colorado.gov, cga.ct.gov ×2, ilga.gov, legislature.ohio.gov). They should work in a normal browser.
- **Lighthouse, mobile** (local preview):

  | Page | Performance | Accessibility | Best practices | SEO |
  |---|---|---|---|---|
  | `/` | 100 | 100 | 100 | 100 |
  | `/states/vermont/` | 100 | 100 | 100 | 100 |
  | `/kits/apsystems-ez1-lv/` | 100 | 100 | 100 | 100 |

- **JavaScript**: one 6.3 KB bundle, on the home page only, plus a tiny inline theme script.
- **Layout**: 5 pages checked at 360, 768 and 1280 px in light and dark themes. No horizontal overflow and no console errors. Tables stack into labelled rows on phones.

## Open questions

1. **NREL key**: the key saved for developer.nlr.gov is rejected (`API_KEY_INVALID`). It also overrides the public demo key, so no yield runs can happen until it is fixed. Re-enter a valid key, then run `npm run yield`.
2. ~~New repository~~ Done: the project is the root of github.com/Soufiianee/plugin-solar-tracker.
3. **New Hampshire**: waiting on your check of gc.nh.gov.
4. ~~Signup provider~~ Done: MailerLite. In MailerLite, also edit the form's default copy ("Newsletter / Signup for news and special offers!"). The site hides that heading, but confirmation emails may reuse it.
5. `SITE_NAME`, `BASE_URL` and `CONTACT_EMAIL` are still empty or placeholders.

## Known limits

- Status for OH, IL, HI, DE, AZ and RI is unconfirmed (official sites unreachable or unread). They are on the weekly retry list.
- 14 "no bill found" states rely on trackers plus our own search outcome, not each legislature's own search (Florida was searched directly).
- UL Product iQ and the CSA directory were unreachable, so certification evidence comes from manufacturer-hosted certificates.
- Yields are modelled for the state capital only; real balconies vary by orientation and shade.
- Guides: "Is it worth it?" and "Renters" are written. "How plug-in solar works", "HOA" and "UL 3700 explained" are still to do.
- Dates printed on pages are fixed at build time, so redeploy weekly. Countdowns update in the browser.

## Top 5 next improvements

1. Fix the NREL key and fill both yield scenarios for all 51 states.
2. Write the remaining guides: UL 3700 explained, HOA, and how plug-in solar works.
3. Confirm the 6 unconfirmed states and the 14 "no bill" states on their own legislature search pages.
4. Add a per-kit "what the certificate covers" explainer, and a state-specific checklist (forms, notice periods) to each enacted state page.
5. Add a ZIP-to-utility lookup for the notification forms (VA SCC form, MD and ME utility notices), from official utility commission pages.

## Domains fetched during research

**Worked** (official sources, government data, manufacturer pages, leads):

```
le.utah.gov  leg.colorado.gov  mgaleg.maryland.gov  legislature.vermont.gov  legislature.maine.gov
www.legislature.maine.gov  lis.virginia.gov  lis.blob.core.windows.net  www.cga.ct.gov (needs GoDaddy G2 intermediate)
www.njleg.state.nj.us  pub.njleg.state.nj.us  downloads.leginfo.legislature.ca.gov  nyassembly.gov
malegislature.gov  lims.dccouncil.gov  legislature.mi.gov  www.palegis.us  www.ncleg.gov  www.akleg.gov
www.legis.ga.gov  legislature.idaho.gov  iga.in.gov  www.legis.iowa.gov  www.revisor.mn.gov  house.mo.gov
www.senate.mo.gov  www.nmlegis.gov  www.oklegislature.gov  www.oksenate.gov  olis.oregonlegislature.gov
www.scstatehouse.gov  app.leg.wa.gov  lawfilesext.leg.wa.gov  www.wvlegislature.gov  wyoleg.gov  web.wyoleg.gov
webserver.rilegislature.gov  status.rilegislature.gov  www.flsenate.gov  www.sos.state.co.us
www.eia.gov  developer.nlr.gov  www.nlr.gov
usa.apsystems.com  apshop.apsystems.com  apsystems.filecloudonline.com  us.ecoflow.com  www.hoymiles.com
www.brightsaver.org  brightsaver.org  craftstrom.com
pluginsolarguide.com  yoursolarplug.com  exactsolar.substack.com  thirdact.org  electrek.co
bills.nhliberty.org  documents.ncsl.org  sd11.senate.ca.gov  www.gov.ca.gov  certs.godaddy.com  archive.org
```

**Tried but blocked or unreachable** (no need to allow unless you want to retry):
`gc.nh.gov`, `www.energy.nh.gov`, `www.governor.nh.gov`, `leginfo.legislature.ca.gov` (bot check), `www.capitol.hawaii.gov` (403), `legis.delaware.gov` (error page), `apps.azleg.gov`, `www.legislature.ohio.gov` and `www.ilga.gov` / `ilga.gov` (incomplete certificate chain), `www.nysenate.gov` (403), `legiscan.com` (bot check), `productiq.ulprospector.com` (403), `directories.csagroup.org` (502), `developer.nrel.gov` / `www.nrel.gov` / `pvwatts.nrel.gov` (moved to nlr.gov), `crt.sectigo.com`, `crt.sh`, `web.archive.org`.

**Package installs**: `registry.npmjs.org`.

**The deployed site** makes no third-party requests apart from Cloudflare Web Analytics (enabled in the Cloudflare dashboard; `static.cloudflareinsights.com`) or a signup embed (your provider's domain).

## Update (session 2)

- Moved to its own repository: github.com/Soufiianee/plugin-solar-tracker (branch `main`).
- `SITE_NAME`, `BASE_URL` and `CONTACT_EMAIL` are each one value in `config/site.json`. The "TBD" fallback name is handled in one place (`src/lib/data.ts`).
- MailerLite alerts added; `/privacy` names MailerLite.
- Guides: `/guides/is-it-worth-it/` (numbers built from the data) and `/guides/renters/`.
- **Compatibility audit** (`npm run compat-audit` → `research/COMPAT_AUDIT.md`): a proposed model for "lab-listed" states, awaiting the owner's approval. **The site's verdicts are unchanged.**
- NREL key: still returns `API_KEY_INVALID` through the proxy. Yields are unchanged.

## Update (session 3)

- **Compatibility model applied** (owner-approved):
  - **Lab-listed states** (UT, MD, CO, CT, VA): a lab certificate seen for the inverter gives "Likely compatible: confirm with seller" (APsystems EZ1-LV). A maker claim gives "Listing claimed, no certificate seen".
  - **UL 3700 states** (VT, ME, NJ, CA): unchanged. "Component certificate only: check with seller" and "UL 3700 claimed, no certificate seen".
  - Every label has a one-line explanation (tooltip and legend) and links to the certificate or the maker's claim.
  - Device-count caveat for multi-inverter kits in CT and MD. Maine page notes the National Electrical Code route.
  - `npm run compat-audit` prints the live matrix.
- **Savings**: typical share used at home is 69%, from the HTW Berlin Stecker-Solar-Simulator (800 W, no battery, vertical, 3,000 kWh/yr home). The other runs gave 56% at 2,100 kWh and 88% at 5,000 kWh. The best case is 100%. The calculator has a slider. Sources and limits are in `data/assumptions.json`.
- **Vertical-railing figures** are hidden everywhere until the yield data exists.
- **MailerLite form** restyled with our design tokens in both themes; the default heading is hidden.
- **NREL**: `npm run yield` now also reads a gitignored `.env`. The proxy-injected key still returns `API_KEY_INVALID`, so yields are unchanged (10 states, ideal tilt only).

## Update (session 4)

- **Solar yield complete**: NREL PVWatts v8 for all 50 states and DC, both scenarios (20° tilt and vertical 90°, facing south), 102 values with no unknowns. The key is held only in the environment's network secret (injected by the proxy); it is not in `.env`, the data, the logs or git. Verification call (Salt Lake City, 1 kW, 20°) returned ac_annual = 1492.62.
- Vertical-railing figures now appear in the guide, the tool and state pages.
- Calculator: starts on the reference kit (EcoFlow STREAM + 2×400 W, $1,099 as listed); short kit names in the dropdown; payback always shown with one decimal.
- Headings: self-hosted Source Serif 4 (OFL, one weight, Latin subset, preloaded).

## Update (session 5): press prep, 16 November 2026

- **/about/** rewritten brand-first: "Balcony Solar Rules is an independent site run by Soufiane L., an independent researcher." What the site does, how facts are checked (legislature texts, certificates, NREL PVWatts, EIA prices, check dates on every page), independence, corrections, contact. No surname, address, phone, photo or social links. AboutPage + Organization + Person ("Soufiane L.", `worksFor` the Organization; the Organization has `founder`, `publishingPrinciples` and `correctionsPolicy`).
- **/corrections/**: how to report (email with a source), review within `CORRECTIONS_REVIEW_DAYS` (7, config/site.json), how corrections are logged on /updates/ with the date, and the list of corrections so far. Linked from About, the footer, How we verify and every state page's Sources block. Update entries now have a `method_change` kind; three 10 November entries that were method changes (not corrections) were reclassified, and /updates/ tags "Correction" and "Method change".
- **/data/**: "US plug-in solar: state laws, kits and savings data (updated <build date>)". Six key findings, each computed in `src/lib/findings.ts` / `src/lib/press.ts` with a method link; a label-count table for the kit audit; two CSVs generated at build time (`/data/states.csv`, 51 rows × 26 columns; `/data/kit-audit.csv`, 100 rows × 20 columns), CC BY 4.0 with "Source: Balcony Solar Rules (balconysolarrules.com)" on every row; a "Cite this data" box; one Dataset JSON-LD per CSV. CSVs are served with CORS open (`public/_headers`).
- **/press/**: 3 story angles and 5 quote-ready facts, all computed; contact and "Soufiane L., editor". Footer: Corrections, Data, For journalists.
- **Bylines**: the four guides show "By Soufiane L. · Updated <date>" linking to /about/; Article `author` is the Person. "Updated" is the newest check date of the data each guide uses.
- The "Is it worth it?", "Railing vs tilted" and California guides now take their headline ranges and the price rank from `src/lib/findings.ts`, so they always match /data/. Fixed the California guide's "of the 51 states and DC" (51 already includes DC).
- QA: build 0 errors; 73 tests (14 new: findings recomputed independently from the raw JSON, CSV generation, built pages match); 3,580 internal links, 0 broken; Lighthouse mobile 100/100/100/100 on /about/, /data/, /press/, /corrections/, /, /states/vermont/ and /guides/is-it-worth-it/.

## Update (session 6): New Hampshire full record, 17 November 2026

- **NH record** now primary: SB 540-FN, Chapter 262, Laws of 2026, signed July 2, 2026, in effect January 1, 2027 (the build-date switch flips it, as for California). 1,200 W AC, one system per metered customer, no utility approval, interconnection review or fees, optional wattage notice only if the utility sets up a way, NRTL certification to nationally recognized standards (no standard named), renters and HOAs not addressed. Battery and net-metering rules held as unknown. Docket vs chaptered-text date conflict recorded in research/RESEARCH_NOTES.md.
- **Sources:** gc.nh.gov bill status and RSA 362-A:10, 362-A:1-a, 374:1-b, 155-A:16 pages, read by the admin research agent on 2026-11-17. gc.nh.gov gives an empty reply to the build environment, so the build agent could not re-fetch them; each source says so.
- **Kits:** NH is judged as lab-listed (like Colorado), with the one-device caveat (like CT and MD). New update kind `data_update`; Jan 1 email draft for NH key-dates subscribers (`npm run email:nh`, research/emails/2027-01-01-new-hampshire.md). How we verify now builds its state lists from the data.
- QA: 80 tests (7 new for NH), 3,583 internal links, 0 broken.

## Update (session 7): press prep follow-up, 18 November 2026

- **/about/**: run and written by Soufiane Lqadi (owner's instruction; `EDITOR_NAME` in config/site.json, so bylines, /press/ and Person schema match). Research method spelled out: statutes, the kit audit and every label (from src/lib/compat.ts), savings sources (EIA, NREL PVWatts v8, HTW Berlin), schedule (daily rebuild, weekly checks), no paid placement. Contact by email only.
- **/data/railing-vs-tilted/**: new journalist data page: summary, table for every state capital, method, sources, CSV `/data/railing-vs-tilted.csv` built at build time (CC BY 4.0), Dataset JSON-LD.
- **/press/**: "Key facts and dates" section built from data: signed-law count, each upcoming effective date (CA, NH, VA Jan 1 2027; NJ Mar 1 2027), and the kit certification fact; links to the data pages and About.
- Sitemap and footer include the new page. QA: 83 tests, 3,761 internal links, 0 broken; Lighthouse mobile 100 ×4 on /about/, /data/railing-vs-tilted/, /press/.
