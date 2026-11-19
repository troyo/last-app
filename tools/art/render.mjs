// Turns the drawings in tools/art/scenes/*.mjs into PNGs in assets/show.
//
//   node tools/art/render.mjs                 every scene file
//   node tools/art/render.mjs cpr rebuild     only these scene files
//   node tools/art/render.mjs --only cpr-push-a,cpr-push-b
//   node tools/art/render.mjs --out /tmp/x    write somewhere else (for trying things out)
//
// Each scene file exports `default` as an object: picture name -> SVG string.
// "diagram-<name>" goes to assets/diagrams/<name>.png. PNGs are 1080 x 780 and squeezed to a small palette afterwards (needs python3 + Pillow).
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// Playwright may be installed globally rather than in this project.
const { chromium } = createRequire(import.meta.url)('playwright');
const args = process.argv.slice(2);
let out = path.join(here, '../../assets/show');
let only = null;
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') out = args[++i];
  else if (args[i] === '--only') only = new Set(args[++i].split(','));
  else files.push(args[i]);
}
const sceneDir = path.join(here, 'scenes');
const names = files.length
  ? files
  : fs
      .readdirSync(sceneDir)
      .filter((f) => f.endsWith('.mjs'))
      .map((f) => f.replace(/\.mjs$/, ''));

// Zoom the picture in on what is drawn, so people and things are as big as they can be.
// Keeps the 720 x 520 shape, at most 1.45x zoom, and the ground line in view.
function fit() {
  const svg = document.querySelector('svg');
  const c = svg.querySelector('#c');
  if (!c || svg.dataset.fit === 'no') return;
  const A = 720 / 520;
  const b = c.getBBox();
  const pad = 28;
  let x = b.x - pad,
    y = b.y - pad,
    w = b.width + 2 * pad,
    h = b.height + 2 * pad;
  const g = Number(svg.dataset.ground);
  if (g && y + h < g + 46) h = g + 46 - y;
  if (w / h > A) {
    const nh = w / A;
    y -= (nh - h) / 2;
    h = nh;
  } else {
    const nw = h * A;
    x -= (nw - w) / 2;
    w = nw;
  }
  if (w < 720 / 1.45) {
    const k = 720 / 1.45 / w;
    x -= (w * k - w) / 2;
    y -= (h * k - h) / 2;
    w *= k;
    h *= k;
  }
  if (w >= 720) {
    x = 0;
    y = 0;
    w = 720;
    h = 520;
  }
  x = Math.min(Math.max(x, 0), 720 - w);
  y = Math.min(Math.max(y, 0), 520 - h);
  svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  // keep the soft circle behind the drawing
  const blob = svg.querySelector('#blob');
  if (blob) {
    blob.setAttribute('cx', b.x + b.width / 2);
    blob.setAttribute('cy', Math.min(b.y + b.height / 2, y + h * 0.5));
    blob.setAttribute('r', Math.min(w, h) * 0.42);
  }
  const bg = svg.querySelector('#bg');
  bg.setAttribute('x', x);
  bg.setAttribute('y', y);
  bg.setAttribute('width', w);
  bg.setAttribute('height', h);
  bg.setAttribute('rx', (36 * w) / 720);
}

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 720, height: 520 },
  deviceScaleFactor: 1.5,
});
const written = [];
for (const n of names) {
  const mod = await import(pathToFileURL(path.join(sceneDir, n + '.mjs')).href);
  for (const [name, svg] of Object.entries(mod.default)) {
    if (only && !only.has(name)) continue;
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${svg}</body></html>`,
    );
    // "diagram-x" pictures are the ones shown on the cards themselves: they live in assets/diagrams/x.png.
    const file =
      name.startsWith('diagram-') && out.endsWith(path.join('assets', 'show'))
        ? path.join(out, '../diagrams', name.slice(8) + '.png')
        : path.join(out, name + '.png');
    await page.evaluate(fit);
    await page.locator('svg').screenshot({ path: file, omitBackground: true });
    written.push(file);
  }
}
await browser.close();
if (written.length) {
  execFileSync('python3', [path.join(here, 'squeeze.py'), ...written], { stdio: 'inherit' });
}
console.log(`${written.length} pictures -> ${out}`);
