import { useEffect, useState } from 'react';

/**
 * Hidden Easter egg — reveals the meme when the Konami code is entered:
 *   ↑ ↑ ↓ ↓ ← → ← → B A
 * No visible hint anywhere; effectively impossible to stumble on by accident.
 */
const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export default function EasterEgg() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let progress = 0;
    const onKey = (e: KeyboardEvent) => {
      // ignore typing inside inputs so it never fires while searching
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === KONAMI[progress] ? progress + 1 : (key === KONAMI[0] ? 1 : 0);
      if (progress === KONAMI.length) {
        progress = 0;
        setOpen(true);
      }
    };

    const handleCustomTrigger = () => {
      setOpen(true);
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('trigger-easter-egg', handleCustomTrigger);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('trigger-easter-egg', handleCustomTrigger);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 200000,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 22, padding: 24, cursor: 'pointer',
        animation: 'fadeSlow 0.25s ease both',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--mercedes)', animation: 'fadeUpSlow 0.5s ease both 0.1s' }}>
        ★ Classified · Brackley Archives ★
      </div>

      <img
        src="/pitwall-meme.png"
        alt="The legend of the Pit Wall"
        style={{
          maxWidth: 'min(420px, 86vw)', width: '100%', height: 'auto',
          border: '3px solid var(--mercedes)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.7), 0 0 40px rgba(39,244,210,0.35)',
          animation: 'eggPop 0.55s cubic-bezier(.2,.9,.25,1.2) both 0.12s',
        }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />

      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, fontStyle: 'italic', color: '#fff', textAlign: 'center', animation: 'fadeUpSlow 0.5s ease both 0.3s' }}>
        You found the legend. 🏁
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', animation: 'fadeUpSlow 0.5s ease both 0.45s' }}>
        Click anywhere or press Esc
      </div>
    </div>
  );
}
