// Emergency pictures: CPR, bleeding, choking, burns, bones, heat, cold.
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
  sitter,
  arrow,
  tick,
  cross,
  pill,
  zoom,
  handTop,
  forearm,
  frontSit,
  blanket,
  cup,
  shake,
  snow,
  wind,
  house,
  tree,
  sun,
  noSign,
  text,
  shade,
} from '../kit.mjs';

// The same two people throughout: the helper (green) and the person who is hurt (blue).
const HELP = { shirt: C.forest, skin: SKIN[2], hair: HAIR[2], pants: '#34495E' };
const HURT = { shirt: '#5B8DBE', pants: '#8B6F4E', skin: SKIN[1], hair: HAIR[3] };

const patient = (o = {}) => lier(200, 404, { ...HURT, ...o });

// ---------------- CPR ----------------
const pusher = (d, parts) =>
  person({
    head: [268, 206 + d],
    neck: [286, 244 + d],
    hip: [368, 330],
    legs: [
      [[350, 396], [440, 404], 1],
      [[358, 398], [448, 406], 1],
    ],
    arms: [
      [
        [278, 314 + d / 2],
        [262, 378 + d / 3],
      ],
      [
        [284, 314 + d / 2],
        [266, 380 + d / 3],
      ],
    ],
    facing: -1,
    parts,
    ...HELP,
  });
const cpr = (d) => pusher(d, 'body') + patient() + pusher(d, 'arms');

const chestClose = `
  <rect x="-110" y="-120" width="220" height="260" rx="60" fill="${HURT.shirt}"/>
  <path d="M -34 -112 Q 0 -78 34 -112" stroke="#3F6E9C" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M 0 -70 L 0 90" stroke="#3F6E9C" stroke-width="5" stroke-dasharray="4 12" stroke-linecap="round"/>
  ${handTop(0, 34, { skin: shade(SKIN[2], 0.12), scale: 0.85, rot: 6 })}
  ${handTop(6, 20, { skin: SKIN[2], scale: 0.85, rot: -4 })}
`;

const breather = (up, parts) =>
  person({
    head: up ? [222, 296] : [206, 330],
    neck: up ? [250, 318] : [240, 342],
    hip: [330, 330],
    legs: [
      [[318, 398], [408, 406], 1],
      [[326, 400], [416, 408], 1],
    ],
    arms: up
      ? [
          [
            [214, 360],
            [176, 388],
          ],
          [
            [240, 370],
            [262, 398],
          ],
        ]
      : [
          [
            [214, 380],
            [172, 384],
          ],
          [
            [226, 386],
            [150, 400],
          ],
        ],
    facing: -1,
    parts,
    ...HELP,
    face: up ? 'calm' : 'calm',
  });

const shout = () => {
  const j = { x: 300 };
  return (
    patient({ legs: undefined }) +
    person({
      head: [224, 250],
      neck: [244, 286],
      hip: [300, 352],
      legs: [
        [[290, 410], [370, 414], 1],
        [[296, 412], [378, 416], 1],
      ],
      arms: [
        [
          [216, 330],
          [206, 372],
        ],
        [
          [250, 300],
          [206, 262],
        ],
      ],
      facing: -1,
      face: 'open',
      ...HELP,
    }) +
    `<g stroke="${C.coral}" stroke-width="7" stroke-linecap="round" fill="none"><path d="M 176 236 q -14 -16 -4 -36"/><path d="M 156 248 q -24 -14 -20 -42"/><path d="M 136 262 q -32 -12 -32 -50"/></g>` +
    pill(500, 140, 'Help!', { size: 48 }) +
    stander(620, {
      facing: -1,
      shirt: '#E07B39',
      skin: SKIN[0],
      hair: HAIR[4],
      hairStyle: 'long',
      pants: '#4B3F72',
      scale: 0.8,
    }) +
    arrow([600, 260], [520, 270], { width: 8 }) +
    (j ? '' : '')
  );
};

