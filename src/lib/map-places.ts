// Emergency places on the map: hospitals, police, shelters and so on.
//
// They come straight from the map tiles we already download (OpenFreeMap's
// OpenMapTiles "poi" layer), so a saved area carries them offline with no
// extra download. Almost all places are only in the most detailed tiles
// (zoom 14), so they show offline only in areas saved at street level.

export const PLACES_SOURCE = 'openmaptiles';
export const PLACES_SOURCE_LAYER = 'poi';
export const PLACES_LAYER = 'emergency-places';
export const PLACES_LABEL_LAYER = 'emergency-places-label';
export const PLACES_MIN_ZOOM = 12;

export type PlaceCategoryId =
  | 'medical'
  | 'police'
  | 'fire'
  | 'shelter'
  | 'pharmacy'
  | 'water'
  | 'fuel'
  | 'food'
  | 'worship';

export type PlaceCategory = {
  id: PlaceCategoryId;
  label: string; // shown on chips and in the list
  one: string; // a single place, for unnamed places in the list
  letter: string; // drawn inside the pin
  color: string; // one strong colour per category
  on: boolean; // shown by default
  // OpenMapTiles fields that put a place in this category
  classes?: string[];
  subclasses?: string[];
};

// Order matters: the first category that matches wins.
export const PLACE_CATEGORIES: PlaceCategory[] = [
  {
    id: 'medical',
    label: 'Hospitals',
    one: 'Hospital or clinic',
    letter: 'H',
    color: '#C62828',
    on: true,
    subclasses: ['hospital', 'clinic', 'doctors'],
  },
  {
    id: 'police',
    label: 'Police',
    one: 'Police',
    letter: 'P',
    color: '#1E4FB8',
    on: true,
    classes: ['police'],
  },
  {
    id: 'fire',
    label: 'Fire',
    one: 'Fire station',
    letter: 'F',
    color: '#E0581A',
    on: true,
    classes: ['fire_station'],
  },
  {
    // Real shelters plus the buildings usually opened as storm shelters.
    id: 'shelter',
    label: 'Shelters',
    one: 'Possible shelter',
    letter: 'S',
    color: '#6A3FB5',
    on: true,
    subclasses: ['shelter', 'community_centre', 'school', 'college', 'university'],
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    one: 'Pharmacy',
    letter: 'Rx',
    color: '#0F7B6C',
    on: false,
    classes: ['pharmacy'],
  },
  {
    id: 'water',
    label: 'Water',
    one: 'Drinking water',
    letter: 'W',
    color: '#0277BD',
    on: false,
    subclasses: ['drinking_water', 'water_point'],
  },
  {
    id: 'fuel',
    label: 'Fuel',
    one: 'Gas station',
    letter: 'G',
    color: '#5D4037',
    on: false,
    subclasses: ['fuel'], // not EV chargers, which share the class
  },
  {
    id: 'food',
    label: 'Food',
    one: 'Food store',
    letter: 'M',
    color: '#2E7D32',
    on: false,
    subclasses: ['supermarket', 'greengrocer', 'convenience', 'marketplace'],
  },
  {
    id: 'worship',
    label: 'Churches',
    one: 'Place of worship',
    letter: '+',
    color: '#8D6E1F',
    on: false,
    classes: ['place_of_worship'],
  },
];

export const DEFAULT_PLACES = PLACE_CATEGORIES.filter((c) => c.on).map((c) => c.id);

const cat = (id: string) => PLACE_CATEGORIES.find((c) => c.id === id);

// A map style expression that turns a tile feature into a category id ('' if none).
const matches = (c: PlaceCategory) => {
  const tests: unknown[] = [];
  if (c.classes) tests.push(['in', ['get', 'class'], ['literal', c.classes]]);
  if (c.subclasses) tests.push(['in', ['get', 'subclass'], ['literal', c.subclasses]]);
  return tests.length === 1 ? tests[0] : ['any', ...tests];
};
export const CATEGORY_EXPR = [
  'case',
  ...PLACE_CATEGORIES.flatMap((c) => [matches(c), c.id]),
  '',
] as const;

/** Only points, only the categories that are switched on. */
export function placesFilter(enabled: PlaceCategoryId[]) {
  return [
    'all',
    ['==', ['geometry-type'], 'Point'],
    ['in', CATEGORY_EXPR, ['literal', enabled.length ? enabled : ['none']]],
  ] as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const byCategory = (pick: (c: PlaceCategory) => string, fallback: string) =>
  ['match', CATEGORY_EXPR, ...PLACE_CATEGORIES.flatMap((c) => [c.id, pick(c)]), fallback] as any; // eslint-disable-line @typescript-eslint/no-explicit-any

export const PLACE_COLOR_EXPR = byCategory((c) => c.color, '#333333');
export const PLACE_LETTER_EXPR = byCategory((c) => c.letter, '');

/** Which category a feature from the tiles belongs to (same rules as the map). */
export function categoryOf(props: Record<string, unknown>): PlaceCategory | undefined {
  const klass = String(props.class ?? '');
  const sub = String(props.subclass ?? '');
  return PLACE_CATEGORIES.find((c) => c.classes?.includes(klass) || c.subclasses?.includes(sub));
}

export const categoryById = cat;

/** Straight-line distance in miles. */
export function milesBetween(a: [number, number], b: [number, number]) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const formatMiles = (mi: number) =>
  mi < 0.1 ? 'Under 0.1 mi' : mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`;

export type NearbyPlace = {
  key: string;
  name: string;
  category: PlaceCategory;
  coord: [number, number];
  miles: number;
};

/** Turn queried map features into a de-duplicated list, nearest first. */
export function nearestPlaces(
  features: { properties?: Record<string, unknown> | null; geometry?: unknown }[],
  from: [number, number],
  limit = 12,
): NearbyPlace[] {
  const seen = new Set<string>();
  const out: NearbyPlace[] = [];
  for (const f of features) {
    const g = f.geometry as { type?: string; coordinates?: number[] } | undefined;
    if (g?.type !== 'Point' || !g.coordinates) continue;
    const props = f.properties ?? {};
    const category = categoryOf(props);
    if (!category) continue;
    const coord: [number, number] = [Number(g.coordinates[0]), Number(g.coordinates[1])];
    const name = String(props.name ?? props['name:en'] ?? props.name_en ?? '').trim();
    // The same place can appear in two neighbouring tiles.
    const key = `${category.id}|${name}|${coord[0].toFixed(4)},${coord[1].toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      key,
      name: name || category.one,
      category,
      coord,
      miles: milesBetween(from, coord),
    });
  }
  // Nearest few of each kind, so the closest hospital or police station is never
  // pushed off the list by a cluster of schools.
  out.sort((a, b) => a.miles - b.miles);
  const perKind: Record<string, number> = {};
  return out
    .filter((p) => (perKind[p.category.id] = (perKind[p.category.id] ?? 0) + 1) <= 3)
    .slice(0, limit);
}
