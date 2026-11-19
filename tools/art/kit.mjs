// The drawing kit for the step pictures in assets/show.
//
// Every picture is a 720 x 520 SVG built from these helpers, then turned into a PNG by
// tools/art/render.mjs. Keeping the pieces here means every picture shares one look:
// soft backdrop, friendly people with real arms and hands, one coral arrow for the move,
// and green tick / coral cross badges for "do" and "don't".
//
// Coordinates: x right, y down. The ground line sits at GROUND.

export const W = 720;
export const H = 520;
export const GROUND = 430;

export const C = {
  bg: '#EEF6F1',
  blob: '#DDEEE5',
  ground: '#CFE3D8',
  shadow: 'rgba(18,56,45,0.10)',
  ink: '#12382D',
  forest: '#1F5C4A',
  action: '#0B6B4F',
  sun: '#F6B93B',
  coral: '#D9482F',
  water: '#4A90D9',
  waterLight: '#A9CDF2',
  white: '#FFFFFF',
  wood: '#8A5A33',
  woodDark: '#6B4423',
  bark: '#A0703F',
  soil: '#9C7048',
  soilDark: '#7A5434',
  leaf: '#4FA36B',
  leafDark: '#2F7A4A',
  straw: '#E7C46A',
  stone: '#A9B4AE',
  stoneDark: '#7F8C85',
  metal: '#8C99A6',
  metalDark: '#5E6B78',
  cloth: '#F7F1E3',
  clay: '#C9774A',
  fire: '#F26B3A',
  flame: '#F6B93B',
};

// People. Shirt colours tell people apart: the helper is always forest green.
export const SKIN = ['#C68642', '#F1C27D', '#8D5524', '#E0AC69', '#A86B3C'];
export const HAIR = ['#2B1D14', '#4A3222', '#1A1A1A', '#6B4A2B', '#B08A57'];

const shade = (hex, k = 0.18) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.round(v * (1 - k));
  const r = f(n >> 16),
    g = f((n >> 8) & 255),
    b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};
export { shade };

