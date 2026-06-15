/**
 * Curated track-type classification — the F1 API has no "circuit type"
 * field, so we map circuitId → category by hand. Categories follow the
 * commonly accepted demands each layout places on car + driver.
 */
export type CircuitCategory = 'STREET' | 'POWER' | 'TECHNICAL' | 'BALANCED';

export const CIRCUIT_CATEGORY: Record<string, CircuitCategory> = {
  // Street / temporary — walls close, low margin, qualifying-critical
  monaco:       'STREET',
  jeddah:       'STREET',
  baku:         'STREET',
  marina_bay:   'STREET',
  vegas:        'STREET',
  miami:        'STREET',
  albert_park:  'STREET',

  // Power / low-downforce — long straights, engine + top speed
  monza:        'POWER',
  spa:          'POWER',
  silverstone:  'POWER',
  red_bull_ring:'POWER',
  villeneuve:   'POWER',

  // Technical / high-downforce — twisty, aero + mechanical grip
  hungaroring:  'TECHNICAL',
  zandvoort:    'TECHNICAL',
  catalunya:    'TECHNICAL',
  suzuka:       'TECHNICAL',
  imola:        'TECHNICAL',

  // Balanced / permanent all-rounders
  bahrain:      'BALANCED',
  shanghai:     'BALANCED',
  americas:     'BALANCED',
  rodriguez:    'BALANCED',
  interlagos:   'BALANCED',
  losail:       'BALANCED',
  yas_marina:   'BALANCED',
};

export function getCircuitCategory(circuitId: string): CircuitCategory {
  return CIRCUIT_CATEGORY[circuitId.toLowerCase()] ?? 'BALANCED';
}

export const CATEGORY_META: Record<CircuitCategory, { label: string; blurb: string; color: string }> = {
  STREET:    { label: 'Street',    blurb: 'Walls close · qualifying is king',    color: '#E8002D' },
  POWER:     { label: 'Power',     blurb: 'Long straights · engine & top speed',  color: '#3671C6' },
  TECHNICAL: { label: 'Technical', blurb: 'Twisty · downforce & mechanical grip', color: '#FF8000' },
  BALANCED:  { label: 'Balanced',  blurb: 'All-round permanent circuits',         color: '#27F4D2' },
};

export const CATEGORY_ORDER: CircuitCategory[] = ['STREET', 'POWER', 'TECHNICAL', 'BALANCED'];
