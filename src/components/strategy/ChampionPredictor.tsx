import { useMemo } from 'react';
import { useDriverStandings, useRaceSchedule } from '@/hooks/useF1Data';
import { getTeamColor, getTeamDisplay, isFavoriteTeam } from '@/lib/f1Types';
import { f1Date } from '@/lib/dateUtils';
import { POINTS } from '@/lib/constants';
import Panel from './Panel';

/**
 * Projects the final championship from each driver's average points per
 * race (APPR), and estimates the round at which the projected leader
 * clinches (lead exceeds the max a rival could still score).
 */
export default function ChampionPredictor() {
  const { data: drivers }  = useDriverStandings();
  const { data: races }    = useRaceSchedule();

  const model = useMemo(() => {
    if (!drivers?.length || !races?.length) return null;
    const now = Date.now();
    const completed = races.filter(r => f1Date(r.date, r.time).getTime() < now).length;
    const remainingRaces = races
      .filter(r => f1Date(r.date, r.time).getTime() > now)
      .sort((a, b) => Number(a.round) - Number(b.round));
    const remaining = remainingRaces.length;
    if (completed === 0) return null;

    const projected = drivers.map(d => {
      const pts  = Number(d.points);
      const appr = pts / completed;
      return {
        id: d.Driver.driverId,
        name: `${d.Driver.givenName[0]}. ${d.Driver.familyName}`,
        color: getTeamColor(d.Constructors[0]?.constructorId ?? ''),
        fav: isFavoriteTeam(d.Constructors[0]?.constructorId ?? ''),
        team: getTeamDisplay(d.Constructors[0]?.constructorId ?? '', d.Constructors[0]?.name ?? ''),
        current: pts,
        appr,
        final: Math.round(pts + appr * remaining),
      };
    }).sort((a, b) => b.final - a.final);

    // Clinch estimate: walk remaining rounds, accruing APPR for the top two.
    // Champion is mathematically safe once the lead exceeds what the rival
    // could still score at a maximum of 26 pts/round (win + fastest lap).
    let clinchRace: string | null = null;
    const [p1, p2] = projected;
    if (p1 && p2) {
      let lead1 = p1.current, lead2 = p2.current;
      for (let i = 0; i < remaining; i++) {
        lead1 += p1.appr;
        lead2 += p2.appr;
        const roundsLeftAfter = remaining - i - 1;
        const maxRivalGain = roundsLeftAfter * (POINTS.RACE_WIN + POINTS.RACE_FASTEST_LAP);
        if (lead1 - lead2 > maxRivalGain) { clinchRace = remainingRaces[i].raceName.replace('Grand Prix', '').trim(); break; }
      }
    }

    return { projected, remaining, completed, clinchRace, champion: projected[0] };
  }, [drivers, races]);

  if (!model) {
    return <Panel title="Champion" accent="Projection" num="01"><Msg>Crunching the numbers…</Msg></Panel>;
  }

  const top = model.projected.slice(0, 8);
  const maxFinal = top[0]?.final || 1;

  return (
    <Panel title="Champion" accent="Projection" num="01"
      meta={`${model.completed} run · ${model.remaining} to go`}>
      {/* Headline projection */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, padding: '16px 18px', background: 'var(--carbon)', borderLeft: `4px solid ${model.champion.color}` }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Projected Champion</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {model.champion.name}{model.champion.fav && <Star />}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: model.champion.color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>{model.champion.team}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
            {model.clinchRace ? 'Clinches at' : 'Title fight'}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--mercedes)' }}>
            {model.clinchRace ?? 'Down to the wire'}
          </div>
        </div>
      </div>

      {/* Projected final table */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10, fontWeight: 700 }}>
        Projected Final Standings
      </div>
      {top.map((d, i) => (
        <div key={d.id} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0',
          borderBottom: '1px solid var(--rule-light)',
          background: d.fav ? 'rgba(39,244,210,0.06)' : 'transparent',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', width: 24 }}>P{i + 1}</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
          <span style={{ flex: 1, fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
            {d.name}{d.fav && <Star small />}
          </span>
          {/* projection bar */}
          <div style={{ flex: 1.4, height: 6, background: 'var(--paper-3)', overflow: 'hidden', maxWidth: 180 }}>
            <div style={{ height: '100%', width: `${(d.final / maxFinal) * 100}%`, background: d.color, transition: 'width 0.7s ease' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', width: 52, textAlign: 'right' }}>{d.current} now</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, color: 'var(--ink)', width: 44, textAlign: 'right' }}>{d.final}</span>
        </div>
      ))}
      <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.05em', lineHeight: 1.5 }}>
        Model: average points per race × {model.remaining} remaining rounds. A simple linear projection — safety cars and DNFs not included.
      </div>
    </Panel>
  );
}

function Star({ small }: { small?: boolean }) {
  return <span style={{ color: 'var(--mercedes)', marginLeft: 6, fontSize: small ? 10 : 13 }}>★</span>;
}
function Msg({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '32px 4px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{children}</div>;
}
