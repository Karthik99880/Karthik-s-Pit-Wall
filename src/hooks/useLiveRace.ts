import { useQuery } from '@tanstack/react-query';
import { useRaceSchedule } from '@/hooks/useF1Data';
import { openF1Fetch, type OpenF1Driver } from '@/lib/openF1Api';
import { f1Date } from '@/lib/dateUtils';
import type { Race } from '@/lib/f1Types';

/* ── OpenF1 record types ────────────────────────────── */
interface PositionRec    { driver_number: number; position: number; date: string }
interface IntervalRec    { driver_number: number; gap_to_leader: number | string | null; interval: number | string | null; date: string }
interface PitRec         { driver_number: number; lap_number: number; pit_duration: number | null }
interface RaceControlRec { date: string; category: string; message: string; flag: string | null }
interface LapRec         { driver_number: number; lap_number: number; duration_sector_1: number | null; duration_sector_2: number | null; duration_sector_3: number | null; date_start: string }
interface StintRec       { driver_number: number; compound: string; tyre_age_at_start: number; stint_number: number; lap_start: number }
interface WeatherRec     { air_temperature: number; track_temperature: number; humidity: number; wind_speed: number; rainfall: number; date: string }

export interface LiveWeatherData {
  airTemp: number; trackTemp: number; humidity: number; windSpeed: number; rainfall: number;
}

export interface TickerRow {
  pos: number;
  code: string;
  teamColour: string;
  gap: string;
  pits: number;
  lastPitLap?: number;
  s1?: number | null;
  s2?: number | null;
  s3?: number | null;
  compound?: string;
  tyreAge?: number;
  currentLap?: number;
}

export interface LiveTickerData {
  rows: TickerRow[];
  messages: string[];
  updatedAt: number;
  leaderLap?: number;
}

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
  if (typeof g === 'string') return g;
  return `+${g.toFixed(1)}s`;
};

function latestPerDriver<T extends { driver_number: number; date: string }>(recs: T[]): Map<number, T> {
  const m = new Map<number, T>();
  for (const r of recs) {
    const cur = m.get(r.driver_number);
    if (!cur || r.date > cur.date) m.set(r.driver_number, r);
  }
  return m;
}

function latestLapPerDriver(laps: LapRec[]): Map<number, LapRec> {
  const m = new Map<number, LapRec>();
  for (const l of laps) {
    const cur = m.get(l.driver_number);
    if (!cur || l.lap_number > cur.lap_number) m.set(l.driver_number, l);
  }
  return m;
}

function latestStintPerDriver(stints: StintRec[]): Map<number, StintRec> {
  const m = new Map<number, StintRec>();
  for (const s of stints) {
    const cur = m.get(s.driver_number);
    if (!cur || s.stint_number > cur.stint_number) m.set(s.driver_number, s);
  }
  return m;
}

export function useLiveTicker(enabled: boolean) {
  return useQuery<LiveTickerData>({
    queryKey: ['openf1', 'liveTicker'],
    enabled,
    refetchInterval: 20_000,
    staleTime: 15_000,
    retry: 1,
    queryFn: async () => {
      const [drivers, positions, intervals, pits, rc, laps, stints] = await Promise.all([
        openF1Fetch<OpenF1Driver[]>('/drivers',      { session_key: 'latest' }),
        openF1Fetch<PositionRec[]>('/position',      { session_key: 'latest' }),
        openF1Fetch<IntervalRec[]>('/intervals',     { session_key: 'latest' }).catch(() => [] as IntervalRec[]),
        openF1Fetch<PitRec[]>('/pit',                { session_key: 'latest' }).catch(() => [] as PitRec[]),
        openF1Fetch<RaceControlRec[]>('/race_control',{ session_key: 'latest' }).catch(() => [] as RaceControlRec[]),
        openF1Fetch<LapRec[]>('/laps',               { session_key: 'latest' }).catch(() => [] as LapRec[]),
        openF1Fetch<StintRec[]>('/stints',           { session_key: 'latest' }).catch(() => [] as StintRec[]),
      ]);

      const driverMap = new Map<number, OpenF1Driver>();
      for (const d of drivers) driverMap.set(d.driver_number, d);

      const posMap   = latestPerDriver(positions);
      const intMap   = latestPerDriver(intervals);
      const lapMap   = latestLapPerDriver(laps);
      const stintMap = latestStintPerDriver(stints);

      const pitCount = new Map<number, { n: number; lastLap: number }>();
      for (const p of pits) {
        const cur = pitCount.get(p.driver_number) ?? { n: 0, lastLap: 0 };
        cur.n++;
        cur.lastLap = Math.max(cur.lastLap, p.lap_number);
        pitCount.set(p.driver_number, cur);
      }

      const leaderLap = lapMap.size > 0
        ? Math.max(...Array.from(lapMap.values()).map(l => l.lap_number))
        : undefined;

      const rows: TickerRow[] = [...posMap.values()]
        .sort((a, b) => a.position - b.position)
        .map(p => {
          const d     = driverMap.get(p.driver_number);
          const iv    = intMap.get(p.driver_number);
          const pit   = pitCount.get(p.driver_number);
          const lap   = lapMap.get(p.driver_number);
          const stint = stintMap.get(p.driver_number);
          const tyreAge = stint
            ? (lap?.lap_number ?? stint.lap_start) - stint.lap_start + stint.tyre_age_at_start
            : undefined;
          return {
            pos:        p.position,
            code:       d?.name_acronym ?? String(p.driver_number),
            teamColour: d?.team_colour  ?? '888888',
            gap:        p.position === 1 ? 'Leader' : fmtGap(iv?.gap_to_leader ?? null),
            pits:       pit?.n ?? 0,
            lastPitLap: pit?.lastLap,
            s1:         lap?.duration_sector_1,
            s2:         lap?.duration_sector_2,
            s3:         lap?.duration_sector_3,
            compound:   stint?.compound,
            tyreAge,
            currentLap: lap?.lap_number,
          };
        });

      const messages = [...rc]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 3)
        .map(m => m.message);

      return { rows, messages, updatedAt: Date.now(), leaderLap };
    },
  });
}

