const KEY = 'pitwall_intro_seen';
export const INTRO_SECONDS = 3.6;

let pending: boolean | null = null;

export function introPending(): boolean {
  if (pending === null) {
    try {
      pending = !matchMedia('(prefers-reduced-motion: reduce)').matches && !sessionStorage.getItem(KEY);
      sessionStorage.setItem(KEY, '1');
    } catch {
      pending = false;
    }
  }
  return pending;
}

export function introDone(): void {
  pending = false;
}
