# Repo Health Dashboard

A modern, shadcn-powered dashboard for tracking GitHub repository health across issues, PRs, and merge velocity.

## What This App Does
- Compare issue activity and PR merge speed for a repository.
- Switch time ranges (30 days, 90 days, 1 year).
- Export analyzed data to CSV.
- Toggle light/dark theme.
- Compare two repositories side by side.

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS v4
- shadcn/ui components
- TanStack Query
- Zustand
- D3 for charts

## Getting Started
```bash
npm install
npm run dev
```

## Notes
- This project uses Tailwind CSS v4. The Vite plugin is configured in `vite.config.ts`.
- The favicon is `public/repo-health.svg`.

## Folder Guide
- `src/components`: UI and app components
- `src/charts`: D3 visualizations
- `src/stores`: Zustand store
- `src/utils`: helpers (URL sync, export, etc.)

## Common Tasks
```bash
npm run build
npm run preview
```
