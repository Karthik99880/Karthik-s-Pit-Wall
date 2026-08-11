import Ticker from '@/components/Ticker';
import Hero from '@/components/Hero';
import NextRace from '@/components/NextRace';
import CircuitGuide from '@/components/CircuitGuide';
import RaceWeather from '@/components/RaceWeather';
import Predictions from '@/components/Predictions';
import ChampionshipBattle from '@/components/ChampionshipBattle';
import Calendar from '@/components/Calendar';
import ProgressionChart from '@/components/ProgressionChart';
import Standings from '@/components/Standings';
import Footer from '@/components/Footer';
import SilverArrowLoader from '@/components/SilverArrowLoader';
import SectionNav from '@/components/SectionNav';
import LiveTicker from '@/components/LiveTicker';
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
  return <div id={id} style={{ scrollMarginTop: 64 }}>{children}</div>;
}

export default function Dashboard() {
  useDocumentMeta(
    'Mercedes Pit Wall — F1 2026 Live Standings, Calendar & Championship Tracker',
    'Live F1 2026 driver and constructor standings, next race countdown, circuit guide, weekend weather forecast, full season calendar, and championship points progression.',
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <SilverArrowLoader />
      <Ticker />
      <Hero />
      <SectionNav sections={SECTIONS} />
      <LiveTicker />
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
