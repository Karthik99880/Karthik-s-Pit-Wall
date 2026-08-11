import { useState } from 'react';
import { useRaceStints, useLastRaceResults, usePredictiveStints } from '@/hooks/useF1Data';
import type { StintRow } from '@/hooks/useF1Data';
import type { TyreCompound } from '@/lib/openF1Api';
import Panel from './Panel';


const COMPOUND_COLOR: Record<TyreCompound, string> = {
  SOFT:         '#E8002D',
  MEDIUM:       '#FFC906',
  HARD:         '#EFEFEF',
  INTERMEDIATE: '#39B54A',
  WET:          '#0067FF',
  UNKNOWN:      '#555555',
};

const COMPOUND_LABEL: Record<TyreCompound, string> = {
  SOFT:         'S',
  MEDIUM:       'M',
  HARD:         'H',
  INTERMEDIATE: 'I',
  WET:          'W',
  UNKNOWN:      '?',
};


interface TooltipData {
  stint: StintRow;
  x: number;
  y: number;
}

function StintTooltip({ data }: { data: TooltipData }) {
  const { stint, x, y } = data;
  const laps = stint.lap_end - stint.lap_start + 1;
  const color = COMPOUND_COLOR[stint.compound];
  return (
    <div style={{
      position: 'fixed',
      left: x + 14,
      top: y - 10,
      zIndex: 9999,
      background: 'var(--carbon)',
      border: `1px solid ${color}`,
      padding: '10px 12px',
      fontFamily: 'var(--font-mono)',
      minWidth: 180,
      pointerEvents: 'none',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color, letterSpacing: '0.08em', marginBottom: 8 }}>
        {stint.compound}
      </div>
      <TipRow label="Stint"     value={`#${stint.stint_number}`} />
      <TipRow label="Laps"      value={`${stint.lap_start} – ${stint.lap_end} (${laps})`} />
      <TipRow label="Tyre age"  value={`${stint.tyre_age_at_start} laps old`} />
      <TipRow label="Driver"    value={stint.fullName} />
    </div>
  );
}

function TipRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '2px 0' }}>
      <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', maxWidth: 130, textAlign: 'right' }}>{value}</span>
    </div>
  );
}


function CompoundLegend() {
  const items: TyreCompound[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
      {items.map(c => (
        <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          <span style={{ width: 12, height: 12, background: COMPOUND_COLOR[c], borderRadius: '50%', flexShrink: 0, border: c === 'HARD' ? '1px solid rgba(255,255,255,0.2)' : 'none' }} />
          {c}
        </div>
      ))}
    </div>
  );
}


