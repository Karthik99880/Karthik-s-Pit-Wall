import { useState } from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  const [memeHovered, setMemeHovered] = useState(false);

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

          {/* Easter egg meme button */}
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onMouseEnter={() => setMemeHovered(true)}
            onMouseLeave={() => setMemeHovered(false)}
          >
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--ink-3)',
              border: '1px solid var(--rule-light)', padding: '4px 10px',
              opacity: memeHovered ? 1 : 0.5,
              transition: 'opacity 0.2s',
            }}>
              🔒 Classified
            </div>

            {/* Meme popup */}
            {memeHovered && (
              <div style={{
                position: 'absolute',
                bottom: '120%',
                right: 0,
                width: 220,
                animation: 'hoverCardIn 0.2s ease both',
                zIndex: 999,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                border: '2px solid var(--mercedes)',
              }}>
                <img
                  src="/pitwall-meme.png"
                  alt="Pit Wall Classified"
                  style={{ width: '100%', display: 'block' }}
                />
                <div style={{
                  background: 'var(--carbon)',
                  padding: '6px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--mercedes)',
                  textAlign: 'center',
                }}>
                  Pit wall be like 🏎️
                </div>
              </div>
            )}
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

