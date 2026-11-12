/**
 * Single entry point for all site data. Parses every file through the zod schemas at build time,
 * so a page can never render invalid data.
 */
import statesRaw from '../../data/states.json';
import kitsRaw from '../../data/kits.json';
import pricesRaw from '../../data/electricity_prices.json';
import yieldRaw from '../../data/solar_yield.json';
import updatesRaw from '../../data/updates.json';
import affiliatesRaw from '../../config/affiliates.json';
import assumptionsRaw from '../../data/assumptions.json';
import siteRaw from '../../config/site.json';
import { statesFile, kitsFile, pricesFile, yieldFile, updatesFile, affiliatesFile, siteFile, assumptionsFile, type State, type Kit } from './schema';
import { assess, type CompatState, type Verdict, type Assessment } from './compat';
import { scenario } from './calc';
import { showRooftopBox } from './offers';
import { todayIso, displayStatus, effectivePhrase } from './effective';

/** Build date ("today" in Hawaii, the last US state to reach a date; see effective.ts). */
export const BUILD_DATE = (() => {
  // SITE_TODAY=YYYY-MM-DD simulates a build date (testing the effective-date switch); never set it in production
  const o = process.env.SITE_TODAY;
  if (o && !/^\d{4}-\d{2}-\d{2}$/.test(o)) throw new Error('SITE_TODAY must be YYYY-MM-DD');
  return o || todayIso();
})();
/**
 * States as shown on the site. A law stored as "passed, not yet in effect" is shown as "in effect" once its
 * effective date has arrived at build time, so a rebuild on the effective date flips every page at once.
 */
export const states = statesFile.parse(statesRaw).map((s) => {
  const eff = s.bills.find((b) => b.stage === 'signed_into_law')?.effective_date ?? null;
  return { ...s, status: displayStatus(s.status, eff, BUILD_DATE) };
});
export const kits = kitsFile.parse(kitsRaw);
export const prices = pricesFile.parse(pricesRaw);
export const yields = yieldFile.parse(yieldRaw);
export const updates = updatesFile.parse(updatesRaw).sort((a, b) => b.date.localeCompare(a.date));
export const affiliates = affiliatesFile.parse(affiliatesRaw);
export const assumptions = assumptionsFile.parse(assumptionsRaw);
export const site = siteFile.parse(siteRaw);
/** Display name (config/site.json SITE_NAME is the single source). */
export const siteName = site.SITE_NAME;
/** Off in the claude.ai Artifact copy (ARTIFACT_BUILD=1), whose host blocks third-party scripts. */
export const mailerlite = site.MAILERLITE.account && site.MAILERLITE.form_id && !process.env.ARTIFACT_BUILD ? site.MAILERLITE : null;
/** Partners interest form (separate MailerLite form tied to the "Partners" group); null until its form ID is set. */
export const partnersForm = mailerlite && site.MAILERLITE_PARTNERS_FORM_ID ? { account: mailerlite.account, form_id: site.MAILERLITE_PARTNERS_FORM_ID } : null;

export const byCode = Object.fromEntries(states.map((s) => [s.code, s])) as Record<string, State>;
export const bySlug = Object.fromEntries(states.map((s) => [s.slug, s])) as Record<string, State>;

export const isEnacted = (s: State) => s.status === 'enacted_in_effect' || s.status === 'enacted_not_yet_effective';

export const STATUS: Record<State['status'], { label: string; short: string; cls: string; order: number }> = {
  enacted_in_effect: { label: 'Law in effect', short: 'In effect', cls: 'st-effect', order: 1 },
  enacted_not_yet_effective: { label: 'Law passed, not yet in effect', short: 'Passed', cls: 'st-passed', order: 2 },
  bill_active: { label: 'Bill active', short: 'Bill active', cls: 'st-active', order: 3 },
  bill_failed_or_dead: { label: 'Bill failed or died', short: 'Bill died', cls: 'st-dead', order: 4 },
  no_bill_found: { label: 'No bill found', short: 'No bill', cls: 'st-none', order: 5 },
  unknown: { label: 'Status not yet confirmed', short: 'Unconfirmed', cls: 'st-unknown', order: 6 },
};
export const statusLabel = (s: State) => s.status_label ?? STATUS[s.status].label;

