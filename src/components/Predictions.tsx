import { useState, useEffect, useMemo } from 'react';
import { useNextRace, useRaceSchedule, useSeasonResults, useDriverStandings } from '@/hooks/useF1Data';
import { useLiveRaceWindow } from '@/hooks/useLiveRace';
import { getTeamColor } from '@/lib/f1Types';
import { f1Date } from '@/lib/dateUtils';

const KEY = 'pitwall_predictions';

type Picks = [string, string, string];
interface Entry { picks: Picks; confirmed: boolean }
type Store = Record<string, Entry>;

const EXACT_PTS = 5;
const PODIUM_PTS = 2;
const SLOT_LABELS = ['🥇 First', '🥈 Second', '🥉 Third'];

/** Entries close five minutes before lights out. */
const LOCK_BEFORE_MS = 5 * 60_000;

const EMPTY: Picks = ['', '', ''];

/** Strip any duplicate driver, keeping the earliest slot it appears in. */
function dedupe(p: Picks): Picks {
  const seen = new Set<string>();
  return p.map(id => {
    if (!id || seen.has(id)) return '';
    seen.add(id);
    return id;
  }) as Picks;
}

function load(): Store {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, unknown>;
    const clean: Store = {};
    for (const [round, val] of Object.entries(raw)) {
      // legacy shape was a bare [p1,p2,p3] array — grandfather those in as confirmed
      if (Array.isArray(val) && val.length === 3) {
        clean[round] = { picks: dedupe(val as Picks), confirmed: true };
      } else if (val && typeof val === 'object' && Array.isArray((val as Entry).picks)) {
        const e = val as Entry;
        clean[round] = { picks: dedupe(e.picks), confirmed: !!e.confirmed };
      }
    }
    return clean;
  } catch { return {}; }
}