function DriverStintRow({
  driverNum,
  stints,
  totalLaps,
  isMercedes,
  onHover,
  onLeave,
}: {
  driverNum: number;
  stints: StintRow[];
  totalLaps: number;
  isMercedes: boolean;
  onHover: (s: StintRow, e: React.MouseEvent) => void;
  onLeave: () => void;
}) {
  if (!stints.length) return null;
  const first = stints[0];
  const code  = first.code;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '5px 0',
      borderBottom: '1px solid var(--rule-light)',
      background: isMercedes ? 'rgba(39,244,210,0.05)' : 'transparent',
    }}>
      {}
      <span style={{
        width: 38,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 700,
        color: isMercedes ? 'var(--mercedes)' : 'var(--ink)',
        flexShrink: 0,
        letterSpacing: '0.04em',
      }}>
        {code}
      </span>

      {}
      <div style={{ flex: 1, height: 20, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {stints.map((s, i) => {
          const lapSpan = (s.lap_end - s.lap_start + 1);
          const widthPct = (lapSpan / totalLaps) * 100;
          const leftPct  = ((s.lap_start - 1) / totalLaps) * 100;
          const color = COMPOUND_COLOR[s.compound];
          const isHard = s.compound === 'HARD';
          return (
            <div
              key={i}
              onMouseMove={e => onHover(s, e)}
              onMouseLeave={onLeave}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                width: `calc(${widthPct}% - 2px)`,
                height: '100%',
                background: color,
                border: isHard ? '1px solid rgba(255,255,255,0.25)' : 'none',
                cursor: 'crosshair',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.15s',
              }}
              title=""
            >
              {}
              {widthPct > 8 && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  fontWeight: 900,
                  color: isHard ? '#111' : color === '#FFC906' ? '#111' : '#fff',
                  letterSpacing: '0.05em',
                  pointerEvents: 'none',
                }}>
                  {COMPOUND_LABEL[s.compound]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {}
      <span style={{
        width: 16,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--ink-3)',
        flexShrink: 0,
        textAlign: 'right',
      }}>
        {stints.length}
      </span>
    </div>
  );
}


function LapAxis({ totalLaps }: { totalLaps: number }) {
  const ticks = [];
  const step  = totalLaps <= 30 ? 5 : totalLaps <= 60 ? 10 : 15;
  for (let l = step; l <= totalLaps; l += step) ticks.push(l);
  return (
    <div style={{ display: 'flex', position: 'relative', height: 16, marginLeft: 48 }}>
      {ticks.map(t => (
        <div key={t} style={{
          position: 'absolute',
          left: `${((t - 1) / totalLaps) * 100}%`,
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: 'var(--ink-3)',
          transform: 'translateX(-50%)',
        }}>
          {t}
        </div>
      ))}
    </div>
  );
}


export default function TyreStrategy() {
  const { data: stintsData, isLoading, isError } = useRaceStints();
  const { data: predictiveData } = usePredictiveStints();
  const { data: lastRace } = useLastRaceResults();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  
  const finishOrder: number[] = (lastRace?.results ?? []).map(r => {
    const num = r.Driver.permanentNumber ? Number(r.Driver.permanentNumber) : null;
    return num;
  }).filter((n): n is number => n !== null);

  if (isLoading) {
    return (
      <Panel title="Tyre" accent="Strategy" num="04" meta="Loading…">
        <Msg>Fetching stint data from OpenF1…</Msg>
      </Panel>
    );
  }

  if (isError || !stintsData) {
    return (
      <Panel title="Tyre" accent="Strategy" num="04">
        <Msg>No stint data available — OpenF1 may not have the latest race yet.</Msg>
      </Panel>
    );
  }

  const { byDriver, driverOrder, raceName } = stintsData;

  
  let totalLaps = 0;
  for (const stints of byDriver.values()) {
    const last = stints[stints.length - 1];
    if (last && last.lap_end > totalLaps) totalLaps = last.lap_end;
  }
  if (totalLaps < 1) totalLaps = 60; 

  
  const sortedDrivers = finishOrder.length > 0
    ? [
        ...finishOrder.filter(n => byDriver.has(n)),
        ...driverOrder.filter(n => !finishOrder.includes(n) && byDriver.has(n)),
      ]
    : driverOrder.filter(n => byDriver.has(n));

  return (
    <Panel
      title="Tyre"
      accent="Strategy"
      num="04"
      meta={raceName}
    >
      {tooltip && <StintTooltip data={tooltip} />}

      {}
      {predictiveData && (
        <div style={{
          background: 'var(--carbon)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '16px 20px',
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))',
          gap: 16,
          boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ gridColumn: '1 / -1', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 700, marginBottom: -4 }}>
            Predictive Model (Last {predictiveData.racesAnalyzed} Races)
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Avg Pit Stops</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: '#fff' }}>
              {predictiveData.avgPitStops.toFixed(1)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Likely Start</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: COMPOUND_COLOR[predictiveData.likelyStart] }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: COMPOUND_COLOR[predictiveData.likelyStart] }} />
              {predictiveData.likelyStart}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Most Common Combo</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 4 }}>
              {predictiveData.likelyCombo}
            </div>
          </div>
        </div>
      )}

      <CompoundLegend />

      {}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
        paddingBottom: 8,
        borderBottom: '1px solid var(--rule-light)',
      }}>
        <span style={{ width: 38, fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', flexShrink: 0 }}>DRV</span>
        <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          Stint bars · Lap 1 → {totalLaps} · hover for details
        </span>
        <span style={{ width: 16, fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-3)', textAlign: 'right' }}>STS</span>
      </div>

      {}
      {sortedDrivers.map(dNum => {
        const stints = byDriver.get(dNum) ?? [];
        const teamColour = (stints[0]?.teamColour ?? '888888').toLowerCase();
        const isMercedes = teamColour.includes('27f4d2')
          || (stints[0]?.teamName ?? '').toLowerCase().includes('mercedes');
        return (
          <DriverStintRow
            key={dNum}
            driverNum={dNum}
            stints={stints}
            totalLaps={totalLaps}
            isMercedes={isMercedes}
            onHover={(s, e) => setTooltip({ stint: s, x: e.clientX, y: e.clientY })}
            onLeave={() => setTooltip(null)}
          />
        );
      })}

      {}
      <LapAxis totalLaps={totalLaps} />

      {}
      <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', lineHeight: 1.5, letterSpacing: '0.04em' }}>
        Data: OpenF1.org · Sorted by finishing position · STS = number of stints
      </div>
    </Panel>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '32px 4px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
      {children}
    </div>
  );
}
