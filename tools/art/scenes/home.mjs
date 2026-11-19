// Power-out pictures at home: light, cooking, toilet, keeping food cold, keeping cool, phone, storing water.
import {
  C,
  SKIN,
  HAIR,
  GROUND as G,
  frame,
  person,
  stander,
  front,
  frontSit,
  sitter,
  arrow,
  tick,
  cross,
  pill,
  zoom,
  handTop,
  cup,
  jar,
  bucket,
  pot,
  fire,
  flame,
  logs,
  tree,
  sun,
  noSign,
  text,
  shade,
  rain,
  house,
  wind,
  cloth,
} from '../kit.mjs';
import {
  fridge,
  phone,
  flashlight,
  candle,
  generator,
  car,
  toilet,
  windowFrame,
  tub,
  brick,
  bowl,
  sack,
  clock,
  table,
  moon,
  bed,
  heart,
} from '../props.mjs';

const ME = { shirt: '#5B8DBE', skin: SKIN[0], hair: HAIR[0], pants: '#34495E' };
const ME2 = { shirt: '#E07B39', skin: SKIN[1], hair: HAIR[4], hairStyle: 'long', pants: '#4B3F72' };

const wall = (body, o = {}) =>
  `<rect x="60" y="60" width="600" height="${G - 60}" fill="${o.night ? '#3A4E63' : '#F3E3C3'}"/><rect x="60" y="${G - 16}" width="600" height="16" fill="${C.wood}"/>` +
  body;

const bag = (x, y, s = 1, col = '#3A4048') =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M -60 0 Q -70 -80 -40 -120 L 40 -120 Q 70 -80 60 0 Z" fill="${col}"/><path d="M -20 -120 q 20 -40 40 0" stroke="${col}" stroke-width="12" fill="none"/></g>`;

