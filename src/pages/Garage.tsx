import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'motion/react';
import { lazy, Suspense } from 'react';
import Footer from '@/components/Footer';

const CarTeardown = lazy(() => import('@/components/CarTeardown'));
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useConstructorStandings, useDriverStandings, useLastRaceResults } from '@/hooks/useF1Data';
import { getCarPhoto, getDriverPortrait, getFanTeamId, getFanTeamName, getTeamColor, teamDrivers, type DriverStanding } from '@/lib/f1Types';
import { CACHE, SEASON_YEAR } from '@/lib/constants';

const EASE = [0.16, 1, 0.3, 1] as const;

const CSS = `
.gr-bay { position: relative; background: #0a0a0a; color: #f2ece0; overflow: hidden; padding: clamp(24px, 4vh, 48px) clamp(20px, 3vw, 56px) 0;
  min-height: min(82vh, 860px); display: flex; flex-direction: column; }
.gr-wall { position: absolute; inset: 0 0 24% 0; background:
  repeating-linear-gradient(90deg, transparent 0 118px, rgba(255,255,255,.035) 118px 120px),
  linear-gradient(#131313, #0d0e10); }
.gr-lights { position: absolute; top: 0; left: 8%; right: 8%; height: 5px; background: var(--mercedes);
  box-shadow: 0 0 60px 14px rgba(var(--mercedes-rgb), .45), 0 0 220px 80px rgba(var(--mercedes-rgb), .16); }
.gr-floor { position: absolute; left: 0; right: 0; bottom: 0; height: 24%; border-top: 1px solid rgba(var(--mercedes-rgb), .5);
  background: linear-gradient(rgba(var(--mercedes-rgb), .10), transparent 70%), #101113; }
.gr-ghost { position: absolute; left: 0; right: 0; top: 16%; text-align: center; font-family: var(--font-serif); font-style: italic; font-weight: 700;
  font-size: clamp(80px, 17vw, 300px); line-height: .9; letter-spacing: -0.04em; white-space: nowrap; color: var(--mercedes); opacity: .1; }
.gr-mono { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; }
.gr-scene { position: relative; flex: 1; min-height: 360px; margin-top: 12px; }
.gr-driver { position: absolute; bottom: 4%; height: 100%; width: auto; -webkit-mask-image: linear-gradient(#000 78%, transparent 97%); mask-image: linear-gradient(#000 78%, transparent 97%); }
.gr-car { position: absolute; left: 50%; bottom: 3%; width: min(74%, 1080px); filter: drop-shadow(0 30px 24px rgba(0,0,0,.7)); }
.gr-plate { position: absolute; top: 6%; }
.gr-boards { background: #0a0a0a; color: #f2ece0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 1px; border-top: 1px solid #23262a; }
.gr-board { background: #0d0e10; padding: 26px clamp(20px, 3vw, 40px) 30px; }
.gr-big { font-family: var(--font-mono); font-size: 44px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
.gr-news { max-width: 1440px; margin: 0 auto; padding: 40px 36px 20px; }
.gr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 0 32px; }
.gr-story { display: block; padding: 16px 0; border-top: 1px solid var(--rule-light); color: var(--ink); text-decoration: none; }
.gr-story:hover h3 { text-decoration: underline; text-decoration-color: var(--mercedes); text-decoration-thickness: 2px; text-underline-offset: 4px; }
.gr-lead { grid-column: 1 / -1; border-top: 2px solid var(--ink); }
@media (max-width: 760px) {
  .gr-driver { height: 70%; }
  .gr-plate { top: 0; }
  .gr-car { width: 96%; }
  .gr-news { padding: 32px 20px 12px; }
}
`;

interface Story { title: string; link: string; date: Date }

