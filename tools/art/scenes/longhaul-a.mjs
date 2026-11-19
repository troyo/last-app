// Long-haul pictures, part 1: latrine, sharing food, caring for the sick, garden, toothache, soap, drying food.
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
  lier,
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
  plant,
  noSign,
  shade,
  blanket,
  cloth,
  num,
} from '../kit.mjs';
import { table, bowl, sack, fly, stone, moon, bed, clock, book } from '../props.mjs';
import {
  ME,
  YOU,
  KID,
  SICK,
  working,
  crouch,
  shovel,
  digger,
  hole,
  board,
  paper,
  pencil,
  can,
  knife,
  egg,
  bed as soilBed,
  sprout,
  measure,
  wateringCan,
  strips,
} from '../poses.mjs';

const up = (body, dy = -150) => `<g transform="translate(0,${dy})">${body}</g>`;
const hill = (x1, y1, x2, y2) =>
  `<path d="M ${x1 - 200} ${y1} L ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1} ${x2} ${y2} L ${x2 + 200} ${y2} L ${x2 + 200} ${G + 60} L ${x1 - 200} ${G + 60} Z" fill="#B9D3A8"/>`;
const stake = (x, y) =>
  `<rect x="${x - 6}" y="${y - 110}" width="12" height="110" rx="5" fill="${C.wood}"/><path d="M ${x + 6} ${y - 108} l 56 18 l -56 18 Z" fill="${C.coral}"/>`;
const stream = (x1, x2, y) =>
  `<path d="M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - 18} ${x2} ${y} L ${x2} ${y + 26} Q ${(x1 + x2) / 2} ${y + 14} ${x1} ${y + 26} Z" fill="${C.water}"/>`;
const screen = (x1, x2) =>
  `<rect x="${x1 - 6}" y="${G - 250}" width="12" height="250" rx="5" fill="${C.wood}"/><rect x="${x2 - 6}" y="${G - 250}" width="12" height="250" rx="5" fill="${C.wood}"/><path d="M ${x1} ${G - 236} Q ${(x1 + x2) / 2} ${G - 220} ${x2} ${G - 236} L ${x2} ${G - 30} Q ${(x1 + x2) / 2} ${G - 16} ${x1} ${G - 30} Z" fill="#7FA38E" opacity="0.92"/>`;
const ashPile = (x, y, w = 90) =>
  `<path d="M ${x - w} ${y} Q ${x} ${y - w * 0.8} ${x + w} ${y} Z" fill="#D7D3CB"/>`;
const scoop = (x, y, rot = 0) =>
  `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="0" y="-8" width="90" height="16" rx="8" fill="${C.wood}"/><path d="M -60 -26 L 4 -26 L 4 26 L -60 26 Q -76 0 -60 -26 Z" fill="${C.metal}"/><path d="M -56 -20 Q -66 -2 -56 14 L -2 14 L -2 -20 Z" fill="#D7D3CB"/></g>`;
const apple = (x, y, r = 30, col = '#E0503A') =>
  `<circle cx="${x - r * 0.35}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x + r * 0.35}" cy="${y}" r="${r}" fill="${col}"/><path d="M ${x} ${y - r * 0.8} q 2 -18 12 -24" stroke="${C.woodDark}" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="${x + 20}" cy="${y - r - 10}" rx="14" ry="7" fill="${C.leaf}"/>`;
const iceBox = (x, y, w = 110, h = 90) =>
  `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="12" fill="#CFE6F7" stroke="#8FB7C9" stroke-width="5"/><path d="M ${x} ${y - h + 20} v ${h - 40} M ${x - 24} ${y - h / 2 - 14} l 48 28 M ${x + 24} ${y - h / 2 - 14} l -48 28" stroke="#8FB7C9" stroke-width="6" stroke-linecap="round"/>`;
