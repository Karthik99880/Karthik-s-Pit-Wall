/**
 * Shared F1 date/time helpers.
 *
 * The Jolpica/Ergast API returns time already with a trailing "Z"
 * (e.g. "20:00:00Z"), so we strip it before appending to avoid
 * "20:00:00ZZ" → Invalid Date.
 */

/** Default session start time when the API omits one (UTC). */
const DEFAULT_TIME = '14:00:00';

/** Safely parse an F1 API date (+ optional time) into a Date. */
export function f1Date(date: string, time?: string | null): Date {
  const t = (time ?? DEFAULT_TIME).replace(/Z$/i, '');
  return new Date(`${date}T${t}Z`);
}

/** Alias kept for call sites that imported `parseF1DateTime`. */
export const parseF1DateTime = f1Date;

/** Milliseconds remaining until `target` (never negative). */
export function msUntil(target: Date | number): number {
  const ts = typeof target === 'number' ? target : target.getTime();
  return Math.max(0, ts - Date.now());
}

/** Break a millisecond duration into d/h/m/s parts. */
export function breakdown(ms: number) {
  const abs = Math.abs(ms);
  return {
    days:    Math.floor(abs / 86_400_000),
    hours:   Math.floor(abs / 3_600_000) % 24,
    minutes: Math.floor(abs / 60_000) % 60,
    seconds: Math.floor(abs / 1_000) % 60,
  };
}
