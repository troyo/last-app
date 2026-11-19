// Emergency pictures, part 2: allergy, seizure, snake bite, wounds, rehydration drink, birth.
// Kept calm and never graphic: no blood, no bodies drawn in detail.
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
  forearm,
  blanket,
  cup,
  shake,
  jar,
  bucket,
  pot,
  fire,
  noSign,
  text,
  shade,
  sun,
} from '../kit.mjs';
import { clock, bowl, sack, stone, heart, chair } from '../props.mjs';

const HELP = { shirt: C.forest, skin: SKIN[2], hair: HAIR[2], pants: '#34495E' };
const HURT = { shirt: '#5B8DBE', pants: '#8B6F4E', skin: SKIN[1], hair: HAIR[3] };
const MOM = { shirt: '#9B6FB5', skin: SKIN[0], hair: HAIR[0], hairStyle: 'long', pants: '#4B3F72' };

const patient = (o = {}) => lier(200, 404, { ...HURT, ...o });

// a close-up of a thigh in trousers, seen from the side
const thigh = (o = {}) =>
  `<rect x="60" y="250" width="600" height="130" rx="65" fill="${HURT.pants}"/><path d="M 120 290 h 420" stroke="${shade(HURT.pants, 0.15)}" stroke-width="5" stroke-linecap="round"/>`;

const pen = (x, y, rot, s = 1) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-22" y="-150" width="44" height="150" rx="16" fill="${C.sun}"/><rect x="-22" y="-150" width="44" height="40" rx="14" fill="${C.water}"/><rect x="-14" y="0" width="28" height="22" rx="6" fill="${C.coral}"/></g>`;

const fist = (x, y, s = 1, skin = HELP.skin) =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-40" y="-34" width="80" height="68" rx="26" fill="${skin}" stroke="${shade(skin, 0.25)}" stroke-width="3"/><path d="M 40 -20 v 40" stroke="${shade(skin, 0.3)}" stroke-width="4"/><rect x="-64" y="-20" width="34" height="40" rx="14" fill="${HELP.shirt}"/></g>`;

const pill2 = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s}) rotate(-30)"><rect x="-40" y="-18" width="80" height="36" rx="18" fill="#fff" stroke="#C9D2CE" stroke-width="4"/><rect x="0" y="-18" width="40" height="36" rx="18" fill="#F28DA0"/><rect x="0" y="-18" width="20" height="36" fill="#F28DA0"/></g>`;

const snake = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M -120 0 C -80 -40 -40 40 0 0 C 40 -40 80 40 110 -10" stroke="#8C9A4E" stroke-width="26" fill="none" stroke-linecap="round"/><ellipse cx="124" cy="-18" rx="26" ry="18" fill="#8C9A4E"/><circle cx="132" cy="-24" r="4" fill="${C.ink}"/><path d="M 148 -14 l 16 4 m -16 -4 l 14 -8" stroke="${C.coral}" stroke-width="3"/></g>`;

const baby = (x, y, s = 1, o = {}) =>
  `<g transform="translate(${x},${y}) scale(${s})">${o.wrap ? `<ellipse cx="10" cy="4" rx="60" ry="30" fill="${o.wrap}"/>` : `<ellipse cx="14" cy="4" rx="46" ry="24" fill="#F0B9A0"/>`}<circle cx="-42" cy="-4" r="26" fill="#F0B9A0"/><path d="M -52 -6 q 5 4 10 0" stroke="${C.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>${o.hat ? `<path d="M -68 -6 A 26 26 0 0 1 -30 -26 L -40 -2 Z" fill="${o.hat}"/>` : ''}</g>`;

const glass = (x, y, s = 1, level = 0.75, col = C.waterLight) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M -60 -200 L 60 -200 L 50 0 L -50 0 Z" fill="#EEF7FB" stroke="#9CC4DE" stroke-width="5"/><path d="M ${-60 + 10 * (1 - level)} ${-200 * level} L ${60 - 10 * (1 - level)} ${-200 * level} L 50 0 L -50 0 Z" fill="${col}"/></g>`;

