// Rebuild cards, part 1. Picture names are rb-<card>-<step index>, so each lines up with its step.
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
  noSign,
  house,
  shake,
} from '../kit.mjs';
import {
  goat,
  basket,
  drum,
  brick,
  anvil,
  hammer,
  table,
  bowl,
  wheat,
  field,
  stick,
  fly,
  sack,
  stone,
  heart,
} from '../props.mjs';

// The people doing the work: a few different looks so it never feels like one person.
const A = { shirt: C.forest, skin: SKIN[2], hair: HAIR[2], pants: '#34495E' };
const B = { shirt: '#E07B39', skin: SKIN[1], hair: HAIR[4], hairStyle: 'long', pants: '#4B3F72' };
const K = { shirt: '#5B8DBE', skin: SKIN[3], hair: HAIR[1], pants: '#8B6F4E' };

/** Standing, both hands out in front at one point. */
const working = (x, hand, look, o = {}) => {
  const f = o.facing ?? 1;
  return person({
    head: [x + f * 6, 158],
    neck: [x, 194],
    hip: [x - f * 4, 310],
    legs: [
      [
        [x - f * 8, 370],
        [x - f * 12, 422],
      ],
      [
        [x + f * 8, 370],
        [x + f * 12, 424],
      ],
    ],
    arms: [
      [
        [x + f * 20, 262],
        [hand[0] - f * 8, hand[1] + 6],
      ],
      [[x + f * 26, 260], hand],
    ],
    facing: f,
    ...look,
    ...o,
  });
};

