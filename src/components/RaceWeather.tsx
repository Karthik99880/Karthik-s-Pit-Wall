import { useQuery } from '@tanstack/react-query';
import { useNextRace, buildSessions } from '@/hooks/useF1Data';
import { f1Date } from '@/lib/dateUtils';
import type { Race } from '@/lib/f1Types';
import Skeleton from '@/components/Skeleton';

type Glyph = 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog';

const CLOUD = 'M7 17a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8.5a4.25 4.25 0 0 1 0 8.5Z';

function WeatherGlyph({ kind }: { kind: Glyph }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'sun' && (<><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>)}
      {kind === 'cloud' && <path d="M7 19a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4.75 4.75 0 0 1 0 9.5Z" />}
      {kind === 'rain' && (<><path d={CLOUD} transform="translate(0 -3)" /><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" /></>)}
      {kind === 'snow' && (<><path d={CLOUD} transform="translate(0 -3)" /><path d="M8 18v.01M12 20v.01M16 18v.01M10 21v.01M14 21v.01" strokeWidth="2.4" /></>)}
      {kind === 'storm' && (<><path d={CLOUD} transform="translate(0 -3)" /><path d="m12.5 14-2.5 4h3.5l-2 3.5" /></>)}
      {kind === 'fog' && <path d="M4 8h16M3 12h18M5 16h14M8 20h8" />}
    </svg>
  );
}

/* WMO weather codes to glyph and short label */
function wmo(code: number): { icon: Glyph; label: string } {
  if (code === 0) return { icon: 'sun', label: 'Clear' };
  if (code <= 2)  return { icon: 'cloud', label: 'Partly cloudy' };
  if (code === 3) return { icon: 'cloud', label: 'Overcast' };
  if (code <= 48) return { icon: 'fog', label: 'Fog' };
  if (code <= 57) return { icon: 'rain', label: 'Drizzle' };
  if (code <= 67) return { icon: 'rain', label: 'Rain' };
  if (code <= 77) return { icon: 'snow', label: 'Snow' };
  if (code <= 82) return { icon: 'rain', label: 'Showers' };
  if (code <= 86) return { icon: 'snow', label: 'Snow showers' };
  return { icon: 'storm', label: 'Thunderstorm' };
}

interface HourlyBlock {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
  weather_code: number[];
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);

function useWeekendForecast(race: Race | null | undefined) {
  const lat = race?.Circuit.Location.lat;
  const lon = race?.Circuit.Location.long;

  return useQuery({
    queryKey: ['weather', race?.round, lat, lon],
    enabled: !!race && !!lat && !!lon,
    staleTime: 60 * 60 * 1000,
    retry: 1,
    queryFn: async (): Promise<HourlyBlock | null> => {
      const sessions = buildSessions(race!);
      if (!sessions.length) return null;

      const first = f1Date(sessions[0].date, sessions[0].time);
      const last  = f1Date(race!.date, race!.time);

      // open-meteo only forecasts ~16 days out
      const daysAway = (first.getTime() - Date.now()) / 86_400_000;
      if (daysAway > 15) return null;

      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', String(lat));
      url.searchParams.set('longitude', String(lon));
      url.searchParams.set('hourly', 'temperature_2m,precipitation_probability,wind_speed_10m,weather_code');
      url.searchParams.set('start_date', ymd(first));
      url.searchParams.set('end_date', ymd(last));
      url.searchParams.set('timezone', 'UTC');

      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const json = await res.json();
      return (json?.hourly as HourlyBlock) ?? null;
    },
  });
}

/** Index of the forecast hour closest to a session's start. */
function nearestHour(times: string[], target: Date): number {
  let best = -1, bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i] + 'Z').getTime() - target.getTime());
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  }
  return bestDiff <= 3 * 3_600_000 ? best : -1;
}

export default function RaceWeather() {
  const { data: race } = useNextRace();
  const { data: hourly, isLoading } = useWeekendForecast(race);

  if (!race) return null;

  const sessions = buildSessions(race);
  const rows = hourly
    ? sessions.map(s => {
        const when = f1Date(s.date, s.time);
        const i = nearestHour(hourly.time, when);
        if (i < 0) return null;
        return {
          key: s.key,
          label: s.label,
          isRace: !!s.isRace,
          when,
          temp: hourly.temperature_2m[i],
          rain: hourly.precipitation_probability[i],
          wind: hourly.wind_speed_10m[i],
          code: hourly.weather_code[i],
        };
      }).filter((r): r is NonNullable<typeof r> => !!r)
    : [];

  return (
    <section style={{ maxWidth: 1440, margin: '0 auto', padding: '30px clamp(16px, 4vw, 36px) 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
          Weekend <em style={{ fontStyle: 'italic', color: 'var(--mercedes)', fontWeight: 700 }}>Forecast</em>
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {race.Circuit.Location.locality} · Open-Meteo
        </span>
      </div>

      <div style={{ border: '2px solid var(--ink)', background: 'var(--paper-2)', padding: '20px 24px 22px' }}>
        {!rows.length ? (
          isLoading ? <Skeleton /> : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
              The forecast window opens roughly two weeks before the race weekend. Check back closer to the event.
            </div>
          )
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(130px, 100%), 1fr))', gap: 12 }}>
            {rows.map(r => {
              const w = wmo(r.code);
              const wet = r.rain >= 40;
              return (
                <div
                  key={r.key}
                  style={{
                    border: r.isRace ? '2px solid var(--mercedes)' : '1px solid var(--rule-light)',
                    background: r.isRace ? 'rgba(39,244,210,0.07)' : 'transparent',
                    padding: '14px 14px 16px',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: r.isRace ? 'var(--mercedes)' : 'var(--ink-3)', marginBottom: 8 }}>
                    {r.label}
                  </div>
                  <div style={{ color: 'var(--ink-2)', lineHeight: 0, marginBottom: 8 }}><WeatherGlyph kind={w.icon} /></div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>
                    {Math.round(r.temp)}°<span style={{ fontSize: 11 }}>C</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.04em', marginTop: 8, lineHeight: 1.6 }}>
                    <div style={{ color: wet ? '#E8002D' : 'var(--ink-3)', fontWeight: wet ? 700 : 400 }}>
                      {r.rain}% rain
                    </div>
                    <div>{Math.round(r.wind)} km/h wind</div>
                    <div style={{ marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{w.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
