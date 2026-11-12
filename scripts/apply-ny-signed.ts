/**
 * Switch New York to "signed" in one step, once the governor's signature is CONFIRMED on nysenate.gov or
 * nyassembly.gov (never from news alone).
 *
 *   npx tsx scripts/apply-ny-signed.ts --signed 2026-12-05 --chapter "Chapter 512 of the Laws of 2026"
 *
 * Writes data/states.json (NY record from data/drafts/new-york-signed.json) and adds a law_signed entry to
 * data/updates.json. Then run: npm run validate && npm test && npm run build, check /states/new-york/, commit.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyNySigned, type NyDraft } from '../src/lib/ny-draft.ts';
import { todayIso } from '../src/lib/effective.ts';
import { statesFile } from '../src/lib/schema.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : ''; };
const signed = arg('--signed');
const chapter = arg('--chapter');
if (!signed || !chapter) { console.error('usage: --signed YYYY-MM-DD --chapter "Chapter N of the Laws of 2026"'); process.exit(1); }

const statesPath = join(root, 'data/states.json');
const states = JSON.parse(readFileSync(statesPath, 'utf8'));
const draft = JSON.parse(readFileSync(join(root, 'data/drafts/new-york-signed.json'), 'utf8')) as NyDraft;
const i = states.findIndex((s: { code: string }) => s.code === 'NY');
const today = todayIso();
states[i] = applyNySigned(states[i], draft, signed, chapter, today);
statesFile.parse(states); // refuse to write an invalid file
writeFileSync(statesPath, JSON.stringify(states, null, 2) + '\n');

const updPath = join(root, 'data/updates.json');
const upd = JSON.parse(readFileSync(updPath, 'utf8'));
upd.unshift({
  date: today, state: 'NY', kind: 'law_signed',
  title: `New York's plug-in solar law signed (${chapter})`,
  body: states[i].summary_plain,
  source: states[i].sources[0],
});
writeFileSync(updPath, JSON.stringify(upd, null, 2) + '\n');
console.log(`NY updated: signed ${signed}, ${chapter}, effective ${states[i].bills[0].effective_date}. Now: npm run validate && npm test && npm run build`);
