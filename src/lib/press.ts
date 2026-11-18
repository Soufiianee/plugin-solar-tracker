/**
 * Press sentences for /data/ and /press/. Each is built from src/lib/findings.ts, so no figure is typed by hand.
 * Every finding carries the link to its method.
 */
import { fmtDate, BUILD_DATE, siteName, absUrl, site, mainBill, effectiveDate } from './data';
import { fmtUsd } from './calc';
import { verdictLabel, needsSystemCert } from './compat';
import { ruleValue } from './labels';
import { lawFindings, kitFindings, paybackFindings, railingFindings, californiaFindings, renterFindings, andList, ordinal } from './findings';

export interface Finding { id: string; title: string; text: string; method: { href: string; label: string } }

const yrs = (n: number) => `${n.toFixed(1)} years`;
/** "a" or "an" before a number as spoken ("an 800 W kit", "an 11 W", "a 1,200 W"). */
export const aN = (n: number) => { const s = String(Math.round(n)); return /^8/.test(s) || (/^1[18]/.test(s) && s.length % 3 === 2) ? 'an' : 'a'; };
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function keyFindings(): Finding[] {
  const L = lawFindings();
  const K = kitFindings();
  const P = paybackFindings();
  const R = railingFindings();
  const C = californiaFindings();
  const out: Finding[] = [];

  const verifying = L.beingVerified.length ? `; ${andList(L.beingVerified.map((s) => s.name))}'s details are still being verified on an official source` : '';
  out.push({
    id: 'laws', title: 'State laws',
    text: `${plural(L.signed.length, 'state has', 'states have')} signed a plug-in solar law: ${andList(L.signed.map((s) => s.name))} (${L.inEffect.length} in effect, ${L.notYet.length} not yet in effect${verifying}).`,
    method: { href: '/how-we-verify/#state-laws', label: 'How we verify state laws' },
  });

  const ny = L.ny;
  const nyBill = ny.bill;
  let nyText: string;
  if (ny.enacted && nyBill) nyText = `New York's ${nyBill.id} was signed on ${fmtDate(nyBill.signed_date)} and is counted above.`;
  else if (nyBill?.stage === 'passed_legislature_not_sent_to_governor')
    nyText = `New York's ${nyBill.id} passed the Legislature on ${fmtDate(nyBill.last_action_date)} and is awaiting the governor's signature (not yet sent to the governor), so it is not law yet.`;
  else nyText = `New York: ${ny.label.toLowerCase()}${nyBill ? ` (${nyBill.id}, ${ny.stage!.toLowerCase()})` : ''}.`;
  out.push({ id: 'new-york', title: 'New York', text: nyText, method: { href: `/states/${ny.state.slug}/`, label: 'New York record and sources' } });

  const kitsText = K.compatiblePairs.length === 0
    ? `No complete kit is confirmed as certified for any state yet: none of the ${K.kitCount} kits we track has a certificate covering the complete system, so none of the ${K.pairs.length} state-by-kit checks in our audit (${K.stateCount} law states × ${K.kitCount} kits) is "${verdictLabel.compatible}".`
    : `${plural(K.statesWithCompatible.length, 'state has', 'states have')} at least one kit confirmed compatible: ${K.compatiblePairs.length} of the ${K.pairs.length} state-by-kit checks in our audit (${K.stateCount} law states × ${K.kitCount} kits) are "${verdictLabel.compatible}".`;
  out.push({ id: 'kits', title: 'Certified kits', text: kitsText, method: { href: '/how-we-verify/#kits', label: 'How we judge kits' } });

  if (P.tilted && P.railing) out.push({
    id: 'payback', title: 'Payback',
    text: `For ${aN(P.W)} ${P.W} W kit costing ${fmtUsd(P.cost)} (${P.kit.brand} ${P.kit.model}) with ${P.sharePct}% of its output used at home, payback in the ${P.states} states with a plug-in law ranges from ${yrs(P.tilted.best.years)} (${P.tilted.best.state.name}) to ${yrs(P.tilted.worst.years)} (${P.tilted.worst.state.name}) with tilted panels, and from ${yrs(P.railing.best.years)} (${P.railing.best.state.name}) to ${yrs(P.railing.worst.years)} (${P.railing.worst.state.name}) on a balcony railing.`,
    method: { href: '/guides/is-it-worth-it/#method', label: 'How we estimate savings' },
  });

  if (R.lawStates && R.all) out.push({
    id: 'railing', title: 'Railing vs tilted',
    text: `Vertical railing panels produce ${R.lawStates.min}–${R.lawStates.max}% of tilted output in the ${R.lawStates.n} plug-in-law states, and ${R.all.min}–${R.all.max}% across ${R.all.n === 51 ? 'all 50 states and DC' : `the ${R.all.n} states with data`}.`,
    method: { href: '/guides/railing-vs-tilted/#method', label: 'How we model solar output' },
  });

  const caBill = mainBill(C.state);
  if (C.effective && typeof C.price === 'number' && C.rank) out.push({
    id: 'california', title: 'California',
    text: `California's plug-in solar law (${caBill?.id}) ${C.inEffect ? 'took' : 'takes'} effect on ${fmtDate(C.effective)}, and its residential electricity price (${C.price}¢ per kWh) is the ${C.rank === 1 ? 'highest' : `${ordinal(C.rank)} highest`} of the ${C.of === 51 ? '50 states and DC' : `${C.of} states with data`}.`,
    method: { href: '/how-we-verify/#savings', label: 'Price source and method' },
  });
  return out;
}