function save(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

interface RoundScore {
  round: number;
  name: string;
  points: number;
  exact: number;
  podium: number;
  filled: number;
}

export default function Predictions() {
  const { data: next } = useNextRace();
  const { data: races } = useRaceSchedule();
  const { data: rounds } = useSeasonResults(races);
  const { data: standings } = useDriverStandings();
  const liveRace = useLiveRaceWindow();

  const [store, setStore] = useState<Store>({});
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => { setStore(load()); }, []);

  /* Re-render on a timer so the cutoff closes the form without a refresh. */
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  const round = next?.round;
  const entry = (round && store[round]) || null;
  const picks: Picks = entry?.picks ?? EMPTY;
  const confirmed = !!entry?.confirmed;

  const raceStart = next ? f1Date(next.date, next.time).getTime() : 0;
  const cutoff = raceStart - LOCK_BEFORE_MS;
  const locked = !!next && now >= cutoff;
  const underWay = !!liveRace;

  const drivers = useMemo(
    () => (standings ?? []).map(s => ({
      id: s.Driver.driverId,
      name: `${s.Driver.givenName} ${s.Driver.familyName}`,
      color: getTeamColor(s.Constructors[0]?.constructorId ?? ''),
    })),
    [standings],
  );
  const nameOf = (id: string) => drivers.find(d => d.id === id)?.name ?? id;
  const colorOf = (id: string) => drivers.find(d => d.id === id)?.color ?? '#888';

  /* Only confirmed entries are graded. */
  const scored = useMemo<RoundScore[]>(() => {
    const out: RoundScore[] = [];
    for (const r of rounds) {
      const e = store[String(r.round)];
      if (!e?.confirmed) continue;
      const podium = r.results
        .filter(x => Number(x.position) <= 3)
        .sort((a, b) => Number(a.position) - Number(b.position))
        .map(x => x.Driver.driverId);
      if (podium.length < 3) continue;

      let points = 0, exact = 0, onPodium = 0, filled = 0;
      e.picks.forEach((id, i) => {
        if (!id) return;
        filled++;
        if (podium[i] === id) { points += EXACT_PTS; exact++; }
        else if (podium.includes(id)) { points += PODIUM_PTS; onPodium++; }
      });
      out.push({ round: r.round, name: r.raceName, points, exact, podium: onPodium, filled });
    }
    return out.sort((a, b) => b.round - a.round);
  }, [rounds, store]);

  const totals = useMemo(() => {
    const points = scored.reduce((n, s) => n + s.points, 0);
    const exact  = scored.reduce((n, s) => n + s.exact, 0);
    const podium = scored.reduce((n, s) => n + s.podium, 0);
    const filled = scored.reduce((n, s) => n + s.filled, 0);
    const best   = scored.reduce<RoundScore | null>((b, s) => (!b || s.points > b.points ? s : b), null);
    return {
      points, exact, podium, filled, races: scored.length,
      max: filled * EXACT_PTS,
      hitRate: filled ? ((exact + podium) / filled) * 100 : 0,
      best,
    };
  }, [scored]);

  if (!next) return null;

  const write = (e: Entry) => {
    if (!round) return;
    const nextStore = { ...store, [round]: e };
    setStore(nextStore);
    save(nextStore);
  };

  const setPick = (slot: number, id: string) => {
    const cur: Picks = [...picks] as Picks;
    if (id) cur.forEach((v, i) => { if (v === id && i !== slot) cur[i] = ''; });
    cur[slot] = id;
    write({ picks: cur, confirmed: false });
  };

  const optionsFor = (slot: number) =>
    drivers.filter(d => d.id === picks[slot] || !picks.includes(d.id));

  const complete = picks.every(Boolean);

  const confirm = () => {
    if (!complete || locked) return;
    write({ picks, confirmed: true });
    setFlash('Podium confirmed — locked in for this race.');
    setTimeout(() => setFlash(null), 2600);
  };

  const reopen = () => {
    if (locked) return;
    write({ picks, confirmed: false });
    setFlash('Entry reopened — confirm again to lock it in.');
    setTimeout(() => setFlash(null), 2600);
  };

  const statusLabel = underWay ? 'Race under way · entries closed'
    : locked ? 'Entries closed for this race'
    : confirmed ? 'Confirmed · editable until 5 min before lights out'
    : `Open until 5 min before lights out · ${next.raceName}`;

  return (
    <section style={{ maxWidth: 1440, margin: '0 auto', padding: '30px 36px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
          Your <em style={{ fontStyle: 'italic', color: 'var(--mercedes)', fontWeight: 700 }}>Podium Call</em>
        </h2>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: underWay || locked ? '#E8002D' : 'var(--ink-3)',
          display: 'inline-flex', alignItems: 'center', gap: 7,
        }}>
          {underWay && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8002D', animation: 'pulseDot 1.4s ease infinite' }} />}
          {statusLabel}
        </span>
      </div>

      <div style={{ border: '2px solid var(--ink)', background: 'var(--paper-2)', padding: '22px 24px 24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em', marginBottom: 18, lineHeight: 1.5 }}>
          Call the podium before the race. {EXACT_PTS} points for the right driver in the right place, {PODIUM_PTS} for the right driver in the wrong place.
          Only confirmed entries are graded. Saved in this browser only — nothing leaves your device.
        </div>

        {locked && !confirmed ? (
          <div style={{
            border: '1px solid var(--rule-light)', padding: '20px 18px', marginBottom: 20,
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', lineHeight: 1.6,
          }}>
            No confirmed entry for {next.raceName} — entries closed five minutes before lights out.
            Your next chance opens as soon as this race is done.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 14, marginBottom: 18 }}>
              {[0, 1, 2].map(i => {
                const disabled = locked || confirmed;
                return (
                  <div key={i}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 7 }}>
                      {SLOT_LABELS[i]}
                    </div>
                    {disabled ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', minHeight: 44,
                        border: `2px solid ${picks[i] ? 'var(--mercedes)' : 'var(--rule-light)'}`,
                        background: picks[i] ? 'rgba(39,244,210,0.07)' : 'transparent',
                        boxSizing: 'border-box',
                      }}>
                        {picks[i] && <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorOf(picks[i]), flexShrink: 0 }} />}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: picks[i] ? 'var(--ink)' : 'var(--ink-3)' }}>
                          {picks[i] ? nameOf(picks[i]) : '— no pick —'}
                        </span>
                      </div>
                    ) : (
                      <select
                        value={picks[i]}
                        onChange={e => setPick(i, e.target.value)}
                        aria-label={`Predicted position ${i + 1}`}
                        style={{
                          width: '100%', padding: '10px 12px', minHeight: 44,
                          fontFamily: 'var(--font-mono)', fontSize: 12,
                          background: 'var(--paper)', color: 'var(--ink)',
                          border: `2px solid ${picks[i] ? 'var(--mercedes)' : 'var(--rule-light)'}`,
                          cursor: 'pointer', boxSizing: 'border-box',
                        }}
                      >
                        <option value="">— pick a driver —</option>
                        {optionsFor(i).map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Confirm / reopen */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
              {!locked && !confirmed && (
                <button
                  onClick={confirm}
                  disabled={!complete}
                  style={{
                    background: complete ? 'var(--carbon)' : 'transparent',
                    color: complete ? 'var(--mercedes)' : 'var(--ink-3)',
                    border: `2px solid ${complete ? 'var(--mercedes)' : 'var(--rule-light)'}`,
                    padding: '11px 22px', minHeight: 44,
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    cursor: complete ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  {complete ? 'Confirm podium' : `Pick ${3 - picks.filter(Boolean).length} more`}
                </button>
              )}

              {confirmed && (
                <>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mercedes)',
                    border: '2px solid var(--mercedes)', background: 'rgba(39,244,210,0.1)',
                    padding: '10px 16px',
                  }}>
                    ✓ Entry confirmed
                  </span>
                  {!locked && (
                    <button
                      onClick={reopen}
                      style={{
                        background: 'none', border: '1px solid var(--ink-3)', color: 'var(--ink-2)',
                        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
                        textTransform: 'uppercase', padding: '9px 14px', minHeight: 40, cursor: 'pointer',
                      }}
                    >
                      Change picks
                    </button>
                  )}
                </>
              )}

              {flash && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--mercedes)', letterSpacing: '0.06em' }}>
                  {flash}
                </span>
              )}
            </div>
          </>
        )}

        {/* Season tally */}
        <div style={{ background: 'var(--carbon)', color: '#fff', border: '2px solid rgba(255,255,255,0.08)', borderTop: '4px solid var(--mercedes)', padding: '18px 20px 20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mercedes)', marginBottom: 16 }}>
            Season Scorecard
          </div>

          {totals.races === 0 ? (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
              No graded rounds yet. Confirm a podium above and it'll be scored automatically once the race finishes.
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(88px, 100%), 1fr))',
                gap: 16, paddingBottom: 18, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <Tile label="Points"    value={totals.points} sub={`of ${totals.max}`} accent />
                <Tile label="Exact"     value={totals.exact}  sub={`of ${totals.filled}`} />
                <Tile label="On podium" value={totals.podium} sub="wrong slot" />
                <Tile label="Hit rate"  value={`${totals.hitRate.toFixed(0)}%`} sub="picks that landed" />
                <Tile label="Races"     value={totals.races}  sub="graded" />
              </div>

              {totals.best && totals.best.points > 0 && (
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>
                  Best call so far — <strong style={{ color: 'var(--mercedes)', fontStyle: 'normal' }}>{totals.best.name}</strong>, {totals.best.points} points.
                </div>
              )}

              {scored.map(s => (
                <div key={s.round} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', width: 28, flexShrink: 0 }}>R{s.round}</span>
                  <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 12, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                  <span style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {Array.from({ length: s.exact }).map((_, i) => <Pip key={`e${i}`} color="var(--mercedes)" title="Exact" />)}
                    {Array.from({ length: s.podium }).map((_, i) => <Pip key={`p${i}`} color="#FFC906" title="On podium" />)}
                    {Array.from({ length: Math.max(s.filled - s.exact - s.podium, 0) }).map((_, i) => <Pip key={`m${i}`} color="rgba(255,255,255,0.15)" title="Missed" />)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: s.points > 0 ? 'var(--mercedes)' : 'rgba(255,255,255,0.3)', width: 34, textAlign: 'right', flexShrink: 0 }}>
                    {s.points}
                  </span>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14 }}>
                {[
                  { c: 'var(--mercedes)', l: 'Exact' },
                  { c: '#FFC906', l: 'Right driver, wrong slot' },
                  { c: 'rgba(255,255,255,0.15)', l: 'Missed' },
                ].map(k => (
                  <div key={k.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: k.c }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k.l}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Tile({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, lineHeight: 1, color: accent ? 'var(--mercedes)' : '#fff' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginTop: 5, textTransform: 'uppercase' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Pip({ color, title }: { color: string; title: string }) {
  return <span title={title} style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />;
}