export const mainBill = (s: State) => s.bills.find((b) => b.stage === 'signed_into_law') ?? s.bills[0] ?? null;
export const effectiveDate = (s: State): string | null => {
  const b = s.bills.find((x) => x.stage === 'signed_into_law');
  return b && /^\d{4}-\d{2}-\d{2}$/.test(b.effective_date) ? b.effective_date : null;
};

export function compatState(s: State): CompatState {
  return {
    code: s.code,
    enacted: isEnacted(s),
    cap: s.rules.max_watts_ac.value as CompatState['cap'],
    certReq: s.rules.certification_required.value,
  };
}
export const kitAssess = (s: State, k: Kit): Assessment => assess(compatState(s), k);
export const kitVerdict = (s: State, k: Kit): Verdict => kitAssess(s, k).verdict;

export const ul3700 = (k: Kit) => k.certifications.find((c) => c.standard === 'UL 3700');

/**
 * Every outbound product or partner link goes through config/affiliates.json.
 * A slot is live only when BOTH affiliate_id and link_template are set; then the link is marked sponsored.
 * Otherwise the plain official URL is used (or, with no URL, no link at all).
 */
export const SPONSORED_REL = 'sponsored noopener';
export interface OutLink { href: string; rel: string; sponsored: boolean }
export function affiliateLink(slot: string, url?: string): OutLink | null {
  const a = affiliates[slot];
  if (a && a.affiliate_id && a.link_template) {
    const href = a.link_template.replace('{url}', encodeURIComponent(url ?? '')).replace('{raw_url}', url ?? '').replace('{id}', encodeURIComponent(a.affiliate_id));
    return { href, rel: SPONSORED_REL, sponsored: true };
  }
  return url ? { href: url, rel: 'noopener', sponsored: false } : null;
}
export function retailerLink(r: Kit['retailers'][number]): OutLink {
  return affiliateLink(r.affiliate_slot, r.url)!;
}
export const anySponsored = () => Object.values(affiliates).some((a) => a.affiliate_id && a.link_template);

export const priceFor = (code: string) => prices.states[code];
export const yieldFor = (code: string) => {
  const y = yields.states[code];
  return { ideal: y.scenarios.ideal.kwh_per_kw_year, vertical: y.scenarios.vertical.kwh_per_kw_year };
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function fmtDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso === 'unknown' ? 'Unknown' : iso;
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
export const lastCheckedAll = () => states.map((s) => s.last_checked).sort()[0];

/** "Starts January 1, 2027" / "In effect since January 1, 2027" for a state's law (null without a known date). */
export function effectiveText(s: State): string | null {
  const e = effectiveDate(s);
  return e ? effectivePhrase(e, BUILD_DATE, fmtDate) : null;
}
export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((Date.parse(toIso + 'T00:00:00Z') - Date.parse(fromIso + 'T00:00:00Z')) / 86400000);
}

/** Reference kit for payback figures (same kit prefilled in the calculator and used in the guides). */
export const refKit = (() => {
  const k = kits.find((x) => x.slug === assumptions.rooftop_box.reference_kit);
  if (!k) throw new Error(`assumptions.rooftop_box.reference_kit "${assumptions.rooftop_box.reference_kit}" is not in kits.json`);
  return k;
})();
/** Typical payback (years, 1 decimal) of the reference kit at ideal tilt; null when any input is unknown. */
export function referencePayback(s: State): number | null {
  const price = priceFor(s.code);
  const y = yieldFor(s.code).ideal;
  const w = refKit.panel_w_total;
  const cost = refKit.price_usd;
  if (typeof price !== 'number' || typeof y !== 'number' || typeof w !== 'number' || typeof cost !== 'number') return null;
  return scenario(w, y, price, assumptions.self_consumption.typical_pct, cost).paybackYears;
}
export const rooftopFor = (s: State) => showRooftopBox(isEnacted(s), referencePayback(s), assumptions.rooftop_box.min_payback_years);

export const absUrl = (path: string) => new URL(path, site.BASE_URL).toString();
