/**
 * Static circuit reference. None of this is exposed by Ergast/Jolpica or OpenF1,
 * so it's curated here and keyed by Ergast circuitId.
 *
 * downforce / tyreStress / overtaking are 1-5 ratings (5 = highest demand).
 */
export interface CircuitFacts {
  lengthKm: number;
  laps: number;
  turns: number;
  drsZones: number;
  lapRecord?: { time: string; driver: string; year: number };
  downforce: number;
  tyreStress: number;
  overtaking: number;
  note: string;
}

export const CIRCUIT_FACTS: Record<string, CircuitFacts> = {
  bahrain: {
    lengthKm: 5.412, laps: 57, turns: 15, drsZones: 3,
    lapRecord: { time: '1:31.447', driver: 'de la Rosa', year: 2005 },
    downforce: 3, tyreStress: 5, overtaking: 4,
    note: 'Abrasive surface and heavy braking zones — the hardest race of the year on rear tyres.',
  },
  jeddah: {
    lengthKm: 6.174, laps: 50, turns: 27, drsZones: 3,
    lapRecord: { time: '1:30.734', driver: 'Hamilton', year: 2021 },
    downforce: 2, tyreStress: 3, overtaking: 3,
    note: 'The fastest street circuit on the calendar. Blind walls, very little run-off.',
  },
  albert_park: {
    lengthKm: 5.278, laps: 58, turns: 14, drsZones: 4,
    lapRecord: { time: '1:19.813', driver: 'Leclerc', year: 2024 },
    downforce: 3, tyreStress: 3, overtaking: 3,
    note: 'Resurfaced and much quicker than its park-circuit reputation suggests.',
  },
  suzuka: {
    lengthKm: 5.807, laps: 53, turns: 18, drsZones: 2,
    lapRecord: { time: '1:30.983', driver: 'Hamilton', year: 2019 },
    downforce: 4, tyreStress: 5, overtaking: 2,
    note: 'The only figure-of-eight on the calendar. Sustained high-speed loading through the Esses.',
  },
  shanghai: {
    lengthKm: 5.451, laps: 56, turns: 16, drsZones: 2,
    lapRecord: { time: '1:32.238', driver: 'Schumacher', year: 2004 },
    downforce: 3, tyreStress: 4, overtaking: 4,
    note: 'Turn 1 tightens forever and the back straight is one of the longest in F1.',
  },
  miami: {
    lengthKm: 5.412, laps: 57, turns: 19, drsZones: 3,
    lapRecord: { time: '1:29.708', driver: 'Verstappen', year: 2023 },
    downforce: 3, tyreStress: 3, overtaking: 3,
    note: 'Low-grip temporary surface with a genuinely quick middle sector.',
  },
  imola: {
    lengthKm: 4.909, laps: 63, turns: 19, drsZones: 2,
    lapRecord: { time: '1:15.484', driver: 'Hamilton', year: 2020 },
    downforce: 4, tyreStress: 3, overtaking: 1,
    note: 'Old-school, narrow and kerb-heavy. Track position is close to everything here.',
  },
  monaco: {
    lengthKm: 3.337, laps: 78, turns: 19, drsZones: 1,
    lapRecord: { time: '1:12.909', driver: 'Hamilton', year: 2021 },
    downforce: 5, tyreStress: 1, overtaking: 1,
    note: 'Maximum downforce, minimum tyre stress. Qualifying effectively decides the race.',
  },
  villeneuve: {
    lengthKm: 4.361, laps: 70, turns: 14, drsZones: 3,
    lapRecord: { time: '1:13.078', driver: 'Bottas', year: 2019 },
    downforce: 2, tyreStress: 2, overtaking: 4,
    note: 'Stop-start layout, brutal on brakes, and the Wall of Champions still collects victims.',
  },
  catalunya: {
    lengthKm: 4.657, laps: 66, turns: 14, drsZones: 2,
    lapRecord: { time: '1:16.330', driver: 'Verstappen', year: 2023 },
    downforce: 4, tyreStress: 5, overtaking: 2,
    note: 'The traditional aero benchmark. Long right-handers punish the front-left.',
  },
  red_bull_ring: {
    lengthKm: 4.318, laps: 71, turns: 10, drsZones: 3,
    lapRecord: { time: '1:05.619', driver: 'Sainz', year: 2020 },
    downforce: 2, tyreStress: 3, overtaking: 4,
    note: 'Barely a minute a lap. Three DRS zones and constant traffic make it chaotic.',
  },
  silverstone: {
    lengthKm: 5.891, laps: 52, turns: 18, drsZones: 2,
    lapRecord: { time: '1:27.097', driver: 'Verstappen', year: 2020 },
    downforce: 4, tyreStress: 5, overtaking: 3,
    note: 'Copse, Maggotts and Becketts load the tyres harder than anywhere else on the calendar.',
  },
  hungaroring: {
    lengthKm: 4.381, laps: 70, turns: 14, drsZones: 2,
    lapRecord: { time: '1:16.627', driver: 'Hamilton', year: 2020 },
    downforce: 5, tyreStress: 3, overtaking: 1,
    note: 'Monaco without the walls — narrow, twisty and famously hard to pass on.',
  },
  spa: {
    lengthKm: 7.004, laps: 44, turns: 19, drsZones: 2,
    lapRecord: { time: '1:46.286', driver: 'Bottas', year: 2018 },
    downforce: 2, tyreStress: 4, overtaking: 5,
    note: 'The longest lap in F1. Eau Rouge flat, and a wing level that is always a compromise.',
  },
  zandvoort: {
    lengthKm: 4.259, laps: 72, turns: 14, drsZones: 2,
    lapRecord: { time: '1:11.097', driver: 'Verstappen', year: 2021 },
    downforce: 5, tyreStress: 4, overtaking: 1,
    note: 'Banked corners at Hugenholtz and Arie Luyendyk. Very narrow, very hard to overtake.',
  },
  monza: {
    lengthKm: 5.793, laps: 53, turns: 11, drsZones: 2,
    lapRecord: { time: '1:21.046', driver: 'Barrichello', year: 2004 },
    downforce: 1, tyreStress: 2, overtaking: 5,
    note: 'The Temple of Speed. Lowest downforce of the year and huge slipstreaming battles.',
  },
  baku: {
    lengthKm: 6.003, laps: 51, turns: 20, drsZones: 2,
    lapRecord: { time: '1:43.009', driver: 'Leclerc', year: 2019 },
    downforce: 1, tyreStress: 2, overtaking: 5,
    note: 'A 2.2 km flat-out run into a 90-degree corner, plus a castle section barely wider than a car.',
  },
  marina_bay: {
    lengthKm: 4.940, laps: 62, turns: 19, drsZones: 3,
    lapRecord: { time: '1:34.486', driver: 'Hamilton', year: 2023 },
    downforce: 5, tyreStress: 3, overtaking: 2,
    note: 'Humidity, two hours under lights, and the highest physical toll of the season.',
  },
  americas: {
    lengthKm: 5.513, laps: 56, turns: 20, drsZones: 2,
    lapRecord: { time: '1:36.169', driver: 'Leclerc', year: 2019 },
    downforce: 3, tyreStress: 4, overtaking: 4,
    note: 'A greatest-hits layout — Turn 1 uphill, then a Becketts-style esse sequence.',
  },
  rodriguez: {
    lengthKm: 4.304, laps: 71, turns: 17, drsZones: 3,
    lapRecord: { time: '1:17.774', driver: 'Bottas', year: 2021 },
    downforce: 4, tyreStress: 2, overtaking: 4,
    note: '2,200 m above sea level. Thin air means max wing still gives Monza-like straight speed.',
  },
  interlagos: {
    lengthKm: 4.309, laps: 71, turns: 15, drsZones: 2,
    lapRecord: { time: '1:10.540', driver: 'Bottas', year: 2018 },
    downforce: 3, tyreStress: 3, overtaking: 5,
    note: 'Short, anticlockwise, permanently unpredictable weather. Rarely a dull race.',
  },
  vegas: {
    lengthKm: 6.201, laps: 50, turns: 17, drsZones: 2,
    lapRecord: { time: '1:35.490', driver: 'Piastri', year: 2023 },
    downforce: 1, tyreStress: 2, overtaking: 4,
    note: 'Cold night running on a street surface — getting tyres into the window is the whole race.',
  },
  losail: {
    lengthKm: 5.419, laps: 57, turns: 16, drsZones: 1,
    lapRecord: { time: '1:24.319', driver: 'Verstappen', year: 2021 },
    downforce: 4, tyreStress: 5, overtaking: 2,
    note: 'Relentless medium-to-high speed corners. Severe on tyre sidewalls.',
  },
  yas_marina: {
    lengthKm: 5.281, laps: 58, turns: 16, drsZones: 2,
    lapRecord: { time: '1:26.103', driver: 'Verstappen', year: 2021 },
    downforce: 3, tyreStress: 2, overtaking: 3,
    note: 'The season closer. Track temperature drops sharply from qualifying into the race.',
  },
};

export function getCircuitFacts(circuitId: string): CircuitFacts | null {
  return CIRCUIT_FACTS[circuitId.toLowerCase()] ?? null;
}
