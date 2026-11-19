// "Read next": what to open after a card. Nobody should finish one card and
// be left wondering what comes after it.
//
// Each card names the cards that naturally follow it, plus a few plain words
// used to find matching guides among the ones saved on this phone.

import { Item } from './catalog';
import { isDownloaded } from './library';
import { findQuickHelp, QuickHelp } from './quick-help';
import { search } from './search';

type Next = { cards: string[]; find: string };

const NEXT: Record<string, Next> = {
  bleeding: { cards: ['wound', 'sick', 'cpr'], find: 'bleeding wound first aid' },
  cpr: { cards: ['choking', 'bleeding', 'death'], find: 'cardiopulmonary resuscitation' },
  choking: { cards: ['cpr', 'allergy'], find: 'choking' },
  burn: { cards: ['wound', 'sick', 'dehydration'], find: 'burn' },
  'broken-bone': { cards: ['wound', 'sick'], find: 'splint bone fracture' },
  heat: { cards: ['cool', 'dehydration', 'find-water'], find: 'heat stroke' },
  cold: { cards: ['warm', 'fire', 'shelter'], find: 'hypothermia frostbite' },
  water: { cards: ['find-water', 'store-water', 'dehydration'], find: 'water purification' },
  lost: { cards: ['find-way', 'shelter', 'signal'], find: 'navigation survival' },
  power: { cards: ['light', 'cook', 'food-cold'], find: 'power outage' },
  fire: { cards: ['cook', 'warm', 'firewood'], find: 'fire making' },
  shelter: { cards: ['fire', 'warm', 'find-water'], find: 'shelter' },
  'find-water': { cards: ['water', 'store-water', 'dehydration'], find: 'rainwater well spring' },
  signal: { cards: ['lost', 'find-way', 'shelter'], find: 'distress signal' },
  warm: { cards: ['fire', 'firewood', 'cold'], find: 'insulation clothing warm' },
  'snake-bite': { cards: ['wound', 'allergy', 'sick'], find: 'snakebite' },
  seizure: { cards: ['cpr', 'sick'], find: 'seizure epilepsy' },
  dehydration: { cards: ['water', 'sick', 'toilet'], find: 'oral rehydration diarrhea' },
  wound: { cards: ['bleeding', 'sick', 'soap'], find: 'wound infection' },
  allergy: { cards: ['cpr', 'choking', 'snake-bite'], find: 'anaphylaxis allergy' },
  light: { cards: ['fire', 'phone', 'power'], find: 'candle lamp' },
  cook: { cards: ['fire', 'food-cold', 'keep-food'], find: 'outdoor cooking stove' },
  toilet: { cards: ['latrine', 'soap', 'dehydration'], find: 'sanitation toilet' },
  'food-cold': { cards: ['keep-food', 'cook', 'ration'], find: 'food spoilage safety' },
  cool: { cards: ['heat', 'dehydration', 'find-water'], find: 'cooling heat' },
  phone: { cards: ['power', 'light', 'signal'], find: 'battery' },
  'store-water': { cards: ['water', 'find-water', 'ration'], find: 'water storage' },
  latrine: { cards: ['toilet', 'soap', 'dehydration'], find: 'latrine sanitation' },
  ration: { cards: ['keep-food', 'forage', 'garden'], find: 'food storage nutrition' },
  sick: { cards: ['dehydration', 'wound', 'soap'], find: 'fever infection nursing' },
  garden: { cards: ['keep-food', 'chickens', 'forage'], find: 'vegetable garden' },
  birth: { cards: ['bleeding', 'sick', 'soap'], find: 'childbirth newborn' },
  tooth: { cards: ['sick', 'wound'], find: 'toothache dental' },
  soap: { cards: ['latrine', 'wound', 'sick'], find: 'soap hygiene' },
  'keep-food': { cards: ['ration', 'garden', 'cook'], find: 'food preservation drying' },
  firewood: { cards: ['fire', 'warm', 'mend'], find: 'firewood' },
  watch: { cards: ['signal', 'ration', 'sick'], find: 'security community' },
  forage: { cards: ['trap', 'garden', 'keep-food'], find: 'edible wild plants' },
  trap: { cards: ['forage', 'keep-food', 'cook'], find: 'fishing trapping' },
  chickens: { cards: ['garden', 'keep-food', 'trap'], find: 'chicken poultry' },
  mend: { cards: ['firewood', 'soap', 'shelter'], find: 'sewing sharpening' },
  'find-way': { cards: ['lost', 'signal', 'shelter'], find: 'compass navigation' },
  death: { cards: ['sick', 'latrine', 'watch'], find: 'grief' },
};

/** The cards and saved guides worth opening after this card. */
export function readNext(id: string): { cards: QuickHelp[]; guides: Item[] } {
  const next = NEXT[id];
  if (!next) return { cards: [], guides: [] };
  const cards = next.cards.map(findQuickHelp).filter((h): h is QuickHelp => !!h);
  const seen = new Set<string>();
  const guides: Item[] = [];
  for (const hit of search(next.find, 30).guides) {
    // A guide and its plain-language twin say the same thing: show one.
    const base = hit.item.title.replace(' (in simple words)', '');
    if (seen.has(base) || !isDownloaded(hit.item)) continue;
    seen.add(base);
    guides.push(hit.item);
    if (guides.length === 3) break;
  }
  return { cards, guides };
}
