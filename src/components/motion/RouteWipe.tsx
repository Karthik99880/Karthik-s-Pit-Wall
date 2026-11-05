import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocation } from 'wouter';
import { useLenis } from 'lenis/react';
import { EASE_IN_OUT } from '@/lib/motion';

const NAMES: Record<string, string> = { '/': 'Pit Wall', '/strategy': 'Strategy Room' };
const CHECKER = 'repeating-conic-gradient(#fff 0 25%, #0a0a0a 0 50%)';

// The route only swaps once the panel fully covers the screen, so pages never visibly jump.
export function useRouteWipe() {
  const [location] = useLocation();
  const [shown, setShown] = useState(location);
  const [covering, setCovering] = useState(false);
  const reduced = useReducedMotion();
  const lenis = useLenis();

  useEffect(() => {
    if (location === shown) return;
    if (reduced) { setShown(location); window.scrollTo(0, 0); return; }
    setCovering(true);
  }, [location, shown, reduced]);

  const onCovered = () => {
    setShown(location);
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    setTimeout(() => setCovering(false), 260);
  };

  const edge = { position: 'absolute', top: 0, bottom: 0, width: '12vw', minWidth: 48, background: CHECKER, backgroundSize: '32px 32px' } as const;

  const wipe = (
    <AnimatePresence>
      {covering && (
        <motion.div
          key="wipe" aria-hidden
          style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'var(--carbon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          initial={{ x: '-112%' }} animate={{ x: '0%' }} exit={{ x: '112%' }}
          transition={{ duration: 0.55, ease: EASE_IN_OUT }}
          onAnimationComplete={def => { if ((def as { x?: string }).x === '0%') onCovered(); }}
        >
          <div style={{ ...edge, left: '100%' }} />
          <div style={{ ...edge, right: '100%' }} />
          <motion.span
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 800, fontSize: 'clamp(40px, 8vw, 104px)', color: 'var(--mercedes)', letterSpacing: '-0.02em' }}
          >
            {NAMES[location] ?? 'Pit Wall'}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { shown, wipe };
}
