// Rebuild cards, part 2. Picture names are rb-<card>-<step index>, so each lines up with its step.
import {
  C,
  SKIN,
  HAIR,
  GROUND as G,
  frame,
  person,
  stander,
  front,
  frontJoints,
  sitter,
  frontSit,
  arrow,
  tick,
  cross,
  pill,
  zoom,
  handTop,
  forearm,
  fire,
  flame,
  logs,
  pot,
  bucket,
  jar,
  tree,
  sun,
  plant,
  rock,
  cloth,
  text,
  shade,
  cup,
  house,
  shake,
  blanket,
  lier,
} from '../kit.mjs';
import {
  basket,
  bed,
  chair,
  table,
  book,
  bowl,
  clock,
  stick,
  sack,
  letter,
  heart,
  stone,
  moon,
} from '../props.mjs';

const P = [
  { shirt: C.forest, skin: SKIN[2], hair: HAIR[2], pants: '#34495E' },
  { shirt: '#E07B39', skin: SKIN[1], hair: HAIR[4], hairStyle: 'long', pants: '#4B3F72' },
  { shirt: '#5B8DBE', skin: SKIN[3], hair: HAIR[1], pants: '#8B6F4E' },
  { shirt: '#9B6FB5', skin: SKIN[0], hair: HAIR[0], hairStyle: 'long', pants: '#34495E' },
  { shirt: '#E2B33C', skin: SKIN[4], hair: HAIR[3], pants: '#5A6B4E' },
];
const ELDER = { shirt: '#B5838D', skin: SKIN[1], hair: '#D9D4CC', gray: true, pants: '#5D5D6B' };

/** A row of people facing us. */
const crowd = (xs, o = {}) =>
  xs
    .map((x, i) =>
      front(x, { ...P[i % P.length], scale: o.scale ?? 0.8, ...(o.each?.(i, x) ?? {}) }),
    )
    .join('');

const sitRow = (xs, o = {}) =>
  xs
    .map((x, i) =>
      frontSit(x, { ...P[i % P.length], scale: o.scale ?? 0.8, ...(o.each?.(i, x) ?? {}) }),
    )
    .join('');

const soil = (x1, x2, y, h = 70) =>
  `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" fill="${C.soil}"/><rect x="${x1}" y="${y}" width="${x2 - x1}" height="10" fill="${C.soilDark}"/>`;

const potato = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="0" rx="30" ry="22" fill="#D9B77A"/><circle cx="-8" cy="-4" r="3" fill="#B08E55"/><circle cx="10" cy="6" r="3" fill="#B08E55"/></g>`;

const sprout = (x, y, h = 30) =>
  `<path d="M ${x} ${y} L ${x} ${y - h}" stroke="${C.leaf}" stroke-width="6" stroke-linecap="round"/><ellipse cx="${x + 9}" cy="${y - h}" rx="10" ry="5" fill="${C.leaf}"/>`;

const strip = (x, y, w = 120, rot = 0, col = '#A0453A') =>
  `<rect x="${x - w / 2}" y="${y - 9}" width="${w}" height="18" rx="7" fill="${col}" transform="rotate(${rot} ${x} ${y})"/>`;

const rack = (x1, x2, y) =>
  `<rect x="${x1}" y="${y - 10}" width="${x2 - x1}" height="12" rx="6" fill="${C.wood}"/><rect x="${x1 + 6}" y="${y}" width="14" height="${G - y}" fill="${C.woodDark}"/><rect x="${x2 - 20}" y="${y}" width="14" height="${G - y}" fill="${C.woodDark}"/>`;

const hanging = (x1, x2, y, n = 6, col = '#A0453A') =>
  Array.from({ length: n }, (_, i) => {
    const x = x1 + ((x2 - x1) / (n - 1)) * i;
    return `<path d="M ${x} ${y} l 0 10" stroke="#777" stroke-width="3"/><rect x="${x - 9}" y="${y + 8}" width="18" height="${90 + (i % 3) * 14}" rx="7" fill="${col}"/>`;
  }).join('');

const smoke = (x, y) =>
  `<g fill="#C9D3D8" opacity="0.85"><circle cx="${x}" cy="${y}" r="20"/><circle cx="${x + 20}" cy="${y - 34}" r="16"/><circle cx="${x - 6}" cy="${y - 62}" r="12"/></g>`;

const stoneRing = (cx, y, w, rows) =>
  Array.from({ length: rows }, (_, r) =>
    Array.from(
      { length: Math.round(w / 50) },
      (_, i) =>
        `<rect x="${cx - w / 2 + i * 50 + (r % 2) * 25}" y="${y - (r + 1) * 30}" width="46" height="28" rx="8" fill="${r % 2 ? C.stone : C.stoneDark}"/>`,
    ).join(''),
  ).join('');

const latrine = (x, y = G, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-50" y="-150" width="100" height="150" fill="${C.wood}"/><path d="M -64 -146 L 0 -196 L 64 -146 Z" fill="${C.woodDark}"/><rect x="-22" y="-110" width="44" height="110" rx="4" fill="${C.woodDark}"/></g>`;

