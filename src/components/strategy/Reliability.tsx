import { useMemo } from 'react';
import { useRaceSchedule, useSeasonResults } from '@/hooks/useF1Data';
import { useIsMobile } from '@/hooks/use-mobile';
import { getTeamColor, getTeamDisplay, isFavoriteTeam } from '@/lib/f1Types';
import Panel from './Panel';

type Outcome = 'FINISH' | 'MECHANICAL' | 'INCIDENT' | 'RETIRED' | 'OTHER';

const INCIDENT_WORDS  = ['accident', 'collision', 'spun off', 'damage'];
const MECHANICAL_WORDS = [
  'engine', 'gearbox', 'hydraulic', 'power unit', 'brake', 'suspension', 'transmission',
  'electrical', 'electronics', 'puncture', 'overheating', 'oil', 'fuel', 'clutch',
  'driveshaft', 'wheel', 'exhaust', 'turbo', 'radiator', 'water', 'tyre', 'battery', 'differential',
];
const OTHER_WORDS = ['disqualified', 'withdrew', 'did not start', 'did not qualify', 'excluded', 'injury'];

/**
 * Jolpica's 2026 feed only distinguishes Finished / Lapped / Retired / Did not start.
 * Classic Ergast seasons carry a specific failure reason, so we keep the granular
 * buckets and fall back to a generic "Retired" when no reason is published.
 */
function classify(status: string): Outcome {
  if (status === 'Finished' || status === 'Lapped' || /^\+\d+\s+Lap/.test(status)) return 'FINISH';
  const s = status.toLowerCase();
  if (OTHER_WORDS.some(w => s.includes(w)))      return 'OTHER';
  if (INCIDENT_WORDS.some(w => s.includes(w)))   return 'INCIDENT';
  if (MECHANICAL_WORDS.some(w => s.includes(w))) return 'MECHANICAL';
  return 'RETIRED';
}

interface TeamRow {
  id: string;
  name: string;
  color: string;
  fav: boolean;
  entries: number;
  starts: number;
  finishes: number;
  mechanical: number;
  incident: number;
  retired: number;
  other: number;
  rate: number;
}

export default function Reliability() {
  const { data: races } = useRaceSchedule();
  const { data: rounds, isLoading } = useSeasonResults(races);
  const isMobile = useIsMobile();

  const teams = useMemo<TeamRow[] | null>(() => {
    if (!rounds.length) return null;

    const agg = new Map<string, Omit<TeamRow, 'rate' | 'starts'>>();

    for (const round of rounds) {
      for (const res of round.results) {
        const id = res.Constructor.constructorId;
        const cur = agg.get(id) ?? {
          id,
          name:  getTeamDisplay(id, res.Constructor.name),
          color: getTeamColor(id),
          fav:   isFavoriteTeam(id),
          entries: 0, finishes: 0, mechanical: 0, incident: 0, retired: 0, other: 0,
        };
        cur.entries += 1;
        switch (classify(res.status)) {
          case 'FINISH':     cur.finishes   += 1; break;
          case 'MECHANICAL': cur.mechanical += 1; break;
          case 'INCIDENT':   cur.incident   += 1; break;
          case 'RETIRED':    cur.retired    += 1; break;
          default:           cur.other      += 1;
        }
        agg.set(id, cur);
      }
    }

    const out = [...agg.values()]
      .map(t => {
        // A car that never started can't be blamed on race-day reliability.
        const starts = t.entries - t.other;
        return { ...t, starts, rate: starts ? (t.finishes / starts) * 100 : 0 };
      })
      .sort((a, b) => b.rate - a.rate);

    return out.length ? out : null;
  }, [rounds]);

  if (!teams) {
    return (
      <Panel title="Reliability &" accent="Attrition" num="07">
        <Msg>{isLoading ? 'Loading race-by-race results…' : 'No race data yet.'}</Msg>
      </Panel>
    );
  }

  const totalDnf = teams.reduce((n, t) => n + t.mechanical + t.incident + t.retired, 0);

  // Only surface the granular split when the feed actually publishes reasons.
  const hasReasons = teams.some(t => t.mechanical + t.incident > 0);

  return (
    <Panel title="Reliability &" accent="Attrition" num="07" meta={`${totalDnf} retirements`}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em', marginBottom: 16, lineHeight: 1.5 }}>
        Finish rate per constructor. Championships are lost here as often as they're won on pace.
        {!hasReasons && ' This season’s feed reports a generic retirement without a cause, so failures aren’t split by type.'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {teams.map(t => (
          <div
            key={t.id}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '82px 1fr 40px' : '132px 1fr 104px 52px',
              alignItems: 'center',
              gap: isMobile ? 8 : 12,
              padding: '9px 8px',
              background: t.fav ? 'rgba(39,244,210,0.07)' : 'transparent',
              borderBottom: '1px solid var(--rule-light)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ width: 3, height: 18, background: t.color, flexShrink: 0 }} />
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--ink)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {t.name}
              </span>
            </div>

            {/* stacked bar, proportional to starts */}
            <div style={{ display: 'flex', height: 16, background: 'var(--rule-light)', overflow: 'hidden' }}>
              {([
                { n: t.finishes,   c: t.color,        label: 'Finished' },
                { n: t.mechanical, c: '#FFC906',      label: 'Mechanical' },
                { n: t.incident,   c: '#E8002D',      label: 'Incident' },
                { n: t.retired,    c: '#FF8000',      label: 'Retired' },
              ] as const).map(seg => seg.n > 0 && (
                <div
                  key={seg.label}
                  title={`${seg.label}: ${seg.n}`}
                  style={{ width: `${(seg.n / Math.max(t.starts, 1)) * 100}%`, background: seg.c }}
                />
              ))}
            </div>

            {!isMobile && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
                {hasReasons
                  ? `${t.mechanical}M · ${t.incident}I · ${t.starts}s`
                  : `${t.finishes}/${t.starts} finished`}
              </span>
            )}

            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, textAlign: 'right',
              color: t.fav ? 'var(--mercedes)' : 'var(--ink)',
            }}>
              {t.rate.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 14 }}>
        {[
          { c: 'var(--ink)', l: 'Finished (team colour)', show: true },
          { c: '#FFC906',    l: 'Mechanical',             show: hasReasons },
          { c: '#E8002D',    l: 'Incident',               show: hasReasons },
          { c: '#FF8000',    l: 'Retired',                show: teams.some(t => t.retired > 0) },
        ].filter(k => k.show).map(k => (
          <div key={k.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, background: k.c, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{k.l}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
        Rate is finishes ÷ starts · lapped runners count as finishers · non-starters excluded
      </div>
    </Panel>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '32px 4px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{children}</div>;
}
