import type { APIRoute } from 'astro';
import { railingCsv } from '../../lib/datasets';

/** Built at build time to dist/data/railing-vs-tilted.csv (CC BY 4.0). */
export const GET: APIRoute = () => new Response(railingCsv(), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
