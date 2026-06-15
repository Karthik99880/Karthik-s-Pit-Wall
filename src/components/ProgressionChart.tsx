import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useDriverStandings, useRaceSchedule, useSeasonProgression } from '@/hooks/useF1Data';
import { getTeamColor, isFavoriteTeam } from '@/lib/f1Types';

/** Animated line chart of the top drivers' cumulative points across the season. */
export default function ProgressionChart() {
  const { data: races }    = useRaceSchedule();
  const { data: standings } = useDriverStandings();
  const { data: progression, isLoading } = useSeasonProgression(races);

  // Top 5 drivers by current standings — the only lines worth plotting.
  const topDrivers = useMemo(
    () => (standings ?? []).slice(0, 5).map(s => ({
      id: s.Driver.driverId,
      label: s.Driver.code ?? s.Driver.familyName.slice(0, 3).toUpperCase(),
      color: getTeamColor(s.Constructors[0]?.constructorId ?? ''),
      fav: isFavoriteTeam(s.Constructors[0]?.constructorId ?? ''),
    })),
    [standings],
  );

  // Shape per-round data for recharts: one row per round, a key per driver.
  const chartData = useMemo(
    () => progression.map(p => {
      const row: Record<string, number | string> = { round: `R${p.round}`, name: p.raceName };
      for (const d of topDrivers) row[d.id] = p.points[d.id] ?? 0;
      return row;
    }),
    [progression, topDrivers],
  );

  if (isLoading && chartData.length === 0) {
    return <Shell><Msg>Building season history…</Msg></Shell>;
  }
  if (chartData.length < 2) {
    return <Shell><Msg>Not enough completed rounds to chart yet.</Msg></Shell>;
  }

  return (
    <Shell>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        {topDrivers.map(d => (
          <span key={d.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: d.fav ? 'var(--mercedes)' : 'var(--ink-2)' }}>
            <span style={{ width: 14, height: 3, background: d.color, display: 'inline-block' }} />
            {d.label}{d.fav && ' ★'}
          </span>
        ))}
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--rule-light)" vertical={false} />
            <XAxis dataKey="round" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink-3)' }} axisLine={{ stroke: 'var(--ink-3)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={44} />
            <Tooltip
              contentStyle={{ background: 'var(--carbon)', border: '1px solid var(--mercedes)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 12 }}
              labelStyle={{ color: '#fff', fontWeight: 700 }}
              itemStyle={{ fontWeight: 600 }}
              labelFormatter={(_, payload) => (payload?.[0]?.payload?.name ?? '') as string}
            />
            {topDrivers.map(d => (
              <Line
                key={d.id} type="monotone" dataKey={d.id} name={d.label}
                stroke={d.color} strokeWidth={d.fav ? 3.5 : 2}
                dot={false} activeDot={{ r: 5 }}
                animationDuration={1400}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '56px 36px 0', animation: 'fadeUpSlow 1s ease both 3.6s' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
          Points <em style={{ fontStyle: 'italic', color: 'var(--mercedes)', fontWeight: 700 }}>Progression</em>
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Top 5 · Season</span>
      </div>
      <div style={{ border: '2px solid var(--ink)', background: 'var(--paper-2)', padding: '24px 24px 20px' }}>
        {children}
      </div>
    </div>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '40px 8px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>{children}</div>;
}
