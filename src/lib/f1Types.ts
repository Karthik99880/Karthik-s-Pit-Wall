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
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      country: string;
      locality: string;
    };
  };
  date: string;
  time?: string;
  Results?: RaceResult[];
  // Weekend sessions (present on /current/next/ response)
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

export function getTeamDisplay(constructorId: string, fallback: string): string {
  return TEAM_DISPLAY[constructorId.toLowerCase()] ?? fallback;
}

export function getFlag(country: string): string {
  return COUNTRY_FLAG[country] ?? '🏁';
}

export function isFavoriteTeam(constructorId: string): boolean {
  const id = constructorId.toLowerCase();
  return id === 'mercedes';
}

/** Re-exported from the single source of truth in dateUtils. */
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

/** Generates official F1 driver headshot media URL */
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

/** Generates official F1 team car media URL */
export function getCarPhoto(constructorId: string): string {
  // Direct CDN URLs confirmed working from media.formula1.com
  const carMap: Record<string, string> = {
    mercedes:      'mercedes',
    ferrari:       'ferrari',
    red_bull:      'red-bull-racing',
    mclaren:       'mclaren',
    aston_martin:  'aston-martin',
    alpine:        'alpine',
    haas:          'haas-f1-team',
    rb:            'rb',
    racing_bulls:  'rb',
    williams:      'williams',
    williams_racing: 'williams',
    'williams-racing': 'williams',
    sauber:        'kick-sauber',
    kick_sauber:   'kick-sauber',
    audi:          'kick-sauber', // Audi replaces Sauber in 2026, fallback to 2024 Sauber car
    cadillac:      'haas-f1-team', // Cadillac is new in 2026, fallback to Haas or similar generic shape
  };
  const slug = carMap[constructorId.toLowerCase()] ?? constructorId.toLowerCase();
  
  // Use 2024 CDN as a baseline since 2026 isn't fully populated yet
  return `https://media.formula1.com/content/dam/fom-website/teams/2024/${slug}.png`;
}
