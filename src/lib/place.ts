// Where you live and who you look after. Survival advice is not one size fits
// all: Florida needs hurricane plans, Minnesota needs to survive winter.
//
// Everything here works with no internet. "Find me" uses the phone's GPS,
// which needs no signal, and matches it against a small table of places that
// ships inside the app. People outside the US (or anyone unsure) answer three
// plain questions instead.

import { File, Paths } from './fs';

export type Climate = 'cold' | 'mixed' | 'humid' | 'dry' | 'mild';
export type HazardId =
  | 'hurricane'
  | 'tornado'
  | 'earthquake'
  | 'wildfire'
  | 'flood'
  | 'winter'
  | 'heat';
export type HomeType = 'apartment' | 'house' | 'rural';

export type Profile = {
  /** What we call the place on screen, e.g. "Florida". */
  place: string;
  /** US state code, when we know it. */
  state?: string;
  climate: Climate;
  hazards: HazardId[];
  home: HomeType;
  people: number;
  pets: number;
};

export const CLIMATES: Record<Climate, { title: string; blurb: string; icon: string }> = {
  cold: {
    title: 'Long, cold winters',
    blurb: 'Snow and ice for months. Staying warm is the first job.',
    icon: 'snowflake',
  },
  mixed: {
    title: 'Four seasons',
    blurb: 'Cold winters and hot summers. You need a plan for both.',
    icon: 'leaf-maple',
  },
  humid: {
    title: 'Hot and humid',
    blurb: 'Long sticky summers and mild winters. Heat and storms matter most.',
    icon: 'weather-partly-rainy',
  },
  dry: {
    title: 'Hot and dry',
    blurb: 'Little rain. Water is the first job, then shade.',
    icon: 'white-balance-sunny',
  },
  mild: {
    title: 'Mild and wet',
    blurb: 'Rarely very hot or very cold. Rain, damp and dry-season fires.',
    icon: 'weather-rainy',
  },
};

export const HOMES: Record<HomeType, { title: string; blurb: string; icon: string }> = {
  apartment: {
    title: 'Apartment or condo',
    blurb: 'Little storage, no yard, shared building',
    icon: 'office-building',
  },
  house: {
    title: 'House in a town or suburb',
    blurb: 'Some storage and a yard',
    icon: 'home',
  },
  rural: {
    title: 'Out in the country',
    blurb: 'Land, and neighbors far apart',
    icon: 'barn',
  },
};

// ---------- US states ----------
// code, name, rough center (lat, lon), climate, hazards.
// Hazard letters: H hurricane, T tornado, E earthquake, W wildfire, F flood,
// S winter storm, X extreme heat. Based on FEMA National Risk Index patterns.
const LETTER: Record<string, HazardId> = {
  H: 'hurricane',
  T: 'tornado',
  E: 'earthquake',
  W: 'wildfire',
  F: 'flood',
  S: 'winter',
  X: 'heat',
};

const RAW: [string, string, number, number, Climate, string][] = [
  ['AL', 'Alabama', 32.8, -86.8, 'humid', 'THFX'],
  ['AK', 'Alaska', 64.2, -152.5, 'cold', 'SEWF'],
  ['AZ', 'Arizona', 34.2, -111.7, 'dry', 'XWF'],
  ['AR', 'Arkansas', 34.9, -92.4, 'humid', 'TFXE'],
  ['CA', 'California', 37.2, -119.4, 'mild', 'EWFX'],
  ['CO', 'Colorado', 39.0, -105.5, 'cold', 'SWTF'],
  ['CT', 'Connecticut', 41.6, -72.7, 'mixed', 'SHF'],
  ['DE', 'Delaware', 39.0, -75.5, 'mixed', 'HFS'],
  ['DC', 'Washington, D.C.', 38.9, -77.0, 'mixed', 'FSX'],
  ['FL', 'Florida', 28.6, -82.4, 'humid', 'HFXT'],
  ['GA', 'Georgia', 32.7, -83.4, 'humid', 'HTFX'],
  ['HI', 'Hawaii', 20.3, -156.4, 'humid', 'HEFW'],
  ['ID', 'Idaho', 44.4, -114.6, 'cold', 'WSE'],
  ['IL', 'Illinois', 40.0, -89.2, 'mixed', 'TSFX'],
  ['IN', 'Indiana', 39.9, -86.3, 'mixed', 'TSF'],
  ['IA', 'Iowa', 42.1, -93.5, 'mixed', 'TSF'],
  ['KS', 'Kansas', 38.5, -98.4, 'mixed', 'TSXF'],
  ['KY', 'Kentucky', 37.5, -85.3, 'mixed', 'TFS'],
  ['LA', 'Louisiana', 31.1, -92.0, 'humid', 'HFTX'],
  ['ME', 'Maine', 45.4, -69.2, 'cold', 'SF'],
  ['MD', 'Maryland', 39.0, -76.8, 'mixed', 'HFS'],
  ['MA', 'Massachusetts', 42.3, -71.8, 'mixed', 'SHF'],
  ['MI', 'Michigan', 44.3, -85.4, 'cold', 'STF'],
  ['MN', 'Minnesota', 46.3, -94.3, 'cold', 'STF'],
  ['MS', 'Mississippi', 32.7, -89.7, 'humid', 'HTFX'],
  ['MO', 'Missouri', 38.4, -92.5, 'mixed', 'TFSE'],
  ['MT', 'Montana', 47.0, -109.6, 'cold', 'SWE'],
  ['NE', 'Nebraska', 41.5, -99.8, 'mixed', 'TSF'],
  ['NV', 'Nevada', 39.3, -116.6, 'dry', 'XEW'],
  ['NH', 'New Hampshire', 43.7, -71.6, 'cold', 'SF'],
  ['NJ', 'New Jersey', 40.2, -74.7, 'mixed', 'HFS'],
  ['NM', 'New Mexico', 34.4, -106.1, 'dry', 'WXF'],
  ['NY', 'New York', 42.9, -75.5, 'mixed', 'SFH'],
  ['NC', 'North Carolina', 35.6, -79.4, 'humid', 'HFT'],
  ['ND', 'North Dakota', 47.5, -100.5, 'cold', 'SFT'],
  ['OH', 'Ohio', 40.3, -82.8, 'mixed', 'TSF'],
  ['OK', 'Oklahoma', 35.6, -97.5, 'mixed', 'TXWF'],
  ['OR', 'Oregon', 43.9, -120.6, 'mild', 'EWSF'],
  ['PA', 'Pennsylvania', 40.9, -77.8, 'mixed', 'SFT'],
  ['PR', 'Puerto Rico', 18.2, -66.4, 'humid', 'HEF'],
  ['RI', 'Rhode Island', 41.7, -71.6, 'mixed', 'HSF'],
  ['SC', 'South Carolina', 33.9, -80.9, 'humid', 'HFEX'],
  ['SD', 'South Dakota', 44.4, -100.2, 'cold', 'STF'],
  ['TN', 'Tennessee', 35.9, -86.4, 'humid', 'TFE'],
  ['TX', 'Texas', 31.5, -99.3, 'humid', 'HTFXW'],
  ['UT', 'Utah', 39.3, -111.7, 'dry', 'EWSX'],
  ['VT', 'Vermont', 44.1, -72.7, 'cold', 'SF'],
  ['VA', 'Virginia', 37.5, -78.9, 'mixed', 'HFS'],
  ['WA', 'Washington', 47.4, -120.5, 'mild', 'EWSF'],
  ['WV', 'West Virginia', 38.6, -80.6, 'mixed', 'FS'],
  ['WI', 'Wisconsin', 44.6, -89.9, 'cold', 'STF'],
  ['WY', 'Wyoming', 43.0, -107.5, 'cold', 'SW'],
];

