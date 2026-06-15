import { useQuery, useQueries } from '@tanstack/react-query';
import type { DriverStanding, ConstructorStanding, Race, RaceResult } from '@/lib/f1Types';
import {
  jolpicaFetch,
  firstStandingsList,
  racesOf,
  type DriverStandingsResponse,
  type ConstructorStandingsResponse,
  type RaceTableResponse,
} from '@/lib/f1Api';
import { openF1Fetch, type Stint, type OpenF1Session, type OpenF1Driver, type TyreCompound } from '@/lib/openF1Api';
import { CACHE, SEASON_YEAR } from '@/lib/constants';
import { f1Date, msUntil, breakdown } from '@/lib/dateUtils';

const YEAR = SEASON_YEAR;

/* ── Driver Standings ──────────────────────────────── */
export function useDriverStandings() {
  return useQuery({
    queryKey: ['f1', 'driverStandings', YEAR],
    queryFn: async () => {
      const data = await jolpicaFetch<DriverStandingsResponse>(`/${YEAR}/driverStandings/`);
      return firstStandingsList(data.MRData)?.DriverStandings ?? [];
    },
    staleTime: CACHE.STANDINGS,
    refetchInterval: CACHE.STANDINGS,
    retry: 3,
  });
}

/* ── Constructor Standings ─────────────────────────── */
export function useConstructorStandings() {
  return useQuery({
    queryKey: ['f1', 'constructorStandings', YEAR],
    queryFn: async () => {
      const data = await jolpicaFetch<ConstructorStandingsResponse>(`/${YEAR}/constructorStandings/`);
      return firstStandingsList(data.MRData)?.ConstructorStandings ?? [];
    },
    staleTime: CACHE.STANDINGS,
    refetchInterval: CACHE.STANDINGS,
    retry: 3,
  });
}

/* ── Race Schedule ─────────────────────────────────── */
export function useRaceSchedule() {
  return useQuery({
    queryKey: ['f1', 'schedule', YEAR],
    queryFn: async () => {
      const data = await jolpicaFetch<RaceTableResponse>(`/${YEAR}/`);
      return racesOf(data.MRData);
    },
    staleTime: CACHE.SCHEDULE,
    retry: 3,
  });
}

/* ── Last Race Results ─────────────────────────────── */
export function useLastRaceResults() {
  return useQuery({
    queryKey: ['f1', 'lastRace', YEAR],
    queryFn: async () => {
      const data = await jolpicaFetch<RaceTableResponse>(`/${YEAR}/last/results/`);
      const race = racesOf(data.MRData)[0] ?? null;
      const results: RaceResult[] = race?.Results ?? [];
      return { race, results };
    },
    staleTime: CACHE.LAST_RACE,
    refetchInterval: CACHE.LAST_RACE,
    retry: 3,
  });
}

/* ── Next Race — dedicated endpoint, always correct ── */
export function useNextRace() {
  return useQuery({
    queryKey: ['f1', 'nextRace'],
    queryFn: async () => {
      const data = await jolpicaFetch<RaceTableResponse>('/current/next/');
      return racesOf(data.MRData)[0] ?? null;
    },
    staleTime: CACHE.NEXT_RACE,
    refetchInterval: CACHE.NEXT_RACE,
    retry: 3,
  });
}

/* ── Season points progression (per completed round) ──
 * Fetches the driver standings *as of* each completed round so we can
 * chart how the championship developed. One query per round, each cached
 * for an hour — completed rounds never change.
 */
export interface ProgressionPoint {
  round: number;
  raceName: string;
  /** driverId -> cumulative points after this round */
  points: Record<string, number>;
}

export function useSeasonProgression(races: Race[] | undefined) {
  const now = Date.now();
  const completed = (races ?? []).filter(r => f1Date(r.date, r.time).getTime() < now);

  const results = useQueries({
    queries: completed.map(race => ({
      queryKey: ['f1', 'roundStandings', YEAR, race.round],
      queryFn: async (): Promise<ProgressionPoint> => {
        const data = await jolpicaFetch<DriverStandingsResponse>(
          `/${YEAR}/${race.round}/driverStandings/`,
        );
        const standings = firstStandingsList(data.MRData)?.DriverStandings ?? [];
        const points: Record<string, number> = {};
        for (const s of standings) points[s.Driver.driverId] = Number(s.points);
        return {
          round: Number(race.round),
          raceName: race.raceName.replace('Grand Prix', '').trim(),
          points,
        };
      },
      staleTime: CACHE.PROGRESSION,
      retry: 2,
    })),
  });

  const isLoading = results.some(r => r.isLoading);
  const data = results
    .map(r => r.data)
    .filter((p): p is ProgressionPoint => !!p)
    .sort((a, b) => a.round - b.round);

  return { data, isLoading };
}

/* ── Full results for each completed round ────────────
 * One request per completed round (cached an hour — finished rounds
 * never change). Powers teammate H2H and the overtaking index from a
 * single source: every RaceResult carries `grid` and `position`.
 */
