import { useNextRace, useCountdown } from '@/hooks/useF1Data';
import { getFlag, parseF1DateTime } from '@/lib/f1Types';
import SessionTracker from '@/components/SessionTracker';

export default function NextRace() {
  const { data: race, isPending, isError, status } = useNextRace();
  const { data: countdown } = useCountdown(race?.date, race?.time);

  if (isPending) {
    return <Wrapper><RaceBlockShell><Msg>Loading race data...</Msg></RaceBlockShell></Wrapper>;
  }
  if (isError) {
    return <Wrapper><RaceBlockShell><Msg warn>Could not reach F1 data — retrying...</Msg></RaceBlockShell></Wrapper>;
  }
  if (status === 'success' && !race) {
    return <Wrapper><RaceBlockShell><Msg>Season complete — see you next year 🏁</Msg></RaceBlockShell></Wrapper>;
  }
  if (!race) return null;

  
  const raceDate = parseF1DateTime(race.date, race.time);
  const now = Date.now();
  const raceTs = raceDate.getTime();
  const raceIsLive = raceTs <= now && raceTs > now - 7_200_000;

  const country = race.Circuit.Location.country;
  const city    = race.Circuit.Location.locality;
  const flag    = getFlag(country);
  const fmt     = (v: number) => String(v).padStart(2, '0');

  return (
    <>
      <Wrapper>
        <RaceBlockShell>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 48 }}>
            {}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--mercedes)',
                  padding: '7px 13px', border: '1.5px solid var(--mercedes)',
                  background: 'rgba(39,244,210,0.08)',
                }}>RD {race.round} · {new Date().getFullYear()}</span>
                <span style={{ fontSize: 32, display: 'inline-block', animation: 'flagWave 2.8s ease-in-out infinite' }}>{flag}</span>
                {raceIsLive && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', background: 'var(--carbon)', color: '#fff',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em',
                    border: '1.5px solid var(--mercedes)',
                    boxShadow: '0 0 15px rgba(39,244,210,0.25)',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mercedes)', display: 'inline-block', animation: 'blink 1s ease infinite' }} />
                    RACE LIVE
                  </span>
                )}
              </div>

              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 700, lineHeight: 0.92, letterSpacing: '-0.025em', color: '#fff', marginBottom: 16,
              }}>
                {race.raceName.replace('Grand Prix', '').trim()}{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--mercedes)', fontWeight: 500 }}>Grand Prix</em>
              </div>

              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.68)', marginBottom: 6 }}>
                <strong style={{ color: '#fff', fontWeight: 500 }}>{race.Circuit.circuitName}</strong> · {city}, {country}
              </div>

              <div style={{ display: 'flex', gap: 36, marginTop: 24, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <Stat label="Race Date" value={raceDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                <Stat label="Race Time (local)" value={raceDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} />
                <Stat label="Circuit" value={race.Circuit.circuitId.replace(/_/g, ' ').toUpperCase()} />
              </div>
            </div>

            {}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.26em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
                marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 7, height: 7, background: 'var(--mercedes)', borderRadius: '50%', display: 'inline-block', animation: 'ferrariPulse 1.8s ease infinite' }} />
                {raceIsLive ? 'Race In Progress' : 'Lights Out In'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { val: countdown?.days,    lbl: 'Days' },
                  { val: countdown?.hours,   lbl: 'Hours' },
                  { val: countdown?.minutes, lbl: 'Mins' },
                  { val: countdown?.seconds, lbl: 'Secs' },
                ].map((c, i) => (
                  <div key={c.lbl} style={{
                    background: 'var(--carbon-3)', padding: '20px 8px 16px',
                    textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)',
                    borderTop: '2px solid var(--mercedes)',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'clamp(32px, 4vw, 46px)',
                      fontWeight: 700, color: raceIsLive ? 'var(--mercedes)' : '#fff',
                      lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
                      animation: `numCountUp 0.8s ease both ${3.8 + i * 0.15}s`,
                    }}>
                      {c.val !== undefined ? fmt(c.val) : '--'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 12,
                    }}>{c.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RaceBlockShell>
      </Wrapper>
      <SessionTracker race={race} />
    </>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 36px', animation: 'fadeUpSlow 1.1s ease both 3.2s' }}>{children}</div>;
}
function Msg({ children, warn }: { children: React.ReactNode; warn?: boolean }) {
  return <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: warn ? 'rgba(255,181,168,0.8)' : 'rgba(255,255,255,0.4)' }}>{children}</div>;
}
function RaceBlockShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--carbon)', color: '#fff', padding: '44px 48px 46px', marginTop: 16, position: 'relative', overflow: 'hidden', borderTop: '5px solid var(--mercedes)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, rgba(39,244,210,0.04) 0 2px, transparent 2px 16px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 7 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: '#fff' }}>{value}</span>
    </div>
  );
}
