import type { APIRoute } from 'astro';
import { states, kits, absUrl, site } from '../lib/data';
import { letterKinds } from '../lib/offers';

const STATIC = ['/', '/states/', '/kits/', '/certification-watch/', '/guides/', '/guides/is-it-worth-it/', '/guides/railing-vs-tilted/', '/guides/renters/', '/guides/california-plug-in-solar-2027/', '/updates/', '/about/', '/how-we-verify/', '/disclaimer/', '/privacy/', '/disclosure/', '/partners/', ...(site.CONTACT_EMAIL ? ['/contact/'] : [])];

export const GET: APIRoute = () => {
  const urls = [
    ...STATIC.map((p) => ({ p, lm: null as string | null })),
    ...states.map((s) => ({ p: `/states/${s.slug}/`, lm: s.last_checked })),
    ...states.filter((s) => letterKinds(s).length).map((s) => ({ p: `/states/${s.slug}/letter/`, lm: s.last_checked })),
    ...kits.map((k) => ({ p: `/kits/${k.slug}/`, lm: k.last_checked })),
  ];
  const body = urls.map((u) => `<url><loc>${absUrl(u.p)}</loc>${u.lm ? `<lastmod>${u.lm}</lastmod>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