export interface RoundResults {
  round: number;
  raceName: string;
  results: RaceResult[];
}

export function useSeasonResults(races: Race[] | undefined) {
  const now = Date.now();
  const completed = (races ?? []).filter(r => f1Date(r.date, r.time).getTime() < now);

  const queries = useQueries({
    queries: completed.map(race => ({
      queryKey: ['f1', 'roundResults', YEAR, race.round],
      queryFn: async (): Promise<RoundResults> => {
        const data = await jolpicaFetch<RaceTableResponse>(`/${YEAR}/${race.round}/results/`);
        const r = racesOf(data.MRData)[0];
        return {
          round: Number(race.round),
          raceName: race.raceName.replace('Grand Prix', '').trim(),
          results: r?.Results ?? [],
        };
      },
      staleTime: CACHE.PROGRESSION,
      retry: 2,
    })),
  });

  const isLoading = queries.some(q => q.isLoading);
  const data = queries
    .map(q => q.data)
    .filter((r): r is RoundResults => !!r)
    .sort((a, b) => a.round - b.round);

  return { data, isLoading };
}

/* ── Build ordered session list from Race object ────── */
export function buildSessions(race: Race) {
  const sessions: Array<{
    key: string; label: string; shortLabel: string;
    date: string; time: string; isSprint?: boolean; isRace?: boolean;
  }> = [];

  if (race.FirstPractice?.date)
    sessions.push({ key: 'fp1',    label: 'Practice 1',        shortLabel: 'FP1',    date: race.FirstPractice.date,    time: race.FirstPractice.time    ?? '12:00:00Z' });
  if (race.SprintQualifying?.date)
    sessions.push({ key: 'sq',     label: 'Sprint Qualifying',  shortLabel: 'SQ',     date: race.SprintQualifying.date, time: race.SprintQualifying.time ?? '12:00:00Z', isSprint: true });
  if (race.SecondPractice?.date)
    sessions.push({ key: 'fp2',    label: 'Practice 2',         shortLabel: 'FP2',    date: race.SecondPractice.date,   time: race.SecondPractice.time   ?? '12:00:00Z' });
  if (race.Sprint?.date)
    sessions.push({ key: 'sprint', label: 'Sprint Race',        shortLabel: 'SPRINT', date: race.Sprint.date,           time: race.Sprint.time           ?? '12:00:00Z', isSprint: true });
  if (race.ThirdPractice?.date)
    sessions.push({ key: 'fp3',    label: 'Practice 3',         shortLabel: 'FP3',    date: race.ThirdPractice.date,    time: race.ThirdPractice.time    ?? '12:00:00Z' });
  if (race.Qualifying?.date)
    sessions.push({ key: 'quali',  label: 'Qualifying',         shortLabel: 'QUALI',  date: race.Qualifying.date,       time: race.Qualifying.time       ?? '12:00:00Z' });
  sessions.push(  { key: 'race',   label: 'Race',               shortLabel: 'RACE',   date: race.date,                  time: race.time                  ?? '14:00:00Z', isRace: true });

  return sessions;
}

/* ── Countdown helper ──────────────────────────────── */
export function useCountdown(targetDate: string | undefined, targetTime: string | undefined) {
  const target = targetDate ? f1Date(targetDate, targetTime).getTime() : null;

  return useQuery({
    queryKey: ['countdown', targetDate, targetTime],
    queryFn: () => {
      if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return breakdown(msUntil(target));
    },
    enabled: !!target,
    refetchInterval: CACHE.TICK,
    staleTime: 0,
  });
}

/* ── OpenF1: latest race session key ───────────────────
 * Fetches all sessions for the latest meeting and finds
 * the one whose session_type is "Race" (not Sprint).
 */
export function useLatestRaceSession() {
  return useQuery({
    queryKey: ['openf1', 'latestRaceSession'],
    queryFn: async (): Promise<OpenF1Session | null> => {
      const sessions = await openF1Fetch<OpenF1Session[]>('/sessions', {
        meeting_key: 'latest',
        year: SEASON_YEAR,
      });
      // Prefer 'Race' session_type; fall back to last session
      const race = sessions.find(s => s.session_type === 'Race')
        ?? sessions[sessions.length - 1]
        ?? null;
      return race;
    },
    staleTime: CACHE.LAST_RACE,
    retry: 2,
  });
}

/* ── OpenF1 Stint data ─────────────────────────────────
 * Returns stints + driver info for the latest race session.
 */
export interface StintRow extends Stint {
  code:      string;   // 3-letter driver code
  fullName:  string;
  teamName:  string;
  teamColour: string;  // hex without #
}

export interface RaceStintsResult {
  raceName:    string;
  sessionKey:  number;
  /** driver_number → ordered stints */
  byDriver: Map<number, StintRow[]>;
  /** ordered list of driver numbers (by first stint appearance) */
  driverOrder: number[];
}

