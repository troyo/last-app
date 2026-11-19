// Writes src/lib/rebuild-pictures.ts from the rb-<card>-<step>.png files in assets/show.
// React Native needs every picture as its own require(), so the list is generated, not globbed.
//   node tools/art/index-rebuild.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const files = fs
  .readdirSync(path.join(root, 'assets/show'))
  .filter((f) => /^rb-.+-\d+\.png$/.test(f));
const byCard = {};
for (const f of files) {
  const [, id, i] = f.match(/^rb-(.+)-(\d+)\.png$/);
  (byCard[id] ??= []).push([Number(i), f]);
}
let out = `// Made by tools/art/index-rebuild.mjs. Do not edit by hand.
// The step pictures for the Rebuild cards: card id -> step index -> picture.
export const REBUILD_PICS: Record<string, Record<number, number>> = {
`;
for (const id of Object.keys(byCard).sort()) {
  out += `  '${id}': {\n`;
  for (const [i, f] of byCard[id].sort((a, b) => a[0] - b[0]))
    out += `    ${i}: require('../../assets/show/${f}'),\n`;
  out += `  },\n`;
}
out += '};\n';
fs.writeFileSync(path.join(root, 'src/lib/rebuild-pictures.ts'), out);
console.log(`${files.length} pictures for ${Object.keys(byCard).length} cards`);
