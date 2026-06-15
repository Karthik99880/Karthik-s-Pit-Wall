/** Central place for tunable durations, windows, and API config. */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** React-Query cache / refetch durations. */
export const CACHE = {
  STANDINGS:     30 * MINUTE,
  SCHEDULE:      1 * HOUR,
  NEXT_RACE:     5 * MINUTE,
  LAST_RACE:     30 * MINUTE,
  PROGRESSION:   1 * HOUR,
  TICK:          1000,
} as const;

/** Behavioural time windows. */
export const WINDOWS = {
  /** How long after lights-out a session is still considered "live". */
  SESSION_LIVE: 2 * HOUR,
} as const;

/** Jolpica (Ergast-compatible) API config. */
export const API = {
  BASE: 'https://api.jolpi.ca/ergast/f1',
  TIMEOUT_MS: 8000,
  PAGE_LIMIT: 100,
} as const;

/** Points awarded for a win — used for championship "magic number" math. */
export const POINTS = {
  RACE_WIN: 25,
  RACE_FASTEST_LAP: 1,
  SPRINT_WIN: 8,
} as const;

/** The team this dashboard is built around (highlighted everywhere). */
export const FAVOURITE_TEAM = 'mercedes';

export const SEASON_YEAR = new Date().getFullYear();