const meat = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M -90 0 Q -100 -60 -40 -70 Q 40 -84 90 -50 Q 110 -10 70 4 Z" fill="#C2554A"/><path d="M -90 0 Q -100 -60 -40 -70 Q -60 -40 -50 0 Z" fill="#F2E3D2"/></g>`;
const calendar = (x, y, mark = 7) => {
  let cells = '';
  for (let i = 0; i < 14; i++) {
    const cx = x - 105 + (i % 7) * 35,
      cy = y - 20 + Math.floor(i / 7) * 40;
    cells += `<rect x="${cx - 13}" y="${cy - 13}" width="26" height="26" rx="5" fill="${i + 1 === mark ? C.coral : '#E3ECE7'}"/>`;
  }
  return `<g filter="url(#soft)"><rect x="${x - 135}" y="${y - 90}" width="270" height="170" rx="16" fill="#fff"/></g><rect x="${x - 135}" y="${y - 90}" width="270" height="44" rx="16" fill="${C.forest}"/><rect x="${x - 135}" y="${y - 60}" width="270" height="14" fill="${C.forest}"/>${cells}`;
};
const tooth = (x, y, s = 1, o = {}) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M -50 -60 Q -56 -110 -20 -104 Q 0 -96 20 -104 Q 56 -110 50 -60 Q 46 -30 40 -10 L 30 70 Q 22 86 14 70 L 4 10 L -4 10 L -14 70 Q -22 86 -30 70 L -40 -10 Q -46 -30 -50 -60 Z" fill="${o.root ? '#F3D8C2' : '#fff'}" stroke="#C9C2B4" stroke-width="5"/>${o.root ? '' : `<path d="M -40 -10 L 40 -10 L 30 70 Q 22 86 14 70 L 4 10 L -4 10 L -14 70 Q -22 86 -30 70 Z" fill="#F3D8C2" stroke="#C9C2B4" stroke-width="5"/>`}${o.hole ? `<ellipse cx="6" cy="-74" rx="16" ry="12" fill="#6B5A4A"/>` : ''}${o.wax ? `<ellipse cx="6" cy="-74" rx="18" ry="13" fill="#F6E7B0" stroke="#D9C27A" stroke-width="3"/>` : ''}</g>`;
const gum = (x, y, w = 300) =>
  `<path d="M ${x - w / 2} ${y} Q ${x} ${y - 40} ${x + w / 2} ${y} L ${x + w / 2} ${y + 80} L ${x - w / 2} ${y + 80} Z" fill="#E8909C"/>`;
const candleStub = (x, y) =>
  `<rect x="${x - 26}" y="${y - 70}" width="52" height="70" rx="8" fill="#F6E7B0" stroke="#D9C27A" stroke-width="4"/><path d="M ${x} ${y - 70} v -16" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
const holeyBucket = (x, y, s = 1) =>
  bucket(x, y, { scale: s, color: C.metal }) +
  [-20, 0, 20]
    .map((d) => `<circle cx="${x + d * s}" cy="${y - 6 * s}" r="${5 * s}" fill="${C.ink}"/>`)
    .join('') +
  `<path d="M ${x - 46 * s} ${y - 92 * s} L ${x + 46 * s} ${y - 92 * s} L ${x + 40 * s} ${y - 14 * s} L ${x - 40 * s} ${y - 14 * s} Z" fill="#CFCAC0"/>`;
const drips = (x, y, col = '#8A5A2B', n = 3) =>
  Array.from(
    { length: n },
    (_, i) =>
      `<path d="M ${x - 20 + i * 20} ${y + i * 18} q -7 12 0 18 q 7 -6 0 -18 Z" fill="${col}"/>`,
  ).join('');
const stand4 = (x, top, bottom) =>
  `<path d="M ${x - 70} ${bottom} L ${x - 50} ${top} M ${x + 70} ${bottom} L ${x + 50} ${top}" stroke="${C.wood}" stroke-width="12" stroke-linecap="round"/><rect x="${x - 70}" y="${top - 6}" width="140" height="12" rx="6" fill="${C.woodDark}"/>`;
const warnSign = (x, y, r = 60) =>
  `<g filter="url(#soft)"><path d="M ${x} ${y - r} L ${x + r * 1.05} ${y + r * 0.75} L ${x - r * 1.05} ${y + r * 0.75} Z" fill="${C.sun}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/></g><path d="M ${x} ${y - r * 0.4} v ${r * 0.62}" stroke="${C.ink}" stroke-width="${r * 0.16}" stroke-linecap="round"/><circle cx="${x}" cy="${y + r * 0.5}" r="${r * 0.09}" fill="${C.ink}"/>`;
const lye = '#9A6A35';
const spoon = (x, y, rot = 0, len = 220) =>
  `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="-7" y="${-len}" width="14" height="${len}" rx="7" fill="${C.wood}"/><ellipse cx="0" cy="0" rx="20" ry="30" fill="${C.wood}"/></g>`;
const soapBar = (x, y, w = 90, h = 50, col = '#F2E7CF') =>
  `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="10" fill="${col}" stroke="${shade(col, 0.15)}" stroke-width="4"/>`;
const rack = (x, y, w = 360) =>
  `<path d="M ${x - w / 2 + 20} ${G} L ${x - w / 2 + 20} ${y} M ${x + w / 2 - 20} ${G} L ${x + w / 2 - 20} ${y}" stroke="${C.wood}" stroke-width="12"/><rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="14" rx="6" fill="${C.woodDark}"/><path d="${Array.from({ length: Math.floor(w / 24) }, (_, i) => `M ${x - w / 2 + 12 + i * 24} ${y - 10} v 14`).join(' ')}" stroke="#C9B48F" stroke-width="3"/>`;
