import { Suspense, lazy } from 'react';
import Footer from '@/components/Footer';
import SectionNav from '@/components/SectionNav';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

const SECTIONS = [
  { id: 'strat-01', n: '01', label: 'Champion' },
  { id: 'strat-02', n: '02', label: 'Teammate' },
  { id: 'strat-03', n: '03', label: 'Overtaking' },
  { id: 'strat-04', n: '04', label: 'Tyre' },
  { id: 'strat-05', n: '05', label: 'Circuit' },
  { id: 'strat-06', n: '06', label: 'Form' },
  { id: 'strat-07', n: '07', label: 'Reliability' },
  { id: 'strat-08', n: '08', label: 'Simulator' },
  { id: 'strat-09', n: '09', label: 'Pit Lane' },
];

const ChampionPredictor = lazy(() => import('@/components/strategy/ChampionPredictor'));
const TeammateBattle = lazy(() => import('@/components/strategy/TeammateBattle'));
const OvertakingIndex = lazy(() => import('@/components/strategy/OvertakingIndex'));
const TyreStrategy = lazy(() => import('@/components/strategy/TyreStrategy'));
const CircuitSpecialization = lazy(() => import('@/components/strategy/CircuitSpecialization'));
const FormGuide = lazy(() => import('@/components/strategy/FormGuide'));
const Reliability = lazy(() => import('@/components/strategy/Reliability'));
const TitleSimulator = lazy(() => import('@/components/strategy/TitleSimulator'));
const PitLaneLeaderboard = lazy(() => import('@/components/strategy/PitLaneLeaderboard'));

export default function StrategyRoom() {
  useDocumentMeta(
    'F1 2026 Strategy Analysis — Tyre Strategy, Teammate Head-to-Head & Title Simulator',
    'Deep F1 2026 analysis: tyre strategy trends, teammate head-to-head battles, overtaking index, driver form guide, team reliability, pit lane times and an interactive championship simulator.',
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      {}
      <header style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 36px 28px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 22, animation: 'fadeUpSlow 0.8s ease both' }}>
          <span style={{ width: 28, height: 3, background: 'var(--mercedes)', display: 'inline-block' }} />
          Mercedes Pit Wall · Analysis
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--ink)', animation: 'fadeUpSlow 0.9s ease both 0.1s' }}>
          <span style={{ display: 'block', fontSize: 'clamp(44px, 7vw, 92px)' }}>The Strategy</span>
          <span style={{ display: 'block', fontSize: 'clamp(44px, 7vw, 92px)', fontStyle: 'italic', color: 'var(--mercedes)' }}>Room</span>
        </h1>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink-2)', maxWidth: 620, marginTop: 18, lineHeight: 1.6, animation: 'fadeUpSlow 1s ease both 0.3s' }}>
          Where the numbers get interrogated — title projections, the teammate
          benchmark that decides careers, and the race-craft that grid position
          alone never tells you.
        </p>

        <div style={{ marginTop: 26, paddingTop: 18, borderTop: '1px solid var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', animation: 'fadeUpSlow 1s ease both 0.5s' }}>
          Projections · Head-to-Head · Race Craft · Tyre Strategy · Circuits · Reliability · Pit Lane
        </div>
      </header>

      <SectionNav sections={SECTIONS} />

      {/* Sections */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '12px 36px 0' }}>
        <Suspense fallback={
          <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Loading Analysis Modules...
          </div>
        }>
          <ChampionPredictor />
          <TeammateBattle />
          <OvertakingIndex />
          <TyreStrategy />
          <CircuitSpecialization />
          <FormGuide />
          <Reliability />
          <TitleSimulator />
          <PitLaneLeaderboard />
        </Suspense>
      </div>

      <Footer />
    </div>
  );
}
