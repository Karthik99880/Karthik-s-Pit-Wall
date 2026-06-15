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
