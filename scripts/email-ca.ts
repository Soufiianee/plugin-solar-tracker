/**
 * Writes research/emails/2027-01-01-california.md: the January 1 email draft for California subscribers,
 * with the law facts and the kit status taken from the data. DRAFT ONLY: nothing is sent.
 * Re-run just before sending (npm run email:ca) so the kit status is current.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { byCode, kits, kitAssess, mainBill, effectiveDate, fmtDate, absUrl, siteName } from '../src/lib/data.ts';
import { CA_GUIDE } from '../src/lib/guides.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const s = byCode.CA;
const b = mainBill(s)!;
const eff = effectiveDate(s)!;
const cap = s.rules.max_watts_ac.value as number;
const assessed = kits.map((k) => ({ name: `${k.brand} ${k.model}`, v: kitAssess(s, k).verdict }));
const confirmed = assessed.filter((x) => x.v === 'compatible');

const kitPara = confirmed.length
  ? `Kits: we have seen a complete-system certificate for ${confirmed.map((x) => x.name).join(', ')}, so ${confirmed.length === 1 ? 'it is' : 'they are'} marked "Compatible" for California. Check the seller's certificate before you buy.`
  : `Kits: we have not confirmed any complete kit for California yet. Of the ${kits.length} kits we track, none has a complete-system certificate we have seen. We will email you again when one is confirmed.`;

const md = `# January 1, 2027 email: California subscribers (DRAFT, not sent)

Generated ${new Date().toISOString().slice(0, 10)} by \`npm run email:ca\` from data/states.json and data/kits.json. Re-run it just before sending.

**Before sending, check:**
1. The site has been rebuilt on or after ${fmtDate(eff)}, so the California page and the guide say "In effect since ${fmtDate(eff)}".
2. The kit paragraph below matches /certification-watch/ on the live site.
3. **Promise check:** the signup box promises "one email when a complete certified kit is confirmed for California". If no kit is confirmed, this email goes beyond that promise. Either send it only to people who agree to updates, or wait and fold this news into the kit email.
4. Send to the MailerLite segment where the field state = "California".

---

**Subject:** California's plug-in solar law starts today

**Preview text:** What SB 868 allows, and where kit certification stands.

**Body (plain text):**

California's plug-in solar law, ${b.id} (${b.chapter}), takes effect today, ${fmtDate(eff)}.

What it allows: a plug-in solar system of up to ${cap.toLocaleString('en-US')} watts (AC) per dwelling, certified as a complete plug-in photovoltaic system and with a certified isolation feature, is exempt from utility interconnection rules. Your utility cannot require approval or charge fees for it, but it may ask you to register the device online.

${kitPara}

Our California guide: ${absUrl(CA_GUIDE)}

This is information, not legal advice. Check the law and your lease or HOA rules before you install anything.

${siteName}
You are getting this because you signed up for California certified kit alerts at ${absUrl('/')}.
`;

mkdirSync(join(root, 'research/emails'), { recursive: true });
writeFileSync(join(root, 'research/emails/2027-01-01-california.md'), md);
console.log(md);