// ---------------- bleeding ----------------
// A close-up: their arm lies flat, the helper's two hands press a cloth on it from above.
const pressArm = (d, more) => {
  const y = 350;
  const top = y - 50 + d;
  return (
    forearm(60, 520, y, { skin: HURT.skin, sleeve: HURT.shirt }) +
    `<rect x="250" y="${y - 40}" width="170" height="70" rx="14" fill="#fff" stroke="#D5DCD8" stroke-width="4"/>` +
    (more
      ? `<rect x="240" y="${y - 58 + d}" width="190" height="34" rx="12" fill="#F6E7B2" stroke="#E2CC7E" stroke-width="4"/>`
      : '') +
    // helper arms come down from the top right
    `<path d="M 700 120 L 520 ${top - 60} L 380 ${top - 8}" stroke="${shade(C.forest, 0.15)}" stroke-width="34" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M 690 30 L 470 ${top - 110} L 360 ${top - 20}" stroke="${C.forest}" stroke-width="34" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<rect x="268" y="${top - 18}" width="130" height="46" rx="23" fill="${shade(HELP.skin, 0.14)}"/>` +
    `<rect x="290" y="${top - 30}" width="130" height="46" rx="23" fill="${HELP.skin}"/>` +
    `<path d="M 304 ${top - 16} h 26 M 300 ${top - 2} h 30" stroke="${shade(HELP.skin, 0.28)}" stroke-width="4" stroke-linecap="round"/>`
  );
};

const tourniquet = () => {
  const y = 300;
  // a leg seen from the side, lying flat, foot at the right
  return frame(
    `<rect x="20" y="${y - 50}" width="560" height="100" rx="50" fill="${HURT.skin}"/>` +
      `<rect x="-20" y="${y - 58}" width="200" height="116" rx="56" fill="${HURT.pants}"/>` +
      `<path d="M 560 ${y - 50} q 70 -10 90 30 q 10 40 -30 70 l -60 0 z" fill="${HURT.skin}"/>` +
      `<ellipse cx="460" cy="${y - 6}" rx="44" ry="20" fill="#E79A8C"/>` +
      `<ellipse cx="460" cy="${y - 6}" rx="22" ry="8" fill="#C9614F"/>` +
      // band and stick
      `<rect x="300" y="${y - 62}" width="34" height="124" rx="10" fill="${C.ink}"/>` +
      `<rect x="250" y="${y - 76}" width="140" height="22" rx="11" fill="${C.wood}" transform="rotate(-28 317 ${y - 64})"/>` +
      arrow([270, 140], [360, 140], { curve: [315, 100] }) +
      `<path d="M 334 ${y + 80} L 438 ${y + 80}" stroke="${C.ink}" stroke-width="5"/><path d="M 334 ${y + 66} v 28 M 438 ${y + 66} v 28" stroke="${C.ink}" stroke-width="5"/>` +
      pill(386, y + 128, '2–3 inches') +
      pill(150, 110, 'Twist') +
      pill(560, 110, 'Note the time') +
      pill(140, 440, '← body'),
    { blob: false, noGround: true },
  );
};

// ---------------- choking ----------------
// The person choking leans forward, facing left. The helper stands behind them.
const choker = (o = {}) =>
  person({
    head: [214, 232],
    neck: [244, 252],
    hip: [318, 300],
    legs: [
      [[300, 362], [298, 422], -1],
      [[312, 364], [318, 424], -1],
    ],
    arms: [
      [
        [218, 302],
        [204, 344],
      ],
      [
        [226, 300],
        [212, 268],
      ],
    ],
    facing: -1,
    face: 'worried',
    ...HURT,
    ...o,
  });

