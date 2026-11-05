import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&';
const FRAME_MS = 40;
const TOTAL_FRAMES = 30;

export default function DecryptText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduced) return;
    setFrame(0);
    const id = setInterval(() => {
      setFrame(f => {
        if (f + 1 >= TOTAL_FRAMES) clearInterval(id);
        return f + 1;
      });
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [text, reduced]);

  if (reduced || frame >= TOTAL_FRAMES) return <>{text}</>;

  const revealed = Math.floor((text.length * frame) / TOTAL_FRAMES);
  const shown = Array.from(text, (ch, i) =>
    i < revealed || ch === ' ' ? ch : CHARSET[(i * 7 + frame * 13) % CHARSET.length]
  ).join('');

  return (
    <span aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
