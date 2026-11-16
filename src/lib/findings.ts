/**
 * Key findings for the press pages (/data/, /press/) and the guides. Every number is computed here from the
 * data files, so the data page, the press page, the guides and the CSV downloads can never disagree.
 * tests/findings.test.ts recomputes each figure independently from the raw JSON.
 */
import {
  states, kits, prices, yields, assumptions, refKit, byCode, isEnacted, statusLabel, effectiveDate, mainBill,
  priceFor, yieldFor, kitAssess, BUILD_DATE,
} from './data';
import { scenario } from './calc';
import { VERDICT_ORDER, type Verdict } from './compat';
import { STAGE } from './labels';
import type { State } from './schema';

const byName = (a: State, b: State) => a.name.localeCompare(b.name);

/** States with a signed plug-in solar law (in effect or not yet), A–Z. */
export const lawStates = (): State[] => states.filter(isEnacted).sort(byName);

/** "A, B and C" */
export const andList = (a: string[]) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
export const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;

// ---------- laws ----------
export function lawFindings() {
  const signed = lawStates();
  const inEffect = signed.filter((s) => s.status === 'enacted_in_effect');
  const notYet = signed.filter((s) => s.status === 'enacted_not_yet_effective');
  const beingVerified = signed.filter((s) => s.verification === 'secondary_only');
  const ny = byCode.NY;
  const nyBill = mainBill(ny);
  return {
    signed, inEffect, notYet, beingVerified,
    ny: { state: ny, enacted: isEnacted(ny), label: statusLabel(ny), bill: nyBill, stage: nyBill ? STAGE[nyBill.stage] : null },
  };
}

// ---------- kits (audit of every law state x every kit, same model as the site) ----------
export interface AuditPair { state: State; kit: (typeof kits)[number]; verdict: Verdict; assessment: ReturnType<typeof kitAssess> }
export function kitAudit(): AuditPair[] {
  return lawStates().flatMap((s) => kits.map((k) => { const a = kitAssess(s, k); return { state: s, kit: k, verdict: a.verdict, assessment: a }; }));
}
export function kitFindings() {
  const pairs = kitAudit();
  const labelCounts = VERDICT_ORDER.map((v) => ({ verdict: v, n: pairs.filter((p) => p.verdict === v).length })).filter((x) => x.n > 0);
  const compatiblePairs = pairs.filter((p) => p.verdict === 'compatible');
  const completeSystemKits = kits.filter((k) => k.certifications.some((c) => c.status === 'certified' && c.scope === 'complete_system'));
  const ul = (status: string) => kits.filter((k) => k.certifications.some((c) => c.standard === 'UL 3700' && c.status === status)).length;
  const ul3700 = { certified: ul('certified'), claimed: ul('pending_or_claimed'), not_certified: ul('not_certified') };
  const ul3700Unknown = kits.length - ul3700.certified - ul3700.claimed - ul3700.not_certified;
  const statesWithCompatible = [...new Set(compatiblePairs.map((p) => p.state.code))];
  return { pairs, kitCount: kits.length, stateCount: lawStates().length, labelCounts, compatiblePairs, statesWithCompatible, completeSystemKits, ul3700: { ...ul3700, unknown: ul3700Unknown } };
}

// ---------- savings (reference kit, typical share used at home) ----------
export interface StateSavingsRow {
  state: State;
  price: number | 'unknown';
  tilted: ReturnType<typeof scenario> | null;
  railing: ReturnType<typeof scenario> | null;
}
export const refKitW = () => refKit.panel_w_total as number;
export const refKitCost = () => refKit.price_usd as number;
export function savingsFor(s: State, sharePct = assumptions.self_consumption.typical_pct): StateSavingsRow {
  const price = priceFor(s.code);
  const y = yieldFor(s.code);
  const W = refKit.panel_w_total;
  const cost = refKit.price_usd;
  const run = (yy: number | 'unknown') =>
    typeof yy === 'number' && typeof price === 'number' && typeof W === 'number' && typeof cost === 'number' ? scenario(W, yy, price, sharePct, cost) : null;
  return { state: s, price, tilted: run(y.ideal), railing: run(y.vertical) };
}
type Extreme = { state: State; years: number };
function range(rows: StateSavingsRow[], key: 'tilted' | 'railing'): { best: Extreme; worst: Extreme } | null {
  const xs = rows.flatMap((r) => (r[key]?.paybackYears != null ? [{ state: r.state, years: r[key]!.paybackYears! }] : []));
  if (!xs.length) return null;
  // ties: alphabetical, so the result is stable
  const sorted = [...xs].sort((a, b) => a.years - b.years || byName(a.state, b.state));
  return { best: sorted[0], worst: [...xs].sort((a, b) => b.years - a.years || byName(a.state, b.state))[0] };
}
/** Payback range (best to worst state) in the states with a plug-in law, at the typical share. */
export function paybackFindings() {
  const rows = lawStates().map((s) => savingsFor(s));
  return { sharePct: assumptions.self_consumption.typical_pct, kit: refKit, W: refKitW(), cost: refKitCost(), states: rows.filter((r) => r.tilted || r.railing).length, tilted: range(rows, 'tilted'), railing: range(rows, 'railing') };
}

// ---------- railing vs tilted output ----------
export const railingPct = (code: string): number | null => {
  const y = yieldFor(code);
  return typeof y.ideal === 'number' && typeof y.vertical === 'number' ? Math.round((y.vertical / y.ideal) * 100) : null;
};
function pctRange(list: State[]) {
  const xs = list.flatMap((s) => { const p = railingPct(s.code); return p === null ? [] : [{ state: s, pct: p }]; });
  if (!xs.length) return null;
  const lo = [...xs].sort((a, b) => a.pct - b.pct || byName(a.state, b.state))[0];
  const hi = [...xs].sort((a, b) => b.pct - a.pct || byName(a.state, b.state))[0];
  return { min: lo.pct, max: hi.pct, minState: lo.state, maxState: hi.state, n: xs.length };
}
export function railingFindings() {
  return { lawStates: pctRange(lawStates()), all: pctRange([...states].sort(byName)) };
}

// ---------- prices ----------
/** Rank of a state's EIA residential price among the jurisdictions with a known price (1 = most expensive). */
export function priceRank(code: string) {
  const known = Object.entries(prices.states).filter((e): e is [string, number] => typeof e[1] === 'number').sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const i = known.findIndex(([c]) => c === code);
  return { rank: i < 0 ? null : i + 1, of: known.length };
}

// ---------- California ----------
export function californiaFindings() {
  const s = byCode.CA;
  const eff = effectiveDate(s);
  const price = priceFor('CA');
  const { rank, of } = priceRank('CA');
  return { state: s, effective: eff, inEffect: !!eff && eff <= BUILD_DATE, price, rank, of, compatibleKits: kits.filter((k) => kitAssess(s, k).verdict === 'compatible').length };
}

// ---------- renters ----------
export function renterFindings() {
  const law = lawStates();
  return {
    protects: law.filter((s) => s.rules.landlord_provisions.value === 'protects_tenants'),
    silent: law.filter((s) => s.rules.landlord_provisions.value === 'not_addressed' || s.rules.landlord_provisions.value === 'notice_rules_only'),
    unknown: law.filter((s) => s.rules.landlord_provisions.value === 'unknown'),
  };
}

/** Newest date among the inputs the press data is built from. */
export const dataLastChecked = () => [...states.map((s) => s.last_checked), ...kits.map((k) => k.last_checked), prices.last_checked, yields.last_checked, assumptions.last_checked].sort().reverse()[0];
