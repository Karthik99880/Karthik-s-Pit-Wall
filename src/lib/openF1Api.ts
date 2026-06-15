/** OpenF1 API client — mirrors the jolpicaFetch pattern. */

const BASE  = 'https://api.openf1.org/v1';
const TIMEOUT_MS = 10_000;

export class OpenF1Error extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'OpenF1Error';
  }
}

export async function openF1Fetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new OpenF1Error(`OpenF1 responded ${res.status}`, res.status);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new OpenF1Error(`OpenF1 request timed out after ${TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ── OpenF1 response types ─────────────────────────── */

export type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN';

export interface Stint {
  meeting_key:        number;
  session_key:        number;
  driver_number:      number;
  stint_number:       number;
  lap_start:          number;
  lap_end:            number;
  compound:           TyreCompound;
  tyre_age_at_start:  number;
}

export interface OpenF1Session {
  session_key:  number;
  session_name: string;  // e.g. "Race", "Qualifying", "Practice 1"
  session_type: string;  // e.g. "Race"
  meeting_key:  number;
  date_start:   string;
  year:         number;
}

export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;  // 3-letter code
  team_name: string;
  team_colour: string;   // hex without #
  session_key: number;
  meeting_key: number;
}
