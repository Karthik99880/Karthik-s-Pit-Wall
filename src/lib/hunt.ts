/**
 * Easter-egg hunt progress, kept in localStorage. Every access is guarded:
 * Safari private mode and locked-down browsers throw on localStorage.
 */
const KEY = 'pitwall_hunt_stage';
export const HUNT_EVENT = 'pitwall-stage-update';

export function readHuntStage(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export function setHuntStage(stage: number | null): void {
  try {
    if (stage === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, String(stage));
  } catch { /* storage unavailable: the hunt just won't persist */ }
  window.dispatchEvent(new Event(HUNT_EVENT));
}

/**
 * If the player has reached `required`, move them to `next` (never backwards,
 * so re-tapping an earlier clue doesn't undo later progress) and return true.
 * Otherwise return false and do nothing: casual visitors, especially on
 * phones where tapping a card is the natural thing to do, see no popup.
 */
export function advanceHunt(required: number, next: number): boolean {
  const stage = readHuntStage();
  if (stage < required) return false;
  if (next > stage) setHuntStage(next);
  return true;
}
