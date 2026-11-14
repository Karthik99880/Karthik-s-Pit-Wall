import { getFanTeamName } from '@/lib/f1Types';
import { Link, useRoute } from 'wouter';
import { motion } from 'motion/react';
import { SPRING_SNAP } from '@/lib/motion';
// Race Day is switched off for now. To bring it back, restore these imports,
// the LiveDot helper below, the liveRace hook call and the nav item.
// import { Radio } from 'lucide-react';
// import { useLiveRaceWindow } from '@/hooks/useLiveRace';

/*
function LiveDot() {
  return (
    <span style={{
      width: 6, height: 6, borderRadius: '50%', background: '#ff3b3b',
      display: 'inline-block', animation: 'pulseDot 1.4s ease infinite',
      boxShadow: '0 0 6px #ff3b3b', flexShrink: 0,
    }} />
  );
}
*/

export default function SiteNav() {
  // const liveRace = useLiveRaceWindow();
  return (
    <nav style={{
      background: 'var(--carbon)', borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', gap: 0, padding: '0 clamp(6px, 4vw, 36px)', height: 40,
      position: 'relative', zIndex: 50, overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      <NavItem to="/" label="Pit Wall" exact />
      <NavItem to="/strategy" label="Strategy Room" />
      <NavItem to="/garage" label="My Garage" />
      {/* <NavItem to="/raceday" label="Race Day" icon={<Radio size={13} />} badge={liveRace ? <LiveDot /> : undefined} /> */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event('pitwall:pick'))}
        style={{
          marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 10px', whiteSpace: 'nowrap', flexShrink: 0,
          background: 'none', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
        }}
      >
        <span style={{ width: 8, height: 8, background: 'var(--mercedes)' }} />
        <span className="nav-team">{getFanTeamName()} · Change </span>Team
      </button>
    </nav>
  );
}

const NAV_LAYOUT_ID = 'site-nav-indicator';

function NavItem({ to, label, icon, exact, badge }: { to: string; label: string; icon?: React.ReactNode; exact?: boolean; badge?: React.ReactNode }) {
  const [active] = useRoute(exact ? to : `${to}/*?`);
  return (
    <Link
      href={to}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flexShrink: 0,
        position: 'relative', padding: '0 clamp(8px, 2.4vw, 16px)', height: '100%',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        letterSpacing: 'min(0.18em, 0.35vw)', textTransform: 'uppercase', textDecoration: 'none',
        color: active ? 'var(--mercedes)' : 'rgba(255,255,255,0.5)',
        transition: 'color 0.15s',
      }}
    >
      {icon}
      {label}
      {badge}
      {active && (
        <motion.span
          layoutId={NAV_LAYOUT_ID} transition={SPRING_SNAP} aria-hidden
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'var(--mercedes)' }}
        />
      )}
    </Link>
  );
}
