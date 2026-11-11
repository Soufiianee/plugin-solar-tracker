/**
 * Rules for the extra boxes on state pages. Pure functions, unit-tested in tests/offers.test.ts.
 *
 *  - Notice letter (landlord / HOA): offered only where the state's enacted law, checked on a primary
 *    source, protects tenants or owners AND our data records the section, the date the protection
 *    applies from, and the law text it comes from. Anything less and no letter is offered.
 *  - Rooftop comparison box: shown where there is no plug-in law, or where the reference kit's typical
 *    payback (ideal tilt) is at least the threshold in data/assumptions.json. No payback figure = no box.
 */
import type { State, Protection } from './schema';

export type LetterKind = 'tenant' | 'hoa';
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const RULE = {
  tenant: { key: 'landlord_provisions', value: 'protects_tenants' },
  hoa: { key: 'hoa_provisions', value: 'protects_owners' },
} as const;

const enactedStatus = (s: Pick<State, 'status'>) => s.status === 'enacted_in_effect' || s.status === 'enacted_not_yet_effective';

/** Which letters a state qualifies for (empty array = no letter offer on its page). */
export function letterKinds(s: State): LetterKind[] {
  if (!enactedStatus(s) || s.verification !== 'primary') return [];
  const law = s.bills.find((b) => b.stage === 'signed_into_law');
  if (!law || !ISO.test(law.effective_date)) return [];
  return (['tenant', 'hoa'] as const).filter((k) => {
    const r = s.rules[RULE[k].key];
    return r.value === RULE[k].value && !!r.protection && ISO.test(r.protection.applies_from) && r.rule_sources.length > 0;
  });
}

export interface LetterFacts {
  kind: LetterKind;
  protection: Protection;
  /** what the law says, in our words, from the rule's detail */
  summary: string;
  lawText: { title: string; url: string };
}

export function letterFacts(s: State, kind: LetterKind): LetterFacts | null {
  if (!letterKinds(s).includes(kind)) return null;
  const r = s.rules[RULE[kind].key];
  return { kind, protection: r.protection!, summary: r.detail, lawText: { title: r.rule_sources[0].title, url: r.rule_sources[0].url } };
}

/** Rooftop box rule. `paybackYears` is the reference kit's typical payback (null when it cannot be computed). */
export function showRooftopBox(enacted: boolean, paybackYears: number | null, minYears: number): boolean {
  if (!enacted) return true;
  return typeof paybackYears === 'number' && paybackYears >= minYears;
}

/**
 * Certification notice shown above the letter, depending on the device the visitor picks.
 *  - a kit from our list that is not "compatible" (confirmed) for the state -> warning, with a link to the kit page
 *  - "Other / not listed", or no device chosen yet -> reminder to get the certificate
 *  - a kit confirmed for the state -> no notice (its status is still shown)
 * `choice` is a kit slug, 'other', or '' (nothing chosen).
 */
export type LetterKitNotice = { kind: 'unconfirmed' | 'other'; text: string } | null;
export const OTHER_DEVICE = 'other';
export function letterKitNotice(stateName: string, choice: string, verdict: string | null): LetterKitNotice {
  if (!choice || choice === OTHER_DEVICE)
    return { kind: 'other', text: 'Only send this letter if your device is certified as the law requires. Ask the seller for the certificate.' };
  if (verdict === 'compatible') return null;
  return {
    kind: 'unconfirmed',
    text: `We have not confirmed that this device meets ${stateName}'s certification requirement. Check with the seller and get the certificate before you send this letter.`,
  };
}
