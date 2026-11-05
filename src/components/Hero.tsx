import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { INTRO_SECONDS, introPending } from '@/lib/intro';
import { EASE_OUT, SPRING_SOFT } from '@/lib/motion';

const TITLE = 'PIT WALL';

export default function Hero() {
  const [dateStr, setDateStr] = useState('');
  const [start] = useState(() => (introPending() ? INTRO_SECONDS : 0.15));
  const heroRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const f1X = useTransform(scrollYProgress, [0, 1], [0, 340]);
  const fade = useTransform(scrollYProgress, [0.25, 1], [1, 0.15]);

  useEffect(() => {
    const d = new Date();
    setDateStr(d.toLocaleDateString('en-GB', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase());
  }, []);

  return (
    <div ref={heroRef} style={{
      background: 'var(--paper)',
      padding: '52px clamp(16px, 4vw, 36px) 28px',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, animation: `fadeUpSlow 0.8s ease both ${start}s` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ink)', animation: 'checkerFadeIn 0.9s cubic-bezier(.2,.8,.2,1) both 0.5s' }}>
          <CheckerFlag />
          UNOFFICIAL FAN DASHBOARD · F1 {new Date().getFullYear()}
        </div>
        <div style={{ textAlign: 'right', animation: `fadeUpSlow 0.8s ease both ${start + 0.15}s` }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)', marginBottom: 4 }}>
            Mercedes Fan Edition · 2026
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            {dateStr}
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', marginBottom: 28, paddingBottom: 24 }}>
        <motion.h1 aria-label="Pit Wall F1" style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--ink)', ...(reduced ? {} : { y: titleY, opacity: fade }) }}>
          <span aria-hidden style={{ display: 'block', fontSize: 'clamp(56px, 9vw, 126px)', lineHeight: 1.1, overflow: 'hidden', paddingBottom: '0.05em' }}>
            {TITLE.split(' ').map((word, w) => (
              <span key={word} style={{ display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', marginRight: '0.22em', paddingBottom: '0.05em' }}>
                {word.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    style={{ display: 'inline-block' }}
                    initial={{ y: '115%', rotate: 8 }}
                    animate={{ y: '0%', rotate: 0 }}
                    transition={{ ...SPRING_SOFT, delay: start + (w * 3 + i) * 0.045 }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            ))}
          </span>
          <span aria-hidden style={{ display: 'block', fontSize: 'clamp(56px, 9vw, 126px)', fontStyle: 'italic', color: 'var(--mercedes)', lineHeight: 1.1, overflow: 'hidden', marginTop: '-0.05em', paddingBottom: '0.05em' }}>
            <motion.span style={{ display: 'inline-block', ...(reduced ? {} : { x: f1X }) }}>
              <motion.span
                style={{ display: 'inline-block' }}
                initial={{ x: '-140%', skewX: -24 }}
                animate={{ x: '0%', skewX: 0 }}
                transition={{ duration: 0.75, ease: EASE_OUT, delay: start + 0.42 }}
              >
                F1
              </motion.span>
            </motion.span>
          </span>
        </motion.h1>
        <motion.div
          style={{ position: 'absolute', left: 0, bottom: 0, height: 5, width: '100%', background: 'var(--mercedes)', originX: 0 }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: EASE_OUT, delay: start + 0.6 }}
        />
      </div>

      {}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--ink-2)', paddingTop: 20, borderTop: '1px solid var(--ink)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        animation: `fadeUpSlow 0.8s ease both ${start + 0.9}s`,
      }}>
        <span>Live Data · Auto-Refreshing · Unofficial Fan Hub</span>
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
