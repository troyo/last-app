// Long-haul pictures, part 2: firewood, night watch, wild food, traps, chickens, mending, finding your way, burial.
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
  lier,
  arrow,
  tick,
  cross,
  pill,
  zoom,
  handTop,
  forearm,
  cup,
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
  noSign,
  shade,
  blanket,
  cloth,
  house,
  wind,
  shake,
  num,
  rain,
} from '../kit.mjs';
import { basket, bowl, stone, moon, bed, clock, book, hammer, stick, heart } from '../props.mjs';
import {
  ME,
  YOU,
  KID,
  SICK,
  working,
  crouch,
  shovel,
  hole,
  paper,
  pencil,
  knife,
  chicken,
  egg,
  fish,
  measure,
} from '../poses.mjs';

const NIGHT = { bg: '#2E4057', blobColor: '#3A5068' };
const DUSK = { bg: '#F6DCC0', blobColor: '#F2C9A0' };
const up = (body, dy = -150) => `<g transform="translate(0,${dy})">${body}</g>`;

// ---------- things ----------
const logEnd = (x, y, r = 30, col = C.bark) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="#E2B784"/><circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="none" stroke="${C.wood}" stroke-width="3"/>`;
const pile = (x, y, cols = 6, rows = 4, r = 30) => {
  let out = '';
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      out += logEnd(x + i * r * 2 + (j % 2) * r * 0.3, y - r - j * r * 1.85, r);
  return out;
};
const log = (x1, x2, y, t = 40, col = C.bark) =>
  `<rect x="${x1}" y="${y - t}" width="${x2 - x1}" height="${t}" rx="${t / 2}" fill="${col}"/>` +
  logEnd(x2 - t / 2, y - t / 2, t / 2);
const deadTree = (x, y = G, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})" stroke="#8D8A84" stroke-linecap="round" fill="none"><path d="M 0 0 L 0 -240" stroke-width="22"/><path d="M 0 -120 L -60 -180 M 0 -160 L 56 -220 M -40 -160 L -70 -170 M 0 -220 L -30 -270" stroke-width="12"/></g>`;
const axe = (x, y, rot = 0, s = 1) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-7" y="-10" width="14" height="170" rx="7" fill="${C.wood}"/><path d="M -8 -16 L 50 -30 Q 62 0 50 26 L -8 14 Z" fill="${C.metalDark}"/></g>`;
const block = (x, y = G) =>
  `<rect x="${x - 60}" y="${y - 70}" width="120" height="70" rx="10" fill="${C.bark}"/><ellipse cx="${x}" cy="${y - 70}" rx="60" ry="14" fill="#E2B784"/>`;
