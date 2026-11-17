// "Ask anything": answers a plain question using only what is on the phone.
//
// There is no AI model and no internet here. It works like a very fast
// librarian: find the guides most likely to help, open them, and pull out the
// few sentences that best match the question. Because every answer is copied
// from a guide, it can't make things up, and each one links to its source.

import { getChecklists } from './checklists';
import { HAZARDS } from './hazards';
import { fileFor, isDownloaded } from './library';
import { QUICK_HELP } from './quick-help';
import { search, SYNONYMS, wordsOf } from './search';

export type Answer = {
  key: string;
  /** Where it came from, shown above the text. */
  from: string;
  title: string;
  /** Numbered steps, when the source is a how-to. */
  steps?: string[];
  /** Or a short passage of plain text. */
  text?: string;
  /** Where "Read the full guide" goes. */
  href: string;
  linkLabel: string;
};

const clean = (html: string) =>
  html
    .replace(/<(script|style|table|figure|sup)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\[\s*\d+\s*\]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?)\]])/g, '$1')
    .replace(/([(\[])\s+/g, '$1')
    .replace(/\(\s*[,;]?\s*\)/g, '')
    .trim();

/** How many of the question's words (or their everyday synonyms) a text mentions. */
function hits(words: string[], text: string): number {
  const hay = text.toLowerCase();
  let n = 0;
  for (const w of words) {
    if (hay.includes(w)) n += 2;
    else if ((SYNONYMS[w] ?? []).some((alt) => hay.includes(alt))) n += 1;
  }
  return n;
}

const DO_HEADING =
  /\b(treat|treatment|treating|first aid|management|managing|what to do|how to|steps|care|caring|procedure|method|instructions|prevention|preventing|remedy|remedies|emergency|response|making|building|preparation|preparing|use|using)\b/i;
const ABOUT_HEADING =
  /\b(cause|causes|classification|types|signs|symptoms|diagnosis|epidemiology|prognosis|pathophysiology|etymology|society|culture|research|statistics|overview|background|definition|terminology|mechanism|risk factors|in animals)\b/i;

type Passage = { heading: string; text: string; score: number };

/** Split a guide into its paragraphs and list items, remembering the heading above each. */
function passagesOf(html: string, words: string[]): Passage[] {
  const out: Passage[] = [];
  let heading = '';
  const blocks = html.match(/<(h[2-4]|p|li)\b[^>]*>[\s\S]*?<\/\1>/gi) ?? [];
  for (const block of blocks) {
    const text = clean(block);
    if (/^<h/i.test(block)) {
      heading = text;
      continue;
    }
    if (text.length < 50) continue;
    let score = hits(words, text) + hits(words, heading) * 0.75;
    if (score === 0) continue;
    // Prefer instructions over background, and skip walls of text.
    if (
      /\b(should|must|do not|don't|never|always|use|keep|place|apply|boil|wash|cover)\b/i.test(text)
    )
      score += 0.75;
    if (/^(see also|references|external links|further reading|history)/i.test(heading)) score -= 3;
    // People asking in an emergency want what to do, not what the thing is.
    if (DO_HEADING.test(heading)) score += 2.5;
    else if (ABOUT_HEADING.test(heading)) score -= 1.5;
    if (/<li\b/i.test(block) && DO_HEADING.test(heading)) score += 0.5;
    if (text.length > 900) score -= 0.5;
    // "A bivouac is a kind of…" explains the word. It does not tell you what to do.
    if (!heading && /^.{0,90}\b(is|are|was|refers to|means)\b (a|an|the|any|one)\b/i.test(text))
      score -= 2;
    // A passage that starts by telling you to do something is what people came for.
    if (
      /^(first|then|next|to \w+|if you|you can|you should|make|put|cut|dig|tie|fill|find|build|use|keep|place|apply|boil|wash|cover|wrap|press|hold|lay|pour|mix|add|take|remove|check|start|stop|never|always|do not|don't)\b/i.test(
        text,
      )
    )
      score += 1.5;
    out.push({ heading, text, score });
  }
  return out;
}

/** Trim a passage to a few whole sentences. */
function shorten(text: string, max = 420): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return end > 120 ? cut.slice(0, end + 1) : cut.replace(/\s\S*$/, '') + '…';
}

export async function ask(question: string): Promise<Answer[]> {
  const words = wordsOf(question);
  if (words.length === 0) return [];
  const answers: (Answer & { score: number })[] = [];
  const need = 2; // at least one of the question's words, said outright

  // 1. Emergency cards: the most carefully written steps we have.
  for (const h of QUICK_HELP) {
    const about = hits(words, `${h.title} ${h.when}`); // the card is about this
    const inside = hits(words, h.steps.join(' ')); // or its steps mention it a lot
    if (about < 2 && inside < 4) continue;
    answers.push({
      key: `help-${h.id}`,
      from: 'Emergency steps',
      title: h.title,
      steps: h.steps,
      href: `/help/${h.id}`,
      linkLabel: 'Open the full card',
      score: about * 3 + inside * 0.5 + 2,
    });
  }

  // 2. Disaster guides.
  for (const h of HAZARDS) {
    if (hits(words, `${h.title} ${h.search}`) < 2) continue;
    answers.push({
      key: `hazard-${h.id}`,
      from: 'Disaster guide',
      title: `${h.title}: if it’s happening now`,
      steps: h.during,
      href: `/hazard/${h.id}`,
      linkLabel: 'See before, during and after',
      score: hits(words, `${h.title} ${h.search}`) * 2 + 2,
    });
  }

  // 3. The "why" notes on the get-ready lists: short and practical.
  for (const list of getChecklists())
    for (const g of list.groups)
      for (const item of g.items) {
        if (!item.why) continue;
        const score = hits(words, `${item.text} ${item.why}`);
        if (score < 4) continue;
        answers.push({
          key: `list-${list.id}-${item.id}`,
          from: `Get ready for ${list.title}`,
          title: item.text,
          text: item.why,
          href: `/checklist/${list.id}`,
          linkLabel: 'Open the checklist',
          score: score * 0.9,
        });
      }

  // 4. The saved guides: open the best few and pull out the matching passages.
  const saved = (q: string) =>
    search(q, 40)
      .guides.map((g) => g.item)
      .filter((item) => item.type === 'article' && isDownloaded(item));
  let guides = saved(question);
  // A whole sentence can match only guides in packs this phone doesn't have.
  // Then look word by word, so "how do I build a shelter" still finds the shelter guide.
  if (guides.length < 3 && words.length > 1) {
    const ids = new Set(guides.map((g) => g.id));
    for (const w of words)
      for (const item of saved(w).slice(0, 6))
        if (!ids.has(item.id)) {
          ids.add(item.id);
          guides.push(item);
        }
  }
  guides = guides.slice(0, 8);
  const read = await Promise.all(
    guides.map(async (item, rank) => {
      try {
        const html = await fileFor(item).text();
        const best = passagesOf(html, words).sort((a, b) => b.score - a.score)[0];
        return best ? { item, best, rank } : null;
      } catch {
        return null;
      }
    }),
  );
  for (const r of read) {
    if (!r || r.best.score < need) continue;
    answers.push({
      key: `guide-${r.item.id}`,
      from: r.best.heading || 'Saved guide',
      title: r.item.title,
      text: shorten(r.best.text),
      href: `/item/${r.item.id}`,
      linkLabel: 'Read the full guide',
      score: r.best.score + (8 - r.rank) * 0.3,
    });
  }

  // Best first, one answer per source, and never a wall of cards.
  const seen = new Set<string>();
  const top = Math.max(0, ...answers.map((a) => a.score));
  return answers
    .sort((a, b) => b.score - a.score)
    .filter((a) => {
      // Weak matches next to a strong one are just noise.
      if (a.score < top * 0.6) return false;
      // A guide and its plain-language twin say the same thing: keep whichever ranked higher.
      const base = a.title.replace(' (in simple words)', '');
      if (seen.has(base)) return false;
      seen.add(base);
      return true;
    })
    .slice(0, 4);
}

export const ASK_IDEAS = [
  'How do I make water safe to drink?',
  'What do I do for a deep cut?',
  'How do I stay warm with no power?',
  'How long does food last in the fridge?',
  'How do I start a fire?',
  'What should be in a first aid kit?',
];
