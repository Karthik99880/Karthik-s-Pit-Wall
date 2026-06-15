import { useState, useEffect } from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  const [riddleOpen, setRiddleOpen] = useState(false);
  const [showClueModal, setShowClueModal] = useState(false);

  const handleClassifiedClick = () => {
    localStorage.setItem('pitwall_hunt_stage', '1');
    window.dispatchEvent(new Event('pitwall-stage-update'));
    setShowClueModal(true);
  };

  return (
    <footer style={{
      maxWidth: 1440, margin: '0 auto', padding: '48px 36px 36px',
      position: 'relative',
    }}>
      {showClueModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: 'var(--carbon)',
            border: '2px solid var(--mercedes)',
            boxShadow: '0 20px 50px rgba(39,244,210,0.15)',
            maxWidth: 460, width: '100%',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            padding: 28,
            position: 'relative',
            animation: 'eggPop 0.4s cubic-bezier(.2,.9,.25,1.1) both',
          }}>
            <div style={{ fontSize: 13, color: 'var(--mercedes)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, borderBottom: '1px solid rgba(39,244,210,0.2)', paddingBottom: 8 }}>
              📁 ARCHIVE ENCRYPTION: LEVEL 1
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', margin: '16px 0' }}>
              "Access the Calendar of Rounds. Track the journey to the birthplace of the world championship, where the apexes slice across old wartime runways and the local heroes claim the ultimate home advantage. Click the nation that guards the gates of Silverstone."
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setShowClueModal(false)}
                style={{
                  background: 'none',
                  border: '1px solid var(--mercedes)',
                  color: 'var(--mercedes)',
                  padding: '6px 16px',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--mercedes)';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'var(--mercedes)';
                }}
              >
                CLOSE TRANSMISSION
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ borderTop: '2px solid var(--ink)', paddingTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
              Karthik's <em style={{ fontStyle: 'italic', color: 'var(--mercedes)' }}>Pit Wall</em>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 4 }}>
              Personal F1 {year} Dashboard · Mercedes AMG Edition
            </div>
          </div>

          {/* Easter egg button (hidden trigger) */}
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={handleClassifiedClick}
          >
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--ink-3)',
              border: '1px solid var(--rule-light)', padding: '4px 10px',
              opacity: 0.4,
              transition: 'opacity 0.2s',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.4'; }}
            >
              🔒 Classified
            </div>
          </div>

          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--rule-light)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Silver Arrows · Race hard · {year}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Mercedes-AMG Petronas · Brackley Legend
          </span>
        </div>
      </div>

      {riddleOpen && <RiddleGate onClose={() => setRiddleOpen(false)} />}
    </footer>
  );
}

/* ─── The riddle ──────────────────────────────────────
 * Every line screams Ferrari / scarlet / the prancing horse.
 * The password is the EXACT opposite: this is a Silver Arrows wall,
 * so the truth is Mercedes / Silver. You have to refuse the obvious.
 */
const ACCEPTED = ['mercedes', 'silver', 'silver arrows', 'silver arrow', 'merc', 'silberpfeil', 'amg'];

const TAUNTS = [
  'Wrong. The obvious answer is the trap.',
  'Nope — you’re reading it exactly as it wants you to. That’s the mistake.',
  'Still wrong. Stop trusting what the riddle is telling you.',
];

function RiddleGate({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = () => {
    const guess = value.trim().toLowerCase();
    if (ACCEPTED.includes(guess)) {
      window.dispatchEvent(new CustomEvent('trigger-easter-egg'));
      onClose();
      return;
    }
    setAttempts(a => a + 1);
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setValue('');
  };

  const taunt = attempts > 0 ? TAUNTS[Math.min(attempts - 1, TAUNTS.length - 1)] : null;
  const hint = attempts >= 3; // after three misses, nudge them toward inverting it

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200000,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        animation: 'fadeSlow 0.22s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(460px, 100%)', background: '#0d0d0d', color: '#fff',
          border: '1px solid rgba(255,255,255,0.12)', borderTop: '4px solid var(--racing)',
          padding: '30px 30px 26px', position: 'relative', boxSizing: 'border-box',
          boxShadow: '0 30px 90px rgba(0,0,0,0.7)',
          animation: shake ? 'eggShake 0.4s ease both' : 'eggPop 0.4s cubic-bezier(.2,.9,.25,1.1) both',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--racing)', marginBottom: 18 }}>
          🔒 Encrypted File · Access Riddle
        </div>

        {/* The misleading riddle — points hard at Ferrari/red */}
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.5, color: '#fff', fontStyle: 'italic', marginBottom: 6 }}>
          “The Tifosi sing my name. I am scarlet, I am Scuderia — the prancing
          horse's fire, the only true colour of speed.
        </p>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.5, color: '#fff', fontStyle: 'italic', marginBottom: 22 }}>
          Name me, and the vault opens.”
        </p>

        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="Type your answer…"
          style={{
            width: '100%', padding: '11px 14px', boxSizing: 'border-box',
            fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.06em',
            color: '#fff', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.18)', outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            onClick={submit}
            style={{
              flex: 1, padding: '11px', cursor: 'pointer',
              background: 'var(--mercedes)', color: 'var(--carbon)', border: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800,
              letterSpacing: '0.18em', textTransform: 'uppercase',
            }}
          >
            Decrypt
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '11px 18px', cursor: 'pointer',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}
          >
            Close
          </button>
        </div>

        {/* Feedback */}
        {taunt && (
          <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff8c7a', letterSpacing: '0.04em' }}>
            {taunt}
          </div>
        )}
        {hint && (
          <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--mercedes)', letterSpacing: '0.06em', lineHeight: 1.5 }}>
            Hint: this wall flies no red flag. The answer is everything the riddle is <em style={{ fontStyle: 'italic' }}>not</em>.
          </div>
        )}
        {attempts > 0 && (
          <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            {attempts} failed {attempts === 1 ? 'attempt' : 'attempts'}
          </div>
        )}
      </div>
    </div>
  );
}
