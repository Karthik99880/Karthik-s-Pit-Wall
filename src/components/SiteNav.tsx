import { Link, useRoute } from 'wouter';
import { Gauge, FlaskConical, Radio } from 'lucide-react';
import { useLiveRaceWindow } from '@/hooks/useLiveRace';

function LiveDot() {
  return (
    <span style={{
      width: 6, height: 6, borderRadius: '50%', background: '#ff3b3b',
      display: 'inline-block', animation: 'pulseDot 1.4s ease infinite',
      boxShadow: '0 0 6px #ff3b3b', flexShrink: 0,
    }} />
  );
}

export default function SiteNav() {
  const liveRace = useLiveRaceWindow();
  return (
    <nav style={{
      background: 'var(--carbon)', borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', gap: 4, padding: '0 36px', height: 40,
      position: 'relative', zIndex: 50,
    }}>
      <NavItem to="/" label="Pit Wall" icon={<Gauge size={13} />} exact />
      <NavItem to="/strategy" label="Strategy Room" icon={<FlaskConical size={13} />} />
      <NavItem to="/raceday" label="Race Day" icon={<Radio size={13} />} badge={liveRace ? <LiveDot /> : undefined} />
    </nav>
  );
}

function NavItem({ to, label, icon, exact, badge }: { to: string; label: string; icon: React.ReactNode; exact?: boolean; badge?: React.ReactNode }) {
  const [active] = useRoute(exact ? to : `${to}/*?`);
  return (
    <Link
      href={to}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '0 16px', height: '100%',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none',
        color: active ? 'var(--mercedes)' : 'rgba(255,255,255,0.5)',
        borderBottom: active ? '2px solid var(--mercedes)' : '2px solid transparent',
        transition: 'color 0.15s',
      }}
    >
      {icon}
      {label}
      {badge}
    </Link>
  );
}