const pt = (p) => `${p[0]},${p[1]}`;
const limb = (pts, color, w) =>
  `<polyline points="${pts.map(pt).join(' ')}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/**
 * A person from a few joints. Any limb can be left out.
 * head [x,y], neck [x,y], hip [x,y]
 * arms: [[elbow, hand], [elbow, hand]]  (first = far arm, drawn behind)
 * legs: [[knee, foot], [knee, foot]]    (first = far leg)
 * face: 'smile' | 'calm' | 'closed' | 'worried' ; facing 1 = right, -1 = left
 */
export function person(o) {
  const {
    head,
    neck,
    hip,
    arms = [],
    legs = [],
    shirt = C.forest,
    pants = '#34495E',
    skin = SKIN[0],
    hair = HAIR[0],
    hairStyle = 'short',
    face = 'smile',
    facing = 1,
    scale = 1,
    sleeves = 'long',
    hands = true,
    frontArm = true,
    parts = 'all', // 'body' = everything but the arms, 'arms' = only the arms (to draw them over something)
  } = o;
  const s = scale;
  const R = 25 * s;
  const out = [];
  const shoulder = [neck[0] + (hip[0] - neck[0]) * 0.08, neck[1] + (hip[1] - neck[1]) * 0.08];
  const legW = 24 * s,
    armW = 17 * s,
    torsoW = 52 * s;
  // far leg, far arm (darker)
  const drawLeg = (l, far) => {
    if (!l) return;
    const c = far ? shade(pants, 0.22) : pants;
    out.push(limb([hip, l[0], l[1]], c, legW));
    const dir = l[2] ?? facing;
    out.push(
      `<ellipse cx="${l[1][0] + dir * 8 * s}" cy="${l[1][1] + 6 * s}" rx="${17 * s}" ry="${9 * s}" fill="${far ? '#2A211B' : '#3A2C22'}"/>`,
    );
  };
  const drawArm = (a, far) => {
    if (!a) return;
    const c = far ? shade(shirt, 0.22) : shirt;
    if (sleeves === 'short') {
      const mid = [(shoulder[0] + a[0][0]) / 2, (shoulder[1] + a[0][1]) / 2];
      out.push(limb([shoulder, mid], c, armW + 2 * s));
      out.push(limb([mid, a[0], a[1]], far ? shade(skin, 0.15) : skin, armW - 2 * s));
    } else out.push(limb([shoulder, a[0], a[1]], c, armW));
    if (hands)
      out.push(
        `<circle cx="${a[1][0]}" cy="${a[1][1]}" r="${10 * s}" fill="${far ? shade(skin, 0.15) : skin}"/>`,
      );
  };
  if (parts === 'arms') {
    drawArm(arms[0], true);
    drawArm(arms[1], false);
    return out.join('');
  }
  drawLeg(legs[0], true);
  if (parts === 'all') drawArm(arms[0], true);
  drawLeg(legs[1], false);
  // torso
  out.push(limb([shoulder, hip], shirt, torsoW));
  // neck
  out.push(
    limb([neck, [head[0] * 0.5 + neck[0] * 0.5, head[1] * 0.5 + neck[1] * 0.5]], skin, 14 * s),
  );
  // head
  out.push(`<circle cx="${head[0]}" cy="${head[1]}" r="${R}" fill="${skin}"/>`);
  // hair: a cap on the back/top of the head, rotated with the body
  const ang = (Math.atan2(neck[1] - head[1], neck[0] - head[0]) * 180) / Math.PI - 90; // 0 when upright
  const hairPath =
    hairStyle === 'long'
      ? `M ${-R - 2} 4 A ${R + 2} ${R + 2} 0 0 1 ${R + 2} -2 L ${R * 0.5} -${R * 0.45} Q 0 -${R * 0.2} -${R * 0.55} 0 L -${R * 0.7} ${R * 1.25} L -${R + 4} ${R * 1.1} Z`
      : hairStyle === 'bald'
        ? ''
        : `M ${-R - 1} 4 A ${R + 1} ${R + 1} 0 0 1 ${R + 1} -2 L ${R * 0.55} -${R * 0.4} Q 0 -${R * 0.15} -${R * 0.6} ${R * 0.15} Z`;
  if (hairPath)
    out.push(
      `<path d="${hairPath}" fill="${hair}" transform="translate(${head[0]},${head[1]}) rotate(${ang}) scale(${facing},1)"/>`,
    );
  // face
  const fx = (dx, dy) => {
    const a = (ang * Math.PI) / 180;
    return [
      head[0] + dx * Math.cos(a) - dy * Math.sin(a),
      head[1] + dx * Math.sin(a) + dy * Math.cos(a),
    ];
  };
  const eye = fx(facing * 10 * s, -2 * s);
  if (face === 'closed') {
    const e2 = fx(facing * 16 * s, -2 * s);
    out.push(
      `<path d="M ${eye[0] - 5 * s} ${eye[1]} Q ${eye[0]} ${eye[1] + 4 * s} ${eye[0] + 5 * s} ${eye[1]}" stroke="${C.ink}" stroke-width="${2.5 * s}" fill="none" stroke-linecap="round" transform="rotate(${ang} ${eye[0]} ${eye[1]})"/>`,
    );
    void e2;
  } else {
    out.push(`<circle cx="${eye[0]}" cy="${eye[1]}" r="${3.4 * s}" fill="${C.ink}"/>`);
  }
  if (face === 'smile' || face === 'calm') {
    const m = fx(facing * 13 * s, 9 * s);
    out.push(
      `<path d="M ${m[0] - 5 * s} ${m[1] - 1} Q ${m[0]} ${m[1] + (face === 'smile' ? 5 : 2) * s} ${m[0] + 5 * s} ${m[1] - 1}" stroke="${C.ink}" stroke-width="${2.5 * s}" fill="none" stroke-linecap="round" transform="rotate(${ang} ${m[0]} ${m[1]})"/>`,
    );
  }
  if (face === 'worried') {
    const m = fx(facing * 13 * s, 10 * s);
    out.push(
      `<path d="M ${m[0] - 4 * s} ${m[1] + 2} Q ${m[0]} ${m[1] - 3 * s} ${m[0] + 4 * s} ${m[1] + 2}" stroke="${C.ink}" stroke-width="${2.5 * s}" fill="none" stroke-linecap="round"/>`,
    );
  }
  // cheek
  const ck = fx(facing * 4 * s, 7 * s);
  out.push(`<circle cx="${ck[0]}" cy="${ck[1]}" r="${4.5 * s}" fill="#E0785A" opacity="0.28"/>`);
  if (frontArm && parts === 'all') drawArm(arms[1], false);
  return out.join('');
}

/** A person standing upright, facing left or right. x = feet centre. */
export function stander(x, o = {}) {
  const f = o.facing ?? 1;
  const s = o.scale ?? 1;
  const g = o.ground ?? GROUND;
  const hipY = g - 120 * s,
    neckY = hipY - 120 * s;
  return person({
    head: [x + f * 4 * s, neckY - 34 * s],
    neck: [x, neckY],
    hip: [x, hipY],
    legs: [
      [
        [x - f * 6 * s, hipY + 60 * s],
        [x - f * 10 * s, g - 8 * s],
      ],
      [
        [x + f * 8 * s, hipY + 60 * s],
        [x + f * 10 * s, g - 8 * s],
      ],
    ],
    arms: o.arms ?? [
      [
        [x - f * 6 * s, neckY + 60 * s],
        [x - f * 4 * s, neckY + 112 * s],
      ],
      [
        [x + f * 16 * s, neckY + 58 * s],
        [x + f * 30 * s, neckY + 108 * s],
      ],
    ],
    ...o,
    facing: f,
  });
}

/** Joints for a standing person, for building custom arm poses. */
export function standJoints(x, o = {}) {
  const f = o.facing ?? 1;
  const s = o.scale ?? 1;
  const g = o.ground ?? GROUND;
  const hipY = g - 120 * s,
    neckY = hipY - 120 * s;
  return {
    x,
    f,
    s,
    g,
    hipY,
    neckY,
    sh: [x, neckY + 10 * s],
    head: [x + f * 4 * s, neckY - 34 * s],
  };
}

/** A person lying on their back, head on the left (or right with facing -1). */
export function lier(x, y, o = {}) {
  const f = o.facing ?? 1; // 1 = head on the left
  const s = o.scale ?? 1;
  const neck = [x, y];
  const hip = [x + f * 125 * s, y];
  return person({
    head: [x - f * 36 * s, y - 2 * s],
    neck,
    hip,
    legs: o.legs ?? [
      [[hip[0] + f * 70 * s, y + 2 * s], [hip[0] + f * 140 * s, y - 2 * s], -f * 0 + f],
      [
        [hip[0] + f * 72 * s, y + 4 * s],
        [hip[0] + f * 142 * s, y + 2 * s],
      ],
    ],
    arms: o.arms ?? [
      null,
      [
        [x + f * 55 * s, y + 8 * s],
        [x + f * 105 * s, y + 10 * s],
      ],
    ],
    face: o.face ?? 'closed',
    facing: -f,
    ...o,
  });
}

// ---------- frame and marks ----------

export function frame(body, o = {}) {
  const blob = o.blob ?? true;
  const bx = o.blobX ?? 360,
    by = o.blobY ?? 260,
    br = o.blobR ?? 210;
  // render.mjs zooms in on #c (the drawing itself) so people and things fill the picture.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" data-fit="${o.fit === false ? 'no' : 'yes'}" data-ground="${o.noGround ? '' : GROUND}">
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#12382D" flood-opacity="0.16"/></filter>
    ${o.defs ?? ''}
  </defs>
  <rect id="bg" width="${W}" height="${H}" rx="36" fill="${o.bg ?? C.bg}"/>
  ${blob ? `<circle id="blob" cx="${bx}" cy="${by}" r="${br}" fill="${o.blobColor ?? C.blob}"/>` : ''}
  ${o.noGround ? '' : `<rect id="ground" x="-400" y="${GROUND}" width="${W + 800}" height="10" rx="5" fill="${C.ground}"/>`}
  <g id="c">${body}</g>
</svg>`;
}