const slapper = (hit) =>
  person({
    head: [414, 160],
    neck: [420, 196],
    hip: [424, 314],
    legs: [
      [[420, 372], [414, 424], -1],
      [[430, 372], [432, 426], -1],
    ],
    arms: [
      [
        [404, 258],
        [372, 296],
      ],
      hit
        ? [
            [360, 230],
            [300, 250],
          ]
        : [
            [372, 188],
            [346, 130],
          ],
    ],
    facing: -1,
    ...HELP,
  });

const thruster = (up, parts) =>
  person({
    head: [356, 150],
    neck: [352, 188],
    hip: [356, 306],
    legs: [
      [[350, 366], [352, 424], -1],
      [[362, 366], [372, 426], -1],
    ],
    arms: [
      [
        [310, 250],
        [276 - (up ? 8 : 0), 278 - (up ? 18 : 0)],
      ],
      [
        [318, 258],
        [280 - (up ? 8 : 0), 284 - (up ? 18 : 0)],
      ],
    ],
    facing: -1,
    parts,
    ...HELP,
  });
const chokeUpright = (o = {}) =>
  person({
    head: [284, 162],
    neck: [296, 198],
    hip: [306, 308],
    legs: [
      [[300, 366], [296, 424], -1],
      [[310, 366], [312, 426], -1],
    ],
    arms: [
      [
        [288, 262],
        [270, 300],
      ],
      [
        [296, 260],
        [282, 306],
      ],
    ],
    facing: -1,
    face: 'worried',
    ...HURT,
    ...o,
  });

const fistClose = `
  <rect x="-130" y="-130" width="260" height="260" fill="${HURT.shirt}"/>
  <circle cx="0" cy="58" r="9" fill="#3F6E9C"/>
  <rect x="-44" y="-26" width="88" height="62" rx="24" fill="${HELP.skin}" stroke="${shade(HELP.skin, 0.25)}" stroke-width="3"/>
  <path d="M -22 -24 v 56 M 0 -24 v 56 M 22 -24 v 56" stroke="${shade(HELP.skin, 0.3)}" stroke-width="4"/>
  ${arrow([0, 80], [0, 112], { width: 0 })}
`;

// ---------------- burns ----------------
const burnArm = (pour) =>
  forearm(60, 480, 350, { skin: HURT.skin, sleeve: HURT.shirt }) +
  `<ellipse cx="330" cy="338" rx="62" ry="18" fill="#F2A493" opacity="0.9"/>` +
  `<g transform="translate(${pour ? 360 : 380},${pour ? 120 : 110}) rotate(${pour ? -38 : -18})"><rect x="-50" y="-60" width="100" height="120" rx="18" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="-44" y="-20" width="88" height="74" rx="12" fill="${C.water}"/><path d="M 50 -30 q 34 0 34 30 q 0 30 -34 30" stroke="#8FB7C9" stroke-width="8" fill="none"/></g>` +
  (pour
    ? `<path d="M 318 158 C 312 220 330 260 330 318" stroke="${C.water}" stroke-width="22" fill="none" stroke-linecap="round" opacity="0.9"/>` +
      [0, 1, 2, 3]
        .map(
          (i) =>
            `<circle cx="${270 + i * 40}" cy="${398 + (i % 2) * 12}" r="7" fill="${C.water}"/>`,
        )
        .join('')
    : '');

// ---------------- sitting and sipping ----------------
const sipper = (up, o = {}) =>
  sitter(300, {
    ...HURT,
    arms: [
      [
        [316, 340],
        [356, 330],
      ],
      up
        ? [
            [340, 310],
            [326, 262],
          ]
        : [
            [336, 344],
            [372, 316],
          ],
    ],
    ...o,
  }) + cup(up ? 334 : 382, up ? 270 : 314, { rot: up ? -50 : 0, water: !up, color: C.sun });

