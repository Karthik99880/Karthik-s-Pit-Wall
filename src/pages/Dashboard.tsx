import Ticker from '@/components/Ticker';
import Hero from '@/components/Hero';
import ChampionBanner from '@/components/ChampionBanner';
import NextRace from '@/components/NextRace';
import CircuitGuide from '@/components/CircuitGuide';
import RaceWeather from '@/components/RaceWeather';
import Predictions from '@/components/Predictions';
import ChampionshipBattle from '@/components/ChampionshipBattle';
import Calendar from '@/components/Calendar';
import ProgressionChart from '@/components/ProgressionChart';
import Standings from '@/components/Standings';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import SilverArrowLoader from '@/components/SilverArrowLoader';
import { introDone, introPending } from '@/lib/intro';
import Reveal from '@/components/motion/Reveal';
import SectionNav from '@/components/SectionNav';
// Live race-day timing strip is switched off along with the Race Day page.
// import LiveTicker from '@/components/LiveTicker';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

const SECTIONS = [
  { id: 'dash-race', n: '01', label: 'Next Race' },
  { id: 'dash-circuit', n: '02', label: 'Circuit' },
  { id: 'dash-weather', n: '03', label: 'Weather' },
  { id: 'dash-predict', n: '04', label: 'Predict' },
  { id: 'dash-title', n: '05', label: 'Title Fight' },
  { id: 'dash-calendar', n: '06', label: 'Calendar' },
  { id: 'dash-progression', n: '07', label: 'Progression' },
  { id: 'dash-standings', n: '08', label: 'Standings' },
];


function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return <Reveal id={id} style={{ scrollMarginTop: 64 }}>{children}</Reveal>;
}

export default function Dashboard() {
  useDocumentMeta(
    "Pit Wall F1 | F1 2026 Live Standings, Calendar & Championship Tracker",
    'Live F1 2026 driver and constructor standings, next race countdown, circuit guide, weekend weather forecast, full season calendar, and championship points progression.',
  );

  const [intro] = useState(introPending);
  useEffect(() => introDone, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      {intro && <SilverArrowLoader />}
      <Ticker />
      <Hero />
      <Reveal><ChampionBanner /></Reveal>
      <SectionNav sections={SECTIONS} />
      {/* <LiveTicker /> */}
      <Section id="dash-race"><NextRace /></Section>
      <Section id="dash-circuit"><CircuitGuide /></Section>
      <Section id="dash-weather"><RaceWeather /></Section>
      <Section id="dash-predict"><Predictions /></Section>
      <Section id="dash-title"><ChampionshipBattle /></Section>
      <Section id="dash-calendar"><Calendar /></Section>
      <Section id="dash-progression"><ProgressionChart /></Section>
      <Section id="dash-standings"><Standings /></Section>
      <Footer />
    </div>
  );
}