export const shadowAt = (x, w = 120, y = GROUND + 2) =>
  `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="9" fill="${C.shadow}"/>`;

/** A bold coral arrow along a straight line or quadratic curve. */
export function arrow(from, to, o = {}) {
  const col = o.color ?? C.coral;
  const w = o.width ?? 10;
  const ctrl = o.curve;
  const end = to;
  const prev = ctrl ?? from;
  const a = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  const hl = w * 2.4;
  const back = [end[0] - Math.cos(a) * hl * 0.8, end[1] - Math.sin(a) * hl * 0.8];
  const d = ctrl ? `M ${pt(from)} Q ${pt(ctrl)} ${pt(back)}` : `M ${pt(from)} L ${pt(back)}`;
  const p1 = [end[0] - Math.cos(a - 0.55) * hl, end[1] - Math.sin(a - 0.55) * hl];
  const p2 = [end[0] - Math.cos(a + 0.55) * hl, end[1] - Math.sin(a + 0.55) * hl];
  return `<g><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${pt(p1)} L ${pt(end)} L ${pt(p2)} Z" fill="${col}" stroke="${col}" stroke-width="${w * 0.5}" stroke-linejoin="round"/></g>`;
}

export const tick = (x, y, r = 30) =>
  `<g filter="url(#soft)"><circle cx="${x}" cy="${y}" r="${r}" fill="${C.action}"/><path d="M ${x - r * 0.42} ${y + r * 0.02} L ${x - r * 0.1} ${y + r * 0.34} L ${x + r * 0.45} ${y - r * 0.3}" stroke="#fff" stroke-width="${r * 0.22}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;

export const cross = (x, y, r = 30) =>
  `<g filter="url(#soft)"><circle cx="${x}" cy="${y}" r="${r}" fill="${C.coral}"/><path d="M ${x - r * 0.33} ${y - r * 0.33} L ${x + r * 0.33} ${y + r * 0.33} M ${x + r * 0.33} ${y - r * 0.33} L ${x - r * 0.33} ${y + r * 0.33}" stroke="#fff" stroke-width="${r * 0.22}" fill="none" stroke-linecap="round"/></g>`;

/** A "no" slash over a whole object. */
export const noSign = (x, y, r = 90) =>
  `<g opacity="0.95"><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.coral}" stroke-width="${r * 0.13}"/><path d="M ${x - r * 0.7} ${y - r * 0.7} L ${x + r * 0.7} ${y + r * 0.7}" stroke="${C.coral}" stroke-width="${r * 0.13}" stroke-linecap="round"/></g>`;

export const num = (x, y, n, r = 22) =>
  `<g filter="url(#soft)"><circle cx="${x}" cy="${y}" r="${r}" fill="${C.sun}"/><text x="${x}" y="${y + r * 0.36}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${r * 1.05}" fill="${C.ink}">${n}</text></g>`;

