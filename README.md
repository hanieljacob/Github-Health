# GitHub Repo Health Dashboard

A comprehensive dashboard for analyzing GitHub repository health metrics with interactive D3 visualizations.

## Features

- **Interactive Time Series Chart**: Visualize issues opened vs closed, PRs, and commits over time
- **PR Time to Merge Histogram**: Understand how long pull requests take to get merged
- **Repository Comparison**: Compare metrics between two repositories side-by-side
- **Filtering Options**: Adjust time range (30, 90, or 365 days)
- **Dark/Light Theme**: Toggle between color schemes
- **Responsive Design**: Works well on different screen sizes

## Architecture

```
github-repo-health-dashboard/
├── src/
│   ├── api/              # GitHub API integration
│   ├── charts/           # D3 visualization components
│   ├── components/       # Reusable UI components
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
```

### Tech Stack

- **Frontend**: React + TypeScript
- **State Management**: Zustand for UI state, TanStack Query for server state
- **Visualizations**: D3.js for interactive charts
- **Styling**: CSS Modules
- **Build Tool**: Vite

### What We Optimized For

- **Caching**: Implemented TanStack Query for intelligent caching and background updates
- **Performance**: Virtualized lists and efficient D3 rendering
- **Responsive Charts**: Charts that adapt to different screen sizes
- **Clean Architecture**: Separation of concerns between data fetching, state management, and visualization

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/your-username/github-repo-health-dashboard.git
cd github-repo-health-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your GitHub token:
```env
VITE_GITHUB_TOKEN=your_github_token_here
```

> Note: You can generate a GitHub token at https://github.com/settings/tokens

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Screenshots

![Dashboard Screenshot](screenshots/dashboard.png)

## API Endpoints Used

- `/repos/{owner}/{repo}` - Repository metadata
- `/repos/{owner}/{repo}/issues` - Issues data
- `/repos/{owner}/{repo}/pulls` - Pull requests data
- `/repos/{owner}/{repo}/commits` - Commits history

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

MIT