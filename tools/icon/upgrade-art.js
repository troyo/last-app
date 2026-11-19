// Upgrade illustrations: same flat, friendly style as generate-art.js (backpacks, soft hills, sun).
//   upgrade-medium.png  free -> Medium: a backpack opening up, guides spilling out
//   upgrade-large.png   Medium -> Large: the big green pack filled to the top with a whole library
// Run from the repo root: node tools/icon/upgrade-art.js  (writes into assets/illustrations/)
const { chromium } = require('playwright');

const G = '#1F5C4A',
  G2 = '#2F7A63',
  SAGE = '#BFD8C8',
  SAGE2 = '#DCEBDD',
  CREAM = '#FBF7EF',
  SUN = '#F6B93B',
  SUN2 = '#FBD98A',
  CORAL = '#F08A6B',
  CORAL2 = '#DD7355',
  INK = '#17352C',
  WHITE = '#FFFFFF',
  BLUE = '#5B9BD5',
  BLUE2 = '#3F7FBF',
  RED = '#E2604A';
const SKY = '#E3F1EC';
const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const scene = (w, h, body) =>
  svg(
    w,
    h,
    `<defs><clipPath id="frame"><rect width="${w}" height="${h}"/></clipPath>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY}"/><stop offset="1" stop-color="#F3F8EE"/></linearGradient></defs>
  <g clip-path="url(#frame)"><rect width="${w}" height="${h}" fill="url(#sky)"/>${body}</g>`,
  );
const cloud = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${WHITE}"><circle r="34"/><circle cx="40" cy="8" r="26"/><circle cx="-38" cy="10" r="24"/><rect x="-60" y="10" width="124" height="26" rx="13"/></g>`;
const hills = (w, h, sx = 0.8, sy = 0.26) => `
  <circle cx="${w * sx}" cy="${h * sy}" r="96" fill="${SUN2}" opacity=".5"/><circle cx="${w * sx}" cy="${h * sy}" r="58" fill="${SUN}"/>
  <path d="M0 ${h * 0.66} Q${w * 0.25} ${h * 0.5} ${w * 0.5} ${h * 0.64} T${w} ${h * 0.6} L${w} ${h} L0 ${h} Z" fill="${SAGE2}"/>
  <path d="M0 ${h * 0.8} Q${w * 0.3} ${h * 0.68} ${w * 0.6} ${h * 0.8} T${w} ${h * 0.76} L${w} ${h} L0 ${h} Z" fill="${SAGE}"/>`;

// An open backpack, drawn in two halves so guides can sit inside it: the flap folded back
// behind them, and the front of the bag in front of them.
const packBack = (x, y, s, c2) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="124" rx="118" ry="12" fill="${INK}" opacity=".10"/>
  <path d="M-46 -150 Q0 -230 46 -150" stroke="${INK}" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M-92 -84 Q-104 -168 0 -170 Q104 -168 92 -84 Z" fill="${c2}"/>
  <rect x="-80" y="-120" width="160" height="60" rx="20" fill="${INK}" opacity=".18"/></g>`;
const packFront = (x, y, s, c, c2) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-96 -84 Q0 -64 96 -84 L96 68 Q96 124 40 124 L-40 124 Q-96 124 -96 68 Z" fill="${c}"/>
  <path d="M-96 -84 Q0 -64 96 -84" stroke="${c2}" stroke-width="16" fill="none" stroke-linecap="round"/>
  <rect x="-112" y="-10" width="30" height="96" rx="14" fill="${c2}"/>
  <rect x="82" y="-10" width="30" height="96" rx="14" fill="${c2}"/>
  <rect x="-60" y="10" width="120" height="84" rx="22" fill="${c2}"/>
  <rect x="-12" y="-46" width="24" height="34" rx="8" fill="${CREAM}"/>
  <rect x="-30" y="34" width="60" height="10" rx="5" fill="${CREAM}" opacity=".9"/></g>`;