function useTeamNews(terms: string[]) {
  const all = useQuery({
    queryKey: ['news', 'f1'],
    staleTime: CACHE.SCHEDULE,
    retry: 1,
    queryFn: async (): Promise<Story[]> => {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error(`news ${res.status}`);
      const xml = new DOMParser().parseFromString(await res.text(), 'text/xml');
      return Array.from(xml.querySelectorAll('item')).map(item => ({
        title: item.querySelector('title')?.textContent?.trim() ?? '',
        link: item.querySelector('link')?.textContent?.trim() ?? '',
        date: new Date(item.querySelector('pubDate')?.textContent ?? ''),
      })).filter(s => s.title && s.link.startsWith('https://'));
    },
  });
  const mine = (all.data ?? []).filter(s => terms.some(t => t && s.title.toLowerCase().includes(t.toLowerCase())));
  return { ...all, mine };
}

function Plate({ d, side }: { d: DriverStanding; side: 'left' | 'right' }) {
  return (
    <div className="gr-plate" style={{ [side]: 'clamp(120px, 19%, 290px)', textAlign: side }}>
      <div className="gr-big" style={{ color: 'var(--mercedes)' }}>{d.Driver.permanentNumber ?? d.Driver.code}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#c7c1b4', marginTop: 8 }}>{d.Driver.givenName}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em' }}>{d.Driver.familyName}</div>
      <div className="gr-mono" style={{ color: '#8a8172', marginTop: 8 }}>P{d.position} · {d.points} pts · {d.wins} wins</div>
    </div>
  );
}

function Board({ title, children, i }: { title: string; children: React.ReactNode; i: number }) {
  return (
    <motion.div className="gr-board" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}>
      <div className="gr-mono" style={{ color: 'var(--mercedes)', fontWeight: 800, marginBottom: 18 }}>{title}</div>
      {children}
    </motion.div>
  );
}