// ---------------- bones ----------------
const splintArm = (cold) =>
  `<rect x="90" y="378" width="460" height="22" rx="8" fill="${C.wood}"/>` +
  `<rect x="100" y="364" width="440" height="16" rx="8" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="3"/>` +
  forearm(60, 500, 326, { skin: HURT.skin, sleeve: HURT.shirt }) +
  [170, 330, 470]
    .map((x) => `<rect x="${x - 14}" y="282" width="28" height="122" rx="10" fill="${C.forest}"/>`)
    .join('') +
  (cold
    ? `<g transform="translate(330,250)"><rect x="-70" y="-30" width="140" height="58" rx="22" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="4"/><rect x="-46" y="-22" width="92" height="40" rx="14" fill="#BFE3F7"/><path d="M -30 -8 l 12 12 M 6 -12 l 14 14" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`
    : '');

const slingPerson = () => {
  const x = 360;
  const j = frontJoints(x);
  return (
    front(x, {
      ...HURT,
      arms: [
        [
          [x - 52, j.shY + 70],
          [x - 54, j.shY + 128],
        ],
        [
          [x + 50, j.shY + 92],
          [x - 26, j.shY + 86],
        ],
      ],
    }) +
    // the sling: a strap round the neck and a cradle under the forearm
    `<path d="M ${x + 26} ${j.shY - 4} L ${x + 56} ${j.shY + 84}" stroke="${C.sun}" stroke-width="16" stroke-linecap="round"/>` +
    `<path d="M ${x - 26} ${j.shY - 4} L ${x - 44} ${j.shY + 70}" stroke="${C.sun}" stroke-width="16" stroke-linecap="round"/>` +
    `<path d="M ${x - 50} ${j.shY + 70} L ${x + 64} ${j.shY + 80} L ${x + 50} ${j.shY + 124} L ${x - 42} ${j.shY + 108} Z" fill="${C.sun}" stroke="${shade(C.sun, 0.18)}" stroke-width="5" stroke-linejoin="round"/>` +
    `<circle cx="${x - 30}" cy="${j.shY + 86}" r="11" fill="${HURT.skin}"/>` +
    '' +
    tick(570, 150)
  );
};

// ---------------- heat ----------------
const shadeTree = (body) =>
  sun(610, 90, 38) +
  `<ellipse cx="300" cy="${G + 4}" rx="190" ry="20" fill="rgba(18,56,45,0.16)"/>` +
  tree(300, G, 1.25).replace(/<rect/, '<rect') +
  body;

const heatLier = (o = {}) => lier(190, 404, { ...HURT, face: 'closed', ...o });

const wetCloth = (x, y, r = 0) =>
  `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 30}" y="${y - 14}" width="60" height="28" rx="9" fill="#9CCBF0" stroke="${C.water}" stroke-width="4"/><path d="M ${x - 4} ${y + 18} q -4 8 0 14 q 4 -6 0 -14" fill="${C.water}"/></g>`;

// ---------------- cold ----------------
const shirtIcon = (x, y, col, wet) =>
  `<path d="M ${x - 60} ${y - 70} L ${x - 24} ${y - 84} Q ${x} ${y - 66} ${x + 24} ${y - 84} L ${x + 60} ${y - 70} L ${x + 84} ${y - 26} L ${x + 54} ${y - 14} L ${x + 50} ${y + 70} L ${x - 50} ${y + 70} L ${x - 54} ${y - 14} L ${x - 84} ${y - 26} Z" fill="${col}"/>` +
  (wet
    ? [
        [-24, 82],
        [6, 92],
        [34, 80],
      ]
        .map(
          ([dx, dy]) =>
            `<path d="M ${x + dx} ${y + dy} q -7 12 0 18 q 7 -6 0 -18" fill="${C.water}"/>`,
        )
        .join('') +
      `<path d="M ${x - 40} ${y + 10} q 20 -10 40 0 q 20 10 40 0" stroke="${shade(col, 0.25)}" stroke-width="6" fill="none"/>`
    : '');

const wrapped = (o = {}) =>
  lier(210, 404, { ...HURT, face: 'closed', ...o }) +
  blanket(200, 520, 370, 432, '#E9A23B') +
  `<path d="M 176 376 A 26 26 0 0 0 176 428 Z" fill="#D9482F"/><circle cx="146" cy="402" r="9" fill="#F6B93B"/>`;

