# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Claw Work Kit Hub — a frontend prototype for an AI Work Kit builder aimed at small e-commerce teams preparing for shopping festivals (618, 11.11). The tool helps teams structure and reuse AI analysis workflows: competitor review mining → pain point matrix → selling point translation → FAQ generation → livestream script → detail page optimization → reusable Work Kit.

This is a **pure frontend prototype** with mock data. No real backend, no real AI API.

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- React Router v6

## Commands

```bash
npm run dev       # Start dev server at localhost:5173
npm run build     # TypeScript check + Vite production build
npx tsc --noEmit  # Type-check only
```

## Project structure

```
src/
  types/index.ts      # All TypeScript interfaces (Project, Material, TaskCard, AIResult, Report, WorkKit)
  data/mock.ts        # All mock data + shared lookups (roleLabels, roleIcons)
  components/          # Shared components (Sidebar, PageHeader, StatusBadge)
  pages/               # One file per route
    Dashboard.tsx       # / — stats + project list
    CreateProject.tsx   # /create — 3-step form (info → team → competitors)
    MaterialLibrary.tsx # /materials/:projectId — upload zone + file list
    TaskCards.tsx       # /tasks/:projectId — role task card grid
    Workspace.tsx       # /workspace/:projectId/:taskId — "Generate" button → simulated AI result
    Report.tsx          # /report/:projectId — tabbed view per role, submitted results
    Archive.tsx         # /archive — saved Work Kit list with reuse button
  App.tsx              # Layout: Sidebar + <Routes>
  main.tsx             # Entry: BrowserRouter + App
  index.css            # Tailwind import + custom accent color theme
```

## Routing

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Dashboard | Project list, stats |
| `/create` | CreateProject | Multi-step project creation form |
| `/materials/:projectId` | MaterialLibrary | Upload & view competitor review data |
| `/tasks/:projectId` | TaskCards | Per-role AI task cards |
| `/workspace/:projectId/:taskId` | Workspace | AI generation + structured result display |
| `/report/:projectId` | Report | Aggregated report with role tabs |
| `/archive` | Archive | Saved reusable Work Kits |

## Core user flow

Create → Upload → Task Cards → Workspace (click "生成分析" → 2s simulated delay → structured result) → Submit → Report → Save as Work Kit

## Mock data notes

- Only project `p1` ("618 美妆个护竞品分析") has full data: 5 materials, 5 task cards, all 5 AI results
- Only task `t1` (用户痛点矩阵) has both `generatedAt` set AND `submitted: false` — it auto-shows results on workspace load
- Other tasks have result structures but empty `generatedAt`, so Workspace will show the "Generate" button
- `mockAIResults` is keyed by `taskId` and read from both Workspace and Report pages
- `mockReports` only has data for `p3` (completed project)

## UI patterns

- Accent blue: `accent-50` through `accent-900` scale defined in `index.css`
- All content cards: `bg-white rounded-lg border border-gray-200 p-5`
- Page wrapper: `max-w-5xl` or `max-w-4xl` inside the `<main>` element
- Sidebar is fixed 224px width (`w-56`), rest is flex-1
