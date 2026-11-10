/**
 * Kit × state compatibility (model approved by the owner, session 3).
 *
 * Two kinds of state law:
 *  - STRICT ("UL 3700 or complete-system" states: VT, ME, NJ, CA). Only a UL 3700 certificate for the
 *    complete system makes a kit compatible. A UL 3700 certificate for a component is "check with seller".
 *  - LAB-LISTED (UT, MD, CO, CT, VA): the law asks for certification by UL or an equivalent lab without naming
 *    UL 3700 (CT also names UL 1741). A lab certificate we have SEEN for the kit's inverter gives
 *    "likely compatible: confirm with seller"; a maker's claim without a certificate is shown as a claim.
 *
 * Size: the kit's stated AC output must be within the state's limit. If output is not stated but the kit's
 * panels total no more than the limit, it is within the limit (AC output cannot exceed the panels' DC rating).
 */
export type CertReq =
  | 'ul_3700_or_equivalent' | 'plug_in_system_certification' | 'nrtl_certified_generic' | 'nrtl_and_ul_1741'
  | 'unknown' | 'not_applicable';

export interface CompatState {
  code?: string;
  enacted: boolean;
  cap: number | 'unknown' | 'not_specified' | 'not_applicable';
  certReq: CertReq;
}
export interface CompatCert { standard: string; status: string; scope: string; evidence_url?: string; certifier?: string }
export interface CompatKit {
  ac_output_w: number | 'unknown';
  panel_w_total?: number | 'unknown' | 'not_included';
  inverter_count?: number | 'unknown';
  certifications: CompatCert[];
}

export type Verdict =
  | 'compatible'
  | 'likely_compatible'
  | 'component_only'
  | 'ul3700_claimed'
  | 'listing_claimed'
  | 'not_certified'
  | 'no_evidence'
  | 'over_cap'
  | 'output_unknown'
  | 'rules_unknown'
  | 'no_state_law';

export const verdictLabel: Record<Verdict, string> = {
  compatible: 'Compatible',
  likely_compatible: 'Likely compatible: confirm with seller',
  component_only: 'Component certificate only: check with seller',
  ul3700_claimed: 'UL 3700 claimed, no certificate seen',
  listing_claimed: 'Listing claimed, no certificate seen',
  not_certified: 'Not certified',
  no_evidence: 'No certification evidence found',
  over_cap: 'Over this state’s size limit',
  output_unknown: 'Output not stated by seller',
  rules_unknown: 'State rules not yet verified',
  no_state_law: 'No state plug-in law',
};

/** One-line explanation shown as a tooltip and in text. */
export const verdictHelp: Record<Verdict, string> = {
  compatible: 'Within the size limit, and we have seen a certificate covering the complete system.',
  likely_compatible: 'Within the size limit, and we have seen a lab certificate for the kit’s inverter. The law asks for lab certification without naming a standard, so confirm with the seller that the whole kit qualifies.',
  component_only: 'This state requires UL 3700 (or complete-system certification). The certificate we have seen covers only one part, such as the inverter, so ask the seller whether the complete kit is certified.',
  ul3700_claimed: 'The maker says the product meets UL 3700, but we have not seen a certificate.',
  listing_claimed: 'The maker says the product is lab-listed (for example to UL 1741), but we have not seen a certificate.',
  not_certified: 'The maker or seller says it is not certified to the standard this state requires.',
  no_evidence: 'We found no certificate and no claim for the certification this state requires.',
  over_cap: 'The seller’s stated output is above this state’s legal limit.',
  output_unknown: 'The seller does not state the AC output, so we cannot check it against the limit.',
  rules_unknown: 'We have not yet confirmed this state’s rules on an official source.',
  no_state_law: 'This state has no plug-in solar law; your utility’s interconnection rules apply.',
};

export interface Assessment {
  verdict: Verdict;
  /** the certificate or claim the verdict rests on, if any */
  basis: CompatCert | null;
  caveats: string[];
}

/** True when the state's law demands UL 3700 or whole-system certification. */
export const needsSystemCert = (req: CertReq) => req === 'ul_3700_or_equivalent' || req === 'plug_in_system_certification';

/** States whose law allows one device or system per meter. */
const ONE_DEVICE: Record<string, string> = {
  CT: 'Connecticut allows one device behind each meter',
  MD: 'Maryland allows one system per electric meter',
};

export function assess(state: CompatState, kit: CompatKit): Assessment {
  const caveats: string[] = [];
  if (!state.enacted) return { verdict: 'no_state_law', basis: null, caveats };
  if (state.cap === 'unknown' || state.certReq === 'unknown') return { verdict: 'rules_unknown', basis: null, caveats };

  // size
  if (typeof kit.ac_output_w === 'number') {
    if (typeof state.cap === 'number' && kit.ac_output_w > state.cap) return { verdict: 'over_cap', basis: null, caveats };
  } else {
    const p = kit.panel_w_total;
    if (!(typeof p === 'number' && typeof state.cap === 'number' && p <= state.cap)) return { verdict: 'output_unknown', basis: null, caveats };
    caveats.push(`Output not stated, but its panels total ${p} W, so it cannot exceed the limit.`);
  }

  if (state.code && ONE_DEVICE[state.code] && kit.inverter_count !== 1) {
    caveats.push(`Check device count: ${ONE_DEVICE[state.code]}; this product has ${kit.inverter_count === 'unknown' ? 'an unstated number of' : kit.inverter_count} inverters.`);
  }

  const pick = (list: CompatCert[], status: string, scope?: string) => list.find((c) => c.status === status && (!scope || c.scope === scope)) ?? null;

  if (needsSystemCert(state.certReq)) {
    const ul = kit.certifications.filter((c) => c.standard === 'UL 3700');
    let b: CompatCert | null;
    if ((b = pick(ul, 'certified', 'complete_system'))) return { verdict: 'compatible', basis: b, caveats };
    if ((b = pick(ul, 'certified'))) return { verdict: 'component_only', basis: b, caveats };
    if ((b = pick(ul, 'pending_or_claimed'))) return { verdict: 'ul3700_claimed', basis: b, caveats };
    if ((b = pick(ul, 'not_certified'))) return { verdict: 'not_certified', basis: b, caveats };
    return { verdict: 'no_evidence', basis: null, caveats };
  }

  // lab-listed states
  const standards = state.certReq === 'nrtl_and_ul_1741' ? ['UL 1741', 'UL 1741 SB'] : ['UL 1741', 'UL 1741 SB', 'UL 3700'];
  const rel = kit.certifications.filter((c) => standards.includes(c.standard));
  let b: CompatCert | null;
  if ((b = pick(rel, 'certified', 'complete_system'))) return { verdict: 'compatible', basis: b, caveats };
  if ((b = pick(rel, 'certified'))) return { verdict: 'likely_compatible', basis: b, caveats };
  if ((b = pick(rel, 'pending_or_claimed'))) return { verdict: 'listing_claimed', basis: b, caveats };
  return { verdict: 'no_evidence', basis: null, caveats };
}

export const verdict = (state: CompatState, kit: CompatKit): Verdict => assess(state, kit).verdict;

/** Display order, best first. */
export const VERDICT_ORDER: Verdict[] = ['compatible', 'likely_compatible', 'component_only', 'listing_claimed', 'ul3700_claimed', 'not_certified', 'no_evidence', 'output_unknown', 'over_cap', 'rules_unknown', 'no_state_law'];