export function useLiveWeather(enabled: boolean) {
  return useQuery<LiveWeatherData | null>({
    queryKey: ['openf1', 'liveWeather'],
    enabled,
    refetchInterval: 60_000,
    staleTime: 50_000,
    retry: 1,
    queryFn: async () => {
      const recs = await openF1Fetch<WeatherRec[]>('/weather', { session_key: 'latest' }).catch(() => [] as WeatherRec[]);
      if (recs.length === 0) return null;
      const latest = [...recs].sort((a, b) => b.date.localeCompare(a.date))[0];
      return {
        airTemp:   latest.air_temperature,
        trackTemp: latest.track_temperature,
        humidity:  latest.humidity,
        windSpeed: latest.wind_speed,
        rainfall:  latest.rainfall,
      };
    },
  });
}

export const DEMO_TICKER: LiveTickerData = {
  leaderLap: 34,
  rows: [
    { pos: 1, code: 'ANT', teamColour: '27F4D2', gap: 'Leader',  pits: 1, lastPitLap: 24, s1: 22.841, s2: 30.142, s3: 27.934, compound: 'MEDIUM',       tyreAge: 10, currentLap: 34 },
    { pos: 2, code: 'RUS', teamColour: '27F4D2', gap: '+2.4s',   pits: 1, lastPitLap: 26, s1: 22.971, s2: 30.401, s3: 28.044, compound: 'SOFT',         tyreAge: 8,  currentLap: 34 },
    { pos: 3, code: 'HAM', teamColour: 'E8002D', gap: '+6.1s',   pits: 1, lastPitLap: 22, s1: 23.144, s2: 30.689, s3: 28.112, compound: 'MEDIUM',       tyreAge: 12, currentLap: 34 },
    { pos: 4, code: 'LEC', teamColour: 'E8002D', gap: '+9.8s',   pits: 1, lastPitLap: 23, s1: 23.280, s2: 30.812, s3: 28.341, compound: 'HARD',         tyreAge: 22, currentLap: 33 },
    { pos: 5, code: 'NOR', teamColour: 'FF8000', gap: '+14.2s',  pits: 2, lastPitLap: 31, s1: 23.190, s2: 30.520, s3: 28.201, compound: 'SOFT',         tyreAge: 3,  currentLap: 34 },
    { pos: 6, code: 'VER', teamColour: '3671C6', gap: '+17.5s',  pits: 1, lastPitLap: 25, s1: 23.401, s2: 31.012, s3: 28.534, compound: 'HARD',         tyreAge: 9,  currentLap: 33 },
    { pos: 7, code: 'PIA', teamColour: 'FF8000', gap: '+21.0s',  pits: 1, lastPitLap: 27, s1: 23.511, s2: 31.201, s3: 28.623, compound: 'MEDIUM',       tyreAge: 7,  currentLap: 33 },
    { pos: 8, code: 'ALO', teamColour: '229971', gap: '+34.6s',  pits: 2, lastPitLap: 33, s1: 23.690, s2: 31.450, s3: 28.812, compound: 'SOFT',         tyreAge: 1,  currentLap: 34 },
    { pos: 9, code: 'SAI', teamColour: 'E8002D', gap: '+38.1s',  pits: 1, lastPitLap: 20, s1: 23.901, s2: 31.622, s3: 29.012, compound: 'HARD',         tyreAge: 14, currentLap: 33 },
    { pos: 10,code: 'OCO', teamColour: '0093CC', gap: '+44.7s',  pits: 2, lastPitLap: 30, s1: 24.012, s2: 31.800, s3: 29.201, compound: 'MEDIUM',       tyreAge: 4,  currentLap: 33 },
  ],
  messages: [
    'DRS ENABLED',
    'CAR 55 (SAI) — 5 SECOND TIME PENALTY — TRACK LIMITS VIOLATION',
    'YELLOW FLAG SECTOR 7 — NOW CLEARED',
  ],
  updatedAt: Date.now(),
};

export const DEMO_WEATHER: LiveWeatherData = {
  airTemp: 28, trackTemp: 43, humidity: 52, windSpeed: 14, rainfall: 0,
};
