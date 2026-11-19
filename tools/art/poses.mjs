// Shared poses and small things for the long-haul pictures (living for months without help).
import { C, GROUND as G, SKIN, HAIR, person, shade } from './kit.mjs';

export const ME = { shirt: '#E07B39', skin: SKIN[3], hair: HAIR[1], pants: '#4B3F72' };
export const YOU = { shirt: C.forest, skin: SKIN[2], hair: HAIR[2], pants: '#34495E' };
export const KID = { shirt: '#F2C14E', skin: SKIN[1], hair: HAIR[3], pants: '#5B8DBE' };
export const SICK = { shirt: '#5B8DBE', skin: SKIN[0], hair: HAIR[0], pants: '#8B6F4E' };

/** Standing, both hands out in front at one point. */
export const working = (x, hand, look = {}, o = {}) => {
  const f = o.facing ?? 1;
  const g = o.ground ?? G;
  const d = g - G;
  return person({
    head: [x + f * 6, 158 + d],
    neck: [x, 194 + d],
    hip: [x - f * 4, 310 + d],
    legs: [
      [
        [x - f * 8, 370 + d],
        [x - f * 12, 422 + d],
      ],
      [
        [x + f * 8, 370 + d],
        [x + f * 12, 424 + d],
      ],
    ],
    arms: [
      [
        [x + f * 20, 262 + d],
        [hand[0] - f * 8, hand[1] + 6],
      ],
      [[x + f * 26, 260 + d], hand],
    ],
    facing: f,
    ...look,
    ...o,
  });
};

/** Kneeling, hands down near the ground in front. */
export const crouch = (x, hand, look = {}, o = {}) => {
  const f = o.facing ?? 1;
  return person({
    head: [x + f * 34, 246],
    neck: [x + f * 20, 280],
    hip: [x - f * 20, 360],
    legs: [
      [
        [x + f * 20, 400],
        [x - f * 40, 424],
      ],
      [
        [x + f * 34, 404],
        [x - f * 30, 426],
      ],
    ],
    arms: [
      [
        [x + f * 40, 340],
        [hand[0] - f * 10, hand[1]],
      ],
      [[x + f * 50, 342], hand],
    ],
    facing: f,
    ...look,
    ...o,
  });
};

/** A shovel. (x, y) = tip of the blade. rot tips the handle back. */
export const shovel = (x, y, rot = 0, s = 1) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-6" y="-210" width="12" height="160" rx="6" fill="${C.wood}"/><rect x="-24" y="-222" width="48" height="14" rx="7" fill="${C.woodDark}"/><path d="M -30 -60 L 30 -60 L 26 -10 Q 0 6 -26 -10 Z" fill="${C.metalDark}"/></g>`;

/** Someone digging: standing, both hands on a shovel whose blade is at (bx, by). */
export const digger = (x, bx, by, look = {}, o = {}) => {
  const f = o.facing ?? 1;
  const rot = o.rot ?? -f * 18;
  const a = (rot * Math.PI) / 180;
  const along = (d) => [bx + Math.sin(a) * d, by - Math.cos(a) * d];
  const h1 = along(150),
    h2 = along(210);
  return (
    person({
      ...stand(x, f, o.ground ?? G),
      arms: [
        [[x + f * 16, 250], h2],
        [[x + f * 26, 270], h1],
      ],
      ...look,
      facing: f,
    }) +
    shovel(bx, by, rot) +
    person({
      ...stand(x, f, o.ground ?? G),
      arms: [null, [[x + f * 26, 270], h1]],
      ...look,
      facing: f,
      parts: 'arms',
    })
  );
};
const stand = (x, f, g) => ({
  head: [x + f * 8, g - 272],
  neck: [x + f * 2, g - 236],
  hip: [x - f * 6, g - 120],
  legs: [
    [
      [x - f * 16, g - 60],
      [x - f * 26, g - 8],
    ],
    [
      [x + f * 14, g - 62],
      [x + f * 22, g - 8],
    ],
  ],
});

