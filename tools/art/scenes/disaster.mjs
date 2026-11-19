// Disaster pictures: hurricane, tornado, earthquake, wildfire, flood, winter storm, heat wave.
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
  frontSit,
  sitter,
  lier,
  arrow,
  tick,
  cross,
  pill,
  zoom,
  cup,
  jar,
  bucket,
  pot,
  fire,
  flame,
  tree,
  sun,
  noSign,
  text,
  shade,
  rain,
  snow,
  wind,
  house,
  blanket,
  shake,
} from '../kit.mjs';
import { car, windowFrame, table, bed, clock, sack, heart, moon, chair } from '../props.mjs';

const ME = { shirt: '#5B8DBE', skin: SKIN[0], hair: HAIR[0], pants: '#34495E' };
const ME2 = { shirt: '#E07B39', skin: SKIN[1], hair: HAIR[4], hairStyle: 'long', pants: '#4B3F72' };
const KID = { shirt: '#E2B33C', skin: SKIN[2], hair: HAIR[2], pants: '#5A6B4E' };
const OLD = { shirt: '#B5838D', skin: SKIN[1], hair: '#D9D4CC', gray: true, pants: '#5D5D6B' };

// a house cut open so you can see inside: two floors
const cutaway = (body, o = {}) =>
  `<path d="M 130 170 L 360 50 L 590 170 Z" fill="${C.coral}"/><rect x="150" y="170" width="420" height="${G - 170}" fill="#F3E3C3" stroke="${C.wood}" stroke-width="8"/><path d="M 150 300 H 570" stroke="${C.wood}" stroke-width="10"/>` +
  (o.basement
    ? `<rect x="150" y="${G}" width="420" height="80" fill="#D9C7A6" stroke="${C.wood}" stroke-width="8"/>`
    : '') +
  body;

const crouchUnder = (x, y = G) =>
  person({
    head: [x - 40, y - 60],
    neck: [x - 16, y - 70],
    hip: [x + 50, y - 66],
    legs: [
      [[x + 40, y - 10], [x + 100, y - 8], 1],
      [[x + 50, y - 12], [x + 110, y - 10], 1],
    ],
    arms: [
      [
        [x - 30, y - 30],
        [x - 60, y - 10],
      ],
      [
        [x - 40, y - 90],
        [x - 60, y - 70],
      ],
    ],
    facing: -1,
    ...ME,
  });

const water = (y, x1 = 40, x2 = 680, col = C.water) =>
  `<path d="M ${x1} ${y} Q ${x1 + 40} ${y - 14} ${x1 + 80} ${y} T ${x1 + 160} ${y} T ${x1 + 240} ${y} T ${x1 + 320} ${y} T ${x1 + 400} ${y} T ${x1 + 480} ${y} T ${x1 + 560} ${y} T ${x1 + 640} ${y} L ${x2} ${G + 40} L ${x1} ${G + 40} Z" fill="${col}" opacity="0.85"/>`;

const twister = (x, y = G) =>
  `<path d="M ${x - 120} 70 L ${x + 120} 70 Q ${x + 60} 200 ${x + 10} ${y} L ${x - 10} ${y} Q ${x - 60} 200 ${x - 120} 70 Z" fill="#8C99A6"/>${[110, 170, 240, 320].map((yy, i) => `<path d="M ${x - 100 + i * 24} ${yy} q ${100 - i * 24} 20 ${200 - i * 48} 0" stroke="#6E7B88" stroke-width="7" fill="none"/>`).join('')}`;

const smokeSky = (n = 6) =>
  Array.from(
    { length: n },
    (_, i) =>
      `<circle cx="${100 + i * 110}" cy="${90 + (i % 2) * 30}" r="${60 + (i % 3) * 14}" fill="#B9A89A" opacity="0.6"/>`,
  ).join('');

const flames = (x1, x2, y = G, s = 0.9) => {
  let out = '';
  for (let x = x1; x <= x2; x += 70) out += flame(x, y, s * (0.8 + ((x * 7) % 5) / 10));
  return out;
};

const mask = (x, y) =>
  `<rect x="${x - 26}" y="${y}" width="52" height="30" rx="10" fill="#fff" stroke="#C9D2CE" stroke-width="3"/>`;

