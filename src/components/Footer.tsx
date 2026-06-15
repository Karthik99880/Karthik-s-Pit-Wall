import { useState } from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  const [clickCount, setClickCount] = useState(0);

  const handleClassifiedClick = () => {
    const newCount = clickCount + 1;
    if (newCount >= 7) {
      setClickCount(0);
      window.dispatchEvent(new CustomEvent('trigger-easter-egg'));
    } else {
      setClickCount(newCount);
      // Reset count after 2.5 seconds of inactivity
      const timer = setTimeout(() => setClickCount(0), 2500);
      return () => clearTimeout(timer);
    }
  };

  return (
    <footer style={{
      maxWidth: 1440, margin: '0 auto', padding: '48px 36px 36px',
      position: 'relative',
    }}>
      <div style={{ borderTop: '2px solid var(--ink)', paddingTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
              Karthik's <em style={{ fontStyle: 'italic', color: 'var(--mercedes)' }}>Pit Wall</em>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 4 }}>
              Personal F1 {year} Dashboard · Mercedes AMG Edition
            </div>
          </div>

          {/* Easter egg button (hidden trigger) */}
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={handleClassifiedClick}
          >
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--ink-3)',
              border: '1px solid var(--rule-light)', padding: '4px 10px',
              opacity: 0.4,
              transition: 'opacity 0.2s',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.4'; }}
            >
              🔒 Classified
            </div>
          </div>


          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--rule-light)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Silver Arrows · Race hard · {year}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Mercedes-AMG Petronas · Brackley Legend
          </span>
        </div>
      </div>
    </footer>
  );
}

