import { useMemo } from 'react';
import { useRaceSchedule, useSeasonResults } from '@/hooks/useF1Data';
import { useIsMobile } from '@/hooks/use-mobile';
import { getTeamColor, isFavoriteTeam } from '@/lib/f1Types';
import Panel from './Panel';

const WINDOW = 5;

interface Row {
  id: string;
  code: string;
  color: string;
  fav: boolean;
  recent: Array<{ round: number; name: string; points: number }>;
  recentTotal: number;
  recentAvg: number;
  seasonAvg: number;
  swing: number;
}

export default function FormGuide() {
  const { data: races } = useRaceSchedule();
  const { data: rounds, isLoading } = useSeasonResults(races);
  const isMobile = useIsMobile();

  const { rows, windowRounds } = useMemo(() => {
    const sorted = [...rounds].sort((a, b) => a.round - b.round);
    if (!sorted.length) return { rows: null, windowRounds: [] as string[] };

    const windowSlice = sorted.slice(-WINDOW);

    type Agg = {
      code: string; color: string; fav: boolean;
      seasonPts: number; seasonN: number;
      byRound: Map<number, number>;
    };
    const agg = new Map<string, Agg>();

    for (const round of sorted) {
      for (const res of round.results) {
        const id = res.Driver.driverId;
        const pts = Number(res.points) || 0;
        const cur = agg.get(id) ?? {
          code:  res.Driver.code ?? res.Driver.familyName.slice(0, 3).toUpperCase(),
          color: getTeamColor(res.Constructor.constructorId),
          fav:   isFavoriteTeam(res.Constructor.constructorId),
          seasonPts: 0, seasonN: 0, byRound: new Map<number, number>(),
        };
        cur.seasonPts += pts;
        cur.seasonN   += 1;
        cur.byRound.set(round.round, pts);
        agg.set(id, cur);
      }
    }

    const out: Row[] = [...agg.entries()]
      .map(([id, a]) => {
        const recent = windowSlice.map(r => ({
          round: r.round,
          name: r.raceName,
          points: a.byRound.get(r.round) ?? 0,
        }));
        const recentTotal = recent.reduce((n, r) => n + r.points, 0);
        const recentAvg = recent.length ? recentTotal / recent.length : 0;
        const seasonAvg = a.seasonN ? a.seasonPts / a.seasonN : 0;
        return {
          id, code: a.code, color: a.color, fav: a.fav,
          recent, recentTotal, recentAvg, seasonAvg,
          swing: recentAvg - seasonAvg,
        };
      })
      .sort((x, y) => y.recentTotal - x.recentTotal)
      .slice(0, 12);

    return { rows: out, windowRounds: windowSlice.map(r => r.raceName) };
  }, [rounds]);

  if (!rows || !rows.length) {
    return (
      <Panel title="Form" accent="Guide" num="06">
        <Msg>{isLoading ? 'Loading race-by-race results…' : 'No race data yet.'}</Msg>
      </Panel>
    );
  }

  const maxPts = Math.max(...rows.flatMap(r => r.recent.map(x => x.points)), 1);
  const n = rows[0].recent.length;

  return (
    <Panel title="Form" accent="Guide" num="06" meta={`Last ${n} ${n === 1 ? 'round' : 'rounds'}`}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em', marginBottom: 6, lineHeight: 1.5 }}>
        Momentum, not totals. Points per round across the last {n}, against each driver's own season average —
        who's arriving at the back end of the year in form.
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
        {windowRounds.join(' · ')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.map(r => (
          <div
            key={r.id}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '46px 1fr 32px 46px' : '58px 1fr 44px 62px',
              alignItems: 'center',
              gap: isMobile ? 8 : 12,
              padding: '8px',
              background: r.fav ? 'rgba(39,244,210,0.07)' : 'transparent',
              borderBottom: '1px solid var(--rule-light)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 3, height: 16, background: r.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.04em' }}>
                {r.code}
              </span>
            </div>

            {/* per-round bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 30 }}>
              {r.recent.map(x => (
                <div
                  key={x.round}
                  title={`${x.name}: ${x.points} pts`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}
                >
                  <div style={{
                    height: `${Math.max((x.points / maxPts) * 100, x.points > 0 ? 8 : 3)}%`,
                    background: x.points > 0 ? r.color : 'var(--rule-light)',
                    opacity: x.points > 0 ? (r.fav ? 1 : 0.8) : 1,
                  }} />
                </div>
              ))}
            </div>

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: 'var(--ink)', textAlign: 'right' }}>
              {r.recentTotal}
            </span>

            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textAlign: 'right',
              color: r.swing > 0.05 ? 'var(--mercedes)' : r.swing < -0.05 ? '#E8002D' : 'var(--ink-3)',
            }}>
              {r.swing > 0.05 ? '▲' : r.swing < -0.05 ? '▼' : '—'} {Math.abs(r.swing).toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.04em', lineHeight: 1.5 }}>
        Bars are points per round · right column is recent average against season average · top 12 by recent points
      </div>
    </Panel>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '32px 4px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{children}</div>;
}
