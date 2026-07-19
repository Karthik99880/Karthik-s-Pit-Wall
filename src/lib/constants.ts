

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;


export const CACHE = {
  STANDINGS:     30 * MINUTE,
  SCHEDULE:      1 * HOUR,
  NEXT_RACE:     5 * MINUTE,
  LAST_RACE:     30 * MINUTE,
  PROGRESSION:   1 * HOUR,
  TICK:          1000,
} as const;


export const WINDOWS = {
  
  SESSION_LIVE: 2 * HOUR,
} as const;


export const API = {
  BASE: 'https://api.jolpi.ca/ergast/f1',
  TIMEOUT_MS: 8000,
  PAGE_LIMIT: 100,
} as const;


export const POINTS = {
  RACE_WIN: 25,
  RACE_FASTEST_LAP: 1,
  SPRINT_WIN: 8,
} as const;


export const FAVOURITE_TEAM = 'mercedes';

export const SEASON_YEAR = new Date().getFullYear();
