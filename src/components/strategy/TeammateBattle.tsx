import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useDriverStandings, useConstructorStandings, useRaceSchedule, useSeasonResults } from '@/hooks/useF1Data';
import { getTeamColor, getTeamDisplay, isFavoriteTeam } from '@/lib/f1Types';
import type { DriverStanding, RaceResult } from '@/lib/f1Types';
import { Lock } from 'lucide-react';
import Panel from './Panel';


interface DriverAgg {
  id: string; name: string; points: number;
}
interface TeamH2H {
  id: string; name: string; color: string; fav: boolean;
  a: DriverAgg; b: DriverAgg;
  raceA: number; raceB: number;
  qualiA: number; qualiB: number;
  avgGridDelta: number; 
  rounds: number;
}


const gridVal = (g: string) => { const n = Number(g); return n === 0 ? 99 : n; };

export default function TeammateBattle() {
  const { data: drivers }      = useDriverStandings();
  const { data: constructors } = useConstructorStandings();
  const { data: races }        = useRaceSchedule();
  const { data: rounds, isLoading } = useSeasonResults(races);

  const teams = useMemo<TeamH2H[]>(() => {
    if (!drivers?.length || !constructors?.length) return [];

    return constructors.map(c => {
      const cid = c.Constructor.constructorId;
      const teamDrivers: DriverStanding[] = drivers
        .filter(d => d.Constructors.some(co => co.constructorId === cid))
        .sort((x, y) => Number(y.points) - Number(x.points))
        .slice(0, 2);
      if (teamDrivers.length < 2) return null;

      const [da, db] = teamDrivers;
      const agg = (d: DriverStanding): DriverAgg => ({
        id: d.Driver.driverId,
        name: `${d.Driver.givenName[0]}. ${d.Driver.familyName}`,
        points: Number(d.points),
      });

      let raceA = 0, raceB = 0, qualiA = 0, qualiB = 0, gridDeltaSum = 0, counted = 0;
      for (const round of rounds) {
        const find = (id: string): RaceResult | undefined => round.results.find(r => r.Driver.driverId === id);
        const ra = find(da.Driver.driverId);
        const rb = find(db.Driver.driverId);
        if (!ra || !rb) continue;
        counted++;
        if (Number(ra.position) < Number(rb.position)) raceA++; else raceB++;
        const ga = gridVal(ra.grid), gb = gridVal(rb.grid);
        if (ga < gb) qualiA++; else qualiB++;
        gridDeltaSum += ga - gb;
      }

      return {
        id: cid,
        name: getTeamDisplay(cid, c.Constructor.name),
        color: getTeamColor(cid),
        fav: isFavoriteTeam(cid),
        a: agg(da), b: agg(db),
        raceA, raceB, qualiA, qualiB,
        avgGridDelta: counted ? gridDeltaSum / counted : 0,
        rounds: counted,
      } as TeamH2H;
    }).filter((t): t is TeamH2H => !!t)
      .sort((x, y) => (y.fav ? 1 : 0) - (x.fav ? 1 : 0)); 
  }, [drivers, constructors, rounds]);

  if (!teams.length) {
    return <Panel title="Teammate" accent="Head-to-Head" num="02"><Msg>{isLoading ? 'Loading race-by-race results…' : 'No teammate data yet.'}</Msg></Panel>;
  }

  return (
    <Panel title="Teammate" accent="Head-to-Head" num="02" meta="Same car · true baseline">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16 }}>
        {teams.map(t => <TeamCard key={t.id} t={t} />)}
      </div>
    </Panel>
  );
}

function TeamCard({ t }: { t: TeamH2H }) {
  const muted = 'rgba(255,255,255,0.22)';
  const totalPts = t.a.points + t.b.points;
  const pie = [
    { name: t.a.name, value: t.a.points },
    { name: t.b.name, value: t.b.points },
  ];
  const sharePct = totalPts ? Math.round((t.a.points / totalPts) * 100) : 50;
  const deltaTxt = `${t.avgGridDelta <= 0 ? '−' : '+'}${Math.abs(t.avgGridDelta).toFixed(1)}`;

  return (
    <div style={{
      background: 'var(--carbon)', color: '#fff', padding: '18px 20px 20px',
      borderTop: `4px solid ${t.color}`,
      border: `2px solid ${t.fav ? 'var(--mercedes)' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: t.fav ? '0 0 22px rgba(39,244,210,0.16)' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700 }}>{t.name}{t.fav && <span style={{ color: 'var(--mercedes)', marginLeft: 6 }}>★</span>}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>{t.rounds} ROUNDS</span>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {}
        <div style={{ width: 96, height: 96, position: 'relative', flexShrink: 0 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pie} dataKey="value" innerRadius={30} outerRadius={46} startAngle={90} endAngle={-270} stroke="none">
                <Cell fill={t.color} />
                <Cell fill={muted} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 800, color: t.color }}>{sharePct}%</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>SHARE</span>
          </div>
        </div>

        {}
        <div style={{ flex: 1 }}>
          <H2HRow label="Quali" a={t.qualiA} b={t.qualiB} color={t.color} />
          <H2HRow label="Race"  a={t.raceA}  b={t.raceB}  color={t.color} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Avg grid Δ</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: t.avgGridDelta <= 0 ? t.color : '#fff' }}>{deltaTxt} pos</span>
          </div>
        </div>
      </div>

      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.color, fontWeight: 700 }}>
          <span style={{ width: 9, height: 9, background: t.color, display: 'inline-block' }} />{t.a.name} · {t.a.points}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
          {t.b.name} · {t.b.points}<span style={{ width: 9, height: 9, background: muted, display: 'inline-block' }} />
        </span>
      </div>
    </div>
  );
}

function H2HRow({ label, a, b, color }: { label: string; a: number; b: number; color: string }) {
  const total = a + b || 1;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{label} H2H</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>
          <span style={{ color }}>{a}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}> – </span>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{b}</span>
        </span>
      </div>
      <div style={{ display: 'flex', height: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: `${(a / total) * 100}%`, background: color }} />
        <div style={{ width: `${(b / total) * 100}%`, background: 'rgba(255,255,255,0.25)' }} />
      </div>
    </div>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '32px 4px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{children}</div>;
}
