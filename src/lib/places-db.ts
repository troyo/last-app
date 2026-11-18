// Emergency places that ship inside the app: hospitals, clinics, police, fire
// stations, shelters, pharmacies and drinking water across the US, from
// OpenStreetMap. Because the list lives in the app itself, the map can show
// them at every zoom level and answer "where's the nearest hospital?" with no
// signal and no saved area at all. Built by tools/build-places.py.
import { loadPlaceData, PLACE_STATES } from '../data/places';

export type PlaceKind = 'hospital' | 'clinic' | 'police' | 'fire' | 'shelter' | 'pharmacy' | 'water';

export type Kind = {
  id: PlaceKind;
  code: string; // one letter in the data files
  label: string; // chips
  short: string; // one word, for tight spaces
  one: string; // a single place, for unnamed ones
  letter: string; // drawn inside the pin
  color: string;
  on: boolean; // shown on the map by default
};

// Order is the order of the chips and of the "nearest" row.
export const KINDS: Kind[] = [
  { id: 'hospital', code: 'H', label: 'Hospitals', short: 'Hospital', one: 'Hospital', letter: 'H', color: '#D32F2F', on: true },
  { id: 'clinic', code: 'U', label: 'Clinics', short: 'Clinic', one: 'Clinic or urgent care', letter: '+', color: '#C2185B', on: true },
  { id: 'shelter', code: 'S', label: 'Shelters', short: 'Shelter', one: 'Shelter', letter: 'S', color: '#6A3FB5', on: true },
  { id: 'water', code: 'W', label: 'Water', short: 'Water', one: 'Drinking water', letter: 'W', color: '#0277BD', on: false },
  { id: 'fire', code: 'F', label: 'Fire', short: 'Fire', one: 'Fire station', letter: 'F', color: '#E65100', on: true },
  { id: 'police', code: 'P', label: 'Police', short: 'Police', one: 'Police', letter: 'P', color: '#1E4FB8', on: true },
  { id: 'pharmacy', code: 'R', label: 'Pharmacy', short: 'Pharmacy', one: 'Pharmacy', letter: 'Rx', color: '#00796B', on: false },
];

export const kindOf = (id: string) => KINDS.find((k) => k.id === id);
const BY_CODE: Record<string, Kind> = Object.fromEntries(KINDS.map((k) => [k.code, k]));

export type Place = {
  id: number;
  kind: PlaceKind;
  lon: number;
  lat: number;
  name: string;
};

type LonLat = [number, number];

// ---------- Loading ----------

const cache: Record<string, Place[]> = {};
let nextId = 1;

/** One state's places, parsed once and kept. */
export function placesIn(code: string): Place[] {
  if (cache[code]) return cache[code];
  const raw = loadPlaceData(code);
  const out: Place[] = [];
  if (raw) {
    for (const line of raw.split('\n')) {
      if (!line) continue;
      const [c, lon, lat, name] = line.split('\t');
      const kind = BY_CODE[c];
      if (!kind) continue;
      out.push({ id: nextId++, kind: kind.id, lon: Number(lon) / 1e4, lat: Number(lat) / 1e4, name: name ?? '' });
    }
  }
  cache[code] = out;
  return out;
}

const overlaps = (a: number[], b: number[]) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];

/** States whose places could fall inside this box (west, south, east, north). */
export function statesIn(box: number[]): string[] {
  return PLACE_STATES.filter((st) => overlaps(st.bbox, box)).map((st) => st.code);
}

/** A box of roughly `miles` around a point. */
export function boxAround([lon, lat]: LonLat, miles: number): number[] {
  const dLat = miles / 69;
  const dLon = miles / (69 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  return [lon - dLon, lat - dLat, lon + dLon, lat + dLat];
}

/** Every place in the states touching this box. */
export function placesNear(box: number[]): Place[] {
  return statesIn(box).flatMap(placesIn);
}

// ---------- Distance and direction ----------

export function milesBetween(a: LonLat, b: LonLat) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

const POINTS = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];

/** Which way to head, as a word: "northeast". */
export function directionTo(a: LonLat, b: LonLat) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x =
    Math.cos(rad(a[1])) * Math.sin(rad(b[1])) -
    Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return POINTS[Math.round(deg / 45) % 8];
}

/** "northeast" → "NE", for tight spaces. */
export const shortDirection = (word: string) =>
  word.replace('north', 'N').replace('south', 'S').replace('east', 'E').replace('west', 'W');

export const formatMiles = (mi: number) =>
  mi < 0.1 ? '<0.1 mi' : mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`;

export type Nearby = Place & { miles: number; direction: string };

/** The nearest places of one kind (or any kind), closest first. */
export function nearest(from: LonLat, kind?: PlaceKind, limit = 5, reachMiles = 60): Nearby[] {
  // Look in a growing box so a quiet rural area still finds something.
  for (const miles of [10, 30, reachMiles]) {
    const box = boxAround(from, miles);
    const found = placesNear(box)
      .filter((p) => (!kind || p.kind === kind) && p.lon >= box[0] && p.lon <= box[2] && p.lat >= box[1] && p.lat <= box[3])
      .map((p) => ({ ...p, miles: milesBetween(from, [p.lon, p.lat]), direction: directionTo(from, [p.lon, p.lat]) }))
      .sort((a, b) => a.miles - b.miles);
    if (found.length >= limit || miles === reachMiles) return found.slice(0, limit);
  }
  return [];
}

// ---------- For the map ----------

/** Map features for these places; the map colors and letters them by `kind`. */
export function toFeatures(places: Place[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: places.map((p) => ({
      type: 'Feature',
      id: p.id,
      geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      properties: { id: p.id, kind: p.kind, name: p.name },
    })),
  };
}

/** A map style expression: one value per kind. */
export const byKind = (pick: (k: Kind) => string | number, fallback: string | number) =>
  ['match', ['get', 'kind'], ...KINDS.flatMap((k) => [k.id, pick(k)]), fallback] as any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Look a place back up from a tapped map feature. */
export function placeById(id: number): Place | undefined {
  for (const list of Object.values(cache)) {
    const p = list.find((x) => x.id === id);
    if (p) return p;
  }
  return undefined;
}
