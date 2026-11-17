const { chromium } = require('playwright');
const fs = require('fs');
// Palette
const G = '#1F5C4A', G2 = '#2F7A63', SAGE = '#BFD8C8', SAGE2 = '#DCEBDD', CREAM = '#FBF7EF', SUN = '#F6B93B', SUN2 = '#FBD98A', CORAL = '#F08A6B', INK = '#17352C', SKIN = '#F2C7A5', WHITE = '#FFFFFF';
const SKY = '#E3F1EC';
// A scene sits in a soft rounded frame with its own sky, so it never shows a hard edge.
const scene = (w, h, body) =>
  svg(w, h, `<defs><clipPath id="frame"><rect width="${w}" height="${h}" rx="72"/></clipPath>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY}"/><stop offset="1" stop-color="#F3F8EE"/></linearGradient></defs>
  <g clip-path="url(#frame)"><rect width="${w}" height="${h}" fill="url(#sky)"/>${body}</g>`);
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const dog = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="62" rx="70" ry="10" fill="${INK}" opacity=".10"/>
  <path d="M-52 60 L-52 10 Q-52 -22 -18 -22 L24 -22 Q52 -22 52 6 L52 60 L32 60 L32 30 L-30 30 L-30 60 Z" fill="${SUN}"/>
  <path d="M-52 4 Q-78 -6 -74 -34" stroke="${SUN}" stroke-width="14" stroke-linecap="round" fill="none"/>
  <circle cx="50" cy="-34" r="34" fill="${SUN}"/>
  <path d="M26 -58 Q14 -84 34 -84 Q46 -84 46 -62 Z" fill="#D9982A"/>
  <path d="M60 -62 Q62 -88 80 -80 Q88 -74 76 -54 Z" fill="#D9982A"/>
  <ellipse cx="68" cy="-24" rx="20" ry="15" fill="${CREAM}"/>
  <circle cx="78" cy="-30" r="6" fill="${INK}"/>
  <circle cx="44" cy="-42" r="5" fill="${INK}"/>
  <path d="M62 -18 Q70 -10 78 -18" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>
  <rect x="22" y="-10" width="50" height="10" rx="5" fill="${CORAL}"/>
</g>`;

const person = (x, y) => `<g transform="translate(${x} ${y})">
  <ellipse cx="10" cy="118" rx="130" ry="14" fill="${INK}" opacity=".10"/>
  <path d="M-70 112 Q-80 60 -30 56 L60 56 Q120 60 126 112 Z" fill="${G}"/>
  <path d="M-46 60 Q-52 -30 6 -34 Q62 -30 58 60 Z" fill="${CORAL}"/>
  <circle cx="6" cy="-76" r="44" fill="${SKIN}"/>
  <path d="M-40 -84 Q-36 -130 10 -126 Q54 -124 50 -78 Q30 -104 -6 -98 Q-28 -96 -40 -84 Z" fill="${INK}"/>
  <circle cx="-8" cy="-72" r="4.5" fill="${INK}"/><circle cx="22" cy="-72" r="4.5" fill="${INK}"/>
  <path d="M-4 -56 Q8 -46 20 -56" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>
  <!-- book -->
  <g transform="translate(6 30)">
    <circle r="78" fill="${SUN2}" opacity=".55"/>
    <path d="M-66 -18 Q-34 -34 -2 -16 L-2 36 Q-34 20 -66 34 Z" fill="${WHITE}"/>
    <path d="M66 -18 Q34 -34 2 -16 L2 36 Q34 20 66 34 Z" fill="${CREAM}"/>
    <path d="M-54 -6 Q-34 -14 -14 -4 M-54 8 Q-34 0 -14 10 M54 -6 Q34 -14 14 -4 M54 8 Q34 0 14 10" stroke="${SAGE}" stroke-width="4" stroke-linecap="round" fill="none"/>
  </g>
  <path d="M-46 10 Q-80 30 -56 52" stroke="${CORAL}" stroke-width="22" stroke-linecap="round" fill="none"/>
  <path d="M58 10 Q92 30 68 52" stroke="${CORAL}" stroke-width="22" stroke-linecap="round" fill="none"/>
  <circle cx="-56" cy="54" r="12" fill="${SKIN}"/><circle cx="68" cy="54" r="12" fill="${SKIN}"/>
