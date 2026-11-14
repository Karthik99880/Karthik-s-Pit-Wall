import { Link } from 'wouter';
import { useConstructorStandings, useDriverStandings, useLastRaceResults } from '@/hooks/useF1Data';
import { getCarPhoto, getFanTeamId, getFanTeamName, teamDrivers } from '@/lib/f1Types';

const mono = { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' } as const;

export default function TeamBand() {
  const id = getFanTeamId();
  const { data: teams } = useConstructorStandings();
  const { data: standings } = useDriverStandings();
  const { data: last } = useLastRaceResults();
  const team = teams?.find(t => t.Constructor.constructorId === id);
  const pair = teamDrivers(standings ?? [], last?.results ?? [], id);

  return (
    <section aria-label="Your team" style={{ maxWidth: 1440, margin: '0 auto', padding: '0 clamp(16px, 4vw, 36px) 8px' }}>
      <div style={{
        position: 'relative', overflow: 'hidden', color: '#f2ece0', borderTop: '5px solid var(--mercedes)',
        background: 'linear-gradient(100deg, rgba(var(--mercedes-rgb),0.22), transparent 55%), var(--carbon)',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px 40px', padding: '22px clamp(18px, 3vw, 36px)',
      }}>
        <div style={{ minWidth: 200 }}>
          <div style={{ ...mono, color: '#c7c1b4', fontWeight: 800 }}>Your team</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            {getFanTeamName()}
          </div>
          {team && <div style={{ ...mono, color: '#c7c1b4', marginTop: 8 }}>P{team.position} constructors · {team.points} pts · {team.wins} wins</div>}
        </div>

        <div style={{ display: 'flex', gap: 28 }}>
          {pair.map(d => (
            <div key={d.Driver.driverId}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 800, lineHeight: 1, color: 'var(--mercedes)' }}>P{d.position}</div>
              <div style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', marginTop: 6 }}>{d.Driver.familyName}</div>
              <div style={{ ...mono, color: '#c7c1b4', marginTop: 2 }}>{d.points} pts</div>
            </div>
          ))}
        </div>

        <img src={getCarPhoto(id)} alt={`${getFanTeamName()} car`} loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none'; }}
          style={{ flex: '1 1 280px', minWidth: 0, maxWidth: 520, marginLeft: 'auto', filter: 'drop-shadow(0 18px 14px rgba(0,0,0,.6))' }} />

        <Link href="/garage" style={{ ...mono, fontWeight: 800, color: 'var(--carbon)', background: 'var(--mercedes)', padding: '12px 18px', textDecoration: 'none' }}>
          Open my garage →
        </Link>
      </div>
    </section>
  );
}
