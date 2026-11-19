// Outdoor survival pictures: safe water, lost, fire, shelter, finding water, signals, staying warm.
import {
  C,
  SKIN,
  HAIR,
  GROUND as G,
  frame,
  person,
  lier,
  stander,
  front,
  frontJoints,
  frontSit,
  sitter,
  arrow,
  tick,
  cross,
  pill,
  zoom,
  handTop,
  blanket,
  cup,
  shake,
  jar,
  bucket,
  pot,
  fire,
  flame,
  logs,
  tree,
  sun,
  plant,
  rock,
  cloth,
  noSign,
  text,
  shade,
  snow,
  wind,
  house,
  rain,
} from '../kit.mjs';
import { stick, stone, basket, sack, moon, chair } from '../props.mjs';

const ME = { shirt: '#E07B39', skin: SKIN[3], hair: HAIR[1], pants: '#4B3F72' };
const ME2 = { shirt: C.forest, skin: SKIN[2], hair: HAIR[2], pants: '#34495E' };

const tinder = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="-22" rx="48" ry="26" fill="${C.straw}"/><path d="M -36 -26 q 30 -14 70 0 M -30 -14 q 30 -12 60 2" stroke="#C9A54B" stroke-width="5" fill="none"/></g>`;

const tent = (x, y = G, s = 1, lit = false) => {
  const sticks = [-60, -36, -12, 12, 36, 60]
    .map(
      (dx) =>
        `<path d="M ${x + dx * s} ${y} L ${x} ${y - 140 * s}" stroke="${C.wood}" stroke-width="${10 * s}" stroke-linecap="round"/>`,
    )
    .join('');
  return tinder(x, y, s * 0.9) + sticks + (lit ? flame(x - 6 * s, y - 6 * s, 0.6 * s) : '');
};

const twigs = (x, y, n = 6, len = 120, w = 6, col = C.bark) =>
  Array.from(
    { length: n },
    (_, i) =>
      `<path d="M ${x - len / 2} ${y - i * (w + 2)} L ${x + len / 2} ${y - i * (w + 2) - (i % 2) * 6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`,
  ).join('');

const tarp = (x1, x2, y1, y2, col = '#5B8DBE') =>
  `<path d="M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y2 + 30} ${x2} ${y1}" stroke="${col}" stroke-width="14" fill="none"/><path d="M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y2 + 30} ${x2} ${y1} L ${x2} ${y1 - 10} Q ${(x1 + x2) / 2} ${y2 + 10} ${x1} ${y1 - 10} Z" fill="${col}"/>`;

const bottle = (x, y = G, s = 1, col = C.water) =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-36" y="-150" width="72" height="150" rx="18" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="-30" y="-110" width="60" height="104" rx="12" fill="${col}"/><rect x="-18" y="-172" width="36" height="26" rx="6" fill="${C.forest}"/></g>`;

const leanTo = (x, done = false, cover = 0) =>
  tree(x - 190, G, 0.8) +
  tree(x + 190, G, 0.8) +
  `<path d="M ${x - 200} ${G - 150} L ${x + 200} ${G - 150}" stroke="${C.woodDark}" stroke-width="14" stroke-linecap="round"/>` +
  Array.from(
    { length: 9 },
    (_, i) =>
      `<path d="M ${x - 170 + i * 42} ${G - 150} L ${x - 190 + i * 42} ${G}" stroke="${C.wood}" stroke-width="10" stroke-linecap="round" transform="skewX(0)"/>`,
  ).join('') +
  (cover
    ? `<path d="M ${x - 210} ${G} L ${x - 200} ${G - 160} L ${x + 200} ${G - 160} L ${x + 210} ${G} Z" fill="${C.leafDark}" opacity="${cover}"/>` +
      Array.from(
        { length: Math.round(12 * cover) },
        (_, i) =>
          `<ellipse cx="${x - 180 + ((i * 37) % 360)}" cy="${G - 30 - ((i * 53) % 120)}" rx="26" ry="12" fill="${i % 2 ? C.leaf : '#C99A4A'}"/>`,
      ).join('')
    : '');

const signalPerson = (x, up) =>
  stander(x, {
    ...ME,
    arms: up
      ? [
          [
            [x - 30, 150],
            [x - 50, 90],
          ],
          [
            [x + 30, 150],
            [x + 50, 90],
          ],
        ]
      : [
          [
            [x - 40, 200],
            [x - 80, 160],
          ],
          [
            [x + 40, 200],
            [x + 80, 160],
          ],
        ],
  });