const closedPack = (x, y, s, c, c2) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="124" rx="110" ry="12" fill="${INK}" opacity=".10"/>
  <path d="M-36 -110 Q0 -160 36 -110" stroke="${INK}" stroke-width="14" fill="none" stroke-linecap="round"/>
  <rect x="-96" y="-110" width="192" height="234" rx="56" fill="${c}"/>
  <rect x="-96" y="-110" width="192" height="80" rx="40" fill="${c2}"/>
  <rect x="-60" y="10" width="120" height="84" rx="22" fill="${c2}"/>
  <rect x="-12" y="-44" width="24" height="34" rx="8" fill="${CREAM}"/>
  <rect x="-30" y="34" width="60" height="10" rx="5" fill="${CREAM}" opacity=".9"/></g>`;

// A guide book standing up, with a little picture on the cover.
const mark = {
  cross: `<rect x="-7" y="-20" width="14" height="40" rx="4" fill="${WHITE}"/><rect x="-20" y="-7" width="40" height="14" rx="4" fill="${WHITE}"/>`,
  drop: `<path d="M0 -22 Q18 0 18 8 A18 18 0 0 1 -18 8 Q-18 0 0 -22 Z" fill="${WHITE}"/>`,
  flame: `<path d="M0 -24 Q22 -2 14 14 Q8 24 0 24 Q-8 24 -14 14 Q-20 0 -4 -8 Q-2 4 6 4 Q8 -10 0 -24 Z" fill="${WHITE}"/>`,
  leaf: `<path d="M-16 18 Q-18 -18 18 -20 Q20 16 -16 18 Z M-16 18 L8 -6" fill="${WHITE}" stroke="${WHITE}" stroke-width="3"/>`,
  tool: `<path d="M-16 16 L8 -8" stroke="${WHITE}" stroke-width="9" stroke-linecap="round"/><circle cx="12" cy="-12" r="11" fill="none" stroke="${WHITE}" stroke-width="7"/>`,
  map: `<path d="M-20 -14 L-6 -20 L6 -14 L20 -20 L20 16 L6 22 L-6 16 L-20 22 Z" fill="${WHITE}"/><path d="M-6 -20 L-6 16 M6 -14 L6 22" stroke="#9CB8AA" stroke-width="3"/>`,
  sun: `<circle r="10" fill="${WHITE}"/><g stroke="${WHITE}" stroke-width="5" stroke-linecap="round"><path d="M0 -22 L0 -16 M0 16 L0 22 M-22 0 L-16 0 M16 0 L22 0 M-15 -15 L-11 -11 M11 11 L15 15 M15 -15 L11 -11 M-11 11 L-15 15"/></g>`,
};
const book = (
  x,
  y,
  rot,
  c,
  c2,
  m,
  s = 1,
) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <rect x="-44" y="-60" width="88" height="120" rx="12" fill="${c2}"/>
  <rect x="-40" y="-60" width="84" height="116" rx="12" fill="${c}"/>
  <rect x="-40" y="-60" width="14" height="116" rx="6" fill="${c2}" opacity=".6"/>
  <g transform="translate(8 -6)">${mark[m]}</g>
  <rect x="-14" y="30" width="44" height="7" rx="3.5" fill="${WHITE}" opacity=".7"/></g>`;
const sparkle = (x, y, s = 1, c = SUN) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -18 Q3 -3 18 0 Q3 3 0 18 Q-3 3 -18 0 Q-3 -3 0 -18 Z" fill="${c}"/>`;

const W = 1000,
  H = 560;

// Free -> Medium: the coral Medium pack opens and the guides you'd get fly out.
const toMedium = scene(
  W,
  H,
  `${hills(W, H, 0.84, 0.24)}${cloud(150, 110, 0.9)}${cloud(560, 70, 0.6)}
  ${closedPack(215, 380, 0.62, SUN, '#E5A422')}
  <g transform="translate(300 310) scale(1.3)"><path d="M0 0 Q16 -22 40 -22" stroke="${G}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="2 12"/>
    <path d="M34 -32 L46 -22 L34 -12" stroke="${G}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
  ${packBack(570, 370, 0.98, CORAL2)}
  ${book(470, 230, -24, RED, '#C24A36', 'cross', 0.95)}
  ${book(538, 200, -8, BLUE, BLUE2, 'drop', 1.02)}
  ${book(612, 205, 10, SUN, '#E5A422', 'flame', 0.98)}
  ${book(680, 240, 26, G2, G, 'leaf', 0.9)}
  ${packFront(570, 370, 0.98, CORAL, CORAL2)}
  ${sparkle(380, 110, 1.1)}${sparkle(770, 120, 0.8, WHITE)}${sparkle(800, 300, 0.9)}${sparkle(350, 280, 0.7, WHITE)}`,
);

// Medium -> Large: the big green pack holding a whole shelf, Medium pack beside it.
const toLarge = scene(
  W,
  H,
  `${hills(W, H, 0.16, 0.24)}${cloud(820, 100, 0.9)}${cloud(420, 70, 0.6)}
  ${closedPack(260, 392, 0.7, CORAL, CORAL2)}
  <g transform="translate(330 300) scale(1.4)"><path d="M0 0 Q16 -22 40 -22" stroke="${G}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="2 12"/>
    <path d="M34 -32 L46 -22 L34 -12" stroke="${G}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
  ${packBack(660, 350, 1.3, G)}
  ${book(548, 225, -28, BLUE, BLUE2, 'drop', 0.9)}
  ${book(606, 185, -14, RED, '#C24A36', 'cross', 0.94)}
  ${book(666, 165, 0, CORAL, CORAL2, 'map', 0.98)}
  ${book(728, 185, 14, SUN, '#E5A422', 'tool', 0.94)}
  ${book(786, 225, 28, '#8E7CC3', '#6E5BA8', 'sun', 0.9)}
  ${packFront(660, 350, 1.3, G2, G)}
  ${sparkle(470, 90, 1.1)}${sparkle(880, 260, 0.9)}${sparkle(860, 70, 0.8, WHITE)}${sparkle(480, 300, 0.7, WHITE)}`,
);

(async () => {
  const b = await chromium.launch();
  const shot = async (name, s, w, h) => {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1.2 });
    await p.setContent(`<body style="margin:0;background:transparent">${s}</body>`);
    await p.screenshot({ path: name, omitBackground: true });
    await p.close();
  };
  await shot('assets/illustrations/upgrade-medium.png', toMedium, W, H);
  await shot('assets/illustrations/upgrade-large.png', toLarge, W, H);
  await b.close();
})();
