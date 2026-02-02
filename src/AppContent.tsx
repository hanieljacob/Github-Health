import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from './stores/useAppStore';
import RepoSelector from './components/RepoSelector';
import TimeSeriesChart from './charts/TimeSeriesChart';
import PrHistogram from './charts/PrHistogram';
import { useUrlSync } from './utils/urlSync';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

interface AppContentProps {
  compareMode?: boolean;
}

const AppContent: React.FC<AppContentProps> = ({ compareMode: propCompareMode = false }) => {
  const { theme, setComparedRepos, toggleCompareMode } = useAppStore();

  // Apply theme to body
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Handle URL sync
  useUrlSync();

  // Set compare mode from props if needed
  useEffect(() => {
    if (propCompareMode) {
      toggleCompareMode();
      setComparedRepos([null, null]);
    }
  }, [propCompareMode, toggleCompareMode, setComparedRepos]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_80%_at_15%_10%,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

        <header className="relative z-10 border-b/40 bg-background/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Dashboard</Badge>
                <Badge variant="outline">Repo Health</Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                GitHub Repo Health Dashboard
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Track issues, PRs, and merge velocity with a clean, decision-ready view.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/compare">Compare Repos</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8">
          <div className="grid gap-6">
            <RepoSelector />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Issue Activity</CardTitle>
                  <CardDescription>Open vs closed issues over time.</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <TimeSeriesChart />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>PR Merge Speed</CardTitle>
                  <CardDescription>How long it takes to merge pull requests.</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <PrHistogram />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppContent;
