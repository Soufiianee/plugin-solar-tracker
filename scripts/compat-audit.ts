/**
 * Compatibility audit: every enacted state x every kit, with the CURRENT site verdict, a PROPOSED verdict,
 * and the exact rule and evidence behind each. Writes research/COMPAT_AUDIT.md. Does not change the site.
 *
 * Proposed model (for review):
 *  - "UL 3700 / complete-system" states (VT, ME, NJ, CA): unchanged. Only a complete-system UL 3700
 *    certificate makes a kit compatible; a component certificate is "check with seller".
 *  - "Lab-listed" states (UT, MD, CO, CT, VA): the law asks for certification by UL or an equivalent NRTL
 *    without naming UL 3700. Within the size limit:
 *      LIKELY  = we have SEEN an NRTL certificate for the kit's inverter (certificate document or directory)
 *      CLAIMED = the maker claims an NRTL listing (e.g. "UL1741 certificated", "ETL") but we found no certificate
 *      NONE    = no listing evidence or claim
 *  - Connecticut also names UL 1741, so a UL 3700-only claim is not enough there.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdict, verdictLabel } from '../src/lib/compat.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const states = JSON.parse(readFileSync(join(root, 'data/states.json'), 'utf8'));
const kits = JSON.parse(readFileSync(join(root, 'data/kits.json'), 'utf8'));
const enacted = states.filter((s: any) => s.status.startsWith('enacted')).sort((a: any, b: any) => a.code.localeCompare(b.code));

const STRICT = new Set(['ul_3700_or_equivalent', 'plug_in_system_certification']);
const LISTING = ['UL 1741', 'UL 1741 SB', 'UL 3700'];

type P = { code: string; label: string; why: string };

function proposed(s: any, k: any): P {
  const cap = s.rules.max_watts_ac.value;
  const req = s.rules.certification_required.value;
  if (cap === 'unknown' || req === 'unknown') return { code: 'RULES?', label: 'State rules not yet verified', why: 'NH: rules held as unknown until confirmed on gc.nh.gov.' };
  // AC output cannot exceed the panels' DC rating, so a small kit with unstated output is still within any cap above its panel watts.
  const panelBound = k.ac_output_w === 'unknown' && typeof k.panel_w_total === 'number' && typeof cap === 'number' && k.panel_w_total <= cap;
  if (k.ac_output_w === 'unknown' && !panelBound) return { code: 'OUT?', label: 'Output not stated: confirm with seller', why: 'Seller does not state AC output, so the size limit cannot be checked.' };
  if (typeof cap === 'number' && typeof k.ac_output_w === 'number' && k.ac_output_w > cap) return { code: 'OVER', label: 'Over the size limit', why: `${k.ac_output_w} W > ${cap} W.` };
  const u = k.certifications.find((c: any) => c.standard === 'UL 3700');
  if (STRICT.has(req)) {
    if (u?.status === 'certified' && u.scope === 'complete_system') return { code: 'OK', label: 'Compatible', why: 'Complete-system UL 3700 certificate.' };
    if (u?.status === 'certified') return { code: 'CHECK', label: 'Check with seller', why: `UL 3700 certificate covers the inverter as a component only (${u.certifier}); the law needs the device/system certified.` };
    if (u?.status === 'pending_or_claimed') return { code: 'CLAIM', label: 'UL 3700 claimed, not verified', why: 'Maker claims UL 3700; no certificate found.' };
    if (u?.status === 'not_certified') return { code: 'NO', label: 'Not certified', why: 'Seller states it is not UL 3700 certified.' };
    return { code: 'NO', label: 'No UL 3700 evidence', why: 'No UL 3700 claim or certificate.' };
  }
  // lab-listed states
  const needs = req === 'nrtl_and_ul_1741' ? ['UL 1741', 'UL 1741 SB'] : LISTING;
  const rel = k.certifications.filter((c: any) => needs.includes(c.standard));
  const seen = rel.filter((c: any) => c.status === 'certified');
  const claimed = rel.filter((c: any) => c.status === 'pending_or_claimed');
  if (seen.length) return { code: 'LIKELY', label: 'Likely compatible: confirm with seller', why: `Inverter NRTL certificate seen: ${seen.map((c: any) => `${c.standard} (${c.certifier}, ${c.scope})`).join('; ')}.` };
  if (claimed.length) return { code: 'CLAIMED', label: 'Listing claimed: confirm with seller', why: `Maker claims ${claimed.map((c: any) => c.standard).join(', ')}; no certificate found.` };
  if (k.slug.startsWith('bright-saver')) return { code: 'CLAIMED', label: 'Listing claimed: confirm with seller', why: 'Kit uses a Hoymiles HiFlow Pro LV inverter; Hoymiles claims UL 1741 and UL 3700 on its datasheet; model not stated by seller; no certificate found.' };
  return { code: 'NONE', label: 'No listing evidence', why: 'No NRTL listing claim or certificate found.' };
}

const RULE_SHORT: Record<string, string> = {
  UT: 'Utah Code 54-15-102(13): ≤1,200 W output; standard 120 V outlet; NEC; "certified by UL or an equivalent NRTL".',
  MD: 'PUA 7-321(a): ≤1,200 W to the building; standard outlet; "certified by Underwriters Laboratory or an equivalent NRTL"; one per meter; notify utility first.',
  CO: 'C.R.S. 40-2-140(1)(e): ≤1,920 W to the grid; "labeled and listed by an NRTL"; one system per address; one device per outlet. From 1/1/2027 devices >391 W must be UL labeled and listed to be sold.',
  CT: 'PA 26-127 Sec. 9(a): ≤1,200 W; 120 V outlet; "certified by UL or an equivalent NRTL, and meets UL 1741"; one device behind a meter.',
  VA: 'Va. Code 56-596.7(A): ≤1,200 W per customer or unit; certified by an NRTL (29 CFR 1910.7); NEC; SCC notice form before installing.',
  VT: '30 V.S.A. 201(9)(C): "complies with UL 3700" (or equivalent NRTL certification) and IEEE 1547-2018; ≤1,200 W per meter; smart meter only.',
  ME: '35-A MRSA 3475(1)(A): listed/certified to UL 3700 or a comparable NRTL standard, OR configured per the NEC adopted by the Electricians\' Examining Board; ≤420 W no electrician, up to 1,200 W with electrician + dedicated circuit.',
  NJ: 'S2368 Sec. 2(a): listed/certified to UL 3700, a comparable standard, or a combination covering plug-in safety and grid-parallel operation, by an NRTL; ≤1,200 W.',
  CA: 'Pub. Util. Code 8530(c)(5)-(6): "certified as a plug-in photovoltaic system" by UL or equivalent NRTL, plus a certified isolation feature; ≤1,200 W per dwelling.',
  NH: 'Not verified (rules held as unknown).',
};
const STATE_CAVEAT: Record<string, string> = {
  CT: 'One device behind the meter: multi-inverter kits (CraftStrom 2-3 inverters, several Hoymiles units) may count as more than one device.',
  MD: 'One system per meter; multi-inverter kits: confirm it counts as one system.',
  CO: 'One device per outlet and one system per address.',
  ME: 'The "configured per the NEC" route is not modelled; we treat Maine like the UL 3700 states. Above 420 W an electrician and dedicated circuit are required.',
};

const rows: string[] = [];
const matrix: Record<string, Record<string, string>> = {};
const changes: string[] = [];
for (const s of enacted) {
  matrix[s.code] = {};
  for (const k of kits) {
    const cur = verdict({ enacted: true, cap: s.rules.max_watts_ac.value, certReq: s.rules.certification_required.value }, k);
    const p = proposed(s, k);
    matrix[s.code][k.slug] = p.code;
    const curLabel = verdictLabel[cur];
    const CUR: Record<string, string[]> = { compatible: ['OK'], check_with_seller: ['CHECK'], unverified_claim: ['CLAIM', 'CLAIMED'], no_evidence: ['NO', 'NONE'], over_cap: ['OVER'], output_unknown: ['OUT?'], rules_unknown: ['RULES?'], no_state_law: [] };
    if (!CUR[cur].includes(p.code)) changes.push(`${s.code} × ${k.brand} ${k.model}: ${curLabel} → ${p.label}`);
    const ev = k.certifications.map((c: any) => `${c.standard}: ${c.status}${c.status === 'certified' ? ` (${c.scope})` : ''}${c.evidence_url !== 'unknown' ? ` [evidence](${c.evidence_url})` : ''}`).join('; ');
    rows.push(`| ${s.code} | ${k.brand} ${k.model} | ${k.ac_output_w}${k.ac_output_basis === 'estimated' ? ' (est.)' : ''} | ${curLabel} | **${p.label}** | ${(k.ac_output_w === 'unknown' && p.code !== 'OUT?' && p.code !== 'RULES?' ? `Output not stated, but panels total ${k.panel_w_total} W, so AC output cannot exceed the limit. ` : '') + p.why} | ${ev} |`);
  }
}

const codes = enacted.map((s: any) => s.code);
const mx = ['| Kit | ' + codes.join(' | ') + ' |', '|---|' + codes.map(() => '---').join('|') + '|',
  ...kits.map((k: any) => `| ${k.brand} ${k.model} | ` + codes.map((c: string) => matrix[c][k.slug]).join(' | ') + ' |')];

const md = `# Compatibility audit (proposed model, NOT yet applied to the site)

Generated ${new Date().toISOString().slice(0, 10)} by \`npm run compat-audit\`.

Legend: **OK** compatible · **LIKELY** likely compatible, confirm with seller (inverter NRTL certificate seen) · **CLAIMED** listing claimed by maker, confirm with seller · **CHECK** check with seller (UL 3700 component certificate only) · **CLAIM** UL 3700 claimed, not verified · **NO** not certified / no UL 3700 evidence · **NONE** no listing evidence · **OUT?** output not stated · **OVER** over the limit · **RULES?** state rules not verified.

## Matrix

${mx.join('\n')}

## Rule used per state

${enacted.map((s: any) => `- **${s.code}** (${STRICT.has(s.rules.certification_required.value) ? 'UL 3700 / complete-system state' : s.rules.certification_required.value === 'unknown' ? 'unverified' : 'lab-listed state'}): ${RULE_SHORT[s.code]}${STATE_CAVEAT[s.code] ? ' Caveat: ' + STATE_CAVEAT[s.code] : ''}`).join('\n')}

## Real verdict changes versus the live site (${changes.length})

${changes.map((c) => '- ' + c).join('\n')}

## Every state × kit

| State | Kit | AC W | Current site | Proposed | Why | Evidence on file |
|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
writeFileSync(join(root, 'research/COMPAT_AUDIT.md'), md);
console.log(mx.join('\n'));
console.log(`\n${changes.length} verdicts change category:`); changes.forEach((c) => console.log('  ' + c));
