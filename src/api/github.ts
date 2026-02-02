import type { RepoData, RepoMetadata, Issue, PullRequest, Commit } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

// In a real app, you would want to use a Next.js API route to hide the token
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const headers: HeadersInit = {
  'Accept': 'application/vnd.github.v3+json',
  ...(GITHUB_TOKEN ? { 'Authorization': `Bearer ${GITHUB_TOKEN}` } : {}),
};

// Helper to fetch with error handling
async function apiFetch(url: string) {
  try {
    const response = await fetch(url, {
      headers,
      // Adding credentials option to handle CORS properly
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get the error response text
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const githubApi = {
  async getRepoMetadata(owner: string, repo: string): Promise<RepoMetadata> {
    const data = await apiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
    
    return {
      name: data.name,
      owner: data.owner.login,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async getIssues(owner: string, repo: string, days = 30): Promise<Issue[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const data = await apiFetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=all&since=${since.toISOString()}&per_page=100`
    );
    
    return data.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      state: issue.state,
      createdAt: issue.created_at,
      closedAt: issue.closed_at || undefined,
      author: issue.user?.login,
    }));
  },

  async getPullRequests(owner: string, repo: string, days = 30): Promise<PullRequest[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const data = await apiFetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all&since=${since.toISOString()}&per_page=100`
    );
    
    return data.map((pr: any) => ({
      id: pr.id,
      title: pr.title,
      state: pr.merged_at ? 'merged' : pr.state,
      createdAt: pr.created_at,
      mergedAt: pr.merged_at || undefined,
      author: pr.user?.login,
      additions: pr.additions,
      deletions: pr.deletions,
    }));
  },

  async getCommits(owner: string, repo: string, days = 30): Promise<Commit[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const data = await apiFetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?since=${since.toISOString()}&per_page=100`
    );
    
    return data.map((commit: any) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
    }));
  },

  // Main function to fetch all repo data
  async getRepoData(fullName: string, days = 30): Promise<RepoData> {
    const [owner, repo] = fullName.split('/');
    
    const [metadata, issues, pullRequests, commits] = await Promise.all([
      this.getRepoMetadata(owner, repo),
      this.getIssues(owner, repo, days),
      this.getPullRequests(owner, repo, days),
      this.getCommits(owner, repo, days),
    ]);

    // Process data to create time series
    const timeSeriesData = this.processTimeSeriesData(issues, pullRequests, commits, days);
    const prTimeToMerge = this.processPrTimeToMerge(pullRequests);
    const contributors = this.processContributors(commits);

    return {
      metadata,
      issues,
      pullRequests,
      commits,
      timeSeriesData,
      prTimeToMerge,
      contributors,
    };
  },

  processTimeSeriesData(issues: Issue[], pullRequests: PullRequest[], commits: Commit[], days: number): any[] {
    // Create date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Create daily buckets
    const dateMap = new Map<string, { issuesOpened: number, issuesClosed: number, prsOpened: number, prsMerged: number, commits: number }>();
    
    // Initialize all dates with zero values
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { issuesOpened: 0, issuesClosed: 0, prsOpened: 0, prsMerged: 0, commits: 0 });
    }

    // Process issues
    issues.forEach(issue => {
      const createdDate = new Date(issue.createdAt).toISOString().split('T')[0];
      if (dateMap.has(createdDate)) {
        const dayData = dateMap.get(createdDate)!;
        dayData.issuesOpened += 1;
      }

      if (issue.closedAt) {
        const closedDate = new Date(issue.closedAt).toISOString().split('T')[0];
        if (dateMap.has(closedDate)) {
          const dayData = dateMap.get(closedDate)!;
          dayData.issuesClosed += 1;
        }
      }
    });

    // Process pull requests
    pullRequests.forEach(pr => {
      const createdDate = new Date(pr.createdAt).toISOString().split('T')[0];
      if (dateMap.has(createdDate)) {
        const dayData = dateMap.get(createdDate)!;
        dayData.prsOpened += 1;
      }

      if (pr.mergedAt) {
        const mergedDate = new Date(pr.mergedAt).toISOString().split('T')[0];
        if (dateMap.has(mergedDate)) {
          const dayData = dateMap.get(mergedDate)!;
          dayData.prsMerged += 1;
        }
      }
    });

    // Process commits
    commits.forEach(commit => {
      const commitDate = new Date(commit.date).toISOString().split('T')[0];
      if (dateMap.has(commitDate)) {
        const dayData = dateMap.get(commitDate)!;
        dayData.commits += 1;
      }
    });

    // Convert map to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date: new Date(date),
        ...data
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  },

  processPrTimeToMerge(pullRequests: PullRequest[]): any[] {
    return pullRequests
      .filter(pr => pr.mergedAt)
      .map(pr => ({
        prId: pr.id,
        timeToMerge: Math.round((new Date(pr.mergedAt!).getTime() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60)), // in hours
        title: pr.title
      }));
  },

  processContributors(commits: Commit[]): any[] {
    const contributorMap = new Map<string, number>();
    
    commits.forEach(commit => {
      if (contributorMap.has(commit.author)) {
        contributorMap.set(commit.author, contributorMap.get(commit.author)! + 1);
      } else {
        contributorMap.set(commit.author, 1);
      }
    });

    return Array.from(contributorMap.entries())
      .map(([login, contributions]) => ({ login, contributions }))
      .sort((a, b) => b.contributions - a.contributions);
  }
};
