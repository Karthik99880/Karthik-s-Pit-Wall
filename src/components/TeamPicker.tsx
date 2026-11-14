import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useConstructorStandings, useDriverStandings, useLastRaceResults } from '@/hooks/useF1Data';
import { getCarPhoto, getDriverPortrait, getTeamColor, getTeamDisplay, teamDrivers, type DriverStanding } from '@/lib/f1Types';
import { FAVOURITE_TEAM, SEASON_YEAR } from '@/lib/constants';

const EASE = [0.16, 1, 0.3, 1] as const;

export function inkOn(hex: string): string {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.32 ? '#0a0a0a' : '#ffffff';
}

const CSS = `
.tp { position: fixed; inset: 0; z-index: 900; background: #0a0a0a; color: #f2ece0; display: grid;
  grid-template-columns: minmax(320px, 32%) 1fr; overflow: hidden; }
.tp-side { display: flex; flex-direction: column; padding: clamp(20px, 4vh, 44px) clamp(20px, 2.6vw, 40px);
  border-right: 1px solid #23262a; min-height: 0; }
.tp-list { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; margin: 2vh 0; }
.tp-row { position: relative; display: grid; grid-template-columns: 30px 1fr auto; align-items: baseline; gap: 10px;
  flex: 0 1 58px; min-height: 34px; padding: 0 0 0 16px; background: none; border: 0; border-bottom: 1px solid #1d1d1d;
  color: #8a8172; text-align: left; cursor: pointer; align-content: center; transition: color .25s; }
.tp-row[aria-pressed="true"] { color: #f2ece0; }
.tp-row:focus-visible { outline: 2px solid var(--tc); outline-offset: -2px; }
.tp-name { font-family: var(--font-serif); font-size: clamp(19px, 3.3vh, 32px); font-weight: 500; letter-spacing: -0.015em;
  line-height: 1; transition: transform .35s cubic-bezier(.16,1,.3,1); }
.tp-row[aria-pressed="true"] .tp-name { transform: translateX(8px); font-style: italic; }
.tp-mono { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; }
.tp-stage { position: relative; display: flex; flex-direction: column; padding: clamp(20px, 4vh, 44px) clamp(20px, 3.4vw, 56px);
  min-width: 0; min-height: 0; overflow: hidden; }
.tp-word { font-family: var(--font-serif); font-style: italic; font-weight: 700; line-height: 0.86; letter-spacing: -0.035em;
  font-size: clamp(64px, 12.5vw, 230px); white-space: nowrap; }
.tp-center { position: relative; flex: 1; min-height: 0; }
.tp-drivers { position: absolute; top: 5%; right: -2%; bottom: 9%; display: flex; justify-content: flex-end; overflow: hidden;
  -webkit-mask-image: linear-gradient(#000 72%, transparent); mask-image: linear-gradient(#000 72%, transparent); }
.tp-driver { height: 160%; width: auto; flex-shrink: 0; }
.tp-driver + .tp-driver { margin-left: -9%; }
.tp-car { position: absolute; left: -4%; bottom: -1%; width: min(92%, 1080px); aspect-ratio: 800 / 230; object-fit: contain;
  filter: drop-shadow(0 26px 22px rgba(0,0,0,.65)); }
.tp-foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.tp-cta { font-family: var(--font-mono); font-size: 12px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;
  border: 0; padding: 18px 26px; cursor: pointer; display: inline-flex; gap: 14px; align-items: center; }
.tp-cta:focus-visible, .tp-skip:focus-visible { outline: 2px solid #f2ece0; outline-offset: 3px; }
.tp-cta span { transition: transform .3s cubic-bezier(.16,1,.3,1); }
.tp-cta:hover span { transform: translateX(6px); }
.tp-skip { background: none; border: 1px solid #3a3d42; color: #c7c1b4; cursor: pointer; padding: 15px 18px; font-size: 12px; font-weight: 700;
  display: flex; justify-content: space-between; gap: 12px; transition: color .25s, border-color .25s; }
.tp-skip:hover { color: #f2ece0; border-color: #f2ece0; }
@media (max-width: 860px) {
  .tp { grid-template-columns: 1fr; grid-template-rows: auto 1fr; overflow-y: auto; }
  .tp-stage { order: -1; position: sticky; top: 0; z-index: 2; background: #0a0a0a; border-bottom: 1px solid #23262a; }
  .tp-side { border-right: 0; }
  .tp-row { flex-basis: 48px; }
  .tp-center { min-height: 50vh; }
  .tp-car { width: 88%; }
  .tp-cta { width: 100%; justify-content: space-between; }
}
`;

