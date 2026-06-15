import Ticker from '@/components/Ticker';
import Hero from '@/components/Hero';
import NextRace from '@/components/NextRace';
import Calendar from '@/components/Calendar';
import Standings from '@/components/Standings';
import Footer from '@/components/Footer';

export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', overflowX: 'hidden' }}>
      <Ticker />
      <Hero />
      <NextRace />
      <Calendar />
      <Standings />
      <Footer />
    </div>
  );
}
