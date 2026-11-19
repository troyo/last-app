// Things for the Rebuild pictures: animals, tools, furniture. Same flat style as kit.mjs.
import { C, GROUND, shade, SKIN, flame } from './kit.mjs';

export function goat(x, y = GROUND, o = {}) {
  const s = o.scale ?? 1;
  const f = o.facing ?? 1;
  const col = o.color ?? '#E8E1D4';
  const d = shade(col, 0.2);
  return `<g transform="translate(${x},${y}) scale(${f * s},${s})">
    <rect x="-62" y="-60" width="12" height="60" rx="6" fill="${d}"/><rect x="38" y="-60" width="12" height="60" rx="6" fill="${d}"/>
    <rect x="-44" y="-60" width="12" height="60" rx="6" fill="${col}"/><rect x="54" y="-60" width="12" height="60" rx="6" fill="${col}"/>
    <ellipse cx="0" cy="-82" rx="80" ry="38" fill="${col}"/>
    <path d="M -78 -94 q -14 -14 -4 -26" stroke="${d}" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 62 -100 L 92 -140" stroke="${col}" stroke-width="30" stroke-linecap="round"/>
    <ellipse cx="108" cy="-142" rx="30" ry="20" fill="${col}" transform="rotate(25 108 -142)"/>
    <path d="M 90 -160 q 4 -24 -12 -34" stroke="#9C8A6A" stroke-width="8" stroke-linecap="round" fill="none"/>
    <ellipse cx="84" cy="-146" rx="16" ry="7" fill="${d}" transform="rotate(-30 84 -146)"/>
    <circle cx="112" cy="-148" r="4" fill="${C.ink}"/>
    <path d="M 124 -128 q 0 16 -8 22" stroke="${d}" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${o.udder ? `<ellipse cx="20" cy="-46" rx="20" ry="14" fill="#F2B8A8"/>` : ''}
  </g>`;
}

export function basket(x, y, o = {}) {
  const s = o.scale ?? 1;
  const r = o.rot ?? 0;
  return `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})"><path d="M -70 -60 L 70 -60 L 54 0 L -54 0 Z" fill="${C.straw}"/><path d="M -64 -40 L 64 -40 M -60 -20 L 60 -20" stroke="#C9A54B" stroke-width="6"/><rect x="-78" y="-68" width="156" height="14" rx="7" fill="#C9A54B"/>${o.fill ? `<ellipse cx="0" cy="-66" rx="64" ry="14" fill="${o.fill}"/>` : ''}</g>`;
}

export function drum(x, y = GROUND, o = {}) {
  const s = o.scale ?? 1;
  const lift = o.lift ?? 0;
  const yy = y - lift;
  return `${o.bricks ? [-50, 0, 50].map((d) => `<rect x="${x + d * s - 20 * s}" y="${y - lift}" width="${40 * s}" height="${lift}" rx="4" fill="${C.clay}"/>`).join('') : ''}
  <rect x="${x - 70 * s}" y="${yy - 190 * s}" width="${140 * s}" height="${190 * s}" rx="${10 * s}" fill="${C.metal}"/>
  <path d="M ${x - 70 * s} ${yy - 130 * s} h ${140 * s} M ${x - 70 * s} ${yy - 60 * s} h ${140 * s}" stroke="${C.metalDark}" stroke-width="${6 * s}"/>
  ${o.lid ? `<rect x="${x - 78 * s}" y="${yy - 204 * s}" width="${156 * s}" height="${18 * s}" rx="${6 * s}" fill="${C.metalDark}"/>` : ''}
  ${o.holes ? [-40, -14, 14, 40].map((d) => `<circle cx="${x + d * s}" cy="${yy - 10 * s}" r="${6 * s}" fill="${C.ink}"/>`).join('') : ''}`;
}

export function brick(x, y, o = {}) {
  const w = o.w ?? 90,
    h = o.h ?? 44;
  const col = o.color ?? '#B9875C';
  return `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="6" fill="${col}" stroke="${shade(col, 0.18)}" stroke-width="4"/>`;
}