</g>`;

const hills = (w, h) => `
  <circle cx="${w * 0.76}" cy="${h * 0.24}" r="120" fill="${SUN2}" opacity=".5"/><circle cx="${w * 0.76}" cy="${h * 0.24}" r="74" fill="${SUN}"/>
  <path d="M0 ${h * 0.62} Q${w * 0.25} ${h * 0.44} ${w * 0.5} ${h * 0.6} T${w} ${h * 0.56} L${w} ${h} L0 ${h} Z" fill="${SAGE2}"/>
  <path d="M0 ${h * 0.74} Q${w * 0.3} ${h * 0.6} ${w * 0.6} ${h * 0.74} T${w} ${h * 0.7} L${w} ${h} L0 ${h} Z" fill="${SAGE}"/>`;
const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-12" y="0" width="24" height="120" rx="8" fill="#8A6A4A"/><circle cx="0" cy="-40" r="92" fill="${G2}"/><circle cx="-56" cy="6" r="56" fill="${G}"/><circle cx="60" cy="0" r="62" fill="${G}"/></g>`;
const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${WHITE}"><circle r="34"/><circle cx="40" cy="8" r="26"/><circle cx="-38" cy="10" r="24"/><rect x="-60" y="10" width="124" height="26" rx="13"/></g>`;

// 1. Welcome: person reading with dog under a tree
const welcome = scene(1000, 800, `${hills(1000, 800)}${cloud(220, 150)}${cloud(520, 90, 0.7)}${tree(190, 400, 1.3)}${person(520, 520)}${dog(790, 590, 1.15)}`);

// 2. Offline: phone that works with no signal, tent and mountains
const offline = scene(1000, 800, `
  <path d="M120 620 L360 250 L520 500 L620 380 L880 620 Z" fill="${SAGE}"/><path d="M360 250 L420 344 L380 330 L350 362 L318 316 Z" fill="${WHITE}"/>
  <circle cx="800" cy="190" r="100" fill="${SUN2}" opacity=".5"/><circle cx="800" cy="190" r="60" fill="${SUN}"/>
  ${cloud(200, 170, 0.9)}
  <path d="M0 620 Q500 560 1000 620 L1000 800 L0 800 Z" fill="${SAGE2}"/>
  <g transform="translate(250 600)"><path d="M-130 60 L0 -110 L130 60 Z" fill="${CORAL}"/><path d="M-28 60 L0 -30 L28 60 Z" fill="${INK}" opacity=".75"/><path d="M0 -110 L0 -140" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>
  <g transform="translate(600 430)">
    <ellipse cx="0" cy="250" rx="170" ry="16" fill="${INK}" opacity=".10"/>
    <rect x="-130" y="-230" width="260" height="470" rx="44" fill="${INK}"/><rect x="-112" y="-206" width="224" height="422" rx="28" fill="${CREAM}"/>
    <rect x="-84" y="-170" width="120" height="18" rx="9" fill="${G}"/><rect x="-84" y="-132" width="168" height="12" rx="6" fill="${SAGE}"/><rect x="-84" y="-108" width="140" height="12" rx="6" fill="${SAGE}"/>
    <rect x="-84" y="-70" width="168" height="70" rx="16" fill="${SAGE2}"/><rect x="-84" y="16" width="168" height="70" rx="16" fill="${SAGE2}"/>
    <circle cx="0" cy="150" r="46" fill="${G}"/><path d="M-20 150 L-6 166 L22 136" stroke="${WHITE}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
  <g transform="translate(800 400)"><circle r="62" fill="${WHITE}"/>
    <path d="M-34 -6 Q0 -38 34 -6 M-22 10 Q0 -10 22 10" stroke="${SAGE}" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="0" cy="24" r="7" fill="${SAGE}"/>
    <path d="M-34 34 L34 -34" stroke="${CORAL}" stroke-width="10" stroke-linecap="round"/></g>
  ${dog(880, 660, 0.8)}`);