export function useRaceStints() {
  const { data: session } = useLatestRaceSession();

  return useQuery({
    queryKey: ['openf1', 'stints', session?.session_key],
    enabled: !!session?.session_key,
    staleTime: CACHE.PROGRESSION,
    retry: 2,
    queryFn: async (): Promise<RaceStintsResult> => {
      const sk = session!.session_key;

      // Fetch stints and drivers in parallel
      const [stints, drivers] = await Promise.all([
        openF1Fetch<Stint[]>('/stints', { session_key: sk }),
        openF1Fetch<OpenF1Driver[]>('/drivers', { session_key: sk }),
      ]);

      // Build driver lookup by number
      const driverMap = new Map<number, OpenF1Driver>();
      for (const d of drivers) driverMap.set(d.driver_number, d);

      // Group stints by driver, enriched with driver info
      const byDriver = new Map<number, StintRow[]>();
      const seen: number[] = [];

      // Sort stints by stint_number so rows are in lap order
      const sorted = [...stints].sort((a, b) =>
        a.driver_number - b.driver_number || a.stint_number - b.stint_number
      );

      for (const s of sorted) {
        const d = driverMap.get(s.driver_number);
        const row: StintRow = {
          ...s,
          code:       d?.name_acronym  ?? String(s.driver_number),
          fullName:   d?.full_name     ?? `Driver #${s.driver_number}`,
          teamName:   d?.team_name     ?? '',
          teamColour: d?.team_colour   ?? '888888',
        };
        if (!byDriver.has(s.driver_number)) {
          byDriver.set(s.driver_number, []);
          seen.push(s.driver_number);
        }
        byDriver.get(s.driver_number)!.push(row);
      }

      return {
        raceName:    session!.session_name,
        sessionKey:  sk,
        byDriver,
        driverOrder: seen,
      };
    },
  });
}

/* ── OpenF1 Predictive Strategy (Last 5 Races) ─────────
 * Fetches stints from the last 5 completed races to predict
 * the upcoming race's strategy.
 */
export interface PredictiveStrategyResult {
  racesAnalyzed: number;
  avgPitStops: number;
  likelyStart: TyreCompound;
  likelyCombo: string;
}

export function usePredictiveStints() {
  const { data: schedule } = useRaceSchedule();

  return useQuery({
    queryKey: ['openf1', 'predictiveStints'],
    enabled: !!schedule?.length,
    staleTime: CACHE.PROGRESSION,
    queryFn: async (): Promise<PredictiveStrategyResult | null> => {
      const now = Date.now();
      const completedRaces = (schedule ?? [])
        .filter(r => f1Date(r.date, r.time).getTime() < now);

      if (completedRaces.length === 0) return null;

      // 1. One request for every race session this year, then take the
      //    most recent five locally — was 5 separate per-country calls.
      const raceSessions = await openF1Fetch<OpenF1Session[]>('/sessions', {
        year: SEASON_YEAR,
        session_type: 'Race',
      });

      const sessionKeys = raceSessions
        .filter(s => new Date(s.date_start).getTime() < now) // only races that have actually run
        .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
        .slice(0, 5)
        .map(s => s.session_key);
      if (sessionKeys.length === 0) return null;

      // 2. Fetch stints per session; tolerate one with no data so a single
      //    missing/unprocessed session can't fail the whole prediction.
      const allStintsArrays = await Promise.all(
        sessionKeys.map(sk =>
          openF1Fetch<Stint[]>('/stints', { session_key: sk }).catch(() => [] as Stint[]),
        ),
      );
      
      const allStints = allStintsArrays.flat();

      // 3. Aggregate data
      let totalDrivers = 0;
      let totalPitStops = 0;
      const startCompounds: Record<string, number> = {};
      const combos: Record<string, number> = {};

      for (const sk of sessionKeys) {
        const sessionStints = allStints.filter(s => s.session_key === sk);
        const byDriver = new Map<number, Stint[]>();
        
        for (const s of sessionStints) {
          if (!byDriver.has(s.driver_number)) byDriver.set(s.driver_number, []);
          byDriver.get(s.driver_number)!.push(s);
        }

        for (const [driver, stints] of byDriver.entries()) {
          const sorted = [...stints].sort((a, b) => a.stint_number - b.stint_number);
          if (sorted.length === 0) continue;

          totalDrivers++;
          totalPitStops += (sorted.length - 1); // 2 stints = 1 pit stop

          const startComp = sorted[0].compound;
          startCompounds[startComp] = (startCompounds[startComp] || 0) + 1;

          const comboStr = sorted.map(s => s.compound.charAt(0)).join(' → ');
          combos[comboStr] = (combos[comboStr] || 0) + 1;
        }
      }

      // Find modes
      const likelyStart = Object.keys(startCompounds).reduce((a, b) => startCompounds[a] > startCompounds[b] ? a : b) as TyreCompound;
      const likelyCombo = Object.keys(combos).reduce((a, b) => combos[a] > combos[b] ? a : b);
      const avgPitStops = totalDrivers > 0 ? (totalPitStops / totalDrivers) : 0;

      return {
        racesAnalyzed: sessionKeys.length,
        avgPitStops,
        likelyStart,
        likelyCombo,
      };
    },
  });
}
