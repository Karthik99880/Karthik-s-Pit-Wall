import { API } from './constants';
import type {
  DriverStanding,
  ConstructorStanding,
  Race,
} from './f1Types';


export interface MRDataEnvelope<T> {
  MRData: T;
}

export interface StandingsList {
  season: string;
  round: string;
  DriverStandings?: DriverStanding[];
  ConstructorStandings?: ConstructorStanding[];
}

export interface StandingsTable {
  StandingsTable: { StandingsLists: StandingsList[] };
}

export interface RaceTable {
  RaceTable: { Races: Race[] };
}

export type DriverStandingsResponse      = MRDataEnvelope<StandingsTable>;
export type ConstructorStandingsResponse = MRDataEnvelope<StandingsTable>;
export type RaceTableResponse            = MRDataEnvelope<RaceTable>;


export class F1ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'F1ApiError';
  }
}


/* ── Throttle queue ─────────────────────────────────────
 * Jolpica allows roughly 4 requests/second before it starts returning 429.
 * The dashboard fans out far more than that on a cold load (per-round results,
 * progression, pit stops, lap charts), so every call is funnelled through a
 * queue with a minimum gap. A 429 comes back without CORS headers, which the
 * browser surfaces as an opaque CORS failure rather than a status — so the
 * only reliable defence is not tripping the limit in the first place.
 */
const MAX_CONCURRENCY = 2;
const MIN_GAP_MS = 350;
const MAX_RETRIES = 4;

let active = 0;
let lastStart = 0;
const waiters: Array<() => void> = [];

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function pump() {
  if (active >= MAX_CONCURRENCY || waiters.length === 0) return;
  const gap = lastStart + MIN_GAP_MS - Date.now();
  if (gap > 0) { setTimeout(pump, gap); return; }
  active++;
  lastStart = Date.now();
  waiters.shift()!();
}

function acquire(): Promise<void> {
  return new Promise(resolve => { waiters.push(resolve); pump(); });
}

function release() { active--; pump(); }

interface Attempt<T> {
  ok: boolean;
  data?: T;
  error?: Error;
  retryable?: boolean;
  retryAfterMs?: number;
}

async function attemptFetch<T>(url: string): Promise<Attempt<T>> {
  await acquire();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API.TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.status === 429) {
      const header = Number(res.headers.get('retry-after'));
      return {
        ok: false, retryable: true,
        retryAfterMs: header > 0 ? header * 1000 : undefined,
        error: new F1ApiError('F1 API rate limited', 429),
      };
    }
    if (!res.ok) return { ok: false, error: new F1ApiError(`F1 API responded ${res.status}`, res.status) };
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: new F1ApiError(`F1 API request timed out after ${API.TIMEOUT_MS}ms`) };
    }
    // A rate-limited response arrives without CORS headers, so fetch rejects
    // outright. Treat an opaque network failure as retryable.
    return { ok: false, retryable: true, error: err as Error };
  } finally {
    clearTimeout(timer);
    release();
  }
}

export async function jolpicaFetch<T>(
  path: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<T> {
  const limit = opts.limit ?? API.PAGE_LIMIT;
  const offset = opts.offset ?? 0;
  const url = `${API.BASE}${path}?format=json&limit=${limit}${offset ? `&offset=${offset}` : ''}`;

  for (let attempt = 0; ; attempt++) {
    const r = await attemptFetch<T>(url);
    if (r.ok) return r.data as T;
    if (r.retryable && attempt < MAX_RETRIES) {
      const backoff = r.retryAfterMs ?? Math.min(10_000, 700 * 2 ** attempt) + Math.random() * 300;
      await sleep(backoff);
      continue;
    }
    throw r.error;
  }
}


export function firstStandingsList(res: StandingsTable): StandingsList | undefined {
  return res?.StandingsTable?.StandingsLists?.[0];
}

export function racesOf(res: RaceTable): Race[] {
  return res?.RaceTable?.Races ?? [];
}