export type USState = {
  code: string;
  name: string;
  lat: number;
  lon: number;
  climate: Climate;
  hazards: HazardId[];
};

export const STATES: USState[] = RAW.map(([code, name, lat, lon, climate, h]) => ({
  code,
  name,
  lat,
  lon,
  climate,
  hazards: [...h].map((c) => LETTER[c]),
}));

export const findState = (code?: string) => STATES.find((s) => s.code === code);

function milesBetween(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 3959 * 2 * Math.asin(Math.sqrt(a));
}

/**
 * The states closest to a GPS position, nearest first. We only know each
 * state's middle, so near a border the first guess can be the neighbor: the
 * screen shows the top three and lets the person tap the right one.
 * Returns an empty list when the position is clearly outside the US.
 */
export function statesNear(lat: number, lon: number): USState[] {
  const ranked = STATES.map((st) => ({ st, d: milesBetween(lat, lon, st.lat, st.lon) })).sort(
    (a, b) => a.d - b.d,
  );
  // Alaska and Texas are huge, so allow a long reach before giving up.
  if (ranked[0].d > 700) return [];
  return ranked.slice(0, 3).map((r) => r.st);
}

// ---------- The three-question way ----------

export type Winter = 'snowy' | 'cold' | 'mild' | 'warm';
export type Summer = 'sticky' | 'dry' | 'warm' | 'cool';

export const WINTERS: Record<Winter, string> = {
  snowy: 'Snow and ice for months',
  cold: 'Cold, with some snow',
  mild: 'Cool and rainy, rarely freezes',
  warm: 'Warm all year',
};
export const SUMMERS: Record<Summer, string> = {
  sticky: 'Hot and sticky',
  dry: 'Hot and dry',
  warm: 'Warm and pleasant',
  cool: 'Cool',
};

export function climateFrom(winter: Winter, summer: Summer): Climate {
  if (winter === 'snowy') return 'cold';
  if (summer === 'dry' && winter !== 'cold') return 'dry';
  if (winter === 'cold') return 'mixed';
  if (summer === 'sticky') return 'humid';
  if (winter === 'warm') return summer === 'dry' ? 'dry' : 'humid';
  return 'mild';
}

/** Sensible starting ticks for the "what can happen here" question. */
export function likelyHazards(climate: Climate): HazardId[] {
  switch (climate) {
    case 'cold':
      return ['winter', 'flood'];
    case 'mixed':
      return ['winter', 'flood', 'heat'];
    case 'humid':
      return ['heat', 'flood'];
    case 'dry':
      return ['heat', 'wildfire'];
    case 'mild':
      return ['flood', 'wildfire'];
  }
}

// ---------- Saved on the phone ----------

const FILE = new File(Paths.document, 'place.json');
type Saved = { profile?: Profile; skipped?: boolean };
let cache: Saved | null = null;

function load(): Saved {
  if (cache === null) {
    cache = {};
    try {
      if (FILE.exists) cache = JSON.parse(FILE.textSync()) as Saved;
    } catch {
      // start fresh
    }
  }
  return cache;
}

function save(next: Saved) {
  cache = next;
  try {
    FILE.writeSync(JSON.stringify(next));
  } catch {
    // not worth interrupting anyone over
  }
}

export const getProfile = (): Profile | undefined => load().profile;
/** True once the person has either set up their place or chosen "later". */
export const placeAsked = (): boolean => !!load().profile || !!load().skipped;
export const saveProfile = (profile: Profile) => save({ profile });
export const skipPlace = () => save({ ...load(), skipped: true });

/** Gallons of drinking and washing water one person needs per day here. */
export const waterPerDay = (p?: Profile) =>
  p && (p.climate === 'dry' || p.climate === 'humid') ? 1.5 : 1;
