import { Link, useRoute } from 'wouter';
import { Gauge, FlaskConical } from 'lucide-react';


export default function SiteNav() {
  return (
    <nav style={{
      background: 'var(--carbon)', borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', gap: 4, padding: '0 36px', height: 40,
      position: 'relative', zIndex: 50,
    }}>
      <NavItem to="/" label="Pit Wall" icon={<Gauge size={13} />} exact />
      <NavItem to="/strategy" label="Strategy Room" icon={<FlaskConical size={13} />} />
    </nav>
  );
}

function NavItem({ to, label, icon, exact }: { to: string; label: string; icon: React.ReactNode; exact?: boolean }) {
  const [active] = useRoute(exact ? to : `${to}/*?`);
  const isActive = active;
  return (
    <Link
      href={to}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '0 16px', height: '100%',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none',
        color: isActive ? 'var(--mercedes)' : 'rgba(255,255,255,0.5)',
        borderBottom: isActive ? '2px solid var(--mercedes)' : '2px solid transparent',
        transition: 'color 0.15s',
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
