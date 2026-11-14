const KEY = 'pitwall.team';

export function getFanTeam(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function setFanTeam(id: string) {
  try { localStorage.setItem(KEY, id); } catch { /* private mode: the picker just shows again next visit */ }
}