/** Five one-line facts, ready to quote. */
export function quoteFacts(): string[] {
  const L = lawFindings();
  const K = kitFindings();
  const P = paybackFindings();
  const R = railingFindings();
  const T = renterFindings();
  const facts = [
    `${plural(L.signed.length, 'US state has', 'US states have')} signed a plug-in solar law, and ${L.inEffect.length} of them ${L.inEffect.length === 1 ? 'is' : 'are'} in effect.`,
    K.completeSystemKits.length === 0
      ? `None of the ${K.kitCount} plug-in solar kits we track has a certificate covering the complete system.`
      : `${K.completeSystemKits.length} of the ${K.kitCount} plug-in solar kits we track ${K.completeSystemKits.length === 1 ? 'has' : 'have'} a certificate covering the complete system.`,
  ];
  if (P.railing) facts.push(`${aN(P.W) === 'an' ? 'An' : 'A'} ${P.W} W plug-in kit hung on a balcony railing pays for itself in ${P.railing.best.years.toFixed(1)} to ${P.railing.worst.years.toFixed(1)} years in the states with a plug-in law, at a typical ${P.sharePct}% use at home.`);
  if (R.all) facts.push(`Solar panels hung vertically on a south-facing railing make ${R.all.min}–${R.all.max}% of what tilted panels make, depending on the state.`);
  facts.push(`${T.protects.length} of the ${L.signed.length} state plug-in solar laws limit a landlord's power to ban the panels: ${andList(T.protects.map((s) => s.name))}.`);
  return facts;
}

