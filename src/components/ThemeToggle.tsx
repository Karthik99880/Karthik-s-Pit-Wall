import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/** Floating dark/light switch, pinned bottom-right. */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes only knows the real theme after hydration
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        position: 'fixed', right: 22, bottom: 22, zIndex: 100000,
        width: 52, height: 52, borderRadius: '50%', cursor: 'pointer',
        background: 'var(--carbon)', color: 'var(--mercedes)',
        border: '2px solid var(--mercedes)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 28px rgba(0,0,0,0.35), 0 0 18px rgba(39,244,210,0.25)',
        transition: 'transform 0.18s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
