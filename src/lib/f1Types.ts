import { SEASON_YEAR, FAVOURITE_TEAM } from './constants';
import { getFanTeam } from './fanTeam';

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    givenName: string;
    familyName: string;
    nationality: string;
    code?: string;
    permanentNumber?: string;
    url?: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
    nationality: string;
  }>;
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}

export interface SessionTime {
  date: string;
  time?: string;
}

export interface Race {
  round: string;
  season?: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      country: string;
      locality: string;
      lat?: string;
      long?: string;
    };
  };
  date: string;
  time?: string;
  Results?: RaceResult[];
  QualifyingResults?: QualifyingResult[];
  
  FirstPractice?: SessionTime;
  SecondPractice?: SessionTime;
  ThirdPractice?: SessionTime;
  Qualifying?: SessionTime;
  Sprint?: SessionTime;
  SprintQualifying?: SessionTime;
}

export interface SessionInfo {
  key: string;
  label: string;
  shortLabel: string;
  date: string;
  time: string;
  isSprint?: boolean;
  isRace?: boolean;
}

export interface RaceResult {
  number?: string;      // car number raced this round (e.g. '1' for the champion)
  position: string;
  points: string;
  Driver: {
    driverId: string;
    givenName: string;
    familyName: string;
    code?: string;
    permanentNumber?: string;
    nationality: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
  };
  Time?: { time: string };
  FastestLap?: { rank: string; Time: { time: string } };
  status: string;
  grid: string;
}

export type QualifyingResult = Pick<RaceResult, 'position' | 'Driver' | 'Constructor'> & {
  Q1?: string;
  Q2?: string;
  Q3?: string;
};

export const TEAM_COLORS: Record<string, string> = {
  mercedes:      '#27F4D2',
  ferrari:       '#E8002D',
  mclaren:       '#FF8000',
  red_bull:      '#3671C6',
  williams:      '#64C4FF',
  haas:          '#B6BABD',
  alpine:        '#0093CC',
  sauber:        '#00877C',
  audi:          '#00877C',
  rb:            '#6692FF',
  racing_bulls:  '#6692FF',
  aston_martin:  '#229971',
  cadillac:      '#8A9099',
  kick_sauber:   '#00877C',
};

export const TEAM_DISPLAY: Record<string, string> = {
  mercedes:      'Mercedes',
  ferrari:       'Ferrari',
  mclaren:       'McLaren',
  red_bull:      'Red Bull',
  williams:      'Williams',
  haas:          'Haas',
  alpine:        'Alpine',
  sauber:        'Audi',
  audi:          'Audi',
  rb:            'RB',
  racing_bulls:  'Racing Bulls',
  aston_martin:  'Aston Martin',
  cadillac:      'Cadillac',
  kick_sauber:   'Audi',
};

export const COUNTRY_FLAG: Record<string, string> = {
  Bahrain:           '🇧🇭',
  'Saudi Arabia':    '🇸🇦',
  Australia:         '🇦🇺',
  Japan:             '🇯🇵',
  China:             '🇨🇳',
  USA:               '🇺🇸',
  'United States':   '🇺🇸',
  Italy:             '🇮🇹',
  Monaco:            '🇲🇨',
  Canada:            '🇨🇦',
  Spain:             '🇪🇸',
  Austria:           '🇦🇹',
  UK:                '🇬🇧',
  'United Kingdom':  '🇬🇧',
  Hungary:           '🇭🇺',
  Belgium:           '🇧🇪',
  Netherlands:       '🇳🇱',
  Azerbaijan:        '🇦🇿',
  Singapore:         '🇸🇬',
  Mexico:            '🇲🇽',
  Brazil:            '🇧🇷',
  'Abu Dhabi':       '🇦🇪',
  UAE:               '🇦🇪',
  Qatar:             '🇶🇦',
  Argentina:         '🇦🇷',
  Portugal:          '🇵🇹',
  Russia:            '🇷🇺',
  Turkey:            '🇹🇷',
  France:            '🇫🇷',
  Germany:           '🇩🇪',
  Thailand:          '🇹🇭',
  'South Africa':    '🇿🇦',
  Vietnam:           '🇻🇳',
  Miami:             '🇺🇸',
  'Las Vegas':       '🇺🇸',
};

export function getTeamColor(constructorId: string): string {
  return TEAM_COLORS[constructorId.toLowerCase()] ?? '#888';
}