const slice = (x, y, rot = 0, col = '#F4C95D') =>
  `<ellipse cx="${x}" cy="${y}" rx="34" ry="10" fill="${col}" stroke="${shade(col, 0.2)}" stroke-width="3" transform="rotate(${rot} ${x} ${y})"/>`;
const coin = (x, y) =>
  `<ellipse cx="${x}" cy="${y}" rx="30" ry="10" fill="#E7C46A" stroke="#B8963E" stroke-width="3"/>`;
const smoke = (x, y) =>
  `<path d="M ${x} ${y} q -24 -30 0 -60 q 24 -30 0 -60 M ${x + 40} ${y + 10} q -20 -30 4 -56 q 20 -26 0 -54" stroke="#C3CBC6" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.8"/>`;
const shelf = (x, y, w = 340) =>
  `<rect x="${x - w / 2}" y="${y}" width="${w}" height="16" rx="6" fill="${C.wood}"/>`;
const saltShake = (x, y, n = 10) => {
  let r = 7;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  return Array.from(
    { length: n },
    () =>
      `<circle cx="${x + (rnd() - 0.5) * 70}" cy="${y + rnd() * 70}" r="5" fill="#fff" stroke="#C9D3DC" stroke-width="2"/>`,
  ).join('');
};
const thermometer = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-12" y="-120" width="24" height="120" rx="12" fill="#fff" stroke="${C.ink}" stroke-width="4"/><circle cx="0" cy="8" r="22" fill="${C.coral}" stroke="${C.ink}" stroke-width="4"/><rect x="-5" y="-90" width="10" height="94" fill="${C.coral}"/></g>`;
const twig = (x, y, rot = 0, s = 1) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="0" y="-8" width="200" height="16" rx="8" fill="#7FA35B"/><path d="M -4 -8 l -26 -6 M -4 -3 l -30 -2 M -4 2 l -30 2 M -4 7 l -26 6" stroke="#C9B48F" stroke-width="5" stroke-linecap="round"/></g>`;

export default {
  // ---------------- latrine ----------------
  'lat-spot': frame(
    hill(160, 250, 560, G - 10) +
      stream(40, 260, 250) +
      stake(600, G - 10) +
      measure(230, 210, 590, 300) +
      pill(400, 200, '200 ft') +
      arrow([300, 300], [480, 380], { width: 9, curve: [380, 330] }),
  ),
  'lat-dig': frame(
    up(
      hole(380, 160, 170) +
        `<path d="M 470 ${G} q 60 -60 120 0 Z" fill="${C.soil}"/>` +
        digger(560, 470, G, ME, { facing: -1, rot: 28 }) +
        measure(270, G + 8, 270, G + 162) +
        pill(170, G + 90, '5 ft') +
        measure(300, G - 30, 460, G - 30) +
        pill(380, G - 90, '3 ft'),
      -110,
    ),
    { noGround: true },
  ),
  'lat-boards': frame(
    up(
      hole(360, 200, 160) +
        board(210, 335, G, 22) +
        board(385, 510, G, 22) +
        arrow([360, G - 160], [360, G - 34], { width: 10 }) +
        pill(360, G - 210, '1 ft'),
    ),
    { noGround: true },
  ),
  'lat-screen': frame(
    up(
      hole(360, 200, 120) +
        board(210, 335, G, 22) +
        board(385, 510, G, 22) +
        screen(170, 560) +
        tick(620, 300),
    ),
    { noGround: true },
  ),
  'lat-lid': frame(
    up(
      hole(360, 200, 120) +
        board(210, 335, G, 22) +
        board(385, 510, G, 22) +
        board(320, 400, G - 22, 18, C.woodDark) +
        fly(240, 250, 2.4) +
        fly(480, 230, 2) +
        cross(360, 200, 44),
    ),
    { noGround: true },
  ),

  // ---------------- sharing food ----------------
  'rat-count': frame(
    table(250, G, 360, 120) +
      can(140, G - 120) +
      can(200, G - 120, 1, '#5B8DBE') +
      jar(270, G - 120, { fill: C.straw }) +
      sack(360, G - 120, { scale: 0.9 }) +
      working(560, [490, 300], YOU, { facing: -1 }) +
      paper(470, 250, { ticks: 4, lines: 4, w: 130, h: 160, rot: -6 }) +
      pencil(510, 300, -30, 0.9),
  ),
  'rat-divide': frame(
    sack(140, 300, { scale: 0.9 }) +
      can(220, 300, 0.9) +
      arrow([250, 260], [430, 160], { width: 8 }) +
      arrow([260, 280], [430, 250], { width: 8 }) +
      arrow([260, 300], [430, 340], { width: 8 }) +
      arrow([250, 320], [430, 420], { width: 8 }) +
      [170, 260, 350, 440].map((y) => bowl(540, y, { scale: 0.75, fill: C.straw })).join(''),
    { noGround: true },
  ),
  'rat-order': frame(
    apple(150, G - 70, 40) +
      iceBox(360, G) +
      can(570, G, 1.3) +
      num(150, 150, 1, 36) +
      num(360, 150, 2, 36) +
      num(570, 150, 3, 36) +
      arrow([200, 240], [300, 240], { width: 8 }) +
      arrow([420, 240], [510, 240], { width: 8 }),
  ),
  'rat-serve': frame(
    front(170, { ...ME, scale: 0.8 }) +
      front(360, { ...YOU, scale: 0.85 }) +
      front(550, { ...KID, scale: 0.7, hairStyle: 'long' }) +
      `<rect x="40" y="${G - 110}" width="640" height="24" rx="10" fill="${C.wood}"/><rect x="60" y="${G - 90}" width="600" height="90" fill="${C.woodDark}"/>` +
      [170, 360, 550].map((x) => bowl(x, G - 114, { scale: 0.6, fill: C.straw })).join(''),
  ),
  'rat-recount': frame(
    calendar(260, 230, 7) +
      paper(540, 260, { ticks: 3, lines: 4, w: 150, h: 190, rot: 5 }) +
      pencil(600, 330, -30),
    { noGround: true },
  ),

  // ---------------- caring for the sick ----------------
  'sick-apart': frame(
    `<rect x="340" y="80" width="18" height="${G - 80}" fill="${C.woodDark}"/>` +
      bed(540, G, 260) +
      lier(450, G - 92, { ...SICK, scale: 0.8 }) +
      blanket(480, 640, G - 112, G - 66, '#9FC3E0') +
      front(130, { ...ME, scale: 0.8 }) +
      front(240, { ...KID, scale: 0.65 }),
  ),
  'sick-one': frame(
    bed(470, G, 260) +
      lier(380, G - 92, { ...SICK, scale: 0.8 }) +
      blanket(410, 570, G - 112, G - 66, '#9FC3E0') +
      stander(650, { ...YOU, facing: -1, scale: 0.9 }) +
      tick(650, 110) +
      stander(110, { ...ME, scale: 0.8 }) +
      cross(110, 130) +
      `<rect x="200" y="100" width="18" height="${G - 100}" fill="${C.woodDark}"/>`,
  ),
  'sick-cool': frame(
    bed(330, G, 320) +
      lier(220, G - 92, { ...SICK, face: 'closed' }) +
      `<rect x="160" y="${G - 140}" width="60" height="22" rx="8" fill="#BFE0F5" stroke="#8FB7C9" stroke-width="3"/>` +
      blanket(560, 690, G - 70, G - 10, '#E9A23B') +
      arrow([470, G - 140], [600, G - 110], { width: 9, curve: [540, G - 170] }) +
      working(120, [180, G - 150], YOU, { facing: 1 }),
  ),
  'sick-own': frame(
    cup(170, G, { scale: 1.6, color: C.coral }) +
      bowl(360, G, { color: C.coral }) +
      bucket(560, G, { color: C.coral }) +
      `<path d="M 80 140 Q 360 60 640 140" stroke="${C.coral}" stroke-width="8" stroke-dasharray="14 12" fill="none"/>` +
      tick(360, 120, 40),
  ),
  'sick-log': frame(
    paper(360, 260, { w: 300, h: 330, lines: 6, ticks: 4 }) +
      sun(160, 120, 40) +
      moon(580, 130, 40) +
      pencil(500, 370, -30, 1.2),
    { noGround: true },
  ),

  // ---------------- garden ----------------
  'gar-sun': frame(
    sun(470, 100, 50) +
      soilBed(390, 640) +
      plant(450, G - 30, 0.8) +
      plant(530, G - 30, 0.9) +
      plant(600, G - 30, 0.7) +
      tree(140, G, 1.05) +
      cross(180, 140) +
      tick(640, 230) +
      pill(470, 210, '6 hr', { size: 36 }),
  ),
  'gar-bed': frame(
    `<path d="M 120 ${G} L 220 260 L 620 260 L 640 ${G} Z" fill="${C.soil}"/>` +
      measure(220, 230, 620, 230) +
      pill(420, 170, '10 ft') +
      measure(80, G - 10, 180, 270) +
      pill(110, 330, '4 ft'),
    { noGround: true },
  ),
  'gar-dig-a': frame(
    soilBed(260, 700) +
      digger(320, 420, G - 6, YOU, { rot: -14 }) +
      plant(600, G - 30, 0.6, { color: '#9BB86A' }),
  ),
  'gar-dig-b': frame(
    soilBed(260, 700) +
      `<path d="M 380 ${G - 30} q 50 -50 110 0 Z" fill="${C.soilDark}"/>` +
      digger(320, 430, G - 90, YOU, { rot: -14 }) +
      `<path d="M 404 ${G - 150} q 26 -30 56 0 Z" fill="${C.soilDark}"/>` +
      arrow([520, G - 60], [520, G - 170], { width: 8 }),
  ),

  'gar-compost': frame(
    soilBed(380, 700) +
      `<path d="M 40 ${G} Q 120 ${G - 130} 200 ${G} Z" fill="#7A5434"/><path d="M 70 ${G - 40} q 20 -16 40 0 M 120 ${G - 76} q 20 -16 40 0 M 140 ${G - 26} q 18 -14 36 0" stroke="#C9772E" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      digger(320, 430, G - 60, YOU, { rot: -14 }) +
      `<path d="M 404 ${G - 120} q 26 -34 56 0 Z" fill="#7A5434"/>` +
      arrow([150, G - 160], [520, G - 70], { width: 9, curve: [380, G - 280] }),
  ),

  'gar-crops': frame(
    `<g><ellipse cx="130" cy="${G - 40}" rx="56" ry="40" fill="#C9A06B"/><circle cx="110" cy="${G - 50}" r="5" fill="#8A6A3E"/><circle cx="150" cy="${G - 30}" r="5" fill="#8A6A3E"/></g>` +
      `<g>${[0, 1, 2].map((i) => `<path d="M ${250 + i * 26} ${G - 120} q 20 50 0 110 q -16 -50 0 -110 Z" fill="${C.leaf}"/>`).join('')}</g>` +
      `<g><ellipse cx="460" cy="${G - 110}" rx="34" ry="90" fill="${C.straw}"/><path d="M 460 ${G - 10} Q 400 ${G - 80} 420 ${G - 180} M 460 ${G - 10} Q 520 ${G - 80} 500 ${G - 180}" stroke="${C.leaf}" stroke-width="16" fill="none"/></g>` +
      `<g><ellipse cx="610" cy="${G - 52}" rx="70" ry="52" fill="#E9A23B"/><path d="M 580 ${G - 100} v 96 M 640 ${G - 100} v 96" stroke="#D18A1F" stroke-width="5"/><rect x="604" y="${G - 122}" width="12" height="26" rx="5" fill="${C.leafDark}"/></g>`,
  ),
  'gar-seed': frame(
    `<rect x="100" y="${G - 140}" width="520" height="${G - 150}" fill="${C.soil}"/><path d="M 100 ${G - 140} h 520" stroke="#8DB27A" stroke-width="10"/>` +
      `<ellipse cx="360" cy="${G - 60}" rx="26" ry="18" fill="#E9D9A6" stroke="#B8A36A" stroke-width="3"/>` +
      measure(460, G - 136, 460, G - 64, '#fff') +
      measure(334, G - 20, 386, G - 20, '#fff') +
      pill(560, G - 100, '2x'),
    { noGround: true },
  ),
  'gar-water-a': frame(
    sun(110, G - 40, 44) +
      soilBed(260, 700) +
      [330, 430, 530, 630].map((x) => sprout(x, G - 30)).join('') +
      working(220, [300, 250], ME) +
      wateringCan(320, 250, 20),
  ),
  'gar-water-b': frame(
    sun(110, G - 60, 44) +
      soilBed(260, 700) +
      [330, 430, 530, 630].map((x) => sprout(x, G - 30, 1.1)).join('') +
      working(220, [300, 260], ME) +
      wateringCan(320, 260, 35) +
      `<path d="M 440 220 Q 470 260 470 370 M 452 216 Q 490 260 500 370 M 432 226 Q 450 270 440 370" stroke="${C.water}" stroke-width="6" stroke-linecap="round" fill="none" stroke-dasharray="18 12"/>`,
  ),
  'gar-mulch': frame(
    soilBed(80, 640) +
      [180, 300, 420, 540].map((x) => plant(x, G - 30, 0.8)).join('') +
      `<rect x="96" y="${G - 46}" width="528" height="24" rx="10" fill="${C.straw}"/>` +
      `<path d="${Array.from({ length: 26 }, (_, i) => `M ${104 + i * 20} ${G - 26} l 14 -20`).join(' ')}" stroke="#C9A54B" stroke-width="4"/>` +
      [200, 360, 520]
        .map((x) => `<path d="M ${x} ${G - 18} q -12 20 0 32 q 12 -12 0 -32 Z" fill="${C.water}"/>`)
        .join('') +
      tick(620, 140),
  ),

  // ---------------- toothache ----------------
  'tooth-rinse': frame(
    cup(300, G, { scale: 2.4, color: '#5B8DBE', water: true, steam: true }) +
      `<g transform="translate(470,170) rotate(-30)"><rect x="0" y="-8" width="160" height="16" rx="8" fill="${C.metal}"/><ellipse cx="-10" cy="0" rx="34" ry="22" fill="${C.metal}"/><ellipse cx="-10" cy="-4" rx="26" ry="14" fill="#fff"/></g>` +
      saltShake(400, 210, 8) +
      pill(560, 330, '½ tsp'),
  ),
  'tooth-clean': frame(
    gum(360, 330, 560) +
      tooth(250, 280, 1) +
      tooth(470, 280, 1) +
      `<path d="M 330 100 L 360 360 L 390 100" stroke="#fff" stroke-width="7" fill="none"/><path d="M 330 100 L 360 360 L 390 100" stroke="#9FB8C8" stroke-width="3" fill="none"/>` +
      tick(600, 110),
    { noGround: true },
  ),
  'tooth-cold': (() => {
    const j = frontJoints(360, {});
    return frame(
      front(360, {
        ...SICK,
        face: 'worried',
        arms: [
          [
            [280, 260],
            [j.head[0] - 28, j.head[1] + 28],
          ],
          null,
        ],
      }) +
        cloth(j.head[0] - 30, j.head[1] + 18, 46, 40, '#BFE0F5', -10) +
        `<path d="M 520 160 v 70 M 490 178 l 60 34 M 550 178 l -60 34" stroke="#8FB7C9" stroke-width="10" stroke-linecap="round"/>`,
    );
  })(),
  'tooth-wax': frame(
    gum(300, 330, 360) +
      tooth(300, 280, 1.2, { hole: true }) +
      candleStub(560, 330) +
      arrow([520, 220], [330, 190], { width: 9, curve: [450, 150] }),
    { noGround: true },
  ),
  'tooth-hold': frame(
    tooth(360, 270, 1.6, { root: false }) +
      handTop(250, 180, { rot: 70, scale: 0.9 }) +
      handTop(470, 180, { rot: -70, scale: 0.9, flip: true }) +
      tick(600, 140) +
      cross(600, 360),
    { noGround: true },
  ),
  'tooth-milk': frame(
    `<rect x="300" y="200" width="150" height="${G - 200}" rx="18" fill="#DCEFF7" stroke="#8FB7C9" stroke-width="5"/><rect x="310" y="250" width="130" height="${G - 260}" rx="12" fill="#FBF7EE"/>` +
      tooth(375, 330, 0.6) +
      arrow([220, 140], [330, 230], { width: 9, curve: [250, 200] }) +
      tick(560, 160),
  ),
  'tooth-danger': (() => {
    return frame(
      front(300, { ...SICK, face: 'worried' }) +
        `<ellipse cx="280" cy="${G - 262}" rx="18" ry="16" fill="#D98E6A"/>` +
        thermometer(500, 300, 1.2) +
        `<path d="M 470 140 q 30 -40 60 0" stroke="${C.coral}" stroke-width="7" fill="none" stroke-linecap="round"/>` +
        pill(560, 400, 'Help'),
    );
  })(),
  'tooth-twig': frame(
    front(240, { ...ME, face: 'smile' }) +
      twig(420, 220, 0, 1.2) +
      tick(580, 110) +
      pill(560, 330, '2x'),
  ),

  // ---------------- soap ----------------
  'soap-ash': frame(
    logs(180, G - 6, 0.9) +
      ashPile(180, G, 110) +
      bucket(520, G, { color: C.metal }) +
      ashPile(520, G - 96, 46) +
      `<path d="M 470 ${G - 102} h 100" stroke="#D7D3CB" stroke-width="12"/>` +
      arrow([280, G - 140], [440, G - 160], { width: 9, curve: [360, G - 220] }),
  ),
  'soap-drip-a': frame(
    stand4(330, G - 160, G) +
      holeyBucket(330, G - 166, 1) +
      pot(330, G, { scale: 0.8 }) +
      working(560, [420, 170], ME, { facing: -1 }) +
      `<g transform="translate(430,170) rotate(-60)"><rect x="-30" y="-60" width="60" height="80" rx="12" fill="#5B8DBE"/></g>` +
      `<path d="M 390 196 q -10 20 -30 30" stroke="${C.water}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  ),
  'soap-drip-b': frame(
    stand4(330, G - 160, G) +
      holeyBucket(330, G - 166, 1) +
      drips(330, G - 150, lye) +
      pot(330, G, { scale: 0.8 }) +
      `<rect x="${330 - 44}" y="${G - 56}" width="88" height="40" rx="8" fill="${lye}"/>`,
  ),
  'soap-warn': frame(
    pot(240, G, { scale: 1 }) +
      `<rect x="${240 - 55}" y="${G - 76}" width="110" height="60" rx="10" fill="${lye}"/>` +
      warnSign(240, 140, 60) +
      front(540, { ...KID, scale: 0.6 }) +
      noSign(540, G - 100, 110),
  ),
  'soap-egg': frame(
    pot(360, G, { scale: 2 }) +
      `<rect x="${360 - 112}" y="${G - 150}" width="224" height="134" rx="18" fill="${lye}"/>` +
      `<path d="M 260 ${G - 150} h 200" stroke="${shade(lye, 0.2)}" stroke-width="6"/>` +
      egg(360, G - 150, 1.4, 70) +
      `<rect x="250" y="${G - 148}" width="220" height="60" fill="${lye}" opacity="0.6"/>` +
      tick(560, 120),
  ),
  'soap-pot': frame(
    tree(110, G, 0.9) +
      fire(400, G, 0.5) +
      pot(400, G - 40, { scale: 1.1 }) +
      `<ellipse cx="380" cy="${G - 132}" rx="30" ry="14" fill="#FBF3E4"/><ellipse cx="420" cy="${G - 136}" rx="24" ry="12" fill="#FBF3E4"/>` +
      pill(590, 160, 'Low', { size: 36 }),
  ),
  'soap-stir-a': frame(
    fire(360, G, 0.45) +
      pot(360, G - 34, { scale: 1.2 }) +
      `<rect x="${360 - 66}" y="${G - 140}" width="132" height="60" rx="10" fill="#E9DCC0"/>` +
      spoon(360, G - 110, 25, 230) +
      working(510, [420, 220], YOU, { facing: -1 }) +
      `<path d="M 300 ${G - 170} a 60 22 0 1 0 120 0" stroke="${C.coral}" stroke-width="7" fill="none"/>`,
  ),
  'soap-stir-b': frame(
    fire(360, G, 0.45) +
      pot(360, G - 34, { scale: 1.2 }) +
      `<rect x="${360 - 66}" y="${G - 140}" width="132" height="60" rx="10" fill="#E2CFA3"/><path d="M 310 ${G - 140} q 20 -20 40 0 q 20 -20 40 0" fill="#E2CFA3"/>` +
      spoon(360, G - 110, -15, 230) +
      working(510, [410, 210], YOU, { facing: -1 }) +
      tick(160, 140),
  ),
  'soap-bars': frame(
    `<rect x="120" y="${G - 110}" width="300" height="110" fill="${C.wood}"/><rect x="134" y="${G - 96}" width="272" height="90" fill="${C.cloth}"/><rect x="144" y="${G - 86}" width="252" height="74" fill="#F2E7CF"/><path d="M 228 ${G - 86} v 74 M 312 ${G - 86} v 74" stroke="${C.ink}" stroke-width="5" stroke-dasharray="10 8"/>` +
      knife(470, G - 160, 150, 1.2) +
      pill(560, 140, '2 days'),
  ),
  'soap-cure': frame(
    rack(230, G - 120, 340) +
      [110, 190, 270, 350].map((x) => soapBar(x, G - 130, 64, 44)).join('') +
      calendar(540, 150, 14) +
      pill(540, 320, '4 weeks'),
  ),

  // ---------------- drying food ----------------
  'keep-slice': frame(
    apple(200, G - 80, 46) +
      knife(260, G - 170, 60, 1.1) +
      slice(420, G - 20, -5) +
      slice(480, G - 30, 5) +
      coin(600, G - 20) +
      `<text x="600" y="${G - 50}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="40" fill="${C.ink}">=</text>`,
  ),
  'keep-rack': frame(
    sun(600, 90, 44) +
      rack(320, G - 120, 420) +
      [160, 220, 280, 340, 400, 460].map((x) => slice(x, G - 136, 0)).join('') +
      `<path d="M 100 ${G - 150} Q 320 ${G - 220} 540 ${G - 150}" fill="#fff" opacity="0.65" stroke="#E2D7BD" stroke-width="3"/>` +
      `<path d="M 100 ${G - 150} Q 320 ${G - 220} 540 ${G - 150} L 540 ${G - 140} L 100 ${G - 140} Z" fill="#fff" opacity="0.5"/>` +
      `<g opacity="0.7">${['M 40 180 h 90', 'M 60 220 h 70']
        .map((d) => `<path d="${d}" stroke="#9FB8C8" stroke-width="7" stroke-linecap="round"/>`)
        .join('')}</g>`,
  ),
  'keep-done': frame(
    `<path d="M 120 ${G - 160} Q 200 ${G - 80} 280 ${G - 160}" stroke="#D9A441" stroke-width="22" fill="none" stroke-linecap="round"/>` +
      handTop(110, G - 120, { rot: -100, scale: 0.6 }) +
      handTop(290, G - 120, { rot: 100, scale: 0.6, flip: true }) +
      tick(200, 120) +
      `<rect x="440" y="${G - 170}" width="70" height="18" rx="8" fill="#8BB35A" transform="rotate(-20 475 ${G - 160})"/><rect x="520" y="${G - 170}" width="70" height="18" rx="8" fill="#8BB35A" transform="rotate(20 555 ${G - 160})"/>` +
      `<path d="M 510 ${G - 210} l 6 -24 M 530 ${G - 206} l 14 -20 M 490 ${G - 206} l -10 -20" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>` +
      tick(520, 120),
    { noGround: true },
  ),
  'keep-meat': frame(
    meat(200, G - 60, 1.2) +
      cross(110, 200) +
      knife(260, G - 200, 30, 1) +
      [440, 490, 540, 590]
        .map(
          (x) =>
            `<rect x="${x - 9}" y="${G - 170}" width="18" height="150" rx="8" fill="#C2554A"/>`,
        )
        .join('') +
      pencil(660, G - 10, 0, 1.3),
  ),
  'keep-salt': frame(
    `<rect x="130" y="${G - 60}" width="420" height="60" rx="10" fill="${C.wood}"/>` +
      [180, 260, 340, 420, 500]
        .map(
          (x) =>
            `<rect x="${x - 34}" y="${G - 96}" width="68" height="28" rx="12" fill="#C2554A"/>`,
        )
        .join('') +
      saltShake(340, G - 200, 16) +
      handTop(340, 150, { rot: 180, scale: 0.9 }),
  ),
  'keep-hang-a': frame(
    sun(600, 90, 44) +
      `<rect x="96" y="${G - 300}" width="14" height="300" rx="6" fill="${C.wood}"/><rect x="530" y="${G - 300}" width="14" height="300" rx="6" fill="${C.wood}"/>` +
      strips(150, 490, G - 290) +
      `<g opacity="0.7"><path d="M 40 120 h 90" stroke="#9FB8C8" stroke-width="7" stroke-linecap="round"/></g>`,
  ),
  'keep-hang-b': frame(
    `<path d="M 160 ${G} L 230 ${G - 320} L 300 ${G}" stroke="${C.wood}" stroke-width="12" fill="none"/><path d="M 420 ${G} L 490 ${G - 320} L 560 ${G}" stroke="${C.wood}" stroke-width="12" fill="none"/>` +
      strips(270, 450, G - 316) +
      fire(360, G, 0.5) +
      smoke(340, G - 80) +
      pill(600, 120, 'Warm'),
  ),
  'keep-bend': frame(
    `<path d="M 200 300 Q 360 160 520 300" stroke="#8E3E32" stroke-width="26" fill="none" stroke-linecap="round"/>` +
      `<path d="M 350 210 l -8 -20 M 372 208 l 6 -22 M 360 210 l 0 -24" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>` +
      handTop(190, 330, { rot: -120, scale: 0.7 }) +
      handTop(530, 330, { rot: 120, scale: 0.7, flip: true }) +
      tick(360, 400),
    { noGround: true },
  ),
  'keep-store': frame(
    `<rect x="120" y="70" width="480" height="${G - 70}" rx="16" fill="#3A4E63"/>` +
      shelf(360, 220, 420) +
      shelf(360, G - 30, 420) +
      [220, 320, 420, 500]
        .map((x, i) =>
          jar(x, 220, { fill: ['#D9A441', '#8E3E32', '#8BB35A', '#D9A441'][i], scale: 0.9 }),
        )
        .join('') +
      [240, 360, 480].map((x) => sack(x, G - 30, { scale: 0.7 })).join('') +
      tick(620, 110),
  ),
  'keep-stew': frame(
    fire(360, G, 0.6) +
      pot(360, G - 44, { scale: 1.3, steam: true }) +
      `<rect x="${360 - 74}" y="${G - 140}" width="148" height="80" rx="12" fill="#B9773E"/>` +
      [
        [310, -120],
        [350, -96],
        [395, -126],
        [420, -90],
        [330, -80],
        [380, -72],
      ]
        .map(
          ([x, d]) =>
            `<rect x="${x - 12}" y="${G + d}" width="24" height="16" rx="5" fill="#7A3328" transform="rotate(${x % 40} ${x} ${G + d})"/>`,
        )
        .join('') +
      `<circle cx="300" cy="${G - 100}" r="9" fill="#8BB35A"/><circle cx="410" cy="${G - 112}" r="9" fill="#E9A23B"/>`,
  ),
};
