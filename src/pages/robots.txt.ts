import type { APIRoute } from 'astro';
import { absUrl } from '../lib/data';

/**
 * Everything is allowed for every crawler, including search and AI search crawlers.
 * The named groups make that explicit; each group needs its own "Allow: /".
 */
const NAMED = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot'];

export const GET: APIRoute = () => {
  const groups = [...NAMED.map((ua) => `User-agent: ${ua}\nAllow: /`), 'User-agent: *\nAllow: /'];
  return new Response(`${groups.join('\n\n')}\n\nSitemap: ${absUrl('/sitemap.xml')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
