import { useState, useEffect } from 'react';

export interface SectionItem { id: string; n: string; label: string }


export default function SectionNav({ sections }: { sections: SectionItem[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');

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

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--paper)', borderBottom: '1px solid var(--rule-light)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 36px', display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {sections.map(s => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => jump(s.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
                padding: '12px 14px', minHeight: 44, background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: on ? 'var(--ink)' : 'var(--ink-3)',
                borderBottom: on ? '2px solid var(--mercedes)' : '2px solid transparent',
                transition: 'color 0.2s',
              }}
            >
              <span style={{ color: on ? 'var(--mercedes)' : 'var(--ink-3)' }}>{s.n}</span>
              {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
