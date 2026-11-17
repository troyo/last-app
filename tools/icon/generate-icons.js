const { chromium } = require('playwright');
const fs = require('fs');
// Open book with a flame rising from it: knowledge that keeps you alive.
const mark = (c1, c2, flame1, flame2) => `
  <g transform="translate(512 560)">
    <path d="M-300 -60 Q-160 -110 -14 -40 L-14 210 Q-160 140 -300 190 Z" fill="${c1}"/>
    <path d="M300 -60 Q160 -110 14 -40 L14 210 Q160 140 300 190 Z" fill="${c2}"/>
    <path d="M0 -70 C-95 -150 -70 -250 -10 -330 C-5 -270 40 -250 55 -300 C120 -220 110 -130 0 -70 Z" fill="${flame1}"/>
    <path d="M0 -92 C-45 -135 -35 -185 0 -225 C30 -185 45 -135 0 -92 Z" fill="${flame2}"/>
  </g>`;
const svg = (bg, inner, scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bg}
  <g transform="translate(512 512) scale(${scale}) translate(-512 -512)">${inner}</g></svg>`;
const bgDark = `<defs><radialGradient id="g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#2E2B26"/><stop offset="1" stop-color="#141311"/></radialGradient></defs><rect width="1024" height="1024" fill="url(#g)"/>`;
const color = mark('#F3F1EC', '#D9D5CB', '#F97316', '#FDBA74');
const files = {
  'icon.png': [svg(bgDark, color, 0.95), false],
  'android-icon-foreground.png': [svg('', color, 0.62), true],
  'android-icon-background.png': [svg(bgDark, ''), false],
  'android-icon-monochrome.png': [svg('', mark('#000', '#000', '#000', '#000'), 0.62), true],
  'splash-icon.png': [svg('', color, 0.9), true],
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  for (const [name, [s, transparent]] of Object.entries(files)) {
    await p.setContent(`<body style="margin:0;background:transparent">${s}</body>`);
    await p.screenshot({ path: name, omitBackground: transparent });
  }
  await p.setViewportSize({ width: 48, height: 48 });
  await p.setContent(`<body style="margin:0"><div style="width:48px;height:48px">${files['icon.png'][0].replace('width="1024" height="1024"', 'width="48" height="48"')}</div></body>`);
  await p.screenshot({ path: 'favicon.png' });
  await b.close();
})();
