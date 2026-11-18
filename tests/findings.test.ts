/**
 * Press numbers (/data/, /press/) recomputed independently from the raw data files, so a bug in
 * src/lib/findings.ts cannot slip through. Plus the CSV downloads, and (after `npm run build`) the built pages.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import statesRaw from '../data/states.json';
import kitsRaw from '../data/kits.json';
import pricesRaw from '../data/electricity_prices.json';
import yieldRaw from '../data/solar_yield.json';
import assumptionsRaw from '../data/assumptions.json';
import { BUILD_DATE } from '../src/lib/data';
import { assess } from '../src/lib/compat';
import { lawFindings, kitFindings, paybackFindings, railingFindings, californiaFindings, renterFindings, priceRank } from '../src/lib/findings';
import { keyFindings, quoteFacts, storyAngles, aN } from '../src/lib/press';
import { csvCell, toCsv, statesCsv, kitsCsv, STATES_CSV, KITS_CSV } from '../src/lib/datasets';

type Any = any; // raw JSON, read without the app's types on purpose
const S = statesRaw as Any[];
const K = kitsRaw as Any[];
const P = (pricesRaw as Any).states as Record<string, number | 'unknown'>;
const Y = (yieldRaw as Any).states as Record<string, Any>;
const share = (assumptionsRaw as Any).self_consumption.typical_pct as number;
const ref = K.find((k) => k.slug === (assumptionsRaw as Any).rooftop_box.reference_kit);

const effOf = (s: Any) => s.bills.find((b: Any) => b.stage === 'signed_into_law')?.effective_date;
const law = S.filter((s) => s.status.startsWith('enacted')).sort((a, b) => a.name.localeCompare(b.name));
const inEffect = law.filter((s) => s.status === 'enacted_in_effect' || (/^\d{4}-\d{2}-\d{2}$/.test(effOf(s) ?? '') && effOf(s) <= BUILD_DATE));
const r1 = (n: number) => Math.round(n * 10) / 10;
/** payback = cost / (W/1000 × yield × share × price/100) */
const payback = (code: string, scen: 'ideal' | 'vertical') => {
  const y = Y[code].scenarios[scen].kwh_per_kw_year; const p = P[code];
  if (typeof y !== 'number' || typeof p !== 'number') return null;
  return r1(ref.price_usd / (((ref.panel_w_total / 1000) * y * (share / 100) * p) / 100));
};
const pct = (code: string) => Math.round((Y[code].scenarios.vertical.kwh_per_kw_year / Y[code].scenarios.ideal.kwh_per_kw_year) * 100);

