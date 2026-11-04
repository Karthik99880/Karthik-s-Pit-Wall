import { useDriverStandings } from '@/hooks/useF1Data';
import { getDriverPhoto } from '@/lib/f1Types';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Tribute to the 2026 Drivers' Champion. Points and wins come from the live
 * standings so they stay right through the final round; everything else is
 * static and the banner still renders if the API is down.
 */
export default function ChampionBanner() {
  const { data: drivers } = useDriverStandings();
  const isMobile = useIsMobile();
  const kimi = drivers?.find(d => d.Driver.familyName.toLowerCase() === 'antonelli');

  return (
    <section
      aria-label="2026 World Champion"
      style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? '8px 16px 0' : '8px 36px 0' }}
    >
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--carbon)', color: '#fff',
        border: '2px solid var(--mercedes)',
        boxShadow: '0 0 40px rgba(39,244,210,0.22)',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 28,
        padding: isMobile ? '22px 18px' : '26px 32px',
        animation: 'fadeUpSlow 0.9s ease both 0.4s',
      }}>
        {/* checkered strip */}
        <div aria-hidden style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: isMobile ? 60 : 140, opacity: 0.12,
          background: `
            linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%),
            linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%)`,
          backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px',
          pointerEvents: 'none',
        }} />

        <img
          src={getDriverPhoto('Andrea Kimi', 'Antonelli')}
          alt="Kimi Antonelli"
          width={96} height={96}
          style={{
            width: isMobile ? 72 : 96, height: isMobile ? 72 : 96, flexShrink: 0,
            objectFit: 'cover', objectPosition: 'top', borderRadius: '50%',
            border: '3px solid var(--mercedes)', background: 'rgba(255,255,255,0.05)',
            position: 'relative',
          }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />

        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: isMobile ? 9 : 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--mercedes)', marginBottom: 8 }}>
            🏆 2026 Formula 1 World Champion
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', fontSize: isMobile ? 30 : 'clamp(32px, 4vw, 52px)', margin: 0 }}>
            Congratulations, <em style={{ color: 'var(--mercedes)' }}>Kimi</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: isMobile ? 13 : 15, lineHeight: 1.55, color: 'rgba(255,255,255,0.75)', marginTop: 10, maxWidth: 640 }}>
            Andrea Kimi Antonelli is the 2026 Drivers' Champion. From Bologna karting
            tracks to the top of the world, the kid in #12 did it in a Silver Arrow. Grazie, Kimi.
          </p>
        </div>

        {kimi && (
          <div style={{ display: 'flex', gap: 22, position: 'relative', flexShrink: 0 }}>
            <Stat label="Points" value={kimi.points} />
            <Stat label="Wins" value={kimi.wins} />
            <Stat label="Number" value={`#${kimi.Driver.permanentNumber ?? "12"}`} />
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: 'var(--mercedes)' }}>{value}</div>
    </div>
  );
}