export function anvil(x, y = GROUND, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-40" y="-70" width="80" height="70" fill="${C.wood}"/><path d="M -70 -110 L 60 -110 Q 110 -110 120 -96 L 60 -86 L 40 -70 L -40 -70 L -60 -86 L -70 -86 Z" fill="#4A545E"/><rect x="-70" y="-116" width="130" height="10" rx="4" fill="#6B7783"/></g>`;
}

export function hammer(x, y, rot = 0, s = 1) {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-6" y="0" width="12" height="90" rx="6" fill="${C.wood}"/><rect x="-26" y="-18" width="52" height="26" rx="5" fill="#4A545E"/></g>`;
}

export function bed(x, y = GROUND, w = 320) {
  return `<rect x="${x - w / 2}" y="${y - 70}" width="${w}" height="40" rx="12" fill="${C.cloth}" stroke="#E2D7BD" stroke-width="4"/><rect x="${x - w / 2 - 10}" y="${y - 34}" width="${w + 20}" height="20" rx="6" fill="${C.wood}"/><rect x="${x - w / 2 - 10}" y="${y - 14}" width="14" height="14" fill="${C.woodDark}"/><rect x="${x + w / 2 - 4}" y="${y - 14}" width="14" height="14" fill="${C.woodDark}"/><rect x="${x - w / 2 - 14}" y="${y - 120}" width="18" height="120" rx="6" fill="${C.woodDark}"/>`;
}

export function chair(x, y = GROUND, f = 1) {
  return `<rect x="${x - 40}" y="${y - 96}" width="80" height="14" rx="6" fill="${C.wood}"/><rect x="${x - 36}" y="${y - 84}" width="10" height="84" fill="${C.woodDark}"/><rect x="${x + 26}" y="${y - 84}" width="10" height="84" fill="${C.woodDark}"/><rect x="${x - f * 40 - 6}" y="${y - 200}" width="12" height="116" rx="5" fill="${C.woodDark}"/>`;
}

export function table(x, y = GROUND, w = 300, h = 110) {
  return `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="18" rx="8" fill="${C.wood}"/><rect x="${x - w / 2 + 16}" y="${y - h + 14}" width="14" height="${h - 14}" fill="${C.woodDark}"/><rect x="${x + w / 2 - 30}" y="${y - h + 14}" width="14" height="${h - 14}" fill="${C.woodDark}"/>`;
}

export function book(x, y, o = {}) {
  const s = o.scale ?? 1;
  const lines = (dx) =>
    [0, 1, 2, 3]
      .map(
        (i) =>
          `<path d="M ${dx} ${-40 + i * 20} h 66" stroke="#B9C4BF" stroke-width="5" stroke-linecap="round"/>`,
      )
      .join('');
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M -100 -66 L 0 -56 L 100 -66 L 100 54 L 0 64 L -100 54 Z" fill="${o.cover ?? C.forest}"/><path d="M -92 -60 L -4 -50 L -4 56 L -92 48 Z" fill="#fff"/><path d="M 92 -60 L 4 -50 L 4 56 L 92 48 Z" fill="#fff"/><g>${lines(-84)}${lines(16)}</g>${o.text ?? ''}</g>`;
}

export function bowl(x, y, o = {}) {
  const s = o.scale ?? 1;
  const col = o.color ?? C.clay;
  return `<g transform="translate(${x},${y}) scale(${s})">${o.fill ? `<ellipse cx="0" cy="-40" rx="66" ry="14" fill="${o.fill}"/>` : ''}<path d="M -74 -42 Q -70 10 0 10 Q 70 10 74 -42 Z" fill="${col}"/><rect x="-78" y="-48" width="156" height="12" rx="6" fill="${shade(col, 0.15)}"/></g>`;
}

