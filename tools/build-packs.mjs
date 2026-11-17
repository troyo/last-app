#!/usr/bin/env node
// Builds the Small / Medium / Large content packs from packs/sources.json.
//
//   node tools/build-packs.mjs [--out dist] [--base-url URL] [--include-review] [--quick]
//
// It downloads every source, checks it, cleans articles so they work offline,
// and writes:
//   dist/catalog.json      what the app reads (packs, topics, items, downloads)
//   dist/files/*           the files to upload (article bundles + PDFs)
//   dist/REPORT.md         what worked, what failed, sizes and licenses
//
// Needs Node 20+. No npm packages. Runs in GitHub Actions (see .github/workflows).

import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};

const OUT = opt('--out', 'dist');
const BASE_URL = (opt('--base-url', process.env.PACKS_BASE_URL || '') || '').replace(/\/?$/, '/');
const INCLUDE_REVIEW = flag('--include-review');
const QUICK = flag('--quick'); // small test run: few articles, no bulk wiki pages
const BUNDLE_MAX_BYTES = 20 * 1024 * 1024; // keep each download chunk ~20 MB
const USER_AGENT =
  process.env.PACKS_USER_AGENT || 'LastAppPackBuilder/1.0 (offline survival guide; open-source)';

const TIERS = ['small', 'medium', 'large'];
const tierRank = (t) => TIERS.indexOf(t);

const sources = JSON.parse(await readFile('packs/sources.json', 'utf8'));
await rm(OUT, { recursive: true, force: true });
await mkdir(path.join(OUT, 'files'), { recursive: true });

const report = { ok: [], failed: [], skipped: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

// When a site says "slow down" (HTTP 429), every request to that site waits.
const pausedUntil = new Map();

async function fetchWithRetry(url, { tries = 7, binary = false } = {}) {
  let lastErr;
  const host = new URL(url).host;
  for (let i = 0; i < tries; i++) {
    const wait = (pausedUntil.get(host) || 0) - Date.now();
    if (wait > 0) await sleep(wait + Math.random() * 1000);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, 'Api-User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: AbortSignal.timeout(120_000),
      });
      if (res.status === 429) {
        const asked = Number(res.headers.get('retry-after')) || 0;
        const pause = Math.min(Math.max(asked, 5 * 2 ** i), 120) * 1000;
        pausedUntil.set(host, Math.max(pausedUntil.get(host) || 0, Date.now() + pause));
        throw new Error('HTTP 429');
      }
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) return { ok: false, status: res.status };
      const body = binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
      return { ok: true, body, type: res.headers.get('content-type') || '' };
    } catch (e) {
      lastErr = e;
      if (String(e).indexOf('429') < 0) await sleep(1000 * 2 ** i);
    }
  }
  return { ok: false, error: String(lastErr) };
}

