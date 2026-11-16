import type { APIRoute } from 'astro';
import { kitsCsv } from '../../lib/datasets';

/** Built at build time to dist/data/kit-audit.csv (CC BY 4.0). */
export const GET: APIRoute = () => new Response(kitsCsv(), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