const tally = (x, y, n) =>
  Array.from(
    { length: n },
    (_, i) =>
      `<path d="M ${x + i * 16} ${y} v -44" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`,
  ).join('');

const fizz = (x, y) =>
  `<g fill="#fff" stroke="#B9D6E8" stroke-width="3">${[
    [0, 0],
    [16, -14],
    [-14, -18],
    [4, -32],
    [22, -40],
  ]
    .map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${7 + ((dx + 40) % 5)}"/>`)
    .join('')}</g>`;

export default {
  // ---------------- teach ----------------
  'rb-teach-1': frame(
    `<rect x="120" y="${G - 60}" width="480" height="60" rx="14" fill="#E3CFA5"/>` +
      `<path d="M 330 ${G - 46} c -40 -10 -40 30 0 26 c 40 -4 40 34 -6 30" stroke="${C.soilDark}" stroke-width="10" fill="none" stroke-linecap="round" transform="translate(0,-4) scale(1 0.6) translate(0, ${(G - 40) * 0.66})"/>` +
      frontSit(250, {
        ...P[3],
        scale: 0.85,
        arms: [
          [
            [200, 330],
            [210, 380],
          ],
          [
            [300, 330],
            [330, 380],
          ],
        ],
      }) +
      frontSit(470, { ...P[2], scale: 0.62 }) +
      pill(360, 120, '“sss”'),
  ),
  'rb-teach-2': frame(
    `<rect x="140" y="110" width="440" height="240" rx="16" fill="#2F4A3F"/><rect x="152" y="122" width="416" height="216" rx="10" fill="#3B5A4C"/>` +
      letter(260, 210, 'sat', { size: 64, color: '#fff' }) +
      letter(460, 210, 'pin', { size: 64, color: '#fff' }) +
      letter(360, 300, 'tap', { size: 64, color: C.sun }) +
      `<rect x="340" y="350" width="40" height="${G - 350}" fill="${C.woodDark}"/>`,
  ),
  'rb-teach-5': frame(
    frontSit(300, {
      ...P[0],
      scale: 0.9,
      arms: [
        [
          [250, 330],
          [300, 350],
        ],
        [
          [350, 330],
          [400, 350],
        ],
      ],
    }) +
      frontSit(450, { ...P[4], scale: 0.62 }) +
      book(350, 352, { scale: 0.7, cover: C.coral }) +
      heart(560, 130, 1),
  ),
  'rb-teach-7': frame(
    `<g>${Array.from({ length: 10 }, (_, i) => stone(180 + (i % 5) * 34, G - 10 - Math.floor(i / 5) * 30, 30, 26)).join('')}</g>` +
      `<g>${Array.from({ length: 10 }, (_, i) => stone(400 + (i % 5) * 34, G - 10 - Math.floor(i / 5) * 30, 30, 26, C.stoneDark)).join('')}</g>` +
      stone(600, G - 10, 30, 26) +
      stone(634, G - 10, 30, 26) +
      pill(250, 300, '10') +
      pill(470, 300, '10') +
      pill(620, 300, '2') +
      pill(360, 130, '22'),
  ),
  'rb-teach-9': frame(
    `<rect x="160" y="${G - 40}" width="420" height="30" rx="6" fill="${C.sun}"/>` +
      Array.from(
        { length: 15 },
        (_, i) =>
          `<path d="M ${176 + i * 28} ${G - 40} v ${i % 5 ? 12 : 22}" stroke="${C.ink}" stroke-width="4"/>`,
      ).join('') +
      crowd([200], {
        scale: 0.62,
        each: () => ({
          ...P[4],
          arms: [
            [
              [180, 320],
              [190, 380],
            ],
            [
              [230, 330],
              [250, 380],
            ],
          ],
        }),
      }) +
      crowd([520], {
        scale: 0.62,
        each: () => ({
          ...P[1],
          arms: [
            [
              [490, 330],
              [470, 380],
            ],
            [
              [540, 320],
              [560, 370],
            ],
          ],
        }),
      }) +
      tick(360, 150),
  ),
  // ---------------- calendar ----------------
  'rb-calendar-0': frame(
    `<rect x="140" y="80" width="440" height="${G - 80}" fill="#F3E3C3"/>` +
      letter(360, 210, '19 Nov 2026', { size: 54 }) +
      tally(250, 300, 1) +
      stander(560, {
        ...P[0],
        facing: -1,
        scale: 0.9,
        arms: [
          [
            [540, 270],
            [520, 300],
          ],
          [
            [520, 250],
            [470, 210],
          ],
        ],
      }),
    { noGround: false },
  ),
  'rb-calendar-2': frame(
    `<rect x="120" y="80" width="480" height="${G - 80}" fill="#F3E3C3"/>` +
      letter(360, 150, 'DECEMBER', { size: 44 }) +
      [0, 1, 2, 3].map((r) => tally(170 + 0, 230 + r * 60, 7)).join('') +
      [0, 1, 2, 3].map((r) => tally(360, 230 + r * 60, r < 2 ? 7 : r === 2 ? 4 : 0)).join(''),
    { noGround: true },
  ),
  'rb-calendar-3': frame(
    sun(360, 80, 34) +
      `<rect x="350" y="200" width="20" height="${G - 200}" rx="6" fill="${C.wood}"/>` +
      `<path d="M 360 ${G} L 600 ${G}" stroke="rgba(18,56,45,0.3)" stroke-width="16" stroke-linecap="round"/>` +
      stone(610, G + 4, 30, 24) +
      stone(540, G + 4, 30, 24) +
      pill(560, 300, 'Midday'),
  ),
  'rb-calendar-6': frame(
    book(360, 270, { scale: 1.7, cover: C.forest }) + pill(360, 450, 'Births, deaths, decisions'),
    { noGround: true },
  ),
  'rb-calendar-7': frame(
    sack(200, G, { label: 'flour' }) +
      jar(330, G, { fill: '#C9A06A' }) +
      jar(420, G, { fill: '#E9A23B', level: 50 }) +
      `<rect x="500" y="${G - 120}" width="120" height="120" rx="10" fill="${C.wood}"/>` +
      `<g transform="translate(560,160)"><rect x="-70" y="-50" width="140" height="100" rx="10" fill="#fff" filter="url(#soft)"/>${[0, 1, 2].map((i) => `<path d="M -50 ${-26 + i * 24} h 70" stroke="#B9C4BF" stroke-width="6"/><path d="M 34 ${-28 + i * 24} l 6 6 l 12 -12" stroke="${C.action}" stroke-width="5" fill="none"/>`).join('')}</g>` +
      pill(200, 130, 'Each month'),
  ),
  // ---------------- meeting ----------------
  'rb-meeting-0': frame(
    sitRow([150, 270, 390, 510], { scale: 0.75 }) +
      fire(600, G, 0.6) +
      pill(360, 110, 'Every week'),
  ),
  'rb-meeting-3': frame(
    sitRow([170, 360, 550], {
      scale: 0.8,
      each: (i, x) =>
        i === 1
          ? {
              face: 'open',
              arms: [
                [
                  [x - 40, 320],
                  [x - 30, 360],
                ],
                [
                  [x + 40, 300],
                  [x + 50, 240],
                ],
              ],
            }
          : { face: 'calm' },
    }) +
      `<rect x="400" y="180" width="18" height="120" rx="8" fill="${C.wood}" transform="rotate(10 410 240)"/>` +
      `<g stroke="${C.coral}" stroke-width="6" stroke-linecap="round"><path d="M 300 200 l -20 -14 M 296 222 l -24 0"/></g>`,
  ),
  'rb-meeting-5': frame(
    crowd([140, 260, 380, 500, 620], {
      scale: 0.72,
      each: (i, x) =>
        i !== 2
          ? {
              arms: [
                [
                  [x - 40, 300],
                  [x - 34, 340],
                ],
                [
                  [x + 40, 230],
                  [x + 46, 170],
                ],
              ],
            }
          : {},
    }) + pill(380, 100, 'More than half'),
  ),
  'rb-meeting-6': frame(
    `<g transform="translate(360,260)"><rect x="-150" y="-180" width="300" height="360" rx="14" fill="#fff" filter="url(#soft)"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M -110 ${-120 + i * 56} l 12 12 l 22 -22" stroke="${C.action}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M -60 ${-114 + i * 56} h ${150 - (i % 2) * 40}" stroke="#B9C4BF" stroke-width="10" stroke-linecap="round"/>`).join('')}</g>` +
      `<g transform="translate(540,380) rotate(-35)"><rect x="-10" y="-90" width="20" height="120" rx="6" fill="${C.sun}"/><path d="M -10 30 L 0 52 L 10 30 Z" fill="${C.ink}"/></g>`,
    { noGround: true },
  ),
  'rb-meeting-8': frame(
    crowd([120, 240], { scale: 0.75, each: (i) => ({ face: 'worried', ...P[i + 1] }) }) +
      sitRow([420, 520, 620], { scale: 0.65, each: (i) => ({ ...P[(i + 2) % 5], face: 'calm' }) }) +
      `<path d="M 300 200 L 360 200" stroke="${C.ink}" stroke-width="0"/>` +
      pill(520, 120, '3 listen'),
  ),
  // ---------------- morale ----------------
  'rb-morale-1': frame(
    stander(150, {
      ...P[0],
      scale: 0.85,
      arms: [
        [
          [160, 260],
          [190, 300],
        ],
        [
          [170, 250],
          [200, 290],
        ],
      ],
    }) +
      bucket(210, G, { scale: 0.5, water: true }) +
      front(330, {
        ...ELDER,
        scale: 0.8,
        arms: [
          [
            [300, 300],
            [320, 340],
          ],
          [
            [360, 300],
            [340, 340],
          ],
        ],
      }) +
      `<rect x="300" y="330" width="60" height="30" rx="8" fill="#C9A877"/>` +
      front(470, { ...P[4], scale: 0.6 }) +
      basket(520, G, { scale: 0.45, fill: '#E9C46A' }) +
      stander(600, { ...P[1], scale: 0.85, facing: -1 }) +
      plant(650, G, 0.6),
  ),
  'rb-morale-2': frame(
    sitRow([170, 290, 430, 550], { scale: 0.72 }) +
      table(360, G, 520, 90) +
      bowl(220, G - 92, { scale: 0.5, fill: '#E9C46A' }) +
      bowl(360, G - 92, { scale: 0.6, fill: '#C97A4A' }) +
      bowl(500, G - 92, { scale: 0.5, fill: '#7FAF7F' }),
  ),
  'rb-morale-4': frame(
    crowd([160, 560], { scale: 0.8 }) +
      `<g transform="translate(360,${G})"><rect x="-90" y="-110" width="180" height="110" rx="14" fill="#F3D7A6"/><rect x="-90" y="-60" width="180" height="16" fill="${C.coral}"/>${[-50, 0, 50].map((x) => `<rect x="${x - 5}" y="-150" width="10" height="40" rx="4" fill="#fff"/>${flame(x, -146, 0.22)}`).join('')}</g>` +
      `<g fill="${C.sun}">${[
        [260, 120],
        [460, 100],
        [360, 70],
      ]
        .map(
          ([x, y]) =>
            `<path d="M ${x} ${y - 14} l 4 10 l 11 1 l -8 7 l 3 11 l -10 -6 l -10 6 l 3 -11 l -8 -7 l 11 -1 z"/>`,
        )
        .join('')}</g>`,
  ),
  'rb-morale-5': frame(
    fire(360, G, 0.9) +
      sitRow([170, 550], { scale: 0.8, each: (i) => ({ face: 'open' }) }) +
      `<g fill="${C.ink}">${[
        [230, 160],
        [500, 140],
        [520, 200],
      ]
        .map(
          ([x, y]) =>
            `<ellipse cx="${x}" cy="${y}" rx="10" ry="8"/><path d="M ${x + 8} ${y} v -32 l 16 6" stroke="${C.ink}" stroke-width="4" fill="none"/>`,
        )
        .join('')}</g>` +
      moon(600, 80, 30),
    { bg: '#E3ECF2', blobColor: '#D3E0EA' },
  ),
  'rb-morale-6': frame(
    frontSit(280, {
      ...P[2],
      scale: 0.85,
      face: 'worried',
      arms: [
        [
          [240, 330],
          [270, 370],
        ],
        [
          [320, 330],
          [290, 370],
        ],
      ],
    }) +
      frontSit(440, {
        ...P[1],
        scale: 0.85,
        arms: [
          [
            [400, 330],
            [360, 320],
          ],
          [
            [480, 330],
            [490, 380],
          ],
        ],
      }) +
      heart(360, 130, 1),
  ),
  // ---------------- staples ----------------
  'rb-staples-2': frame(
    soil(80, 640, G - 110, 140) +
      [180, 300, 420, 540].map((x) => potato(x, G - 40, 1) + sprout(x, G - 58, 40)).join('') +
      `<path d="M 600 ${G - 100} v 60" stroke="${C.ink}" stroke-width="5"/><path d="M 588 ${G - 100} h 24 M 588 ${G - 40} h 24" stroke="${C.ink}" stroke-width="5"/>` +
      pill(360, 150, 'A foot apart'),
    { noGround: true },
  ),
  'rb-staples-3': frame(
    soil(80, 640, G - 30, 60) +
      `<path d="M 200 ${G - 30} Q 360 ${G - 140} 520 ${G - 30} Z" fill="${C.soil}"/>` +
      plant(360, G - 110, 1.1) +
      arrow([180, G - 120], [270, G - 80], { width: 8 }) +
      arrow([540, G - 120], [450, G - 80], { width: 8 }),
    { noGround: true },
  ),
  'rb-staples-4': frame(
    soil(80, 640, G - 40, 80) +
      `<ellipse cx="360" cy="${G - 6}" rx="22" ry="16" fill="#A0453A"/>` +
      handTop(380, G - 120, { skin: SKIN[3], scale: 1.1, rot: 180 }) +
      arrow([500, 160], [500, 260]) +
      pill(520, G - 60, 'Thumb deep'),
    { noGround: true },
  ),
  'rb-staples-5': frame(
    `<path d="M 240 ${G} L 360 120 L 480 ${G}" stroke="${C.wood}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M 300 ${G} L 360 120" stroke="${C.wood}" stroke-width="14"/>` +
      `<path d="M 250 ${G - 20} C 280 380 230 330 270 300 C 300 260 260 220 300 190 C 320 170 330 150 350 140" stroke="${C.leaf}" stroke-width="8" fill="none"/>` +
      [
        [262, 360],
        [280, 290],
        [306, 210],
        [440, 330],
        [420, 250],
      ]
        .map(
          ([x, y]) =>
            `<ellipse cx="${x}" cy="${y}" rx="18" ry="10" fill="${C.leaf}"/><path d="M ${x + 10} ${y + 8} q 4 30 -4 44" stroke="${C.leafDark}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
        )
        .join('') +
      `<path d="M 470 ${G - 20} C 440 360 470 300 440 240 C 420 200 400 170 380 150" stroke="${C.leaf}" stroke-width="8" fill="none"/>`,
  ),
  'rb-staples-7': frame(
    soil(80, 640, G - 40, 80) +
      [180, 260, 520].map((x, i) => potato(x, G - 6 + (i % 2) * 6, 1)).join('') +
      `<g transform="translate(400,${G - 30}) rotate(-15)"><rect x="-6" y="-200" width="12" height="190" rx="6" fill="${C.wood}"/><path d="M -24 -10 L 24 -10 L 22 50 L -22 50 Z" fill="${C.metalDark}"/><path d="M -30 -10 h 20 M 10 -10 h 20" stroke="${C.metalDark}" stroke-width="6"/></g>` +
      `<path d="M 560 ${G - 40} q 20 -40 60 -60" stroke="#C9B26A" stroke-width="8" fill="none"/>` +
      pill(360, 130, 'Plants yellow'),
    { noGround: true },
  ),
  // ---------------- soil ----------------
  'rb-soil-0': frame(
    `<path d="M 160 ${G} Q 180 ${G - 220} 360 ${G - 230} Q 540 ${G - 220} 560 ${G} Z" fill="#8A6A3E"/>` +
      `<g>${[
        [260, G - 150, C.leaf],
        [330, G - 190, C.straw],
        [420, G - 160, '#C97A4A'],
        [300, G - 80, C.straw],
        [450, G - 90, C.leafDark],
        [380, G - 120, '#E9C46A'],
      ]
        .map(
          ([x, y, c]) =>
            `<ellipse cx="${x}" cy="${y}" rx="34" ry="12" fill="${c}" transform="rotate(${((x * 3) % 40) - 20} ${x} ${y})"/>`,
        )
        .join('')}</g>` +
      pill(600, 140, 'Waist high'),
  ),
  'rb-soil-1': frame(
    basket(190, G, { fill: '#C9A06A', scale: 0.9 }) +
      basket(330, G, { fill: '#C9A06A', scale: 0.9 }) +
      basket(530, G, { fill: C.leaf, scale: 0.9 }) +
      pill(260, 200, '2 brown') +
      pill(530, 200, '1 green'),
  ),
  'rb-soil-3': frame(
    `<path d="M 160 ${G} Q 360 ${G - 160} 560 ${G} Z" fill="#4A3424"/>` +
      handTop(360, 230, { skin: SKIN[0], scale: 1.1, rot: 180 }) +
      `<ellipse cx="360" cy="300" rx="70" ry="22" fill="#4A3424"/>` +
      pill(560, 130, 'Dark, crumbly'),
  ),
  'rb-soil-5': frame(
    [
      [200, 180, 'Beans'],
      [500, 180, 'Greens'],
      [500, 360, 'Tomatoes'],
      [200, 360, 'Roots'],
    ]
      .map(
        ([x, y, t]) =>
          `<rect x="${x - 130}" y="${y - 70}" width="260" height="140" rx="16" fill="${C.soil}"/>` +
          text(x, y + 14, t, { size: 40, color: '#fff' }),
      )
      .join('') +
      arrow([340, 150], [380, 150], { width: 8 }) +
      arrow([500, 260], [500, 280], { width: 8 }) +
      arrow([380, 390], [340, 390], { width: 8 }) +
      arrow([200, 290], [200, 260], { width: 8 }),
    { noGround: true, blob: false },
  ),
  'rb-soil-7': frame(
    soil(80, 640, G - 30, 60) +
      `<path d="M 100 ${G - 30} Q 360 ${G - 90} 620 ${G - 30} Z" fill="${C.straw}"/>` +
      `<g stroke="#C9A54B" stroke-width="6">${[160, 240, 320, 400, 480, 560].map((x) => `<path d="M ${x} ${G - 40} l 30 -20"/>`).join('')}</g>` +
      tick(600, 130),
    { noGround: true },
  ),
  // ---------------- meat ----------------
  'rb-meat-2': frame(
    `<rect x="120" y="${G - 40}" width="480" height="40" rx="10" fill="${C.wood}"/>` +
      `<rect x="160" y="${G - 100}" width="200" height="60" rx="18" fill="#B5574A"/>` +
      [0, 1, 2, 3].map((i) => strip(450, G - 60 - i * 22, 150, 0, '#B5574A')).join('') +
      `<g transform="translate(330,170) rotate(30)"><rect x="-10" y="-100" width="20" height="120" rx="6" fill="${C.metal}"/><rect x="-14" y="20" width="28" height="60" rx="8" fill="${C.woodDark}"/></g>` +
      pill(560, 130, 'Pencil thin'),
  ),
  'rb-meat-3': frame(
    bowl(360, G, { scale: 1.6, color: C.metal }) +
      [0, 1, 2].map((i) => strip(330 + i * 30, G - 80, 160, -10 + i * 10)).join('') +
      `<g fill="#fff">${Array.from({ length: 20 }, (_, i) => `<rect x="${280 + ((i * 37) % 160)}" y="${G - 110 + ((i * 13) % 30)}" width="7" height="7"/>`).join('')}</g>` +
      sack(580, G, { label: 'salt', scale: 0.9 }),
  ),
  'rb-meat-4': frame(
    fire(360) +
      pot(360, 362, { water: true, boil: true, steam: true }) +
      strip(340, 280, 120, 70) +
      pill(580, 150, '1 min'),
  ),
  'rb-meat-5': frame(
    rack(140, 580, 160) + hanging(180, 540, 160, 8) + pill(360, 90, 'Not touching'),
  ),
  'rb-meat-6': frame(
    rack(140, 580, 160) +
      hanging(180, 540, 160, 8) +
      logs(360, G - 4, 0.6) +
      flame(360, G - 10, 0.4) +
      smoke(360, 340) +
      pill(600, 110, '1–3 days'),
  ),
  // ---------------- well ----------------
  'rb-well-0': frame(
    `<circle cx="200" cy="${G - 20}" r="60" fill="none" stroke="${C.forest}" stroke-width="10" stroke-dasharray="14 12"/>` +
      latrine(560, G, 0.8) +
      arrow([270, 300], [490, 300], { width: 8, color: C.forest }) +
      arrow([490, 300], [270, 300], { width: 8, color: C.forest }) +
      pill(380, 230, '50 big steps') +
      `<path d="M 200 ${G} l -20 -60 M 220 ${G} l 10 -50" stroke="${C.leaf}" stroke-width="8"/>`,
  ),
  'rb-well-2': frame(
    `<rect x="250" y="${G - 4}" width="220" height="200" fill="#6B5034"/>` +
      person({
        head: [360, 470],
        neck: [360, 506],
        hip: [360, 620],
        arms: [
          [
            [330, 440],
            [320, 400],
          ],
          [
            [390, 440],
            [400, 400],
          ],
        ],
        legs: [],
        ...P[2],
      }) +
      stander(150, { ...P[0], scale: 0.9 }) +
      stander(570, { ...P[1], scale: 0.9, facing: -1 }) +
      `<path d="M 170 220 L 330 ${G + 60}" stroke="#C9A877" stroke-width="6"/>` +
      pill(360, 120, 'Never alone'),
    { fit: false },
  ),
  'rb-well-4': frame(
    `<rect x="220" y="80" width="280" height="${G - 80}" fill="#6B5034"/>` +
      `<g>${stoneRing(250, G, 0, 0)}</g>` +
      Array.from(
        { length: 6 },
        (_, r) =>
          `<rect x="200" y="${G - (r + 1) * 52}" width="40" height="48" rx="8" fill="${r % 2 ? C.stone : C.stoneDark}"/><rect x="480" y="${G - (r + 1) * 52}" width="40" height="48" rx="8" fill="${r % 2 ? C.stoneDark : C.stone}"/>`,
      ).join('') +
      `<path d="M 600 ${G} v -156" stroke="${C.ink}" stroke-width="5"/><path d="M 588 ${G} h 24 M 588 ${G - 156} h 24" stroke="${C.ink}" stroke-width="5"/>` +
      pill(620, 140, '3 ft'),
    { noGround: true },
  ),
  'rb-well-5': frame(
    `<rect x="220" y="80" width="280" height="${G - 80}" fill="#6B5034"/>` +
      `<path d="M 230 160 l 30 30 l -20 30 l 26 26" stroke="${C.ink}" stroke-width="6" fill="none"/>` +
      `<path d="M 490 140 q -30 40 0 80" fill="#C9A877"/>` +
      arrow([360, 380], [360, 150]) +
      cross(600, 140) +
      pill(560, 380, 'Get out'),
    { noGround: true },
  ),
  'rb-well-9': frame(
    stoneRing(360, G, 250, 3) +
      `<rect x="220" y="${G - 106}" width="280" height="22" rx="8" fill="${C.wood}"/>` +
      bucket(560, G, { scale: 0.8 }) +
      `<path d="M 560 ${G - 120} q 20 -60 -40 -80" stroke="#C9A877" stroke-width="6" fill="none"/>` +
      pill(360, 140, 'Covered') +
      tick(150, 140),
  ),
  // ---------------- lime ----------------
  'rb-lime-0': frame(
    rock(360, G, 260, 140, '#E6E1D3') +
      `<g transform="translate(440,150) rotate(30)"><rect x="-20" y="-60" width="40" height="80" rx="10" fill="#7B4E2E"/><rect x="-12" y="-80" width="24" height="24" rx="4" fill="${C.ink}"/></g>` +
      `<path d="M 412 200 q -4 30 -8 70" stroke="#E8D9A8" stroke-width="6"/>` +
      fizz(400, G - 130) +
      pill(180, 140, 'Fizz = good'),
  ),
  'rb-lime-2': frame(
    stoneRing(360, G, 300, 6) +
      `<rect x="330" y="${G - 60}" width="60" height="60" rx="8" fill="#2B2F33"/>` +
      pill(600, 140, 'Chest high'),
  ),
  'rb-lime-4': frame(
    stoneRing(360, G, 300, 6) +
      flame(360, G - 170, 1.4) +
      flame(300, G - 176, 0.9) +
      flame(420, G - 176, 0.9) +
      sun(110, 110, 30) +
      moon(610, 110, 30) +
      pill(360, 90, 'Day + night'),
  ),
  'rb-lime-6': frame(
    `<path d="M 200 ${G - 140} L 520 ${G - 140} L 500 ${G} L 220 ${G} Z" fill="${C.wood}"/><rect x="214" y="${G - 120}" width="292" height="60" fill="${C.water}"/>` +
      `<g fill="#fff">${[
        [300, G - 140],
        [340, G - 160],
        [380, G - 150],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16"/>`)
        .join('')}</g>` +
      `<g transform="translate(470,170) rotate(40)"><rect x="-6" y="-80" width="12" height="100" rx="6" fill="${C.wood}"/><path d="M -24 20 L 24 20 L 18 60 L -18 60 Z" fill="${C.metalDark}"/></g>` +
      `<g transform="translate(140,170)"><rect x="-60" y="-26" width="120" height="52" rx="26" fill="#BFE3F7" stroke="${C.ink}" stroke-width="6"/><path d="M -60 0 h -20 M 60 0 h 20" stroke="${C.ink}" stroke-width="6"/></g>` +
      pill(140, 250, 'Goggles') +
      arrow([440, 230], [380, 290], { width: 8 }),
  ),
  'rb-lime-8': frame(
    bucket(220, G, { color: '#F4F2EC', scale: 0.9 }) +
      [0, 1, 2].map((i) => bucket(380 + i * 110, G, { color: '#D9C29A', scale: 0.7 })).join('') +
      pill(220, 180, '1 lime') +
      pill(490, 180, '3 sand'),
  ),
  // ---------------- remedies ----------------
  'rb-remedies-0': frame(
    jar(220, G, { fill: '#F2B33D', level: 80, scale: 1.3 }) +
      forearm(340, 600, 340, { skin: SKIN[3], sleeve: P[2].shirt, sleeveLen: 60 }) +
      `<ellipse cx="460" cy="334" rx="50" ry="16" fill="#F2B33D" opacity="0.85"/>` +
      tick(220, 140),
  ),
  'rb-remedies-1': frame(
    frontSit(300, {
      ...P[3],
      scale: 0.9,
      arms: [
        [
          [260, 330],
          [290, 310],
        ],
        [
          [340, 330],
          [320, 300],
        ],
      ],
    }) +
      cup(306, 300, { color: C.sun, scale: 0.9, rot: -30 }) +
      sack(540, G, { label: 'salt', scale: 0.8 }) +
      pill(540, 140, '½ tsp'),
  ),
  'rb-remedies-2': frame(
    jar(360, G, { scale: 2, fill: '#DCEFF7', level: 80 }) +
      pill(160, 160, '6 sugar') +
      pill(160, 260, '½ salt') +
      pill(560, 200, '1 quart'),
  ),
  'rb-remedies-3': frame(
    frontSit(360, {
      ...P[0],
      scale: 0.9,
      face: 'closed',
      arms: [
        [
          [310, 330],
          [300, 380],
        ],
        [
          [410, 330],
          [420, 380],
        ],
      ],
    }) +
      `<path d="M 290 150 Q 360 100 430 150 L 470 330 L 250 330 Z" fill="#E9A23B"/>` +
      `<circle cx="360" cy="190" r="26" fill="${SKIN[2]}"/><circle cx="350" cy="190" r="3.4" fill="${C.ink}"/><circle cx="370" cy="190" r="3.4" fill="${C.ink}"/>` +
      bowl(360, G, { scale: 1.1, fill: C.waterLight }) +
      `<g stroke="#9FB2AB" stroke-width="7" fill="none" stroke-linecap="round"><path d="M 330 ${G - 70} q -14 -24 0 -48"/><path d="M 390 ${G - 70} q -14 -24 0 -48"/></g>` +
      pill(580, 140, 'A few minutes'),
  ),
  'rb-remedies-5': frame(
    cup(360, G - 20, { scale: 2.2, color: '#F6F1E4', steam: true }) +
      `<rect x="320" y="${G - 86}" width="70" height="14" rx="6" fill="#D9A55A"/>` +
      `<g transform="translate(540,${G - 20})"><ellipse cx="0" cy="0" rx="50" ry="22" fill="#D9B77A"/><ellipse cx="40" cy="-14" rx="24" ry="14" fill="#D9B77A"/></g>` +
      `<g transform="translate(170,${G - 20})">${plant(0, 20, 0.7, { color: '#5FB57A' })}</g>`,
  ),
  // ---------------- elders ----------------
  'rb-elders-0': frame(
    chair(360, G) +
      frontSit(360, {
        ...ELDER,
        scale: 0.85,
        ground: G - 80,
        arms: [
          [
            [320, 290],
            [330, 330],
          ],
          [
            [400, 290],
            [390, 330],
          ],
        ],
      }) +
      `<rect x="320" y="320" width="80" height="20" rx="8" fill="#C9A877"/>` +
      frontSit(180, { ...P[4], scale: 0.6 }) +
      frontSit(540, { ...P[1], scale: 0.75 }),
  ),
  'rb-elders-1': frame(
    stander(300, {
      ...ELDER,
      hairStyle: 'short',
      hair: '#D9D4CC',
      scale: 0.95,
      arms: [
        [
          [300, 270],
          [310, 310],
        ],
        [
          [330, 260],
          [380, 270],
        ],
      ],
    }) +
      stander(420, {
        ...P[0],
        facing: -1,
        scale: 0.95,
        arms: [
          [
            [410, 260],
            [390, 270],
          ],
          [
            [400, 270],
            [384, 300],
          ],
        ],
      }) +
      `<rect x="250" y="270" width="12" height="160" rx="6" fill="${C.wood}"/>` +
      arrow([200, 140], [520, 140], { width: 8, color: C.forest }),
  ),
  'rb-elders-2': frame(
    bed(360, G, 420) +
      lier(240, G - 86, { ...ELDER, face: 'closed', scale: 0.8 }) +
      blanket(270, 540, G - 110, G - 66, '#9CC4DE') +
      clock(600, 130, 50, 2) +
      arrow([520, 220], [440, 300], { curve: [500, 290] }) +
      pill(360, 110, 'Every 2 hours'),
  ),
  'rb-elders-5': frame(
    bed(360, G, 420) +
      `<path d="M 160 ${G - 70} L 230 ${G - 200} L 270 ${G - 70} Z" fill="${C.cloth}"/>` +
      person({
        head: [270, 190],
        neck: [262, 226],
        hip: [250, G - 76],
        arms: [
          [
            [290, 290],
            [330, 270],
          ],
          [
            [300, 300],
            [340, 280],
          ],
        ],
        legs: [
          [
            [340, G - 70],
            [440, G - 70],
          ],
          [
            [350, G - 74],
            [450, G - 74],
          ],
        ],
        ...ELDER,
      }) +
      bowl(400, 300, { scale: 0.6, fill: '#E9C46A', color: '#F6F1E4' }) +
      pill(560, 140, 'Sit upright'),
  ),
  'rb-elders-8': frame(
    bed(320, G, 400) +
      lier(200, G - 86, { ...ELDER, face: 'closed', scale: 0.8 }) +
      blanket(230, 480, G - 110, G - 66, '#9CC4DE') +
      sitter(560, {
        ...P[1],
        facing: -1,
        scale: 0.9,
        arms: [
          [
            [530, 330],
            [490, 344],
          ],
          [
            [520, 340],
            [478, 350],
          ],
        ],
      }) +
      heart(360, 140, 1),
  ),
};
