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
// bulk = came from a "take every page" list rather than being hand-picked.
const want = (wiki, title, tier, topic, bulk = false) => {
  const key = `${wiki}|${title.replace(/ /g, '_')}`;
  const prev = wanted.get(key);
  if (!prev || tierRank(tier) < tierRank(prev.tier))
    wanted.set(key, { wiki, title, tier, topic, bulk: bulk && (prev ? prev.bulk : true) });
};

// ---------- English only ----------
// Some wikis keep machine translations next to the English pages (Appropedia
// has thousands). The app is English, so anything else is left out.
const EN_WORDS = new Set(
  'the of and to in is for that with as are on be by it this or from an can at which not have you your when if will should was these'.split(
    ' ',
  ),
);
const OTHER_WORDS = new Set(
  'el la los las del que y en un una por para con es se le les des et est une du pour dans der die das und ist nicht ein eine von mit zu den auf o os do da em um uma não com il di che per è della sono van het een op te zijn na się w z jest nie și în'.split(
    ' ',
  ),
);
const NON_LATIN =
  /[\u0370-\u03FF\u0400-\u052F\u0590-\u08FF\u0900-\u0DFF\u0E00-\u0FFF\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/g;
const plainText = (html) =>
  html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
/** How English some text looks: share of its words that are common English words. */
function englishShare(text) {
  const words = text.toLowerCase().match(/[a-zà-ÿąćęłńóśźżșț']+/g) || [];
  if (words.length < 8) return { share: 1, other: 0, words: words.length };
  let en = 0;
  let other = 0;
  for (const w of words) {
    if (EN_WORDS.has(w)) en++;
    else if (OTHER_WORDS.has(w)) other++;
  }
  return { share: en / words.length, other: other / words.length, words: words.length };
}
function isEnglish(title, html) {
  if (/\/[a-z]{2,3}(-[a-z]+)?$/.test(title)) return false; // "Page/ru" style translations
  const text = plainText(html).slice(0, 6000);
  const letters = (text.match(/\p{L}/gu) || []).length || 1;
  const foreign = ((title + text).match(NON_LATIN) || []).length;
  if (foreign / letters > 0.05 || (title.match(NON_LATIN) || []).length > 1) return false;
  const { share, other } = englishShare(text);
  // Only turn a page away on real evidence of another language. Lists, recipes and
  // contents pages have few "the/of/and" words in any language, and they are still English.
  return !(other >= 0.03 && other > share);
}

// Bulk pages arrive unsorted. Put each under the topic it is about, so
// "DIY" isn't one pile of thousands. First match wins; the rest stay put.
const TOPIC_WORDS = [
  ['water', /\b(water|rainwater|well|pump|filter|filtration|chlorin|desalinat|irrigation)\b/i],
  [
    'sanitation',
    /\b(toilet|latrine|sanitation|compost(ing)? toilet|sewage|greywater|soap|hygiene|waste)\b/i,
  ],
  [
    'grow',
    /\b(garden|gardening|crop|seed|soil|compost|farming|agricultur|permaculture|greenhouse|aquaponic|livestock|poultry|beekeeping)\b/i,
  ],
  ['food', /\b(food|cook|cooking|stove|oven|recipe|preserv|canning|drying|ferment|nutrition)\b/i],
  [
    'power',
    /\b(solar|photovoltaic|wind turbine|battery|batteries|generator|electric|biogas|hydro|energy|lighting|lamp)\b/i,
  ],
  [
    'shelter',
    /\b(shelter|house|housing|building|construction|insulation|roof|earthbag|adobe|cob|heating|rocket mass)\b/i,
  ],
  ['first-aid', /\b(health|medical|medicine|first aid|disease|malaria|wound|hospital|clinic)\b/i],
];
// Wikibooks pages are named "Book/Chapter" or "Book:Page", so the book tells us the shelf.
const BOOK_TOPICS = [
  ['food', /^Cookbook\b/i],
  ['first-aid', /^(First Aid|Emergency Medicine)\b/i],
  ['grow', /^Horticulture\b/i],
  ['power', /^(Electronics|Bicycles)\b/i],
  ['prep', /^(Scouting|Knots|Outdoor Survival|Amateur Radio)\b/i],
];
function topicFor(title, fallback, wiki) {
  if (wiki === 'wikibooks') {
    for (const [topic, re] of BOOK_TOPICS) if (re.test(title)) return topic;
    return fallback;
  }
  for (const [topic, re] of TOPIC_WORDS) if (re.test(title)) return topic;
  return fallback;
}
// Pages that are about a university class, a conference or the wiki itself.
const NOT_A_GUIDE =
  /^(\d{4}\b|\d{3} |[A-Z]{2,5}\d{2,4}\b)|^(Fab Labs?|Community action|Commons news|Global Ecovillage Network|CrashSavers|ALL-SAFE|ETALO|External Links|Appropedia|User|Help)\b|\b(conference|symposium|semester|syllabus|course|class project|science project|team|meeting|minutes|literature review|protocol:|category|template|portal|news|newsletter|self-assessment|simulator|association|foundation|organi[sz]ation|network|institute|university|centre|center|collaborations?|killer apps|3d print(ed|ing)?|fused filament|drop box|press release|grant|proposal|survey results|bibliography)\b/i;
// The whole point of the app: every guide must be something a person can do with
// no power, no internet and no special equipment. Bulk sources are full of pages
// that fail that test (3D printing, electronics, lab kit, studies, school projects),
// so bulk pages are only let in when they pass the checks below.
const NEEDS_GEAR =
  /3-?d[- ]?print|printable|printer|reprap|recyclebot|filament|open[- ]source|opensource|arduino|raspberry|microcontroller|firmware|software|\bapps?\b|\bapplication\b|computer|comput|digital|internet|online|website|\bweb\b|wiki|database|\bdata\b|laser|\bcnc\b|\bpcb\b|circuit|sensor|\bleds?\b|photovoltaic|\bpv\b|semiconductor|transistor|amplifier|oscillator|inverter|grid[- ]tie|smart grid|microgrid|electric (car|vehicle|tractor)|\bev\b|nanotech|spectro|chromatograph|microscop|centrifuge|ultrasound|oximet|x-ray|\bmri\b|laboratory|\blab\b|simulation|model(l)?ing|\bmodel\b|analysis|assessment|feasibility|case stud|\bstudy\b|studies|research|review|thesis|report|survey|framework|policy|policies|economic|financ|market|business|industr|commercial|manufactur|factory|enterprise|funding|development|sustainab|climate|carbon|emission|footprint|compendium|portfolio|curriculum|lesson|education|workshop|project|program(me)?|initiative|campaign|movement|community|communities|cooperative|ecovillage|\bngo\b|country|countries|\bin (india|africa|kenya|nigeria|malawi|haiti|nepal|ghana|uganda|tanzania|mexico|peru|china|brazil)\b|\bCCAT\b|\bHSU\b|\bMOST\b|\bGSTC\b|\bWSSD\b|vehicle|\bcars?\b|taxes|tourism|aerosol pandemic|refrigerat|air condition|washing machine|dishwasher|microwave|blender|food processor|bread machine|slow cooker|air fryer|ice cream|freezer|reactor|fukushima|partnership|gallery|statistics|atlas|hydrogen|dialysis|\bdemo\b|scents|hydroponic|ethanol|superheated|energy control|cheesecake|brownie|cookies?\b|cake\b|milkshake|candy|fudge/i;
// Appropedia: short, plain titles about a core survival skill.
const CORE_SKILL =
  /\b(water|rainwater|well|spring|cistern|filter|filters|purification|chlorination|boiling|distillation|latrine|toilet|toilets|compost|composting|soap|hygiene|handwashing|garden|gardening|seed|seeds|soil|mulch|mulching|crop|vegetable|vegetables|fruit|orchard|beekeeping|chickens?|poultry|goats?|rabbits?|fishing|trapping|foraging|hunting|shelter|earthbag|adobe|cob|thatch|thatching|insulation|rope|knots?|candles?|lantern|basket|pottery|bricks?|tanning|sewing|weaving|first aid|wounds?|oral rehydration|medicinal|root cellar|solar (cooker|cookers|oven|still|dryer|water disinfection)|zeer|haybox|biochar|charcoal|firewood|fire|stoves?|rocket stove|cooking|drying|smoking|salting|pickling|fermentation|canning|food (storage|preservation)|hand ?pump|hand tools?|navigation|bicycle)s?\b/i;
const PLACE_OR_PROJECT =
  /\b(school|elementary|college|park|farm|hotel|street|house|centre|center|village|city|county|[A-Z]{3,})\b|\d{4}/;
const APPROPEDIA_BOOKS = /^(Are You Ready\?|Household Cyclopedia|Keeping Chickens)\//;
// Cookbook: staples and ways of keeping food, not dinner-party recipes.
const COOK_OK =
  /\b(bread|flatbread|hardtack|bannock|tortilla|sourdough|yeast|beans?|lentil|porridge|oat|grits|cornmeal|polenta|jerky|pemmican|pickl|sauerkraut|kimchi|ferment|canning|preserv|dried|drying|smok|salt (pork|fish|cod)|cur(ed|ing)|stock|broth|yogurt|butter|vinegar|sprout|foraging|acorn|dandelion|nettle|campfire|dutch oven|substitut|cooking techniques|food safety|nutrition)\w*\b/i;
const GROW_OK =
  /\b(vegetable|potato|tomato|bean|pea|corn|maize|squash|pumpkin|carrot|onion|garlic|cabbage|kale|lettuce|spinach|beet|turnip|radish|pepper|herb|fruit|apple|berry|seed|sow|soil|compost|mulch|manure|fertil|water|irrigat|prun|propagat|graft|cutting|transplant|harvest|storage|pest|weed|tool|raised bed|container|season|frost|greenhouse|cold frame|garden)\w*\b/i;
function usableOffGrid(wiki, title) {
  if (wiki === 'appropedia') {
    if (APPROPEDIA_BOOKS.test(title)) return true;
    if (/[/:]/.test(title) || title.split(/\s+/).length > 5) return false;
    return CORE_SKILL.test(title) && !NEEDS_GEAR.test(title) && !PLACE_OR_PROJECT.test(title);
  }
  if (wiki === 'wikibooks') {
    if (/^Cookbook:/.test(title)) return COOK_OK.test(title) && !NEEDS_GEAR.test(title);
    if (/^Electronics/.test(title)) return false;
    // Hospital-level medicine stays: you may end up near a hospital or a nurse.
    if (/^Emergency Medicine/.test(title)) return true;
    if (/^Horticulture\//.test(title)) return GROW_OK.test(title.replace(/^Horticulture\//, ''));
    return !NEEDS_GEAR.test(title);
  }
  return true;
}
for (const group of sources.articles) {
  const titles = QUICK ? group.titles.slice(0, 2) : group.titles;
  for (const t of titles) want(group.wiki, t, group.tier, group.topic);
}
// Plain-language twins: for every hand-picked Wikipedia guide, also grab the
// Simple English version when one exists (missing ones are skipped quietly).
if (sources.simpleVersionsOf) {
  const { from, wiki } = sources.simpleVersionsOf;
  for (const a of [...wanted.values()]) {
    if (a.wiki === from) want(wiki, a.title, a.tier, a.topic);
  }
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
        if (count >= bulk.limit) break;
        // Skip translations and non-guides before spending a download on them.
        if ((p.title.match(NON_LATIN) || []).length > 1) continue;
        if (/\/[a-z]{2,3}(-[a-z]+)?$/.test(p.title)) continue;
        if (bulk.wiki === 'appropedia' && NOT_A_GUIDE.test(p.title)) continue;
        if (!usableOffGrid(bulk.wiki, p.title)) continue;
        count++;
        want(bulk.wiki, p.title, bulk.tier, bulk.topic, true);
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
    } else if (width < 120) imgNote('too small (icon)');
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
    if (wiki.optional) return null; // no plain-language version of this one
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
  const title =
    decodeEntities(data.parse.displaytitle?.replace(/<[^>]+>/g, '') || a.title) +
    (wiki.titleSuffix || '');
  if (!isEnglish(title, html)) {
    report.skipped.push(`Article "${a.title}" (${a.wiki}): not in English`);
    return null;
  }
  if (a.bulk && plainText(html).length < 600) {
    report.skipped.push(`Article "${a.title}" (${a.wiki}): too short to be useful`);
    return null;
  }
  const seenKey = `${a.wiki}|${title}`;
  if (seenTitles.has(seenKey)) {
    report.skipped.push(`Article "${a.title}" (${a.wiki}): same page as "${title}"`);
    return null;
  }
  seenTitles.add(seenKey);
  return {
    ...a,
    topic: a.bulk ? topicFor(title, a.topic, a.wiki) : a.topic,
    title,
    html,
    sourceUrl: wiki.pageBase + encodeURIComponent(a.title.replace(/ /g, '_')),
  };
});

function decodeEntities(text) {
  return text
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// The first real sentence or two of an article, as plain text. The app
// shows it under search results and searches inside it.
function summaryOf(html) {
  const paras = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || [];
  for (const p of paras) {
    const text = p
      .replace(/<img[^>]*>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;|&#160;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&[a-z]+;|&#\d+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Skip menus and link lists: real sentences have plenty of small common words.
    if (text.length >= 60 && englishShare(text).share < 0.12) continue;
    if (text.length >= 60)
      return text.length > 170 ? text.slice(0, 167).replace(/\s\S*$/, '') + '…' : text;
  }
  return undefined;
}

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
      summary: summaryOf(a.html),
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
