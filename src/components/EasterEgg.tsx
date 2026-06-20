import { useEffect, useState } from 'react';

/**
 * The meme reveal. It has no trigger of its own — it only listens for the
 * `trigger-easter-egg` window event, which the footer's riddle dispatches
 * once someone cracks the misdirection. Keeps the unlock logic in one place.
 */
export default function EasterEgg() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reveal = () => setOpen(true);
    window.addEventListener('trigger-easter-egg', reveal);
    return () => window.removeEventListener('trigger-easter-egg', reveal);
  }, []);

  const handleClose = () => {
    localStorage.removeItem('pitwall_hunt_stage');
    window.dispatchEvent(new Event('pitwall-stage-update'));
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200000,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 22, padding: 24, cursor: 'pointer',
        animation: 'fadeSlow 0.25s ease both',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--mercedes)', animation: 'fadeUpSlow 0.5s ease both 0.1s' }}>
        ★ Decrypted · Classified Records ★
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
        Osama Bin Russell and Kimi Talibantetonelli welcomes you to this page
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', animation: 'fadeUpSlow 0.5s ease both 0.45s' }}>
        Click anywhere or press Esc
      </div>
    </div>
  );
}
