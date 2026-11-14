import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { getFanTeam, setFanTeam } from "@/lib/fanTeam";
import { getFanTeamId, getTeamColor } from "@/lib/f1Types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Route, Switch } from "wouter";
import { MotionConfig } from "motion/react";
import SiteNav from "@/components/SiteNav";
import ThemeToggle from "@/components/ThemeToggle";
import ErrorBoundary from "@/components/ErrorBoundary";
import SilverArrowLoader from "@/components/SilverArrowLoader";
import EasterEgg from "@/components/EasterEgg";
import { Analytics } from "@vercel/analytics/react";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { useRouteWipe } from "@/components/motion/RouteWipe";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StrategyRoom = lazy(() => import("@/pages/StrategyRoom"));
const Legal = lazy(() => import("@/pages/Legal"));
// Race Day is switched off for now (re-enable here, in SiteNav and in index.html).
// const RaceDay = lazy(() => import("@/pages/RaceDay"));
const Garage = lazy(() => import("@/pages/Garage"));
const TeamPicker = lazy(() => import("@/components/TeamPicker"));
const TeamRush = lazy(() => import("@/components/TeamPicker").then(m => ({ default: m.TeamRush })));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // jolpicaFetch/openF1Fetch already retry with backoff internally, so keep
      // this layer shallow — otherwise a rate-limited call multiplies out.
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

function Routes() {
  const { shown, wipe } = useRouteWipe();
  return (
    <>
      <Suspense fallback={
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
          <SilverArrowLoader loop={true} />
        </div>
      }>
        <Switch location={shown}>
          <Route path="/" component={Dashboard} />
          <Route path="/strategy" component={StrategyRoom} />
          <Route path="/legal" component={Legal} />
          <Route path="/garage" component={Garage} />
          {/* <Route path="/raceday" component={RaceDay} /> */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      {wipe}
    </>
  );
}

export default function App() {
  const [picking, setPicking] = useState(() => import.meta.env.DEV || !getFanTeam());
  const [rush, setRush] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const closePicker = useCallback(() => setPicking(false), []);
  const pick = (id: string) => {
    setFanTeam(id);
    if (reduce) setPicking(false); else setRush(id);
  };

  useEffect(() => {
    const hex = getTeamColor(getFanTeamId());
    const root = document.documentElement.style;
    root.setProperty('--mercedes', hex);
    root.setProperty('--mercedes-rgb', [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(','));
  }, [picking]);

  useEffect(() => {
    const open = () => setPicking(true);
    window.addEventListener('pitwall:pick', open);
    return () => window.removeEventListener('pitwall:pick', open);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <a
            href="#main-content"
            style={{
              position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden', zIndex: 1000,
            }}
            onFocus={e => Object.assign(e.currentTarget.style, {
              position: 'fixed', left: 12, top: 12, width: 'auto', height: 'auto',
              padding: '10px 16px', background: 'var(--carbon)', color: 'var(--mercedes)',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', border: '2px solid var(--mercedes)',
            })}
            onBlur={e => Object.assign(e.currentTarget.style, {
              position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, padding: 0, border: 'none',
            })}
          >
            Skip to content
          </a>
          <SmoothScroll />
          <SiteNav />
          <main id="main-content">
            <Routes key={String(picking)} />
          </main>
          <Suspense fallback={null}>
            {picking && <TeamPicker onPick={pick} />}
            {rush && <TeamRush team={rush} onCovered={closePicker} onDone={() => setRush(null)} />}
          </Suspense>
          {!picking && <ThemeToggle />}
          <EasterEgg />
          <Analytics />
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
    </MotionConfig>
  );
}