/** A short label on a white pill. Use for numbers people must remember ("20 min", "5 ft"). */
export function pill(x, y, text, o = {}) {
  // Never smaller than 36: on a phone the picture is about half its drawn size.
  const fs = Math.max(o.size ?? 40, 36);
  const w = text.length * fs * 0.58 + fs * 1.3;
  const h = fs * 1.7;
  const bg = o.bg ?? C.white;
  const fg = o.color ?? C.ink;
  return `<g filter="url(#soft)"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}"/><text x="${x}" y="${y + fs * 0.36}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${fs}" fill="${fg}">${text}</text></g>`;
}

/** A round "close-up" bubble in a corner. body is drawn in its own 200x200 box centred at 0,0. */
export function zoom(cx, cy, r, body, o = {}) {
  const id = 'z' + Math.round(cx) + '_' + Math.round(cy);
  const k = r / 100;
  return `<g filter="url(#soft)"><circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#fff"/></g>
  <clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
  <g clip-path="url(#${id})"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.bg ?? '#F7FBF9'}"/><g transform="translate(${cx},${cy}) scale(${k})">${body}</g></g>
  ${o.from ? `<path d="M ${pt(o.from)} L ${cx + (o.from[0] - cx) * (r / Math.hypot(o.from[0] - cx, o.from[1] - cy))} ${cy + (o.from[1] - cy) * (r / Math.hypot(o.from[0] - cx, o.from[1] - cy))}" stroke="#fff" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round"/><circle cx="${o.from[0]}" cy="${o.from[1]}" r="9" fill="#fff" stroke="${C.coral}" stroke-width="4"/>` : ''}`;
}

/** Little motion marks either side of something that moves. */
export const shake = (x, y, o = {}) => {
  const c = o.color ?? C.ink;
  const s = o.size ?? 1;
  return `<g stroke="${c}" stroke-width="${5 * s}" stroke-linecap="round" opacity="0.55"><path d="M ${x - 26 * s} ${y - 12 * s} L ${x - 38 * s} ${y - 18 * s}"/><path d="M ${x - 28 * s} ${y + 2 * s} L ${x - 42 * s} ${y + 2 * s}"/><path d="M ${x + 26 * s} ${y - 12 * s} L ${x + 38 * s} ${y - 18 * s}"/><path d="M ${x + 28 * s} ${y + 2 * s} L ${x + 42 * s} ${y + 2 * s}"/></g>`;
};

// ---------- common things ----------

export function flame(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M 0 0 C -38 -6 -40 -52 -14 -82 C -12 -60 2 -58 4 -72 C 8 -96 0 -110 -4 -124 C 34 -104 50 -62 40 -30 C 36 -12 22 0 0 0 Z" fill="${C.fire}"/><path d="M 2 -4 C -18 -8 -20 -34 -4 -52 C 0 -40 10 -42 10 -54 C 26 -40 28 -16 18 -8 C 14 -5 8 -4 2 -4 Z" fill="${C.flame}"/></g>`;
}

export function logs(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-70" y="-14" width="140" height="22" rx="11" fill="${C.wood}" transform="rotate(-10)"/><rect x="-70" y="-14" width="140" height="22" rx="11" fill="${C.woodDark}" transform="rotate(10)"/></g>`;
}

export function fire(x, y = GROUND, s = 1) {
  return logs(x, y - 6 * s, s) + flame(x, y - 12 * s, s);
}

export function pot(x, y, o = {}) {
  const s = o.scale ?? 1;
  const w = 130 * s,
    h = 92 * s;
  const fill = o.water
    ? `<rect x="${x - w / 2 + 8 * s}" y="${y - h + 22 * s}" width="${w - 16 * s}" height="${h - 30 * s}" rx="${10 * s}" fill="${C.water}"/>`
    : '';
  const bubbles = o.boil
    ? [0.25, 0.5, 0.75]
        .map(
          (k, i) =>
            `<circle cx="${x - w / 2 + w * k}" cy="${y - h + 34 * s + (i % 2) * 14 * s}" r="${(7 + (i % 2) * 3) * s}" fill="#fff" opacity="0.9"/>`,
        )
        .join('')
    : '';
  const steam = o.steam
    ? [-30, 0, 30]
        .map(
          (dx) =>
            `<path d="M ${x + dx * s} ${y - h - 16 * s} q ${-12 * s} ${-18 * s} 0 ${-34 * s} q ${12 * s} ${-16 * s} 0 ${-34 * s}" stroke="#8FA9A0" stroke-width="${6 * s}" fill="none" stroke-linecap="round"/>`,
        )
        .join('')
    : '';
  return `${steam}<rect x="${x - w / 2 - 14 * s}" y="${y - h + 8 * s}" width="${w + 28 * s}" height="${12 * s}" rx="${6 * s}" fill="${C.metalDark}"/><rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="${16 * s}" fill="${C.metal}"/>${fill}${bubbles}<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="${16 * s}" fill="none" stroke="${C.metalDark}" stroke-width="${5 * s}"/>`;
}

