const KEY = 'pitwall.team';

export function getFanTeam(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function setFanTeam(id: string) {
  try { localStorage.setItem(KEY, id); } catch { /* private mode: the picker just shows again next visit */ }
}

const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lum = (c: number[]) => c.reduce((s, v, i) => s + ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a: number[], b: number[]) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

export function legible(hex: string, bg: string, min = 4.5): string {
  const b = rgb(bg), to = lum(b) > 0.4 ? 0 : 255;
  let c = rgb(hex);
  for (let i = 0; i < 30 && ratio(c, b) < min; i++) c = c.map(v => v + (to - v) * 0.06);
  return '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}
