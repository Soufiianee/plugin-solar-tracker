import { describe, it, expect } from 'vitest';
import { letterKinds, letterFacts, showRooftopBox, letterKitNotice, OTHER_DEVICE } from '../src/lib/offers';
import { states, byCode, isEnacted, referencePayback, rooftopFor, assumptions, affiliateLink, retailerLink, brandLink, kits, kitVerdict } from '../src/lib/data';
import type { State } from '../src/lib/schema';

const clone = (s: State): State => JSON.parse(JSON.stringify(s));

describe('notice letter: only states whose data confirms the protection', () => {
  it('offers letters exactly where the law protects tenants or owners (primary data)', () => {
    const offered = Object.fromEntries(states.filter((s) => letterKinds(s).length).map((s) => [s.code, letterKinds(s)]));
    expect(offered).toEqual({ CO: ['tenant', 'hoa'], NJ: ['tenant', 'hoa'], VA: ['tenant'], VT: ['tenant', 'hoa'] });
  });
  it('never offers a letter for a state without an enacted law', () => {
    for (const s of states.filter((x) => !isEnacted(x))) expect(letterKinds(s)).toEqual([]);
  });
  it('offers nothing for New Hampshire (details not confirmed on a primary source)', () => {
    expect(letterKinds(byCode.NH)).toEqual([]);
  });
  it('Virginia gets no HOA letter: its law keeps HOA rules in force', () => {
    expect(byCode.VA.rules.hoa_provisions.value).toBe('covenants_preserved');
    expect(letterFacts(byCode.VA, 'hoa')).toBeNull();
  });
  it('drops the letter when the protection facts are missing', () => {
    const s = clone(byCode.VT);
    delete s.rules.landlord_provisions.protection;
    expect(letterKinds(s)).toEqual(['hoa']);
  });
  it('drops the letter when the law effective date is unknown', () => {
    const s = clone(byCode.CO);
    s.bills.forEach((b) => (b.effective_date = 'unknown'));
    expect(letterKinds(s)).toEqual([]);
  });
  it('drops the letter when verification is not primary', () => {
    const s = clone(byCode.NJ);
    s.verification = 'partial';
    expect(letterKinds(s)).toEqual([]);
  });
  it('letter facts come from the data (Colorado protections start 2027-01-01, law text linked)', () => {
    const f = letterFacts(byCode.CO, 'tenant')!;
    expect(f.protection.applies_from).toBe('2027-01-01');
    expect(f.lawText.url).toBe(byCode.CO.rules.landlord_provisions.rule_sources[0].url);
    expect(letterFacts(byCode.VT, 'tenant')!.protection.notice_days).toBe(10);
  });
});

describe('rooftop comparison box threshold', () => {
  const min = assumptions.rooftop_box.min_payback_years;
  it('threshold is 8 years', () => expect(min).toBe(8));
  it('shows at exactly the threshold and above, not below', () => {
    expect(showRooftopBox(true, 8.0, 8)).toBe(true);
    expect(showRooftopBox(true, 7.9, 8)).toBe(false);
    expect(showRooftopBox(true, 12, 8)).toBe(true);
  });
  it('enacted state with no payback figure: no box', () => expect(showRooftopBox(true, null, 8)).toBe(false));
  it('state with no plug-in law: always shown', () => expect(showRooftopBox(false, null, 8)).toBe(true));
  it('with live data: Utah and Virginia show it; California and Colorado do not', () => {
    expect(referencePayback(byCode.UT)!).toBeGreaterThanOrEqual(min);
    expect(rooftopFor(byCode.UT)).toBe(true);
    expect(rooftopFor(byCode.VA)).toBe(true);
    expect(rooftopFor(byCode.CA)).toBe(false);
    expect(rooftopFor(byCode.CO)).toBe(false);
    expect(rooftopFor(byCode.TX)).toBe(true);
  });
});