export function bucket(x, y, o = {}) {
  const s = o.scale ?? 1;
  const col = o.color ?? '#5B8DBE';
  return `<path d="M ${x - 52 * s} ${y - 100 * s} L ${x + 52 * s} ${y - 100 * s} L ${x + 40 * s} ${y} L ${x - 40 * s} ${y} Z" fill="${col}"/>${o.water ? `<path d="M ${x - 47 * s} ${y - 70 * s} L ${x + 47 * s} ${y - 70 * s} L ${x + 40 * s} ${y} L ${x - 40 * s} ${y} Z" fill="${C.water}" opacity="0.9"/>` : ''}<path d="M ${x - 52 * s} ${y - 100 * s} L ${x + 52 * s} ${y - 100 * s} L ${x + 40 * s} ${y} L ${x - 40 * s} ${y} Z" fill="none" stroke="${shade(col, 0.3)}" stroke-width="${5 * s}" stroke-linejoin="round"/><path d="M ${x - 48 * s} ${y - 98 * s} Q ${x} ${y - 160 * s} ${x + 48 * s} ${y - 98 * s}" stroke="${C.metalDark}" stroke-width="${5 * s}" fill="none"/>`;
}

export function jar(x, y, o = {}) {
  const s = o.scale ?? 1;
  const inside = o.fill ?? null;
  return `<rect x="${x - 34 * s}" y="${y - 96 * s}" width="${68 * s}" height="${96 * s}" rx="${14 * s}" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="${4 * s}"/>${inside ? `<rect x="${x - 28 * s}" y="${y - (o.level ?? 70) * s}" width="${56 * s}" height="${((o.level ?? 70) - 6) * s}" rx="${10 * s}" fill="${inside}"/>` : ''}<rect x="${x - 38 * s}" y="${y - 110 * s}" width="${76 * s}" height="${18 * s}" rx="${6 * s}" fill="${o.lid ?? C.metalDark}"/>`;
}

export function tree(x, y = GROUND, s = 1) {
  return `<rect x="${x - 10 * s}" y="${y - 120 * s}" width="${20 * s}" height="${120 * s}" rx="${8 * s}" fill="${C.wood}"/><circle cx="${x}" cy="${y - 170 * s}" r="${70 * s}" fill="${C.leaf}"/><circle cx="${x - 44 * s}" cy="${y - 136 * s}" r="${44 * s}" fill="${C.leafDark}"/><circle cx="${x + 46 * s}" cy="${y - 140 * s}" r="${42 * s}" fill="${C.leaf}"/>`;
}

export function sun(x, y, r = 40) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `<path d="M ${x + Math.cos(a) * (r + 12)} ${y + Math.sin(a) * (r + 12)} L ${x + Math.cos(a) * (r + 28)} ${y + Math.sin(a) * (r + 28)}" stroke="${C.sun}" stroke-width="8" stroke-linecap="round"/>`;
  }).join('');
  return `${rays}<circle cx="${x}" cy="${y}" r="${r}" fill="${C.sun}"/>`;
}

export function plant(x, y = GROUND, s = 1, o = {}) {
  const col = o.color ?? C.leaf;
  return `<path d="M ${x} ${y} L ${x} ${y - 90 * s}" stroke="${C.leafDark}" stroke-width="${7 * s}" stroke-linecap="round"/><ellipse cx="${x - 26 * s}" cy="${y - 50 * s}" rx="${28 * s}" ry="${13 * s}" fill="${col}" transform="rotate(-25 ${x - 26 * s} ${y - 50 * s})"/><ellipse cx="${x + 26 * s}" cy="${y - 72 * s}" rx="${28 * s}" ry="${13 * s}" fill="${col}" transform="rotate(25 ${x + 26 * s} ${y - 72 * s})"/><ellipse cx="${x - 18 * s}" cy="${y - 96 * s}" rx="${22 * s}" ry="${11 * s}" fill="${shade(col, 0.1)}" transform="rotate(-30 ${x - 18 * s} ${y - 96 * s})"/>${o.fruit ? `<circle cx="${x + 18 * s}" cy="${y - 40 * s}" r="${14 * s}" fill="${o.fruit}"/><circle cx="${x - 10 * s}" cy="${y - 112 * s}" r="${12 * s}" fill="${o.fruit}"/>` : ''}`;
}

export function rock(x, y, w = 80, h = 50, col = C.stone) {
  return `<path d="M ${x - w / 2} ${y} Q ${x - w / 2} ${y - h} ${x - w * 0.1} ${y - h} Q ${x + w / 2} ${y - h * 1.05} ${x + w / 2} ${y} Z" fill="${col}"/>`;
}

export function cloth(x, y, w = 120, h = 70, col = C.cloth, rot = 0) {
  return `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="10" fill="${col}" stroke="${shade(col, 0.2)}" stroke-width="4"/><path d="M ${x - w / 2 + 14} ${y - h / 2 + 18} L ${x + w / 2 - 14} ${y - h / 2 + 18}" stroke="${shade(col, 0.12)}" stroke-width="4"/></g>`;
}

