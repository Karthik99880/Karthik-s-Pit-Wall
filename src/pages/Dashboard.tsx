import Ticker from '@/components/Ticker';
import Hero from '@/components/Hero';
import NextRace from '@/components/NextRace';
import ChampionshipBattle from '@/components/ChampionshipBattle';
import Calendar from '@/components/Calendar';
import ProgressionChart from '@/components/ProgressionChart';
import Standings from '@/components/Standings';
import Footer from '@/components/Footer';
import SilverArrowLoader from '@/components/SilverArrowLoader';

export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', overflowX: 'hidden' }}>
      <SilverArrowLoader />
      <Ticker />
      <Hero />
      <NextRace />
      <ChampionshipBattle />
      <Calendar />
      <ProgressionChart />
      <Standings />
      <Footer />
    </div>
  );
}
