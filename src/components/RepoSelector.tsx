import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../stores/useAppStore';
import { githubApi } from '../api/github';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ThemeToggle from './ThemeToggle';
import ExportButton from './ExportButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const RepoSelector = () => {
  const [repoInput, setRepoInput] = useState('');
  const { selectedRepo, setSelectedRepo, setRepoData, timeRange, setTimeRange } = useAppStore();
  
  const { isLoading, error, refetch, data: repoData } = useQuery({
    queryKey: ['repoData', selectedRepo, timeRange],
    queryFn: () => 
      selectedRepo 
        ? githubApi.getRepoData(selectedRepo, timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365)
        : Promise.resolve(null),
    enabled: !!selectedRepo,
  });
  
  // Handle success separately
  useEffect(() => {
    if (repoData && selectedRepo) {
      setRepoData(selectedRepo, repoData);
    }
  }, [repoData, selectedRepo, setRepoData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim()) {
      // Extract owner/repo from a full URL if provided
      let processedRepo = repoInput.trim();
      
      // Check if it's a URL and extract the owner/repo part
      if (processedRepo.startsWith('http')) {
        try {
          const url = new URL(processedRepo);
          const pathParts = url.pathname.split('/').filter(part => part);
          if (pathParts.length >= 2) {
            processedRepo = `${pathParts[0]}/${pathParts[1]}`;
          }
        } catch (err) {
          console.error('Invalid URL format');
          return;
        }
      }
      
      // Validate the format (should be owner/repo)
      if (!processedRepo.includes('/')) {
        alert('Please enter repository in the format: owner/repo (e.g., facebook/react)');
        return;
      }
      
      setSelectedRepo(processedRepo);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Select a Repository</CardTitle>
            <CardDescription>Paste an owner/repo or full GitHub URL.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {selectedRepo && <Badge variant="outline">{selectedRepo}</Badge>}
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <Input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="Enter repo (e.g., facebook/react)"
            className="h-11"
          />
          <div className="flex w-full flex-col gap-2 sm:flex-row md:justify-end">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Loading...' : 'Analyze'}
            </Button>
            {selectedRepo && (
              <Button
                type="button"
                onClick={() => refetch()}
                variant="outline"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Refresh
              </Button>
            )}
            <ThemeToggle />
            <ExportButton />
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RepoSelector;