const whistle = (x, y) =>
  `<g transform="translate(${x},${y})"><rect x="-40" y="-18" width="70" height="36" rx="14" fill="${C.coral}"/><rect x="24" y="-12" width="30" height="20" rx="4" fill="${C.coral}"/><circle cx="-10" cy="0" r="8" fill="#fff"/></g>`;

const three = (n) =>
  stander(200, {
    ...ME,
    face: 'open',
    arms: [
      [
        [190, 260],
        [180, 300],
      ],
      [
        [230, 230],
        [250, 200],
      ],
    ],
  }) +
  whistle(270, 196) +
  [0, 1, 2]
    .map(
      (i) =>
        `<g opacity="${i < n ? 1 : 0.18}"><circle cx="${400 + i * 100}" cy="200" r="38" fill="${C.sun}"/><text x="${400 + i * 100}" y="216" text-anchor="middle" font-family="Inter" font-weight="800" font-size="44" fill="${C.ink}">${i + 1}</text></g>`,
    )
    .join('');

const room = (body) =>
  `<rect x="100" y="80" width="520" height="${G - 80}" fill="#F3E3C3"/><rect x="100" y="${G - 20}" width="520" height="20" fill="${C.wood}"/>` +
  body;

export default {
  // ---------------- safe water ----------------
  'water-filter': frame(
    jar(360, G, { scale: 1.6, fill: C.waterLight, level: 50 }) +
      `<path d="M 290 ${G - 176} Q 360 ${G - 110} 430 ${G - 176}" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="5"/>` +
      `<g transform="translate(420,150) rotate(-40)"><rect x="-44" y="-60" width="88" height="110" rx="16" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="-38" y="-14" width="76" height="58" rx="10" fill="#C9B58E"/></g>` +
      `<path d="M 380 176 C 370 200 362 214 360 ${G - 150}" stroke="#C9B58E" stroke-width="12" fill="none" stroke-linecap="round"/>` +
      pill(170, 140, 'Clean cloth'),
  ),
  'water-boil-a': frame(fire(360) + pot(360, 362, { water: true, steam: false })),
  'water-boil-b': frame(
    fire(360) +
      pot(360, 362, { water: true, boil: true, steam: true }) +
      pill(580, 150, '1 min') +
      tick(140, 140),
  ),
  'water-bleach': frame(
    bottle(220, G, 1.3) +
      `<g transform="translate(470,${G})"><rect x="-60" y="-200" width="120" height="200" rx="24" fill="#fff" stroke="#C9D2CE" stroke-width="5"/><rect x="-24" y="-232" width="48" height="36" rx="8" fill="${C.water}"/><rect x="-44" y="-130" width="88" height="60" rx="8" fill="#E8F1F6"/></g>` +
      text(470, G - 90, '6%', { size: 40 }) +
      `<g fill="${C.water}">${[0, 1, 2].map((i) => `<path d="M ${330 + i * 22} ${150 + i * 30} q -9 16 0 24 q 9 -8 0 -24"/>`).join('')}</g>` +
      pill(220, 120, '8 drops') +
      pill(560, 120, 'No scent'),
  ),
  'water-wait': frame(
    bottle(300, G, 1.4) +
      `<g transform="translate(300,160)"></g>` +
      `<g>${''}</g>` +
      pill(520, 200, '30 min') +
      `<g filter="url(#soft)"><circle cx="520" cy="320" r="60" fill="#fff"/></g><circle cx="520" cy="320" r="50" fill="none" stroke="${C.ink}" stroke-width="5"/><path d="M 520 320 L 520 282 M 520 320 L 520 358" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`,
  ),
  'water-store': frame(
    bottle(220, G, 1.2) +
      bottle(330, G, 1.2) +
      `<g transform="translate(500,${G})"><rect x="-90" y="-160" width="180" height="160" rx="16" fill="#5B8DBE"/><rect x="-30" y="-180" width="60" height="26" rx="6" fill="${C.forest}"/><rect x="-70" y="-120" width="140" height="70" rx="10" fill="#8FB7D9"/></g>` +
      tick(620, 120) +
      pill(330, 110, 'Lids on'),
  ),
  // ---------------- lost ----------------
  'lost-stop': frame(
    tree(140, G, 0.9) +
      tree(600, G, 0.8) +
      sitter(330, { ...ME, face: 'calm' }) +
      pill(360, 100, 'Stay put') +
      tick(560, 220),
  ),
  'lost-warm': frame(
    rain(10, 7) +
      tree(200, G, 1.2) +
      `<ellipse cx="200" cy="${G + 2}" rx="140" ry="16" fill="rgba(18,56,45,0.16)"/>` +
      sitter(250, { ...ME, face: 'calm' }) +
      pill(540, 300, 'Out of the rain'),
  ),
  'lost-signal-a': frame(
    signalPerson(360, false) + `<rect x="420" y="130" width="70" height="44" fill="${C.coral}"/>`,
  ),
  'lost-signal-b': frame(
    signalPerson(360, true) +
      `<rect x="390" y="50" width="70" height="44" fill="${C.coral}" transform="rotate(20 410 70)"/>` +
      shake(360, 70),
  ),
  'lost-three-a': frame(three(1)),
  'lost-three-b': frame(three(2)),
  'lost-three-c': frame(three(3)),
  // ---------------- fire ----------------
  'fire-spot': frame(
    tree(110, G, 0.8) +
      `<ellipse cx="420" cy="${G}" rx="120" ry="20" fill="#9C7048"/>` +
      `<g>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => stone(420 + Math.cos(i * 0.8) * 100, G + 8 + Math.sin(i * 0.8) * 14, 40, 26)).join('')}</g>` +
      arrow([180, G - 60], [320, G - 60], { width: 8, color: C.forest }) +
      arrow([320, G - 60], [180, G - 60], { width: 8, color: C.forest }) +
      pill(250, 230, '10 ft') +
      tick(600, 150),
  ),
  'fire-piles': frame(
    `<ellipse cx="170" cy="${G - 26}" rx="80" ry="30" fill="${C.straw}"/>` +
      twigs(360, G - 6, 6, 150, 6) +
      twigs(560, G - 10, 4, 170, 22, C.wood) +
      text(170, G + 60, 'Grass', { size: 0 }) +
      pill(170, 230, 'Grass') +
      pill(360, 230, 'Twigs') +
      pill(560, 230, 'Logs'),
  ),
  'fire-snap-a': frame(
    stick(220, 270, 500, 270, 18) +
      handTop(220, 300, { scale: 0.8, rot: -90, skin: SKIN[3] }) +
      handTop(500, 300, { scale: 0.8, rot: 90, skin: SKIN[3] }),
  ),
  'fire-snap-b': frame(
    stick(220, 250, 350, 290, 18) +
      stick(370, 290, 500, 250, 18) +
      `<g stroke="${C.sun}" stroke-width="7" stroke-linecap="round"><path d="M 360 230 l 0 -40 M 330 236 l -20 -30 M 390 236 l 20 -30"/></g>` +
      tick(600, 140) +
      pill(360, 420, 'Snaps = dry'),
  ),
  'fire-tent': frame(
    tent(360, G, 1.3) + zoom(590, 150, 80, tinder(0, 40, 1.4), {}) + pill(590, 270, 'Fist size'),
  ),
  'fire-light-a': frame(
    tent(360, G, 1.3) +
      `<g transform="translate(250,${G - 40}) rotate(-20)"><rect x="-4" y="-50" width="8" height="60" fill="${C.wood}"/><circle cx="0" cy="-54" r="8" fill="${C.coral}"/></g>` +
      wind(450, 150, 0.8) +
      pill(560, 260, 'Wind side'),
  ),
  'fire-light-b': frame(
    tent(360, G, 1.3, true) +
      `<g stroke="#9FB8C8" stroke-width="6" fill="none" stroke-linecap="round"><path d="M 200 ${G - 40} q 40 -10 80 0"/><path d="M 200 ${G - 60} q 40 -10 80 0"/></g>` +
      pill(560, 200, 'Blow gently'),
  ),
  'fire-feed-a': frame(
    fire(360, G, 1.1) + stick(500, 200, 420, 330, 14) + arrow([560, 180], [470, 260], { width: 8 }),
  ),
  'fire-feed-b': frame(
    fire(360, G, 1.3) + stick(300, 300, 440, 330, 14) + pill(560, 160, 'Leave gaps'),
  ),
  'fire-no-tent': frame(
    `<path d="M 160 ${G} L 280 ${G - 200} L 400 ${G} Z" fill="#E9A23B"/>` +
      flame(280, G - 10, 0.6) +
      noSign(280, G - 100, 120) +
      `<g transform="translate(540,${G})"><rect x="-90" y="-80" width="180" height="70" rx="20" fill="#5B8DBE"/><path d="M -60 -80 L -40 -130 L 50 -130 L 70 -80 Z" fill="#5B8DBE"/><circle cx="-50" cy="-10" r="22" fill="${C.ink}"/><circle cx="50" cy="-10" r="22" fill="${C.ink}"/></g>` +
      noSign(540, G - 80, 110),
    { blob: false },
  ),
  // ---------------- shelter ----------------
  'shelter-early': frame(
    sun(560, G - 80, 50) +
      `<rect x="40" y="${G - 4}" width="640" height="200" fill="${C.bg}"/>` +
      leanTo(300) +
      pill(300, 120, '2 hrs before dark'),
    {},
  ),
  'shelter-spot': frame(
    tree(160, G, 0.9) +
      tree(320, G, 0.9) +
      `<ellipse cx="240" cy="${G + 2}" rx="160" ry="14" fill="rgba(18,56,45,0.12)"/>` +
      tick(240, 150) +
      `<path d="M 520 ${G} L 560 ${G - 200} M 560 ${G - 140} L 610 ${G - 180} M 548 ${G - 90} L 500 ${G - 130}" stroke="#8C7B6B" stroke-width="14" stroke-linecap="round"/>` +
      cross(560, 150) +
      pill(560, 300, 'Dead tree'),
  ),
  'shelter-frame': frame(leanTo(360)),
  'shelter-cover-a': frame(leanTo(360, false, 0.5)),
  'shelter-cover-b': frame(leanTo(360, false, 1) + pill(360, 110, 'Arm thick')),
  'shelter-bed': frame(
    `<path d="M 120 ${G} Q 360 ${G - 90} 600 ${G} Z" fill="#C99A4A"/>` +
      Array.from(
        { length: 14 },
        (_, i) =>
          `<ellipse cx="${160 + i * 30}" cy="${G - 20 - (i % 3) * 14}" rx="24" ry="10" fill="${i % 2 ? C.leaf : '#D9A45A'}"/>`,
      ).join('') +
      pill(360, 200, 'Thick bed'),
  ),
  'shelter-done': frame(
    leanTo(330, true, 1) +
      `<rect x="300" y="${G - 70}" width="70" height="60" rx="14" fill="#7A5E3A"/>` +
      fire(620, G, 0.5) +
      tick(620, 150),
  ),
  // ---------------- find water ----------------
  'save-heater': frame(
    `<g transform="translate(300,${G})"><rect x="-80" y="-300" width="160" height="300" rx="40" fill="#E8EEF2" stroke="#B9C4CB" stroke-width="5"/><rect x="60" y="-60" width="60" height="16" rx="6" fill="${C.metalDark}"/></g>` +
      `<path d="M 420 ${G - 52} q 10 30 10 30" stroke="${C.water}" stroke-width="12" fill="none" stroke-linecap="round"/>` +
      bucket(450, G, { water: true, scale: 0.8 }) +
      pill(560, 150, 'Let it cool'),
  ),
  'findw-tarp-a': frame(
    rain(14, 2) +
      stick(160, G, 160, 200, 12) +
      stick(560, G, 560, 200, 12) +
      tarp(160, 560, 200, 280) +
      bucket(360, G, { scale: 0.8 }),
  ),
  'findw-tarp-b': frame(
    rain(14, 4) +
      stick(160, G, 160, 200, 12) +
      stick(560, G, 560, 200, 12) +
      tarp(160, 560, 200, 280) +
      `<path d="M 360 300 v 30" stroke="${C.water}" stroke-width="10" stroke-linecap="round"/>` +
      bucket(360, G, { scale: 0.8, water: true }) +
      tick(620, 120),
  ),
  'findw-downhill': frame(
    `<path d="M 40 160 Q 300 220 420 ${G - 20} L 680 ${G} L 40 ${G} Z" fill="#B9D3A8"/>` +
      `<path d="M 420 ${G - 10} Q 520 ${G - 30} 680 ${G - 10}" stroke="${C.water}" stroke-width="18" fill="none"/>` +
      plant(560, G - 20, 0.8) +
      plant(620, G - 18, 0.6) +
      stander(200, { ...ME, scale: 0.8, ground: 240 }) +
      arrow([260, 260], [400, 360], { width: 9 }),
  ),
  'findw-flow': frame(
    `<path d="M 60 ${G - 60} Q 200 ${G - 90} 340 ${G - 60}" stroke="${C.water}" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M 100 ${G - 70} l 40 0 M 220 ${G - 76} l 40 0" stroke="#fff" stroke-width="6" stroke-linecap="round"/>` +
      `<ellipse cx="540" cy="${G - 40}" rx="110" ry="30" fill="#8FA06A"/>` +
      tick(200, 200) +
      cross(540, 200),
  ),
  'findw-dig-a': frame(
    `<path d="M 200 ${G} Q 360 ${G + 120} 520 ${G} Z" fill="#7A5434"/>` +
      `<g transform="translate(560,240) rotate(30)"><rect x="-6" y="-120" width="12" height="150" rx="6" fill="${C.wood}"/><path d="M -30 30 L 30 30 L 22 90 Q 0 104 -22 90 Z" fill="${C.metalDark}"/></g>` +
      plant(140, G, 0.6),
    { noGround: false },
  ),
  'findw-dig-b': frame(
    `<path d="M 200 ${G} Q 360 ${G + 120} 520 ${G} Z" fill="#7A5434"/><path d="M 260 ${G + 20} Q 360 ${G + 80} 460 ${G + 20} Z" fill="${C.water}"/>` +
      plant(140, G, 0.6) +
      pill(360, 200, 'Wait'),
  ),
  'findw-dew-a': frame(
    sun(120, G - 40, 40) +
      Array.from(
        { length: 16 },
        (_, i) =>
          `<path d="M ${160 + i * 30} ${G} q 6 -50 0 -70" stroke="${C.leaf}" stroke-width="7" fill="none"/><circle cx="${162 + i * 30}" cy="${G - 66}" r="5" fill="#fff"/>`,
      ).join('') +
      `<path d="M 300 ${G - 70} q 60 -30 120 0 l 0 30 q -60 20 -120 0 z" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="4"/>` +
      arrow([260, 220], [460, 220], { width: 8 }),
  ),
  'findw-dew-b': frame(
    `<path d="M 300 160 q 60 -20 120 0 l -20 80 q -40 10 -80 0 z" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="4"/>` +
      handTop(310, 150, { scale: 0.6, rot: -90, skin: SKIN[3] }) +
      handTop(410, 150, { scale: 0.6, rot: 90, skin: SKIN[3] }) +
      `<g fill="${C.water}">${[0, 1, 2].map((i) => `<path d="M 360 ${270 + i * 34} q -8 14 0 20 q 8 -6 0 -20"/>`).join('')}</g>` +
      cup(360, G, { scale: 1.6, water: true, color: C.sun }),
  ),
  // ---------------- signal ----------------
  'signal-high-a': frame(
    `<path d="M 120 ${G} Q 360 120 600 ${G} Z" fill="#B9D3A8"/>` +
      stander(360, { ...ME, ground: 282, scale: 0.75 }),
  ),
  'signal-high-b': frame(
    `<path d="M 120 ${G} Q 360 120 600 ${G} Z" fill="#B9D3A8"/>` +
      stander(360, {
        ...ME,
        ground: 282,
        scale: 0.75,
        arms: [
          [
            [340, 120],
            [320, 76],
          ],
          [
            [380, 120],
            [400, 76],
          ],
        ],
      }) +
      shake(360, 70),
  ),
  'signal-mirror-a': frame(
    sun(110, 100, 40) +
      stander(360, {
        ...ME,
        arms: [
          [
            [340, 260],
            [330, 300],
          ],
          [
            [400, 220],
            [430, 180],
          ],
        ],
      }) +
      `<rect x="420" y="160" width="40" height="30" rx="4" fill="#BFE3F7" stroke="${C.metalDark}" stroke-width="4"/>`,
  ),
  'signal-mirror-b': frame(
    sun(110, 100, 40) +
      stander(360, {
        ...ME,
        arms: [
          [
            [340, 260],
            [330, 300],
          ],
          [
            [400, 220],
            [430, 180],
          ],
        ],
      }) +
      `<rect x="420" y="160" width="40" height="30" rx="4" fill="#BFE3F7" stroke="${C.metalDark}" stroke-width="4"/>` +
      `<path d="M 450 170 L 640 80" stroke="${C.sun}" stroke-width="10" stroke-linecap="round"/><g transform="translate(640,80)"><path d="M -30 0 L 30 0 M 0 -6 L -20 14 M 0 -6 L 20 14" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/></g>`,
  ),
  'signal-smoke-a': frame(fire(360, G, 1.1) + plant(520, G, 0.9)),
  'signal-smoke-b': frame(
    fire(360, G, 1.1) +
      `<g fill="#B9C4C9">${[
        [360, 250, 50],
        [390, 180, 44],
        [350, 110, 38],
        [380, 50, 32],
      ]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`)
        .join('')}</g>` +
      pill(560, 200, 'Green leaves'),
  ),
  'signal-sos': frame(
    `<rect x="60" y="180" width="600" height="240" rx="20" fill="#B9D3A8"/>` +
      `<g fill="${C.stoneDark}">${'SOS'
        .split('')
        .map(
          (l, i) =>
            `<text x="${200 + i * 160}" y="370" text-anchor="middle" font-family="Inter" font-weight="900" font-size="180" fill="${C.stone}" stroke="${C.stoneDark}" stroke-width="6">${l}</text>`,
        )
        .join('')}</g>` +
      pill(360, 110, 'Bigger than a car'),
    { noGround: true },
  ),
  'signal-cloth': frame(
    stick(300, G, 300, 120, 14) +
      `<path d="M 306 130 Q 400 110 480 150 Q 420 190 480 230 Q 400 210 306 220 Z" fill="${C.coral}"/>` +
      wind(500, 300, 0.8),
  ),
  // ---------------- warm ----------------
  'warm-layers': frame(
    [
      ['#F3E3C3', 'Snug'],
      ['#E07B39', 'Thick'],
      ['#5B8DBE', 'Wind-proof'],
    ]
      .map(
        ([c, t], i) =>
          `<g transform="translate(${170 + i * 190},280) scale(${0.8 + i * 0.1})"><path d="M -60 -70 L -24 -84 Q 0 -66 24 -84 L 60 -70 L 84 -26 L 54 -14 L 50 70 L -50 70 L -54 -14 L -84 -26 Z" fill="${c}" stroke="${shade(c, 0.2)}" stroke-width="4"/></g>` +
          pill(170 + i * 190, 420, t, { size: 36 }),
      )
      .join('') + arrow([230, 150], [480, 150], { width: 8 }),
    { blob: false, noGround: true },
  ),
  'warm-cover': frame(
    front(360, { ...ME, hairStyle: 'hat', hat: C.coral }) +
      `<rect x="324" y="${frontJoints(360).shY - 22}" width="72" height="24" rx="10" fill="${C.sun}"/>` +
      `<circle cx="306" cy="${frontJoints(360).shY + 124}" r="15" fill="${C.coral}"/><circle cx="414" cy="${frontJoints(360).shY + 124}" r="15" fill="${C.coral}"/>` +
      tick(580, 140),
  ),
  'warm-room': frame(
    room(
      `<rect x="420" y="130" width="140" height="140" fill="#BFD9EA"/><path d="M 410 120 Q 490 200 410 290 L 570 290 Q 490 200 570 120 Z" fill="#E9A23B"/>` +
        `<rect x="150" y="160" width="110" height="${G - 180}" rx="6" fill="${C.woodDark}"/>` +
        `<circle cx="240" cy="${G - 120}" r="7" fill="${C.sun}"/>`,
    ) + tick(620, 100),
  ),
  'warm-floor': frame(
    `<rect x="200" y="${G - 40}" width="320" height="40" rx="10" fill="#C9B48A"/>` +
      sitter(330, { ...ME, ground: G - 40 }) +
      `<g stroke="#9FB8C8" stroke-width="6" stroke-linecap="round" opacity="0.7"><path d="M 140 ${G + 4} h 40 M 560 ${G + 4} h 40"/></g>` +
      pill(360, 110, 'Off the cold floor'),
  ),
};
