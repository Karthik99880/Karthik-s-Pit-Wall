import { useQuery } from '@tanstack/react-query';
import { useRaceSchedule } from '@/hooks/useF1Data';
import { openF1Fetch, type OpenF1Driver } from '@/lib/openF1Api';
import { f1Date } from '@/lib/dateUtils';
import type { Race } from '@/lib/f1Types';

/* ── OpenF1 live-feed record types ─────────────────── */
interface PositionRec { driver_number: number; position: number; date: string }
interface IntervalRec { driver_number: number; gap_to_leader: number | string | null; interval: number | string | null; date: string }
interface PitRec { driver_number: number; lap_number: number; pit_duration: number | null }
interface RaceControlRec { date: string; category: string; message: string; flag: string | null }

export interface TickerRow {
  pos: number;
  code: string;
  teamColour: string;   // hex without '#'
  gap: string;          // formatted gap to leader
  pits: number;
  lastPitLap?: number;
}

export interface LiveTickerData {
  rows: TickerRow[];
  messages: string[];   // recent race-control messages, newest first
  updatedAt: number;
}

/** The race considered "live": from 10 min before lights out to 3 h after. */
export function useLiveRaceWindow(): Race | null {
  const { data: races } = useRaceSchedule();
  const now = Date.now();
  const live = (races ?? []).find(r => {
    const t = f1Date(r.date, r.time).getTime();
    return now >= t - 10 * 60_000 && now <= t + 3 * 3_600_000;
  });
  return live ?? null;
}

const fmtGap = (g: number | string | null): string => {
  if (g === null || g === undefined || g === '') return '—';
  if (typeof g === 'string') return g;                  // e.g. "1 LAP"
  return `+${g.toFixed(1)}s`;
};

/** Reduce a full-session record list to the latest record per driver. */
function latestPerDriver<T extends { driver_number: number; date: string }>(recs: T[]): Map<number, T> {
  const m = new Map<number, T>();
  for (const r of recs) {
    const cur = m.get(r.driver_number);
    if (!cur || r.date > cur.date) m.set(r.driver_number, r);
  }
  return m;
}

/**
 * Polls OpenF1's live feed while a race is on. The free tier is delayed
 * ~30 s, so a 20 s poll is plenty — and every call goes through the
 * throttled openF1Fetch queue, so we can't trip the 429 limiter.
 */
export function useLiveTicker(enabled: boolean) {
  return useQuery<LiveTickerData>({
    queryKey: ['openf1', 'liveTicker'],
    enabled,
    refetchInterval: 20_000,
    staleTime: 15_000,
    retry: 1,
    queryFn: async () => {
      const [drivers, positions, intervals, pits, rc] = await Promise.all([
        openF1Fetch<OpenF1Driver[]>('/drivers', { session_key: 'latest' }),
        openF1Fetch<PositionRec[]>('/position', { session_key: 'latest' }),
        openF1Fetch<IntervalRec[]>('/intervals', { session_key: 'latest' }).catch(() => [] as IntervalRec[]),
        openF1Fetch<PitRec[]>('/pit', { session_key: 'latest' }).catch(() => [] as PitRec[]),
        openF1Fetch<RaceControlRec[]>('/race_control', { session_key: 'latest' }).catch(() => [] as RaceControlRec[]),
      ]);

      const driverMap = new Map<number, OpenF1Driver>();
      for (const d of drivers) driverMap.set(d.driver_number, d);

      const posMap = latestPerDriver(positions);
      const intMap = latestPerDriver(intervals);

      const pitCount = new Map<number, { n: number; lastLap: number }>();
      for (const p of pits) {
        const cur = pitCount.get(p.driver_number) ?? { n: 0, lastLap: 0 };
        cur.n += 1;
        cur.lastLap = Math.max(cur.lastLap, p.lap_number);
        pitCount.set(p.driver_number, cur);
      }

      const rows: TickerRow[] = [...posMap.values()]
        .sort((a, b) => a.position - b.position)
        .map(p => {
          const d = driverMap.get(p.driver_number);
          const iv = intMap.get(p.driver_number);
          const pit = pitCount.get(p.driver_number);
          return {
            pos: p.position,
            code: d?.name_acronym ?? String(p.driver_number),
            teamColour: d?.team_colour ?? '888888',
            gap: p.position === 1 ? 'Leader' : fmtGap(iv?.gap_to_leader ?? null),
            pits: pit?.n ?? 0,
            lastPitLap: pit?.lastLap,
          };
        });

      const messages = [...rc]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 3)
        .map(m => m.message);

      return { rows, messages, updatedAt: Date.now() };
    },
  });
}

/** Static plausible data so the ticker can be previewed outside race hours (?demo=race). */
export const DEMO_TICKER: LiveTickerData = {
  rows: [
    { pos: 1, code: 'ANT', teamColour: '27F4D2', gap: 'Leader', pits: 1, lastPitLap: 24 },
    { pos: 2, code: 'RUS', teamColour: '27F4D2', gap: '+2.4s', pits: 1, lastPitLap: 26 },
    { pos: 3, code: 'HAM', teamColour: 'E8002D', gap: '+6.1s', pits: 1, lastPitLap: 22 },
    { pos: 4, code: 'LEC', teamColour: 'E8002D', gap: '+9.8s', pits: 1, lastPitLap: 23 },
    { pos: 5, code: 'NOR', teamColour: 'FF8000', gap: '+14.2s', pits: 2, lastPitLap: 31 },
    { pos: 6, code: 'VER', teamColour: '3671C6', gap: '+17.5s', pits: 1, lastPitLap: 25 },
    { pos: 7, code: 'PIA', teamColour: 'FF8000', gap: '+21.0s', pits: 1, lastPitLap: 27 },
    { pos: 8, code: 'ALO', teamColour: '229971', gap: '+34.6s', pits: 2, lastPitLap: 33 },
  ],
  messages: ['DRS ENABLED', 'CAR 55 (SAI) — 5 SECOND TIME PENALTY — TRACK LIMITS', 'YELLOW FLAG SECTOR 7 CLEARED'],
  updatedAt: Date.now(),
};