export function clock(x, y, r = 46, h = 2) {
  const a = (h / 12) * 2 * Math.PI - Math.PI / 2;
  return `<g filter="url(#soft)"><circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/></g><circle cx="${x}" cy="${y}" r="${r - 6}" fill="none" stroke="${C.ink}" stroke-width="5"/><path d="M ${x} ${y} L ${x} ${y - r * 0.62} M ${x} ${y} L ${x + Math.cos(a) * r * 0.45} ${y + Math.sin(a) * r * 0.45}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
}

export function wheat(x, y = GROUND, s = 1, col = C.straw) {
  const grains = Array.from(
    { length: 5 },
    (_, i) =>
      `<ellipse cx="${-7}" cy="${-150 - i * 14}" rx="7" ry="11" fill="${col}" transform="rotate(-25 -7 ${-150 - i * 14})"/><ellipse cx="7" cy="${-156 - i * 14}" rx="7" ry="11" fill="${col}" transform="rotate(25 7 ${-156 - i * 14})"/>`,
  ).join('');
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M 0 0 L 0 -150" stroke="${shade(col, 0.15)}" stroke-width="6" stroke-linecap="round"/>${grains}</g>`;
}

export function field(x1, x2, y = GROUND, s = 1, col = C.straw) {
  let out = '';
  for (let x = x1; x <= x2; x += 30 * s) out += wheat(x, y, s * (0.85 + ((x * 7) % 5) / 25), col);
  return out;
}

export function stick(x1, y1, x2, y2, w = 12) {
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${C.wood}" stroke-width="${w}" stroke-linecap="round"/>`;
}

export function fly(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="-12" cy="-12" rx="14" ry="9" fill="#D8E6EE" transform="rotate(-30 -12 -12)"/><ellipse cx="12" cy="-12" rx="14" ry="9" fill="#D8E6EE" transform="rotate(30 12 -12)"/><ellipse cx="0" cy="0" rx="10" ry="16" fill="${C.ink}"/></g>`;
}

export function sack(x, y = GROUND, o = {}) {
  const s = o.scale ?? 1;
  const col = o.color ?? '#D9C29A';
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M -50 0 Q -62 -70 -30 -100 L 30 -100 Q 62 -70 50 0 Z" fill="${col}"/><path d="M -30 -100 Q 0 -116 30 -100" stroke="${shade(col, 0.25)}" stroke-width="8" fill="none"/>${o.label ? `<text x="0" y="-40" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" fill="${shade(col, 0.5)}">${o.label}</text>` : ''}</g>`;
}

export function letter(x, y, t, o = {}) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${o.size ?? 80}" fill="${o.color ?? C.ink}">${t}</text>`;
}

export function heart(x, y, s = 1, col = C.coral) {
  return `<g transform="translate(${x},${y}) scale(${s})" filter="url(#soft)"><path d="M 0 -20 c -20 -30 -60 -10 -40 20 l 40 36 l 40 -36 c 20 -30 -20 -50 -40 -20 z" fill="${col}"/></g>`;
}

export function stone(x, y, w = 60, h = 34, col = C.stone) {
  return `<ellipse cx="${x}" cy="${y - h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${col}"/>`;
}

export function moon(x, y, r = 34) {
  return `<path d="M ${x} ${y - r} A ${r} ${r} 0 1 0 ${x + r * 0.9} ${y + r * 0.5} A ${r * 0.8} ${r * 0.8} 0 1 1 ${x} ${y - r} Z" fill="#F3E3A8"/>`;
}

export const SKINS = SKIN;

// ---------- home things ----------
export function fridge(x, y = GROUND, o = {}) {
  const s = o.scale ?? 1;
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-80" y="-320" width="160" height="320" rx="18" fill="#E8EEF2" stroke="#B9C4CB" stroke-width="5"/><path d="M -80 -200 H 80" stroke="#B9C4CB" stroke-width="5"/><rect x="50" y="-300" width="10" height="70" rx="5" fill="${C.metalDark}"/><rect x="50" y="-180" width="10" height="90" rx="5" fill="${C.metalDark}"/>${o.label ? `<text x="0" y="-100" text-anchor="middle" font-family="Inter" font-weight="800" font-size="40" fill="${C.ink}">${o.label}</text>` : ''}</g>`;
}

export function phone(x, y, o = {}) {
  const s = o.scale ?? 1;
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${o.rot ?? 0})"><rect x="-50" y="-96" width="100" height="192" rx="18" fill="${C.ink}"/><rect x="-42" y="-82" width="84" height="164" rx="10" fill="${o.screen ?? '#BFD9EA'}"/>${o.body ?? ''}</g>`;
}

