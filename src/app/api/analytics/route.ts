import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";

const DEMO_USER_ID = "demo-user-001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 7);

  const since = subDays(new Date(), days);

  const mentions = await prisma.mention.findMany({
    where: {
      keyword: { userId: DEMO_USER_ID },
      publishedAt: { gte: since },
    },
    include: { keyword: { select: { term: true } } },
    orderBy: { publishedAt: "asc" },
  });

  // Sentiment breakdown
  const sentimentCounts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
  for (const m of mentions) {
    sentimentCounts[m.sentiment as keyof typeof sentimentCounts]++;
  }

  // Mentions over time (daily)
  const byDay: Record<string, number> = {};
  for (const m of mentions) {
    const day = format(m.publishedAt, "MMM dd");
    byDay[day] = (byDay[day] ?? 0) + 1;
  }
  const mentionsTrend = Object.entries(byDay).map(([date, count]) => ({ date, count }));

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  for (const m of mentions) {
    sourceCounts[m.source] = (sourceCounts[m.source] ?? 0) + 1;
  }
  const sourceBreakdown = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));

  // Per-keyword sentiment
  const keywordSentiment: Record<string, { positive: number; negative: number; neutral: number; total: number }> = {};
  for (const m of mentions) {
    const term = m.keyword.term;
    if (!keywordSentiment[term]) keywordSentiment[term] = { positive: 0, negative: 0, neutral: 0, total: 0 };
    keywordSentiment[term].total++;
    if (m.sentiment === "POSITIVE") keywordSentiment[term].positive++;
    else if (m.sentiment === "NEGATIVE") keywordSentiment[term].negative++;
    else keywordSentiment[term].neutral++;
  }
  const keywordStats = Object.entries(keywordSentiment).map(([keyword, stats]) => ({ keyword, ...stats }));

  // Average sentiment score
  const scores = mentions.filter((m) => m.sentimentScore != null).map((m) => m.sentimentScore!);
  const avgSentimentScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return NextResponse.json({
    totalMentions: mentions.length,
    sentimentBreakdown: sentimentCounts,
    mentionsTrend,
    sourceBreakdown,
    keywordStats,
    avgSentimentScore: Math.round(avgSentimentScore * 100) / 100,
  });
}