export const teamInk = (hex: string) => `color-mix(in oklab, ${hex} 50%, var(--ink))`;

export function getTeamDisplay(constructorId: string, fallback: string): string {
  return TEAM_DISPLAY[constructorId.toLowerCase()] ?? fallback;
}

export function getFlag(country: string): string {
  return COUNTRY_FLAG[country] ?? '🏁';
}

export function isFavoriteTeam(constructorId: string): boolean {
  const id = constructorId.toLowerCase();
  return id === getFanTeamId();
}

export function getFanTeamId(): string {
  return getFanTeam() ?? FAVOURITE_TEAM;
}

export function getFanTeamName(): string {
  const id = getFanTeamId();
  return TEAM_DISPLAY[id] ?? id;
}

export function teamDrivers(standings: DriverStanding[], lastRace: RaceResult[], constructorId: string): DriverStanding[] {
  const racing = lastRace.filter(r => r.Constructor.constructorId === constructorId).map(r => r.Driver.driverId);
  const current = standings.filter(d => racing.includes(d.Driver.driverId));
  return current.length ? current : standings.filter(d => d.Constructors.at(-1)?.constructorId === constructorId).slice(0, 2);
}


export { f1Date as parseF1DateTime } from './dateUtils';

export const NATIONALITY_FLAG: Record<string, string> = {
  British:    '🇬🇧', German:    '🇩🇪', Spanish:   '🇪🇸',
  Finnish:    '🇫🇮', French:    '🇫🇷', Dutch:     '🇳🇱',
  Mexican:    '🇲🇽', Australian:'🇦🇺', Canadian:  '🇨🇦',
  Monegasque:'🇲🇨', Italian:   '🇮🇹', Thai:      '🇹🇭',
  Chinese:   '🇨🇳', Japanese:  '🇯🇵', Danish:    '🇩🇰',
  American:  '🇺🇸', Brazilian: '🇧🇷', Argentine: '🇦🇷',
  Russian:   '🇷🇺', Polish:    '🇵🇱', Belgian:   '🇧🇪',
  Austrian:  '🇦🇹', Swiss:     '🇨🇭', Swedish:   '🇸🇪',
  Hungarian: '🇭🇺', Czech:     '🇨🇿', Bahraini:  '🇧🇭',
  Emirati:   '🇦🇪', 'New Zealander': '🇳🇿',
};

export function getNationalityFlag(nationality: string): string {
  return NATIONALITY_FLAG[nationality] ?? '🏁';
}


export function getDriverPhoto(givenName: string, familyName: string): string {
  if (familyName.toLowerCase() === 'antonelli') {
    return 'https://upload.wikimedia.org/wikipedia/commons/6/69/Andrea_Kimi_Antonelli_2023.jpg';
  }
  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "");
  const first = normalize(givenName);
  const last = normalize(familyName);
  const initial = first.charAt(0).toUpperCase();
  const code = (first.slice(0, 3).toUpperCase() + last.slice(0, 3).toUpperCase()).padEnd(6, 'X') + '01';
  const folder = `${code}_${first}_${last}`;
  const filename = `${code.toLowerCase()}.png`;
  return `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/${initial}/${folder}/${filename}.transform/1col/image.png`;
}


const F1_MEDIA = 'https://media.formula1.com/image/upload';

function teamSlug(constructorId: string): string {
  const id = constructorId.toLowerCase();
  const map: Record<string, string> = {
    red_bull: 'redbullracing',
    rb:       'racingbulls',
    sauber:   'audi',
  };
  return map[id] ?? id.replace(/[^a-z0-9]/g, '');
}

export function getDriverPortrait(driver: { givenName: string; familyName: string }, constructorId: string): string {
  const three = (s: string) => s.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 3);
  const slug = teamSlug(constructorId);
  const code = `${three(driver.givenName)}${three(driver.familyName)}01`;
  return `${F1_MEDIA}/c_lfill,w_640/q_auto/v1740000000/common/f1/${SEASON_YEAR}/${slug}/${code}/${SEASON_YEAR}${slug}${code}right.webp`;
}

export function getCarPhoto(constructorId: string): string {
  const slug = teamSlug(constructorId);
  // ponytail: assumes formula1.com keeps this path each season; a missing image just hides via onError
  return `${F1_MEDIA}/c_lfill,w_800/q_auto/v1740000000/common/f1/${SEASON_YEAR}/${slug}/${SEASON_YEAR}${slug}carright.webp`;
}
