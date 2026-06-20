import { useState, useEffect } from 'react';
import { useRaceSchedule } from '@/hooks/useF1Data';
import { getFlag } from '@/lib/f1Types';
import { f1Date } from '@/lib/dateUtils';

export default function Calendar() {
  const { data: races, isLoading } = useRaceSchedule();
  const now = Date.now();
  const [showClue2Modal, setShowClue2Modal] = useState(false);
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [stage, setStage] = useState(() => {
    const s = localStorage.getItem('pitwall_hunt_stage');
    return s ? Number(s) : 0;
  });

  useEffect(() => {
    const onUpdate = () => {
      const s = localStorage.getItem('pitwall_hunt_stage');
      setStage(s ? Number(s) : 0);
    };
    window.addEventListener('pitwall-stage-update', onUpdate);
    return () => window.removeEventListener('pitwall-stage-update', onUpdate);
  }, []);


  const enriched = (races ?? []).map(r => {
    const raceTs = f1Date(r.date, r.time).getTime();
    const done   = raceTs < now;
    const next   = !done && (races ?? []).find(rx => f1Date(rx.date, rx.time).getTime() > now)?.round === r.round;
    return { ...r, done, next };
  });

  const handleRaceClick = (country: string) => {
    const lower = country.toLowerCase();
    if (lower.includes('uk') || lower.includes('britain') || lower.includes('kingdom')) {
      const stageVal = localStorage.getItem('pitwall_hunt_stage');
      if (stageVal && Number(stageVal) >= 1) {
        localStorage.setItem('pitwall_hunt_stage', '2');
        window.dispatchEvent(new Event('pitwall-stage-update'));
        setShowClue2Modal(true);
      } else {
        setShowDeniedModal(true);
      }
    }
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 36px 0', animation: 'fadeUpSlow 1s ease both 3.5s' }}>
      {showClue2Modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: 'var(--carbon)',
            border: '2px solid var(--mercedes)',
            boxShadow: '0 20px 50px rgba(39,244,210,0.15)',
            maxWidth: 460, width: '100%',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            padding: 28,
            position: 'relative',
            animation: 'eggPop 0.4s cubic-bezier(.2,.9,.25,1.1) both',
          }}>
            <div style={{ fontSize: 13, color: 'var(--mercedes)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, borderBottom: '1px solid rgba(39,244,210,0.2)', paddingBottom: 8 }}>
              📁 ARCHIVE ENCRYPTION: LEVEL 2
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', margin: '16px 0' }}>
              "Return to the primary Scoreboard. Look to the pinnacle of the engineering war. Identify the manufacturer badge of the outfit currently routing the rest of the field in the Constructors' title race, commanding the top tier from the factory."
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setShowClue2Modal(false)}
                style={{
                  background: 'none',
                  border: '1px solid var(--mercedes)',
                  color: 'var(--mercedes)',
                  padding: '6px 16px',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--mercedes)';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'var(--mercedes)';
                }}
              >
                CLOSE TRANSMISSION
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeniedModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: 'var(--carbon)',
            border: '2px solid #ff4a4a',
            boxShadow: '0 20px 50px rgba(255,74,74,0.15)',
            maxWidth: 460, width: '100%',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            padding: 28,
            position: 'relative',
            animation: 'eggPop 0.4s cubic-bezier(.2,.9,.25,1.1) both',
          }}>
            <div style={{ fontSize: 13, color: '#ff4a4a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, borderBottom: '1px solid rgba(255,74,74,0.2)', paddingBottom: 8 }}>
              ⚠️ DECRYPTION ERROR
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', margin: '16px 0' }}>
              "Access Denied. The decryption sequence must begin at the classified footer source."
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setShowDeniedModal(false)}
                style={{
                  background: 'none',
                  border: '1px solid #ff4a4a',
                  color: '#ff4a4a',
                  padding: '6px 16px',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ff4a4a';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#ff4a4a';
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
          F1 <em style={{ fontStyle: 'italic', color: 'var(--mercedes)', fontWeight: 700 }}>Season</em> Calendar
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
              const isUK    = race.Circuit.Location.country.toLowerCase().includes('uk') || race.Circuit.Location.country.toLowerCase().includes('britain');
              return (
                <div
                  key={race.round}
                  onClick={() => handleRaceClick(race.Circuit.Location.country)}
                  style={{
                    padding: '20px 16px 18px',
                    borderRight: i < enriched.length - 1 ? '1px solid var(--rule-light)' : 'none',
                    background: race.next ? 'var(--carbon)' : race.done ? 'var(--paper-2)' : 'var(--paper)',
                    minHeight: 148, display: 'flex', flexDirection: 'column',
                    cursor: (isUK && stage >= 1) ? 'pointer' : 'default',
                    borderTop: race.next ? '3px solid var(--mercedes)' : race.done ? '2px solid var(--gold)' : '2px solid transparent',
                    boxShadow: race.next ? 'inset 0 0 0 1px var(--mercedes), 0 0 25px rgba(39,244,210,0.25)' : 'none',
                    position: race.next ? 'relative' : 'static',
                    zIndex: race.next ? 2 : 1,
                    transform: race.next ? 'scale(1.02)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: race.next ? 'var(--mercedes)' : 'var(--ink-3)', marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    R{race.round}
                    {race.done && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />}
                    {race.next && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mercedes)', display: 'inline-block', animation: 'pulseDot 1.6s ease infinite', boxShadow: '0 0 10px var(--mercedes)' }} />}
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