/** Kneeling or crouched, hands down near the ground in front. */
const crouch = (x, hand, look, o = {}) => {
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

const water = (x1, x2, y) =>
  `<path d="M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - 16} ${x2} ${y} L ${x2} ${y + 30} L ${x1} ${y + 30} Z" fill="${C.water}"/>`;

const pod = (x, y, rot = 0, col = '#A8835A') =>
  `<path d="M ${x} ${y} q 10 30 0 64 q -10 -30 0 -64 z" fill="${col}" stroke="${shade(col, 0.2)}" stroke-width="3" transform="rotate(${rot} ${x} ${y})"/>`;

const tomato = (x, y, r = 20) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#E0503A"/><path d="M ${x - 8} ${y - r + 2} l 8 6 l 8 -6" stroke="${C.leafDark}" stroke-width="5" fill="none" stroke-linecap="round"/>`;

const seeds = (cx, cy, n = 14, spread = 60, col = '#E9D9A6') => {
  let r = n * 7;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  return Array.from(
    { length: n },
    () =>
      `<ellipse cx="${cx + (rnd() - 0.5) * spread * 2}" cy="${cy + (rnd() - 0.5) * spread * 0.5}" rx="7" ry="5" fill="${col}" stroke="${shade(col, 0.25)}" stroke-width="2"/>`,
  ).join('');
};

const sheet = (x1, x2, y = G, col = C.cloth) =>
  `<path d="M ${x1} ${y + 4} L ${x1 + 30} ${y - 22} L ${x2 - 30} ${y - 22} L ${x2} ${y + 4} Z" fill="${col}" stroke="${shade(col, 0.15)}" stroke-width="4"/>`;

const clayCol = '#C98B5E';
const snake = (x1, x2, y, t = 22, col = clayCol) =>
  `<rect x="${x1}" y="${y - t / 2}" width="${x2 - x1}" height="${t}" rx="${t / 2}" fill="${col}" stroke="${shade(col, 0.15)}" stroke-width="3"/>`;

const potShape = (x, y, s = 1, col = clayCol) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M -40 -150 L 40 -150 Q 46 -130 70 -100 Q 96 -50 60 0 L -60 0 Q -96 -50 -70 -100 Q -46 -130 -40 -150 Z" fill="${col}"/><rect x="-46" y="-160" width="92" height="16" rx="8" fill="${shade(col, 0.12)}"/></g>`;

export default {
  // ---------------- germs ----------------
  'rb-germs-2': frame(
    front(360, {
      ...K,
      arms: [
        [
          [310, 300],
          [342, 270],
        ],
        [
          [410, 300],
          [378, 270],
        ],
      ],
    }) +
      `<g fill="#fff" stroke="#B9D6E8" stroke-width="3">${[
        [330, 250],
        [356, 236],
        [384, 248],
        [372, 226],
        [342, 228],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12"/>`)
        .join('')}</g>` +
      `<rect x="520" y="300" width="70" height="44" rx="10" fill="#F6E7B2"/>` +
      pill(150, 150, 'Count 20'),
  ),
  'rb-germs-3': frame(
    fire(360) +
      pot(360, 362, { water: true, boil: true, steam: true }) +
      pill(580, 150, '1 min') +
      tick(140, 140),
  ),
  'rb-germs-4': frame(
    // the toilet hut up the hill on the right, the stream down on the left, a long way apart
    water(40, 230, G - 16) +
      `<g transform="translate(560,${G})"><rect x="-50" y="-150" width="100" height="150" fill="${C.wood}"/><path d="M -64 -146 L 0 -196 L 64 -146 Z" fill="${C.woodDark}"/><rect x="-22" y="-110" width="44" height="110" rx="4" fill="${C.woodDark}"/><path d="M -8 -170 l 16 0" stroke="#fff" stroke-width="5"/></g>` +
      arrow([480, 290], [250, 290], { width: 8, color: C.forest }) +
      arrow([250, 290], [480, 290], { width: 8, color: C.forest }) +
      pill(365, 230, '50 big steps') +
      tick(140, 140),
  ),
  'rb-germs-6': frame(
    forearm(80, 470, 330, { skin: SKIN[3], sleeve: K.shirt }) +
      `<rect x="250" y="292" width="110" height="76" rx="14" fill="#fff" stroke="#D5DCD8" stroke-width="4"/><rect x="270" y="312" width="70" height="36" rx="8" fill="#F4F6F5"/>` +
      `<g transform="translate(560,160) rotate(-30)"><rect x="-34" y="-46" width="68" height="92" rx="14" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="4"/><rect x="-28" y="-6" width="56" height="46" rx="8" fill="${C.water}"/></g>` +
      tick(140, 140),
    { noGround: true },
  ),
  'rb-germs-8': frame(
    table(360, G, 380, 130) +
      bowl(300, G - 132, { fill: '#E9C46A' }) +
      `<path d="M 210 ${G - 190} Q 300 ${G - 230} 390 ${G - 190} L 380 ${G - 170} L 220 ${G - 170} Z" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="4"/>` +
      jar(440, G - 132, { fill: '#C9A06A', level: 60 }) +
      fly(560, 180, 1.4) +
      cross(600, 140, 26) +
      tick(140, 140),
  ),
  // ---------------- save seed ----------------
  'rb-save-seed-0': frame(
    plant(250, G, 1.6, { fruit: '#E0503A' }) +
      plant(470, G, 1.1, { color: '#7FAF7F' }) +
      `<path d="M 238 ${G - 70} l 30 0 l 26 40 l -12 4 l -18 -30 z" fill="${C.coral}"/><rect x="236" y="${G - 78}" width="28" height="14" rx="5" fill="${C.coral}"/>` +
      tick(250, 120) +
      pill(470, 140, 'Best one'),
  ),
  'rb-save-seed-2': frame(
    `<path d="M 360 ${G} L 360 160" stroke="${C.leafDark}" stroke-width="10" stroke-linecap="round"/>` +
      [
        [-1, 200],
        [1, 240],
        [-1, 290],
        [1, 330],
      ]
        .map(
          ([s, y]) =>
            `<path d="M 360 ${y} q ${s * 40} -10 ${s * 70} 10" stroke="${C.leafDark}" stroke-width="7" fill="none"/>` +
            pod(360 + s * 70, y + 4, s * -20),
        )
        .join('') +
      `<g stroke="${C.ink}" stroke-width="5" stroke-linecap="round" opacity="0.5"><path d="M 470 230 l 20 -10 M 474 250 l 24 0"/></g>` +
      pill(560, 140, 'Brown + dry'),
  ),
  'rb-save-seed-3': frame(
    jar(300, G, { scale: 1.6, fill: '#E9A1A1', level: 66 }) +
      `<g>${seeds(300, G - 50, 14, 32, '#F2E3B3')}</g>` +
      tomato(500, G - 30, 34) +
      pill(300, 120, '3 days'),
  ),
  'rb-save-seed-6': frame(
    `<rect x="120" y="120" width="480" height="40" rx="12" fill="${C.wood}"/><rect x="140" y="160" width="14" height="${G - 160}" fill="${C.woodDark}"/><rect x="566" y="160" width="14" height="${G - 160}" fill="${C.woodDark}"/>` +
      `<ellipse cx="360" cy="${G - 4}" rx="240" ry="22" fill="rgba(18,56,45,0.14)"/>` +
      sheet(170, 550) +
      seeds(360, G - 10, 30, 150, '#E9D9A6') +
      pill(360, 240, '2 weeks'),
  ),
  'rb-save-seed-7': frame(
    jar(260, G, { scale: 1.7, fill: '#E9D9A6', level: 74 }) +
      `<rect x="190" y="${G - 114}" width="140" height="52" rx="6" fill="#fff"/>` +
      text(260, G - 76, 'Beans', { size: 30 }) +
      `<rect x="420" y="${G - 140}" width="150" height="140" rx="10" fill="#C9B48A"/><rect x="440" y="${G - 110}" width="110" height="60" rx="6" fill="#fff"/>` +
      text(495, G - 72, '2027', { size: 26 }) +
      pill(380, 120, 'Cool, dark, dry'),
  ),
  // ---------------- grain ----------------
  'rb-grain-1': frame(
    working(260, [350, 250], A, {
      arms: [
        [
          [270, 262],
          [250, 300],
        ],
        [
          [310, 230],
          [360, 200],
        ],
      ],
    }) +
      sack(200, G, { scale: 0.7 }) +
      seeds(470, 300, 12, 90, '#E9C46A') +
      `<path d="M 380 ${G - 6} h 260" stroke="${C.soil}" stroke-width="16" stroke-linecap="round"/>` +
      pill(560, 140, 'A finger apart'),
  ),
  'rb-grain-3': frame(
    field(130, 600, G, 1.3) +
      `<g transform="translate(560,170) rotate(20)"><path d="M 0 0 q 70 -10 80 60" stroke="${C.metal}" stroke-width="14" fill="none" stroke-linecap="round"/><rect x="-10" y="0" width="16" height="90" rx="6" fill="${C.wood}"/></g>` +
      sun(130, 110, 34),
  ),
  'rb-grain-5': frame(
    sheet(120, 600) +
      wheat(250, G - 16, 0.9) +
      `<g transform="translate(330,${G - 18}) rotate(80)">${wheat(0, 0, 0.9)}</g>` +
      working(470, [360, 250], A, {
        facing: -1,
        arms: [
          [
            [440, 262],
            [400, 290],
          ],
          [
            [430, 220],
            [380, 160],
          ],
        ],
      }) +
      stick(380, 160, 300, 340, 14) +
      shake(300, 360) +
      seeds(320, G - 26, 10, 60, '#E9C46A'),
  ),
  'rb-grain-6': frame(
    working(260, [300, 150], B, {
      arms: [
        [
          [290, 210],
          [310, 150],
        ],
        [
          [296, 214],
          [320, 160],
        ],
      ],
    }) +
      basket(330, 160, { rot: 150, scale: 0.8, fill: '#E9C46A' }) +
      `<path d="M 330 200 L 330 ${G - 70}" stroke="#E9C46A" stroke-width="16" stroke-dasharray="4 10" stroke-linecap="round"/>` +
      basket(330, G, { scale: 0.9, fill: '#E9C46A' }) +
      `<g fill="#D9C79A">${[
        [420, 230],
        [470, 210],
        [520, 250],
        [560, 220],
        [600, 260],
      ]
        .map(
          ([x, y]) =>
            `<ellipse cx="${x}" cy="${y}" rx="10" ry="5" transform="rotate(30 ${x} ${y})"/>`,
        )
        .join('')}</g>` +
      `<g stroke="#9FB8C8" stroke-width="7" fill="none" stroke-linecap="round"><path d="M 380 290 h 100 q 20 0 20 -16"/><path d="M 400 320 h 140"/></g>` +
      pill(560, 380, 'Wind'),
  ),
  'rb-grain-8': frame(
    `<ellipse cx="360" cy="${G - 20}" rx="210" ry="40" fill="${C.stoneDark}"/><ellipse cx="360" cy="${G - 34}" rx="200" ry="30" fill="${C.stone}"/>` +
      `<ellipse cx="420" cy="${G - 70}" rx="80" ry="26" fill="${C.stoneDark}"/>` +
      `<ellipse cx="250" cy="${G - 46}" rx="60" ry="14" fill="#FBF6EA"/>` +
      handTop(430, G - 120, { skin: SKIN[1], scale: 1, rot: 90 }) +
      arrow([520, 200], [340, 200], { curve: [430, 150] }) +
      bowl(600, G, { fill: '#FBF6EA', scale: 0.8 }),
  ),
  // ---------------- goats ----------------
  'rb-goats-1': frame(
    `<rect x="140" y="160" width="440" height="${G - 160}" fill="#D9B98C"/><path d="M 110 170 L 360 80 L 610 170 Z" fill="${C.woodDark}"/>` +
      `<rect x="170" y="200" width="380" height="${G - 200}" fill="#F3E3C3"/>` +
      `<rect x="380" y="320" width="160" height="22" rx="6" fill="${C.wood}"/><rect x="392" y="342" width="14" height="${G - 342}" fill="${C.woodDark}"/><rect x="514" y="342" width="14" height="${G - 342}" fill="${C.woodDark}"/>` +
      `<rect x="170" y="${G - 20}" width="380" height="20" fill="${C.straw}"/>` +
      goat(260, G - 4, { scale: 0.75 }) +
      goat(470, 322, { scale: 0.55, facing: -1, color: '#B58A5E' }) +
      rain(10, 3).replace(/<path/g, '<path opacity="0.8"') +
      '',
    {},
  ),
  'rb-goats-2': frame(
    [140, 260, 380, 500, 620]
      .map(
        (x) =>
          `<rect x="${x - 10}" y="230" width="20" height="${G - 230}" rx="6" fill="${C.wood}"/>`,
      )
      .join('') +
      [260, 310, 360]
        .map((y) => `<path d="M 120 ${y} H 640" stroke="${C.woodDark}" stroke-width="10"/>`)
        .join('') +
      goat(330, G, { scale: 0.75 }) +
      stander(560, { ...A, scale: 0.85 }) +
      `<path d="M 610 230 v ${G - 230}" stroke="${C.coral}" stroke-width="0"/>` +
      pill(560, 120, 'Chest high'),
  ),
  'rb-goats-3': frame(
    goat(280, G, { scale: 0.85 }) +
      `<g transform="translate(130,${G})">${plant(0, 0, 1.2, { color: '#6FAE6F' })}</g>` +
      bucket(480, G, { water: true, scale: 0.8 }) +
      `<rect x="560" y="${G - 46}" width="70" height="46" rx="10" fill="#F2F2F2" stroke="#CFCFCF" stroke-width="4"/>`,
  ),
  'rb-goats-5': frame(
    goat(320, G, { scale: 1, udder: true }) +
      `<rect x="250" y="${G - 60}" width="90" height="60" rx="10" fill="${C.metal}"/>` +
      crouch(520, [370, 380], B, { facing: -1 }) +
      pill(140, 140, '2 × a day'),
  ),
  'rb-goats-8': frame(
    pot(360, G, { scale: 1.2 }) +
      `<path d="M 290 ${G - 120} Q 360 ${G - 60} 430 ${G - 120}" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="4"/>` +
      `<g transform="translate(420,170) rotate(-40)"><rect x="-40" y="-50" width="80" height="100" rx="12" fill="${C.metal}"/><rect x="-34" y="-10" width="68" height="54" rx="8" fill="#FBF6EA"/></g>` +
      `<path d="M 380 214 C 370 240 362 260 360 ${G - 104}" stroke="#FBF6EA" stroke-width="16" fill="none" stroke-linecap="round"/>` +
      tick(140, 140),
  ),
  // ---------------- charcoal ----------------
  'rb-charcoal-1': frame(
    drum(360, G - 10, { holes: false }) +
      `<ellipse cx="360" cy="${G - 10}" rx="70" ry="18" fill="${C.metalDark}"/>` +
      zoom(
        570,
        160,
        86,
        `<rect x="-120" y="-120" width="240" height="240" fill="${C.metal}"/>${[-50, 0, 50].map((x) => `<circle cx="${x}" cy="0" r="16" fill="${C.ink}"/>`).join('')}<circle cx="0" cy="50" r="16" fill="${C.ink}"/>`,
        { from: [360, G - 20] },
      ) +
      pill(570, 300, '5–6 holes'),
  ),
  'rb-charcoal-2': frame(
    drum(360, G, { lift: 46, bricks: true }) +
      arrow([220, G - 20], [300, G - 30], { width: 8 }) +
      pill(160, 160, 'Air in'),
  ),
  'rb-charcoal-4': frame(
    drum(360, G, { lift: 46, bricks: true }) +
      `<g fill="#C9D3D8" opacity="0.85"><circle cx="340" cy="190" r="40"/><circle cx="380" cy="140" r="34"/><circle cx="350" cy="90" r="28"/></g>` +
      `<g fill="#A9C2DE" opacity="0.7"><circle cx="560" cy="200" r="20"/><circle cx="574" cy="160" r="16"/></g>` +
      arrow([440, 160], [520, 180], { width: 8 }) +
      pill(560, 110, 'Thin blue') +
      pill(160, 160, '1–3 hrs'),
  ),
  'rb-charcoal-5': frame(
    drum(360, G, { lid: true }) +
      `<path d="M 230 ${G} Q 260 ${G - 70} 290 ${G - 70} L 290 ${G} Z M 490 ${G} Q 460 ${G - 70} 430 ${G - 70} L 430 ${G} Z" fill="${C.soil}"/>` +
      `<g transform="translate(560,240) rotate(30)"><rect x="-6" y="-120" width="12" height="150" rx="6" fill="${C.wood}"/><path d="M -30 30 L 30 30 L 22 90 Q 0 104 -22 90 Z" fill="${C.metalDark}"/></g>` +
      pill(160, 140, 'Lid on'),
  ),
  'rb-charcoal-7': frame(
    `<g>${[
      [260, G - 30],
      [330, G - 26],
      [300, G - 70],
      [380, G - 40],
      [420, G - 22],
    ]
      .map(
        ([x, y], i) =>
          `<rect x="${x - 40}" y="${y - 22}" width="80" height="44" rx="10" fill="#2B2F33" transform="rotate(${((i * 23) % 40) - 20} ${x} ${y})"/>`,
      )
      .join('')}</g>` +
      `<g stroke="${C.sun}" stroke-width="6" stroke-linecap="round"><path d="M 250 150 l -20 -20 M 280 136 l 0 -28 M 310 150 l 20 -20"/></g>` +
      `<rect x="200" y="170" width="70" height="36" rx="10" fill="#2B2F33" transform="rotate(-20 235 188)"/><rect x="290" y="170" width="70" height="36" rx="10" fill="#2B2F33" transform="rotate(20 325 188)"/>` +
      pill(540, 160, 'Rings') +
      tick(540, 260),
  ),
  // ---------------- clay pots ----------------
  'rb-clay-pots-0': frame(
    `<path d="M 160 ${G - 60} Q 260 ${G - 160} 360 ${G - 60}" stroke="${clayCol}" stroke-width="26" fill="none" stroke-linecap="round"/>` +
      `<path d="M 420 ${G - 60} Q 470 ${G - 140} 500 ${G - 120}" stroke="#BFA38A" stroke-width="26" fill="none" stroke-linecap="round"/><path d="M 520 ${G - 112} Q 560 ${G - 100} 580 ${G - 60}" stroke="#BFA38A" stroke-width="26" fill="none" stroke-linecap="round"/>` +
      tick(260, 140) +
      cross(500, 140),
  ),
  'rb-clay-pots-4': frame(
    `<ellipse cx="360" cy="${G - 10}" rx="130" ry="26" fill="${clayCol}"/>` +
      [0, 1, 2, 3]
        .map(
          (i) =>
            `<ellipse cx="360" cy="${G - 36 - i * 26}" rx="${126 + i * 6}" ry="26" fill="none" stroke="${shade(clayCol, i % 2 ? 0.05 : 0.15)}" stroke-width="24"/>`,
        )
        .join('') +
      snake(470, 650, 160) +
      arrow([560, 190], [500, 260], { width: 8, curve: [560, 250] }),
  ),
  'rb-clay-pots-5': frame(
    potShape(360, G, 1.5) +
      handTop(250, 240, { skin: SKIN[0], scale: 0.8, rot: 70 }) +
      arrow([200, 330], [200, 220], { width: 8 }) +
      pill(560, 140, 'Smooth'),
  ),
  'rb-clay-pots-8': frame(
    fire(360, G, 1.8) +
      potShape(300, G - 30, 0.6, '#B8724A') +
      potShape(430, G - 30, 0.55, '#B8724A') +
      flame(250, G - 10, 1.1) +
      flame(480, G - 10, 1.1) +
      pill(580, 120, 'Hours'),
  ),
  'rb-clay-pots-9': frame(
    potShape(320, G, 1.3, '#B8724A') +
      `<g stroke="${C.sun}" stroke-width="7" stroke-linecap="round"><path d="M 460 210 q 20 30 0 60"/><path d="M 490 190 q 34 50 0 100"/></g>` +
      hammer(430, 200, -60, 0.8) +
      pill(560, 120, 'Ring = good') +
      tick(140, 140),
  ),
  // ---------------- rope ----------------
  'rb-rope-0': frame(
    `<g>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M ${200 + i * 12} ${G} Q ${220 + i * 18} 260 ${180 + i * 30} 120" stroke="${i % 2 ? '#7FA06A' : '#A8B07A'}" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('')}</g>` +
      `<g>${[0, 1, 2, 3, 4].map((i) => `<path d="M 420 ${G - 20 - i * 10} L 640 ${G - 60 - i * 12}" stroke="#C9A877" stroke-width="10" stroke-linecap="round"/>`).join('')}</g>` +
      pill(530, 160, 'Long, strong'),
  ),
  'rb-rope-3': frame(
    `<path d="M 200 200 Q 300 220 560 160" stroke="#C9A877" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M 200 200 Q 300 260 560 280" stroke="#B39062" stroke-width="18" fill="none" stroke-linecap="round"/>` +
      `<circle cx="190" cy="200" r="26" fill="none" stroke="#C9A877" stroke-width="16"/>` +
      handTop(170, 280, { skin: SKIN[3], scale: 0.9, rot: 20 }) +
      pill(420, 400, '2 strands'),
    { noGround: true },
  ),
  'rb-rope-4': frame(
    `<path d="M 160 260 Q 300 240 600 200" stroke="#C9A877" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M 160 280 Q 300 300 600 330" stroke="#B39062" stroke-width="20" fill="none" stroke-linecap="round"/>` +
      `<g stroke="#8F7048" stroke-width="5">${[220, 280, 340, 400, 460, 520].map((x) => `<path d="M ${x} ${245 - (x - 160) * 0.1} l 12 -18"/>`).join('')}</g>` +
      arrow([600, 140], [600, 100], { curve: [660, 120] }) +
      pill(400, 120, 'Twist away'),
    { noGround: true },
  ),
  'rb-rope-5': frame(
    `<path d="M 140 270 C 260 240 300 330 420 270 C 520 220 560 310 640 270" stroke="#C9A877" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M 140 270 C 260 310 300 220 420 270 C 520 320 560 230 640 270" stroke="#B39062" stroke-width="20" fill="none" stroke-linecap="round"/>` +
      arrow([520, 160], [440, 240], { curve: [520, 230] }) +
      pill(400, 400, 'Cross over'),
    { noGround: true },
  ),
  'rb-rope-8': frame(
    `<path d="M 120 300 C 240 200 360 400 480 280 C 560 200 620 260 640 300" stroke="#B39062" stroke-width="22" fill="none" stroke-linecap="round" stroke-dasharray="22 6"/>` +
      `<circle cx="640" cy="300" r="22" fill="#8F7048"/>` +
      tick(140, 140),
    { noGround: true },
  ),
  // ---------------- cloth ----------------
  'rb-cloth-2': frame(
    `<g transform="translate(260,260) rotate(-12)"><rect x="-90" y="-40" width="180" height="80" rx="12" fill="${C.wood}"/>${Array.from({ length: 10 }, (_, i) => `<path d="M ${-80 + i * 18} 40 v 26" stroke="#555" stroke-width="4"/>`).join('')}</g>` +
      `<g transform="translate(450,330) rotate(10)"><rect x="-90" y="-40" width="180" height="80" rx="12" fill="${C.wood}"/>${Array.from({ length: 10 }, (_, i) => `<path d="M ${-80 + i * 18} -40 v -26" stroke="#555" stroke-width="4"/>`).join('')}</g>` +
      `<path d="M 260 300 Q 360 300 440 290" stroke="#F4EEE0" stroke-width="30" fill="none" stroke-linecap="round"/>` +
      arrow([180, 420], [560, 420], { width: 8 }),
    { noGround: true },
  ),
  'rb-cloth-3': frame(
    stick(360, 100, 360, 440, 14) +
      `<ellipse cx="360" cy="380" rx="80" ry="22" fill="${C.clay}"/><ellipse cx="360" cy="372" rx="80" ry="22" fill="#D99B6E"/>` +
      pill(560, 380, 'Weight') +
      pill(560, 160, 'Straight stick'),
    { noGround: true },
  ),
  'rb-cloth-5': frame(
    working(250, [300, 120], B, {
      arms: [
        [
          [290, 220],
          [300, 130],
        ],
        [
          [230, 250],
          [210, 300],
        ],
      ],
    }) +
      `<path d="M 300 120 L 360 260" stroke="#F4EEE0" stroke-width="8"/>` +
      `<path d="M 280 110 Q 300 90 330 104" stroke="#F4EEE0" stroke-width="30" stroke-linecap="round" fill="none"/>` +
      stick(360, 250, 360, 380, 10) +
      `<ellipse cx="360" cy="360" rx="50" ry="14" fill="${C.clay}"/>` +
      arrow([420, 300], [420, 340], { curve: [460, 320], width: 8 }) +
      pill(560, 160, 'Spin it'),
  ),
  'rb-cloth-7': frame(
    `<rect x="170" y="110" width="380" height="300" fill="none" stroke="${C.wood}" stroke-width="20" rx="6"/>` +
      Array.from(
        { length: 12 },
        (_, i) => `<path d="M ${200 + i * 29} 120 V 400" stroke="#E9DCC0" stroke-width="5"/>`,
      ).join(''),
    { noGround: true },
  ),
  'rb-cloth-8': frame(
    `<rect x="170" y="110" width="380" height="300" fill="none" stroke="${C.wood}" stroke-width="20" rx="6"/>` +
      Array.from(
        { length: 12 },
        (_, i) => `<path d="M ${200 + i * 29} 120 V 400" stroke="#E9DCC0" stroke-width="5"/>`,
      ).join('') +
      [0, 1, 2, 3, 4, 5]
        .map(
          (r) =>
            `<path d="M 186 ${380 - r * 20} ${Array.from({ length: 12 }, (_, i) => `L ${200 + i * 29} ${380 - r * 20 + ((i + r) % 2 ? 5 : -5)}`).join(' ')} L 536 ${380 - r * 20}" stroke="${r % 2 ? '#E07B39' : '#C9643A'}" stroke-width="12" fill="none" stroke-linejoin="round"/>`,
        )
        .join('') +
      pill(360, 200, 'Over, under'),
    { noGround: true },
  ),
  // ---------------- tan ----------------
  'rb-tan-1': frame(
    `<ellipse cx="360" cy="${G - 60}" rx="250" ry="60" fill="${C.wood}"/>` +
      `<path d="M 160 ${G - 100} Q 360 ${G - 150} 560 ${G - 100} L 540 ${G - 50} Q 360 ${G - 80} 180 ${G - 50} Z" fill="#E7D2B4"/>` +
      `<g transform="translate(400,${G - 160}) rotate(-20)"><rect x="-60" y="-10" width="120" height="16" rx="6" fill="${C.metal}"/><rect x="-80" y="-14" width="30" height="24" rx="8" fill="${C.wood}"/><rect x="50" y="-14" width="30" height="24" rx="8" fill="${C.wood}"/></g>` +
      arrow([300, 180], [480, 180], { width: 8 }) +
      pill(360, 100, 'Scrape clean'),
  ),
  'rb-tan-2': frame(
    bucket(360, G, { water: true, scale: 1.5 }) +
      `<path d="M 300 ${G - 100} q 60 -30 120 0" stroke="#E7D2B4" stroke-width="16" fill="none" stroke-linecap="round"/>` +
      `<g fill="#B7B7B7">${[
        [560, G - 10],
        [600, G - 16],
        [580, G - 34],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16"/>`)
        .join('')}</g>` +
      pill(150, 140, '2–3 days'),
  ),
  'rb-tan-5': frame(
    bowl(220, G, { fill: '#F6C344' }) +
      `<path d="M 330 ${G - 60} Q 480 ${G - 120} 640 ${G - 60} L 620 ${G} L 350 ${G} Z" fill="#E7D2B4"/>` +
      handTop(480, G - 70, { skin: SKIN[2], scale: 0.9, rot: 90 }) +
      shake(480, G - 110) +
      pill(220, 150, 'Egg yolks'),
  ),
  'rb-tan-6': frame(
    `<rect x="340" y="140" width="40" height="${G - 140}" rx="10" fill="${C.wood}"/>` +
      `<path d="M 230 220 Q 360 160 490 220 L 470 330 Q 360 290 250 330 Z" fill="#EADBC2"/>` +
      working(160, [250, 270], A, {
        arms: [
          [
            [200, 250],
            [240, 280],
          ],
          [
            [210, 240],
            [252, 266],
          ],
        ],
      }) +
      working(560, [470, 270], B, {
        facing: -1,
        arms: [
          [
            [520, 250],
            [480, 280],
          ],
          [
            [512, 240],
            [468, 266],
          ],
        ],
      }) +
      arrow([150, 120], [80, 120], { width: 8 }) +
      arrow([570, 120], [640, 120], { width: 8 }),
  ),
  'rb-tan-8': frame(
    `<rect x="340" y="80" width="16" height="150" fill="${C.woodDark}"/>` +
      `<path d="M 290 220 Q 348 200 406 220 L 420 340 Q 348 370 276 340 Z" fill="#C9A577"/>` +
      `<g fill="#C9D3D8" opacity="0.85"><circle cx="330" cy="370" r="20"/><circle cx="370" cy="356" r="16"/></g>` +
      logs(348, G - 4, 0.7) +
      flame(348, G - 8, 0.45) +
      pill(560, 140, '1 hr a side'),
  ),
  // ---------------- mud brick ----------------
  'rb-mud-brick-0': frame(
    jar(360, G, { scale: 2.1, fill: null }) +
      `<rect x="300" y="${G - 60}" width="120" height="50" fill="#C9B58E"/><rect x="300" y="${G - 110}" width="120" height="50" fill="#9C7048"/><rect x="300" y="${G - 170}" width="120" height="60" fill="#BFD8E8"/>` +
      pill(560, G - 40, 'Sand') +
      pill(560, G - 90, 'Clay') +
      pill(160, 140, '1 day'),
  ),
  'rb-mud-brick-3': frame(
    `<ellipse cx="360" cy="${G - 6}" rx="260" ry="40" fill="#8E6845"/>` +
      person({
        head: [364, 140],
        neck: [360, 176],
        hip: [360, 292],
        legs: [
          [
            [330, 350],
            [320, 420],
          ],
          [
            [392, 340],
            [410, 390],
          ],
        ],
        arms: [
          [
            [330, 240],
            [300, 290],
          ],
          [
            [390, 240],
            [420, 290],
          ],
        ],
        ...K,
        sleeves: 'short',
      }) +
      `<g fill="${C.straw}">${[
        [220, G - 10],
        [260, G - 20],
        [480, G - 16],
        [520, G - 6],
      ]
        .map(
          ([x, y]) =>
            `<rect x="${x}" y="${y}" width="40" height="6" rx="3" transform="rotate(20 ${x} ${y})"/>`,
        )
        .join('')}</g>` +
      pill(580, 140, 'Like dough'),
  ),
  'rb-mud-brick-5': frame(
    `<rect x="230" y="${G - 70}" width="230" height="70" fill="none" stroke="${C.wood}" stroke-width="16"/>` +
      `<rect x="238" y="${G - 62}" width="214" height="62" fill="#9C7048"/>` +
      brick(560, G, { w: 120, h: 60, color: '#9C7048' }) +
      arrow([345, 220], [345, 150], { width: 8 }) +
      pill(560, 140, 'Lift straight'),
  ),
  'rb-mud-brick-6': frame(
    [180, 260, 340, 420, 500]
      .map((x) => brick(x, G, { w: 40, h: 110, color: '#B08560' }))
      .join('') +
      sun(600, 110, 34) +
      pill(330, 150, '3–4 weeks'),
  ),
  'rb-mud-brick-8': frame(
    [0, 1, 2]
      .map(
        (r) => `<ellipse cx="${200 + r * 160}" cy="${G - 30}" rx="80" ry="34" fill="${C.stone}"/>`,
      )
      .join('') +
      [0, 1, 2, 3]
        .map((row) =>
          [0, 1, 2, 3]
            .map((i) =>
              brick(150 + i * 130 + (row % 2) * 65, G - 60 - row * 50, {
                w: 124,
                h: 48,
                color: '#B08560',
              }),
            )
            .join(''),
        )
        .join('') +
      pill(560, 120, 'Cover the joint'),
  ),
  // ---------------- forge ----------------
  'rb-forge-0': frame(
    `<path d="M 200 ${G - 90} Q 360 ${G + 10} 520 ${G - 90} Z" fill="${C.clay}"/><path d="M 220 ${G - 90} Q 360 ${G - 10} 500 ${G - 90} Z" fill="#2B2F33"/>` +
      `<rect x="480" y="${G - 70}" width="180" height="22" rx="10" fill="${C.metalDark}"/>` +
      pill(560, 140, 'Air pipe'),
  ),
  'rb-forge-1': frame(
    `<path d="M 160 ${G - 90} Q 280 ${G + 10} 400 ${G - 90} Z" fill="${C.clay}"/><path d="M 180 ${G - 90} Q 280 ${G - 10} 380 ${G - 90} Z" fill="#E86A3A"/>` +
      `<rect x="370" y="${G - 70}" width="170" height="22" rx="10" fill="${C.metalDark}"/>` +
      `<path d="M 540 ${G - 80} L 640 ${G - 120} L 640 ${G - 10} L 540 ${G - 40} Z" fill="${C.coral}"/>` +
      arrow([560, G - 140], [460, G - 100], { width: 8 }),
  ),
  'rb-forge-5': frame(
    `<path d="M 200 ${G - 90} Q 360 ${G + 10} 520 ${G - 90} Z" fill="${C.clay}"/><path d="M 220 ${G - 90} Q 360 ${G - 10} 500 ${G - 90} Z" fill="#E86A3A"/>` +
      `<rect x="300" y="${G - 96}" width="300" height="18" rx="8" fill="#F6B93B"/><rect x="520" y="${G - 96}" width="80" height="18" rx="8" fill="${C.metalDark}"/>` +
      flame(360, G - 90, 0.8) +
      pill(360, 140, 'Orange-yellow'),
  ),
  'rb-forge-6': frame(
    anvil(330, G, 1.4) +
      `<rect x="250" y="${G - 176}" width="180" height="18" rx="8" fill="#F28C3A"/>` +
      working(520, [420, 200], A, {
        facing: -1,
        arms: [
          [
            [480, 260],
            [440, 200],
          ],
          [
            [480, 240],
            [430, 150],
          ],
        ],
      }) +
      hammer(420, 140, 30, 1.1) +
      `<g stroke="${C.sun}" stroke-width="6" stroke-linecap="round"><path d="M 330 ${G - 196} l -16 -20 M 360 ${G - 200} l 6 -24"/></g>`,
  ),
  'rb-forge-8': frame(
    bucket(360, G, { water: true, scale: 1.4 }) +
      `<rect x="345" y="120" width="30" height="${G - 220}" rx="8" fill="${C.metalDark}"/><rect x="345" y="${G - 140}" width="30" height="60" rx="8" fill="#F28C3A"/>` +
      `<g fill="#DCE6EA" opacity="0.9"><circle cx="300" cy="${G - 160}" r="26"/><circle cx="420" cy="${G - 170}" r="22"/><circle cx="270" cy="${G - 200}" r="18"/></g>` +
      arrow([460, 140], [460, 240], { width: 8 }) +
      pill(160, 140, 'Straight down'),
  ),
};

function rain(n = 8, seed = 3) {
  let r = seed;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: n }, () => {
    const x = 120 + rnd() * 480,
      y = 20 + rnd() * 50;
    return `<path d="M ${x} ${y} l -6 18" stroke="${C.water}" stroke-width="5" stroke-linecap="round"/>`;
  }).join('');
}
