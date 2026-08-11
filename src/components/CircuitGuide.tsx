import { useQuery } from '@tanstack/react-query';
import { useNextRace } from '@/hooks/useF1Data';
import { getCircuitFacts } from '@/lib/circuitData';
import { getCircuitCategory, CATEGORY_META } from '@/lib/circuitTypes';
import { jolpicaFetch, racesOf, type RaceTableResponse } from '@/lib/f1Api';
import { getTeamColor, getFlag, isFavoriteTeam } from '@/lib/f1Types';
import { CACHE } from '@/lib/constants';

/** Past winners at this circuit, most recent first. */
function useCircuitWinners(circuitId: string | undefined) {
  return useQuery({
    queryKey: ['f1', 'circuitWinners', circuitId],
    enabled: !!circuitId,
    staleTime: CACHE.SCHEDULE,
    retry: 1,
    queryFn: async () => {
      const data = await jolpicaFetch<RaceTableResponse>(`/circuits/${circuitId}/results/1/`, { limit: 100 });
      return racesOf(data.MRData)
        .sort((a, b) => Number(b.season ?? 0) - Number(a.season ?? 0))
        .slice(0, 6);
    },
  });
}

function Rating({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{
            width: 14, height: 5,
            background: i <= value ? 'var(--mercedes)' : 'var(--rule-light)',
          }} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

export default function CircuitGuide() {
  const { data: race } = useNextRace();
  const circuitId = race?.Circuit.circuitId;
  const facts = circuitId ? getCircuitFacts(circuitId) : null;
  const { data: winners } = useCircuitWinners(circuitId);

  if (!race) return null;

  const cat = getCircuitCategory(circuitId ?? '');
  const meta = CATEGORY_META[cat];

  return (
    <section style={{ maxWidth: 1440, margin: '0 auto', padding: '30px 36px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
          Circuit <em style={{ fontStyle: 'italic', color: 'var(--mercedes)', fontWeight: 700 }}>Guide</em>
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {getFlag(race.Circuit.Location.country)} {race.Circuit.circuitName}
        </span>
      </div>

      <div style={{ border: '2px solid var(--ink)', background: 'var(--paper-2)', padding: '22px 24px 24px' }}>
        {!facts ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
            No circuit reference on file for {race.Circuit.circuitName} yet.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#fff', background: meta.color, padding: '4px 10px',
              }}>
                {meta.label}
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                {facts.note}
              </span>
            </div>

            {/* headline numbers */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(96px, 100%), 1fr))',
              gap: 18, paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--rule-light)',
            }}>
              <Stat label="Length"    value={<>{facts.lengthKm.toFixed(3)}<span style={{ fontSize: 10, fontWeight: 500 }}> km</span></>} />
              <Stat label="Laps"      value={facts.laps} />
              <Stat label="Distance"  value={<>{(facts.lengthKm * facts.laps).toFixed(0)}<span style={{ fontSize: 10, fontWeight: 500 }}> km</span></>} />
              <Stat label="Turns"     value={facts.turns} />
              <Stat label="DRS Zones" value={facts.drsZones} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 24 }}>
              {/* demands */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 2 }}>
                  Track Demands
                </div>
                <Rating label="Downforce"      value={facts.downforce} />
                <Rating label="Tyre stress"    value={facts.tyreStress} />
                <Rating label="Overtaking"     value={facts.overtaking} />
                {facts.lapRecord && (
                  <div style={{ marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--rule-light)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
                    Lap record <strong style={{ color: 'var(--ink)' }}>{facts.lapRecord.time}</strong> — {facts.lapRecord.driver}, {facts.lapRecord.year}
                  </div>
                )}
              </div>

              {/* past winners */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 10 }}>
                  Recent Winners Here
                </div>
                {!winners?.length ? (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>No previous running on record.</div>
                ) : winners.map(w => {
                  const res = w.Results?.[0];
                  if (!res) return null;
                  const fav = isFavoriteTeam(res.Constructor.constructorId);
                  return (
                    <div key={w.season + w.round} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px',
                      borderBottom: '1px solid var(--rule-light)',
                      background: fav ? 'rgba(39,244,210,0.07)' : 'transparent',
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', width: 34 }}>{w.season}</span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getTeamColor(res.Constructor.constructorId), flexShrink: 0 }} />
                      <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                        {res.Driver.givenName} {res.Driver.familyName}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        P{res.grid} start
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
