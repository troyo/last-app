// The maths behind "save this area for offline".
//
// Map data comes from OpenFreeMap (free, built on OpenStreetMap). Their terms
// allow apps to save areas for offline use as long as each download stays
// under 3,000 map tiles / 50 MB, so every size below is planned to fit.

export type Bounds = [west: number, south: number, east: number, north: number];

export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
export const TILE_LIMIT = 2800; // stay safely under OpenFreeMap's 3,000 per download
export const MAX_DETAIL = 14; // street-level; the map can't go finer than this
const MIN_ZOOM = 4;
const AVG_TILE_BYTES = 16 * 1024; // rough average for a vector tile

export const AREA_SIZES = [
  { id: 'neighborhood', label: 'Neighborhood', miles: 5, hint: 'Walking distance' },
  { id: 'town', label: 'Town', miles: 15, hint: 'Your town and around it' },
  { id: 'region', label: 'Region', miles: 40, hint: 'A day’s drive on back roads' },
  { id: 'wide', label: 'Wide area', miles: 120, hint: 'State-sized, main roads and towns' },
] as const;
export type AreaSizeId = (typeof AREA_SIZES)[number]['id'];

/** A square box reaching `miles` in each direction from the center. */
export function boundsAround(lng: number, lat: number, miles: number): Bounds {
  const km = miles * 1.609344;
  const dLat = km / 110.574;
  const dLng = km / (111.32 * Math.max(Math.cos((lat * Math.PI) / 180), 0.05));
  return [
    Math.max(lng - dLng, -180),
    Math.max(lat - dLat, -85),
    Math.min(lng + dLng, 180),
    Math.min(lat + dLat, 85),
  ];
}

const tileX = (lng: number, z: number) => Math.floor(((lng + 180) / 360) * 2 ** z);
const tileY = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

/** How many map tiles cover these bounds at one zoom level. */
export function tilesAt(b: Bounds, z: number): number {
  const max = 2 ** z - 1;
  const clamp = (n: number) => Math.min(Math.max(n, 0), max);
  const x = clamp(tileX(b[2], z)) - clamp(tileX(b[0], z)) + 1;
  const y = clamp(tileY(b[1], z)) - clamp(tileY(b[3], z)) + 1;
  return x * y;
}

/**
 * Plan a download: the finest detail that still fits the tile limit, with
 * how many tiles and roughly how many megabytes that is.
 */
export function planDownload(b: Bounds) {
  let maxZoom = MIN_ZOOM;
  let tiles = 0;
  for (let z = MIN_ZOOM; z <= MAX_DETAIL; z++) {
    const next = tiles + tilesAt(b, z);
    if (next > TILE_LIMIT) break;
    tiles = next;
    maxZoom = z;
  }
  return {
    minZoom: MIN_ZOOM,
    maxZoom,
    tiles,
    megabytes: Math.max(1, Math.round((tiles * AVG_TILE_BYTES) / (1024 * 1024))),
    streetLevel: maxZoom >= 13,
  };
}

/** A GeoJSON outline of the box, to draw on the map. */
export function outlineOf(b: Bounds) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [b[0], b[1]],
          [b[2], b[1]],
          [b[2], b[3]],
          [b[0], b[3]],
          [b[0], b[1]],
        ],
      ],
    },
  };
}
