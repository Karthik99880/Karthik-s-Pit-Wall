import { useQuery } from '@tanstack/react-query';
import type { DriverStanding, ConstructorStanding, Race, RaceResult } from '@/lib/f1Types';

const BASE = 'https://api.jolpi.ca/ergast/f1';
const YEAR = new Date().getFullYear();

const FIVE_MINUTES   = 5  * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

/** Safely parse F1 API date+time — strips trailing Z so we don't produce "20:00:00ZZ" */
function f1Date(date: string, time?: string | null): Date {
  const t = (time ?? '14:00:00').replace(/Z$/i, '');
  return new Date(`${date}T${t}Z`);
}

async function jolpicaFetch<T>(path: string): Promise<T> {
  const url = `${BASE}${path}?format=json&limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`F1 API ${res.status}`);
  return res.json() as Promise<T>;
}

/* ── Driver Standings ──────────────────────────────── */
export function useDriverStandings() {
  return useQuery({
    queryKey: ['f1', 'driverStandings', YEAR],
    queryFn: async () => {
      const data = await jolpicaFetch<any>(`/${YEAR}/driverStandings/`);
      const standings: DriverStanding[] =
        data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
      return standings;
    },
    staleTime: THIRTY_MINUTES,
    refetchInterval: THIRTY_MINUTES,
    retry: 3,
  });
}

/* ── Constructor Standings ─────────────────────────── */
export function useConstructorStandings() {
  return useQuery({
    queryKey: ['f1', 'constructorStandings', YEAR],
    queryFn: async () => {
      const data = await jolpicaFetch<any>(`/${YEAR}/constructorStandings/`);
      const standings: ConstructorStanding[] =
        data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
      return standings;
    },
    staleTime: THIRTY_MINUTES,
    refetchInterval: THIRTY_MINUTES,
    retry: 3,
  });
}

/* ── Race Schedule ─────────────────────────────────── */
export function useRaceSchedule() {
  return useQuery({
    queryKey: ['f1', 'schedule', YEAR],
    queryFn: async () => {
      const data = await jolpicaFetch<any>(`/${YEAR}/`);
      const races: Race[] = data?.MRData?.RaceTable?.Races ?? [];
      return races;
    },
    staleTime: 60 * 60 * 1000,
    retry: 3,
  });
}

/* ── Last Race Results ─────────────────────────────── */
export function useLastRaceResults() {
  return useQuery({
    queryKey: ['f1', 'lastRace', YEAR],
    queryFn: async () => {
      const data = await jolpicaFetch<any>(`/${YEAR}/last/results/`);
      const races: Race[] = data?.MRData?.RaceTable?.Races ?? [];
      const race    = races[0] ?? null;
      const results: RaceResult[] = race?.Results ?? [];
      return { race, results };
    },
    staleTime: THIRTY_MINUTES,
    refetchInterval: THIRTY_MINUTES,
    retry: 3,
  });
}

/* ── Next Race — dedicated endpoint, always correct ── */
export function useNextRace() {
  return useQuery({
    queryKey: ['f1', 'nextRace'],
    queryFn: async () => {
      const data = await jolpicaFetch<any>('/current/next/');
      const races: Race[] = data?.MRData?.RaceTable?.Races ?? [];
      return races[0] ?? null;
    },
    staleTime: FIVE_MINUTES,
    refetchInterval: FIVE_MINUTES,
    retry: 3,
  });
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
      const diff    = Math.max(0, target - Date.now());
      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const hours   = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      return { days, hours, minutes, seconds };
    },
    enabled: !!target,
    refetchInterval: 1000,
    staleTime: 0,
  });
}
