import { useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';

// data-inview releases the paused CSS animations inside (see index.css), so they play on arrival, not at page load.
export default function Reveal({ id, style, children }: { id?: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  return (
    <motion.div
      ref={ref} id={id} data-reveal="" data-inview={inView ? '' : undefined}
      style={{ position: 'relative', ...style }}
      initial={{ opacity: 0, y: 64 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, ease: EASE_OUT }}
    >
      <motion.div
        aria-hidden
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--mercedes)', originX: 0, zIndex: 2, pointerEvents: 'none' }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={inView ? { scaleX: [0, 1, 1], opacity: [1, 1, 0] } : undefined}
        transition={{ duration: 1.3, times: [0, 0.6, 1], ease: EASE_OUT }}
      />
      {children}
    </motion.div>
  );
}