// Run tasks with limited parallelism so we're polite to the wikis.
async function pool(items, n, fn) {
  const out = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

// ---------- Articles ----------

// Collect the article list (tier = the smallest pack that includes it).
const wanted = new Map(); // key wiki|title -> {wiki, title, tier, topic}
const want = (wiki, title, tier, topic) => {
  const key = `${wiki}|${title.replace(/ /g, '_')}`;
  const prev = wanted.get(key);
  if (!prev || tierRank(tier) < tierRank(prev.tier)) wanted.set(key, { wiki, title, tier, topic });
};
for (const group of sources.articles) {
  const titles = QUICK ? group.titles.slice(0, 2) : group.titles;
  for (const t of titles) want(group.wiki, t, group.tier, group.topic);
}
if (!QUICK) {
  for (const bulk of sources.allPagesOf || []) {
    const wiki = sources.wikis[bulk.wiki];
    let cont = {};
    let count = 0;
    while (count < bulk.limit) {
      const q = new URLSearchParams({
        action: 'query',
        list: 'allpages',
        apnamespace: String(bulk.namespace ?? 0),
        apfilterredir: 'nonredirects',
        ...(bulk.prefix ? { apprefix: bulk.prefix } : {}),
        aplimit: 'max',
        format: 'json',
        formatversion: '2',
        ...cont,
      });
      const r = await fetchWithRetry(`${wiki.api}?${q}`);
      if (!r.ok) {
        report.failed.push(`List of ${bulk.wiki} pages: ${r.status || r.error}`);
        break;
      }
      const data = JSON.parse(r.body);
      for (const p of data.query?.allpages || []) {
        if (count++ >= bulk.limit) break;
        want(bulk.wiki, p.title, bulk.tier, bulk.topic);
      }
      if (!data.continue) break;
      cont = data.continue;
    }
    console.log(
      `Listed ${count} ${bulk.wiki} pages${bulk.prefix ? ` starting "${bulk.prefix}"` : ''}`,
    );
    if (count === 0)
      report.skipped.push(
        `No ${bulk.wiki} pages found${bulk.prefix ? ` starting "${bulk.prefix}"` : ''}`,
      );
  }
}

const articleList = [...wanted.values()].map((a) => ({
  ...a,
  id: `${a.wiki === 'wikipedia' ? 'wp' : a.wiki}-${slug(a.title)}`,
}));
const idByKey = new Map(articleList.map((a) => [`${a.wiki}|${a.title.replace(/ /g, '_')}`, a.id]));

/** Make wiki HTML small, private and offline-friendly. */
function cleanHtml(html, wiki) {
  let h = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[\s\S]*?<\/sup>/gi, '')
    .replace(/<span class="mw-editsection[\s\S]*?<\/span>\s*<\/span>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  // Drop everything from the References / External links headings onward.
  h = h.replace(
    /<div class="mw-heading[^>]*>\s*<h2[^>]*id="(References|Notes|External_links|Further_reading|Sources|Citations|See_also)"[\s\S]*$/i,
    '',
  );
  h = h.replace(
    /<h2[^>]*>\s*<span[^>]*id="(References|Notes|External_links|Further_reading|See_also)"[\s\S]*$/i,
    '',
  );
  // Internal links: point at our own copy if we have it, otherwise keep just the text.
  h = h.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => {
    const m = href.match(/^\/wiki\/([^#?]+)/);
    if (m) {
      const title = decodeURIComponent(m[1]);
      const id = idByKey.get(`${wiki}|${title}`);
      if (id) return `<a href="lastapp://item/${id}">${text}</a>`;
    }
    return text;
  });
  return h.replace(/\n{3,}/g, '\n\n').trim();
}

// Pictures: only from Wikimedia Commons (freely licensed; "fair use" images
// live elsewhere and are dropped). Each kept picture is stored inside the
// article itself, so it shows with no internet.
const COMMONS = /^(?:https?:)?\/\/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/commons\//;
const IMG_MAX_BYTES = 250 * 1024;
let imageCount = 0;
let imageBytes = 0;
const imageDrops = {};
const dropSamples = [];
const imgNote = (why) => (imageDrops[why] = (imageDrops[why] || 0) + 1);

async function embedImages(html, maxImages) {
  const tags = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const replacements = new Map();
  let kept = 0;
  for (const tag of tags) {
    let out = '';
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&') ?? '';
    const width = Number(tag.match(/\bwidth="(\d+)"/)?.[1] ?? 0);
    if (kept >= maxImages) imgNote('over the per-article limit');
    else if (!COMMONS.test(src)) {
      imgNote('not from Wikimedia Commons');
      if (dropSamples.length < 8) dropSamples.push(tag.slice(0, 300));
    }
    else if (width < 120) imgNote('too small (icon)');
    if (kept < maxImages && COMMONS.test(src) && width >= 120) {
      const r = await fetchWithRetry(src.startsWith('//') ? `https:${src}` : src, {
        binary: true,
        tries: 4,
      });
      const type = r.ok ? r.type.split(';')[0].trim() : '';
      if (r.ok && /^image\/(jpeg|png|gif|webp)$/.test(type) && r.body.length <= IMG_MAX_BYTES) {
        const alt = (tag.match(/\balt="([^"]*)"/)?.[1] ?? '').slice(0, 200);
        out = `<img alt="${alt}" src="data:${type};base64,${r.body.toString('base64')}">`;
        kept++;
        imageCount++;
        imageBytes += r.body.length;
      } else if (!r.ok) imgNote(`download failed (${r.status || r.error})`);
      else if (r.body.length > IMG_MAX_BYTES) imgNote('file too big');
      else imgNote(`unsupported type ${type}`);
    }
    replacements.set(tag, out);
  }
  let h = html.replace(/<img\b[^>]*>/gi, (tag) => replacements.get(tag) ?? '');
  // Remove picture frames whose picture was dropped (leftover captions).
  h = h.replace(/<figure\b[^>]*>(?:(?!<\/figure>)[\s\S])*<\/figure>/gi, (f) =>
    f.includes('<img') ? f : '',
  );
  return h;
}

console.log(`Fetching ${articleList.length} articles…`);
let done = 0;
const seenTitles = new Set();
const fetched = await pool(articleList, 4, async (a) => {
  const wiki = sources.wikis[a.wiki];
  const q = new URLSearchParams({
    action: 'parse',
    page: a.title,
    prop: 'text|displaytitle',
    redirects: '1',
    disableeditsection: '1',
    disablelimitreport: '1',
    disabletoc: '1',
    format: 'json',
    formatversion: '2',
  });
  const r = await fetchWithRetry(`${wiki.api}?${q}`);
  if (++done % 100 === 0) console.log(`  ${done}/${articleList.length}`);
  if (!r.ok) {
    report.failed.push(`Article "${a.title}" (${a.wiki}): ${r.status || r.error}`);
    return null;
  }
  const data = JSON.parse(r.body);
  if (data.error || !data.parse?.text) {
    report.failed.push(`Article "${a.title}" (${a.wiki}): ${data.error?.info || 'no text'}`);
    return null;
  }
  const html = await embedImages(
    cleanHtml(data.parse.text, a.wiki),
    QUICK ? 2 : (wiki.images ?? 0),
  );
  if (html.length < 300) {
    report.skipped.push(`Article "${a.title}" (${a.wiki}): too short`);
    return null;
  }
  const title = data.parse.displaytitle?.replace(/<[^>]+>/g, '') || a.title;
  const seenKey = `${a.wiki}|${title}`;
  if (seenTitles.has(seenKey)) {
    report.skipped.push(`Article "${a.title}" (${a.wiki}): same page as "${title}"`);
    return null;
  }
  seenTitles.add(seenKey);
  return {
    ...a,
    title,
    html,
    sourceUrl: wiki.pageBase + encodeURIComponent(a.title.replace(/ /g, '_')),
  };
});

// ---------- Bundle articles into ~20 MB chunks per tier ----------

const items = [];
const downloads = [];

for (const tier of TIERS) {
  const inTier = fetched.filter((a) => a && a.tier === tier);
  let chunk = {};
  let chunkBytes = 0;
  let n = 0;
  const flush = async () => {
    if (!Object.keys(chunk).length) return;
    const file = `articles-${tier}-${++n}.json`;
    const buf = Buffer.from(JSON.stringify(chunk));
    await writeFile(path.join(OUT, 'files', file), buf);
    downloads.push({
      id: file.replace(/\.json$/, ''),
      tier,
      kind: 'bundle',
      file,
      url: BASE_URL + file,
      bytes: buf.length,
      sha256: sha256(buf),
    });
    for (const id of Object.keys(chunk))
      items.find((i) => i.id === id).download = file.replace(/\.json$/, '');
    chunk = {};
    chunkBytes = 0;
  };
  for (const a of inTier) {
    const wiki = sources.wikis[a.wiki];
    items.push({
      id: a.id,
      title: a.title,
      topic: a.topic,
      tier,
      type: 'article',
      source: wiki.source,
      license: wiki.license,
      sourceUrl: a.sourceUrl,
    });
    chunk[a.id] = a.html;
    chunkBytes += a.html.length;
    report.ok.push(`Article: ${a.title} (${tier})`);
    if (chunkBytes > BUNDLE_MAX_BYTES) await flush();
  }
  await flush();
}

// ---------- PDFs ----------

for (const p of sources.pdfs) {
  if (QUICK && p.tier !== 'small') continue;
  if (p.needsReview && !INCLUDE_REVIEW) {
    report.skipped.push(`PDF "${p.title}": license needs review (${p.license})`);
    continue;
  }
  let got = null;
  for (const url of p.urls) {
    const r = await fetchWithRetry(url, { binary: true });
    if (r.ok && r.body.subarray(0, 5).toString() === '%PDF-' && r.body.length > 10_000) {
      got = { body: r.body, from: url };
      break;
    }
    report.skipped.push(
      `PDF "${p.title}": ${url} -> ${r.ok ? 'not a valid PDF' : r.status || r.error}`,
    );
  }
  if (!got) {
    report.failed.push(`PDF "${p.title}": no working link`);
    continue;
  }
  const file = `${p.id}.pdf`;
  await writeFile(path.join(OUT, 'files', file), got.body);
  downloads.push({
    id: p.id,
    tier: p.tier,
    kind: 'file',
    file,
    url: BASE_URL + file,
    bytes: got.body.length,
    sha256: sha256(got.body),
  });
  items.push({
    id: p.id,
    title: p.title,
    topic: p.topic,
    tier: p.tier,
    type: 'pdf',
    download: p.id,
    source: p.source,
    license: p.license,
    sourceUrl: got.from,
  });
  report.ok.push(
    `PDF: ${p.title} (${p.tier}, ${(got.body.length / 1e6).toFixed(1)} MB) from ${got.from}`,
  );
}

// ---------- Catalog + report ----------

const packBytes = (tier) =>
  downloads.filter((d) => tierRank(d.tier) <= tierRank(tier)).reduce((s, d) => s + d.bytes, 0);

const catalog = {
  version: 2,
  generated: new Date().toISOString(),
  name: 'Last App open library',
  note: 'All content is public domain or Creative Commons BY-SA. Sources and licenses are shown on every page.',
  packs: sources.packs.map((p) => ({ ...p, bytes: packBytes(p.id) })),
  topics: sources.topics,
  downloads,
  items,
};
await writeFile(path.join(OUT, 'catalog.json'), JSON.stringify(catalog));

const mb = (b) => `${(b / 1e6).toFixed(1)} MB`;
const md = [
  `# Pack build report`,
  ``,
  `Built ${catalog.generated}`,
  ``,
  `| Pack | Size | Items |`,
  `| --- | --- | --- |`,
  ...TIERS.map(
    (t) =>
      `| ${t} | ${mb(packBytes(t))} | ${items.filter((i) => tierRank(i.tier) <= tierRank(t)).length} |`,
  ),
  ``,
  `Pictures kept: ${imageCount} (${mb(imageBytes)})`,
  ...Object.entries(imageDrops).map(([why, n]) => `- Pictures dropped, ${why}: ${n}`),
  ...dropSamples.map((x) => '  - sample: `' + x.replace(/`/g, "'") + '`'),
  ``,
  `## Failed (${report.failed.length})`,
  ...report.failed.map((x) => `- ${x}`),
  ``,
  `## Skipped (${report.skipped.length})`,
  ...report.skipped.map((x) => `- ${x}`),
  ``,
  `## Included (${report.ok.length})`,
  ...report.ok.map((x) => `- ${x}`),
].join('\n');
await writeFile(path.join(OUT, 'REPORT.md'), md);
console.log(md.split('## Skipped')[0]);
