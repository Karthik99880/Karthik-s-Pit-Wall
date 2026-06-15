import { useDriverStandings, useConstructorStandings } from '@/hooks/useF1Data';
import { getTeamColor, isFavoriteTeam } from '@/lib/f1Types';

export default function Ticker() {
  const { data: drivers } = useDriverStandings();
  const { data: constructors } = useConstructorStandings();

  const driverTicks = (drivers ?? []).slice(0, 10).map(d => ({
    key: d.Driver.driverId,
    label: d.Driver.code ?? d.Driver.familyName.toUpperCase().slice(0, 3),
    val: d.Driver.familyName,
    pts: `${d.points} PTS`,
    pos: `P${d.position}`,
    color: getTeamColor(d.Constructors[0]?.constructorId ?? ''),
    isFav: isFavoriteTeam(d.Constructors[0]?.constructorId ?? ''),
  }));

  const ctorTicks = (constructors ?? []).slice(0, 5).map(c => ({
    key: c.Constructor.constructorId,
    label: c.Constructor.name.toUpperCase().slice(0, 4),
    val: c.Constructor.name,
    pts: `${c.points} PTS`,
    pos: `P${c.position}`,
    color: getTeamColor(c.Constructor.constructorId),
    isFav: isFavoriteTeam(c.Constructor.constructorId),
  }));

  const items = [...driverTicks, ...ctorTicks];

  if (items.length === 0) {
    return (
      <div style={{ background: 'var(--carbon)', height: 44, borderBottom: '2px solid var(--mercedes)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em' }}>LOADING STANDINGS...</span>
      </div>
    );
  }

  const doubled = [...items, ...items];

  return (
    <div className="ticker-wrap" style={{
      background: 'var(--carbon)',
      height: 44,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '2px solid var(--mercedes)',
      position: 'relative',
      animation: 'fadeSlow 0.9s ease both',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 80, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(90deg, var(--carbon), transparent)'
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 80, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(270deg, var(--carbon), transparent)'
      }} />
      <div style={{
        display: 'flex', whiteSpace: 'nowrap',
        animation: 'ticker 60s linear infinite',
        willChange: 'transform',
      }}>
        {doubled.map((item, i) => (
          <span key={`${item.key}-${i}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.5)',
          }}>
            <span style={{
              color: item.isFav ? 'var(--mercedes)' : item.color,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textShadow: item.isFav ? '0 0 8px rgba(39,244,210,0.5)' : 'none',
            }}>{item.label}</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{item.val}</span>
            <span style={{ color: 'var(--gold)', fontWeight: 500 }}>{item.pts}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
