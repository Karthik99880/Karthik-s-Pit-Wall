import { useState, useEffect } from 'react';
import { getCarPhoto } from '@/lib/f1Types';

interface SilverArrowLoaderProps {
  loop?: boolean;
}

export default function SilverArrowLoader({ loop = false }: SilverArrowLoaderProps) {
  const [visible, setVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  
  const [telemetry, setTelemetry] = useState({
    speed: 312,
    gear: 7,
    ers: 84,
    lap: 1,
  });

  useEffect(() => {
    if (loop) return;

    
    const fadeTimeout = setTimeout(() => {
      setVisible(false);
    }, 3500);

    
    const removeTimeout = setTimeout(() => {
      setShouldRender(false);
    }, 4100);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, [loop]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        
        const speedChange = Math.floor(Math.random() * 13) - 6;
        let newSpeed = prev.speed + speedChange;
        if (newSpeed > 338) newSpeed = 338;
        if (newSpeed < 275) newSpeed = 275;

        
        let newGear = prev.gear;
        if (newSpeed > 320 && Math.random() > 0.4) newGear = 8;
        else if (newSpeed < 290 && Math.random() > 0.4) newGear = 6;
        else if (newSpeed >= 290 && newSpeed <= 320 && Math.random() > 0.6) newGear = 7;

        
        let newErs = prev.ers - (Math.random() > 0.7 ? 1 : 0);
        if (newErs < 12) newErs = 98;

        return {
          speed: newSpeed,
          gear: newGear,
          ers: newErs,
          lap: prev.lap,
        };
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    const lapInterval = setInterval(() => {
      setTelemetry((prev) => ({ ...prev, lap: prev.lap + 1 }));
    }, 4000);
    return () => clearInterval(lapInterval);
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

      {}
      <div style={{ position: 'relative', width: '100%', maxWidth: 700, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {}
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

        {}
        <div style={{
          animation: 'zoomAcross 4.0s cubic-bezier(0.25, 1, 0.3, 1) infinite',
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

      {}
      <div style={{
        marginTop: 10,
        background: 'rgba(22, 22, 26, 0.75)',
        border: '1px solid rgba(39, 244, 210, 0.15)',
        borderRadius: 6,
        padding: '10px 24px',
        display: 'flex',
        gap: 24,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: '#8a9099',
        letterSpacing: '0.08em',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
      }}>
        <div>
          LAP: <span style={{ color: '#fff', fontWeight: 700 }}>{String(telemetry.lap).padStart(2, '0')}</span>
        </div>
        <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
        <div>
          SPEED: <span style={{ color: 'var(--mercedes)', fontWeight: 700 }}>{telemetry.speed}</span> <span style={{ fontSize: 9 }}>KM/H</span>
        </div>
        <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
        <div>
          GEAR: <span style={{ color: '#fff', fontWeight: 700 }}>{telemetry.gear}</span>
        </div>
        <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>ERS:</span>
          <div style={{ width: 50, height: 6, background: '#222', borderRadius: 3, overflow: 'hidden', display: 'inline-flex' }}>
            <div style={{
              width: `${telemetry.ers}%`,
              height: '100%',
              background: telemetry.ers > 20 ? 'var(--mercedes)' : '#ff4a4a',
              transition: 'width 0.15s ease',
            }} />
          </div>
          <span style={{ color: '#fff', fontWeight: 700, minWidth: 26, textAlign: 'right' }}>{telemetry.ers}%</span>
        </div>
      </div>

      {}
      <div style={{
        marginTop: 24,
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
        <span style={{ fontSize: 9, color: 'var(--mercedes)', letterSpacing: '0.18em', opacity: 0.8 }}>
          {loop ? 'Streaming live session telemetry...' : 'Initializing Silver Arrow telemetry...'}
        </span>
      </div>
    </div>
  );
}
