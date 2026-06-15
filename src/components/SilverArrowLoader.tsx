import { useState, useEffect } from 'react';
import { getCarPhoto } from '@/lib/f1Types';

export default function SilverArrowLoader() {
  const [visible, setVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Fade out after 3.5 seconds
    const fadeTimeout = setTimeout(() => {
      setVisible(false);
    }, 3500);

    // Remove from DOM after transition completes (0.6s fade)
    const removeTimeout = setTimeout(() => {
      setShouldRender(false);
    }, 4100);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#070707',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes zoomAcross {
          0% { transform: translateX(-150%) scaleX(0.95); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(150%) scaleX(1.05); opacity: 0; }
        }
        @keyframes lineSpread {
          0% { width: 0%; opacity: 0; }
          30% { opacity: 0.8; }
          100% { width: 90%; opacity: 0; }
        }
        @keyframes textGlow {
          0%, 100% { opacity: 0.6; text-shadow: 0 0 5px rgba(39, 244, 210, 0.2); }
          50% { opacity: 1; text-shadow: 0 0 15px rgba(39, 244, 210, 0.7); }
        }
      `}</style>

      {/* Loading animation container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 700, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Speed lines */}
        <div style={{
          position: 'absolute',
          height: 2,
          background: 'linear-gradient(90deg, transparent, var(--mercedes), transparent)',
          animation: 'lineSpread 3.0s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
          top: '46%',
        }} />
        <div style={{
          position: 'absolute',
          height: 1.5,
          background: 'linear-gradient(90deg, transparent, #fff, transparent)',
          animation: 'lineSpread 3.0s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
          animationDelay: '0.3s',
          top: '53%',
        }} />

        {/* Mercedes F1 Car Photo */}
        <div style={{
          animation: 'zoomAcross 3.6s cubic-bezier(0.25, 1, 0.3, 1) forwards',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          filter: 'drop-shadow(0 10px 25px rgba(39, 244, 210, 0.4))',
        }}>
          <img 
            src={getCarPhoto('mercedes')} 
            alt="Silver Arrow" 
            style={{ width: 280, height: 'auto', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Glow text */}
      <div style={{
        marginTop: 20,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#fff',
        animation: 'textGlow 1.8s ease-in-out infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}>
        <span>Karthik's Pit Wall</span>
        <span style={{ fontSize: 9, color: 'var(--mercedes)', letterSpacing: '0.18em', opacity: 0.8 }}>Initializing Silver Arrow telemetry...</span>
      </div>
    </div>
  );
}
