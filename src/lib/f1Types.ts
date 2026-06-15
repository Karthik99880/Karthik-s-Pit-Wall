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

/** Safely parse F1 API date + time strings.
 *  The API returns time already with a trailing "Z" (e.g. "20:00:00Z"),
 *  so we strip it before appending to avoid "20:00:00ZZ" → Invalid Date.
 */
export function parseF1DateTime(date: string, time?: string | null): Date {
  const t = (time ?? '14:00:00').replace(/Z$/i, '');
  return new Date(`${date}T${t}Z`);
}

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
