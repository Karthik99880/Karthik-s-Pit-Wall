import { useMemo } from 'react';
import { useRaceSchedule, useSeasonResults } from '@/hooks/useF1Data';
import { getTeamColor, isFavoriteTeam } from '@/lib/f1Types';
import { getCircuitCategory, CATEGORY_META, CATEGORY_ORDER, type CircuitCategory } from '@/lib/circuitTypes';
import Panel from './Panel';

interface Perf { id: string; code: string; color: string; fav: boolean; avg: number; races: number; }

export default function CircuitSpecialization() {
  const { data: races } = useRaceSchedule();
  const { data: rounds, isLoading } = useSeasonResults(races);

  const byCategory = useMemo(() => {
    if (!races?.length || !rounds.length) return null;

    // round number -> circuit category
    const roundCat = new Map<number, CircuitCategory>();
    for (const r of races) roundCat.set(Number(r.round), getCircuitCategory(r.Circuit.circuitId));

    // category -> driverId -> { finishes, color, code, fav }
    type Agg = { sum: number; n: number; code: string; color: string; fav: boolean };
    const cats = new Map<CircuitCategory, { drivers: Map<string, Agg>; rounds: Set<number> }>();

    for (const round of rounds) {
      const cat = roundCat.get(round.round);
      if (!cat) continue;
      const bucket = cats.get(cat) ?? { drivers: new Map<string, Agg>(), rounds: new Set<number>() };
      bucket.rounds.add(round.round);
      for (const res of round.results) {
        const fin = Number(res.position);
        if (!fin) continue;
        const id = res.Driver.driverId;
        const cur = bucket.drivers.get(id) ?? {
          sum: 0, n: 0,
          code: res.Driver.code ?? res.Driver.familyName.slice(0, 3).toUpperCase(),
          color: getTeamColor(res.Constructor.constructorId),
          fav: isFavoriteTeam(res.Constructor.constructorId),
        };
        cur.sum += fin; cur.n += 1;
        bucket.drivers.set(id, cur);
      }
      cats.set(cat, bucket);
    }

    return CATEGORY_ORDER
      .map(cat => {
        const bucket = cats.get(cat);
        if (!bucket || bucket.rounds.size === 0) return null;
        const perf: Perf[] = [...bucket.drivers.entries()]
          .map(([id, a]) => ({ id, code: a.code, color: a.color, fav: a.fav, avg: a.sum / a.n, races: a.n }))
          .sort((x, y) => x.avg - y.avg)
          .slice(0, 5);
        return { cat, races: bucket.rounds.size, perf };
      })
      .filter((c): c is { cat: CircuitCategory; races: number; perf: Perf[] } => !!c);
  }, [races, rounds]);

  if (!byCategory) {
    return <Panel title="Circuit" accent="Specialization" num="05"><Msg>{isLoading ? 'Loading race-by-race results…' : 'No race data yet.'}</Msg></Panel>;
  }

  return (
    <Panel title="Circuit" accent="Specialization" num="05" meta="Who excels where">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {byCategory.map(({ cat, races: n, perf }) => {
          const meta = CATEGORY_META[cat];
          return (
            <div key={cat} style={{ background: 'var(--carbon)', color: '#fff', border: '2px solid rgba(255,255,255,0.08)', borderTop: `4px solid ${meta.color}`, padding: '18px 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 700 }}>{meta.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>{n} {n === 1 ? 'RACE' : 'RACES'}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>{meta.blurb}</div>

              {perf.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', background: d.fav ? 'rgba(39,244,210,0.06)' : 'transparent' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', width: 16 }}>{i + 1}</span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: d.fav ? 'var(--mercedes)' : '#fff', letterSpacing: '0.04em' }}>
                    {d.code}{d.fav && ' ★'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{d.races}r</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: meta.color, width: 42, textAlign: 'right' }}>
                    P{d.avg.toFixed(1)}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                Ranked by average finish
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', lineHeight: 1.5, letterSpacing: '0.04em' }}>
        Circuits grouped by layout demands. Categories fill in as the season visits each track type.
      </div>
    </Panel>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '32px 4px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{children}</div>;
}
