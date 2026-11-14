import { useState, useEffect, useId, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useLenis } from 'lenis/react';
import { SPRING_SNAP } from '@/lib/motion';

export interface SectionItem { id: string; n: string; label: string }


export default function SectionNav({ sections }: { sections: SectionItem[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const layoutId = useId();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = rail.current;
    const btn = box?.querySelector<HTMLElement>('[data-on]');
    if (!box || !btn) return;
    box.scrollTo({ left: btn.offsetLeft - (box.clientWidth - btn.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

  useEffect(() => {
    let obs: IntersectionObserver | undefined;
    let timer: ReturnType<typeof setTimeout>;
    const attach = () => {
      const els = sections
        .map(s => document.getElementById(s.id))
        .filter((e): e is HTMLElement => !!e);
      if (!els.length) { timer = setTimeout(attach, 250); return; }
      obs = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
        { rootMargin: '-35% 0px -60% 0px', threshold: 0 },
      );
      els.forEach(el => obs!.observe(el));
    };
    timer = setTimeout(attach, 100);
    return () => { clearTimeout(timer); obs?.disconnect(); };
  }, [sections]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -56, duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--paper)', borderBottom: '1px solid var(--rule-light)' }}>
      <div ref={rail} style={{ maxWidth: 1440, margin: '0 auto', padding: '0 clamp(16px, 4vw, 36px)', display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', position: 'relative' }}>
        {sections.map(s => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => jump(s.id)}
              data-on={on ? '' : undefined}
              style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
                padding: '12px 14px', minHeight: 44, background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: on ? 'var(--ink)' : 'var(--ink-3)',
                transition: 'color 0.2s',
              }}
            >
              <span style={{ color: on ? 'var(--mercedes-ink)' : 'var(--ink-3)' }}>{s.n}</span>
              {s.label}
              {on && (
                <motion.span
                  layoutId={layoutId} transition={SPRING_SNAP} aria-hidden
                  style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'var(--mercedes)' }}
                />
              )}
            </button>
          );
        })}
      </div>
      {!reduced && (
        <motion.div
          aria-hidden
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'var(--mercedes)', scaleX: progress, originX: 0, pointerEvents: 'none' }}
        />
      )}
    </nav>
  );
}
