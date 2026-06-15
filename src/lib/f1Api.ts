import { API } from './constants';
import type {
  DriverStanding,
  ConstructorStanding,
  Race,
} from './f1Types';

/* ── Jolpica/Ergast response envelopes ─────────────── */
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

/* ── Error type so callers can distinguish failures ── */
export class F1ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'F1ApiError';
  }
}

/**
 * Fetch a path from the F1 API as JSON, with an AbortController timeout
 * so a hung connection can't keep a query "pending" forever.
 */
export async function jolpicaFetch<T>(path: string): Promise<T> {
  const url = `${API.BASE}${path}?format=json&limit=${API.PAGE_LIMIT}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API.TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new F1ApiError(`F1 API responded ${res.status}`, res.status);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new F1ApiError(`F1 API request timed out after ${API.TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ── Small typed extractors ────────────────────────── */
export function firstStandingsList(res: StandingsTable): StandingsList | undefined {
  return res?.StandingsTable?.StandingsLists?.[0];
}

export function racesOf(res: RaceTable): Race[] {
  return res?.RaceTable?.Races ?? [];
}
