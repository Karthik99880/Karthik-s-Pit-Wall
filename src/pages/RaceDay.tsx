import { useLiveRaceWindow, useLiveTicker, useLiveWeather, DEMO_TICKER, DEMO_WEATHER, type LiveWeatherData, type TickerRow } from '@/hooks/useLiveRace';
import { useNextRace, useCountdown } from '@/hooks/useF1Data';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/* ── Tyre helpers ───────────────────────────────────── */
const COMPOUND_COLOR: Record<string, string> = {
  SOFT:         '#E8002D',
  MEDIUM:       '#FFC906',
  HARD:         '#FFFFFF',
  INTERMEDIATE: '#39B54A',
  WET:          '#0067FF',
  UNKNOWN:      '#888888',
};
const COMPOUND_LETTER: Record<string, string> = {
  SOFT: 'S', MEDIUM: 'M', HARD: 'H', INTERMEDIATE: 'I', WET: 'W', UNKNOWN: '?',
};

function fmtS(s: number | null | undefined): string {
  if (s == null) return '—';
  return s.toFixed(3);
}

function TyreBadge({ compound, age }: { compound?: string; age?: number }) {
  const c     = compound ?? 'UNKNOWN';
  const color = COMPOUND_COLOR[c] ?? '#888';
  const letter= COMPOUND_LETTER[c] ?? '?';
  const isHard= c === 'HARD';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: isHard ? 'transparent' : color,
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, color: isHard ? '#fff' : '#000', lineHeight: 1 }}>{letter}</span>
      </div>
      {age != null && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{age}L</span>
      )}
    </div>
  );
}

/* ── Weather strip ──────────────────────────────────── */
function WeatherStrip({ w }: { w: LiveWeatherData }) {
  const items = [
    { label: 'Air',      value: `${w.airTemp}°C` },
    { label: 'Track',    value: `${w.trackTemp}°C` },
    { label: 'Humidity', value: `${w.humidity}%` },
    { label: 'Wind',     value: `${w.windSpeed} km/h` },
    { label: 'Rain',     value: w.rainfall > 0 ? `${w.rainfall} mm` : 'Dry' },
  ];
  return (
    <div style={{ display: 'flex', gap: 28, padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap', alignItems: 'center' }}>
      {items.map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', fontWeight: 600 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Timing row ─────────────────────────────────────── */
const COL = '36px 10px 52px 1fr 68px 68px 68px 56px 36px';

function HeaderRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL, gap: '0 8px', padding: '8px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', alignItems: 'center' }}>
      {['P', '', 'DRV', 'GAP', 'S1', 'S2', 'S3', 'TYRE', 'PIT'].map(h => (
        <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', textAlign: h === 'S1' || h === 'S2' || h === 'S3' || h === 'PIT' ? 'right' : 'left' }}>{h}</span>
      ))}
    </div>
  );
}

function TimingRow({ r, zebra }: { r: TickerRow; zebra: boolean }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: COL, gap: '0 8px',
      padding: '10px 20px', alignItems: 'center',
      background: zebra ? 'rgba(255,255,255,0.018)' : 'transparent',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.32)' }}>P{r.pos}</span>
      <div style={{ width: 3, height: 22, background: `#${r.teamColour}`, borderRadius: 2 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: `#${r.teamColour}`, letterSpacing: '0.04em' }}>{r.code}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: r.pos === 1 ? 'var(--mercedes)' : '#fff', fontWeight: r.pos === 1 ? 700 : 400 }}>{r.gap}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.65)', textAlign: 'right' }}>{fmtS(r.s1)}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.65)', textAlign: 'right' }}>{fmtS(r.s2)}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.65)', textAlign: 'right' }}>{fmtS(r.s3)}</span>
      <TyreBadge compound={r.compound} age={r.tyreAge} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'right' }}>{r.pits}</span>
    </div>
  );
}

/* ── Live board ─────────────────────────────────────── */
function LiveBoard({ raceName, demo }: { raceName: string; demo: boolean }) {
  const { data: ticker  } = useLiveTicker(!demo);
  const { data: weather } = useLiveWeather(!demo);

  const live = demo ? DEMO_TICKER  : ticker;
  const wx   = demo ? DEMO_WEATHER : (weather ?? undefined);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 36px 0' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #ff3b3b55', padding: '4px 12px', background: '#ff3b3b12' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff3b3b', display: 'inline-block', animation: 'pulseDot 1.4s ease infinite', boxShadow: '0 0 8px #ff3b3b' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#ff6b6b' }}>Live</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 3vw, 34px)', fontWeight: 800, color: '#fff', margin: 0 }}>{raceName}</h1>
        {live?.leaderLap && (
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--mercedes)', textTransform: 'uppercase' }}>
            Lap {live.leaderLap}
          </span>
        )}
      </div>

      {/* Timing card */}
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.09)', borderTop: '3px solid var(--mercedes)' }}>
        {wx && <WeatherStrip w={wx} />}

        {/* header and rows share one scroll container so the columns stay aligned */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 620 }}>
            <HeaderRow />
            {!live || live.rows.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
                Waiting for live feed…
              </div>
            ) : live.rows.map((r, i) => (
              <div key={r.code} style={{ borderBottom: i < live.rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <TimingRow r={r} zebra={i % 2 !== 0} />
              </div>
            ))}
          </div>
        </div>

        {/* Race control messages */}
        {live && live.messages.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--mercedes)', marginBottom: 8 }}>Race Control</div>
            {live.messages.map((msg, i) => (
              <div key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.04em',
                color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                padding: '3px 0',
                borderBottom: i < live.messages.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                {msg}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 10, textAlign: 'right' }}>
        {demo ? 'Preview mode · Demo data' : 'OpenF1 · ~30s delay · Auto-refreshes every 20s'}
      </div>
    </div>
  );
}

/* ── Off-air screen ─────────────────────────────────── */
function OffAir() {
  const { data: next } = useNextRace();
  const { data: cd   } = useCountdown(next?.date, next?.time);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '80px 36px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, textAlign: 'center' }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', padding: '52px 48px', maxWidth: 520, width: '100%' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 18 }}>
          Race Day · Channel Status
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, fontStyle: 'italic', color: '#fff', lineHeight: 1, marginBottom: 10 }}>
          Off Air
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 36 }}>
          No race in window · Channel opens 10 min before lights out
        </div>

        {next && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mercedes)', marginBottom: 16 }}>
              Next · {next.raceName}
            </div>
            {cd && (
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
                {[{ v: cd.days, l: 'Days' }, { v: cd.hours, l: 'Hrs' }, { v: cd.minutes, l: 'Min' }, { v: cd.seconds, l: 'Sec' }].map(({ v, l }) => (
                  <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{String(v).padStart(2, '0')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>{l}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        Add ?demo=race to preview the live timing board
      </span>
    </div>
  );
}

/* ── Page root ──────────────────────────────────────── */
export default function RaceDay() {
  useDocumentMeta(
    'F1 Live Timing — Sector Times, Tyre Compounds & Gaps | Mercedes Pit Wall',
    'Free F1 live timing board: lap-by-lap positions, sector 1/2/3 times, current tyre compound and age, pit stop counts, gaps to leader, track weather and race control messages.',
  );

  const liveRace = useLiveRaceWindow();
  const demo     = typeof window !== 'undefined' && window.location.search.includes('demo=race');
  const isLive   = !!liveRace || demo;
  const raceName = demo ? 'Demo Grand Prix' : (liveRace?.raceName ?? 'Race');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingBottom: 64 }}>
      {isLive ? <LiveBoard raceName={raceName} demo={demo} /> : <OffAir />}
    </div>
  );
}
