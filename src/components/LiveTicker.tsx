import { useLiveRaceWindow, useLiveTicker, DEMO_TICKER, type LiveTickerData } from '@/hooks/useLiveRace';

/**
 * Race-day live timing strip. Renders only while a race is actually on
 * (see useLiveRaceWindow) — the rest of the year it renders nothing.
 * Append ?demo=race to the URL to preview it with sample data.
 */
export default function LiveTicker() {
  const liveRace = useLiveRaceWindow();
  const demo = typeof window !== 'undefined' && window.location.search.includes('demo=race');
  const enabled = !!liveRace && !demo;
  const { data } = useLiveTicker(enabled);

  if (!liveRace && !demo) return null;

  const ticker: LiveTickerData | undefined = demo ? DEMO_TICKER : data;
  const raceName = demo ? 'Demo Grand Prix' : (liveRace?.raceName ?? 'Race');

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 36px 0' }}>
      <div style={{ background: 'var(--carbon)', color: '#fff', border: '2px solid var(--mercedes)', boxShadow: '0 0 30px rgba(39,244,210,0.18)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff3b3b', display: 'inline-block', animation: 'pulseDot 1.4s ease infinite', boxShadow: '0 0 10px #ff3b3b' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#ff6b6b' }}>Live</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 700, marginLeft: 6 }}>{raceName}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            {demo ? 'Demo Data' : 'OpenF1 · ~30s delay'}
          </span>
        </div>

        {/* Standings strip — horizontal scroll of position chips */}
        {!ticker || ticker.rows.length === 0 ? (
          <div style={{ padding: '18px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>
            Waiting for the live feed…
          </div>
        ) : (
          <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'thin', padding: '14px 12px' }}>
            {ticker.rows.map(r => (
              <div key={r.code} style={{ flexShrink: 0, minWidth: 92, padding: '10px 12px', margin: '0 4px', background: 'rgba(255,255,255,0.04)', borderTop: `3px solid #${r.teamColour}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>P{r.pos}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, color: `#${r.teamColour}` }}>{r.code}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', marginTop: 5, fontWeight: 600 }}>{r.gap}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {r.pits} stop{r.pits === 1 ? '' : 's'}{r.lastPitLap ? ` · L${r.lastPitLap}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Race control feed */}
        {ticker && ticker.messages.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', padding: '10px 18px', display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mercedes)', flexShrink: 0 }}>Race Control</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {ticker.messages[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