export interface Angle { title: string; text: string; links: { href: string; label: string }[] }
export function storyAngles(): Angle[] {
  const L = lawFindings();
  const K = kitFindings();
  const P = paybackFindings();
  const R = railingFindings();
  const C = californiaFindings();
  const T = renterFindings();
  const out: Angle[] = [];
  if (P.railing && R.lawStates) out.push({
    title: `Railing panels pay back in ${P.railing.best.years.toFixed(1)}–${P.railing.worst.years.toFixed(1)} years`,
    text: `Most apartment dwellers can only hang panels on a railing. In the ${R.lawStates.n} states with a plug-in law, a vertical panel makes ${R.lawStates.min}–${R.lawStates.max}% of what a tilted one does, so ${aN(P.W)} ${P.W} W kit takes from ${yrs(P.railing.best.years)} in ${P.railing.best.state.name} to ${yrs(P.railing.worst.years)} in ${P.railing.worst.state.name} to pay back at a typical ${P.sharePct}% use at home.`,
    links: [{ href: '/data/#payback', label: 'Payback finding' }, { href: '/guides/railing-vs-tilted/', label: 'Railing vs tilted, state by state' }],
  });
  if (C.effective) out.push({
    title: `No complete certified kit yet as California's law ${C.inEffect ? 'takes hold' : 'starts'}`,
    text: `California's law ${C.inEffect ? 'took' : 'takes'} effect on ${fmtDate(C.effective)} ${needsSystemCert(C.state.rules.certification_required.value) ? 'and requires certification of the complete plug-in system' : `and requires: ${ruleValue('certification_required', C.state.rules.certification_required.value)}`}. ${K.completeSystemKits.length === 0 ? `None of the ${K.kitCount} kits we track has shown a complete-system certificate` : `${K.completeSystemKits.length} of the ${K.kitCount} kits we track has a complete-system certificate`}, so ${C.compatibleKits === 0 ? 'no kit is confirmed compatible in California yet' : `${C.compatibleKits} ${C.compatibleKits === 1 ? 'kit is' : 'kits are'} confirmed compatible there`}.${C.rank ? ` California has the ${C.rank === 1 ? 'highest' : `${ordinal(C.rank)} highest`} residential electricity price of the ${C.of === 51 ? '50 states and DC' : `${C.of} states with data`}, where each kilowatt-hour made at home is worth more.` : ''}`,
    links: [{ href: '/data/#kits', label: 'Kit audit finding' }, { href: '/guides/california-plug-in-solar-2027/', label: 'California guide' }, { href: '/certification-watch/', label: 'Certification watch' }],
  });
  out.push({
    title: 'Which states protect renters',
    text: `Of the ${L.signed.length} states with a plug-in solar law, ${T.protects.length} limit a landlord's power to ban the panels (${andList(T.protects.map((s) => s.name))}). In ${T.silent.length} (${andList(T.silent.map((s) => s.name))}) the law is silent, so the lease still decides${T.unknown.length ? `, and in ${andList(T.unknown.map((s) => s.name))} we are still verifying the text` : ''}.`,
    links: [{ href: '/data/#downloads', label: 'State table (CSV)' }, { href: '/guides/renters/', label: 'Renters guide' }],
  });
  return out;
}

/** Ready-made citation for the data page. */
export function citation() {
  const year = BUILD_DATE.slice(0, 4);
  return {
    full: `${siteName}. (${year}). US plug-in solar: state laws, kits and savings data (updated ${fmtDate(BUILD_DATE)}) [Data set]. ${absUrl('/data/')}. Licensed under CC BY 4.0.`,
    short: `Source: ${siteName} (${new URL(site.BASE_URL).host})`,
  };
}

/** Dated key facts for /press/: signed-law count, each law's effective date, kit certification, all from the data. */
export function keyDates(): { date: string | null; text: string; href: string }[] {
  const L = lawFindings();
  const K = kitFindings();
  const out: { date: string | null; text: string; href: string }[] = [];
  out.push({ date: BUILD_DATE, text: `${L.signed.length} states have signed a plug-in solar law (${andList(L.signed.map((s) => s.name))}); ${L.inEffect.length} are in effect.`, href: '/data/#laws' });
  const dated = L.signed.map((s) => ({ s, eff: effectiveDate(s), bill: mainBill(s) })).filter((x) => x.eff && x.eff > BUILD_DATE).sort((a, b) => a.eff!.localeCompare(b.eff!) || a.s.name.localeCompare(b.s.name));
  for (const x of dated) out.push({ date: x.eff, text: `${x.s.name}'s law (${x.bill?.id}) takes effect on ${fmtDate(x.eff!)}.`, href: `/states/${x.s.slug}/` });
  out.push({
    date: BUILD_DATE,
    text: K.compatiblePairs.length === 0
      ? `No complete certified kit is confirmed in any state yet: none of the ${K.kitCount} kits we track has a certificate covering the complete system.`
      : `${K.compatiblePairs.length} state-and-kit pairs are confirmed compatible.`,
    href: '/data/#kits',
  });
  return out;
}