export function flashlight(x, y, rot = 0, s = 1, on = true) {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">${on ? `<path d="M 60 -20 L 260 -90 L 260 90 L 60 20 Z" fill="${C.sun}" opacity="0.35"/>` : ''}<rect x="-80" y="-18" width="120" height="36" rx="10" fill="${C.forest}"/><path d="M 40 -26 L 66 -34 L 66 34 L 40 26 Z" fill="${C.forest}"/><rect x="62" y="-30" width="8" height="60" rx="3" fill="#FFF3C4"/></g>`;
}

export function candle(x, y = GROUND, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-18" y="-110" width="36" height="110" rx="6" fill="#F7F1E3" stroke="#E2D7BD" stroke-width="4"/>${flame(0, -112, 0.35)}</g>`;
}

export function generator(x, y = GROUND, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-90" y="-120" width="180" height="110" rx="14" fill="${C.coral}"/><rect x="-70" y="-100" width="80" height="60" rx="8" fill="${C.ink}"/><circle cx="50" cy="-70" r="20" fill="#E8EEF2"/><circle cx="-60" cy="-6" r="16" fill="${C.ink}"/><circle cx="60" cy="-6" r="16" fill="${C.ink}"/><path d="M 90 -40 q 30 -10 30 -40" stroke="#9FA8A3" stroke-width="10" fill="none"/></g>`;
}

export function car(x, y = GROUND, s = 1, col = '#5B8DBE') {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-140" y="-90" width="280" height="70" rx="22" fill="${col}"/><path d="M -90 -88 L -60 -150 L 70 -150 L 100 -88 Z" fill="${col}"/><path d="M -70 -96 L -50 -138 L 0 -138 L 0 -96 Z M 14 -96 L 14 -138 L 62 -138 L 84 -96 Z" fill="#CFE6F5"/><circle cx="-80" cy="-20" r="30" fill="${C.ink}"/><circle cx="80" cy="-20" r="30" fill="${C.ink}"/><circle cx="-80" cy="-20" r="12" fill="#9AA5AD"/><circle cx="80" cy="-20" r="12" fill="#9AA5AD"/></g>`;
}

export function toilet(x, y = GROUND, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="40" y="-230" width="70" height="120" rx="12" fill="#F4F6F5" stroke="#C9D2CE" stroke-width="5"/><path d="M -110 -120 L 80 -120 Q 80 -40 10 -30 L 20 0 L -60 0 L -50 -30 Q -110 -50 -110 -120 Z" fill="#F4F6F5" stroke="#C9D2CE" stroke-width="5"/><rect x="-120" y="-132" width="210" height="18" rx="9" fill="#E3E8E6" stroke="#C9D2CE" stroke-width="4"/></g>`;
}

export function windowFrame(x, y, w = 160, h = 160, o = {}) {
  return `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" fill="${o.night ? '#2F4A6B' : '#BFD9EA'}" stroke="#FFFFFF" stroke-width="10"/><path d="M ${x} ${y - h / 2} V ${y + h / 2} M ${x - w / 2} ${y} H ${x + w / 2}" stroke="#fff" stroke-width="8"/>${o.curtain ? `<rect x="${x - w / 2 - 10}" y="${y - h / 2 - 12}" width="${w + 20}" height="${h + 24}" fill="${o.curtain}"/><path d="M ${x} ${y - h / 2 - 12} V ${y + h / 2 + 12}" stroke="${shade(o.curtain, 0.2)}" stroke-width="6"/>` : ''}`;
}

export function tub(x, y = GROUND, s = 1, water = true) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M -170 -110 L 170 -110 Q 170 0 120 0 L -120 0 Q -170 0 -170 -110 Z" fill="#F4F6F5" stroke="#C9D2CE" stroke-width="5"/>${water ? `<path d="M -160 -96 L 160 -96 Q 156 -16 116 -14 L -116 -14 Q -156 -16 -160 -96 Z" fill="${C.waterLight}"/>` : ''}<rect x="120" y="-170" width="14" height="60" rx="6" fill="${C.metalDark}"/><rect x="100" y="-176" width="50" height="14" rx="6" fill="${C.metalDark}"/></g>`;
}