describe('key findings match the data files', () => {
  it('signed laws, in effect, New York', () => {
    const L = lawFindings();
    expect(L.signed.map((s) => s.code)).toEqual(law.map((s) => s.code));
    expect(L.inEffect.length).toBe(inEffect.length);
    expect(L.notYet.length).toBe(law.length - inEffect.length);
    const ny = S.find((s) => s.code === 'NY');
    expect(L.ny.enacted).toBe(ny.status.startsWith('enacted'));
    expect(L.ny.bill?.stage).toBe(ny.bills[0].stage);
  });

  it('kit audit: every law state × every kit, label counts add up, complete-system certificates', () => {
    const F = kitFindings();
    expect(F.pairs.length).toBe(law.length * K.length);
    expect(F.labelCounts.reduce((a, x) => a + x.n, 0)).toBe(F.pairs.length);
    const verdicts = law.flatMap((s) => K.map((k) => assess({ code: s.code, enacted: true, cap: s.rules.max_watts_ac.value, certReq: s.rules.certification_required.value }, k).verdict));
    for (const x of F.labelCounts) expect(x.n).toBe(verdicts.filter((v) => v === x.verdict).length);
    expect(F.compatiblePairs.length).toBe(verdicts.filter((v) => v === 'compatible').length);
    const complete = K.filter((k) => k.certifications.some((c: Any) => c.status === 'certified' && c.scope === 'complete_system'));
    expect(F.completeSystemKits.length).toBe(complete.length);
    const u = F.ul3700;
    expect(u.certified + u.claimed + u.not_certified + u.unknown).toBe(K.length);
  });

  it('payback range (typical share, reference kit) for tilted and railing', () => {
    const F = paybackFindings();
    for (const [key, scen] of [['tilted', 'ideal'], ['railing', 'vertical']] as const) {
      const xs = law.map((s) => payback(s.code, scen)).filter((x): x is number => x !== null);
      expect(F[key]!.best.years).toBe(Math.min(...xs));
      expect(F[key]!.worst.years).toBe(Math.max(...xs));
      expect(payback(F[key]!.best.state.code, scen)).toBe(Math.min(...xs));
      expect(payback(F[key]!.worst.state.code, scen)).toBe(Math.max(...xs));
    }
    expect(F.sharePct).toBe(share);
    expect(F.W).toBe(ref.panel_w_total);
    expect(F.cost).toBe(ref.price_usd);
  });

  it('railing as % of tilted: plug-in-law states and all 50 states + DC', () => {
    const F = railingFindings();
    const lawP = law.map((s) => pct(s.code));
    const allP = S.map((s) => pct(s.code));
    expect([F.lawStates!.min, F.lawStates!.max]).toEqual([Math.min(...lawP), Math.max(...lawP)]);
    expect([F.all!.min, F.all!.max]).toEqual([Math.min(...allP), Math.max(...allP)]);
    expect(F.all!.n).toBe(51);
  });

  it('California: effective date and price rank', () => {
    const C = californiaFindings();
    const ca = S.find((s) => s.code === 'CA');
    expect(C.effective).toBe(effOf(ca));
    const higher = Object.values(P).filter((p) => typeof p === 'number' && p > (P.CA as number)).length;
    expect(C.rank).toBe(higher + 1);
    expect(priceRank('CA').of).toBe(Object.values(P).filter((p) => typeof p === 'number').length);
  });

  it('renters: states whose law protects tenants', () => {
    expect(renterFindings().protects.map((s) => s.code)).toEqual(law.filter((s) => s.rules.landlord_provisions.value === 'protects_tenants').map((s) => s.code));
  });

  it('sentences carry the computed numbers', () => {
    const text = keyFindings().map((f) => f.text).join(' ');
    const F = paybackFindings(); const R = railingFindings();
    expect(text).toContain(`${law.length} states have signed`);
    expect(text).toContain(`${F.tilted!.best.years.toFixed(1)} years (${F.tilted!.best.state.name})`);
    expect(text).toContain(`${F.railing!.worst.years.toFixed(1)} years (${F.railing!.worst.state.name})`);
    expect(text).toContain(`${R.lawStates!.min}–${R.lawStates!.max}%`);
    expect(text).toContain(`${R.all!.min}–${R.all!.max}% across all 50 states and DC`);
    expect(keyFindings().every((f) => f.method.href.startsWith('/'))).toBe(true);
    expect(quoteFacts()).toHaveLength(5);
    expect(storyAngles()).toHaveLength(3);
    expect([aN(800), aN(1200), aN(11), aN(18000), aN(400)]).toEqual(['an', 'a', 'an', 'an', 'a']);
  });
});

/** Minimal RFC 4180 parser for the tests. */
function parseCsv(s: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\r' && s[i + 1] === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i++; }
    else cell += c;
  }
  return rows;
}

describe('CSV downloads', () => {
  it('quotes cells per RFC 4180 and uses plain punctuation', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('state’s – limit')).toBe("state's - limit");
    expect(csvCell(null)).toBe('');
    expect(toCsv(['x', 'y'], [[1, 'a\nb']])).toBe('x,y\r\n1,"a\nb"\r\n');
  });

  it('state table: 51 rows, every row complete, values from the data files, attribution and licence', () => {
    const rows = parseCsv(statesCsv());
    const [h, ...body] = rows;
    expect(h).toEqual(STATES_CSV.header);
    expect(body).toHaveLength(51);
    const col = (name: string) => h.indexOf(name);
    for (const r of body) {
      expect(r).toHaveLength(h.length);
      const s = S.find((x) => x.code === r[col('state_code')]);
      expect(r[col('electricity_price_cents_per_kwh')]).toBe(String(P[s.code]));
      expect(r[col('tilted_kwh_per_kw_year')]).toBe(String(Y[s.code].scenarios.ideal.kwh_per_kw_year));
      expect(r[col('railing_kwh_per_kw_year')]).toBe(String(Y[s.code].scenarios.vertical.kwh_per_kw_year));
      expect(r[col('tilted_payback_years')]).toBe(payback(s.code, 'ideal')!.toFixed(1));
      expect(r[col('railing_payback_years')]).toBe(payback(s.code, 'vertical')!.toFixed(1));
      expect(r[col('size_limit_ac_watts')]).toBe(String(s.rules.max_watts_ac.value));
      expect(r[col('record_last_checked')]).toBe(s.last_checked);
      expect(r[col('source')]).toBe('Source: Balcony Solar Rules (balconysolarrules.com)');
      expect(r[col('license')]).toBe('CC BY 4.0');
    }
  });

  it('kit audit: one row per law state × kit, verdicts from the live model', () => {
    const rows = parseCsv(kitsCsv());
    const [h, ...body] = rows;
    expect(h).toEqual(KITS_CSV.header);
    expect(body).toHaveLength(law.length * K.length);
    for (const r of body) expect(r).toHaveLength(h.length);
    expect(new Set(body.map((r) => r[0]))).toEqual(new Set(law.map((s) => s.code)));
  });
});

