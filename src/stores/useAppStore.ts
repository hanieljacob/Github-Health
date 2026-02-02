import { create } from 'zustand';
import type { RepoData } from '../types';

export interface AppState {
  // Selected repo information
  selectedRepo: string | null;
  setSelectedRepo: (repo: string) => void;

  // Compare mode
  compareMode: boolean;
  toggleCompareMode: () => void;
  comparedRepos: (string | null)[];
  setComparedRepos: (repos: (string | null)[]) => void;

  // Filters
  timeRange: '30d' | '90d' | '1y';
  setTimeRange: (range: '30d' | '90d' | '1y') => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Data
  repoData: Record<string, RepoData>;
  setRepoData: (repoName: string, data: RepoData) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedRepo: null,
  setSelectedRepo: (repo) => set({ selectedRepo: repo }),

  compareMode: false,
  toggleCompareMode: () => set((state) => ({ compareMode: !state.compareMode })),
  comparedRepos: [null, null],
  setComparedRepos: (repos) => set({ comparedRepos: repos }),

  timeRange: '30d',
  setTimeRange: (range) => set({ timeRange: range }),
  
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  repoData: {},
  setRepoData: (repoName, data) => set((state) => ({
    repoData: { ...state.repoData, [repoName]: data }
  }))
}));