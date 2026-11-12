/** State-specific guides. Titles switch automatically once the law's effective date has passed (build time). */
import { byCode, effectiveDate, fmtDate, BUILD_DATE } from './data';

export const CA_GUIDE = '/guides/california-plug-in-solar-2027/';

export function caGuideTitle(): string {
  const e = effectiveDate(byCode.CA);
  if (!e) return 'California plug-in solar: what you need to know';
  return e > BUILD_DATE
    ? `California plug-in solar starts ${fmtDate(e)}: what you need to know`
    : `California plug-in solar is in effect since ${fmtDate(e)}: what you need to know`;
}

/** Guide links shown on state pages. */
export const STATE_GUIDES: Record<string, { href: string; title: () => string }> = {
  CA: { href: CA_GUIDE, title: caGuideTitle },
};
