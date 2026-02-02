import type { RepoData, Issue, PullRequest, PrTimeToMerge, Contributor } from '../types';

// Helper function to convert data to CSV format
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and wrap in quotes if needed
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export issues as CSV
export const exportIssuesToCSV = (issues: Issue[], repoName: string) => {
  const formattedData = issues.map(issue => ({
    id: issue.id,
    title: issue.title,
    state: issue.state,
    author: issue.author,
    createdAt: issue.createdAt,
    closedAt: issue.closedAt || '',
  }));

  exportToCSV(formattedData, `${repoName}-issues.csv`);
};

// Export pull requests as CSV
export const exportPullRequestsToCSV = (pullRequests: PullRequest[], repoName: string) => {
  const formattedData = pullRequests.map(pr => ({
    id: pr.id,
    title: pr.title,
    state: pr.state,
    author: pr.author,
    createdAt: pr.createdAt,
    mergedAt: pr.mergedAt || '',
    additions: pr.additions || 0,
    deletions: pr.deletions || 0,
  }));

  exportToCSV(formattedData, `${repoName}-pull-requests.csv`);
};

// Export PR time to merge as CSV
export const exportPrTimeToMergeToCSV = (prTimeToMerge: PrTimeToMerge[], repoName: string) => {
  const formattedData = prTimeToMerge.map(item => ({
    prId: item.prId,
    timeToMergeHours: item.timeToMerge,
    title: item.title,
  }));

  exportToCSV(formattedData, `${repoName}-pr-time-to-merge.csv`);
};

// Export contributors as CSV
export const exportContributorsToCSV = (contributors: Contributor[], repoName: string) => {
  const formattedData = contributors.map(contributor => ({
    login: contributor.login,
    contributions: contributor.contributions,
  }));

  exportToCSV(formattedData, `${repoName}-contributors.csv`);
};

// Export all repo data as CSV
export const exportRepoDataToCSV = (repoData: RepoData) => {
  const { metadata, issues, pullRequests, prTimeToMerge, contributors } = repoData;
  const repoName = `${metadata.owner}-${metadata.name}`;
  
  exportIssuesToCSV(issues, repoName);
  exportPullRequestsToCSV(pullRequests, repoName);
  exportPrTimeToMergeToCSV(prTimeToMerge, repoName);
  exportContributorsToCSV(contributors, repoName);
};