const stars = (pts) =>
  pts.map(([x, y, r = 6]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF6D5"/>`).join('');
const bottleTrap = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-140" y="-50" width="250" height="100" rx="40" fill="#DCEFF7" opacity="0.85" stroke="#8FB7C9" stroke-width="5"/><path d="M -140 -46 L -60 -10 L -60 10 L -140 46" fill="#C6E2EF" stroke="#8FB7C9" stroke-width="5"/><circle cx="30" cy="20" r="14" fill="#C9A06B"/><ellipse cx="80" cy="30" rx="26" ry="18" fill="${C.stone}"/></g>`;
const hook = (x, y) =>
  `<path d="M ${x} ${y} v 30 q 0 16 -12 16 q -10 0 -10 -10" stroke="${C.metalDark}" stroke-width="4" fill="none"/><circle cx="${x - 10}" cy="${y + 40}" r="8" fill="#C9A06B"/>`;
const waterBand = (y, h = 120) =>
  `<rect x="-200" y="${y}" width="1120" height="${h}" fill="${C.water}" opacity="0.85"/><path d="M -200 ${y} ${Array.from({ length: 20 }, (_, i) => `q 30 -12 60 0`).join(' ')}" stroke="#A9CDF2" stroke-width="6" fill="none"/>`;
const rabbit = (x, y = G, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="-40" rx="50" ry="36" fill="#B79A7A"/><circle cx="44" cy="-74" r="24" fill="#B79A7A"/><ellipse cx="40" cy="-120" rx="9" ry="30" fill="#B79A7A" transform="rotate(10 40 -120)"/><ellipse cx="56" cy="-116" rx="9" ry="28" fill="#A88B6B" transform="rotate(25 56 -116)"/><circle cx="54" cy="-78" r="4" fill="${C.ink}"/><circle cx="-48" cy="-46" r="12" fill="#fff"/></g>`;
const coop = (x, y = G, s = 1, open = true) =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-130" y="-170" width="260" height="140" fill="${C.wood}"/><path d="M -150 -160 L 0 -250 L 150 -160 Z" fill="${C.coral}"/><rect x="-120" y="-30" width="14" height="30" fill="${C.woodDark}"/><rect x="106" y="-30" width="14" height="30" fill="${C.woodDark}"/><rect x="-40" y="-130" width="80" height="100" rx="6" fill="${open ? '#3B2A1E' : C.woodDark}"/>${open ? '' : `<rect x="-40" y="-130" width="80" height="100" rx="6" fill="${C.woodDark}" stroke="#4A3020" stroke-width="5"/><circle cx="28" cy="-80" r="6" fill="${C.sun}"/>`}<path d="M -40 -30 L -90 0" stroke="${C.woodDark}" stroke-width="10"/></g>`;
const glass = (x, y = G, w = 130, h = 200) =>
  `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="16" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="${x - w / 2 + 8}" y="${y - h + 40}" width="${w - 16}" height="${h - 48}" rx="10" fill="#A9CDF2"/>`;
const needle = (x, y, rot = 0, s = 1) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M 0 -6 L 150 -2 L 170 0 L 150 2 L 0 6 Q -10 0 0 -6 Z" fill="${C.metal}" stroke="${C.metalDark}" stroke-width="2"/><ellipse cx="8" cy="0" rx="7" ry="2.5" fill="#fff"/></g>`;
const fabric = (x, y, w = 420, h = 260, col = '#7FA7C9') =>
  `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="18" fill="${col}"/><path d="${Array.from({ length: Math.floor(w / 30) }, (_, i) => `M ${x - w / 2 + 15 + i * 30} ${y - h / 2 + 10} v ${h - 20}`).join(' ')}" stroke="${shade(col, 0.08)}" stroke-width="4"/>`;
const tear = (x, y) =>
  `<path d="M ${x - 130} ${y - 10} l 40 20 l 40 -24 l 40 22 l 40 -20 l 40 18 l 40 -12" stroke="#2E4A63" stroke-width="12" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
const stitches = (x, y) =>
  Array.from(
    { length: 11 },
    (_, i) =>
      `<path d="M ${x - 140 + i * 26} ${y - 34} l 16 64" stroke="${C.coral}" stroke-width="7" stroke-linecap="round"/>`,
  ).join('');
const boot = (x, y = G, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M -50 -200 L 30 -200 L 34 -80 Q 110 -70 120 -30 L 120 0 L -60 0 Z" fill="#8A5A33"/><rect x="-62" y="-16" width="186" height="16" rx="6" fill="#4A3020"/><path d="M -40 -170 h 60 M -40 -140 h 60 M -40 -110 h 60" stroke="#6B4423" stroke-width="5"/></g>`;
const whetstone = (x, y = G, w = 320) =>
  `<rect x="${x - w / 2}" y="${y - 50}" width="${w}" height="50" rx="10" fill="#9AA5A0"/><rect x="${x - w / 2}" y="${y - 50}" width="${w}" height="10" rx="5" fill="#B8C2BD"/>`;
const coinsStack = (x, y) =>
  `<ellipse cx="${x}" cy="${y}" rx="30" ry="9" fill="#E7C46A" stroke="#B8963E" stroke-width="3"/><ellipse cx="${x}" cy="${y - 12}" rx="30" ry="9" fill="#E7C46A" stroke="#B8963E" stroke-width="3"/>`;
const dandelion = (x, y = G, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})">${[-60, -20, 20, 60]
    .map(
      (a) =>
        `<path d="M 0 0 L ${a * 2.2} ${-18 - Math.abs(a) * 0.2} l -16 -10 l 0 14 l -18 -8 l 2 14 Z" fill="${C.leaf}" stroke="${C.leafDark}" stroke-width="3" transform="rotate(${a * 0.2})"/>`,
    )
    .join(
      '',
    )}<path d="M 0 0 L 0 -150" stroke="#9CC27A" stroke-width="10"/><circle cx="0" cy="-160" r="34" fill="${C.sun}"/><circle cx="0" cy="-160" r="18" fill="#F2A33A"/></g>`;
const cattail = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M 0 0 L 0 -260" stroke="#7FA35B" stroke-width="10"/><rect x="-16" y="-230" width="32" height="90" rx="16" fill="#7A4E2B"/><path d="M -10 0 Q -40 -120 -30 -220 M 10 0 Q 40 -130 34 -200" stroke="${C.leaf}" stroke-width="12" fill="none"/></g>`;
const acorn = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="10" rx="24" ry="30" fill="#C98B4E"/><path d="M -28 -6 Q 0 -30 28 -6 Q 0 4 -28 -6 Z" fill="#7A5434"/><rect x="-3" y="-30" width="6" height="12" fill="#7A5434"/></g>`;
const pineBranch = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M -120 0 L 120 -20" stroke="${C.wood}" stroke-width="10" stroke-linecap="round"/>${Array.from({ length: 12 }, (_, i) => `<path d="M ${-110 + i * 20} ${-i * 1.6} l 18 -34 M ${-110 + i * 20} ${-i * 1.6} l 18 30" stroke="#2F7A4A" stroke-width="6" stroke-linecap="round"/>`).join('')}</g>`;
const mushroom = (x, y = G, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-14" y="-80" width="28" height="80" rx="10" fill="#F2EBDD"/><path d="M -60 -70 Q 0 -150 60 -70 Z" fill="#E8D6B5"/><circle cx="-20" cy="-96" r="8" fill="#fff"/><circle cx="16" cy="-104" r="6" fill="#fff"/></g>`;
const whiteBerries = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M 0 0 Q 10 -60 0 -120" stroke="${C.leafDark}" stroke-width="6" fill="none"/><ellipse cx="-30" cy="-110" rx="26" ry="12" fill="${C.leaf}"/>${[
    [-14, -60],
    [14, -70],
    [0, -40],
    [20, -40],
    [-18, -86],
  ]
    .map(
      ([a, b]) =>
        `<circle cx="${a}" cy="${b}" r="12" fill="#F6F6F0" stroke="#C9C2B4" stroke-width="2"/>`,
    )
    .join('')}</g>`;
const umbel = (x, y = G, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M 0 0 L 0 -150" stroke="#7FA35B" stroke-width="8"/>${[-60, -30, 0, 30, 60].map((a) => `<path d="M 0 -150 L ${a} -190" stroke="#7FA35B" stroke-width="4"/><circle cx="${a}" cy="-196" r="14" fill="#fff" stroke="#DCD6C8" stroke-width="2"/>`).join('')}</g>`;
const flag = (x, y, col = C.coral) =>
  `<rect x="${x - 5}" y="${y - 160}" width="10" height="160" rx="4" fill="${C.wood}"/><path d="M ${x + 5} ${y - 158} l 70 22 l -70 22 Z" fill="${col}"/>`;
