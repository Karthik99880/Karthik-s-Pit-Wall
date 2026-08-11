import { useQuery } from '@tanstack/react-query';
import { useNextRace, buildSessions } from '@/hooks/useF1Data';
import { f1Date } from '@/lib/dateUtils';
import type { Race } from '@/lib/f1Types';

/* WMO weather codes → short label */
function wmo(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: '☀️', label: 'Clear' };
  if (code <= 2)  return { icon: '🌤️', label: 'Partly cloudy' };
  if (code === 3) return { icon: '☁️', label: 'Overcast' };
  if (code <= 48) return { icon: '🌫️', label: 'Fog' };
  if (code <= 57) return { icon: '🌦️', label: 'Drizzle' };
  if (code <= 67) return { icon: '🌧️', label: 'Rain' };
  if (code <= 77) return { icon: '🌨️', label: 'Snow' };
  if (code <= 82) return { icon: '🌧️', label: 'Showers' };
  if (code <= 86) return { icon: '🌨️', label: 'Snow showers' };
  return { icon: '⛈️', label: 'Thunderstorm' };
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
    <section style={{ maxWidth: 1440, margin: '0 auto', padding: '30px 36px 0' }}>
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
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
            {isLoading
              ? 'Loading forecast…'
              : 'The forecast window opens roughly two weeks before the race weekend. Check back closer to the event.'}
          </div>
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
                  <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 8 }}>{w.icon}</div>
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
