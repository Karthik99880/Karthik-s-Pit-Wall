
export default function Panel({
  title, accent, num, meta, children,
}: {
  title: string; accent: string; num: string; meta?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section id={`strat-${num}`} style={{ marginBottom: 36, scrollMarginTop: 80, animation: 'fadeUpSlow 0.8s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--ink-3)' }}>{num}</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
            {title} <em style={{ fontStyle: 'italic', color: 'var(--mercedes)', fontWeight: 700 }}>{accent}</em>
          </h2>
        </div>
        {meta && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>{meta}</span>
        )}
      </div>
      <div style={{ border: '2px solid var(--ink)', background: 'var(--paper-2)', padding: '22px 24px 24px' }}>
        {children}
      </div>
    </section>
  );
}
