import { useEffect, useState } from 'react';

export default function Hero() {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const d = new Date();
    setDateStr(d.toLocaleDateString('en-GB', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase());
  }, []);

  return (
    <div style={{
      background: 'var(--paper)',
      padding: '52px 36px 28px',
      maxWidth: 1440,
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {}
      {[18, 42, 68].map((top, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${top}%`, left: 0,
          height: 1, width: i === 1 ? 220 : i === 0 ? 160 : 120,
          background: 'linear-gradient(90deg, transparent 0%, var(--racing) 50%, transparent 100%)',
          animation: `speedLineSlow 5.5s ease-out infinite`,
          animationDelay: `${[1.8, 3.2, 2.4][i]}s`,
          pointerEvents: 'none',
        }} />
      ))}

      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, animation: 'fadeUpSlow 1s ease both 0.2s' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ink)', animation: 'checkerFadeIn 0.9s cubic-bezier(.2,.8,.2,1) both 0.5s' }}>
          <CheckerFlag />
          MERCEDES PETRONAS AMG · F1 {new Date().getFullYear()}
        </div>
        <div style={{ textAlign: 'right', animation: 'fadeUpSlow 1s ease both 0.7s' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)', marginBottom: 4 }}>
            Silver Arrows · 2026 Edition
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            {dateStr}
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', marginBottom: 28, paddingBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          <span style={{ display: 'block', fontSize: 'clamp(56px, 9vw, 126px)', lineHeight: 1.1, overflow: 'hidden', paddingBottom: '0.05em' }}>
            <span style={{ display: 'inline-block', animation: 'maskRevealUp 1.1s cubic-bezier(.2,.9,.25,1) both 0.9s' }}>
              MERCEDES
            </span>
          </span>
          <span style={{ display: 'block', fontSize: 'clamp(56px, 9vw, 126px)', fontStyle: 'italic', color: 'var(--mercedes)', lineHeight: 1.1, overflow: 'hidden', marginTop: '-0.05em', paddingBottom: '0.05em' }}>
            <span style={{ display: 'inline-block', animation: 'maskRevealUp 1.1s cubic-bezier(.2,.9,.25,1) both 1.4s' }}>
              Pit Wall
            </span>
          </span>
        </h1>
        <div style={{
          position: 'absolute', left: 0, bottom: 0,
          height: 5, width: '100%',
          background: 'linear-gradient(90deg, var(--mercedes), var(--carbon))',
          transform: 'scaleX(0)', transformOrigin: 'left',
          animation: 'underlineDraw 1.2s cubic-bezier(.3,.9,.3,1) both 2.2s',
        }} />
      </div>

      {}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--ink-2)', paddingTop: 20, borderTop: '1px solid var(--ink)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        animation: 'fadeUpSlow 1s ease both 2.8s',
      }}>
        <span>Live Data · Auto-Refreshing · Mercedes AMG Petronas Fan Hub</span>
        <LiveBadge />
      </div>
    </div>
  );
}

function CheckerFlag() {
  return (
    <div style={{
      display: 'inline-block', width: 42, height: 26, flexShrink: 0,
      background: `
        linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%),
        linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%)
      `,
      backgroundSize: '10px 10px',
      backgroundPosition: '0 0, 5px 5px',
      backgroundColor: '#000',
      animation: 'flagWave 3s ease-in-out infinite',
      transformOrigin: 'left center',
    }} />
  );
}

function LiveBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '8px 16px',
      background: 'var(--carbon)',
      color: '#fff', fontWeight: 700, letterSpacing: '0.2em',
      boxShadow: '0 0 20px rgba(39,244,210,0.3)',
      border: '2px solid var(--mercedes)',
    }}>
      <span style={{
        display: 'inline-block', width: 7, height: 7,
        background: 'var(--mercedes)', borderRadius: '50%',
        animation: 'blink 1.6s ease infinite',
      }} />
      TRACKSIDE · LIVE
    </div>
  );
}