export function text(x, y, t, o = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? 'middle'}" font-family="Inter" font-weight="${o.weight ?? 800}" font-size="${o.size ?? 28}" fill="${o.color ?? C.ink}">${t}</text>`;
}

/** A hand seen from above, fingers pointing up (rotate with rot). For close-ups. */
export function handTop(x, y, o = {}) {
  const s = o.scale ?? 1;
  const c = o.skin ?? SKIN[2];
  const e = shade(c, 0.25);
  const f = (dx, len, w = 15) =>
    `<rect x="${dx - w / 2}" y="${-len}" width="${w}" height="${len + 10}" rx="${w / 2}" fill="${c}" stroke="${e}" stroke-width="2.5"/>`;
  return `<g transform="translate(${x},${y}) rotate(${o.rot ?? 0}) scale(${s * (o.flip ? -1 : 1)},${s})">${f(-24, 62)}${f(-8, 72)}${f(8, 70)}${f(23, 60)}<rect x="-34" y="-14" width="70" height="66" rx="24" fill="${c}" stroke="${e}" stroke-width="2.5"/><rect x="-54" y="0" width="16" height="48" rx="8" fill="${c}" stroke="${e}" stroke-width="2.5" transform="rotate(-40 -46 24)"/></g>`;
}

/** A person facing us. x = between the feet. arms: [[elbow, hand] left, [elbow, hand] right]. */
export function front(x, o = {}) {
  const s = o.scale ?? 1;
  const g = o.ground ?? GROUND;
  const shirt = o.shirt ?? C.forest;
  const pants = o.pants ?? '#34495E';
  const skin = o.skin ?? SKIN[0];
  const hair = o.hair ?? HAIR[0];
  const hipY = g - 120 * s;
  const shY = g - 232 * s;
  const head = [x, g - 282 * s];
  const R = 27 * s;
  const out = [];
  const legs = o.legs ?? [
    [
      [x - 17 * s, hipY + 56 * s],
      [x - 19 * s, g - 8 * s],
    ],
    [
      [x + 17 * s, hipY + 56 * s],
      [x + 19 * s, g - 8 * s],
    ],
  ];
  if (!o.noLegs)
    legs.forEach((l, i) => {
      out.push(limb([[x + (i ? 16 : -16) * s, hipY], l[0], l[1]], pants, 26 * s));
      out.push(
        `<ellipse cx="${l[1][0] + (i ? 6 : -6) * s}" cy="${l[1][1] + 6 * s}" rx="${15 * s}" ry="${9 * s}" fill="#3A2C22"/>`,
      );
    });
  const arms = o.arms ?? [
    [
      [x - 50 * s, shY + 58 * s],
      [x - 54 * s, shY + 112 * s],
    ],
    [
      [x + 50 * s, shY + 58 * s],
      [x + 54 * s, shY + 112 * s],
    ],
  ];
  const arm = (a, side) => {
    if (!a) return '';
    const sh = [x + side * 36 * s, shY + 12 * s];
    return (
      limb([sh, a[0], a[1]], shirt, 19 * s) +
      `<circle cx="${a[1][0]}" cy="${a[1][1]}" r="${11 * s}" fill="${skin}"/>`
    );
  };
  const armsSvg = arm(arms[0], -1) + arm(arms[1], 1);
  if (o.armsBehind) out.push(armsSvg);
  // torso
  out.push(
    `<rect x="${x - 40 * s}" y="${shY}" width="${80 * s}" height="${hipY - shY + 10 * s}" rx="${30 * s}" fill="${shirt}"/>`,
  );
  out.push(
    `<rect x="${x - 8 * s}" y="${shY - 22 * s}" width="${16 * s}" height="${26 * s}" fill="${skin}"/>`,
  );
  out.push(`<circle cx="${head[0]}" cy="${head[1]}" r="${R}" fill="${skin}"/>`);
  if (o.hairStyle === 'long')
    out.push(
      `<path d="M ${x - R - 3} ${head[1] + R * 1.1} L ${x - R - 3} ${head[1]} A ${R + 3} ${R + 3} 0 0 1 ${x + R + 3} ${head[1]} L ${x + R + 3} ${head[1] + R * 1.1} L ${x + R * 0.7} ${head[1] + R * 1.1} L ${x + R * 0.75} ${head[1] - R * 0.35} Q ${x} ${head[1] - R * 0.55} ${x - R * 0.75} ${head[1] - R * 0.35} L ${x - R * 0.7} ${head[1] + R * 1.1} Z" fill="${hair}"/>`,
    );
  else if (o.hairStyle === 'hat')
    out.push(
      `<path d="M ${x - R - 4} ${head[1] - 2} A ${R + 4} ${R + 6} 0 0 1 ${x + R + 4} ${head[1] - 2} Z" fill="${o.hat ?? C.coral}"/><rect x="${x - R - 6}" y="${head[1] - 8 * s}" width="${2 * R + 12}" height="${10 * s}" rx="${5 * s}" fill="${shade(o.hat ?? C.coral, 0.2)}"/>`,
    );
  else if (o.hairStyle !== 'bald')
    out.push(
      `<path d="M ${x - R - 1} ${head[1] + 2} A ${R + 1} ${R + 1} 0 0 1 ${x + R + 1} ${head[1] + 2} Q ${x + R * 0.4} ${head[1] - R * 0.5} ${x - R * 0.2} ${head[1] - R * 0.35} Q ${x - R * 0.7} ${head[1] - R * 0.25} ${x - R - 1} ${head[1] + 2} Z" fill="${hair}"/>`,
    );
  if (o.gray)
    out.push(
      `<path d="M ${x - R - 1} ${head[1] + 2} A ${R + 1} ${R + 1} 0 0 1 ${x + R + 1} ${head[1] + 2} Q ${x} ${head[1] - R * 0.4} ${x - R - 1} ${head[1] + 2} Z" fill="#D9D4CC"/>`,
    );
  const ey = head[1] + 1 * s;
  if (o.face === 'closed')
    out.push(
      `<path d="M ${x - 15 * s} ${ey} q 5 ${4 * s} 10 0 M ${x + 5 * s} ${ey} q 5 ${4 * s} 10 0" stroke="${C.ink}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>`,
    );
  else
    out.push(
      `<circle cx="${x - 10 * s}" cy="${ey}" r="${3.4 * s}" fill="${C.ink}"/><circle cx="${x + 10 * s}" cy="${ey}" r="${3.4 * s}" fill="${C.ink}"/>`,
    );
  const my = head[1] + 13 * s;
  if (o.face === 'open')
    out.push(`<ellipse cx="${x}" cy="${my + 1}" rx="${6 * s}" ry="${7 * s}" fill="${C.ink}"/>`);
  else if (o.face === 'worried')
    out.push(
      `<path d="M ${x - 6 * s} ${my + 3} Q ${x} ${my - 3 * s} ${x + 6 * s} ${my + 3}" stroke="${C.ink}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>`,
    );
  else
    out.push(
      `<path d="M ${x - 8 * s} ${my} Q ${x} ${my + 7 * s} ${x + 8 * s} ${my}" stroke="${C.ink}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>`,
    );
  out.push(
    `<circle cx="${x - 17 * s}" cy="${my - 3 * s}" r="${5 * s}" fill="#E0785A" opacity="0.28"/><circle cx="${x + 17 * s}" cy="${my - 3 * s}" r="${5 * s}" fill="#E0785A" opacity="0.28"/>`,
  );
  if (!o.armsBehind) out.push(armsSvg);
  return out.join('');
}

