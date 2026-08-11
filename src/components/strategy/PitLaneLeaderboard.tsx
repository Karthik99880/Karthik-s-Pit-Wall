import { useMemo } from 'react';
import { useRaceSchedule, useSeasonResults, useSeasonPitStops } from '@/hooks/useF1Data';
import { getTeamColor, getTeamDisplay, isFavoriteTeam } from '@/lib/f1Types';
import Panel from './Panel';

interface DriverMeta {
  code: string;
  color: string;
  fav: boolean;
  constructorId: string;
  teamName: string;
}

/**
 * Median, not mean. A race suspended under red flag leaves cars parked in the
 * pit lane and the feed logs that as a single multi-minute "stop" — one such
 * outlier drags a team's mean from ~22 s to well over a minute.
 */
function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export default function PitLaneLeaderboard() {
  const { data: races } = useRaceSchedule();
  const { data: rounds, isLoading: resultsLoading } = useSeasonResults(races);
  const { data: stops,  isLoading: stopsLoading }   = useSeasonPitStops(races);

  /* driverId → most recent team/code seen this season */
  const driverMeta = useMemo(() => {
    const m = new Map<string, DriverMeta>();
    for (const round of [...rounds].sort((a, b) => a.round - b.round)) {
      for (const res of round.results) {
        const cid = res.Constructor.constructorId;
        m.set(res.Driver.driverId, {
          code:  res.Driver.code ?? res.Driver.familyName.slice(0, 3).toUpperCase(),
          color: getTeamColor(cid),
          fav:   isFavoriteTeam(cid),
          constructorId: cid,
          teamName: getTeamDisplay(cid, res.Constructor.name),
        });
      }
    }
    return m;
  }, [rounds]);

  const topStops = useMemo(() => {
    return [...stops]
      .sort((a, b) => a.duration - b.duration)
      .slice(0, 10)
      .map(s => ({ ...s, meta: driverMeta.get(s.driverId) }));
  }, [stops, driverMeta]);

  const teamMedian = useMemo(() => {
    const agg = new Map<string, { xs: number[]; name: string; color: string; fav: boolean }>();
    for (const s of stops) {
      const meta = driverMeta.get(s.driverId);
      if (!meta) continue;
      const cur = agg.get(meta.constructorId) ?? { xs: [], name: meta.teamName, color: meta.color, fav: meta.fav };
      cur.xs.push(s.duration);
      agg.set(meta.constructorId, cur);
    }
    return [...agg.entries()]
      .filter(([, a]) => a.xs.length >= 3)
      .map(([id, a]) => ({ id, name: a.name, color: a.color, fav: a.fav, med: median(a.xs), n: a.xs.length }))
      .sort((a, b) => a.med - b.med);
  }, [stops, driverMeta]);

  const fastestLaps = useMemo(() => {
    const agg = new Map<string, number>();
    for (const round of rounds) {
      for (const res of round.results) {
        if (res.FastestLap?.rank === '1') {
          agg.set(res.Driver.driverId, (agg.get(res.Driver.driverId) ?? 0) + 1);
        }
      }
    }
    return [...agg.entries()]
      .map(([id, n]) => ({ id, n, meta: driverMeta.get(id) }))
      .filter(d => !!d.meta)
      .sort((a, b) => b.n - a.n)
      .slice(0, 8);
  }, [rounds, driverMeta]);

  const loading = resultsLoading || stopsLoading;
  const nothing = !stops.length && !fastestLaps.length;

  if (nothing) {
    return (
      <Panel title="Pit Lane &" accent="Fastest Laps" num="09">
        <Msg>{loading ? 'Loading pit stop and lap data…' : 'No pit stop data published for this season yet.'}</Msg>
      </Panel>
    );
  }

  return (
    <Panel title="Pit Lane &" accent="Fastest Laps" num="09" meta={stops.length ? `${stops.length} stops logged` : undefined}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em', marginBottom: 18, lineHeight: 1.5 }}>
        Pit lane time measured from entry to exit — not the stationary time quoted in the DHL award, so the numbers run around 20 s rather than 2 s.
        Compared like-for-like it still shows who loses least on a stop. Team figures are medians, so red-flag stoppages don't distort them.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 16 }}>

        {/* Fastest individual stops */}
        {topStops.length > 0 && (
          <Card title="Quickest Stops">
            {topStops.map((s, i) => (
              <Row key={`${s.driverId}-${s.round}-${s.stopNo}`} rank={i + 1} fav={!!s.meta?.fav}>
                <Dot color={s.meta?.color ?? '#888'} />
                <Code fav={!!s.meta?.fav}>{s.meta?.code ?? s.driverId.slice(0, 3).toUpperCase()}</Code>
                <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.raceName} · L{s.lap}
                </span>
                <Value>{s.duration.toFixed(2)}s</Value>
              </Row>
            ))}
          </Card>
        )}

        {/* Team median */}
        {teamMedian.length > 0 && (
          <Card title="Team Median">
            {teamMedian.map((t, i) => (
              <Row key={t.id} rank={i + 1} fav={t.fav}>
                <Dot color={t.color} />
                <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, color: t.fav ? 'var(--mercedes)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{t.n}</span>
                <Value>{t.med.toFixed(2)}s</Value>
              </Row>
            ))}
          </Card>
        )}

        {/* Fastest laps */}
        {fastestLaps.length > 0 && (
          <Card title="Fastest Laps">
            {fastestLaps.map((d, i) => (
              <Row key={d.id} rank={i + 1} fav={!!d.meta?.fav}>
                <Dot color={d.meta?.color ?? '#888'} />
                <Code fav={!!d.meta?.fav}>{d.meta?.code ?? d.id.slice(0, 3).toUpperCase()}</Code>
                <span style={{ flex: 1 }} />
                <Value>{d.n}</Value>
              </Row>
            ))}
          </Card>
        )}
      </div>
    </Panel>
  );
}

/* ── little building blocks ─────────────────────────── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--carbon)', color: '#fff', border: '2px solid rgba(255,255,255,0.08)', borderTop: '4px solid var(--mercedes)', padding: '16px 18px 18px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mercedes)', marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ rank, fav, children }: { rank: number; fav: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: fav ? 'rgba(39,244,210,0.06)' : 'transparent',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', width: 16, flexShrink: 0 }}>{rank}</span>
      {children}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />;
}

function Code({ fav, children }: { fav: boolean; children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: fav ? 'var(--mercedes)' : '#fff', letterSpacing: '0.04em', flexShrink: 0 }}>
      {children}{fav && ' ★'}
    </span>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: '#fff', textAlign: 'right', flexShrink: 0 }}>
      {children}
    </span>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '32px 4px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{children}</div>;
}
