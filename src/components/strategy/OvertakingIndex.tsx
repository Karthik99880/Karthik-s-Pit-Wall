import { useMemo, useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  ReferenceLine, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useRaceSchedule, useSeasonResults } from '@/hooks/useF1Data';
import { getTeamColor, isFavoriteTeam } from '@/lib/f1Types';
import Panel from './Panel';


const startPos = (g: string) => { const n = Number(g); return n === 0 ? 20 : n; };

interface DriverCraft {
  id: string; label: string; color: string; fav: boolean;
  starts: number; gained: number; avgGrid: number; avgFinish: number;
}

export default function OvertakingIndex() {
  const { data: races } = useRaceSchedule();
  const { data: rounds, isLoading } = useSeasonResults(races);

  const drivers = useMemo<DriverCraft[]>(() => {
    const map = new Map<string, { label: string; color: string; fav: boolean; gridSum: number; finSum: number; gained: number; starts: number }>();
    for (const round of rounds) {
      for (const r of round.results) {
        const id = r.Driver.driverId;
        const grid = startPos(r.grid);
        const fin = Number(r.position);
        if (!fin) continue;
        const cur = map.get(id) ?? {
          label: r.Driver.code ?? r.Driver.familyName.slice(0, 3).toUpperCase(),
          color: getTeamColor(r.Constructor.constructorId),
          fav: isFavoriteTeam(r.Constructor.constructorId),
          gridSum: 0, finSum: 0, gained: 0, starts: 0,
        };
        cur.gridSum += grid;
        cur.finSum += fin;
        cur.gained += grid - fin;
        cur.starts += 1;
        map.set(id, cur);
      }
    }
    return [...map.entries()].map(([id, v]) => ({
      id, label: v.label, color: v.color, fav: v.fav,
      starts: v.starts, gained: v.gained,
      avgGrid: v.gridSum / v.starts, avgFinish: v.finSum / v.starts,
    })).filter(d => d.starts > 0);
  }, [rounds]);

  const [showClue5Modal, setShowClue5Modal] = useState(false);
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [stage, setStage] = useState(() => {
    const s = localStorage.getItem('pitwall_hunt_stage');
    return s ? Number(s) : 0;
  });

  useEffect(() => {
    const onUpdate = () => {
      const s = localStorage.getItem('pitwall_hunt_stage');
      setStage(s ? Number(s) : 0);
    };
    window.addEventListener('pitwall-stage-update', onUpdate);
    return () => window.removeEventListener('pitwall-stage-update', onUpdate);
  }, []);

  const handleTopDriverClick = () => {
    const sVal = localStorage.getItem('pitwall_hunt_stage');
    if (sVal && Number(sVal) >= 4) {
      localStorage.setItem('pitwall_hunt_stage', '5');
      window.dispatchEvent(new Event('pitwall-stage-update'));
      setShowClue5Modal(true);
    } else {
      setShowDeniedModal(true);
    }
  };

  if (!drivers.length) {
    return <Panel title="Overtaking" accent="Index" num="03"><Msg>{isLoading ? 'Loading race-by-race results…' : 'No race data yet.'}</Msg></Panel>;
  }

  const ranked = [...drivers].sort((a, b) => b.gained - a.gained);
  const maxAbs = Math.max(...ranked.map(d => Math.abs(d.gained)), 1);
  const scatter = drivers.map(d => ({ x: d.avgGrid, y: d.avgFinish, label: d.label, color: d.color, fav: d.fav, gained: d.gained, starts: d.starts }));

  return (
    <Panel title="Overtaking" accent="Index" num="03" meta="Grid → finish race craft">
      {showClue5Modal && (
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
              📁 ARCHIVE ENCRYPTION: LEVEL 5
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', margin: '16px 0' }}>
              "Descend to the base of the interface to find the Layout Demand Panel. Locate the geometry where the margin for error is absolute zero, track width is compressed to a minimum, and grid position is essentially destiny. Select the crown jewel of tight street circuits."
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setShowClue5Modal(false)}
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
              "Access Denied. Follow the clues in order starting from the footer classified archive."
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 28, alignItems: 'start' }}>
        {}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12, fontWeight: 700 }}>
            Avg Start vs Avg Finish — below the line = net gainer
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 8, right: 16, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--rule-light)" />
                <XAxis type="number" dataKey="x" name="Avg grid" domain={[1, 20]} reversed
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-3)' }}
                  label={{ value: 'AVG GRID', position: 'insideBottom', offset: -8, fontSize: 9, fill: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }} />
                <YAxis type="number" dataKey="y" name="Avg finish" domain={[1, 20]} reversed
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-3)' }} width={28} />
                <ZAxis range={[80, 80]} />
                <ReferenceLine segment={[{ x: 1, y: 1 }, { x: 20, y: 20 }]} stroke="var(--ink-3)" strokeDasharray="4 4" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTip />} />
                <Scatter data={scatter}>
                  {scatter.map((d, i) => <Cell key={i} fill={d.color} stroke={d.fav ? '#fff' : 'none'} strokeWidth={d.fav ? 2 : 0} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12, fontWeight: 700 }}>
            Positions Gained · Season
          </div>
          {ranked.map((d, index) => {
            const pos = d.gained >= 0;
            const isTop = index === 0;
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--rule-light)', background: d.fav ? 'rgba(39,244,210,0.06)' : 'transparent' }}>
                <span
                  onClick={() => (isTop && stage >= 4) && handleTopDriverClick()}
                  style={{
                    width: 36,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: (isTop && stage >= 4) ? 'var(--mercedes)' : (d.fav ? 'var(--mercedes)' : 'var(--ink)'),
                    cursor: (isTop && stage >= 4) ? 'pointer' : 'default',
                    textDecoration: (isTop && stage >= 4) ? 'underline' : 'none',
                  }}
                >
                  {d.label}
                </span>
                {}
                <div style={{ flex: 1, height: 14, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--ink-3)' }} />
                  <div style={{
                    position: 'absolute', height: 8,
                    left: pos ? '50%' : `${50 - (Math.abs(d.gained) / maxAbs) * 50}%`,
                    width: `${(Math.abs(d.gained) / maxAbs) * 50}%`,
                    background: pos ? d.color : 'var(--racing)',
                  }} />
                </div>
                <span style={{ width: 40, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: pos ? 'var(--ink)' : 'var(--racing)' }}>
                  {pos ? '+' : ''}{d.gained}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </Panel>
  );
}

function ScatterTip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; color: string; gained: number; starts: number; x: number; y: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pos = d.gained >= 0;
  return (
    <div style={{ background: 'var(--carbon)', border: `1px solid ${d.color}`, padding: '10px 12px', fontFamily: 'var(--font-mono)', minWidth: 150 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: d.color, letterSpacing: '0.08em', marginBottom: 8 }}>{d.label}</div>
      <Row label="Avg grid"   value={d.x.toFixed(1)} />
      <Row label="Avg finish" value={d.y.toFixed(1)} />
      <Row label="Net gained" value={`${pos ? '+' : ''}${d.gained}`} color={pos ? 'var(--mercedes)' : 'var(--racing-hot)'} />
      <Row label="Races"      value={String(d.starts)} />
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, padding: '2px 0' }}>
      <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: color ?? '#fff' }}>{value}</span>
    </div>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '32px 4px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{children}</div>;
}
