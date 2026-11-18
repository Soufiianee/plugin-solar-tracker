/**
 * Downloadable datasets for /data/ (CSV, generated at build time by src/pages/data/*.csv.ts).
 * Every cell comes from the data files through the same functions the site uses. Licensed CC BY 4.0.
 * Unknown or not-applicable values keep the data files' own words ("unknown", "not_applicable").
 */
import { states, prices, assumptions, refKit, siteName, site, absUrl, isEnacted, statusLabel, effectiveDate, mainBill, yieldFor, BUILD_DATE, yields } from './data';
import { ruleValue } from './labels';
import { verdictLabel, verdictHelp, needsSystemCert } from './compat';
import { savingsFor, kitAudit, railingPct } from './findings';
import type { State } from './schema';

export const LICENSE = { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' };
const host = new URL(site.BASE_URL).host;
export const ATTRIBUTION = `Source: ${siteName} (${host})`;

type Cell = string | number | null | undefined;
/** RFC 4180: quote cells containing a comma, quote or line break; double inner quotes; CRLF line ends. */
export function csvCell(v: Cell): string {
  const s = v === null || v === undefined ? '' : String(v)
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-'); // plain ASCII punctuation for spreadsheets
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export const toCsv = (header: string[], rows: Cell[][]) => [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

const num = (v: number | 'unknown' | null | undefined) => (typeof v === 'number' ? v : 'unknown');
const yr = (v: number | null | undefined) => (typeof v === 'number' ? v.toFixed(1) : 'unknown'); // payback, one decimal as on the site
const rule = (s: State, k: keyof State['rules']) => ruleValue(k, s.rules[k].value);
const sortedStates = () => [...states].sort((a, b) => a.name.localeCompare(b.name));

export const STATES_CSV = {
  path: '/data/states.csv',
  name: 'US plug-in solar: state laws, prices and savings',
  description: `One row per state and DC: plug-in solar law status, bill, effective date, size limit, utility notice, renter and HOA rules, certification required, EIA residential electricity price, NREL PVWatts solar output for tilted (20°) and vertical railing (90°) panels, and yearly savings and payback for a reference kit at the typical share used at home.`,
  header: [
    'state_code', 'state', 'law_status', 'bill', 'effective_date', 'size_limit_ac_watts', 'utility_notice', 'renter_rules', 'hoa_rules', 'certification_required',
    'electricity_price_cents_per_kwh', 'price_period', 'tilted_kwh_per_kw_year', 'railing_kwh_per_kw_year',
    'tilted_savings_usd_per_year', 'tilted_payback_years', 'railing_savings_usd_per_year', 'railing_payback_years',
    'share_used_at_home_pct', 'reference_kit', 'reference_kit_panel_watts', 'reference_kit_cost_usd',
    'record_last_checked', 'state_page', 'source', 'license',
  ],
};
export function statesCsvRows(): Cell[][] {
  return sortedStates().map((s) => {
    const y = yieldFor(s.code);
    const sv = savingsFor(s);
    const eff = effectiveDate(s);
    const enacted = isEnacted(s);
    const cap = s.rules.max_watts_ac.value;
    return [
      s.code, s.name, statusLabel(s), mainBill(s)?.id ?? '', eff ?? (enacted ? 'unknown' : 'not_applicable'),
      cap, rule(s, 'utility_notification_required'), rule(s, 'landlord_provisions'), rule(s, 'hoa_provisions'), rule(s, 'certification_required'),
      num(sv.price), prices.period, num(y.ideal), num(y.vertical),
      sv.tilted ? sv.tilted.dollars.toFixed(2) : 'unknown', yr(sv.tilted?.paybackYears), sv.railing ? sv.railing.dollars.toFixed(2) : 'unknown', yr(sv.railing?.paybackYears),
      assumptions.self_consumption.typical_pct, `${refKit.brand} ${refKit.model}`, num(refKit.panel_w_total as number | 'unknown'), num(refKit.price_usd),
      s.last_checked, absUrl(`/states/${s.slug}/`), ATTRIBUTION, LICENSE.name,
    ];
  });
}
export const statesCsv = () => toCsv(STATES_CSV.header, statesCsvRows());

export const KITS_CSV = {
  path: '/data/kit-audit.csv',
  name: 'US plug-in solar: kit certification audit by state',
  description: 'One row per state with a plug-in solar law and per kit we track: the certification the law asks for, the kit’s stated output, our verdict label and what it means, the certificate or claim the verdict rests on, and caveats.',
  header: [
    'state_code', 'state', 'certification_required', 'certification_rule_type', 'kit', 'kit_page', 'kit_ac_output_watts', 'kit_ac_output_basis',
    'verdict', 'verdict_meaning', 'evidence_standard', 'evidence_status', 'evidence_scope', 'evidence_certifier', 'evidence_url', 'caveats',
    'kit_last_checked', 'state_last_checked', 'source', 'license',
  ],
};
export function kitsCsvRows(): Cell[][] {
  return kitAudit().map(({ state: s, kit: k, assessment: a }) => {
    const req = s.rules.certification_required.value;
    const b = a.basis;
    return [
      s.code, s.name, rule(s, 'certification_required'), req === 'unknown' ? 'unknown' : needsSystemCert(req) ? 'UL 3700 or complete system' : 'lab-listed',
      `${k.brand} ${k.model}`, absUrl(`/kits/${k.slug}/`), num(k.ac_output_w), k.ac_output_basis,
      verdictLabel[a.verdict], verdictHelp[a.verdict], b?.standard ?? '', b?.status ?? '', b?.scope ?? '', b?.certifier ?? '', b?.evidence_url ?? '', a.caveats.join(' '),
      k.last_checked, s.last_checked, ATTRIBUTION, LICENSE.name,
    ];
  });
}
export const kitsCsv = () => toCsv(KITS_CSV.header, kitsCsvRows());

/** schema.org Dataset for one CSV. */
export function datasetLd(d: { path: string; name: string; description: string; header: string[] }, anchor: string) {
  const origin = absUrl('/');
  return {
    '@context': 'https://schema.org', '@type': 'Dataset',
    name: d.name, description: d.description, url: absUrl(`/data/#${anchor}`),
    license: LICENSE.url, isAccessibleForFree: true, inLanguage: 'en-US',
    creator: { '@type': 'Organization', '@id': `${origin}#organization`, name: siteName, url: origin },
    publisher: { '@id': `${origin}#organization` },
    dateModified: BUILD_DATE, spatialCoverage: { '@type': 'Place', name: 'United States' },
    variableMeasured: d.header.filter((h) => !['source', 'license', 'state_page', 'kit_page'].includes(h)),
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absUrl(d.path) }],
    creditText: ATTRIBUTION,
  };
}

// ---------- railing (vertical 90°) vs tilted (20°), one row per state capital ----------
export const RAILING_CSV = {
  path: '/data/railing-vs-tilted.csv',
  name: 'US plug-in solar: balcony railing (vertical) vs tilted panel output by state',
  description: 'One row per state and DC: modelled yearly output per kW of panels at the state capital for panels tilted at 20° and hung vertically (90°) on a railing, both facing south, and railing output as a percentage of tilted, from NREL PVWatts v8.',
  header: ['state_code', 'state', 'location', 'lat', 'lon', 'tilted_20deg_kwh_per_kw_year', 'railing_90deg_kwh_per_kw_year', 'railing_pct_of_tilted', 'has_plug_in_law', 'model', 'solar_data_last_checked', 'source', 'license'],
};
export function railingCsvRows(): Cell[][] {
  return sortedStates().map((s) => {
    const y = yields.states[s.code];
    const p = railingPct(s.code);
    return [s.code, s.name, y.location, y.lat, y.lon, num(y.scenarios.ideal.kwh_per_kw_year), num(y.scenarios.vertical.kwh_per_kw_year), p ?? 'unknown', isEnacted(s) ? 'yes' : 'no', yields.model, yields.last_checked, ATTRIBUTION, LICENSE.name];
  });
}
export const railingCsv = () => toCsv(RAILING_CSV.header, railingCsvRows());
