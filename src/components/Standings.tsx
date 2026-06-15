import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { useDriverStandings, useConstructorStandings, useLastRaceResults } from '@/hooks/useF1Data';
import { getTeamColor, getTeamDisplay, isFavoriteTeam, getNationalityFlag } from '@/lib/f1Types';
import type { DriverStanding, ConstructorStanding } from '@/lib/f1Types';

/* ─── hover card state ─────────────────────────────── */
type HoveredDriver = { driver: DriverStanding; rect: DOMRect };
type HoveredCtor = { ctor: ConstructorStanding; allDrivers: DriverStanding[]; rect: DOMRect };

/* ─── main component ───────────────────────────────── */
export default function Standings() {
  const { data: drivers, isLoading: dLoad } = useDriverStandings();
  const { data: constructors, isLoading: cLoad } = useConstructorStandings();
  const { data: lastRace, isLoading: rLoad } = useLastRaceResults();

  const [hovD, setHovD] = useState<HoveredDriver | null>(null);
  const [hovC, setHovC] = useState<HoveredCtor | null>(null);
  const [query, setQuery] = useState('');
  const [modalDriver, setModalDriver] = useState<DriverStanding | null>(null);

  const q = query.trim().toLowerCase();
  const filteredDrivers = (drivers ?? []).slice(0, 12).filter(d => {
    if (!q) return true;
    const team = getTeamDisplay(d.Constructors[0]?.constructorId ?? '', d.Constructors[0]?.name ?? '');
    return (
      `${d.Driver.givenName} ${d.Driver.familyName}`.toLowerCase().includes(q) ||
      (d.Driver.code ?? '').toLowerCase().includes(q) ||
      team.toLowerCase().includes(q)
    );
  });

  const onDriverEnter = useCallback((driver: DriverStanding, el: HTMLElement) => {
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
        <ColWrap
          title="Driver" subtitle="Championship" num="01"
          headerExtra={<SearchBox value={query} onChange={setQuery} />}
        >
          {dLoad ? <Skeleton /> : filteredDrivers.length === 0 ? (
            <div style={{ padding: '28px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
              No drivers match “{query}”.
            </div>
          ) : filteredDrivers.map((d, i) => {
            const color = getTeamColor(d.Constructors[0]?.constructorId ?? '');
            const isFav = isFavoriteTeam(d.Constructors[0]?.constructorId ?? '');
            const team = getTeamDisplay(d.Constructors[0]?.constructorId ?? '', d.Constructors[0]?.name ?? '');
            return (
              <DriverRow
                key={d.Driver.driverId}
                d={d} color={color} isFav={isFav} team={team} delay={i * 0.055}
                onEnter={onDriverEnter} onLeave={clearHov}
                onClick={() => setModalDriver(d)}
              />
            );
          })}
        </ColWrap>

        {/* ── Constructor Championship ── */}
        <ColWrap title="Constructor" subtitle="Championship" num="02">
          {cLoad ? <Skeleton /> : (constructors ?? []).map((c, i) => {
            const color = getTeamColor(c.Constructor.constructorId);
            const isFav = isFavoriteTeam(c.Constructor.constructorId);
            const name = getTeamDisplay(c.Constructor.constructorId, c.Constructor.name);
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
                const color = getTeamColor(r.Constructor.constructorId);
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
      {hovC && <CtorCard data={hovC} />}

      {modalDriver && <DriverModal d={modalDriver} onClose={() => setModalDriver(null)} />}
    </div>
  );
}

/* ─── Search box ───────────────────────────────────── */
function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative', marginTop: 12 }}>
      <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search driver / team…"
        style={{
          width: '100%', padding: '7px 26px 7px 28px',
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em',
          color: 'var(--ink)', background: 'var(--paper-2)',
          border: '1px solid var(--rule-light)', outline: 'none', borderRadius: 2,
        }}
      />
      {value && (
        <button
          aria-label="Clear search"
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex' }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

/* ─── Driver detail modal ──────────────────────────── */
function DriverModal({ d, onClose }: { d: DriverStanding; onClose: () => void }) {
  const color = getTeamColor(d.Constructors[0]?.constructorId ?? '');
  const isFav = isFavoriteTeam(d.Constructors[0]?.constructorId ?? '');
  const team = getTeamDisplay(d.Constructors[0]?.constructorId ?? '', d.Constructors[0]?.name ?? '');
  const natFlag = getNationalityFlag(d.Driver.nationality);
  const code = d.Driver.code ?? d.Driver.familyName.slice(0, 3).toUpperCase();
  const num = d.Driver.permanentNumber ?? '—';
  const pos = Number(d.position);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100001,
        background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        animation: 'fadeSlow 0.2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(440px, 100%)', background: '#111', color: '#fff',
          borderTop: `5px solid ${color}`, position: 'relative',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          animation: 'fadeUpSlow 0.3s cubic-bezier(.2,.9,.25,1) both',
        }}
      >
        {isFav && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(39,244,210,0.10) 0%,transparent 55%)', pointerEvents: 'none' }} />}

        <button
          aria-label="Close" onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', color: '#fff', padding: 6, display: 'flex', zIndex: 2 }}
        >
          <X size={16} />
        </button>

        <div style={{ padding: '26px 26px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            Championship · P{pos}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 800, lineHeight: 1.02 }}>
            {d.Driver.givenName} {d.Driver.familyName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{team}</span>
            <span style={{ fontSize: 18 }}>{natFlag}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{d.Driver.nationality}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '20px 26px 24px', gap: 14, position: 'relative' }}>
          <BigStat label="Points" value={d.points} accent={color} />
          <BigStat label="Wins" value={d.wins} />
          <BigStat label="Number" value={`#${num}`} />
          <BigStat label="Code" value={code} />
        </div>

        {isFav && (
          <div style={{ margin: '0 26px 22px', padding: '10px 14px', background: 'var(--carbon)', border: '1.5px solid var(--mercedes)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff', fontWeight: 800, boxShadow: '0 0 18px rgba(39,244,210,0.3)' }}>
            ★ Mercedes AMG Petronas · Brackley
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function BigStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: accent ?? '#fff', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

/* ─── Column wrapper ───────────────────────────────── */
function ColWrap({ title, subtitle, num, children, headerExtra }: { title: string; subtitle: string; num: string; children: React.ReactNode; headerExtra?: React.ReactNode }) {
  return (
    <div style={{ borderRight: '1px solid var(--rule-light)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 24px 18px', borderBottom: '2px solid var(--ink)', background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 5 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.24em', color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 5 }}>{num}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>{subtitle}</div>
        {headerExtra}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ─── Driver row ───────────────────────────────────── */
function DriverRow({ d, color, isFav, team, delay, onEnter, onLeave, onClick }: {
  d: DriverStanding; color: string; isFav: boolean; team: string; delay: number;
  onEnter: (d: DriverStanding, el: HTMLElement) => void;
  onLeave: () => void;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = Number(d.position);
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
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
        cursor: 'pointer',
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
  const gap = 10;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // prefer right side; fall back to left if it would overflow
  const left = rect.right + gap + cardW > vw
    ? Math.max(0, rect.left - cardW - gap)
    : rect.right + gap;
  // vertically center on the row; clamp within viewport
  const top = Math.min(Math.max(8, rect.top - cardH / 2 + rect.height / 2), vh - cardH - 8);
  return { left, top };
}

/* ─── Driver hover card ────────────────────────────── */
function DriverCard({ data: { driver: d, rect } }: { data: HoveredDriver }) {
  const color = getTeamColor(d.Constructors[0]?.constructorId ?? '');
  const isFav = isFavoriteTeam(d.Constructors[0]?.constructorId ?? '');
  const team = getTeamDisplay(d.Constructors[0]?.constructorId ?? '', d.Constructors[0]?.name ?? '');
  const natFlag = getNationalityFlag(d.Driver.nationality);
  const code = d.Driver.code ?? d.Driver.familyName.slice(0, 3).toUpperCase();
  const num = d.Driver.permanentNumber ?? '';
  const pos = Number(d.position);
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
        <Stat2 label="Points" value={d.points} accent={color} />
        <Stat2 label="Wins" value={d.wins} />
        <Stat2 label="Nat." value={`${natFlag}`} small />
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
  const color = getTeamColor(c.Constructor.constructorId);
  const isFav = isFavoriteTeam(c.Constructor.constructorId);
  const name = getTeamDisplay(c.Constructor.constructorId, c.Constructor.name);
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
        <Stat2 label="Wins" value={c.wins} />
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
