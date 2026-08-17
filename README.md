# LeadFlow AI

AI-powered lead management platform for sales teams. Capture, score, nurture, and convert leads using intelligent insights.

## Features

- **Dashboard** - KPI metrics, lead status charts, pipeline overview, recent activity feed
- **Lead Management** - Full CRUD with search, filter, sort, and pagination
- **AI Lead Scoring** - Algorithmic scoring based on company profile, engagement, deal value, and pipeline velocity
- **Pipeline Kanban** - Visual drag-and-drop pipeline with status columns
- **AI Insights** - Automated next-best-action recommendations, risk assessments, win probability
- **Activity Timeline** - Log calls, emails, meetings, and notes per lead
- **Global Search** - Instant search across all leads

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, TanStack React Query
- **Backend**: Express, TypeScript, better-sqlite3
- **Monorepo**: npm workspaces with shared types

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Production Build

```bash
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Dashboard metrics |
| GET | /api/leads | List leads (with filters/pagination) |
| POST | /api/leads | Create lead |
| GET | /api/leads/:id | Get lead detail |
| PUT | /api/leads/:id | Update lead |
| PATCH | /api/leads/:id/status | Change lead status |
| DELETE | /api/leads/:id | Delete lead |
| GET | /api/leads/:id/activities | Get lead activities |
| POST | /api/leads/:id/activities | Log activity |
| GET | /api/leads/:id/insights | Get AI insights |
| POST | /api/leads/:id/insights/regenerate | Regenerate AI scoring + insights |
| GET | /api/search?q=... | Global search |