const pole = (x, y = G) =>
  `<rect x="${x - 7}" y="${y - 240}" width="14" height="240" fill="${C.wood}"/><rect x="${x - 40}" y="${y - 236}" width="80" height="10" rx="4" fill="${C.woodDark}"/>`;
const road = (y) =>
  `<path d="M -200 ${y} L 920 ${y}" stroke="#8C99A6" stroke-width="36"/><path d="M -200 ${y} L 920 ${y}" stroke="#fff" stroke-width="5" stroke-dasharray="30 26"/>`;
const shroud = (x, y, w = 300, h = 70) =>
  `<path d="M ${x - w / 2} ${y} Q ${x - w / 2 - 10} ${y - h} ${x - w / 2 + 50} ${y - h} L ${x + w / 2 - 30} ${y - h * 0.7} Q ${x + w / 2 + 10} ${y - h * 0.5} ${x + w / 2} ${y} Z" fill="${C.cloth}" stroke="#D8CDB4" stroke-width="5"/><path d="M ${x - w / 4} ${y - h + 4} v ${h - 6} M ${x + w / 6} ${y - h * 0.86} v ${h * 0.84}" stroke="#D8CDB4" stroke-width="7"/>`;
const flowers = (x, y = G) =>
  [-30, 0, 30]
    .map(
      (d, i) =>
        `<path d="M ${x + d} ${y} L ${x + d} ${y - 50}" stroke="${C.leafDark}" stroke-width="5"/><circle cx="${x + d}" cy="${y - 56}" r="13" fill="${['#F2A33A', '#E8909C', '#F6E7B0'][i]}"/>`,
    )
    .join('');
const marker = (x, y = G) =>
  `<rect x="${x - 50}" y="${y - 170}" width="100" height="170" rx="40" fill="#A9B4AE"/><path d="M ${x - 26} ${y - 120} h 52 M ${x - 30} ${y - 90} h 60 M ${x - 22} ${y - 60} h 44" stroke="#7F8C85" stroke-width="8" stroke-linecap="round"/>`;
const mound = (x, w = 300, h = 50) =>
  `<path d="M ${x - w / 2} ${G} Q ${x} ${G - h * 2} ${x + w / 2} ${G} Z" fill="${C.soil}"/>`;
const talk = (x, y, w = 110) =>
  `<g filter="url(#soft)"><rect x="${x - w / 2}" y="${y - 40}" width="${w}" height="70" rx="30" fill="#fff"/><path d="M ${x - 20} ${y + 28} l -14 26 l 34 -26 Z" fill="#fff"/></g><circle cx="${x - 28}" cy="${y - 5}" r="8" fill="${C.ink}"/><circle cx="${x}" cy="${y - 5}" r="8" fill="${C.ink}"/><circle cx="${x + 28}" cy="${y - 5}" r="8" fill="${C.ink}"/>`;
const sound = (x, y, f = 1) =>
  `<g stroke="${C.coral}" stroke-width="8" fill="none" stroke-linecap="round"><path d="M ${x} ${y - 30} q ${f * 24} 30 0 60"/><path d="M ${x + f * 26} ${y - 52} q ${f * 40} 52 0 104"/></g>`;
const darkMan = (o) => ({ ...o, shirt: shade(o.shirt, 0.35), pants: shade(o.pants, 0.3) });
const raised = (x, look, f = 1) =>
  person({
    head: [x + f * 4, G - 272],
    neck: [x, G - 236],
    hip: [x, G - 120],
    legs: [
      [
        [x - f * 18, G - 60],
        [x - f * 30, G - 8],
      ],
      [
        [x + f * 18, G - 60],
        [x + f * 30, G - 8],
      ],
    ],
    arms: [
      [
        [x + f * 10, G - 300],
        [x + f * 30, G - 340],
      ],
      [
        [x + f * 20, G - 296],
        [x + f * 36, G - 334],
      ],
    ],
    facing: f,
    ...look,
  });
const chopped = (x, look, f = 1) =>
  person({
    head: [x + f * 22, G - 254],
    neck: [x + f * 12, G - 220],
    hip: [x - f * 6, G - 116],
    legs: [
      [
        [x - f * 22, G - 58],
        [x - f * 32, G - 8],
      ],
      [
        [x + f * 16, G - 58],
        [x + f * 28, G - 8],
      ],
    ],
    arms: [
      [
        [x + f * 50, G - 180],
        [x + f * 90, G - 140],
      ],
      [
        [x + f * 56, G - 176],
        [x + f * 96, G - 134],
      ],
    ],
    facing: f,
    ...look,
  });

