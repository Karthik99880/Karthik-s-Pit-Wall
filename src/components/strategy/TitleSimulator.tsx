import { useMemo, useState } from 'react';
import { useDriverStandings, useRaceSchedule } from '@/hooks/useF1Data';
import { useIsMobile } from '@/hooks/use-mobile';
import { getTeamColor, isFavoriteTeam } from '@/lib/f1Types';
import { f1Date } from '@/lib/dateUtils';
import Panel from './Panel';

const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const MAX_POS = 15;
const pointsFor = (pos: number) => POINTS_TABLE[pos - 1] ?? 0;

interface Contender {
  id: string;
  code: string;
  name: string;
  color: string;
  fav: boolean;
  current: number;
  startPos: number;
}

export default function TitleSimulator() {
  const { data: standings, isLoading } = useDriverStandings();
  const { data: races } = useRaceSchedule();
  const isMobile = useIsMobile();

  const remaining = useMemo(() => {
    const now = Date.now();
    return (races ?? []).filter(r => f1Date(r.date, r.time).getTime() >= now).length;
  }, [races]);

  const contenders = useMemo<Contender[]>(() => {
    return (standings ?? []).slice(0, 5).map((s, i) => ({
      id:      s.Driver.driverId,
      code:    s.Driver.code ?? s.Driver.familyName.slice(0, 3).toUpperCase(),
      name:    s.Driver.familyName,
      color:   getTeamColor(s.Constructors[0]?.constructorId ?? ''),
      fav:     isFavoriteTeam(s.Constructors[0]?.constructorId ?? ''),
      current: Number(s.points),
      startPos: Math.min(i + 1, MAX_POS),
    }));
  }, [standings]);

  const [picks, setPicks] = useState<Record<string, number>>({});

  const assumed = (c: Contender) => picks[c.id] ?? c.startPos;

  const projected = useMemo(() => {
    return contenders
      .map(c => ({ ...c, total: c.current + remaining * pointsFor(assumed(c)) }))
      .sort((a, b) => b.total - a.total);
  }, [contenders, picks, remaining]);

  if (!contenders.length) {
    return (
      <Panel title="Championship" accent="Simulator" num="08">
        <Msg>{isLoading ? 'Loading standings…' : 'No standings data yet.'}</Msg>
      </Panel>
    );
  }

  const champion = projected[0];
  const runnerUp = projected[1];
  const margin = runnerUp ? champion.total - runnerUp.total : 0;
  const dirty = Object.keys(picks).length > 0;

  return (
    <Panel
      title="Championship"
      accent="Simulator"
      num="08"
      meta={remaining > 0 ? `${remaining} ${remaining === 1 ? 'race' : 'races'} left` : 'Season complete'}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em', marginBottom: 18, lineHeight: 1.5 }}>
        Set an average finishing position for each contender across the {remaining} remaining {remaining === 1 ? 'round' : 'rounds'} and watch the title swing.
      </div>

      {remaining === 0 ? (
        <Msg>The season is done — nothing left to simulate.</Msg>
      ) : (
        <>
          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 22 }}>
            {contenders.map(c => {
              const pos = assumed(c);
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr auto' : '76px 1fr 96px',
                    alignItems: 'center',
                    columnGap: 14, rowGap: isMobile ? 6 : 0, padding: '8px',
                    background: c.fav ? 'rgba(39,244,210,0.07)' : 'transparent',
                    borderBottom: '1px solid var(--rule-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: 1, gridRow: 1 }}>
                    <span style={{ width: 3, height: 16, background: c.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.04em' }}>
                      {c.code}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={MAX_POS}
                    step={1}
                    value={pos}
                    aria-label={`Average finishing position for ${c.name}`}
                    onChange={e => setPicks(p => ({ ...p, [c.id]: Number(e.target.value) }))}
                    style={{
                      width: '100%', accentColor: c.color, cursor: 'pointer', minWidth: 0,
                      gridColumn: isMobile ? '1 / -1' : 2,
                      gridRow: isMobile ? 2 : 1,
                    }}
                  />

                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)',
                    textAlign: 'right', letterSpacing: '0.04em',
                    gridColumn: isMobile ? 2 : 3, gridRow: 1,
                  }}>
                    avg P{pos} · {pointsFor(pos)} pts
                  </span>
                </div>
              );
            })}
          </div>

          {dirty && (
            <button
              onClick={() => setPicks({})}
              style={{
                background: 'none', border: '1px solid var(--ink-3)', color: 'var(--ink-2)',
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
                textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer', marginBottom: 20,
              }}
            >
              Reset to current order
            </button>
          )}

          {/* Projected result */}
          <div style={{ background: 'var(--carbon)', color: '#fff', border: '2px solid rgba(255,255,255,0.08)', borderTop: '4px solid var(--mercedes)', padding: '18px 20px 20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--mercedes)', marginBottom: 14 }}>
              Projected Final Standings
            </div>

            {projected.map((p, i) => {
              const lead = i === 0;
              const maxTotal = projected[0].total || 1;
              return (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '26px 54px 1fr 64px', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < projected.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: lead ? 'var(--mercedes)' : 'rgba(255,255,255,0.35)' }}>
                    {i + 1}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: lead ? '#fff' : 'rgba(255,255,255,0.75)', letterSpacing: '0.04em' }}>
                    {p.code}{lead && ' ★'}
                  </span>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.07)' }}>
                    <div style={{ width: `${(p.total / maxTotal) * 100}%`, height: '100%', background: p.color, transition: 'width 0.25s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, textAlign: 'right', color: lead ? 'var(--mercedes)' : '#fff' }}>
                    {p.total}
                  </span>
                </div>
              );
            })}

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)', fontFamily: 'var(--font-serif)', fontSize: 15, fontStyle: 'italic', color: '#fff' }}>
              {margin === 0
                ? <>Dead heat on points — {champion.name} takes it on countback.</>
                : <>{champion.name} takes the title by <strong style={{ color: 'var(--mercedes)', fontStyle: 'normal' }}>{margin}</strong> {margin === 1 ? 'point' : 'points'}.</>}
            </div>
          </div>

          <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.04em', lineHeight: 1.5 }}>
            Top 5 contenders · standard points only · sprints and fastest-lap bonuses excluded
          </div>
        </>
      )}
    </Panel>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '32px 4px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{children}</div>;
}