describe('affiliate links', () => {
  it('empty slots fall back to the plain official URL, not sponsored', () => {
    const k = kits.find((x) => x.retailers.some((r) => !['craftstrom', 'apsystems'].includes(r.affiliate_slot)))!;
    const l = retailerLink(k.retailers[0]);
    expect(l).toEqual({ href: k.retailers[0].url, rel: 'noopener', sponsored: false });
  });
  it('rooftop slot with no approved link renders no link at all', () => {
    expect(affiliateLink('rooftop_quotes')).toBeNull();
  });
});

describe('letter: certification notice for the chosen device', () => {
  const coKits = kits.map((k) => ({ k, v: kitVerdict(byCode.CO, k) }));
  it('warns when a listed kit is not confirmed for the state', () => {
    const notConfirmed = coKits.find((x) => x.v !== 'compatible')!;
    const n = letterKitNotice('Colorado', notConfirmed.k.slug, notConfirmed.v);
    expect(n?.kind).toBe('unconfirmed');
    expect(n?.text).toBe("We have not confirmed that this device meets Colorado's certification requirement. Check with the seller and get the certificate before you send this letter.");
  });
  it('no warning for a kit confirmed (compatible) in the state', () => {
    expect(letterKitNotice('Vermont', 'some-kit', 'compatible')).toBeNull();
  });
  it('"Other / not listed" (and no choice yet) gets the certificate reminder', () => {
    const t = 'Only send this letter if your device is certified as the law requires. Ask the seller for the certificate.';
    expect(letterKitNotice('Colorado', OTHER_DEVICE, null)).toEqual({ kind: 'other', text: t });
    expect(letterKitNotice('Colorado', '', null)).toEqual({ kind: 'other', text: t });
  });
  it('a "likely compatible" kit still gets the warning (only "compatible" counts as confirmed)', () => {
    expect(letterKitNotice('Utah', 'x', 'likely_compatible')?.kind).toBe('unconfirmed');
  });
});

describe('affiliate links: CraftStrom live, others unchanged', () => {
  const craft = kits.filter((k) => k.retailers.some((r) => r.affiliate_slot === 'craftstrom'));
  it('CraftStrom product links carry ?ref=fnrvloyc and are marked sponsored', () => {
    expect(craft.length).toBeGreaterThan(0);
    for (const k of craft) for (const r of k.retailers) {
      const l = retailerLink(r);
      expect(l.href).toBe(`${r.url}${r.url.includes('?') ? '&' : '?'}ref=fnrvloyc`);
      expect(l.rel).toBe('sponsored noopener');
      expect(l.sponsored).toBe(true);
    }
  });
  it('uses & when the URL already has a query string', () => {
    expect(affiliateLink('craftstrom', 'https://craftstrom.com/p/?x=1')!.href).toBe('https://craftstrom.com/p/?x=1&ref=fnrvloyc');
  });
  it('brand link', () => expect(brandLink('craftstrom')!.href).toBe('https://craftstrom.com/?ref=fnrvloyc'));
  it('every other brand stays a plain link', () => {
    for (const k of kits) for (const r of k.retailers) if (!['craftstrom', 'apsystems'].includes(r.affiliate_slot)) {
      expect(retailerLink(r)).toEqual({ href: r.url, rel: 'noopener', sponsored: false });
    }
  });
  it('no coupon codes in any link', () => {
    for (const k of kits) for (const r of k.retailers) expect(retailerLink(r).href).not.toMatch(/coupon|discount|promo/i);
  });
});

describe('affiliate links: APsystems store link', () => {
  it('EZ1-LV shop link is the affiliate store link, sponsored, no discount code', () => {
    const k = kits.find((x) => x.slug === 'apsystems-ez1-lv')!;
    const l = retailerLink(k.retailers[0]);
    expect(l).toEqual({ href: 'https://apshop.apsystems.com/BALCONYSOLARRULES', rel: 'sponsored noopener', sponsored: true });
    expect(l.href).not.toMatch(/discount|coupon|promo|code=/i);
  });
  it('its certificate citation stays plain', () => {
    const k = kits.find((x) => x.slug === 'apsystems-ez1-lv')!;
    for (const c of k.certifications) expect(c.evidence_url).not.toContain('BALCONYSOLARRULES');
  });
});