/** Joints for a person facing us, for custom arm poses. */
export const frontJoints = (x, o = {}) => {
  const s = o.scale ?? 1;
  const g = o.ground ?? GROUND;
  const shY = g - 232 * s;
  return {
    L: [x - 36 * s, shY + 12 * s],
    R: [x + 36 * s, shY + 12 * s],
    shY,
    hipY: g - 120 * s,
    head: [x, g - 282 * s],
    chest: [x, shY + 50 * s],
    belly: [x, shY + 92 * s],
  };
};

/** A lower arm seen from the side, lying flat, hand at the right. For close-ups of cuts, burns and splints. */
export function forearm(x1, x2, y, o = {}) {
  const skin = o.skin ?? SKIN[1];
  const sleeve = o.sleeve ?? '#5B8DBE';
  const t = o.thick ?? 62;
  const e = shade(skin, 0.22);
  const sx = x1 + (o.sleeveLen ?? 120);
  return `<rect x="${x1 - 40}" y="${y - t / 2}" width="${x2 - x1 + 40}" height="${t}" rx="${t / 2}" fill="${skin}"/>
  <path d="M ${x1 + 60} ${y + t / 2 - 8} L ${x2 - 30} ${y + t / 2 - 6}" stroke="${e}" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
  <g transform="translate(${x2},${y})">
    <rect x="-20" y="${-t * 0.55}" width="${t * 1.1}" height="${t * 1.05}" rx="${t * 0.42}" fill="${skin}"/>
    <rect x="${t * 0.62}" y="${-t * 0.5}" width="${t * 0.95}" height="${t * 0.28}" rx="${t * 0.14}" fill="${skin}" stroke="${e}" stroke-width="2.5"/>
    <rect x="${t * 0.62}" y="${-t * 0.2}" width="${t * 1.05}" height="${t * 0.28}" rx="${t * 0.14}" fill="${skin}" stroke="${e}" stroke-width="2.5"/>
    <rect x="${t * 0.62}" y="${t * 0.1}" width="${t * 0.95}" height="${t * 0.28}" rx="${t * 0.14}" fill="${skin}" stroke="${e}" stroke-width="2.5"/>
    <rect x="${t * 0.2}" y="${-t * 0.78}" width="${t * 0.7}" height="${t * 0.3}" rx="${t * 0.15}" fill="${skin}" stroke="${e}" stroke-width="2.5" transform="rotate(-12 ${t * 0.2} ${-t * 0.63})"/>
  </g>
  <rect x="${x1 - 60}" y="${y - t / 2 - 6}" width="${sx - x1 + 60}" height="${t + 12}" rx="${(t + 12) / 2}" fill="${sleeve}"/>`;
}

