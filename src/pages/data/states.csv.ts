import type { APIRoute } from 'astro';
import { statesCsv } from '../../lib/datasets';

/** Built at build time to dist/data/states.csv (CC BY 4.0). */
export const GET: APIRoute = () => new Response(statesCsv(), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
