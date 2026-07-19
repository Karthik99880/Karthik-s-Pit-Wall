
export type CircuitCategory = 'STREET' | 'POWER' | 'TECHNICAL' | 'BALANCED';

export const CIRCUIT_CATEGORY: Record<string, CircuitCategory> = {
  
  monaco:       'STREET',
  jeddah:       'STREET',
  baku:         'STREET',
  marina_bay:   'STREET',
  vegas:        'STREET',
  miami:        'STREET',
  albert_park:  'STREET',

  
  monza:        'POWER',
  spa:          'POWER',
  silverstone:  'POWER',
  red_bull_ring:'POWER',
  villeneuve:   'POWER',

  
  hungaroring:  'TECHNICAL',
  zandvoort:    'TECHNICAL',
  catalunya:    'TECHNICAL',
  suzuka:       'TECHNICAL',
  imola:        'TECHNICAL',

  
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
