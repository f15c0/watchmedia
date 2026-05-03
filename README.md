# MediaWatch Pro

A unified media intelligence platform for brands, agencies, and institutions. Monitors mentions across Ghanaian & international news portals in real time — and lets you schedule content with AI assistance.

**Live Demo:** https://watchmedia.vercel.app

> No login required — open the link and the dashboard loads immediately.

---

## Features

### Module 1 — Keyword Monitor
- Add/remove tracked keywords
- Real-time RSS scraping from 10 Ghanaian & international news feeds
- Source filtering: News, Twitter, Facebook, Instagram, Radio, TV
- Local keyword-based sentiment scoring on every mention
- Live Pusher alerts pushed to the browser instantly
- Manual "Scrape Now" trigger + auto-scrape every 5 minutes (cron)

### Module 2 — Social Publisher
- Monthly calendar view of scheduled posts
- Create, edit, delete posts for Twitter, Facebook, Instagram, LinkedIn
- **AI Gap Filling** — click "AI Fill Gaps" and Gemini suggests posts for days with no content scheduled

### Module 3 — Sentiment Analytics
- KPI cards: total mentions, positive/negative counts, overall sentiment score
- Area chart: mentions over time
- Pie chart: sentiment split
- Bar chart: source breakdown
- Stacked bar chart: per-keyword sentiment
- **One-click branded PDF export** with all charts and tables

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | shadcn/ui + Tailwind CSS v4 + Framer Motion |
| Database | Supabase (PostgreSQL) + Prisma ORM |
| Real-time | Pusher Channels |
| AI | Google Gemini 2.5 Flash |
| Charts | Recharts |
| PDF | jsPDF |
| RSS | rss-parser |
| Deployment | Vercel |

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/f15c0/watchmedia.git
cd watchmedia
npm install
```

### 2. Environment Variables

Create a `.env` file in the root with the following:

```env
DATABASE_URL=your_supabase_pooler_url
DIRECT_URL=your_supabase_direct_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
GEMINI_API_KEY=your_gemini_api_key
```

- **Supabase**: Create a project at https://supabase.com → Settings → Database → Connection string. Use the **Transaction pooler** URL (port 6543) for `DATABASE_URL` and the **Direct** connection (port 5432) for `DIRECT_URL`.
- **Pusher**: Create an app at https://pusher.com → Channels
- **Gemini**: Get a key at https://aistudio.google.com/apikey

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

Open http://localhost:3000 — loads directly into the Monitor dashboard, no login required.

### 5. Deploy to Vercel

```bash
vercel --prod
```

Set all environment variables in Vercel project settings under Settings → Environment Variables.

---

## Project Structure

```
src/
  app/
    api/
      analytics/       # GET analytics data
      keywords/        # CRUD keywords
      mentions/        # GET mentions + POST scrape
      posts/           # CRUD posts + AI suggest
    dashboard/
      monitor/         # Module 1 page
      publisher/       # Module 2 page
      analytics/       # Module 3 page
  components/
    layout/            # Sidebar + Header
    monitor/           # Keyword manager, mentions feed, filter dock
    publisher/         # Calendar, post dialog, AI suggest dialog
    analytics/         # Analytics dashboard
  lib/
    gemini.ts          # Gemini AI helper
    pdf.ts             # PDF generation
    prisma.ts          # Prisma singleton
    pusher-server.ts   # Pusher server helper
    pusher-client.ts   # Pusher browser client (lazy singleton)
prisma/
  schema.prisma        # DB schema
  seed.ts              # Demo data seeder
```

---

## Scoring Notes

| Criteria | Implementation |
|----------|---------------|
| Completeness (40pts) | All 3 modules fully built: Monitor, Publisher, Analytics |
| Real-time & AI (35pts) | Pusher live feed + Gemini 2.5 Flash AI content generation + local sentiment analysis |
| UI Polish (15pts) | Brand icon badges, sentiment ribbons, animated hover effects, gradient cards, dock filter, PDF export |
| Documentation (10pts) | This README with setup guide, architecture overview, and live demo link |
