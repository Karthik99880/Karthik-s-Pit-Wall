import { useQuery } from '@tanstack/react-query';
import type { Race } from '@/lib/f1Types';
import { buildSessions } from '@/hooks/useF1Data';
import { f1Date } from '@/lib/dateUtils';

function useLiveCountdowns(sessions: ReturnType<typeof buildSessions>) {
  return useQuery({
    queryKey: ['sessionCountdowns', sessions.map(s => s.key).join(',')],
    queryFn: () => {
      const now = Date.now();
      return sessions.map(s => {
        const ts   = f1Date(s.date, s.time).getTime();
        const diff = ts - now;
        const abs  = Math.abs(diff);
        return {
          key:  s.key,
          done: diff < -7_200_000,
          live: diff >= -7_200_000 && diff <= 0,
          days: Math.floor(abs / 86_400_000),
          hrs:  Math.floor(abs / 3_600_000) % 24,
          mins: Math.floor(abs / 60_000) % 60,
          secs: Math.floor(abs / 1_000) % 60,
          ts,
        };
      });
    },
    refetchInterval: 1000,
    staleTime: 0,
  });
}

export default function SessionTracker({ race }: { race: Race }) {
  const sessions    = buildSessions(race);
  const { data: cds } = useLiveCountdowns(sessions);
  const now = Date.now();

  const activeIdx = sessions.findIndex((s, i) => {
    const ts   = f1Date(s.date, s.time).getTime();
    const next = sessions[i + 1];
    const nts  = next ? f1Date(next.date, next.time).getTime() : Infinity;
    return ts > now || (ts <= now && nts > now);
  });

  const hasLive = sessions.some(s => {
    const ts = f1Date(s.date, s.time).getTime();
    return ts <= now && ts > now - 7_200_000;
  });

  const doneCount = sessions.filter(s => f1Date(s.date, s.time).getTime() < now - 7_200_000).length;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 36px', animation: 'fadeUpSlow 1s ease both 4s' }}>
      <div style={{ background: 'var(--paper-2)', border: '2px solid var(--ink)', borderTop: 'none' }}>
        {}
        <div style={{ padding: '14px 28px 12px', borderBottom: '1px solid var(--rule-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Race Weekend Sessions</span>
            {hasLive && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'var(--carbon)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', border: '1px solid var(--mercedes)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--mercedes)', display: 'inline-block', animation: 'blink 1s ease infinite' }} />
                ON TRACK
              </span>
            )}
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {doneCount} / {sessions.length} complete
          </span>
        </div>

        {}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sessions.length}, 1fr)`, overflowX: 'auto' }}>
          {sessions.map((s, i) => {
            const cd     = cds?.[i];
            const isDone = !!cd?.done;
            const isLive = !!cd?.live;
            const isNext = !isDone && !isLive && i === activeIdx;
            const dt     = f1Date(s.date, s.time);
            const dayStr = dt.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
            const tStr   = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const accent = s.isRace ? 'var(--mercedes)' : s.isSprint ? 'var(--mercedes)' : 'var(--ink-2)';

            return (
              <div key={s.key} style={{
                padding: '18px 16px 16px',
                borderRight: i < sessions.length - 1 ? '1px solid var(--rule-light)' : 'none',
                background: isLive ? 'var(--carbon)' : isNext ? 'rgba(39,244,210,0.05)' : isDone ? 'var(--paper-2)' : 'var(--paper)',
                borderTop: isLive ? '3px solid var(--mercedes)' : isNext ? '3px solid var(--mercedes)' : isDone ? '3px solid var(--gold)' : '3px solid transparent',
                minWidth: 120, transition: 'background 0.3s',
              }}>
                {}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: isLive ? '#fff' : accent, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {s.shortLabel}
                  {isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mercedes)', display: 'inline-block', animation: 'ferrariPulse 1s ease infinite' }} />}
                  {isNext && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mercedes)', display: 'inline-block', animation: 'ferrariPulse 1.4s ease infinite' }} />}
                  {isDone && <span style={{ fontSize: 9, color: 'var(--gold)' }}>✓</span>}
                </div>

                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 500, color: isLive ? '#fff' : 'var(--ink)', marginBottom: 10, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{s.label}</div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isLive ? 'rgba(255,255,255,0.55)' : 'var(--ink-3)', fontWeight: 500 }}>{dayStr}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: isLive ? '#fff' : 'var(--ink-2)', fontWeight: 600, marginTop: 2 }}>{tStr}</div>
                </div>

                {isLive ? (
                  <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--mercedes)', fontWeight: 700, animation: 'yellowBlink 2s ease infinite' }}>🔴 LIVE NOW</div>
                ) : isDone ? (
                  <div style={{ paddingTop: 8, borderTop: '1px solid var(--rule-light)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em' }}>COMPLETED</div>
                ) : cd ? (
                  <div style={{ paddingTop: 8, borderTop: `1px solid ${isNext ? 'rgba(39,244,210,0.2)' : 'var(--rule-light)'}` }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 3 }}>In</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: isNext ? 'var(--mercedes)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                      {cd.days > 0 ? `${cd.days}d ${pad(cd.hrs)}h` : cd.hrs > 0 ? `${pad(cd.hrs)}h ${pad(cd.mins)}m` : `${pad(cd.mins)}m ${pad(cd.secs)}s`}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function pad(n: number) { return String(n).padStart(2, '0'); }
