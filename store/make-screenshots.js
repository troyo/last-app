// Builds the App Store screenshots from the raw app captures in store/raw.
// Run: node store/make-screenshots.js (needs Playwright).
const { chromium } = require('playwright'); const fs = require('fs');
const font = (w) => fs.readFileSync(`${__dirname}/../node_modules/@expo-google-fonts/nunito/${w}/Nunito_${w}.ttf`).toString('base64');
const img = (n) => 'data:image/png;base64,' + fs.readFileSync(`${__dirname}/raw/${n}.png`).toString('base64');
const DARK = '#12382D', GREEN = '#1F5C4A', CREAM = '#F7F3EC', SUN = '#F6B93B', CORAL = '#D9482F', INK = '#0E2A21';
// theme: bg, headline color, accent color, sub color
const TH = { dark: [`radial-gradient(120% 70% at 50% 0%, #2A7560 0%, ${GREEN} 38%, ${DARK} 100%)`, '#fff', SUN, '#D8EBE2'], cream: [`radial-gradient(120% 70% at 50% 0%, #FFFFFF 0%, ${CREAM} 45%, #EADFCB 100%)`, INK, GREEN, '#28483D'], sun: [`radial-gradient(120% 70% at 50% 0%, #FFD877 0%, ${SUN} 45%, #E99A1C 100%)`, INK, '#fff', '#3D2A00'], coral: [`radial-gradient(120% 70% at 50% 0%, #F0705A 0%, ${CORAL} 45%, #A9301C 100%)`, '#fff', '#FFE2A6', '#FFE9E3'] };
const S = [
  ['home', 'dark', 'Survive anything.<br><b>No signal needed.</b>', 'The offline survival guide for when the grid goes down', 'dark'],
  ['emergency', 'coral', 'Know what to do<br><b>in seconds</b>', 'Step-by-step help for 10 real emergencies', 'light'],
  ['show', 'cream', 'It shows you how,<br><b>out loud</b>', 'Moving pictures anyone can follow', 'light'],
  ['help', 'dark', 'First aid when<br><b>help can’t come</b>', 'CPR, bleeding, burns, broken bones and more', 'light'],
  ['hazard', 'sun', 'Ready for <b>your</b><br>disasters', 'Hurricanes, tornadoes, quakes, floods, wildfire', 'light'],
  ['checklist', 'cream', 'Prep for 3 days,<br><b>2 weeks or 1 year</b>', 'Prepper checklists sized for your household', 'light'],
  ['ask', 'dark', 'Ask anything.<br><b>Works offline.</b>', 'Instant answers from your saved guides', 'light'],
  ['search', 'coral', 'How-to guides that<br><b>need no power</b>', 'Water, food, shelter, medical and hand-tool skills', 'light'],
];
const page = ([shot, th, h, sub, bar], W, H) => { const [bg, hc, ac, sc] = TH[th]; const k = W / 1320; const top = bar === 'dark' ? GREEN : '#F8F5EE', fg = bar === 'dark' ? '#fff' : INK;
  const pw = Math.round(W * 0.8), bez = Math.round(22 * k), sw = pw - bez * 2, sk = sw / 1320, sbH = Math.round(150 * sk);
  return `<html><head><style>
@font-face{font-family:N;font-weight:900;src:url(data:font/ttf;base64,${font('900Black')})}@font-face{font-family:N;font-weight:700;src:url(data:font/ttf;base64,${font('700Bold')})}@font-face{font-family:N;font-weight:800;src:url(data:font/ttf;base64,${font('800ExtraBold')})}
*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;overflow:hidden;background:${bg};font-family:N;text-align:center;position:relative}
h1{font-weight:900;font-size:${Math.round(128 * k)}px;line-height:1.04;letter-spacing:-${2 * k}px;color:${hc};padding-top:${Math.round(H * 0.058)}px}h1 b{color:${ac};font-weight:900}
p{text-wrap:balance;font-weight:700;font-size:${Math.round(52 * k)}px;line-height:1.25;color:${sc};margin:${Math.round(34 * k)}px ${Math.round(110 * k)}px 0}
.ph{position:absolute;left:${(W - pw) / 2}px;top:${Math.round(H * 0.262)}px;width:${pw}px;border-radius:${Math.round(150 * k)}px;background:#0B0F0E;padding:${bez}px;box-shadow:0 ${60 * k}px ${140 * k}px rgba(0,0,0,.38),0 0 0 ${3 * k}px rgba(255,255,255,.14) inset}
.sc{border-radius:${Math.round(130 * k)}px;overflow:hidden;background:${top};position:relative}
.sb{height:${sbH}px;background:${top};color:${fg};display:flex;justify-content:space-between;align-items:flex-end;padding:0 ${Math.round(96 * sk)}px ${Math.round(26 * sk)}px;font-weight:800;font-size:${Math.round(50 * sk)}px}
.is{position:absolute;left:50%;top:${Math.round(34 * sk)}px;width:${Math.round(370 * sk)}px;height:${Math.round(106 * sk)}px;margin-left:-${Math.round(185 * sk)}px;border-radius:99px;background:#000}
.sc img{display:block;width:${sw}px}.ic{display:flex;gap:${Math.round(16 * sk)}px;align-items:flex-end}
</style></head><body><h1>${h}</h1><p>${sub}</p><div class="ph"><div class="sc"><div class="sb"><span>9:41</span><span class="ic">
<svg width="${54 * sk}" height="${36 * sk}" viewBox="0 0 18 12"><g fill="${fg}"><rect x="0" y="8" width="3" height="4" rx=".7"/><rect x="5" y="5.5" width="3" height="6.5" rx=".7"/><rect x="10" y="3" width="3" height="9" rx=".7"/><rect x="15" y="0" width="3" height="12" rx=".7"/></g></svg>
<svg width="${78 * sk}" height="${36 * sk}" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.2" fill="none" stroke="${fg}" opacity=".5"/><rect x="2" y="2" width="19" height="8" rx="2" fill="${fg}"/><rect x="24" y="4" width="2" height="4" rx="1" fill="${fg}" opacity=".5"/></svg></span></div><div class="is"></div><img src="${img(shot)}"></div></div></body></html>`; };
(async () => { const b = await chromium.launch();
  for (const [name, W, H] of [['iphone-6.9', 1320, 2868], ['iphone-6.5', 1284, 2778]]) { fs.mkdirSync(`${__dirname}/screenshots/${name}`, { recursive: true }); const p = await b.newPage({ viewport: { width: W, height: H } });
    for (let i = 0; i < S.length; i++) { await p.setContent(page(S[i], W, H)); await p.waitForTimeout(400); await p.screenshot({ path: `${__dirname}/screenshots/${name}/${String(i + 1).padStart(2, '0')}-${S[i][0]}.png` }); } await p.close(); }
  await b.close(); })();