// 3. Packs: three backpacks, small / medium / large
const pack = (x, y, s, c, c2) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="124" rx="110" ry="12" fill="${INK}" opacity=".10"/>
  <path d="M-36 -110 Q0 -160 36 -110" stroke="${INK}" stroke-width="14" fill="none" stroke-linecap="round"/>
  <rect x="-96" y="-110" width="192" height="234" rx="56" fill="${c}"/>
  <rect x="-96" y="-110" width="192" height="80" rx="40" fill="${c2}"/>
  <rect x="-60" y="10" width="120" height="84" rx="22" fill="${c2}"/>
  <rect x="-12" y="-44" width="24" height="34" rx="8" fill="${CREAM}"/>
  <rect x="-30" y="34" width="60" height="10" rx="5" fill="${CREAM}" opacity=".9"/></g>`;
const packs = scene(1000, 800, `${hills(1000, 800)}${cloud(240, 160)}
  ${pack(230, 560, 0.72, SUN, '#E5A422')}${pack(480, 520, 0.98, CORAL, '#DD7355')}${pack(770, 470, 1.28, G2, G)}
  <g fill="${CREAM}" font-family="-apple-system,Helvetica,Arial" font-weight="800" text-anchor="middle"></g>`);

// One backpack on its own, for each pack card.
const onePack = (c, c2) => svg(300, 320, pack(150, 175, 1.05, c, c2));

// Icon: sunrise over an open book on deep green.
const icon = (pad = 1) => svg(1024, 1024, `
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F7A63"/><stop offset="1" stop-color="#184B3C"/></linearGradient>
  <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD873"/><stop offset="1" stop-color="#F6B93B"/></linearGradient>
  <clipPath id="clip"><rect x="0" y="0" width="1024" height="560"/></clipPath></defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <g transform="translate(512 512) scale(${pad}) translate(-512 -512)">
    <g clip-path="url(#clip)"><circle cx="512" cy="520" r="300" fill="#FFD873" opacity=".22"/><circle cx="512" cy="520" r="205" fill="url(#sun)"/></g>
    <g stroke="#FFD873" stroke-width="26" stroke-linecap="round" opacity=".95">
      <path d="M512 170 L512 230"/><path d="M262 270 L304 312"/><path d="M762 270 L720 312"/></g>
    <path d="M176 520 Q350 440 500 540 L500 800 Q350 716 176 780 Z" fill="#FFFFFF"/>
    <path d="M848 520 Q674 440 524 540 L524 800 Q674 716 848 780 Z" fill="#F3EBDA"/>
    <path d="M230 580 Q350 540 452 596 M230 650 Q350 610 452 666 M794 580 Q674 540 572 596 M794 650 Q674 610 572 666" stroke="#BFD8C8" stroke-width="18" stroke-linecap="round" fill="none"/>
  </g>`);
const iconFg = (mono) => svg(1024, 1024, `<g transform="translate(512 512) scale(.62) translate(-512 -512)">
    <defs><clipPath id="clip2"><rect x="0" y="0" width="1024" height="560"/></clipPath></defs>
    <g clip-path="url(#clip2)"><circle cx="512" cy="520" r="205" fill="${mono ? '#000' : '#F6B93B'}"/></g>
    <g stroke="${mono ? '#000' : '#FFD873'}" stroke-width="26" stroke-linecap="round"><path d="M512 170 L512 230"/><path d="M262 270 L304 312"/><path d="M762 270 L720 312"/></g>
    <path d="M176 520 Q350 440 500 540 L500 800 Q350 716 176 780 Z" fill="${mono ? '#000' : '#fff'}"/>
    <path d="M848 520 Q674 440 524 540 L524 800 Q674 716 848 780 Z" fill="${mono ? '#000' : '#F3EBDA'}"/></g>`);
const iconBg = svg(1024, 1024, `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F7A63"/><stop offset="1" stop-color="#184B3C"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#bg)"/>`);

(async () => {
  const b = await chromium.launch();
  const shot = async (name, s, w, h, transparent, scale = 1) => {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
    await p.setContent(`<body style="margin:0;background:transparent">${s}</body>`);
    await p.screenshot({ path: name, omitBackground: transparent });
    await p.close();
  };
  fs.mkdirSync('out/illustrations', { recursive: true });
  await shot('out/illustrations/welcome.png', welcome, 1000, 800, true, 1.2);
  await shot('out/illustrations/offline.png', offline, 1000, 800, true, 1.2);
  await shot('out/illustrations/packs.png', packs, 1000, 800, true, 1.2);
  await shot('out/illustrations/pack-small.png', onePack(SUN, '#E5A422'), 300, 320, true, 1);
  await shot('out/illustrations/pack-medium.png', onePack(CORAL, '#DD7355'), 300, 320, true, 1);
  await shot('out/illustrations/pack-large.png', onePack(G2, G), 300, 320, true, 1);
  await shot('out/icon.png', icon(1), 1024, 1024, false);
  await shot('out/android-icon-foreground.png', iconFg(false), 1024, 1024, true);
  await shot('out/android-icon-monochrome.png', iconFg(true), 1024, 1024, true);
  await shot('out/android-icon-background.png', iconBg, 1024, 1024, false);
  await shot('out/splash-icon.png', iconFg(false).replace('scale(.62)', 'scale(.95)'), 1024, 1024, true);
  await shot('out/favicon.png', icon(1).replace('width="1024" height="1024"', 'width="48" height="48"'), 48, 48, false);
  // preview sheet
  const p = await b.newPage({ viewport: { width: 1700, height: 1000 } });
  await p.setContent(`<body style="margin:0;background:${CREAM};display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:20px">
    ${[welcome, offline, packs].map((s) => `<div>${s.replace(/width="1000" height="800"/, 'width="540" height="432"')}</div>`).join('')}
    <div style="width:300px;height:300px;border-radius:68px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,.25)">${icon(1).replace('width="1024" height="1024"', 'width="300" height="300"')}</div>
    <div style="width:90px;height:90px;border-radius:20px;overflow:hidden">${icon(1).replace('width="1024" height="1024"', 'width="90" height="90"')}</div></body>`);
  await p.screenshot({ path: 'sheet.png' });
  await b.close();
})();
