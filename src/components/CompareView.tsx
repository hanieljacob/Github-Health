import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../stores/useAppStore';
import { githubApi } from '../api/github';
import TimeSeriesChart from '../charts/TimeSeriesChart';
import PrHistogram from '../charts/PrHistogram';
import ThemeToggle from '../components/ThemeToggle';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const CompareView = () => {
  const { theme, timeRange, setTimeRange, comparedRepos, setComparedRepos, setRepoData } = useAppStore();
  const [repo1Input, setRepo1Input] = useState('');
  const [repo2Input, setRepo2Input] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Fetch data for both repositories
  const { isLoading: isLoading1, refetch: refetch1, data: repoData1 } = useQuery({
    queryKey: ['repoData', comparedRepos[0], timeRange],
    queryFn: () =>
      comparedRepos[0]
        ? githubApi.getRepoData(comparedRepos[0]!, timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365)
        : Promise.resolve(null),
    enabled: !!comparedRepos[0],
  });

  const { isLoading: isLoading2, refetch: refetch2, data: repoData2 } = useQuery({
    queryKey: ['repoData', comparedRepos[1], timeRange],
    queryFn: () =>
      comparedRepos[1]
        ? githubApi.getRepoData(comparedRepos[1]!, timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365)
        : Promise.resolve(null),
    enabled: !!comparedRepos[1],
  });

  // Handle success separately
  useEffect(() => {
    if (repoData1 && comparedRepos[0]) {
      setRepoData(comparedRepos[0]!, repoData1);
    }
  }, [repoData1, comparedRepos[0], setRepoData]);

  useEffect(() => {
    if (repoData2 && comparedRepos[1]) {
      setRepoData(comparedRepos[1]!, repoData2);
    }
  }, [repoData2, comparedRepos[1], setRepoData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repo1Input.trim() && repo2Input.trim()) {
      setComparedRepos([repo1Input.trim(), repo2Input.trim()]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_80%_at_80%_10%,hsl(var(--primary)/0.16),transparent_60%)]" />
        <div className="pointer-events-none absolute -top-40 left-0 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

        <header className="relative z-10 border-b/40 bg-background/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Compare</Badge>
                <Badge variant="outline">Side by Side</Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Compare Repo Health
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Contrast activity trends and merge velocity between two repositories.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8">
          <div className="grid gap-6">
            <Card className="shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle>Select Repositories</CardTitle>
                    <CardDescription>Paste owner/repo or full GitHub URLs.</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">Time range</span>
                      <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
                        <SelectTrigger className="h-9 w-[150px]">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="1y">Last 12 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
                  <Input
                    type="text"
                    value={repo1Input}
                    onChange={(e) => setRepo1Input(e.target.value)}
                    placeholder="Enter first repo (e.g., facebook/react)"
                    className="h-11"
                  />
                  <Input
                    type="text"
                    value={repo2Input}
                    onChange={(e) => setRepo2Input(e.target.value)}
                    placeholder="Enter second repo (e.g., vuejs/vue)"
                    className="h-11"
                  />
                  <div className="flex w-full flex-col gap-2 sm:flex-row md:justify-end">
                    <Button type="submit" disabled={isLoading1 || isLoading2} className="w-full sm:w-auto">
                      {isLoading1 || isLoading2 ? 'Loading...' : 'Compare'}
                    </Button>
                  </div>
                </form>

                {comparedRepos[0] && comparedRepos[1] && (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{comparedRepos[0]}</Badge>
                      <span>vs</span>
                      <Badge variant="secondary">{comparedRepos[1]}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() => refetch1()}
                        variant="outline"
                        disabled={isLoading1}
                        size="sm"
                      >
                        Refresh {comparedRepos[0]}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => refetch2()}
                        variant="outline"
                        disabled={isLoading2}
                        size="sm"
                      >
                        Refresh {comparedRepos[1]}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {comparedRepos[0] && comparedRepos[1] && (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>{comparedRepos[0]} Issues</CardTitle>
                      <CardDescription>Activity across the selected range.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <TimeSeriesChart repoKey={comparedRepos[0]} />
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>{comparedRepos[1]} Issues</CardTitle>
                      <CardDescription>Activity across the selected range.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <TimeSeriesChart repoKey={comparedRepos[1]} />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>{comparedRepos[0]} Merge Speed</CardTitle>
                      <CardDescription>PR time-to-merge distribution.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <PrHistogram repoKey={comparedRepos[0]} />
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>{comparedRepos[1]} Merge Speed</CardTitle>
                      <CardDescription>PR time-to-merge distribution.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <PrHistogram repoKey={comparedRepos[1]} />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompareView;