/** A person sitting on the ground, facing right (or left with facing -1). */
export function sitter(x, o = {}) {
  const f = o.facing ?? 1;
  const g = o.ground ?? GROUND;
  const hip = [x, g - 28];
  const neck = [x - f * 4, g - 128];
  return person({
    head: [x, g - 164],
    neck,
    hip,
    legs: o.legs ?? [
      [
        [x + f * 62, g - 76],
        [x + f * 112, g - 10],
      ],
      [
        [x + f * 66, g - 72],
        [x + f * 118, g - 8],
      ],
    ],
    arms: o.arms ?? [
      [
        [x + f * 12, g - 74],
        [x + f * 50, g - 66],
      ],
      [
        [x + f * 18, g - 72],
        [x + f * 58, g - 62],
      ],
    ],
    facing: f,
    ...o,
  });
}

export function blanket(x1, x2, yTop, yBot, col = '#E9A23B') {
  const st = shade(col, 0.15);
  return `<path d="M ${x1} ${yBot} L ${x1 + 10} ${yTop + 16} Q ${x1 + 14} ${yTop} ${x1 + 34} ${yTop} L ${x2 - 30} ${yTop + 2} Q ${x2} ${yTop + 6} ${x2 + 8} ${yBot} Z" fill="${col}"/>
  ${[0.25, 0.5, 0.75].map((k) => `<path d="M ${x1 + (x2 - x1) * k} ${yTop + 4} L ${x1 + (x2 - x1) * k + 4} ${yBot}" stroke="${st}" stroke-width="10"/>`).join('')}`;
}

export function cup(x, y, o = {}) {
  const s = o.scale ?? 1;
  const r = o.rot ?? 0;
  const col = o.color ?? C.coral;
  const steam = o.steam
    ? `<path d="M -8 -52 q -8 -12 0 -24 q 8 -12 0 -24 M 10 -50 q -8 -12 0 -24 q 8 -12 0 -24" stroke="#8FA9A0" stroke-width="5" fill="none" stroke-linecap="round" transform="rotate(${-r})"/>`
    : '';
  return `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})">${steam}<path d="M 22 -26 q 20 0 20 14 q 0 14 -20 14" stroke="${shade(col, 0.2)}" stroke-width="7" fill="none"/><rect x="-24" y="-38" width="48" height="44" rx="10" fill="${col}"/>${o.water ? `<rect x="-19" y="-33" width="38" height="10" rx="5" fill="${C.water}"/>` : ''}</g>`;
}

export function snow(n = 14, seed = 3) {
  let r = seed;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  return Array.from(
    { length: n },
    () =>
      `<circle cx="${60 + rnd() * 600}" cy="${40 + rnd() * 260}" r="${4 + rnd() * 5}" fill="#fff"/>`,
  ).join('');
}

export function rain(n = 14, seed = 5, col = C.water) {
  let r = seed;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: n }, () => {
    const x = 60 + rnd() * 600,
      y = 30 + rnd() * 220;
    return `<path d="M ${x} ${y} l -8 22" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`;
  }).join('');
}

export const wind = (x, y, s = 1) =>
  `<g stroke="#9FB8C8" stroke-width="${7 * s}" fill="none" stroke-linecap="round"><path d="M ${x} ${y} h ${90 * s} q ${24 * s} 0 ${24 * s} ${-18 * s} q 0 ${-16 * s} ${-16 * s} ${-16 * s}"/><path d="M ${x + 20 * s} ${y + 30 * s} h ${110 * s} q ${20 * s} 0 ${20 * s} ${16 * s}"/></g>`;

export function house(x, y = GROUND, s = 1, o = {}) {
  const wall = o.wall ?? '#F3E3C3';
  return `<rect x="${x - 110 * s}" y="${y - 150 * s}" width="${220 * s}" height="${150 * s}" fill="${wall}"/>
  <path d="M ${x - 135 * s} ${y - 145 * s} L ${x} ${y - 245 * s} L ${x + 135 * s} ${y - 145 * s} Z" fill="${o.roof ?? C.coral}"/>
  <rect x="${x - 26 * s}" y="${y - 90 * s}" width="${52 * s}" height="${90 * s}" rx="${6 * s}" fill="${o.door ?? C.woodDark}"/>
  ${o.window === false ? '' : `<rect x="${x + 46 * s}" y="${y - 115 * s}" width="${46 * s}" height="${40 * s}" rx="${4 * s}" fill="${o.lit ? C.sun : '#BFD9EA'}"/>`}`;
}

/** A person facing us, sitting on the ground (legs hidden by what is in front, or crossed). */
export function frontSit(x, o = {}) {
  const g = o.ground ?? GROUND;
  const s = o.scale ?? 1;
  const sit = `<ellipse cx="${x}" cy="${g - 22 * s}" rx="${70 * s}" ry="${26 * s}" fill="${o.pants ?? '#34495E'}"/>`;
  return sit + front(x, { ...o, noLegs: true, ground: g + 92 * s });
}
