import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Route, Switch } from "wouter";
import SiteNav from "@/components/SiteNav";
import ThemeToggle from "@/components/ThemeToggle";
import ErrorBoundary from "@/components/ErrorBoundary";
import SilverArrowLoader from "@/components/SilverArrowLoader";
import EasterEgg from "@/components/EasterEgg";
import { Analytics } from "@vercel/analytics/react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StrategyRoom = lazy(() => import("@/pages/StrategyRoom"));
const RaceDay = lazy(() => import("@/pages/RaceDay"));
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

export default function App() {
  return (
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
          <SiteNav />
          <main id="main-content">
            <Suspense fallback={
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
                <SilverArrowLoader loop={true} />
              </div>
            }>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/strategy" component={StrategyRoom} />
                <Route path="/raceday" component={RaceDay} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </main>
          <ThemeToggle />
          <EasterEgg />
          <Analytics />
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