const spoon = (x, y, rot = -30, fill = '#fff') =>
  `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="-6" y="0" width="12" height="110" rx="6" fill="${C.metal}"/><ellipse cx="0" cy="-10" rx="24" ry="16" fill="${C.metal}"/><ellipse cx="0" cy="-14" rx="18" ry="10" fill="${fill}"/></g>`;

const wash = (b) =>
  front(330, {
    ...HELP,
    arms: b
      ? [
          [
            [280, 300],
            [330, 270],
          ],
          [
            [380, 300],
            [350, 276],
          ],
        ]
      : [
          [
            [280, 300],
            [316, 266],
          ],
          [
            [380, 300],
            [344, 266],
          ],
        ],
  }) +
  `<g fill="#fff" stroke="#B9D6E8" stroke-width="3">${(b
    ? [
        [316, 256],
        [340, 246],
        [356, 262],
        [330, 236],
      ]
    : [
        [306, 250],
        [330, 238],
        [352, 250],
        [318, 230],
      ]
  )
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12"/>`)
    .join('')}</g>` +
  `<g transform="translate(470,150) rotate(-50)"><rect x="-40" y="-50" width="80" height="100" rx="16" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="-34" y="-6" width="68" height="50" rx="10" fill="${C.water}"/></g>` +
  `<path d="M 432 176 C 400 196 370 220 352 244" stroke="${C.water}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/>` +
  pill(580, 330, 'Soap');

// --- birth: the mother is always covered by a blanket; nothing is shown in detail ---
const mother = (o = {}) =>
  person({
    head: [200, 300],
    neck: [232, 312],
    hip: [380, 360],
    legs: [
      [[470, 330], [520, 410], 1],
      [[480, 336], [530, 414], 1],
    ],
    arms: [
      [
        [240, 370],
        [220, 400],
      ],
      [
        [270, 360],
        [300, 360],
      ],
    ],
    facing: -1,
    face: 'calm',
    ...MOM,
    ...o,
  }) + `<path d="M 300 330 Q 420 280 560 330 L 560 ${G} L 300 ${G} Z" fill="#9CC4DE"/>`;

