import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';

// Sync app state with URL parameters
export const useUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    selectedRepo, setSelectedRepo, 
    timeRange, setTimeRange,
    compareMode, toggleCompareMode,
    comparedRepos, setComparedRepos
  } = useAppStore();

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedRepo) {
      params.set('repo', selectedRepo);
    }
    
    if (timeRange !== '30d') { // 30d is default
      params.set('range', timeRange);
    }
    
    if (compareMode) {
      params.set('compare', 'true');
      if (comparedRepos[0]) params.set('repo1', comparedRepos[0]);
      if (comparedRepos[1]) params.set('repo2', comparedRepos[1]);
    }
    
    setSearchParams(params, { replace: true });
  }, [selectedRepo, timeRange, compareMode, comparedRepos, setSearchParams]);

  // Update state when URL changes
  useEffect(() => {
    const repoParam = searchParams.get('repo');
    const rangeParam = searchParams.get('range') as '30d' | '90d' | '1y' | null;
    const compareParam = searchParams.get('compare') === 'true';
    const repo1Param = searchParams.get('repo1');
    const repo2Param = searchParams.get('repo2');

    if (repoParam) {
      setSelectedRepo(repoParam);
    }

    if (rangeParam && ['30d', '90d', '1y'].includes(rangeParam)) {
      setTimeRange(rangeParam);
    }

    if (compareParam) {
      toggleCompareMode();
      setComparedRepos([repo1Param, repo2Param]);
    }
  }, [searchParams, setSelectedRepo, setTimeRange, toggleCompareMode, setComparedRepos]);
};