export default {
  // ---------------- hurricane ----------------
  'hz-inside': frame(
    cutaway(
      `<rect x="170" y="190" width="100" height="90" fill="#BFD9EA" stroke="#fff" stroke-width="6"/>` +
        cross(220, 236, 24) +
        stander(420, { ...ME, ground: G - 4, scale: 0.55 }) +
        `<rect x="330" y="310" width="16" height="${G - 310}" fill="${C.wood}"/>`,
    ) +
      wind(20, 120, 0.7) +
      rain(10, 3) +
      tick(430, 330, 26),
  ),
  'hz-up-a': frame(
    cutaway(
      water(380, 150, 570) +
        stander(300, { ...ME, ground: 296, scale: 0.5 }) +
        `<path d="M 470 290 L 470 190" stroke="${C.wood}" stroke-width="8"/>`,
    ) + arrow([520, 290], [520, 200], { width: 8 }),
  ),
  'hz-up-b': frame(
    cutaway(
      water(300, 150, 570) +
        stander(380, {
          ...ME,
          ground: 296,
          scale: 0.5,
          arms: [
            [
              [370, 230],
              [356, 250],
            ],
            [
              [392, 200],
              [410, 170],
            ],
          ],
        }) +
        `<g transform="translate(414,160) rotate(30)"><rect x="-4" y="0" width="8" height="50" fill="${C.wood}"/><path d="M -4 0 l -16 -6 l 0 18 l 16 0 z" fill="${C.metalDark}"/></g>`,
    ) + pill(600, 110, 'Go up'),
  ),
  'hz-eye': frame(
    house(360, G, 1.2, {}) +
      `<circle cx="360" cy="90" r="60" fill="#DDEBF3"/><circle cx="360" cy="90" r="34" fill="${C.bg}"/>` +
      `<g opacity="0.5">${wind(80, 110, 0.6)}${wind(500, 70, 0.6)}</g>` +
      pill(580, 210, 'Stay in'),
  ),
  // ---------------- tornado ----------------
  'hz-basement': frame(
    cutaway(
      stander(300, { ...ME, ground: G + 72, scale: 0.4 }) +
        stander(380, { ...KID, ground: G + 72, scale: 0.3 }),
      { basement: true },
    ) +
      arrow([620, 180], [620, 470], { width: 8 }) +
      pill(620, 120, 'Lowest'),
  ),
  'hz-table': frame(table(360, G, 380, 150) + crouchUnder(340) + tick(620, 120)),
  'hz-cover': frame(
    person({
      head: [300, G - 60],
      neck: [324, G - 70],
      hip: [400, G - 66],
      legs: [
        [[390, G - 10], [450, G - 8], 1],
        [[400, G - 12], [460, G - 10], 1],
      ],
      arms: [
        [
          [300, G - 110],
          [270, G - 80],
        ],
        [
          [320, G - 112],
          [286, G - 92],
        ],
      ],
      facing: -1,
      ...ME,
    }) +
      `<path d="M 230 ${G - 120} Q 360 ${G - 200} 500 ${G - 110} L 500 ${G - 70} Q 360 ${G - 150} 230 ${G - 80} Z" fill="#9CC4DE"/>` +
      pill(560, 120, 'Cover head + neck'),
  ),
  'hz-ditch': frame(
    twister(600, G) +
      `<path d="M 80 ${G} Q 300 ${G + 70} 520 ${G} Z" fill="#9C7048"/>` +
      lier(220, G + 10, {
        ...ME,
        face: 'closed',
        facing: 1,
        arms: [
          null,
          [
            [200, G - 20],
            [190, G - 6],
          ],
        ],
      }) +
      pill(300, 140, 'Lie flat, low'),
  ),
  // ---------------- earthquake ----------------
  'quake-drop': frame(
    person({
      head: [300, G - 120],
      neck: [320, G - 100],
      hip: [420, G - 100],
      legs: [
        [[420, G - 6], [480, G - 4], 1],
        [[430, G - 8], [490, G - 6], 1],
      ],
      arms: [
        [
          [310, G - 50],
          [300, G - 6],
        ],
        [
          [320, G - 48],
          [312, G - 6],
        ],
      ],
      facing: -1,
      ...ME,
    }) +
      shake(360, 160) +
      pill(560, 120, 'Hands + knees'),
  ),
  'quake-hold-a': frame(
    table(360, G, 380, 150) +
      crouchUnder(340) +
      `<path d="M 300 ${G - 90} L 230 ${G - 140}" stroke="${ME.shirt}" stroke-width="16" stroke-linecap="round"/><circle cx="226" cy="${G - 140}" r="10" fill="${ME.skin}"/>` +
      shake(360, 200),
  ),
  'quake-hold-b': frame(
    `<g transform="rotate(2 360 ${G})">${table(360, G, 380, 150)}</g>` +
      crouchUnder(340) +
      `<path d="M 300 ${G - 90} L 230 ${G - 140}" stroke="${ME.shirt}" stroke-width="16" stroke-linecap="round"/><circle cx="226" cy="${G - 140}" r="10" fill="${ME.skin}"/>` +
      shake(360, 200) +
      pill(580, 120, 'Hold on'),
  ),
  'quake-bed': frame(
    bed(360, G, 420) +
      lier(220, G - 86, { ...ME, face: 'closed', scale: 0.85 }) +
      `<rect x="150" y="${G - 140}" width="110" height="50" rx="20" fill="#fff" stroke="#D5DCD8" stroke-width="4"/>` +
      blanket(260, 560, G - 110, G - 66, '#9CC4DE') +
      shake(360, 160) +
      tick(620, 120),
  ),
  'quake-open': frame(
    house(140, G, 0.8) +
      `<path d="M 610 ${G} L 610 140 M 560 170 H 660" stroke="${C.woodDark}" stroke-width="12"/><path d="M 600 170 Q 500 220 400 170" stroke="${C.ink}" stroke-width="4" fill="none"/>` +
      stander(380, { ...ME, scale: 0.85 }) +
      tick(380, 110),
  ),
  // ---------------- wildfire ----------------
  'wfire-leave': frame(
    smokeSky() +
      flames(500, 680) +
      car(260, G, 1) +
      arrow([140, 300], [40, 300], { width: 10 }) +
      pill(380, 140, 'Go now'),
  ),
  'wfire-mask': frame(
    front(360, { ...ME, shirt: '#8B6F4E', hairStyle: 'hat', hat: '#5A6B4E' }) +
      mask(360, frontJoints(360).head[1] + 4) +
      `<rect x="${360 - 60}" y="${G - 30}" width="40" height="26" rx="8" fill="#3A2C22"/><rect x="${360 + 20}" y="${G - 30}" width="40" height="26" rx="8" fill="#3A2C22"/>` +
      pill(580, 150, 'Long clothes') +
      pill(580, 250, 'Mask'),
  ),
  'wfire-shut': frame(
    house(300, G, 1.3, { window: false }) +
      `<rect x="390" y="${G - 150}" width="60" height="52" fill="#BFD9EA" stroke="#fff" stroke-width="5"/>` +
      tick(420, G - 124, 22) +
      `<g transform="translate(570,${G - 40})"><rect x="-40" y="-40" width="80" height="80" rx="10" fill="#F4F6F5" stroke="#C9D2CE" stroke-width="4"/><rect x="-6" y="-30" width="12" height="40" rx="6" fill="${C.coral}"/></g>` +
      pill(570, 260, 'Gas off'),
  ),
  'wfire-drive': frame(
    smokeSky(7) +
      `<path d="M 40 ${G} H 680" stroke="#555" stroke-width="40"/>` +
      car(360, G - 10, 1.1) +
      `<path d="M 500 ${G - 70} L 680 ${G - 110} L 680 ${G - 20} Z" fill="${C.sun}" opacity="0.5"/>` +
      pill(360, 120, 'Lights on, go slow'),
  ),
  'wfire-down': frame(
    `<rect x="40" y="${G - 4}" width="640" height="14" fill="#9C7048"/>` +
      flames(40, 160) +
      flames(560, 680) +
      lier(250, G - 20, { ...ME, face: 'closed' }) +
      blanket(270, 520, G - 50, G, '#9CC4DE') +
      pill(360, 120, 'Bare ground'),
  ),
  // ---------------- flood ----------------
  'flood-high': frame(
    `<path d="M 300 ${G} Q 400 230 480 230 L 700 230 L 700 ${G} Z" fill="#B9D3A8"/>` +
      water(G - 50, 40, 400) +
      stander(560, { ...ME, ground: 230, scale: 0.75 }) +
      arrow([300, 330], [460, 230], { width: 10 }) +
      tick(140, 140),
  ),
  'flood-no-walk': frame(
    water(G - 90) +
      `<g stroke="#fff" stroke-width="6" stroke-linecap="round">${[160, 300, 440].map((x) => `<path d="M ${x} ${G - 60} l 50 0 m -16 -10 l 16 10 l -16 10"/>`).join('')}</g>` +
      stander(360, { ...ME, scale: 0.85 }) +
      noSign(360, 220, 150),
  ),
  'flood-no-drive': frame(water(G - 50) + car(360, G - 10, 1.2) + noSign(360, 260, 150)),
  'flood-switch': frame(
    `<rect x="200" y="80" width="320" height="300" rx="16" fill="#E8EEF2" stroke="#B9C4CB" stroke-width="6"/>` +
      [0, 1, 2, 3]
        .map(
          (i) =>
            `<rect x="${240 + i * 64}" y="140" width="40" height="70" rx="8" fill="#fff" stroke="#B9C4CB" stroke-width="4"/>`,
        )
        .join('') +
      `<rect x="260" y="260" width="200" height="90" rx="12" fill="${C.coral}"/><rect x="330" y="290" width="60" height="30" rx="6" fill="#fff"/>` +
      pill(360, 450, 'Only if dry'),
    { noGround: true },
  ),
  'flood-car-out': frame(
    water(G - 40) +
      car(250, G - 10, 1) +
      stander(560, { ...ME, ground: 300, scale: 0.6 }) +
      `<path d="M 470 ${G - 60} Q 500 300 540 300 L 700 300 L 700 ${G} L 470 ${G} Z" fill="#B9D3A8"/>` +
      arrow([380, 300], [500, 240], { width: 8 }),
  ),
  // ---------------- winter ----------------
  'winter-fort': frame(
    `<path d="M 140 ${G} L 360 130 L 580 ${G} Z" fill="#E9A23B"/><path d="M 360 130 V ${G}" stroke="#D18F2C" stroke-width="8"/>` +
      `<path d="M 300 ${G} Q 360 300 420 ${G} Z" fill="#7A5E3A"/>` +
      frontSit(330, { ...ME2, scale: 0.4 }) +
      frontSit(390, { ...KID, scale: 0.34 }) +
      heart(600, 130, 0.8),
  ),
  'winter-drip-a': frame(
    `<rect x="250" y="100" width="40" height="120" fill="${C.metalDark}"/><rect x="230" y="90" width="160" height="30" rx="12" fill="${C.metalDark}"/><rect x="360" y="110" width="30" height="50" rx="8" fill="${C.metalDark}"/>` +
      `<path d="M 375 170 q -8 14 0 22 q 8 -8 0 -22" fill="${C.water}"/>` +
      `<rect x="250" y="${G - 80}" width="240" height="80" rx="16" fill="#F4F6F5" stroke="#C9D2CE" stroke-width="4"/>` +
      snow(8, 3),
  ),
  'winter-drip-b': frame(
    `<rect x="250" y="100" width="40" height="120" fill="${C.metalDark}"/><rect x="230" y="90" width="160" height="30" rx="12" fill="${C.metalDark}"/><rect x="360" y="110" width="30" height="50" rx="8" fill="${C.metalDark}"/>` +
      `<path d="M 375 240 q -8 14 0 22 q 8 -8 0 -22" fill="${C.water}"/><path d="M 375 190 q -6 10 0 16 q 6 -6 0 -16" fill="${C.water}"/>` +
      `<rect x="250" y="${G - 80}" width="240" height="80" rx="16" fill="#F4F6F5" stroke="#C9D2CE" stroke-width="4"/>` +
      snow(8, 3) +
      pill(580, 150, 'Drip'),
  ),
  'winter-car': frame(
    snow(16, 5) +
      `<path d="M 40 ${G} Q 360 ${G - 70} 680 ${G} Z" fill="#fff"/>` +
      car(340, G - 10, 1.2) +
      `<rect x="470" y="${G - 70}" width="30" height="14" rx="6" fill="${C.ink}"/>` +
      `<path d="M 520 ${G - 60} q 40 -10 40 10" stroke="${C.action}" stroke-width="6" fill="none"/>` +
      clock(130, 150, 50, 2) +
      pill(130, 260, '10 min an hour') +
      pill(560, 120, 'Pipe clear'),
  ),
  // ---------------- heat wave ----------------
  'heat-feet': frame(
    sitter(300, {
      ...ME,
      legs: [
        [
          [360, G - 70],
          [410, G - 30],
        ],
        [
          [366, G - 66],
          [418, G - 28],
        ],
      ],
    }) +
      bucket(430, G, { water: true, scale: 0.9, color: '#5B8DBE' }) +
      tick(620, 120),
  ),
  'heat-dawn': frame(
    sun(360, G - 30, 60) +
      `<rect x="40" y="${G}" width="640" height="100" fill="${C.bg}"/>` +
      stander(180, { ...ME2, scale: 0.8 }) +
      stander(560, { ...ME, scale: 0.8, facing: -1 }) +
      pill(360, 120, 'Dawn + dusk'),
  ),
  'heat-salt': frame(
    `<g transform="translate(300,${G})"><path d="M -60 -200 L 60 -200 L 50 0 L -50 0 Z" fill="#EEF7FB" stroke="#9CC4DE" stroke-width="5"/><path d="M -56 -150 L 56 -150 L 50 0 L -50 0 Z" fill="${C.waterLight}"/></g>` +
      sack(500, G, { label: 'salt', scale: 0.8 }) +
      pill(500, 140, 'A pinch'),
  ),
  'heat-check': frame(
    frontSit(200, { ...OLD, scale: 0.85 }) +
      frontSit(360, { ...KID, scale: 0.6 }) +
      `<g transform="translate(520,${G})"><ellipse cx="0" cy="-40" rx="60" ry="34" fill="#C9A06A"/><circle cx="50" cy="-80" r="28" fill="#C9A06A"/><ellipse cx="66" cy="-104" rx="10" ry="18" fill="#A07A48"/></g>` +
      heart(600, 130, 0.8),
  ),
};