const warmSitter = (up) => {
  const x = 330;
  const g = G;
  return (
    frontSit(x, {
      ...HURT,
      face: up ? 'closed' : 'smile',
      arms: up
        ? [
            [
              [x - 40, g - 70],
              [x - 12, g - 150],
            ],
            [
              [x + 40, g - 70],
              [x + 12, g - 150],
            ],
          ]
        : [
            [
              [x - 44, g - 60],
              [x - 14, g - 80],
            ],
            [
              [x + 44, g - 60],
              [x + 14, g - 80],
            ],
          ],
    }) +
    `<path d="M ${x - 80} 430 L ${x - 64} ${g - 150} Q ${x - 50} ${g - 172} ${x - 26} ${g - 160} L ${x - 30} 430 Z" fill="#E9A23B"/>` +
    `<path d="M ${x + 80} 430 L ${x + 64} ${g - 150} Q ${x + 50} ${g - 172} ${x + 26} ${g - 160} L ${x + 30} 430 Z" fill="#E9A23B"/>` +
    cup(x + 4, up ? g - 156 : g - 52, { steam: !up, color: C.coral, scale: 1.1 })
  );
};

export default {
  // CPR
  'cpr-shout': frame(shout()),
  'lay-flat': frame(patient() + tick(600, 120) + '' + ''),
  'lay-warm': frame(patient() + blanket(230, 520, 372, 432, '#E9A23B') + tick(600, 120) + ''),
  'cpr-push-a': frame(cpr(0) + zoom(590, 140, 90, chestClose, { from: [264, 386] }) + ''),
  'cpr-push-b': frame(
    cpr(18) +
      arrow([190, 120], [190, 236]) +
      pill(540, 120, '2 a second') +
      pill(540, 200, '2 inches deep'),
  ),
  'cpr-breath-a': frame(
    breather(false, 'body') +
      patient() +
      breather(false, 'arms') +
      `<g stroke="${C.water}" stroke-width="6" fill="none" stroke-linecap="round"><path d="M 176 352 q -12 -10 -6 -24"/><path d="M 160 346 q -14 -14 -6 -32"/></g>` +
      '' +
      pill(540, 120, '2 breaths'),
  ),
  'cpr-breath-b': frame(
    breather(true, 'body') +
      patient() +
      breather(true, 'arms') +
      `<path d="M 230 380 Q 270 352 320 380" fill="${HURT.shirt}"/>` +
      arrow([275, 300], [275, 240], { width: 8 }) +
      pill(540, 120, 'Chest rises'),
  ),
  // the three "diagrams" shown on the cards
  'diagram-cpr': frame(
    `<rect x="160" y="40" width="400" height="520" rx="140" fill="${HURT.shirt}"/>` +
      `<circle cx="360" cy="10" r="70" fill="${HURT.skin}"/>` +
      `<path d="M 300 70 Q 360 120 420 70" stroke="#3F6E9C" stroke-width="12" fill="none" stroke-linecap="round"/>` +
      `<path d="M 360 120 L 360 470" stroke="#3F6E9C" stroke-width="7" stroke-dasharray="5 16" stroke-linecap="round"/>` +
      handTop(360, 300, { skin: shade(SKIN[2], 0.12), scale: 1.25, rot: 6 }) +
      handTop(368, 282, { skin: SKIN[2], scale: 1.25, rot: -4 }) +
      pill(150, 120, 'Center') +
      arrow([150, 160], [250, 250], { width: 7, curve: [170, 240] }) +
      '' +
      '',
    { blob: false, noGround: true },
  ),
  'diagram-tourniquet': tourniquet(),
  'diagram-recovery': frame(
    // on their side, top knee bent forward, hand under the cheek
    person({
      head: [170, 372],
      neck: [206, 380],
      hip: [380, 382],
      legs: [
        [[480, 390], [580, 396], 1],
        [[450, 424], [540, 400], 1],
      ],
      arms: [
        [
          [150, 424],
          [96, 422],
        ],
        [
          [220, 430],
          [150, 410],
        ],
      ],
      facing: -1,
      face: 'closed',
      ...HURT,
    }) +
      arrow([110, 300], [140, 352], { width: 7, curve: [100, 330] }) +
      pill(170, 230, 'Head back') +
      '' +
      pill(560, 290, 'Knee bent') +
      tick(620, 110),
  ),
  // bleeding
  'press-a': frame(pressArm(0, false) + '', { noGround: true }),
  'press-b': frame(
    pressArm(10, false) + arrow([180, 120], [180, 230]) + pill(150, 470, '10 min') + tick(620, 110),
    { noGround: true },
  ),
  'press-more': frame(
    pressArm(-4, true) +
      '' +
      `<g filter="url(#soft)"><circle cx="160" cy="160" r="34" fill="${C.sun}"/><path d="M 140 160 h 40 M 160 140 v 40" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/></g>`,
    { noGround: true },
  ),
  'legs-up': frame(
    lier(190, 404, {
      ...HURT,
      legs: [
        [[400, 356], [500, 314], 1],
        [[404, 360], [506, 318], 1],
      ],
    }) +
      `<rect x="440" y="330" width="140" height="100" rx="18" fill="${C.wood}"/><rect x="440" y="330" width="140" height="22" rx="10" fill="${C.bark}"/>` +
      arrow([600, 300], [600, 220]) +
      '',
  ),
  // choking
  'slap-a': frame(choker() + slapper(false) + pill(560, 110, '5 ×')),
  'slap-b': frame(
    choker() +
      slapper(true) +
      `<g stroke="${C.coral}" stroke-width="7" stroke-linecap="round"><path d="M 300 214 l -14 -24"/><path d="M 324 220 l 6 -26"/><path d="M 280 230 l -26 -8"/></g>` +
      pill(560, 110, '5 ×') +
      '',
  ),
  'thrust-a': frame(
    thruster(false, 'body') +
      chokeUpright() +
      thruster(false, 'arms') +
      zoom(570, 170, 92, fistClose, { from: [278, 282] }) +
      '',
  ),
  'thrust-b': frame(
    thruster(true, 'body') +
      chokeUpright({ head: [278, 166], face: 'open' }) +
      thruster(true, 'arms') +
      arrow([240, 330], [262, 238], { curve: [220, 290] }) +
      `<circle cx="226" cy="150" r="10" fill="${C.sun}"/><path d="M 210 140 l -16 -6 M 212 158 l -18 4" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>` +
      '' +
      pill(560, 110, '5 ×'),
  ),
  // burns
  'burn-cool-a': frame(burnArm(false) + '', { noGround: true }),
  'burn-cool-b': frame(burnArm(true) + pill(560, 470, '20 min') + tick(110, 110), {
    noGround: true,
  }),
  'burn-rings': frame(
    handTop(330, 380, { skin: HURT.skin, scale: 2.6 }) +
      `<rect x="285" y="200" width="44" height="22" rx="8" fill="${C.sun}" stroke="#C99520" stroke-width="4"/>` +
      `<rect x="250" y="410" width="170" height="54" rx="14" fill="${C.ink}"/><circle cx="335" cy="437" r="20" fill="#E8EEF2"/>` +
      arrow([307, 180], [307, 80]) +
      arrow([440, 440], [560, 440]) +
      '' +
      '',
    { noGround: true },
  ),
  'burn-cover': frame(
    forearm(60, 480, 350, { skin: HURT.skin, sleeve: HURT.shirt }) +
      `<ellipse cx="330" cy="338" rx="62" ry="18" fill="#F2A493" opacity="0.9"/>` +
      `<rect x="230" y="296" width="200" height="104" rx="22" fill="#CFE6F5" opacity="0.72" stroke="#9CC4DE" stroke-width="4"/>` +
      `<path d="M 256 312 l 36 -0 M 254 326 l 18 0" stroke="#fff" stroke-width="6" stroke-linecap="round"/>` +
      '' +
      pill(330, 160, 'Loose') +
      tick(600, 120),
    { noGround: true },
  ),
  'burn-no-ice': frame(
    // ice cube, butter, popped blister
    `<g transform="translate(160,280)"><rect x="-60" y="-60" width="120" height="120" rx="20" fill="#D6EEFA" stroke="#9CC4DE" stroke-width="6"/><path d="M -36 -36 l 24 0" stroke="#fff" stroke-width="10" stroke-linecap="round"/></g>` +
      `<g transform="translate(360,290)"><rect x="-80" y="-30" width="160" height="70" rx="12" fill="#F9DE7C"/><rect x="-96" y="34" width="192" height="18" rx="9" fill="#C9D2CE"/></g>` +
      `<g transform="translate(560,290)"><circle cx="0" cy="0" r="54" fill="#F7C7BB"/><circle cx="0" cy="0" r="30" fill="#FBE3DC" stroke="#E79A8C" stroke-width="5"/><path d="M 40 -70 L 4 -12" stroke="${C.metalDark}" stroke-width="8" stroke-linecap="round"/></g>` +
      cross(205, 205) +
      cross(420, 205) +
      cross(605, 205) +
      text(160, 410, 'No ice', { size: 40 }) +
      text(360, 410, 'Butter', { size: 40 }) +
      text(560, 410, 'Popping', { size: 40 }),
    { blob: false, noGround: true },
  ),
  'sip-a': frame(sipper(false) + pill(560, 120, 'Sips')),
  'sip-b': frame(sipper(true) + pill(560, 120, 'Sips')),
  // bones
  'bone-still': frame(
    `<rect x="110" y="368" width="440" height="60" rx="30" fill="#E9A23B"/><path d="M 200 372 v 52 M 330 372 v 52 M 460 372 v 52" stroke="#D18F2C" stroke-width="8"/>` +
      forearm(60, 500, 340, { skin: HURT.skin, sleeve: HURT.shirt }) +
      pill(360, 150, 'Still') +
      '' +
      tick(620, 110),
    { noGround: true },
  ),
  'bone-splint': frame(splintArm(false) + pill(320, 140, 'Pad + tie') + tick(620, 110) + '', {
    noGround: true,
  }),
  'bone-cold': frame(splintArm(true) + pill(560, 130, '20 min') + '', { noGround: true }),
  'bone-sling': frame(slingPerson()),
  // heat
  'heat-shade': frame(shadeTree(sitter(280, { ...HURT, face: 'smile' })) + '' + tick(600, 330), {
    blobX: 300,
  }),
  'heat-cool-a': frame(
    heatLier() +
      person({
        head: [430, 220],
        neck: [420, 256],
        hip: [460, 340],
        legs: [
          [[420, 400], [500, 410], 1],
          [[430, 402], [510, 412], 1],
        ],
        arms: [
          [
            [390, 300],
            [370, 330],
          ],
          [
            [380, 280],
            [330, 300],
          ],
        ],
        facing: -1,
        ...HELP,
      }) +
      cup(320, 300, { rot: -120, color: C.sun }) +
      `<path d="M 300 316 C 296 340 290 360 288 378" stroke="${C.water}" stroke-width="12" fill="none" stroke-linecap="round"/>` +
      '',
  ),
  'heat-cool-b': frame(
    heatLier() +
      person({
        head: [430, 220],
        neck: [420, 256],
        hip: [460, 340],
        legs: [
          [[420, 400], [500, 410], 1],
          [[430, 402], [510, 412], 1],
        ],
        arms: [
          [
            [390, 300],
            [370, 330],
          ],
          [
            [380, 260],
            [330, 240],
          ],
        ],
        facing: -1,
        ...HELP,
      }) +
      `<path d="M 330 240 L 250 200 Q 240 260 300 280 Z" fill="${C.sun}"/>` +
      `<g stroke="#9FB8C8" stroke-width="6" fill="none" stroke-linecap="round"><path d="M 230 260 q -20 20 -10 46"/><path d="M 200 250 q -24 24 -14 56"/></g>` +
      `<g fill="${C.water}">${[260, 300, 340].map((x) => `<circle cx="${x}" cy="380" r="7"/>`).join('')}</g>` +
      '',
  ),
  'heat-cloths': frame(
    front(360, {
      ...HURT,
      face: 'smile',
      arms: [
        [
          [300, 270],
          [270, 320],
        ],
        [
          [420, 270],
          [450, 320],
        ],
      ],
    }) +
      wetCloth(360, frontJoints(360).shY - 8) +
      wetCloth(318, frontJoints(360).shY + 30, -70) +
      wetCloth(402, frontJoints(360).shY + 30, 70) +
      wetCloth(360, frontJoints(360).hipY + 10) +
      '' +
      '' +
      '' +
      '',
  ),
  // cold
  'cold-inside-a': frame(
    snow(18, 4) +
      wind(60, 160) +
      house(540, G, 0.9, { lit: true }) +
      stander(250, { ...HURT, face: 'worried' }) +
      arrow([320, 330], [430, 330]),
    { blobColor: '#DCE7EE' },
  ),
  'cold-inside-b': frame(
    snow(12, 9) +
      `<path d="M 130 200 L 360 70 L 590 200 Z" fill="${C.coral}"/>` +
      `<rect x="160" y="196" width="400" height="234" fill="#FBEFD6"/>` +
      `<rect x="160" y="196" width="400" height="234" fill="none" stroke="#E4CFA6" stroke-width="10"/>` +
      `<rect x="440" y="250" width="80" height="70" rx="8" fill="#BFD9EA"/>` +
      `<g transform="translate(450,420)"><rect x="-44" y="-70" width="88" height="70" rx="10" fill="${C.ink}"/>${''}<circle cx="0" cy="-36" r="20" fill="${C.fire}"/><circle cx="0" cy="-32" r="10" fill="${C.flame}"/></g>` +
      stander(300, { ...HURT, scale: 0.8, face: 'smile' }) +
      tick(620, 110),
    { blobColor: '#DCE7EE' },
  ),
  'cold-dry': frame(
    shirtIcon(200, 260, '#7FA7C9', true) +
      shirtIcon(520, 260, '#E9A23B', false) +
      arrow([300, 260], [410, 260]) +
      cross(250, 150) +
      tick(570, 150) +
      text(200, 420, 'Wet', { size: 44 }) +
      text(520, 420, 'Dry', { size: 44 }),
    { blob: false, noGround: true },
  ),
  'cold-wrap': frame(wrapped() + '' + tick(620, 110), { blobColor: '#DCE7EE' }),
  'cold-share': frame(
    frontSit(290, { ...HELP, face: 'smile' }) +
      frontSit(430, { ...HURT, face: 'closed' }) +
      `<path d="M 200 430 L 214 300 Q 220 274 250 270 L 470 270 Q 500 274 506 300 L 520 430 Z" fill="#E9A23B"/>` +
      `<path d="M 290 274 L 296 430 M 360 272 L 360 430 M 430 274 L 424 430" stroke="#D18F2C" stroke-width="10"/>` +
      `<g fill="${C.coral}" filter="url(#soft)"><path d="M 600 160 c -20 -30 -60 -10 -40 20 l 40 36 l 40 -36 c 20 -30 -20 -50 -40 -20 z"/></g>` +
      '',
    { blobColor: '#DCE7EE' },
  ),
  'warm-drink-a': frame(warmSitter(false) + ''),
  'warm-drink-b': frame(warmSitter(true) + ''),
};