export default {
  // ---------------- allergy ----------------
  'allergy-pen-a': frame(
    thigh() +
      pen(360, 210, 0) +
      fist(360, 90, 1) +
      arrow([500, 120], [500, 220]) +
      pill(560, 440, 'Outer thigh'),
    { noGround: true },
  ),
  'allergy-pen-b': frame(
    thigh() + pen(360, 250, 0) + fist(360, 130, 1) + pill(560, 440, 'Count to 10'),
    { noGround: true },
  ),
  'allergy-stinger': frame(
    forearm(80, 470, 330, { skin: HURT.skin, sleeve: HURT.shirt }) +
      `<circle cx="300" cy="312" r="18" fill="#F3B3A3"/><path d="M 300 312 l 0 -26" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>` +
      `<g transform="translate(250,250) rotate(-20)"><rect x="-90" y="-50" width="180" height="70" rx="10" fill="${C.sun}"/></g>` +
      arrow([180, 200], [300, 200], { width: 8 }) +
      pill(560, 140, 'Scrape it'),
    { noGround: true },
  ),
  'allergy-sit': frame(
    `<rect x="190" y="${G - 200}" width="30" height="200" fill="${C.woodDark}"/>` +
      sitter(300, {
        ...HURT,
        face: 'worried',
        head: [320, G - 168],
        neck: [310, G - 132],
        arms: [
          [
            [330, G - 70],
            [370, G - 60],
          ],
          [
            [338, G - 72],
            [380, G - 62],
          ],
        ],
      }) +
      arrow([250, 160], [320, 200], { width: 8, curve: [270, 170] }) +
      pill(560, 140, 'Lean forward'),
  ),
  'allergy-pill': frame(
    sitter(300, {
      ...HURT,
      arms: [
        [
          [316, 340],
          [356, 330],
        ],
        [
          [340, 310],
          [330, 262],
        ],
      ],
    }) +
      pill2(380, 240, 1) +
      cup(470, 360, { water: true, color: C.sun }) +
      tick(600, 120),
  ),
  'allergy-second': frame(
    thigh() +
      pen(220, 220, 0, 0.8) +
      `<rect x="200" y="210" width="40" height="40" rx="8" fill="${C.stoneDark}" opacity="0.6"/>` +
      pen(500, 220, 0) +
      pill(220, 120, '1st') +
      pill(500, 80, '2nd') +
      pill(360, 440, 'After 5 min'),
    { noGround: true },
  ),
  'allergy-stay': frame(
    sitter(260, { ...HURT, face: 'smile' }) +
      frontSit(480, { ...HELP, scale: 0.85 }) +
      clock(600, 120, 50, 4) +
      pill(360, 110, '4 hours'),
  ),
  // ---------------- seizure ----------------
  'seizure-shake-a': frame(
    patient({ face: 'closed' }) +
      shake(240, 380) +
      shake(420, 380) +
      noSign(560, 150, 70) +
      `<g transform="translate(560,150)">${handTop(0, 30, { scale: 0.5, skin: HELP.skin })}</g>`,
  ),
  'seizure-shake-b': frame(
    patient({ face: 'closed', head: [166, 396] }) +
      shake(250, 372) +
      shake(430, 372) +
      noSign(560, 150, 70) +
      `<g transform="translate(560,150)">${handTop(0, 30, { scale: 0.5, skin: HELP.skin })}</g>`,
  ),
  'seizure-clear': frame(
    patient() +
      `<g transform="translate(560,${G - 30})"><rect x="-50" y="-60" width="100" height="60" rx="8" fill="${C.wood}"/><rect x="-40" y="0" width="12" height="30" fill="${C.woodDark}"/><rect x="28" y="0" width="12" height="30" fill="${C.woodDark}"/></g>` +
      `<g transform="translate(140,250) rotate(-30)"><rect x="-6" y="-50" width="12" height="70" rx="5" fill="${C.metal}"/><rect x="-10" y="20" width="20" height="40" rx="6" fill="${C.woodDark}"/></g>` +
      arrow([480, 360], [620, 300], { width: 8, curve: [560, 360] }) +
      arrow([170, 290], [80, 200], { width: 8 }),
  ),
  'seizure-pillow': frame(
    patient() +
      `<rect x="120" y="402" width="110" height="28" rx="12" fill="#E07B39"/>` +
      arrow([175, 300], [175, 380], { width: 8 }) +
      tick(600, 120) +
      pill(400, 140, 'Soft'),
  ),
  'seizure-time': frame(patient() + clock(500, 170, 80, 1) + pill(500, 300, '5 min')),
  'seizure-no-mouth': frame(
    `<g transform="translate(360,240)"><circle cx="0" cy="0" r="110" fill="${HURT.skin}"/><path d="M -40 40 q 40 24 80 0" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M -46 -16 q 8 6 16 0 M 30 -16 q 8 6 16 0" stroke="${C.ink}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M -110 -20 A 110 110 0 0 1 110 -30 Q 40 -90 -60 -80 Z" fill="${HURT.hair}"/></g>` +
      `<g transform="translate(520,330) rotate(-35)"><rect x="-8" y="-90" width="16" height="140" rx="6" fill="${C.wood}"/></g>` +
      cross(560, 160),
    { noGround: true },
  ),
  'seizure-stay': frame(patient({ face: 'calm' }) + crouchHelper() + heart(560, 140, 0.9)),
  // ---------------- snake bite ----------------
  'snake-away': frame(
    snake(200, G - 30, 0.9) +
      stander(500, { ...HURT, face: 'worried' }) +
      arrow([560, 330], [660, 330], { width: 8 }) +
      cross(200, 300),
  ),
  'snake-still': frame(
    patient({ face: 'calm' }) +
      `<rect x="340" y="420" width="10" height="0"/>` +
      pill(400, 140, 'Stay still') +
      tick(600, 120),
  ),
  'snake-mark': frame(
    forearm(80, 470, 330, { skin: HURT.skin, sleeve: HURT.shirt }) +
      `<ellipse cx="320" cy="330" rx="70" ry="24" fill="#F3C1B2"/><circle cx="314" cy="326" r="4" fill="#B25A49"/><circle cx="328" cy="328" r="4" fill="#B25A49"/>` +
      `<ellipse cx="320" cy="330" rx="74" ry="28" fill="none" stroke="${C.ink}" stroke-width="4" stroke-dasharray="10 8"/>` +
      `<g transform="translate(470,210) rotate(40)"><rect x="-10" y="-80" width="20" height="100" rx="6" fill="${C.ink}"/><path d="M -10 20 L 0 40 L 10 20 Z" fill="${C.ink}"/></g>` +
      pill(560, 130, '2:15 pm') +
      pill(200, 440, 'Every 30 min'),
    { noGround: true },
  ),
  'snake-no-cut': frame(
    `<g transform="translate(160,270) rotate(-30)"><rect x="-8" y="-80" width="16" height="100" rx="4" fill="${C.metal}"/><rect x="-12" y="20" width="24" height="60" rx="8" fill="${C.woodDark}"/></g>` +
      `<g transform="translate(360,270)"><rect x="-50" y="-50" width="100" height="100" rx="18" fill="#D6EEFA" stroke="#9CC4DE" stroke-width="6"/></g>` +
      `<g transform="translate(560,270)"><rect x="-80" y="-14" width="160" height="28" rx="10" fill="${C.ink}"/><rect x="-12" y="-24" width="24" height="48" rx="6" fill="${C.metal}"/></g>` +
      cross(200, 170) +
      cross(400, 170) +
      cross(610, 170) +
      text(160, 400, 'Cut', { size: 40 }) +
      text(360, 400, 'Ice', { size: 40 }) +
      text(560, 400, 'Tie', { size: 40 }),
    { blob: false, noGround: true },
  ),
  'snake-carry': frame(
    stander(170, {
      ...HELP,
      arms: [
        [
          [200, 260],
          [250, 300],
        ],
        [
          [210, 250],
          [260, 290],
        ],
      ],
    }) +
      stander(560, {
        ...HELP,
        shirt: '#E07B39',
        skin: SKIN[1],
        hair: HAIR[4],
        hairStyle: 'long',
        facing: -1,
        arms: [
          [
            [530, 260],
            [470, 300],
          ],
          [
            [520, 250],
            [460, 290],
          ],
        ],
      }) +
      `<rect x="230" y="290" width="270" height="20" rx="8" fill="${C.wood}"/>` +
      lier(270, 268, { ...HURT, face: 'calm', scale: 0.8 }) +
      tick(360, 110),
  ),
  // ---------------- wound ----------------
  'wash-hands-a': frame(wash(false)),
  'wash-hands-b': frame(wash(true)),
  'wound-rinse-a': frame(
    forearm(80, 470, 340, { skin: HURT.skin, sleeve: HURT.shirt }) +
      `<path d="M 290 330 l 50 -6" stroke="#D88A7A" stroke-width="6" stroke-linecap="round"/>` +
      `<g transform="translate(400,150) rotate(-30)"><rect x="-34" y="-60" width="68" height="110" rx="18" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="-14" y="-80" width="28" height="24" rx="6" fill="#8FB7C9"/></g>`,
    { noGround: true },
  ),
  'wound-rinse-b': frame(
    forearm(80, 470, 340, { skin: HURT.skin, sleeve: HURT.shirt }) +
      `<path d="M 290 330 l 50 -6" stroke="#D88A7A" stroke-width="6" stroke-linecap="round"/>` +
      `<g transform="translate(400,150) rotate(-60)"><rect x="-34" y="-60" width="68" height="110" rx="18" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="-14" y="-80" width="28" height="24" rx="6" fill="#8FB7C9"/></g>` +
      `<path d="M 340 180 C 330 230 322 280 318 318" stroke="${C.water}" stroke-width="12" fill="none" stroke-linecap="round"/>` +
      [0, 1, 2]
        .map(
          (i) =>
            `<circle cx="${290 + i * 30}" cy="${396 + (i % 2) * 10}" r="7" fill="${C.water}"/>`,
        )
        .join('') +
      tick(140, 140),
    { noGround: true },
  ),
  'wound-tweezers': frame(
    forearm(80, 470, 340, { skin: HURT.skin, sleeve: HURT.shirt }) +
      `<path d="M 290 330 l 50 -6" stroke="#D88A7A" stroke-width="6" stroke-linecap="round"/>` +
      `<g transform="translate(330,250) rotate(20)"><path d="M -6 70 L -14 -80 M 6 70 L 14 -80" stroke="${C.metalDark}" stroke-width="10" stroke-linecap="round"/></g>` +
      `<circle cx="345" cy="322" r="5" fill="${C.ink}"/>` +
      zoom(
        570,
        150,
        80,
        `<rect x="-120" y="-120" width="240" height="240" fill="${HURT.skin}"/><circle cx="0" cy="10" r="18" fill="#555"/><path d="M -20 -20 L -8 -100 M 20 -20 L 8 -100" stroke="${C.metalDark}" stroke-width="12" stroke-linecap="round"/>`,
        { from: [345, 322] },
      ),
    { noGround: true },
  ),
  'wound-ointment': frame(
    forearm(80, 470, 340, { skin: HURT.skin, sleeve: HURT.shirt }) +
      `<ellipse cx="315" cy="328" rx="44" ry="12" fill="#FFF3C4" opacity="0.95"/>` +
      `<g transform="translate(480,180) rotate(-30)"><rect x="-90" y="-26" width="160" height="52" rx="14" fill="#fff" stroke="#C9D2CE" stroke-width="4"/><rect x="70" y="-14" width="30" height="28" rx="6" fill="${C.coral}"/></g>` +
      pill(200, 140, 'Thin layer'),
    { noGround: true },
  ),
  'wound-cover': frame(
    forearm(80, 470, 340, { skin: HURT.skin, sleeve: HURT.shirt }) +
      `<rect x="250" y="302" width="130" height="76" rx="14" fill="#fff" stroke="#D5DCD8" stroke-width="4"/><rect x="230" y="318" width="24" height="44" fill="#F3E5C3"/><rect x="376" y="318" width="24" height="44" fill="#F3E5C3"/>` +
      tick(600, 140),
    { noGround: true },
  ),
  'wound-check': frame(
    forearm(80, 470, 340, { skin: HURT.skin, sleeve: HURT.shirt }) +
      `<ellipse cx="315" cy="330" rx="60" ry="22" fill="#F3C1B2"/><ellipse cx="315" cy="330" rx="64" ry="26" fill="none" stroke="${C.ink}" stroke-width="4" stroke-dasharray="10 8"/>` +
      pill(200, 140, 'Every day') +
      pill(520, 140, 'Bigger? Act'),
    { noGround: true },
  ),
  'wound-no-alcohol': frame(
    `<g transform="translate(240,280)"><rect x="-50" y="-90" width="100" height="160" rx="20" fill="#B9D9C2"/><rect x="-20" y="-120" width="40" height="34" rx="6" fill="${C.ink}"/></g>` +
      `<g transform="translate(480,280)"><rect x="-50" y="-90" width="100" height="160" rx="20" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="-44" y="-30" width="88" height="94" rx="14" fill="${C.water}"/></g>` +
      cross(290, 170) +
      tick(530, 170) +
      text(240, 420, 'Alcohol', { size: 40 }) +
      text(480, 420, 'Water', { size: 40 }),
    { blob: false, noGround: true },
  ),
  // ---------------- rehydration drink ----------------
  'ors-water': frame(glass(360, G, 1.2) + pill(560, 140, '1 liter') + pill(560, 220, '4 cups')),
  'ors-sugar': frame(
    glass(300, G, 1.1) +
      spoon(470, 260, -30) +
      sack(580, G, { label: 'sugar', scale: 0.8 }) +
      pill(470, 110, '6 level tsp'),
  ),
  'ors-salt': frame(
    glass(300, G, 1.1) +
      spoon(470, 260, -30) +
      sack(580, G, { label: 'salt', scale: 0.8 }) +
      pill(470, 110, '½ tsp only'),
  ),
  'ors-stir-a': frame(
    glass(360, G, 1.2, 0.75, '#D5E9F5') +
      `<rect x="380" y="80" width="12" height="240" rx="6" fill="${C.metal}" transform="rotate(10 386 200)"/>` +
      arrow([450, 220], [270, 220], { curve: [360, 290], width: 8 }),
  ),
  'ors-stir-b': frame(
    glass(360, G, 1.2, 0.75) +
      `<rect x="330" y="80" width="12" height="240" rx="6" fill="${C.metal}" transform="rotate(-10 336 200)"/>` +
      pill(560, 140, 'Clear') +
      tick(160, 140),
  ),
  'ors-wait': frame(
    sitter(260, { ...HURT, face: 'worried' }) + clock(520, 200, 80, 2) + pill(520, 340, '10 min'),
  ),
  'ors-pee': frame(
    glass(260, G, 1, 0.6, '#F6E58C') +
      glass(460, G, 1, 0.6, '#E0A43A') +
      tick(310, 160) +
      cross(510, 160) +
      text(260, 140, '', {}) +
      pill(360, 90, 'Pale yellow'),
  ),
  'ors-fresh': frame(glass(300, G, 1.1) + sun(520, 160, 50) + pill(520, 320, 'Every day')),
  // ---------------- birth ----------------
  'birth-kit': frame(
    `<rect x="120" y="${G - 30}" width="480" height="30" rx="8" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="4"/>` +
      `<rect x="150" y="${G - 90}" width="140" height="60" rx="10" fill="#fff" stroke="#D5DCD8" stroke-width="4"/><rect x="160" y="${G - 130}" width="120" height="40" rx="10" fill="#9CC4DE"/>` +
      `<path d="M 340 ${G - 50} q 30 -30 60 0 M 350 ${G - 70} q 30 -30 60 0" stroke="${C.ink}" stroke-width="5" fill="none"/>` +
      `<g transform="translate(500,${G - 60}) rotate(-15)"><rect x="-50" y="-8" width="80" height="16" rx="4" fill="${C.metal}"/><rect x="30" y="-12" width="40" height="24" rx="8" fill="${C.woodDark}"/></g>` +
      pill(200, 250, 'Towels') +
      pill(380, 120, '2 strings') +
      pill(560, 250, 'Clean blade'),
  ),
  'birth-pos': frame(
    mother() +
      `<path d="M 300 ${G} h 300" stroke="${C.cloth}" stroke-width="14"/>` +
      pill(400, 120, 'Her choice') +
      tick(620, 120),
  ),
  'birth-gentle': frame(
    mother({ face: 'open' }) +
      `<g stroke="${C.water}" stroke-width="6" fill="none" stroke-linecap="round"><path d="M 166 296 q -14 -8 -12 -22"/><path d="M 150 306 q -20 -6 -22 -26"/></g>` +
      pill(400, 120, 'Pant, push gently'),
  ),
  'birth-catch': frame(
    mother() +
      crouchHelperAt(640) +
      baby(560, 300, 1.1) +
      `<path d="M 470 330 h 140" stroke="${C.cloth}" stroke-width="18" stroke-linecap="round"/>` +
      pill(360, 110, 'Both hands'),
  ),
  'birth-dry-a': frame(
    baby(360, 300, 2) +
      `<path d="M 260 280 Q 360 200 470 280" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="4"/>` +
      pill(360, 110, 'Dry right away'),
  ),
  'birth-dry-b': frame(
    baby(360, 300, 2) +
      handTop(400, 270, { skin: HELP.skin, scale: 0.9, rot: 90 }) +
      shake(400, 250) +
      `<g stroke="${C.coral}" stroke-width="6" fill="none" stroke-linecap="round"><path d="M 220 260 q -16 -14 -8 -30"/><path d="M 200 280 q -24 -14 -20 -40"/></g>`,
  ),
  'birth-skin': frame(
    lier(200, 404, { ...MOM, face: 'smile' }) +
      baby(330, 360, 0.9, { hat: '#E07B39' }) +
      blanket(280, 560, 360, 432, '#E9A23B') +
      heart(560, 140, 1),
  ),
  'birth-cord': frame(
    `<path d="M 120 280 C 260 220 420 340 600 270" stroke="#C9A0B5" stroke-width="24" fill="none" stroke-linecap="round"/>` +
      `<path d="M 300 254 v 60 M 400 284 v 60" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/>` +
      `<path d="M 350 200 v 40" stroke="${C.coral}" stroke-width="6" stroke-dasharray="6 8"/>` +
      pill(350, 130, 'Cut between') +
      pill(160, 420, 'Baby side') +
      baby(80, 300, 0.8),
    { noGround: true },
  ),
  'birth-wait': frame(
    lier(200, 404, { ...MOM, face: 'calm' }) +
      blanket(240, 560, 360, 432, '#9CC4DE') +
      clock(560, 160, 70, 6) +
      pill(560, 280, '½ hour'),
  ),
  'birth-rub-a': frame(
    lier(200, 404, { ...MOM, face: 'calm' }) +
      blanket(320, 560, 370, 432, '#9CC4DE') +
      handTop(300, 370, { skin: HELP.skin, scale: 0.8, rot: 90 }) +
      arrow([240, 300], [360, 300], { curve: [300, 250], width: 8 }),
  ),
  'birth-rub-b': frame(
    lier(200, 404, { ...MOM, face: 'calm' }) +
      blanket(320, 560, 370, 432, '#9CC4DE') +
      handTop(320, 370, { skin: HELP.skin, scale: 0.8, rot: 90 }) +
      arrow([380, 300], [260, 300], { curve: [320, 250], width: 8 }) +
      pill(560, 160, 'Firm'),
  ),
};

function crouchHelper() {
  return person({
    head: [280, 290],
    neck: [300, 316],
    hip: [380, 360],
    legs: [
      [[400, 410], [460, 424], 1],
      [[410, 412], [470, 426], 1],
    ],
    arms: [
      [
        [300, 380],
        [280, 400],
      ],
      [
        [320, 380],
        [340, 404],
      ],
    ],
    facing: -1,
    ...HELP,
  });
}

function crouchHelperAt(x) {
  return person({
    head: [x - 40, 250],
    neck: [x - 20, 282],
    hip: [x, 362],
    legs: [
      [[x - 30, 410], [x + 30, 424], -1],
      [[x - 20, 412], [x + 40, 426], -1],
    ],
    arms: [
      [
        [x - 60, 330],
        [x - 90, 312],
      ],
      [
        [x - 50, 340],
        [x - 84, 324],
      ],
    ],
    facing: -1,
    ...HELP,
  });
}
