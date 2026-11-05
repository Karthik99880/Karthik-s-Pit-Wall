import { useEffect, useRef } from 'react';
import { useInView, useMotionValueEvent, useReducedMotion, useSpring } from 'motion/react';

export default function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 55, damping: 18 });

  useEffect(() => { if (inView) spring.set(value); }, [inView, value, spring]);
  useMotionValueEvent(spring, 'change', v => {
    if (ref.current) ref.current.textContent = v.toFixed(decimals);
  });

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {reduced ? value.toFixed(decimals) : (0).toFixed(decimals)}
    </span>
  );
}
