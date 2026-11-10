/**
 * Compatibility audit of the LIVE model (src/lib/compat.ts): every enacted state x every kit,
 * with the verdict, the rule behind it, the evidence and any caveats. Writes research/COMPAT_AUDIT.md.
 * Usage: npm run compat-audit
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assess, verdictLabel, verdictHelp, needsSystemCert, VERDICT_ORDER, type Verdict } from '../src/lib/compat.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const states = JSON.parse(readFileSync(join(root, 'data/states.json'), 'utf8'));
const kits = JSON.parse(readFileSync(join(root, 'data/kits.json'), 'utf8'));
const enacted = states.filter((s: any) => s.status.startsWith('enacted')).sort((a: any, b: any) => a.code.localeCompare(b.code));

const CODE: Record<Verdict, string> = {
  compatible: 'OK', likely_compatible: 'LIKELY', component_only: 'COMPONENT', ul3700_claimed: '3700-CLAIM', listing_claimed: 'CLAIMED',
  not_certified: 'NO', no_evidence: 'NONE', over_cap: 'OVER', output_unknown: 'OUT?', rules_unknown: 'RULES?', no_state_law: '-',
};

const matrix: string[] = ['| Kit | ' + enacted.map((s: any) => s.code).join(' | ') + ' |', '|---|' + enacted.map(() => '---').join('|') + '|'];
const rows: string[] = [];
for (const k of kits) {
  const cells: string[] = [];
  for (const s of enacted) {
    const a = assess({ code: s.code, enacted: true, cap: s.rules.max_watts_ac.value, certReq: s.rules.certification_required.value }, k);
    cells.push(CODE[a.verdict] + (a.caveats.some((c) => c.startsWith('Check device')) ? '*' : ''));
    rows.push(`| ${s.code} | ${k.brand} ${k.model} | ${k.ac_output_w}${k.ac_output_basis === 'estimated' ? ' (est.)' : ''} | **${verdictLabel[a.verdict]}** | ${a.basis ? `${a.basis.standard} ${a.basis.status} (${a.basis.scope})${a.basis.evidence_url && a.basis.evidence_url !== 'unknown' ? ` [evidence](${a.basis.evidence_url})` : ''}` : '—'} | ${a.caveats.join(' ') || '—'} |`);
  }
  matrix.push(`| ${k.brand} ${k.model} | ${cells.join(' | ')} |`);
}

const md = `# Compatibility audit (live model)

Generated ${new Date().toISOString().slice(0, 10)} by \`npm run compat-audit\`. This is what the site shows.

Codes: ${VERDICT_ORDER.filter((v) => v !== 'no_state_law').map((v) => `**${CODE[v]}** ${verdictLabel[v]}`).join(' · ')}. \`*\` = "check device count" caveat (one device/system per meter).

## Matrix

${matrix.join('\n')}

## Rule per state

${enacted.map((s: any) => `- **${s.code}** (${needsSystemCert(s.rules.certification_required.value) ? 'UL 3700 / complete-system' : s.rules.certification_required.value === 'unknown' ? 'not verified' : 'lab-listed'}): ${s.rules.certification_required.detail}`).join('\n')}

## Label meanings

${VERDICT_ORDER.map((v) => `- **${verdictLabel[v]}**: ${verdictHelp[v]}`).join('\n')}

## Every state × kit

| State | Kit | AC W | Verdict | Basis (evidence) | Caveats |
|---|---|---|---|---|---|
${rows.join('\n')}
`;
writeFileSync(join(root, 'research/COMPAT_AUDIT.md'), md);
console.log(matrix.join('\n'));
