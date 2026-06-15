import { useRaceSchedule } from '@/hooks/useF1Data';
import { getFlag } from '@/lib/f1Types';

function f1Date(date: string, time?: string | null) {
  const t = (time ?? '14:00:00').replace(/Z$/i, '');
  return new Date(`${date}T${t}Z`);
}

export default function Calendar() {
  const { data: races, isLoading } = useRaceSchedule();
  const now = Date.now();

  const enriched = (races ?? []).map(r => {
    const raceTs = f1Date(r.date, r.time).getTime();
    const done   = raceTs < now;
    const next   = !done && (races ?? []).find(rx => f1Date(rx.date, rx.time).getTime() > now)?.round === r.round;
    return { ...r, done, next };
  });

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 36px 0', animation: 'fadeUpSlow 1s ease both 3.5s' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
          F1 <em style={{ fontStyle: 'italic', color: 'var(--racing)', fontWeight: 700 }}>Season</em> Calendar
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>
          {isLoading ? 'Loading...' : `${enriched.filter(r => r.done).length} / ${enriched.length} Races`}
        </span>
      </div>

      <div style={{ position: 'relative', overflow: 'hidden', border: '2px solid var(--ink)', background: 'var(--paper-2)' }}>
        {/* Progress bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.08)', zIndex: 3 }}>
          <div style={{
            height: '100%', background: 'var(--racing)',
            width: enriched.length ? `${(enriched.filter(r => r.done).length / enriched.length) * 100}%` : '0%',
            transformOrigin: 'left', animation: 'barGrowSlow 1.6s cubic-bezier(.3,.9,.3,1) both 4.2s', transition: 'width 0.8s ease',
          }} />
        </div>

        {isLoading ? (
          <div style={{ padding: '32px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>Loading calendar...</div>
        ) : (
          <div style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(130px, 1fr)', overflowX: 'auto', scrollbarWidth: 'thin' }}>
            {enriched.map((race, i) => {
              const flag    = getFlag(race.Circuit.Location.country);
              const fmtDate = f1Date(race.date, race.time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
              return (
                <div key={race.round} style={{
                  padding: '20px 16px 18px',
                  borderRight: i < enriched.length - 1 ? '1px solid var(--rule-light)' : 'none',
                  background: race.next ? 'var(--carbon)' : race.done ? 'var(--paper-2)' : 'var(--paper)',
                  minHeight: 148, display: 'flex', flexDirection: 'column', cursor: 'default',
                  borderTop: race.next ? '2px solid var(--racing)' : race.done ? '2px solid var(--gold)' : '2px solid transparent',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: race.next ? 'var(--racing-hot)' : 'var(--ink-3)', marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    R{race.round}
                    {race.done && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />}
                    {race.next && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--racing)', display: 'inline-block', animation: 'pulseDot 1.6s ease infinite' }} />}
                  </div>
                  <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 8 }}>{flag}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 500, color: race.next ? 'rgba(255,255,255,0.55)' : 'var(--ink-3)' }}>
                    {race.Circuit.Location.country}
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, color: race.next ? '#fff' : 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 'auto' }}>
                    {race.raceName.replace('Grand Prix', '').trim()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: race.next ? 'rgba(255,255,255,0.75)' : 'var(--ink-2)', letterSpacing: '0.04em', marginTop: 14, fontWeight: 500 }}>
                    {fmtDate}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