const cooler = (x, y = G, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-110" y="-130" width="220" height="130" rx="16" fill="#5B8DBE"/><rect x="-118" y="-150" width="236" height="30" rx="10" fill="#F4F6F5"/><rect x="-30" y="-170" width="60" height="22" rx="8" fill="#F4F6F5"/></g>`;

const bulb = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><circle cx="0" cy="0" r="40" fill="${C.sun}" opacity="0.25"/><circle cx="0" cy="0" r="24" fill="#FFF3C4"/></g>`;

const thermo = (x, y, hot) =>
  `<g transform="translate(${x},${y})"><rect x="-14" y="-90" width="28" height="120" rx="14" fill="#fff" stroke="${C.ink}" stroke-width="4"/><circle cx="0" cy="40" r="22" fill="${hot ? C.coral : C.water}"/><rect x="-6" y="${hot ? -70 : -10}" width="12" height="${hot ? 110 : 50}" rx="6" fill="${hot ? C.coral : C.water}"/></g>`;

export default {
  // ---------------- power ----------------
  'power-light': frame(wall(flashlight(230, 260, -10, 1.3), { night: true }) + tick(600, 120), {
    noGround: true,
  }),
  'power-no-candle': frame(
    wall(candle(360, G - 16, 1.6), { night: true }) + noSign(360, G - 110, 120),
    { noGround: true },
  ),
  'power-fridge': frame(
    fridge(300, G) +
      `<g transform="translate(300,${G - 200})"><rect x="-60" y="-20" width="120" height="40" rx="8" fill="${C.coral}"/></g>` +
      text(300, G - 188, 'SHUT', { size: 36, color: '#fff' }) +
      pill(540, 160, '4 hours') +
      tick(540, 280),
  ),
  'power-unplug': frame(
    `<rect x="120" y="140" width="260" height="170" rx="14" fill="${C.ink}"/><rect x="134" y="154" width="232" height="142" rx="8" fill="#3B5A6E"/><rect x="230" y="310" width="40" height="40" fill="${C.ink}"/><rect x="190" y="346" width="120" height="14" rx="6" fill="${C.ink}"/>` +
      `<path d="M 300 340 Q 400 380 460 300" stroke="${C.ink}" stroke-width="8" fill="none"/><rect x="460" y="270" width="50" height="60" rx="10" fill="#E8EEF2" stroke="#B9C4CB" stroke-width="4"/>` +
      `<rect x="560" y="260" width="80" height="80" rx="10" fill="#F4F6F5" stroke="#C9D2CE" stroke-width="4"/>` +
      arrow([500, 230], [430, 230], { width: 8 }),
  ),
  'power-phone': frame(
    phone(360, 260, {
      scale: 1.6,
      screen: '#5E6B78',
      body: `<rect x="-26" y="-20" width="52" height="28" rx="6" fill="none" stroke="${C.sun}" stroke-width="5"/><rect x="-22" y="-16" width="14" height="20" fill="${C.sun}"/><rect x="26" y="-10" width="6" height="12" fill="${C.sun}"/>`,
    }) +
      pill(570, 160, 'Low power') +
      pill(570, 260, 'Dim screen'),
    { noGround: true },
  ),
  'power-no-generator': frame(
    `<path d="M 80 ${G} L 80 200 L 260 80 L 440 200 L 440 ${G} Z" fill="#F3E3C3" stroke="${C.wood}" stroke-width="8"/>` +
      generator(260, G, 0.9) +
      noSign(260, G - 70, 110) +
      generator(580, G, 0.8) +
      tick(580, 180) +
      `<g fill="#B9C4C9" opacity="0.8"><circle cx="660" cy="320" r="18"/><circle cx="680" cy="290" r="14"/></g>`,
  ),
  // ---------------- light ----------------
  'light-ceiling': frame(
    wall(
      `<ellipse cx="360" cy="90" rx="200" ry="40" fill="${C.sun}" opacity="0.4"/>` +
        flashlight(360, G - 60, -90, 1.2),
      { night: true },
    ) + arrow([500, 300], [500, 140], { width: 8 }),
    { noGround: true },
  ),
  'light-jug': frame(
    wall(
      `<circle cx="360" cy="${G - 140}" r="120" fill="${C.sun}" opacity="0.25"/>` +
        `<g transform="translate(360,${G - 16})"><rect x="-70" y="-200" width="140" height="200" rx="30" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="-62" y="-170" width="124" height="164" rx="24" fill="#FFF3C4" opacity="0.9"/><rect x="-24" y="-226" width="48" height="30" rx="8" fill="${C.forest}"/><rect x="-80" y="-130" width="160" height="22" rx="10" fill="${C.ink}"/><circle cx="0" cy="-119" r="14" fill="${C.sun}"/></g>`,
      { night: true },
    ),
    { noGround: true },
  ),
  'light-oil': frame(
    jar(300, G, { scale: 1.6, fill: '#F2C94C', level: 50 }) +
      `<rect x="246" y="${G - 186}" width="108" height="10" fill="#C9D2CE"/><rect x="294" y="${G - 210}" width="12" height="130" rx="4" fill="${C.cloth}"/>` +
      `<g transform="translate(540,${G})"><rect x="-50" y="-130" width="100" height="130" rx="16" fill="#F2C94C"/><rect x="-20" y="-150" width="40" height="24" rx="6" fill="${C.leafDark}"/></g>` +
      pill(540, 170, 'Cooking oil') +
      pill(170, 140, 'Cloth wick'),
  ),
  'light-lamp-a': frame(
    jar(360, G - 20, { scale: 1.6, fill: '#F2C94C', level: 50 }) +
      `<rect x="306" y="${G - 206}" width="108" height="10" fill="#C9D2CE"/><rect x="354" y="${G - 230}" width="12" height="130" rx="4" fill="${C.cloth}"/>` +
      `<ellipse cx="360" cy="${G - 10}" rx="130" ry="16" fill="#F4F6F5" stroke="#C9D2CE" stroke-width="4"/>` +
      pill(580, 160, '5 min'),
  ),
  'light-lamp-b': frame(
    jar(360, G - 20, { scale: 1.6, fill: '#F2C94C', level: 50 }) +
      `<rect x="306" y="${G - 206}" width="108" height="10" fill="#C9D2CE"/><rect x="354" y="${G - 230}" width="12" height="40" rx="4" fill="${C.cloth}"/>` +
      flame(360, G - 226, 0.5) +
      `<ellipse cx="360" cy="${G - 10}" rx="130" ry="16" fill="#F4F6F5" stroke="#C9D2CE" stroke-width="4"/>` +
      tick(580, 160),
  ),
  'light-no-sleep': frame(
    wall(
      bed(400, G - 16, 380) +
        `<circle cx="300" cy="${G - 100}" r="28" fill="${SKIN[1]}"/><path d="M 330 ${G - 120} L 580 ${G - 120} L 590 ${G - 70} L 320 ${G - 70} Z" fill="#9CC4DE"/>` +
        candle(130, G - 16, 1) +
        noSign(130, G - 80, 70) +
        `<text x="420" y="160" font-family="Inter" font-weight="800" font-size="44" fill="#fff">z z</text>`,
      { night: true },
    ),
    { noGround: true },
  ),
  // ---------------- cook ----------------
  'cook-outside': frame(
    house(220, G, 1, {}) +
      fire(520, G, 0.7) +
      pot(520, G - 60, { scale: 0.6, steam: true }) +
      arrow([350, 200], [450, 200], { width: 8, color: C.forest }) +
      arrow([450, 200], [350, 200], { width: 8, color: C.forest }) +
      tick(620, 110),
  ),
  'cook-match': frame(
    `<rect x="140" y="${G - 60}" width="440" height="60" rx="10" fill="#4A545E"/><ellipse cx="300" cy="${G - 66}" rx="80" ry="16" fill="#2B2F33"/>` +
      flame(300, G - 70, 0.5) +
      `<g transform="translate(380,${G - 120}) rotate(-30)"><rect x="-4" y="-80" width="8" height="90" fill="${C.wood}"/><circle cx="0" cy="-84" r="8" fill="${C.coral}"/></g>` +
      `<circle cx="500" cy="${G - 30}" r="18" fill="#E8EEF2"/>` +
      arrow([540, 200], [500, 280], { width: 8, curve: [560, 260] }),
  ),
  'cook-bricks-a': frame(
    [0, 1]
      .map(
        (r) =>
          brick(250, G - r * 44, { w: 100, h: 44 }) + brick(470, G - r * 44, { w: 100, h: 44 }),
      )
      .join('') +
      logs(360, G - 10, 0.6) +
      flame(360, G - 16, 0.55),
  ),
  'cook-bricks-b': frame(
    [0, 1]
      .map(
        (r) =>
          brick(250, G - r * 44, { w: 100, h: 44 }) + brick(470, G - r * 44, { w: 100, h: 44 }),
      )
      .join('') +
      logs(360, G - 10, 0.6) +
      flame(360, G - 16, 0.55) +
      pot(360, G - 90, { water: true, steam: true, scale: 1.1 }),
  ),
  'cook-lid': frame(
    fire(360) +
      pot(360, 362, {}) +
      `<rect x="290" y="250" width="140" height="18" rx="8" fill="${C.metalDark}"/><rect x="345" y="236" width="30" height="16" rx="6" fill="${C.ink}"/>` +
      tick(560, 150) +
      pill(170, 150, 'Lid on'),
  ),
  'cook-soak': frame(
    bowl(360, G, { scale: 1.6, fill: C.waterLight, color: '#F4F6F5' }) +
      `<g fill="#A0453A">${Array.from({ length: 10 }, (_, i) => `<ellipse cx="${300 + ((i * 23) % 120)}" cy="${G - 70 + (i % 3) * 6}" rx="10" ry="7"/>`).join('')}</g>` +
      pill(560, 150, 'Overnight'),
  ),
  // ---------------- toilet ----------------
  'toilet-flush-a': frame(toilet(300, G, 1.2) + bucket(500, G - 120, { water: true, scale: 0.8 })),
  'toilet-flush-b': frame(
    toilet(300, G, 1.2) +
      `<g transform="translate(420,180) rotate(-60)">${bucket(0, 0, { water: true, scale: 0.8 })}</g>` +
      `<path d="M 320 220 C 300 240 290 260 280 ${G - 150}" stroke="${C.water}" stroke-width="20" fill="none" stroke-linecap="round"/>`,
  ),
  'toilet-bags': frame(
    bucket(360, G, { scale: 1.5, color: '#C9D2CE' }) +
      `<path d="M 270 ${G - 150} Q 360 ${G - 110} 450 ${G - 150} L 460 ${G - 170} L 260 ${G - 170} Z" fill="#3A4048"/>` +
      pill(560, 150, '2 bags'),
  ),
  'toilet-cover-a': frame(
    bucket(300, G, { scale: 1.4, color: '#C9D2CE' }) +
      `<path d="M 220 ${G - 140} Q 300 ${G - 100} 380 ${G - 140} L 390 ${G - 156} L 210 ${G - 156} Z" fill="#3A4048"/>` +
      sack(540, G, { label: 'dirt' }),
  ),
  'toilet-cover-b': frame(
    bucket(300, G, { scale: 1.4, color: '#C9D2CE' }) +
      `<path d="M 220 ${G - 140} Q 300 ${G - 100} 380 ${G - 140} L 390 ${G - 156} L 210 ${G - 156} Z" fill="#3A4048"/>` +
      cup(380, 180, { rot: 120, color: C.wood }) +
      `<g fill="${C.soil}">${[0, 1, 2, 3].map((i) => `<circle cx="${330 + i * 8}" cy="${200 + i * 16}" r="6"/>`).join('')}</g>` +
      pill(560, 150, 'Every time'),
  ),
  'toilet-tie': frame(
    bag(280, G, 1.3) +
      `<rect x="252" y="${G - 158}" width="56" height="14" rx="6" fill="${C.sun}"/>` +
      `<g transform="translate(520,${G})"><rect x="-80" y="-170" width="160" height="170" rx="14" fill="${C.forest}"/><rect x="-90" y="-190" width="180" height="26" rx="10" fill="${shade(C.forest, 0.2)}"/></g>` +
      arrow([360, 200], [430, 200], { width: 8 }) +
      pill(520, 110, 'Outside'),
  ),
  // ---------------- food cold ----------------
  'food-shut': frame(
    fridge(360, G) +
      `<g filter="url(#soft)"><rect x="300" y="${G - 220}" width="120" height="44" rx="10" fill="${C.coral}"/></g>` +
      text(360, G - 186, 'SHUT', { size: 34, color: '#fff' }) +
      tick(560, 150),
  ),
  'food-freezer': frame(
    `<g transform="translate(360,${G})"><rect x="-160" y="-170" width="320" height="170" rx="18" fill="#E8EEF2" stroke="#B9C4CB" stroke-width="5"/><rect x="-170" y="-186" width="340" height="24" rx="10" fill="#D5DDE2"/></g>` +
      noSign(360, G - 90, 70) +
      pill(360, 150, '2 days if full'),
  ),
  'food-cooler': frame(
    fridge(170, G, { scale: 0.8 }) +
      cooler(480, G) +
      `<g>${[
        [440, G - 180],
        [500, G - 190],
      ]
        .map(
          ([x, y]) =>
            `<rect x="${x}" y="${y}" width="40" height="40" rx="6" fill="#D6EEFA" stroke="#9CC4DE" stroke-width="3"/>`,
        )
        .join('')}</g>` +
      arrow([270, 200], [400, 200], { width: 8 }) +
      pill(480, 110, 'Before 4 hrs'),
  ),
  'food-cook-a': frame(
    fire(360) +
      pot(360, 362, {}) +
      `<rect x="300" y="250" width="120" height="40" rx="14" fill="#C9574A"/>`,
  ),
  'food-cook-b': frame(fire(360) + pot(360, 362, { steam: true }) + pill(560, 150, 'Eat today')),
  'food-bin': frame(
    `<g transform="translate(300,${G})"><rect x="-90" y="-180" width="180" height="180" rx="14" fill="${C.metal}"/><rect x="-100" y="-200" width="200" height="26" rx="10" fill="${C.metalDark}"/></g>` +
      bowl(300, 140, { fill: '#9DB06A', scale: 0.8 }) +
      arrow([300, 180], [300, 220], { width: 8 }) +
      pill(540, 160, 'Not sure?') +
      pill(540, 260, 'Throw out'),
  ),
  // ---------------- keep cool ----------------
  'cool-curtain': frame(
    wall(windowFrame(360, 220, 220, 200, { curtain: '#E07B39' }) + sun(600, 110, 30)) +
      tick(140, 120),
    { noGround: true },
  ),
  'cool-low': frame(
    `<rect x="160" y="80" width="400" height="${G - 80}" fill="#F3E3C3" stroke="${C.wood}" stroke-width="8"/><path d="M 160 250 H 560" stroke="${C.wood}" stroke-width="10"/>` +
      thermo(480, 180, true) +
      thermo(480, 360, false) +
      stander(300, { ...ME, scale: 0.6 }) +
      arrow([250, 150], [250, 300], { width: 8 }),
    { noGround: false },
  ),
  'cool-night': frame(
    wall(
      windowFrame(170, 220, 140, 160, { night: true }) +
        windowFrame(550, 220, 140, 160, { night: true }) +
        wind(250, 220, 0.9) +
        moon(360, 120, 28),
      { night: true },
    ),
    { noGround: true },
  ),
  'cool-no-car': frame(
    car(360, G, 1.3) +
      sun(600, 100, 34) +
      `<circle cx="330" cy="${G - 150}" r="22" fill="${SKIN[1]}"/>` +
      noSign(360, G - 120, 150),
    { blob: false },
  ),
  // ---------------- phone ----------------
  'phone-airplane': frame(
    phone(360, 260, {
      scale: 1.6,
      body: `<path d="M 0 -40 L 8 -10 L 40 6 L 40 16 L 8 8 L 6 34 L 16 44 L 16 50 L 0 44 L -16 50 L -16 44 L -6 34 L -8 8 L -40 16 L -40 6 L -8 -10 Z" fill="${C.ink}"/>`,
    }) + pill(580, 170, 'Airplane'),
    { noGround: true },
  ),
  'phone-paper': frame(
    phone(240, 250, { scale: 1.3 }) +
      `<g transform="translate(480,260) rotate(4)"><rect x="-120" y="-150" width="240" height="300" rx="10" fill="#fff" filter="url(#soft)"/>${[0, 1, 2, 3, 4].map((i) => `<text x="-96" y="${-100 + i * 56}" font-family="Inter" font-weight="800" font-size="36" fill="${C.ink}">${i + 1}.</text><path d="M -50 ${-112 + i * 56} h ${130 - (i % 2) * 40}" stroke="#B9C4BF" stroke-width="8" stroke-linecap="round"/>`).join('')}</g>` +
      arrow([320, 180], [380, 180], { width: 8 }),
    { noGround: true },
  ),
  'phone-temp': frame(
    phone(360, 260, { scale: 1.3 }) +
      thermo(180, 280, false) +
      thermo(540, 280, true) +
      `<g transform="translate(360,260)"><rect x="-90" y="-140" width="180" height="280" rx="40" fill="none" stroke="${C.sun}" stroke-width="8" stroke-dasharray="10 12"/></g>`,
    { noGround: true },
  ),
  'phone-car': frame(
    car(260, G, 1.1) +
      `<g fill="#B9C4C9" opacity="0.8"><circle cx="90" cy="${G - 40}" r="18"/><circle cx="60" cy="${G - 60}" r="14"/></g>` +
      `<path d="M 260 ${G - 100} Q 420 ${G - 160} 520 ${G - 200}" stroke="${C.ink}" stroke-width="6" fill="none"/>` +
      phone(560, G - 220, { scale: 0.7 }) +
      sun(620, 90, 30) +
      pill(420, 110, 'Outside only'),
  ),
  // ---------------- store water ----------------
  'save-fill-a': frame(
    `<rect x="200" y="100" width="20" height="60" fill="${C.metalDark}"/><rect x="190" y="90" width="80" height="20" rx="8" fill="${C.metalDark}"/>` +
      pot(220, G, { scale: 1 }) +
      jar(420, G, { scale: 1.1 }) +
      jar(540, G, { scale: 1.1 }),
  ),
  'save-fill-b': frame(
    `<rect x="200" y="100" width="20" height="60" fill="${C.metalDark}"/><rect x="190" y="90" width="80" height="20" rx="8" fill="${C.metalDark}"/><path d="M 210 160 L 210 ${G - 90}" stroke="${C.water}" stroke-width="12"/>` +
      pot(220, G, { scale: 1, water: true }) +
      jar(420, G, { scale: 1.1, fill: C.waterLight }) +
      jar(540, G, { scale: 1.1, fill: C.waterLight }) +
      tick(620, 120),
  ),
  'save-tub': frame(tub(360, G, 1.5) + pill(360, 130, 'Washing + flushing')),
  'save-gallon': frame(
    [0, 1, 2]
      .map((i) =>
        front(200 + i * 160, {
          ...[ME, ME2, { ...ME, shirt: C.forest, skin: SKIN[2] }][i],
          scale: 0.6,
        }),
      )
      .join('') +
      `<g>${[0, 1, 2].map((i) => `<g transform="translate(${250 + i * 160},${G})"><rect x="-26" y="-80" width="52" height="80" rx="12" fill="${C.waterLight}" stroke="#8FB7C9" stroke-width="4"/><rect x="-10" y="-92" width="20" height="14" rx="4" fill="#8FB7C9"/></g>`).join('')}</g>` +
      pill(360, 100, '1 gallon each a day'),
  ),
  'save-rain-a': frame(
    rain(16, 6) + bucket(260, G, { scale: 0.9 }) + bucket(460, G, { scale: 0.9 }),
  ),
  'save-rain-b': frame(
    rain(16, 8) +
      bucket(260, G, { scale: 0.9, water: true }) +
      bucket(460, G, { scale: 0.9, water: true }) +
      tick(620, 120),
  ),
};