export default {
  // ---------------- firewood ----------------
  'fw-dead': frame(
    deadTree(220, G, 1.1) +
      log(320, 520, G, 34, '#9C9488') +
      tick(220, 90) +
      tree(620, G, 0.85) +
      cross(620, 120),
  ),
  'fw-cord': frame(
    pile(140, G, 7, 4, 32) +
      measure(110, G - 10, 110, G - 240) +
      pill(80, G - 290, '4 ft', { size: 36 }) +
      measure(140, 170, 590, 170) +
      pill(400, 116, '8 ft'),
    { noGround: true },
  ),
  'fw-length': frame(
    forearm(180, 470, 200, { sleeve: YOU.shirt, skin: YOU.skin }) +
      log(140, 520, 380, 70) +
      measure(140, 300, 520, 300) +
      tick(620, 300),
    { noGround: true },
  ),
  'fw-split-a': frame(
    block(440) + logEnd(440, G - 104, 34) + axe(230, 70, -73, 1) + raised(300, YOU),
  ),
  'fw-split-b': frame(
    block(440) +
      `<path d="M 380 ${G - 70} L 420 ${G - 140} L 436 ${G - 70} Z" fill="#E2B784"/><path d="M 444 ${G - 70} L 460 ${G - 140} L 500 ${G - 70} Z" fill="#E2B784"/>` +
      chopped(300, YOU) +
      axe(410, G - 120, -100, 1) +
      shake(440, G - 160) +
      tick(620, 120),
  ),
  'fw-stack': frame(
    sun(620, 90, 40) +
      `<rect x="100" y="${G - 30}" width="400" height="16" fill="${C.woodDark}"/><rect x="110" y="${G - 14}" width="18" height="14" fill="${C.woodDark}"/><rect x="470" y="${G - 14}" width="18" height="14" fill="${C.woodDark}"/>` +
      `<g transform="translate(0,-30)">${pile(130, G, 6, 4, 30)}</g>` +
      wind(540, 260, 1),
  ),
  'fw-cover': frame(
    pile(170, G, 6, 4, 30) +
      `<path d="M 120 ${G - 240} L 560 ${G - 240} L 540 ${G - 210} L 140 ${G - 210} Z" fill="#5B8DBE"/>` +
      arrow([40, G - 120], [660, G - 120], { width: 8, color: '#9FB8C8' }) +
      rain(8, 3) +
      tick(620, 140),
  ),
  'fw-dry': frame(
    logEnd(230, 250, 90, '#9C9488') +
      `<path d="M 230 250 l -60 -30 M 230 250 l 50 -50 M 230 250 l 20 70 M 230 250 l -50 50" stroke="#7A5434" stroke-width="6" stroke-linecap="round"/>` +
      log(380, 640, 300, 60) +
      sound(330, 250) +
      tick(230, 400),
    { noGround: true },
  ),
  'fw-inside': frame(
    `<rect x="60" y="60" width="600" height="${G - 60}" fill="#F3E3C3"/>` +
      `<rect x="420" y="160" width="140" height="${G - 160}" rx="8" fill="${C.woodDark}"/><circle cx="535" cy="${G - 130}" r="8" fill="${C.sun}"/>` +
      pile(130, G, 4, 3, 28) +
      basket(340, G, { fill: '#C9A06B' }) +
      [310, 340, 370]
        .map(
          (x) =>
            `<path d="M ${x} ${G - 66} l 10 -50" stroke="${C.bark}" stroke-width="7" stroke-linecap="round"/>`,
        )
        .join(''),
  ),

  // ---------------- night watch ----------------
  'watch-rules': frame(
    paper(360, 150, { w: 220, h: 200, lines: 3, ticks: 3 }) +
      front(170, { ...ME, scale: 0.75 }) +
      front(360, {
        ...YOU,
        scale: 0.75,
        arms: [
          null,
          [
            [410, 270],
            [430, 200],
          ],
        ],
      }) +
      front(550, { ...KID, scale: 0.65, hairStyle: 'long' }),
  ),
  'watch-meet': frame(
    clock(360, 110, 56, 9) +
      front(150, { ...ME, scale: 0.7 }) +
      front(290, { ...YOU, scale: 0.75 }) +
      front(430, { ...SICK, scale: 0.75, hairStyle: 'long', hair: HAIR[4] }) +
      front(570, { ...KID, scale: 0.6 }),
  ),
  'watch-rota': frame(
    paper(300, 260, { w: 300, h: 330, lines: 4 }) +
      [C.forest, '#E07B39', '#5B8DBE', '#F2C14E']
        .map((c, i) => `<circle cx="180" cy="${133 + i * 90}" r="22" fill="${c}"/>`)
        .join('') +
      arrow([500, 140], [500, 400], { width: 9, curve: [600, 270] }) +
      arrow([480, 400], [480, 140], { width: 9, curve: [420, 270], color: C.action }),
    { noGround: true },
  ),
  'watch-two': frame(
    moon(600, 100, 40) +
      stars([
        [120, 90],
        [200, 140],
        [480, 70],
        [380, 120],
      ]) +
      frontSit(290, { ...YOU, scale: 0.85 }) +
      frontSit(440, { ...ME, scale: 0.85 }) +
      pill(360, 120, '2-3 hr'),
    NIGHT,
  ),
  'watch-dark': frame(
    moon(620, 90, 36) +
      stars([
        [300, 80],
        [420, 130],
        [520, 70],
      ]) +
      house(140, G, 0.7, { lit: true }) +
      fire(300, G, 0.4) +
      sitter(520, { ...darkMan(YOU), facing: 1 }) +
      `<path d="M 600 ${G} Q 660 ${G - 60} 720 ${G - 40}" stroke="#4E6A84" stroke-width="30" fill="none"/>` +
      `<path d="M 548 ${G - 170} L 700 ${G - 150}" stroke="#F6E7B0" stroke-width="5" stroke-dasharray="10 12"/>`,
    NIGHT,
  ),
  'watch-signal-a': frame(
    working(300, [400, 230], YOU) +
      pot(430, 260, { scale: 0.7 }) +
      `<path d="M 400 230 L 470 170" stroke="${C.wood}" stroke-width="10" stroke-linecap="round"/>` +
      sound(520, 200) +
      moon(620, 90, 34),
    NIGHT,
  ),
  'watch-signal-b': frame(
    flag(560, G) +
      stander(220, { ...ME, scale: 0.8 }) +
      stander(340, { ...KID, scale: 0.65 }) +
      arrow([250, 200], [480, 240], { width: 9 }) +
      arrow([360, 280], [490, 330], { width: 9 }),
    NIGHT,
  ),
  'watch-wake': frame(
    bed(420, G, 300) +
      lier(320, G - 92, { ...ME, scale: 0.8 }) +
      blanket(350, 540, G - 112, G - 66, '#9FC3E0') +
      working(160, [290, G - 110], YOU) +
      shake(300, G - 120) +
      cross(620, 110) +
      tick(110, 110),
    NIGHT,
  ),
  'watch-hand': frame(
    stander(240, { ...darkMan(YOU) }) +
      stander(480, { ...ME, facing: -1 }) +
      talk(320, 110) +
      arrow([300, 300], [420, 300], { width: 8 }) +
      moon(620, 80, 32),
    NIGHT,
  ),

  // ---------------- wild food ----------------
  'for-sure': frame(
    book(220, 200, { scale: 1.1 }) +
      dandelion(220, 210, 0.45) +
      dandelion(470, G, 0.9) +
      tick(600, 140) +
      arrow([330, 200], [420, 260], { width: 8 }),
  ),
  'for-dandelion': frame(dandelion(360, G, 1.5) + tick(600, 110)),
  'for-cattail': frame(
    waterBand(G - 60, 80) +
      cattail(200, G, 1) +
      cattail(260, G, 0.9) +
      cattail(320, G, 1.05) +
      zoom(
        560,
        220,
        110,
        `<rect x="-20" y="-80" width="40" height="160" rx="18" fill="#F7F3E6" stroke="#D8CDB4" stroke-width="4"/><path d="M -20 -80 Q -60 -120 -40 -150 M 20 -80 Q 60 -120 40 -150" stroke="${C.leaf}" stroke-width="12" fill="none"/>`,
        { from: [320, G - 40] },
      ),
  ),
  'for-acorn': frame(
    acorn(140, G - 30, 1.3) +
      acorn(210, G - 20, 1.1) +
      fire(450, G, 0.5) +
      pot(450, G - 40, { scale: 1.1, water: true, boil: true, steam: true }) +
      arrow([550, 230], [550, 120], { width: 8, curve: [640, 180] }) +
      arrow([520, 110], [520, 230], { width: 8, curve: [440, 170] }) +
      arrow([250, G - 60], [360, G - 80], { width: 8 }),
  ),
  'for-pine': frame(
    pineBranch(220, 200, 1.1) +
      cup(480, G, { scale: 2.4, color: C.clay, steam: true }) +
      arrow([300, 260], [400, 320], { width: 8 }),
  ),
  'for-no': frame(
    mushroom(140, G - 20, 1.1) +
      noSign(140, G - 90, 95) +
      whiteBerries(360, G - 20, 1.2) +
      noSign(360, G - 90, 95) +
      umbel(580, G - 20, 0.9) +
      noSign(580, G - 110, 100),
  ),
  'for-small': frame(
    `<g transform="translate(250,280) rotate(-20)"><rect x="0" y="-8" width="180" height="16" rx="8" fill="${C.metal}"/><ellipse cx="-20" cy="0" rx="44" ry="28" fill="${C.metal}"/><ellipse cx="-20" cy="-6" rx="30" ry="16" fill="#9CC27A"/></g>` +
      pill(520, 200, '1 a day') +
      tick(520, 310),
    { noGround: true },
  ),

  // ---------------- traps ----------------
  'trap-fish': frame(
    waterBand(G - 120, 160) +
      bottleTrap(400, G - 40, 0.8) +
      fish(180, G - 40, 0.6) +
      arrow([240, G - 40], [290, G - 40], { width: 7 }) +
      moon(600, 100, 40) +
      `<path d="M 400 ${G - 80} L 400 120" stroke="${C.ink}" stroke-width="3"/>`,
    { ...NIGHT },
  ),
  'trap-bottle': frame(
    bottleTrap(380, 280, 1.4) +
      fish(120, 290, 0.6) +
      arrow([180, 290], [200, 290], { width: 7 }) +
      `<path d="M 380 210 L 380 60" stroke="${C.ink}" stroke-width="4"/>`,
    { noGround: true },
  ),
  'trap-lines': frame(
    waterBand(G - 90, 140) +
      tree(110, G - 60, 1.1) +
      `<path d="M 150 160 Q 400 140 640 190" stroke="${C.wood}" stroke-width="16" fill="none" stroke-linecap="round"/>` +
      [280, 380, 480, 580]
        .map(
          (x, i) =>
            `<path d="M ${x} ${155 + i * 6} L ${x} ${G - 40}" stroke="${C.ink}" stroke-width="3"/>` +
            hook(x, G - 40),
        )
        .join(''),
  ),
  'trap-weir': frame(
    `<rect x="40" y="60" width="640" height="400" rx="30" fill="${C.water}" opacity="0.85"/>` +
      [
        [140, 120],
        [200, 170],
        [260, 220],
        [320, 270],
        [140, 420],
        [200, 370],
        [260, 320],
      ]
        .map(([x, y]) => rock(x, y + 22, 64, 44, C.stone))
        .join('') +
      `<path d="M 360 230 L 520 200 L 600 270 L 520 340 L 360 310" stroke="${C.stoneDark}" stroke-width="28" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      fish(480, 270, 0.7, 1, '#E9A23B') +
      arrow([90, 270], [300, 270], { width: 9, color: '#fff' }),
    { noGround: true },
  ),
  'trap-snare': frame(
    `<path d="M 40 ${G - 6} Q 360 ${G - 30} 680 ${G - 6}" stroke="#C9B48F" stroke-width="30" fill="none"/>` +
      `<rect x="250" y="${G - 220}" width="14" height="220" fill="${C.wood}"/><path d="M 262 ${G - 200} L 330 ${G - 200}" stroke="${C.metalDark}" stroke-width="4"/>` +
      `<ellipse cx="350" cy="${G - 140}" rx="44" ry="52" fill="none" stroke="${C.metalDark}" stroke-width="5"/>` +
      measure(430, G - 90, 430, G - 4) +
      rabbit(580, G, 0.9) +
      zoom(
        130,
        140,
        80,
        handTop(0, 30, { rot: 0, scale: 1 }) +
          `<circle cx="0" cy="-10" r="70" fill="none" stroke="${C.metalDark}" stroke-width="6"/>`,
      ),
  ),
  'trap-check': frame(
    `<path d="M 40 ${G} A 70 70 0 0 1 180 ${G} Z" fill="${C.sun}"/>` +
      `<path d="M 540 ${G} A 70 70 0 0 1 680 ${G} Z" fill="#F2A33A"/>` +
      bottleTrap(420, G - 40, 0.9) +
      stander(260, { ...YOU }) +
      basket(330, G - 150, { scale: 0.5 }),
  ),
  'trap-cook': frame(
    fire(360, G, 0.8) +
      `<path d="M 200 ${G} L 230 ${G - 200} M 520 ${G} L 490 ${G - 200}" stroke="${C.wood}" stroke-width="12"/><path d="M 200 ${G - 196} L 540 ${G - 196}" stroke="${C.wood}" stroke-width="10" stroke-linecap="round"/>` +
      fish(360, G - 196, 0.9, 1, '#C9925A') +
      tick(620, 110),
  ),

  // ---------------- chickens ----------------
  'chk-coop': frame(
    coop(320, G, 1) +
      chicken(520, G, { scale: 0.8 }) +
      chicken(620, G, { scale: 0.7, facing: -1, color: '#C9773E' }) +
      tick(110, 110),
  ),
  'chk-perch': frame(
    `<rect x="60" y="60" width="600" height="${G - 60}" fill="#E8D2AE"/>` +
      `<rect x="80" y="210" width="340" height="14" rx="6" fill="${C.woodDark}"/>` +
      chicken(170, 210, { scale: 0.65 }) +
      chicken(320, 210, { scale: 0.65, color: '#C9773E' }) +
      `<rect x="470" y="${G - 130}" width="160" height="130" rx="8" fill="${C.wood}"/><path d="M 486 ${G - 110} q 64 -30 128 0 L 614 ${G - 80} L 486 ${G - 80} Z" fill="${C.straw}"/>` +
      egg(550, G - 110, 0.9),
  ),
  'chk-water': frame(
    bowl(360, G, { color: '#5B8DBE', fill: C.water }) +
      chicken(200, G, { scale: 1.2, peck: true }) +
      chicken(540, G, { scale: 1.2, facing: -1, peck: true, color: '#C9773E' }) +
      sun(620, 90, 36),
  ),
  'chk-scratch-a': frame(
    `<path d="M 40 ${G} h 640" stroke="#9CC27A" stroke-width="20"/>` +
      chicken(200, G, { scale: 1.2, peck: true }) +
      chicken(470, G, { scale: 1.2, color: '#C9773E' }) +
      `<circle cx="270" cy="${G - 6}" r="5" fill="${C.ink}"/><circle cx="290" cy="${G - 10}" r="4" fill="${C.ink}"/>` +
      sun(620, 90, 36),
  ),
  'chk-scratch-b': frame(
    `<path d="M 40 ${G} h 640" stroke="#9CC27A" stroke-width="20"/>` +
      working(600, [500, 260], ME, { facing: -1 }) +
      chicken(170, G, { scale: 1.1, peck: true }) +
      chicken(340, G, { scale: 1.1, color: '#C9773E', peck: true }) +
      [
        [440, 300],
        [420, 350],
        [400, 390],
      ]
        .map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="12" rx="4" fill="#8BB35A"/>`)
        .join(''),
  ),
  'chk-shut': frame(coop(360, G, 1.1, false) + moon(600, 100, 36) + tick(120, 110), DUSK),
  'chk-eggs': frame(
    `<rect x="120" y="${G - 150}" width="200" height="150" rx="8" fill="${C.wood}"/><path d="M 140 ${G - 126} q 80 -30 160 0 L 300 ${G - 90} L 140 ${G - 90} Z" fill="${C.straw}"/>` +
      egg(200, G - 120, 0.9) +
      egg(250, G - 116, 0.9, 10, '#E8C9A0') +
      basket(500, G, { fill: '#F3E1C7' }) +
      [470, 500, 530].map((x) => egg(x, G - 70, 0.7)).join('') +
      arrow([300, G - 200], [450, G - 120], { width: 8, curve: [380, G - 240] }),
  ),
  'chk-float': frame(
    glass(220) +
      egg(220, G - 40, 1, 80) +
      tick(220, 120) +
      glass(500) +
      egg(500, G - 160, 1, 0) +
      cross(500, 120),
  ),

  // ---------------- mending ----------------
  'mend-thread': frame(
    needle(170, 200, 0, 1.4) +
      `<path d="M 182 200 Q 120 260 200 320 Q 360 420 600 300" stroke="${C.coral}" stroke-width="7" fill="none"/><circle cx="600" cy="300" r="14" fill="${C.coral}"/>` +
      forearm(160, 520, 430, { sleeve: YOU.shirt, skin: YOU.skin, thick: 50 }),
    { noGround: true },
  ),
  'mend-tear-a': frame(fabric(360, 260) + tear(360, 260) + needle(520, 120, 140, 1), {
    noGround: true,
  }),
  'mend-tear-b': frame(
    fabric(360, 260) +
      tear(360, 260) +
      stitches(360, 260) +
      needle(520, 200, 200, 1) +
      tick(620, 110),
    { noGround: true },
  ),
  'mend-patch': frame(
    fabric(360, 260, 460, 300) +
      `<rect x="250" y="170" width="220" height="180" rx="14" fill="#E9A23B"/><rect x="250" y="170" width="220" height="180" rx="14" fill="none" stroke="${C.coral}" stroke-width="6" stroke-dasharray="14 10"/>` +
      tick(620, 110),
    { noGround: true },
  ),
  'mend-boot': frame(
    boot(240, G, 1.1) +
      jar(450, G, { fill: '#F6E7B0', lid: '#C9A06B' }) +
      cloth(340, 180, 90, 60, C.cloth, -20) +
      fire(610, G, 0.5) +
      cross(610, 220),
  ),
  'mend-coins': frame(
    whetstone(360, G) +
      knife(190, G - 90, -8, 1.6) +
      coinsStack(470, G - 52) +
      zoom(
        560,
        140,
        90,
        `<path d="M -80 40 L 80 40" stroke="#9AA5A0" stroke-width="18"/><path d="M -80 30 L 80 -10" stroke="#C9D3DC" stroke-width="10"/><ellipse cx="60" cy="20" rx="20" ry="7" fill="#E7C46A"/><ellipse cx="60" cy="8" rx="20" ry="7" fill="#E7C46A"/>`,
        { from: [470, G - 70] },
      ),
  ),
  'mend-knife-a': frame(
    whetstone(360, G) +
      knife(150, G - 70, -4, 1.6) +
      arrow([300, G - 130], [520, G - 130], { width: 9 }),
  ),
  'mend-knife-b': frame(
    whetstone(360, G) +
      knife(570, G - 70, 184, 1.6) +
      arrow([420, G - 130], [200, G - 130], { width: 9 }) +
      pill(360, 140, '10x'),
  ),
  'mend-oil': frame(
    hammer(220, 220, -30, 1.4) +
      knife(330, 320, -10, 1.2) +
      `<path d="M 560 130 q -18 30 0 40 q 18 -10 0 -40 Z" fill="#E7C46A"/><path d="M 520 190 q -14 24 0 32 q 14 -8 0 -32 Z" fill="#E7C46A"/>` +
      cloth(560, 320, 120, 70, C.cloth, 10),
    { noGround: true },
  ),

  // ---------------- finding your way ----------------
  'way-tell': frame(
    stander(200, { ...YOU }) +
      stander(330, { ...ME, scale: 0.95 }) +
      stander(560, { ...SICK, facing: -1, hairStyle: 'long', hair: HAIR[4] }) +
      talk(420, 120) +
      clock(620, 110, 46, 5),
  ),
  'way-sun': frame(
    `<path d="M 100 ${G} Q 360 -40 620 ${G}" stroke="${C.sun}" stroke-width="6" stroke-dasharray="14 12" fill="none"/>` +
      sun(130, G - 60, 30) +
      sun(360, 140, 40) +
      sun(590, G - 60, 30) +
      pill(110, G - 150, 'E') +
      pill(360, 250, 'S') +
      pill(610, G - 150, 'W'),
  ),
  'way-stick1': frame(
    sun(140, 100, 40) +
      `<rect x="294" y="${G - 220}" width="12" height="220" rx="5" fill="${C.wood}"/><path d="M 300 ${G} L 560 ${G + 30}" stroke="rgba(18,56,45,0.3)" stroke-width="14" stroke-linecap="round"/>` +
      stone(560, G + 44, 50, 30) +
      num(560, G - 60, 1, 36),
  ),
  'way-stick2': frame(
    sun(200, 90, 40) +
      `<rect x="294" y="${G - 220}" width="12" height="220" rx="5" fill="${C.wood}"/><path d="M 300 ${G} L 540 ${G + 70}" stroke="rgba(18,56,45,0.3)" stroke-width="14" stroke-linecap="round"/>` +
      stone(560, G + 44, 50, 30) +
      stone(540, G + 84, 50, 30, '#C98B5E') +
      num(620, G + 20, 2, 36) +
      clock(600, 140, 50, 3) +
      pill(600, 250, '15 min'),
  ),
  'way-north': frame(
    stone(300, G + 14, 60, 34) +
      stone(420, G + 14, 60, 34, '#C98B5E') +
      front(360, { ...YOU }) +
      num(250, G - 60, 1, 36) +
      num(470, G - 60, 2, 36) +
      arrow([360, 90], [360, 30], { width: 10, color: C.action }) +
      pill(470, 70, 'N'),
  ),
  'way-star': frame(
    stars([
      [140, 330, 9],
      [200, 360, 9],
      [270, 360, 9],
      [320, 320, 9],
      [330, 250, 10],
      [400, 250, 10],
      [440, 330, 9],
      [312, 74, 16],
    ]) +
      `<path d="M 140 330 L 200 360 L 270 360 L 320 320 L 330 250 L 400 250 L 440 330 L 320 320" stroke="#FFF6D5" stroke-width="3" fill="none" opacity="0.6"/>` +
      `<path d="M 400 250 L 320 92" stroke="${C.sun}" stroke-width="6" stroke-dasharray="14 12"/>` +
      pill(420, 74, 'N', { bg: C.sun }),
    { ...NIGHT, noGround: true },
  ),
  'way-mark': frame(
    `<path d="M 40 ${G - 10} Q 300 ${G - 40} 400 ${G - 120} T 700 ${G - 220}" stroke="#C9B48F" stroke-width="40" fill="none"/>` +
      tree(560, G - 80, 0.8) +
      `<rect x="550" y="${G - 210}" width="20" height="36" rx="4" fill="${C.coral}"/>` +
      `<g>${rock(260, G - 30, 60, 30)}${rock(260, G - 56, 44, 26)}${rock(260, G - 78, 30, 20)}</g>` +
      arrow([120, G - 80], [210, G - 100], { width: 8 }),
  ),
  'way-lines': frame(
    road(G - 20) +
      `<path d="M 40 ${G - 60} Q 300 ${G - 110} 520 ${G - 80}" stroke="${C.water}" stroke-width="22" fill="none"/>` +
      pole(160) +
      pole(360) +
      `<path d="M 160 ${G - 230} Q 260 ${G - 200} 360 ${G - 230} Q 460 ${G - 200} 560 ${G - 230}" stroke="${C.ink}" stroke-width="3" fill="none"/>` +
      house(590, G - 40, 0.7) +
      arrow([200, 120], [480, 120], { width: 10 }),
  ),

  // ---------------- burial ----------------
  'death-bye': frame(
    bed(440, G, 320) +
      lier(320, G - 92, { ...SICK, scale: 0.85, face: 'closed', hair: '#D9D4CC' }) +
      blanket(340, 590, G - 116, G - 66, '#9FC3E0') +
      stander(160, { ...YOU, scale: 0.95, face: 'calm' }) +
      heart(440, 120, 1.3),
  ),
  'death-note': frame(paper(360, 260, { w: 300, h: 340, lines: 4 }) + pencil(500, 380, -30, 1.2), {
    noGround: true,
  }),
  'death-wrap': frame(
    shroud(360, G, 420, 90) +
      zoom(140, 140, 80, handTop(0, 30, { skin: '#9FC3E0' })) +
      zoom(
        580,
        140,
        80,
        `<rect x="-60" y="-10" width="120" height="70" rx="14" fill="${C.water}"/>` +
          handTop(-10, 10, { scale: 0.7 }),
      ),
  ),
  'death-spot': frame(
    `<path d="M 40 ${G} Q 160 ${G - 16} 260 ${G}" stroke="${C.water}" stroke-width="24" fill="none"/>` +
      flag(440, G) +
      measure(150, G - 40, 430, G - 40) +
      pill(290, G - 100, '200 ft') +
      house(620, G, 0.5) +
      cross(620, 200),
  ),
  'death-grave': frame(
    up(
      hole(360, 340, 240) +
        shroud(360, G + 230, 300, 60) +
        `<rect x="190" y="${G}" width="340" height="160" fill="#B9875C" opacity="0.6"/>` +
        measure(580, G + 4, 580, G + 232) +
        pill(640, G + 120, '5 ft'),
      -170,
    ),
    { noGround: true },
  ),
  'death-mark': frame(
    mound(360, 300) +
      marker(360, G - 30) +
      flowers(250, G - 10) +
      stander(110, { ...ME, scale: 0.8, face: 'closed' }) +
      stander(600, { ...YOU, scale: 0.85, facing: -1, face: 'closed' }),
  ),
};
