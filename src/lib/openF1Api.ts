

const BASE  = 'https://api.openf1.org/v1';
const TIMEOUT_MS = 10_000;

export class OpenF1Error extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'OpenF1Error';
  }
}


const MAX_CONCURRENCY = 2;
const MIN_GAP_MS = 300;
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
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.status === 429) {
      const header = Number(res.headers.get('retry-after'));
      return { ok: false, retryable: true, retryAfterMs: header > 0 ? header * 1000 : undefined, error: new OpenF1Error('OpenF1 rate limited', 429) };
    }
    if (!res.ok) return { ok: false, error: new OpenF1Error(`OpenF1 responded ${res.status}`, res.status) };
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: new OpenF1Error(`OpenF1 request timed out after ${TIMEOUT_MS}ms`) };
    }
    return { ok: false, error: err as Error };
  } finally {
    clearTimeout(timer);
    release(); 
  }
}

export async function openF1Fetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const href = url.toString();

  for (let attempt = 0; ; attempt++) {
    const r = await attemptFetch<T>(href);
    if (r.ok) return r.data as T;
    if (r.retryable && attempt < MAX_RETRIES) {
      
      const backoff = r.retryAfterMs ?? Math.min(8000, 500 * 2 ** attempt) + Math.random() * 250;
      await sleep(backoff);
      continue;
    }
    throw r.error;
  }
}



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
  session_name: string;  
  session_type: string;  
  meeting_key:  number;
  date_start:   string;
  year:         number;
}

export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;  
  team_name: string;
  team_colour: string;   
  session_key: number;
  meeting_key: number;
}