// After `npm run build`: the built page and files must match the data (skipped when dist/ is absent).
const built = existsSync('dist/data/index.html');
describe.skipIf(!built)('built /data/ and /press/ pages match the data', () => {
  const text = (p: string) => readFileSync(p, 'utf8').replace(/<[^>]+>/g, '')
    .replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  it('every key finding appears on /data/, word for word', () => {
    const page = text('dist/data/index.html');
    for (const f of keyFindings()) expect(page).toContain(f.text);
  });
  it('every quote-ready fact and angle appears on /press/', () => {
    const page = text('dist/press/index.html');
    for (const f of quoteFacts()) expect(page).toContain(f);
    for (const a of storyAngles()) { expect(page).toContain(a.title); expect(page).toContain(a.text); }
  });
  it('the built CSVs are the generated CSVs', () => {
    expect(readFileSync('dist/data/states.csv', 'utf8')).toBe(statesCsv());
    expect(readFileSync('dist/data/kit-audit.csv', 'utf8')).toBe(kitsCsv());
  });
  it('/data/ has Dataset structured data for both CSVs', () => {
    const html = readFileSync('dist/data/index.html', 'utf8');
    const lds = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const ds = lds.filter((j) => j['@type'] === 'Dataset');
    expect(ds.map((d) => d.distribution[0].contentUrl).sort()).toEqual(['https://balconysolarrules.com/data/kit-audit.csv', 'https://balconysolarrules.com/data/states.csv']);
    for (const d of ds) expect(d.license).toBe('https://creativecommons.org/licenses/by/4.0/');
  });
});

import { railingCsv, RAILING_CSV } from '../src/lib/datasets';
import { keyDates } from '../src/lib/press';
describe('railing vs tilted CSV and press key dates', () => {
  it('railing CSV: 51 rows, values and percentages from solar_yield.json', () => {
    const [h, ...body] = parseCsv(railingCsv());
    expect(h).toEqual(RAILING_CSV.header);
    expect(body).toHaveLength(51);
    for (const r of body) {
      expect(r).toHaveLength(h.length);
      expect(r[5]).toBe(String(Y[r[0]].scenarios.ideal.kwh_per_kw_year));
      expect(r[6]).toBe(String(Y[r[0]].scenarios.vertical.kwh_per_kw_year));
      expect(r[7]).toBe(String(pct(r[0])));
      expect(r[8]).toBe(law.some((s) => s.code === r[0]) ? 'yes' : 'no');
    }
  });
  it('key dates list every signed law not yet in effect, with its effective date', () => {
    const kd = keyDates();
    expect(kd[0].text).toContain(`${law.length} states have signed`);
    const upcoming = law.filter((s) => effOf(s) && effOf(s) > BUILD_DATE);
    for (const s of upcoming) expect(kd.some((d) => d.date === effOf(s) && d.text.startsWith(s.name))).toBe(true);
    expect(kd.at(-1)!.text).toMatch(/No complete certified kit is confirmed in any state yet/);
  });
});
describe.skipIf(!existsSync('dist/data/railing-vs-tilted.csv'))('built railing page', () => {
  it('built CSV is the generated CSV, and the summary range is on the page', () => {
    expect(readFileSync('dist/data/railing-vs-tilted.csv', 'utf8')).toBe(railingCsv());
    const R = railingFindings();
    expect(readFileSync('dist/data/railing-vs-tilted/index.html', 'utf8')).toContain(`${R.all!.min}–${R.all!.max}%`);
  });
});
