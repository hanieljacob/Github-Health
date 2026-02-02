// Types for GitHub repository health dashboard

export interface RepoMetadata {
  name: string;
  owner: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: number;
  title: string;
  state: 'open' | 'closed';
  createdAt: string;
  closedAt?: string;
  author: string;
}

export interface PullRequest {
  id: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  createdAt: string;
  mergedAt?: string;
  author: string;
  additions?: number;
  deletions?: number;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface TimeSeriesPoint {
  date: Date;
  issuesOpened: number;
  issuesClosed: number;
  prsOpened: number;
  prsMerged: number;
  commits: number;
}

export interface PrTimeToMerge {
  prId: number;
  timeToMerge: number; // in hours
  title: string;
}

export interface Contributor {
  login: string;
  contributions: number;
  avatarUrl?: string;
}

export interface RepoData {
  metadata: RepoMetadata;
  issues: Issue[];
  pullRequests: PullRequest[];
  commits: Commit[];
  timeSeriesData: TimeSeriesPoint[];
  prTimeToMerge: PrTimeToMerge[];
  contributors: Contributor[];
}