/** A hole in the ground seen from the side (cut away). */
export const hole = (x, w, d, o = {}) =>
  `<rect x="${x - w / 2 - 120}" y="${G}" width="${w + 240}" height="${d + 30}" fill="${o.soil ?? C.soil}"/><rect x="${x - w / 2}" y="${G}" width="${w}" height="${d}" fill="${C.soilDark}"/><path d="M ${x - w / 2 - 120} ${G} h ${w + 240}" stroke="#8DB27A" stroke-width="10"/>`;

/** A board seen from the side. */
export const board = (x1, x2, y, t = 18, col = C.wood) =>
  `<rect x="${x1}" y="${y - t}" width="${x2 - x1}" height="${t}" rx="4" fill="${col}" stroke="${shade(col, 0.2)}" stroke-width="3"/>`;

/** A sheet of paper with writing lines and optional ticks. */
export const paper = (x, y, o = {}) => {
  const w = o.w ?? 150,
    h = o.h ?? 190,
    n = o.lines ?? 5;
  const rows = Array.from({ length: n }, (_, i) => {
    const ly = y - h / 2 + 38 + i * ((h - 60) / Math.max(n - 1, 1));
    const tk =
      o.ticks && i < o.ticks
        ? `<path d="M ${x - w / 2 + 18} ${ly} l 8 8 l 14 -16" stroke="${C.action}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
        : '';
    return `${tk}<path d="M ${x - w / 2 + (o.ticks ? 50 : 22)} ${ly + 2} h ${w - (o.ticks ? 72 : 44)}" stroke="#B9C4BF" stroke-width="6" stroke-linecap="round"/>`;
  }).join('');
  return `<g filter="url(#soft)"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="10" fill="#fff" transform="rotate(${o.rot ?? 0} ${x} ${y})"/></g><g transform="rotate(${o.rot ?? 0} ${x} ${y})">${rows}</g>`;
};

/** A pencil. */
export const pencil = (x, y, rot = -35, s = 1) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-8" y="-110" width="16" height="96" fill="${C.sun}"/><rect x="-8" y="-124" width="16" height="16" fill="#E8909C"/><path d="M -8 -14 L 8 -14 L 0 6 Z" fill="#E9C9A0"/><path d="M -3 -2 L 3 -2 L 0 6 Z" fill="${C.ink}"/></g>`;

/** A food can. */
export const can = (x, y = G, s = 1, col = '#D9482F') =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-30" y="-74" width="60" height="74" rx="6" fill="${C.metal}"/><rect x="-30" y="-56" width="60" height="38" fill="${col}"/><rect x="-32" y="-78" width="64" height="10" rx="4" fill="${C.metalDark}"/></g>`;

/** A knife. (x, y) = handle end; points right. */
export const knife = (x, y, rot = 0, s = 1) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="0" y="-10" width="70" height="20" rx="8" fill="${C.woodDark}"/><path d="M 66 -12 L 190 -12 Q 200 -6 190 6 L 66 12 Z" fill="#C9D3DC" stroke="${C.metalDark}" stroke-width="3"/></g>`;

/** A chicken. */
export const chicken = (x, y = G, o = {}) => {
  const s = o.scale ?? 1;
  const f = o.facing ?? 1;
  const col = o.color ?? '#F4E9D8';
  const peck = o.peck ? 1 : 0;
  return `<g transform="translate(${x},${y}) scale(${f * s},${s})">
    <path d="M -6 -40 L -10 0 M 10 -40 L 14 0" stroke="#E7A33B" stroke-width="7" stroke-linecap="round"/>
    <path d="M -62 -86 Q -80 -130 -54 -120 Q -40 -76 -10 -74 Z" fill="${shade(col, 0.12)}"/>
    <ellipse cx="0" cy="-70" rx="56" ry="38" fill="${col}"/>
    <path d="M -24 -78 Q 6 -96 22 -66 Q 0 -54 -24 -78 Z" fill="${shade(col, 0.1)}"/>
    <g transform="${peck ? 'translate(40,-30) rotate(70)' : ''}">
    <circle cx="${peck ? 0 : 44}" cy="${peck ? 0 : -110}" r="24" fill="${col}"/>
    <path d="M ${peck ? 0 : 44} ${peck ? -36 : -146} q -10 8 -2 14 q -8 8 4 12 q 6 -8 12 -4 q 4 -14 -14 -22" fill="${C.coral}"/>
    <path d="M ${peck ? 22 : 66} ${peck ? -4 : -114} l 18 6 l -18 6 Z" fill="#E7A33B"/>
    <circle cx="${peck ? 8 : 52}" cy="${peck ? -6 : -116}" r="4" fill="${C.ink}"/>
    <path d="M ${peck ? 16 : 60} ${peck ? 8 : -102} q 6 14 -4 18" fill="${C.coral}"/>
    </g>
  </g>`;
};

/** An egg. */
export const egg = (x, y, s = 1, rot = 0, col = '#F3E1C7') =>
  `<ellipse cx="${x}" cy="${y}" rx="${22 * s}" ry="${29 * s}" fill="${col}" stroke="${shade(col, 0.15)}" stroke-width="3" transform="rotate(${rot} ${x} ${y})"/>`;

/** A fish. */
export const fish = (x, y, s = 1, f = 1, col = '#7FA7C9') =>
  `<g transform="translate(${x},${y}) scale(${f * s},${s})"><path d="M -60 0 L -90 -24 L -86 0 L -90 24 Z" fill="${shade(col, 0.15)}"/><ellipse cx="0" cy="0" rx="66" ry="28" fill="${col}"/><circle cx="40" cy="-6" r="5" fill="${C.ink}"/><path d="M 20 -18 Q 30 0 20 18" stroke="${shade(col, 0.2)}" stroke-width="4" fill="none"/></g>`;

/** Rows of planted soil seen from the side. */
export const bed = (x1, x2, y = G, h = 30) =>
  `<path d="M ${x1} ${y} Q ${x1 + 10} ${y - h} ${x1 + 40} ${y - h} L ${x2 - 40} ${y - h} Q ${x2 - 10} ${y - h} ${x2} ${y} Z" fill="${C.soil}"/>`;

export const sprout = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M 0 0 L 0 -36" stroke="${C.leafDark}" stroke-width="6" stroke-linecap="round"/><ellipse cx="-14" cy="-36" rx="16" ry="8" fill="${C.leaf}" transform="rotate(-25 -14 -36)"/><ellipse cx="14" cy="-40" rx="16" ry="8" fill="${C.leaf}" transform="rotate(25 14 -40)"/></g>`;

/** A dashed measuring line with end bars. */
export const measure = (x1, y1, x2, y2, col = C.ink) => {
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  const dx = Math.cos(a) * 16,
    dy = Math.sin(a) * 16;
  return `<g stroke="${col}" stroke-width="6" stroke-linecap="round"><path d="M ${x1} ${y1} L ${x2} ${y2}" stroke-dasharray="14 12"/><path d="M ${x1 - dx} ${y1 - dy} L ${x1 + dx} ${y1 + dy} M ${x2 - dx} ${y2 - dy} L ${x2 + dx} ${y2 + dy}"/></g>`;
};

/** A watering can, spout to the right. */
export const wateringCan = (x, y, rot = 0, s = 1) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M 40 -40 L 120 -90" stroke="${C.metal}" stroke-width="14" stroke-linecap="round"/><rect x="112" y="-104" width="24" height="24" rx="6" fill="${C.metalDark}" transform="rotate(-30 124 -92)"/><rect x="-50" y="-80" width="100" height="80" rx="14" fill="#5BA37C"/><path d="M -40 -80 Q 0 -130 40 -80" stroke="${C.metalDark}" stroke-width="10" fill="none"/></g>`;

/** Strips of drying food on a line. */
export const strips = (x1, x2, y, col = '#9C4A3A', len = 70) => {
  let out = `<path d="M ${x1 - 20} ${y} L ${x2 + 20} ${y}" stroke="${C.ink}" stroke-width="4"/>`;
  for (let x = x1; x <= x2; x += 38)
    out += `<rect x="${x - 10}" y="${y}" width="20" height="${len}" rx="8" fill="${col}" stroke="${shade(col, 0.25)}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="5" fill="${C.ink}"/>`;
  return out;
};
