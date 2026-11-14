import Footer from '@/components/Footer';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'About this site',
    body: [
      'Pit Wall F1 is an unofficial fan project. It is made for fun and not for profit.',
      'It is not affiliated with, endorsed by or connected to Formula 1, the FIA, Mercedes-Benz, the Mercedes-AMG PETRONAS F1 Team or any other team.',
      'F1, FORMULA 1 and related marks, and all team names and logos, are trademarks of their respective owners.',
    ],
  },
  {
    title: 'Accounts and personal data',
    body: [
      'There are no accounts, sign-ups or forms that send data to us.',
      'Your podium predictions, your easter-egg hunt progress and your light or dark theme choice are stored only in your browser, using localStorage or sessionStorage. They are never sent to a server.',
      'You can clear them at any time by clearing this site’s data in your browser settings.',
    ],
  },
  {
    title: 'Analytics',
    body: [
      'This site uses Vercel Web Analytics to measure page views.',
    ],
  },
  {
    title: 'Data sources',
    body: [
      'Standings, results and calendar data come from the community Jolpica/Ergast API. Tyre, pit stop and session data come from the OpenF1 API. Weather forecasts come from Open-Meteo.',
      'Driver and team images load from third-party hosts, and fonts load from Google Fonts. Your browser contacts those services directly when you open the site.',
      'Data is shown as it is received. There is no guarantee that it is accurate, complete or up to date.',
    ],
  },
  {
    title: 'Terms of use',
    body: [
      'This site is free to use. It is provided as is, with no warranty of any kind.',
      'Do not rely on it for betting, travel or any decision that matters. Check official sources instead.',
    ],
  },
];

export default function Legal() {
  useDocumentMeta(
    'Privacy & Terms | Pit Wall F1',
    'Privacy and terms for Pit Wall F1, an unofficial fan-made F1 dashboard. No accounts, data stays in your browser, free to use with no warranty.',
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <header style={{ maxWidth: 1440, margin: '0 auto', padding: '48px clamp(16px, 4vw, 36px) 28px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 22, animation: 'fadeUpSlow 0.8s ease both' }}>
          <span style={{ width: 28, height: 3, background: 'var(--mercedes)', display: 'inline-block' }} />
          Pit Wall F1 · Legal
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--ink)', animation: 'fadeUpSlow 0.9s ease both 0.1s' }}>
          <span style={{ display: 'block', fontSize: 'clamp(44px, 7vw, 92px)' }}>Privacy</span>
          <span style={{ display: 'block', fontSize: 'clamp(44px, 7vw, 92px)', fontStyle: 'italic', color: 'var(--mercedes-ink)' }}>&amp; Terms</span>
        </h1>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink-2)', maxWidth: 620, marginTop: 18, lineHeight: 1.6, animation: 'fadeUpSlow 1s ease both 0.3s' }}>
          What this site stores, where its data comes from, and the ground rules.
        </p>
      </header>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '12px clamp(16px, 4vw, 36px) 0' }}>
        {SECTIONS.map(s => (
          <section key={s.title} style={{ marginBottom: 28, maxWidth: 760 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)', marginBottom: 12 }}>
              {s.title}
            </h2>
            <div style={{ borderTop: '2px solid var(--ink)', paddingTop: 14 }}>
              {s.body.map(p => (
                <p key={p} style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65, margin: '0 0 10px' }}>
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
        <section style={{ marginBottom: 28, maxWidth: 760 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)', marginBottom: 12 }}>
            Contact
          </h2>
          <div style={{ borderTop: '2px solid var(--ink)', paddingTop: 14 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65, margin: '0 0 10px' }}>
              For issues with this site, email{' '}
              <a href="mailto:karthik@shutbox.im" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}>karthik@shutbox.im</a>.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
