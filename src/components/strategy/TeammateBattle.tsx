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
  avgGridDelta: number; // negative => A starts ahead on average
  rounds: number;
}

/** grid "0" means a pit-lane start — sort it last, not first. */
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
      .sort((x, y) => (y.fav ? 1 : 0) - (x.fav ? 1 : 0)); // favourite first
  }, [drivers, constructors, rounds]);

  const [showClueModal, setShowClueModal] = useState(false);
  const [showDeniedModal, setShowDeniedModal] = useState(false);

  const handleLockClick = () => {
    const stage = localStorage.getItem('pitwall_hunt_stage');
    if (stage && Number(stage) >= 1) {
      localStorage.setItem('pitwall_hunt_stage', '2');
      setShowClueModal(true);
    } else {
      setShowDeniedModal(true);
    }
  };

  if (!teams.length) {
    return <Panel title="Teammate" accent="Head-to-Head" num="02"><Msg>{isLoading ? 'Loading race-by-race results…' : 'No teammate data yet.'}</Msg></Panel>;
  }

  const metaContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>Same car · true baseline</span>
      <span
        onClick={handleLockClick}
        style={{
          cursor: 'pointer',
          color: 'var(--mercedes)',
          display: 'inline-flex',
          alignItems: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
        title="Classified Archives Lock"
      >
        <Lock size={12} />
      </span>
    </div>
  );

  return (
    <Panel title="Teammate" accent="Head-to-Head" num="02" meta={metaContent}>
      {showClueModal && (
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
              "The ultimate speed at Brackley is unlocked by the driver who wore the number 44. Search for his first name in the Driver Search Bar on the Dashboard standings, but spell it backwards."
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setShowClueModal(false)}
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
        {/* Donut */}
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

        {/* H2H tallies */}
        <div style={{ flex: 1 }}>
          <H2HRow label="Quali" a={t.qualiA} b={t.qualiB} color={t.color} />
          <H2HRow label="Race"  a={t.raceA}  b={t.raceB}  color={t.color} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Avg grid Δ</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: t.avgGridDelta <= 0 ? t.color : '#fff' }}>{deltaTxt} pos</span>
          </div>
        </div>
      </div>

      {/* Driver legend */}
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
