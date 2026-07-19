import Ticker from '@/components/Ticker';
import Hero from '@/components/Hero';
import NextRace from '@/components/NextRace';
import ChampionshipBattle from '@/components/ChampionshipBattle';
import Calendar from '@/components/Calendar';
import ProgressionChart from '@/components/ProgressionChart';
import Standings from '@/components/Standings';
import Footer from '@/components/Footer';
import SilverArrowLoader from '@/components/SilverArrowLoader';
import SectionNav from '@/components/SectionNav';
import LiveTicker from '@/components/LiveTicker';

const SECTIONS = [
  { id: 'dash-race', n: '01', label: 'Next Race' },
  { id: 'dash-title', n: '02', label: 'Title Fight' },
  { id: 'dash-calendar', n: '03', label: 'Calendar' },
  { id: 'dash-progression', n: '04', label: 'Progression' },
  { id: 'dash-standings', n: '05', label: 'Standings' },
];


function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return <div id={id} style={{ scrollMarginTop: 64 }}>{children}</div>;
}

export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <SilverArrowLoader />
      <Ticker />
      <Hero />
      <SectionNav sections={SECTIONS} />
      <LiveTicker />
      <Section id="dash-race"><NextRace /></Section>
      <Section id="dash-title"><ChampionshipBattle /></Section>
      <Section id="dash-calendar"><Calendar /></Section>
      <Section id="dash-progression"><ProgressionChart /></Section>
      <Section id="dash-standings"><Standings /></Section>
      <Footer />
    </div>
  );
}
