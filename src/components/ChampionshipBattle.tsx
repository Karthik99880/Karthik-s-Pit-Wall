import { useDriverStandings, useConstructorStandings, useRaceSchedule } from '@/hooks/useF1Data';
import { getTeamColor, getTeamDisplay, isFavoriteTeam } from '@/lib/f1Types';
import { f1Date } from '@/lib/dateUtils';
import { POINTS } from '@/lib/constants';


export default function ChampionshipBattle() {
  const { data: drivers }      = useDriverStandings();
  const { data: constructors } = useConstructorStandings();
  const { data: races }        = useRaceSchedule();

  const now = Date.now();
  const allRaces   = races ?? [];
  const remaining  = allRaces.filter(r => f1Date(r.date, r.time).getTime() > now).length;
  const totalRaces = allRaces.length;

  
  
  
  const maxDriverRemaining = remaining * (POINTS.RACE_WIN + POINTS.RACE_FASTEST_LAP);
  const maxCtorRemaining   = remaining * (POINTS.RACE_WIN + POINTS.RACE_FASTEST_LAP) * 2;

  const dLead = leadGap(drivers?.map(d => Number(d.points)) ?? []);
  const cLead = leadGap(constructors?.map(c => Number(c.points)) ?? []);

  if (!drivers?.length && !constructors?.length) return null;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '56px 36px 0', animation: 'fadeUpSlow 1s ease both 3.4s' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
          Title <em style={{ fontStyle: 'italic', color: 'var(--mercedes)', fontWeight: 700 }}>Fight</em>
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>
          {remaining} of {totalRaces} races left
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <BattleCard
          kind="Drivers"
          leaderName={drivers?.[0] ? `${drivers[0].Driver.givenName[0]}. ${drivers[0].Driver.familyName}` : '—'}
          chaserName={drivers?.[1] ? `${drivers[1].Driver.givenName[0]}. ${drivers[1].Driver.familyName}` : '—'}
          leaderColor={getTeamColor(drivers?.[0]?.Constructors[0]?.constructorId ?? '')}
          chaserColor={getTeamColor(drivers?.[1]?.Constructors[0]?.constructorId ?? '')}
          leaderFav={isFavoriteTeam(drivers?.[0]?.Constructors[0]?.constructorId ?? '')}
          leadPts={dLead.lead}
          leaderPts={dLead.leaderPts}
          maxRemaining={maxDriverRemaining}
        />
        <BattleCard
          kind="Constructors"
          leaderName={constructors?.[0] ? getTeamDisplay(constructors[0].Constructor.constructorId, constructors[0].Constructor.name) : '—'}
          chaserName={constructors?.[1] ? getTeamDisplay(constructors[1].Constructor.constructorId, constructors[1].Constructor.name) : '—'}
          leaderColor={getTeamColor(constructors?.[0]?.Constructor.constructorId ?? '')}
          chaserColor={getTeamColor(constructors?.[1]?.Constructor.constructorId ?? '')}
          leaderFav={isFavoriteTeam(constructors?.[0]?.Constructor.constructorId ?? '')}
          leadPts={cLead.lead}
          leaderPts={cLead.leaderPts}
          maxRemaining={maxCtorRemaining}
        />
      </div>
    </div>
  );
}

function leadGap(points: number[]) {
  if (!points.length) return { lead: 0, leaderPts: 0 };
  return { lead: (points[0] ?? 0) - (points[1] ?? 0), leaderPts: points[0] ?? 0 };
}

function BattleCard({
  kind, leaderName, chaserName, leaderColor, chaserColor, leaderFav,
  leadPts, leaderPts, maxRemaining,
}: {
  kind: string; leaderName: string; chaserName: string;
  leaderColor: string; chaserColor: string; leaderFav: boolean;
  leadPts: number; leaderPts: number; maxRemaining: number;
}) {
  
  const clinched   = maxRemaining > 0 && leadPts > maxRemaining;
  const magicNumber = Math.max(0, maxRemaining - leadPts + 1); 
  
  const safety = maxRemaining > 0 ? Math.min(100, (leadPts / maxRemaining) * 100) : 100;

  return (
    <div style={{
      background: 'var(--carbon)', color: '#fff', border: `2px solid ${leaderFav ? 'var(--mercedes)' : 'rgba(255,255,255,0.1)'}`,
      borderTop: `4px solid ${leaderColor}`, padding: '22px 24px 24px', position: 'relative', overflow: 'hidden',
      boxShadow: leaderFav ? '0 0 24px rgba(39,244,210,0.18)' : 'none',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>
          {kind} Championship
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: leaderColor, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{leaderName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)', fontWeight: 700, marginLeft: 'auto' }}>{leaderPts} pts</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 16 }}>
          leads <span style={{ color: chaserColor, fontWeight: 700 }}>{chaserName}</span> by{' '}
          <span style={{ color: '#fff', fontWeight: 700 }}>{leadPts}</span> pts
        </div>

        {}
        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${safety}%`, background: clinched ? 'var(--mercedes)' : leaderColor, transition: 'width 0.8s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            {maxRemaining} pts still in play
          </span>
          {clinched ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: 'var(--mercedes)', textTransform: 'uppercase' }}>
              🏆 Title secured
            </span>
          ) : (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
              Magic № <span style={{ color: 'var(--gold)' }}>{magicNumber}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
