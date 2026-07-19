


const DEFAULT_TIME = '14:00:00';


export function f1Date(date: string, time?: string | null): Date {
  const t = (time ?? DEFAULT_TIME).replace(/Z$/i, '');
  return new Date(`${date}T${t}Z`);
}


export const parseF1DateTime = f1Date;


export function msUntil(target: Date | number): number {
  const ts = typeof target === 'number' ? target : target.getTime();
  return Math.max(0, ts - Date.now());
}


export function breakdown(ms: number) {
  const abs = Math.abs(ms);
  return {
    days:    Math.floor(abs / 86_400_000),
    hours:   Math.floor(abs / 3_600_000) % 24,
    minutes: Math.floor(abs / 60_000) % 60,
    seconds: Math.floor(abs / 1_000) % 60,
  };
}
