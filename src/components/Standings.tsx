import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDriverStandings, useConstructorStandings, useLastRaceResults } from '@/hooks/useF1Data';
import { getTeamColor, getTeamDisplay, isFavoriteTeam, getNationalityFlag } from '@/lib/f1Types';
import type { DriverStanding, ConstructorStanding } from '@/lib/f1Types';

/* ─── hover card state ─────────────────────────────── */
type HoveredDriver = { driver: DriverStanding; rect: DOMRect };
type HoveredCtor   = { ctor: ConstructorStanding; allDrivers: DriverStanding[]; rect: DOMRect };

/* ─── main component ───────────────────────────────── */
export default function Standings() {
  const { data: drivers,     isLoading: dLoad } = useDriverStandings();
  const { data: constructors,isLoading: cLoad } = useConstructorStandings();
  const { data: lastRace,    isLoading: rLoad } = useLastRaceResults();

  const [hovD, setHovD] = useState<HoveredDriver | null>(null);
  const [hovC, setHovC] = useState<HoveredCtor   | null>(null);

  const onDriverEnter  = useCallback((driver: DriverStanding, el: HTMLElement) => {
    setHovC(null);
    setHovD({ driver, rect: el.getBoundingClientRect() });
  }, []);
  const onCtorEnter = useCallback((ctor: ConstructorStanding, allDrivers: DriverStanding[], el: HTMLElement) => {
    setHovD(null);
    setHovC({ ctor, allDrivers, rect: el.getBoundingClientRect() });
  }, []);
  const clearHov = useCallback(() => { setHovD(null); setHovC(null); }, []);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '56px 36px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', border: '2px solid var(--ink)', background: 'var(--paper)' }}>

        {/* ── Driver Championship ── */}
        <ColWrap title="Driver" subtitle="Championship" num="01">
          {dLoad ? <Skeleton /> : (drivers ?? []).slice(0, 12).map((d, i) => {
            const color  = getTeamColor(d.Constructors[0]?.constructorId ?? '');
            const isFav = isFavoriteTeam(d.Constructors[0]?.constructorId ?? '');
            const team   = getTeamDisplay(d.Constructors[0]?.constructorId ?? '', d.Constructors[0]?.name ?? '');
            return (
              <DriverRow
                key={d.Driver.driverId}
                d={d} color={color} isFav={isFav} team={team} delay={i * 0.055}
                onEnter={onDriverEnter} onLeave={clearHov}
              />
            );
          })}
        </ColWrap>

        {/* ── Constructor Championship ── */}
        <ColWrap title="Constructor" subtitle="Championship" num="02">
          {cLoad ? <Skeleton /> : (constructors ?? []).map((c, i) => {
            const color  = getTeamColor(c.Constructor.constructorId);
            const isFav = isFavoriteTeam(c.Constructor.constructorId);
            const name   = getTeamDisplay(c.Constructor.constructorId, c.Constructor.name);
            const maxPts = Number((constructors ?? [])[0]?.points ?? 1);
            return (
              <CtorRow
                key={c.Constructor.constructorId}
                c={c} color={color} isFav={isFav} name={name}
                maxPts={maxPts} delay={i * 0.07}
                allDrivers={drivers ?? []}
                onEnter={onCtorEnter} onLeave={clearHov}
              />
            );
          })}
        </ColWrap>

        {/* ── Last Race Podium ── */}
        <ColWrap
          title={lastRace?.race?.raceName?.replace('Grand Prix', '').trim() ?? 'Last Race'}
          subtitle="Podium Results" num="03"
        >
          {rLoad ? <Skeleton /> : !lastRace?.race ? (
            <div style={{ padding: '32px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>No results yet</div>
          ) : (
            <>
              {(lastRace.results ?? []).slice(0, 3).map((r, i) => {
                const color  = getTeamColor(r.Constructor.constructorId);
                const isFav = isFavoriteTeam(r.Constructor.constructorId);
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={r.Driver.driverId} style={{
                    padding: '18px 24px', borderBottom: '1px solid var(--rule-light)',
                    display: 'flex', gap: 14, alignItems: 'center',
                    background: isFav ? 'rgba(255,242,0,0.08)' : 'transparent',
                    animation: `rowSlide 0.5s ease both ${i * 0.1}s`,
                  }}>
                    <span style={{ fontSize: 22 }}>{medals[i]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                        {r.Driver.givenName[0]}. {r.Driver.familyName}
                        {isFav && <MercedesTag />}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>
                        {getTeamDisplay(r.Constructor.constructorId, r.Constructor.name)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>+{r.points}p</div>
                      {r.Time && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>{r.Time.time}</div>}
                    </div>
                  </div>
                );
              })}

              {/* P4-P10 compact */}
              <div style={{ padding: '14px 24px 6px', borderBottom: '1px solid var(--rule-light)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10, fontWeight: 600 }}>Points · P4 – P10</div>
                {(lastRace.results ?? []).slice(3, 10).map((r, i) => {
                  const isFav = isFavoriteTeam(r.Constructor.constructorId);
                  return (
                    <div key={r.Driver.driverId} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,0.04)',
                      background: isFav ? 'rgba(39,244,210,0.06)' : 'transparent',
                      animation: `rowSlide 0.5s ease both ${(i + 3) * 0.06}s`,
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', width: 24 }}>P{r.position}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)', flex: 1 }}>
                        {r.Driver.givenName[0]}. {r.Driver.familyName}
                        {isFav && <span style={{ color: 'var(--mercedes)', marginLeft: 4, fontSize: 9 }}>★</span>}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', fontWeight: 600 }}>+{r.points}p</span>
                    </div>
                  );
                })}
              </div>

              {/* Fastest lap */}
              {(() => {
                const fl = (lastRace.results ?? []).find(r => r.FastestLap?.rank === '1');
                return fl ? (
                  <div style={{ padding: '14px 24px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 7, fontWeight: 600 }}>Fastest Lap</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{fl.Driver.givenName[0]}. {fl.Driver.familyName}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ferrari-red)', fontWeight: 700 }}>{fl.FastestLap?.Time.time}</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </>
          )}
        </ColWrap>
      </div>


      {/* Hover cards — rendered in document flow at fixed position */}

      {/* Hover cards — rendered in document flow at fixed position */}
      {hovD && <DriverCard data={hovD} />}
      {hovC && <CtorCard   data={hovC} />}
    </div>
  );
}

/* ─── Column wrapper ───────────────────────────────── */
function ColWrap({ title, subtitle, num, children }: { title: string; subtitle: string; num: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRight: '1px solid var(--rule-light)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 24px 18px', borderBottom: '2px solid var(--ink)', background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 5 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.24em', color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 5 }}>{num}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>{subtitle}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ─── Driver row ───────────────────────────────────── */
function DriverRow({ d, color, isFav, team, delay, onEnter, onLeave }: {
  d: DriverStanding; color: string; isFav: boolean; team: string; delay: number;
  onEnter: (d: DriverStanding, el: HTMLElement) => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = Number(d.position);
  return (
    <div
      ref={ref}
      onMouseEnter={() => ref.current && onEnter(d, ref.current)}
      onMouseLeave={onLeave}
      style={{
        display: 'flex', alignItems: 'stretch',
        borderBottom: '1px solid var(--rule-light)',
        background: isFav ? 'rgba(39,244,210,0.08)' : 'transparent',
        animation: `rowSlide 0.5s ease both ${delay}s`,
        outline: isFav ? '2px solid var(--mercedes)' : 'none',
        boxShadow: isFav ? 'inset 0 0 10px rgba(39,244,210,0.1)' : 'none',
        outlineOffset: -1,
        cursor: 'default',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ width: 4, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '13px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: pos <= 3 ? 17 : 14, fontWeight: 700, color: pos <= 3 ? 'var(--ink)' : 'var(--ink-3)', width: 28, flexShrink: 0 }}>P{pos}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {d.Driver.givenName[0]}. {d.Driver.familyName}
            {isFav && <MercedesTag />}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color, marginTop: 2, fontWeight: 600 }}>{team}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{d.points}</span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>pts</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Constructor row ──────────────────────────────── */
function CtorRow({ c, color, isFav, name, maxPts, delay, allDrivers, onEnter, onLeave }: {
  c: ConstructorStanding; color: string; isFav: boolean; name: string;
  maxPts: number; delay: number; allDrivers: DriverStanding[];
  onEnter: (c: ConstructorStanding, all: DriverStanding[], el: HTMLElement) => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const bar = maxPts > 0 ? Math.max(4, (Number(c.points) / maxPts) * 100) : 4;
  return (
    <div
      ref={ref}
      onMouseEnter={() => ref.current && onEnter(c, allDrivers, ref.current)}
      onMouseLeave={onLeave}
      style={{
        padding: '13px 24px', borderBottom: '1px solid var(--rule-light)',
        background: isFav ? 'rgba(39,244,210,0.08)' : 'transparent',
        animation: `rowSlide 0.5s ease both ${delay}s`,
        outline: isFav ? '2px solid var(--mercedes)' : 'none',
        boxShadow: isFav ? 'inset 0 0 10px rgba(39,244,210,0.1)' : 'none',
        outlineOffset: -1, cursor: 'default', transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>P{c.position}</span>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
            {name}{isFav && <MercedesTag />}
          </span>
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{c.points}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-3)', marginLeft: 3 }}>PTS</span>
        </div>
      </div>
      <div style={{ height: 3, background: 'var(--paper-3)', overflow: 'hidden', marginBottom: 5 }}>
        <div style={{ height: '100%', width: `${bar}%`, background: color, animation: `barGrowSlow 0.8s ease both ${delay}s`, transformOrigin: 'left' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c.wins} wins</div>
    </div>
  );
}

/* ─── hover card position helper ──────────────────── */
function cardPos(rect: DOMRect, cardW: number, cardH = 320) {
  // position: fixed uses viewport coords — never add scrollY
  const gap  = 10;
  const vw   = window.innerWidth;
  const vh   = window.innerHeight;
  // prefer right side; fall back to left if it would overflow
  const left = rect.right + gap + cardW > vw
    ? Math.max(0, rect.left - cardW - gap)
    : rect.right + gap;
  // vertically center on the row; clamp within viewport
  const top  = Math.min(Math.max(8, rect.top - cardH / 2 + rect.height / 2), vh - cardH - 8);
  return { left, top };
}

/* ─── Driver hover card ────────────────────────────── */
function DriverCard({ data: { driver: d, rect } }: { data: HoveredDriver }) {
  const color   = getTeamColor(d.Constructors[0]?.constructorId ?? '');
  const isFav   = isFavoriteTeam(d.Constructors[0]?.constructorId ?? '');
  const team    = getTeamDisplay(d.Constructors[0]?.constructorId ?? '', d.Constructors[0]?.name ?? '');
  const natFlag = getNationalityFlag(d.Driver.nationality);
  const code    = d.Driver.code ?? d.Driver.familyName.slice(0, 3).toUpperCase();
  const num     = d.Driver.permanentNumber ?? '';
  const pos     = Number(d.position);
  const { left, top } = cardPos(rect, 260, 230);

  return createPortal(
    <div style={{
      position: 'fixed', left, top, width: 260, zIndex: 99999,
      background: '#111', color: '#fff',
      borderTop: `4px solid ${color}`,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
      animation: 'hoverCardIn 0.18s cubic-bezier(0.2,0,0,1) both',
      pointerEvents: 'none',
    }}>
      {isFav && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,242,0,0.12) 0%,transparent 55%)', pointerEvents: 'none' }} />}

      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Driver · P{pos}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 700, lineHeight: 1.1 }}>
            {d.Driver.givenName}<br />{d.Driver.familyName}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>{team}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {num && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 34, fontWeight: 800, lineHeight: 1, color, opacity: 0.9 }}>#{num}</div>}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{code}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 18px 14px', gap: 10 }}>
        <Stat2 label="Points"      value={d.points}  accent={color} />
        <Stat2 label="Wins"        value={d.wins} />
        <Stat2 label="Nat."        value={`${natFlag}`} small />
      </div>

      {isFav && (
        <div style={{ margin: '0 18px 14px', padding: '8px 12px', background: 'var(--carbon)', border: '1.5px solid var(--mercedes)', fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', fontWeight: 700, boxShadow: '0 0 15px rgba(39,244,210,0.3)' }}>
          ★ Mercedes AMG Driver
        </div>
      )}
    </div>,
    document.body
  );
}

/* ─── Constructor hover card ───────────────────────── */
function CtorCard({ data: { ctor: c, allDrivers, rect } }: { data: HoveredCtor }) {
  const color       = getTeamColor(c.Constructor.constructorId);
  const isFav       = isFavoriteTeam(c.Constructor.constructorId);
  const name        = getTeamDisplay(c.Constructor.constructorId, c.Constructor.name);
  const teamDrivers = allDrivers.filter(d => d.Constructors.some(co => co.constructorId === c.Constructor.constructorId));
  const { left, top } = cardPos(rect, 280, 280);

  return createPortal(
    <div style={{
      position: 'fixed', left, top, width: 280, zIndex: 99999,
      background: '#111', color: '#fff',
      borderTop: `4px solid ${color}`,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
      animation: 'hoverCardIn 0.18s cubic-bezier(0.2,0,0,1) both',
      pointerEvents: 'none',
    }}>
      {isFav && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,242,0,0.12) 0%,transparent 55%)', pointerEvents: 'none' }} />}

      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Constructor · P{c.position}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700 }}>{name}</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: color, border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
      </div>

      <div style={{ padding: '10px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontWeight: 600 }}>Drivers</div>
        {teamDrivers.length > 0 ? teamDrivers.map(td => (
          <div key={td.Driver.driverId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>{td.Driver.givenName[0]}. {td.Driver.familyName}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>P{td.position} in drivers</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color }}>
              {td.points}<span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginLeft: 2 }}>pts</span>
            </div>
          </div>
        )) : <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>No driver data</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '12px 18px 14px', gap: 12 }}>
        <Stat2 label="Total Points" value={c.points} accent={color} />
        <Stat2 label="Wins"         value={c.wins} />
      </div>

      {isFav && (
        <div style={{ margin: '0 18px 14px', padding: '8px 12px', background: 'var(--carbon)', border: '1.5px solid var(--mercedes)', fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', fontWeight: 700, boxShadow: '0 0 15px rgba(39,244,210,0.3)' }}>
          ★ Mercedes AMG · Brackley
        </div>
      )}
    </div>,
    document.body
  );
}

/* ─── Shared atoms ─────────────────────────────────── */
function Stat2({ label, value, accent, small }: { label: string; value: string; accent?: string; small?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: small ? 11 : 16, fontWeight: 700, color: accent ?? '#fff' }}>{value}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ padding: '24px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 46, background: 'var(--paper-2)', marginBottom: 8, animation: 'fadeSlow 1s ease infinite alternate' }} />
      ))}
    </div>
  );
}

function MercedesTag() {
  return (
    <span style={{
      marginLeft: 8,
      padding: '2px 6px',
      background: 'var(--ink)',
      color: 'var(--mercedes)',
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      fontWeight: 800,
      letterSpacing: '0.12em',
      verticalAlign: 'middle',
      borderRadius: '2px',
      boxShadow: '0 0 10px rgba(39,244,210,0.2)',
    }}>
      AMG
    </span>
  );
}
