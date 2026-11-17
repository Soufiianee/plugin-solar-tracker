/**
 * Writes research/emails/2027-01-01-new-hampshire.md: the January 1 email draft for New Hampshire subscribers,
 * with the law facts and the kit status taken from the data. DRAFT ONLY: nothing is sent.
 * Same rules as the California draft (scripts/email-ca.ts). Re-run just before sending (npm run email:nh).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { byCode, kits, kitAssess, mainBill, effectiveDate, fmtDate, absUrl, siteName } from '../src/lib/data.ts';
import { verdictLabel } from '../src/lib/compat.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const s = byCode.NH;
const b = mainBill(s)!;
const eff = effectiveDate(s);
if (!eff || s.verification !== 'primary') throw new Error('New Hampshire record is not confirmed with a known effective date; no draft written.');
const r = s.rules;
const cap = r.max_watts_ac.value as number;
const assessed = kits.map((k) => ({ name: `${k.brand} ${k.model}`, a: kitAssess(s, k) }));
const confirmed = assessed.filter((x) => x.a.verdict === 'compatible');
const likely = assessed.filter((x) => x.a.verdict === 'likely_compatible');
const page = absUrl(`/states/${s.slug}/`);

const kitPara = confirmed.length
  ? `Kits: we have seen a complete-system certificate for ${confirmed.map((x) => x.name).join(', ')}, so ${confirmed.length === 1 ? 'it is' : 'they are'} marked "${verdictLabel.compatible}" for New Hampshire. Check the seller's certificate before you buy.`
  : likely.length
    ? `Kits: no kit has a complete-system certificate we have seen. For ${likely.map((x) => x.name).join(', ')} we have seen a lab certificate for the inverter, so we mark ${likely.length === 1 ? 'it' : 'them'} "${verdictLabel.likely_compatible}". Ask the seller to confirm that the whole kit is certified before you buy.`
    : `Kits: we have not seen a lab certificate for any kit we track that fits New Hampshire's rules yet. We will email you again when one is confirmed.`;

const md = `# January 1, 2027 email: New Hampshire subscribers (DRAFT, not sent)

Generated ${new Date().toISOString().slice(0, 10)} by \`npm run email:nh\` from data/states.json and data/kits.json. Re-run it just before sending.

**Before sending, check:**
1. The site has been rebuilt on or after ${fmtDate(eff)}, so the New Hampshire page says "In effect since ${fmtDate(eff)}".
2. The kit paragraph below matches the New Hampshire page and /certification-watch/ on the live site.
3. **Audience: send ONLY to subscribers in the MailerLite group "Key dates" whose state field = "New Hampshire".** Never send it to the alerts-only list: they signed up for "one email when a complete certified kit is confirmed for New Hampshire", and this email is not that.
4. In MailerLite: create a segment "Key dates + New Hampshire" (group is "Key dates" AND state equals "New Hampshire") and send the campaign to that segment only.

---

**Subject:** New Hampshire's plug-in solar law starts today

**Preview text:** What SB 540 allows, and where kit certification stands.

**Body (plain text):**

New Hampshire's plug-in solar law, ${b.id} (${b.chapter}), takes effect today, ${fmtDate(eff)}.

What it allows: each metered customer may use one plug-in solar system with an inverter output of up to ${cap.toLocaleString('en-US')} watts (AC). ${r.certification_required.detail.replace(/ \(RSA[^)]*\)\.?$/, '.')} Your utility cannot require approval, an interconnection agreement or fees. It may set up a way for you to report the system's wattage after you install it, for information only.

The law does not mention landlords or HOAs, so your lease and your association's rules still apply.

${kitPara}

New Hampshire rules and sources: ${page}

This is information, not legal advice. Check the law and your lease or HOA rules before you install anything.

${siteName}
You are getting this because you asked for key-date emails about New Hampshire's law at ${absUrl('/')}.
`;

mkdirSync(join(root, 'research/emails'), { recursive: true });
writeFileSync(join(root, 'research/emails/2027-01-01-new-hampshire.md'), md);
console.log(md);
