import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Route, Switch } from "wouter";
import SiteNav from "@/components/SiteNav";
import ThemeToggle from "@/components/ThemeToggle";
import ErrorBoundary from "@/components/ErrorBoundary";
import SilverArrowLoader from "@/components/SilverArrowLoader";
import EasterEgg from "@/components/EasterEgg";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StrategyRoom = lazy(() => import("@/pages/StrategyRoom"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SiteNav />
          <Suspense fallback={
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
              <SilverArrowLoader />
            </div>
          }>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/strategy" component={StrategyRoom} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
          <ThemeToggle />
          <EasterEgg />
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