export default function Garage() {
  const id = getFanTeamId();
  const name = getFanTeamName();
  useDocumentMeta(`My Garage · ${name} | Pit Wall F1`, `Your ${name} garage: car, drivers, season numbers and the latest headlines.`);

  const reduce = useReducedMotion();
  const { data: teams } = useConstructorStandings();
  const { data: standings } = useDriverStandings();
  const { data: last } = useLastRaceResults();

  const team = teams?.find(t => t.Constructor.constructorId === id);
  const pair = teamDrivers(standings ?? [], last?.results ?? [], id);
  const news = useTeamNews([name, ...pair.map(d => d.Driver.familyName)]);
  const stories = [...news.mine, ...(news.data ?? []).filter(s => !news.mine.includes(s))];

  const leaderPts = Number(teams?.[0]?.points ?? 0);
  const ahead = team && teams ? teams[teams.indexOf(team) - 1] : undefined;
  const [a, b] = pair;
  const total = Number(a?.points ?? 0) + Number(b?.points ?? 0);
  const share = total ? (Number(a?.points ?? 0) / total) * 100 : 50;
  const lastMine = (last?.results ?? []).filter(r => r.Constructor.constructorId === id);
  const rise = reduce ? 0 : 60;

  return (
    <div style={{ background: 'var(--paper)' }}>
      <style>{CSS}</style>

      <section className="gr-bay">
        <div className="gr-wall" /><div className="gr-lights" /><div className="gr-floor" />
        <div className="gr-ghost" aria-hidden>{name}</div>

        <div style={{ position: 'relative' }}>
          <div className="gr-mono" style={{ color: '#8a8172' }}>My Garage · Season {SEASON_YEAR}</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 4.6vw, 60px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 10 }}>
            Inside the <em style={{ color: 'var(--mercedes)', fontWeight: 700 }}>{name}</em> garage
          </h1>
        </div>

        <div className="gr-scene">
          {a && <Plate d={a} side="left" />}
          {b && <Plate d={b} side="right" />}
          {pair.map((d, i) => (
            <motion.img key={d.Driver.driverId} className="gr-driver" style={i ? { right: '1%' } : { left: '1%' }}
              src={getDriverPortrait(d.Driver, id)} alt={`${d.Driver.givenName} ${d.Driver.familyName}`}
              onError={e => { e.currentTarget.style.display = 'none'; }}
              initial={{ y: rise, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: EASE, delay: 0.35 + i * 0.15 }} />
          ))}
          <motion.img className="gr-car" src={getCarPhoto(id)} alt={`${name} ${SEASON_YEAR} car`}
            onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
            initial={{ x: reduce ? '-50%' : '-95%', opacity: 0 }} animate={{ x: '-50%', opacity: 1 }} transition={{ duration: 1, ease: EASE }} />
        </div>
      </section>

      <section className="gr-boards">
        <Board title="Constructors' championship" i={0}>
          {team ? (
            <>
              <div className="gr-big">P{team.position}<span style={{ fontSize: 16, fontWeight: 500, letterSpacing: 0, color: '#c7c1b4' }}> · {team.points} pts</span></div>
              <div className="gr-mono" style={{ color: '#8a8172', marginTop: 14, lineHeight: 1.9 }}>
                {team.wins} {team.wins === '1' ? 'win' : 'wins'} this season<br />
                {ahead
                  ? <>{Number(ahead.points) - Number(team.points)} pts behind {ahead.Constructor.name} · {leaderPts - Number(team.points)} off the lead</>
                  : <>Leading the championship</>}
              </div>
            </>
          ) : <div className="gr-mono" style={{ color: '#8a8172' }}>Standings loading…</div>}
        </Board>

        <Board title="Across the garage" i={1}>
          {a && b ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="gr-big" style={{ fontSize: 30 }}>{a.points}</span>
                <span className="gr-mono" style={{ color: '#8a8172' }}>points</span>
                <span className="gr-big" style={{ fontSize: 30 }}>{b.points}</span>
              </div>
              <div style={{ display: 'flex', height: 8, margin: '12px 0 10px', background: '#23262a' }}>
                <motion.div initial={{ width: '50%' }} whileInView={{ width: `${share}%` }} viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: EASE }} style={{ background: 'var(--mercedes)' }} />
              </div>
              <div className="gr-mono" style={{ display: 'flex', justifyContent: 'space-between', color: '#c7c1b4' }}>
                <span>{a.Driver.familyName} · P{a.position}</span><span>P{b.position} · {b.Driver.familyName}</span>
              </div>
            </>
          ) : <div className="gr-mono" style={{ color: '#8a8172' }}>Driver standings loading…</div>}
        </Board>

        <Board title={last?.race ? `Last time out · ${last.race.raceName}` : 'Last time out'} i={2}>
          {lastMine.length ? lastMine.map(r => (
            <div key={r.Driver.driverId} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '7px 0', borderBottom: '1px solid #23262a' }}>
              <span className="gr-big" style={{ fontSize: 24, width: 54 }}>{/^\d+$/.test(r.position) && r.status !== 'Retired' ? `P${r.position}` : 'DNF'}</span>
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700 }}>{r.Driver.familyName}</span>
              <span className="gr-mono" style={{ color: '#8a8172' }}>from P{r.grid} · +{r.points} pts</span>
            </div>
          )) : <div className="gr-mono" style={{ color: '#8a8172' }}>No result on file yet.</div>}
        </Board>
      </section>

      <Suspense fallback={null}><CarTeardown /></Suspense>

      <section className="gr-news">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
            The <em style={{ color: 'var(--mercedes)', fontWeight: 700 }}>Newsstand</em>
          </h2>
          <span className="gr-mono" style={{ color: 'var(--ink-3)' }}>
            {news.mine.length ? `${news.mine.length} on ${name} first, then the paddock` : `Nothing on ${name} right now · latest from the paddock`} · via Motorsport.com
          </span>
        </div>
        {news.isError && <div className="gr-mono" style={{ color: 'var(--ink-3)' }}>The newsstand is closed — the feed could not be reached.</div>}
        <div className="gr-grid">
          {stories.slice(0, 10).map((s, i) => (
            <a key={s.link} className={`gr-story${i ? '' : ' gr-lead'}`} href={s.link} target="_blank" rel="noopener noreferrer">
              <div className="gr-mono" style={{ color: 'var(--ink-3)', fontSize: 9, marginBottom: 8 }}>
                {isNaN(s.date.getTime()) ? '' : s.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: i ? 500 : 700, fontSize: i ? 19 : 'clamp(26px, 3.4vw, 42px)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                {s.title}
              </h3>
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
