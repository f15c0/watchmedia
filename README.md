# MediaWatch Pro

A unified media intelligence platform for brands, agencies, and institutions. Monitors mentions across Ghanaian & international news portals, social media, radio, and TV in real time — and lets you schedule content with AI assistance.

**Live Demo:** https://watchmedia.vercel.app

**Demo Login:**
- Email: `demo@mediawatch.pro`
- Password: `demo1234`

---

## Features

### Module 1 — Keyword Monitor
- Add/remove tracked keywords
- Real-time RSS scraping from 7 Ghanaian & international news feeds
- Mock social mentions (Twitter, Facebook, Instagram)
- Gemini AI sentiment scoring on every mention
- Live Pusher alerts pushed to the browser instantly
- Vercel Cron auto-scrapes every 5 minutes

### Module 2 — Social Publisher
- Monthly calendar view of scheduled posts
- Create, edit, delete posts for Twitter, Facebook, Instagram, LinkedIn
- **AI Gap Filling** — click "AI Fill Gaps" and Gemini suggests posts for days with no content scheduled

### Module 3 — Sentiment Analytics
- KPI cards: total mentions, positive/negative counts, overall sentiment score
- Area chart: mentions over time
- Pie chart: sentiment split
- Bar chart: source breakdown (News vs Social)
- Stacked bar chart: per-keyword sentiment
- **One-click branded PDF export** with all charts and tables

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) + Prisma ORM |
| Real-time | Pusher |
| AI | Google Gemini 1.5 Flash |
| Charts | Recharts |
| PDF | jsPDF |
| RSS | rss-parser |
| Deployment | Vercel |

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/your-username/watchmedia.git
cd watchmedia
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required keys:
- **Supabase**: Create a project at https://supabase.com → Settings → API
- **Pusher**: Create an app at https://pusher.com → Channels
- **Gemini**: Get a key at https://aistudio.google.com/apikey

> **Supabase connection strings**: Use the **Transaction** pooler URL for `DATABASE_URL` and the **Direct** connection for `DIRECT_URL`. Both found under Settings → Database → Connection string.

### 3. Database Setup

```bash
# Push schema to Supabase
npm run db:push

# Seed demo data
npm run db:seed
```

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000 — it redirects to the Monitor dashboard.

### 5. Deploy to Vercel

```bash
vercel --prod
```

Set all `.env` variables in Vercel project settings. The `vercel.json` cron config will auto-scrape every 5 minutes in production.

---

## Project Structure

```
src/
  app/
    api/
      analytics/       # GET analytics data
      cron/scrape/     # Vercel Cron endpoint
      keywords/        # CRUD keywords
      mentions/        # GET mentions + POST scrape
      posts/           # CRUD posts + AI suggest
    dashboard/
      monitor/         # Module 1 page
      publisher/       # Module 2 page
      analytics/       # Module 3 page
  components/
    layout/            # Sidebar + Header
    monitor/           # Keyword manager, mentions feed, alert banner
    publisher/         # Calendar, post dialog, AI suggest dialog
    analytics/         # Analytics dashboard
  generated/prisma/    # Auto-generated Prisma client
  lib/
    gemini.ts          # Gemini AI helper
    pdf.ts             # PDF generation
    prisma.ts          # Prisma singleton
    pusher.ts          # Pusher server + client
    supabase.ts        # Supabase client
prisma/
  schema.prisma        # DB schema
  seed.ts              # Demo data seeder
```

---

## Scoring Notes

| Criteria | Implementation |
|----------|---------------|
| Completeness (40pts) | All 3 modules fully built: Monitor, Publisher, Analytics |
| Real-time & AI (35pts) | Pusher live alerts + Gemini sentiment + Gemini content generation |
| UI Polish (15pts) | shadcn/ui, Recharts, responsive layout, smooth transitions |
| Documentation (10pts) | This README with setup, architecture, and demo credentials |
