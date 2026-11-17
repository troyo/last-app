// Builds the page a saved guide is shown in.
//
// The guides arrive as plain encyclopedia-style HTML: very long, with history
// and statistics mixed in with the part you actually need. This turns one into
// something you can use in a hurry:
//   - a short opening, then a "Jump to" list of sections
//   - each section folds open and shut, with the practical ones first
//   - long walls of text are split into short paragraphs
//   - "find in this guide" highlights every match and steps through them
// Nothing here touches the internet. The script below runs inside the page.

export type ReaderColors = {
  bg: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  soft: string;
  border: string;
  sun: string;
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const css = (px: number, c: ReaderColors) => `
  html{scroll-behavior:smooth}
  body{font:${px}px/1.6 -apple-system,system-ui,Roboto,sans-serif;margin:0;padding:4px 20px 96px;
       background:${c.bg};color:${c.text};-webkit-text-size-adjust:100%;overflow-wrap:break-word}
  h1{font-size:1.65em;line-height:1.15;margin:.3em 0 .6em;font-weight:700;letter-spacing:-.01em}
  h3{font-size:1.12em;line-height:1.3;margin:1.5em 0 .45em;font-weight:700}
  h4,h5{font-size:1em;line-height:1.3;margin:1.3em 0 .4em;font-weight:700}
  p{margin:0 0 .95em}
  ul,ol{padding-left:1.25em;margin:0 0 1em} li{margin:.45em 0;padding-left:.15em}
  li::marker{color:${c.accent};font-weight:700}
  a{color:${c.accent};font-weight:700;text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:3px}
  b,strong{font-weight:700}
  img{max-width:100%;max-height:260px;width:auto;height:auto;border-radius:14px;display:block;margin:0 auto;background:#fff}
  figure{margin:1.1em 0 1.3em;padding:0}
  figcaption,.thumbcaption,.gallerytext{font-size:.88em;line-height:1.4;color:${c.text};opacity:.8;margin-top:.5em;text-align:left}
  .gallery{list-style:none;padding:0;margin:1em 0} .gallery li{margin:0 0 1em;padding:0}
  .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1em -20px 1.2em;padding:0 20px}
  table{border-collapse:separate;border-spacing:0;font-size:.88em;line-height:1.4;min-width:100%;
        background:${c.card};border:1px solid ${c.border};border-radius:14px;overflow:hidden}
  td,th{padding:9px 11px;text-align:left;vertical-align:top;min-width:6.5em;border-bottom:1px solid ${c.border}}
  tr:last-child>td,tr:last-child>th{border-bottom:0}
  th{background:${c.soft};font-weight:700}
  caption{font-weight:700;text-align:left;padding:0 0 .5em}
  blockquote{margin:1em 0;padding:.7em 1em;background:${c.soft};border-radius:14px}
  blockquote p:last-child{margin-bottom:0}
  dl{margin:0 0 1em} dt{font-weight:700;margin-top:.7em} dd{margin:.2em 0 .5em 0}
  hr{border:0;border-top:1px solid ${c.border};margin:1.5em 0}
  sup,sub{font-size:.7em;line-height:0}
  .mw-ref,.reference,.mw-editsection,.navbox,.hatnote,.ambox,.metadata,.reflist,.mw-references-wrap,
  .infobox,.sidebar,.toc,.noprint,.shortdescription,.mw-empty-elt,.mw-jump-link,.portal,.portalbox,
  .sistersitebox,.side-box,.stub,.catlinks,.authority-control,.navigation-not-searchable,.mbox-small,
  .magnify,.mw-cite-backlink,.nomobile,.tmbox,.ombox,.cmbox,.fmbox,.Inline-Template,.asof-tag,
  audio,video,track,.listen,.haudio,.refbegin,.citation,.printfooter{display:none !important}

  /* Jump-to list */
  .jump{background:${c.card};border-radius:20px;padding:6px 16px;margin:1.2em 0 1.4em;
        box-shadow:0 4px 14px rgba(23,53,44,.07)}
  .jump .lab{font-size:.78em;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:12px 0 4px}
  .jump a{display:flex;align-items:center;gap:10px;padding:12px 0;font-weight:700;text-decoration:none;
          color:${c.text};border-top:1px solid ${c.border}}
  .jump a:first-of-type{border-top:0}
  .jump a i{margin-left:auto;font-style:normal;color:${c.accent};font-weight:700}
  .jump a.star::before{content:'';width:9px;height:9px;border-radius:5px;background:${c.sun};flex:none}

  /* Folding sections */
  .sec{background:${c.card};border-radius:20px;margin:0 0 12px;box-shadow:0 4px 14px rgba(23,53,44,.07);overflow:hidden}
  .sec>h2{font-size:1.14em;line-height:1.25;font-weight:700;margin:0;padding:17px 16px;display:flex;
          align-items:center;gap:10px;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .sec>h2::after{content:'+';margin-left:auto;flex:none;width:30px;height:30px;border-radius:15px;
          background:${c.soft};color:${c.accent};font-size:22px;line-height:28px;text-align:center;font-weight:700}
  .sec.open>h2::after{content:'\\2212'}
  .sec>.in{display:none;padding:0 16px 8px}
  .sec.open>.in{display:block}
  .sec .scroll{margin:1em -16px 1.2em;padding:0 16px}
  .sec table{background:${c.bg}}
  .more{font-size:.78em;font-weight:700;letter-spacing:.05em;text-transform:uppercase;margin:1.8em 0 .8em}

  mark{background:${c.sun};color:#1B1300;border-radius:4px;padding:0 1px}
  mark.now{background:#F08A24;outline:2px solid #F08A24}
  .credit{font-size:.82em;line-height:1.5;border-top:1px solid ${c.border};margin-top:2em;padding-top:1em}
`;

// Runs inside the guide's page. Plain old JavaScript so every phone's built-in
// browser understands it.
const SCRIPT = String.raw`
(function () {
  var t0 = Date.now();
  var root = document.getElementById('doc');
  // The same clutter the stylesheet hides. Checked by name, because asking the
  // browser "is this visible?" thousands of times is what makes a page slow.
  var HIDDEN = '.mw-ref,.reference,.mw-editsection,.navbox,.hatnote,.ambox,.metadata,.reflist,.mw-references-wrap,.infobox,.sidebar,.toc,.noprint,.shortdescription,.mw-empty-elt,.mw-jump-link,.portal,.portalbox,.sistersitebox,.side-box,.stub,.catlinks,.authority-control,.navigation-not-searchable,.mbox-small,.magnify,.mw-cite-backlink,.nomobile,.tmbox,.ombox,.cmbox,.fmbox,.Inline-Template,.asof-tag,audio,video,.listen,.haudio,.refbegin,.citation,.printfooter';
  var inner = root.querySelector('.mw-parser-output') || root;
  // Some guides wrap everything in one extra box; step inside it.
  while (inner.children.length === 1 && inner.firstElementChild.tagName === 'DIV' &&
         inner.firstElementChild.querySelector('h2')) inner = inner.firstElementChild;

  var send = function (msg) {
    var text = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(text);
    else if (window.parent !== window) window.parent.postMessage(text, '*');
  };

  // ---- 1. Short paragraphs instead of walls of text ----
  var splitLong = function (p) {
    var total = p.textContent.length;
    if (total < 420) return;
    var run = 0, node = p.firstChild;
    while (node) {
      var next = node.nextSibling;
      if (node.nodeType === 3) {
        var t = node.nodeValue, re = /[.!?]["')\]]?\s+(?=[A-Z])/g, m;
        while ((m = re.exec(t))) {
          var at = m.index + m[0].length;
          if (run + at > 230 && total - (run + at) > 120) {
            var rest = node.splitText(at);
            var fresh = document.createElement('p');
            while (rest) { var n = rest.nextSibling; fresh.appendChild(rest); rest = n; }
            p.parentNode.insertBefore(fresh, p.nextSibling);
            splitLong(fresh);
            return;
          }
        }
      }
      run += node.textContent.length;
      node = next;
    }
  };
  var ps = inner.querySelectorAll('p');
  for (var i = 0; i < ps.length; i++) if (!ps[i].closest('table,blockquote,li')) splitLong(ps[i]);

  // ---- 2. Wide tables scroll sideways instead of squashing ----
  var tables = inner.querySelectorAll('table');
  for (i = 0; i < tables.length; i++) {
    var tb = tables[i];
    if (tb.closest('.scroll') || tb.closest(HIDDEN)) continue;
    var wrap = document.createElement('div');
    wrap.className = 'scroll';
    tb.parentNode.insertBefore(wrap, tb);
    wrap.appendChild(tb);
  }

  // ---- 3. Fold the guide into sections, practical ones first ----
  var DROP = /^(references?|notes?|footnotes?|citations?|sources?|bibliography|external links?|further reading|other websites|works cited|gallery|etymology|names?|naming|in popular culture|popular culture|in fiction|in media|notable .*|awards?|see also|related pages)$/i;
  // Never stretch a small picture past its real size: that is what makes photos look blurry.
  var sharp = function (im) { if (im.naturalWidth) im.style.maxWidth = 'min(100%, ' + im.naturalWidth + 'px)'; };
  Array.prototype.forEach.call(document.images, function (im) { if (im.complete) sharp(im); else im.addEventListener('load', function () { sharp(im); }); });
  var DO = /\b(treat|treatment|treating|first aid|management|managing|what to do|how to|steps?|care|caring|procedure|technique|methods?|instructions?|prevention|preventing|remed(y|ies)|emergency|response|making|building|construction|preparation|preparing|uses?|using|application|skills|safety|storage|purification|recipes?)\b/i;
  var ABOUT = /\b(history|historical|etymology|epidemiology|prognosis|pathophysiology|society|culture|research|statistics|terminology|mechanism|physiology|other animals|in animals|on animals|notable|awards|controvers(y|ies)|legal|economics|prevalence|origins?|see also|related pages)\b/i;

  var headOf = function (el) {
    if (el.tagName === 'H2') return el;
    if (el.classList && el.classList.contains('mw-heading2')) return el.querySelector('h2');
    return null;
  };
  var FIRST = /\b(treat|treatment|treating|first aid|management|managing|what to do|how to|steps?|procedure|technique|instructions?)\b/i;
  var kids = Array.prototype.slice.call(inner.children);
  var sections = [], current = null;
  // A long opening gets cut after its first couple of paragraphs; the rest folds away.
  var introText = 0, introParas = 0, hasHeads = !!inner.querySelector('h2');
  for (i = 0; i < kids.length; i++) {
    var h = headOf(kids[i]);
    if (!h && !current && hasHeads && kids[i].tagName === 'P' && kids[i].textContent.trim().length > 40) {
      introParas++;
      introText += kids[i].textContent.length;
      if (introParas >= 2 && introText > 380) {
        var later = 0;
        for (var z = i + 1; z < kids.length && !headOf(kids[z]); z++) later += kids[z].textContent.length;
        if (later > 500) {
          current = { title: 'Overview', nodes: [] };
          sections.push(current);
        }
      }
      continue;
    }
    if (h) {
      current = { title: h.textContent.replace(/\s+/g, ' ').trim(), nodes: [] };
      sections.push(current);
      kids[i].parentNode.removeChild(kids[i]);
    } else if (current) current.nodes.push(kids[i]);
  }

  var built = [];
  for (i = 0; i < sections.length; i++) {
    var s = sections[i];
    var box = document.createElement('div');
    box.className = 'in';
    for (var j = 0; j < s.nodes.length; j++) box.appendChild(s.nodes[j]);
    if (DROP.test(s.title)) continue;
    var holder = document.createElement('section');
    holder.className = 'sec';
    var title = document.createElement('h2');
    title.textContent = s.title;
    holder.appendChild(title);
    holder.appendChild(box);
    inner.appendChild(holder);
    // Skip sections with nothing left once the clutter is hidden.
    if (box.textContent.replace(/\s+/g, '').length < 25 && !box.querySelector('img')) {
      inner.removeChild(holder);
      continue;
    }
    built.push({ el: holder, title: s.title, rank: FIRST.test(s.title) ? 0 : DO.test(s.title) ? 1 : ABOUT.test(s.title) ? 3 : 2 });
  }

  var toggle = function (sec, open) {
    if (open === undefined) open = !sec.classList.contains('open');
    sec.classList.toggle('open', open);
  };

  if (built.length >= 2) {
    // Practical sections first, background last; otherwise keep the guide's own order.
    var ordered = built.slice().sort(function (a, b) { return a.rank - b.rank; });
    var jump = document.createElement('nav');
    jump.className = 'jump';
    var lab = document.createElement('div');
    lab.className = 'lab';
    lab.textContent = 'Jump to';
    jump.appendChild(lab);
    var saidMore = false;
    ordered.forEach(function (b, n) {
      b.el.id = 'sec-' + n;
      if (b.rank === 3 && !saidMore && n > 0) {
        saidMore = true;
        var more = document.createElement('div');
        more.className = 'more';
        more.textContent = 'Background';
        inner.appendChild(more);
      }
      inner.appendChild(b.el);
      var a = document.createElement('a');
      a.href = '#sec-' + n;
      if (b.rank <= 1) a.className = 'star';
      a.appendChild(document.createTextNode(b.title));
      var arrow = document.createElement('i');
      arrow.textContent = '›';
      a.appendChild(arrow);
      a.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggle(b.el, true);
        b.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      jump.appendChild(a);
      b.el.firstChild.addEventListener('click', function () {
        toggle(b.el);
        if (b.el.classList.contains('open')) b.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    // The list goes right after the opening paragraphs.
    inner.insertBefore(jump, ordered[0].el);
    // Open the most useful section so there is something to read straight away.
    if (ordered[0].rank <= 1) toggle(ordered[0].el, true);
  } else {
    // A short guide: no folding needed.
    built.forEach(function (b) { toggle(b.el, true); });
  }

  // ---- 4. Find in this guide ----
  var marks = [], at = -1;
  var clear = function () {
    for (var k = 0; k < marks.length; k++) {
      var mk = marks[k], parent = mk.parentNode;
      if (!parent) continue;
      parent.replaceChild(document.createTextNode(mk.textContent), mk);
      parent.normalize();
    }
    marks = []; at = -1;
  };
  var show = function (n) {
    if (!marks.length) return;
    if (at >= 0 && marks[at]) marks[at].className = '';
    at = (n + marks.length) % marks.length;
    var mk = marks[at];
    mk.className = 'now';
    var sec = mk.closest('.sec');
    if (sec) toggle(sec, true);
    mk.scrollIntoView({ behavior: 'smooth', block: 'center' });
    send({ type: 'find', count: marks.length, at: at + 1 });
  };
  var find = function (query) {
    clear();
    var q = String(query || '').trim().toLowerCase();
    if (q.length < 2) { send({ type: 'find', count: 0, at: 0 }); return; }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var texts = [], node;
    while ((node = walker.nextNode())) {
      var el = node.parentNode;
      if (!el || /^(SCRIPT|STYLE|MARK)$/.test(el.tagName)) continue;
      if (el.closest('.jump') || !node.nodeValue.trim()) continue;
      // Skip anything hidden as clutter (but not text inside a folded section).
      if (node.nodeValue.toLowerCase().indexOf(q) >= 0 && !el.closest(HIDDEN)) texts.push(node);
    }
    for (var k = 0; k < texts.length && marks.length < 400; k++) {
      var tn = texts[k], idx;
      while (tn && (idx = tn.nodeValue.toLowerCase().indexOf(q)) >= 0 && marks.length < 400) {
        var hit = tn.splitText(idx);
        tn = hit.splitText(q.length);
        var mk = document.createElement('mark');
        hit.parentNode.replaceChild(mk, hit);
        mk.appendChild(hit);
        marks.push(mk);
      }
    }
    if (marks.length) show(0);
    else send({ type: 'find', count: 0, at: 0 });
  };

  window.__readerMs = Date.now() - t0;
  window.__reader = function (cmd) {
    if (cmd.type === 'find') find(cmd.query);
    else if (cmd.type === 'next') show(at + 1);
    else if (cmd.type === 'prev') show(at - 1);
    else if (cmd.type === 'clear') { clear(); send({ type: 'find', count: 0, at: 0 }); }
  };
  // The browser preview talks to the page with messages instead.
  window.addEventListener('message', function (e) {
    try {
      var cmd = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (cmd && cmd.reader) window.__reader(cmd);
    } catch (err) {}
  });
})();
`;

export function buildReaderPage(opts: {
  title: string;
  html: string;
  source: string;
  license: string;
  px: number;
  colors: ReaderColors;
  /** Is this other guide on the phone? Links to guides that are not become plain text. */
  isSaved?: (id: string) => boolean;
}): string {
  // Only our own script may run: anything else in a guide is refused.
  const body = opts.isSaved
    ? opts.html.replace(
        /<a\b[^>]*href="lastapp:\/\/item\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
        (whole, id: string, text: string) => (opts.isSaved!(decodeURIComponent(id)) ? whole : text),
      )
    : opts.html;
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'nonce-${nonce}'">
<style>${css(opts.px, opts.colors)}</style></head><body><div id="doc"><h1>${escapeHtml(opts.title)}</h1>${body}</div>
<p class="credit">Source: ${escapeHtml(opts.source)} · ${escapeHtml(opts.license)}.
General information, not medical advice. If you can reach emergency services, please do that first.</p>
<script nonce="${nonce}">${SCRIPT}</script></body></html>`;
}