function DriverCard({ d, color, index }: { d: DriverStanding; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.12 + index * 0.07 }}
      style={{ display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <div className="tp-mono" style={{ color, fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
        {d.Driver.permanentNumber ?? d.Driver.code}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#c7c1b4' }}>{d.Driver.givenName}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {d.Driver.familyName}
        </div>
      </div>
    </motion.div>
  );
}

export default function TeamPicker({ onPick }: { onPick: (constructorId: string) => void }) {
  const { data: teams, isPending } = useConstructorStandings();
  const { data: drivers } = useDriverStandings();
  const { data: last } = useLastRaceResults();
  const [activeId, setActiveId] = useState<string>();
  const reduce = useReducedMotion();

  const team = teams?.find(t => t.Constructor.constructorId === activeId) ?? teams?.[0];
  const id = team?.Constructor.constructorId ?? '';
  const color = getTeamColor(id);
  const name = team ? getTeamDisplay(id, team.Constructor.name) : '';
  const pair = useMemo(
    () => teamDrivers(drivers ?? [], last?.results ?? [], id),
    [drivers, last, id],
  );

  useEffect(() => {
    teams?.forEach(t => { new Image().src = getCarPhoto(t.Constructor.constructorId); });
  }, [teams]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const slide = reduce ? 0 : 1;

  return (
    <div className="tp" role="dialog" aria-modal="true" aria-label="Choose your team" style={{ ['--tc' as string]: color }}>
      <style>{CSS}</style>

      <div className="tp-side">
        <div className="tp-mono" style={{ color: '#8a8172' }}>Pit Wall · Season {SEASON_YEAR}</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4.4vh, 44px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 12, textWrap: 'balance' }}>
          Whose garage are <em style={{ color, fontWeight: 700, transition: 'color .4s' }}>you</em> in?
        </h1>

        <div className="tp-list">
          {isPending && <div className="tp-mono" style={{ color: '#8a8172' }}>Loading the grid…</div>}
          {teams?.map(t => {
            const tid = t.Constructor.constructorId;
            const on = tid === id;
            return (
              <button
                key={tid} type="button" className="tp-row" aria-pressed={on}
                onMouseEnter={() => setActiveId(tid)} onFocus={() => setActiveId(tid)}
                onClick={() => (on ? onPick(tid) : setActiveId(tid))}
              >
                {on && (
                  <motion.span layoutId="tp-bar" transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                    style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 4, background: getTeamColor(tid) }} />
                )}
                <span className="tp-mono">P{t.position}</span>
                <span className="tp-name">{getTeamDisplay(tid, t.Constructor.name)}</span>
                <span className="tp-mono">{t.points} pts</span>
              </button>
            );
          })}
        </div>

        <button type="button" className="tp-skip tp-mono" onClick={() => onPick(FAVOURITE_TEAM)}>
          <span>Not picking a side? Skip</span><span aria-hidden>→</span>
        </button>
      </div>

      <div className="tp-stage">
        <motion.div aria-hidden animate={{ backgroundColor: color }} transition={{ duration: 0.6 }}
          style={{ position: 'absolute', inset: 0, opacity: 0.42, maskImage: 'radial-gradient(ellipse 70% 60% at 68% 46%, #000, transparent 72%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 68% 46%, #000, transparent 72%)' }} />

        {team && (
          <>
            <div className="tp-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={id} className="tp-mono" style={{ color: '#c7c1b4', marginBottom: 14 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  Constructors P{team.position} · {team.points} pts · {team.wins} {team.wins === '1' ? 'win' : 'wins'}
                </motion.div>
              </AnimatePresence>

              <div aria-hidden style={{ overflow: 'hidden', paddingBottom: '0.14em', marginBottom: '-0.14em', opacity: 0.2 }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div key={id} className="tp-word" style={{ color }}
                    initial={{ y: `${slide * 105}%` }} animate={{ y: 0 }} exit={{ y: `${slide * -105}%`, opacity: 0 }}
                    transition={{ duration: 0.55, ease: EASE }}>
                    {name}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="tp-drivers" key={id}>
                {pair.map((d, i) => (
                  <motion.img key={d.Driver.driverId} className="tp-driver" alt={`${d.Driver.givenName} ${d.Driver.familyName}`}
                    src={getDriverPortrait(d.Driver, id)} onError={e => { e.currentTarget.style.display = 'none'; }}
                    initial={{ y: slide * 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.12 }} />
                ))}
              </div>

              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img key={id} className="tp-car" src={getCarPhoto(id)} alt={`${name} ${SEASON_YEAR} car`}
                  onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
                  initial={{ x: slide * 260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: slide * -320, opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }} />
              </AnimatePresence>
            </div>

            <div className="tp-foot" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 'clamp(18px, 3vw, 44px)', flexWrap: 'wrap', minHeight: 48 }}>
                {pair.map((d, i) => <DriverCard key={d.Driver.driverId} d={d} color={color} index={i} />)}
              </div>
              <motion.button type="button" className="tp-cta" onClick={() => onPick(id)}
                animate={{ backgroundColor: color, color: inkOn(color) }} transition={{ duration: 0.4 }} whileTap={{ scale: 0.97 }}>
                Enter with {name} <span aria-hidden>→</span>
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TeamRush({ team, onCovered, onDone }: { team: string; onCovered: () => void; onDone: () => void }) {
  const color = getTeamColor(team);
  const [leaving, setLeaving] = useState(false);

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 950, overflow: 'hidden', pointerEvents: 'none' }}>
      <motion.div
        initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
        animate={{ clipPath: leaving ? 'inset(0% 0% 0% 100%)' : 'inset(0% 0% 0% 0%)' }}
        transition={{ duration: 0.7, delay: leaving ? 0.25 : 0, ease: [0.65, 0, 0.35, 1] }}
        onAnimationComplete={() => { if (leaving) onDone(); else { onCovered(); setLeaving(true); } }}
        style={{ position: 'absolute', inset: 0, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {[18, 31, 67, 82].map((top, i) => (
          <motion.span key={top}
            initial={{ x: '-100%' }} animate={{ x: '160%' }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: 'linear', repeat: 1 }}
            style={{ position: 'absolute', top: `${top}%`, left: 0, width: '70%', height: i % 2 ? 2 : 1, background: color, opacity: 0.7 }} />
        ))}
        <div className="tp-word" style={{ color, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(64px, 15vw, 280px)', letterSpacing: '-0.035em', whiteSpace: 'nowrap' }}>
          {getTeamDisplay(team, team)}
        </div>
      </motion.div>
      <motion.img src={getCarPhoto(team)} alt=""
        initial={{ x: '-70vw' }} animate={{ x: '125vw' }}
        transition={{ duration: 1.5, ease: [0.5, 0, 0.3, 1] }}
        style={{ position: 'absolute', left: 0, top: '50%', width: 'min(64vw, 1100px)', marginTop: 'max(-9vw, -160px)', filter: 'drop-shadow(-40px 0 30px rgba(0,0,0,.5))' }} />
    </div>
  );
}
