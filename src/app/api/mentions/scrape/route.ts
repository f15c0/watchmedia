import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { geminiModel } from "@/lib/gemini";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "MediaWatch Pro/1.0" },
});

const DEMO_USER_ID = "demo-user-001";

const RSS_FEEDS = [
  "https://www.graphic.com.gh/feed",
  "https://www.myjoyonline.com/feed/",
  "https://citinewsroom.com/feed/",
  "https://www.ghanaweb.com/GhanaHomePage/RSS/",
  "https://www.modernghana.com/rss/news.aspx",
  "https://feeds.bbci.co.uk/news/world/africa/rss.xml",
  "https://rss.cnn.com/rss/edition_africa.rss",
  "https://www.peacefmonline.com/rss/",
  "https://www.pulse.com.gh/rss",
  "https://starrfm.com.gh/feed/",
];

type SentimentResult = { sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"; score: number };

async function batchSentiment(texts: string[]): Promise<SentimentResult[]> {
  if (texts.length === 0) return [];

  const prompt = `Analyze the sentiment of each news headline/snippet below.
Return ONLY a JSON array (no markdown, no explanation) with one object per item in the same order.
Each object must have:
  "sentiment": "POSITIVE", "NEGATIVE", or "NEUTRAL"
  "score": float from -1.0 (very negative) to 1.0 (very positive)

Items:
${texts.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const raw = result.response.text();
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array in response");
    const parsed: SentimentResult[] = JSON.parse(match[0]);
    if (parsed.length !== texts.length) throw new Error("Length mismatch");
    return parsed;
  } catch {
    // Fall back to neutral if Gemini fails so the scrape still succeeds
    return texts.map(() => ({ sentiment: "NEUTRAL" as const, score: 0 }));
  }
}

export async function POST() {
  const keywords = await prisma.keyword.findMany({
    where: { userId: DEMO_USER_ID, active: true },
  });

  if (!keywords.length) {
    return NextResponse.json({ scraped: 0, message: "No active keywords" });
  }

  // Fetch all feeds once
  const feedResults: { url: string; items: Parser.Item[] }[] = [];
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      feedResults.push({ url: feedUrl, items: feed.items });
    } catch {
      // skip unreachable feeds
    }
  }

  // Collect all new mentions (without sentiment) grouped by keyword
  type PendingMention = {
    keywordId: string;
    keywordTerm: string;
    source: "NEWS";
    title: string;
    content: string;
    url?: string;
    author?: string;
    publishedAt: Date;
    text: string; // used for sentiment batch
  };

  const pending: PendingMention[] = [];

  for (const keyword of keywords) {
    for (const { items } of feedResults) {
      const matched = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(keyword.term) ||
          item.contentSnippet?.toLowerCase().includes(keyword.term) ||
          item.content?.toLowerCase().includes(keyword.term)
      );

      for (const item of matched.slice(0, 3)) {
        const exists = await prisma.mention.findFirst({
          where: { keywordId: keyword.id, url: item.link ?? null },
        });
        if (exists) continue;

        pending.push({
          keywordId: keyword.id,
          keywordTerm: keyword.term,
          source: "NEWS",
          title: item.title ?? "Untitled",
          content: item.contentSnippet ?? item.title ?? "",
          url: item.link,
          author: item.creator ?? (item as Record<string, string>).author,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          text: item.title ?? item.contentSnippet ?? "",
        });
      }
    }
  }

  if (pending.length === 0) {
    return NextResponse.json({ scraped: 0 });
  }

  // Single Gemini call for all articles
  const sentiments = await batchSentiment(pending.map((m) => m.text));

  type MentionRecord = {
    keywordId: string;
    source: "NEWS";
    title: string;
    content: string;
    url?: string;
    author?: string;
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    sentimentScore: number;
    publishedAt: Date;
  };

  // Group by keyword for DB insert + Pusher
  const byKeyword = new Map<string, { term: string; mentions: MentionRecord[] }>();

  for (let idx = 0; idx < pending.length; idx++) {
    const m = pending[idx];
    const { sentiment, score: sentimentScore } = sentiments[idx];

    const record: MentionRecord = {
      keywordId: m.keywordId,
      source: m.source,
      title: m.title,
      content: m.content,
      url: m.url,
      author: m.author,
      sentiment,
      sentimentScore,
      publishedAt: m.publishedAt,
    };

    if (!byKeyword.has(m.keywordId)) {
      byKeyword.set(m.keywordId, { term: m.keywordTerm, mentions: [] });
    }
    byKeyword.get(m.keywordId)!.mentions.push(record);
  }

  let totalScraped = 0;

  for (const [, { term, mentions }] of byKeyword) {
    await prisma.mention.createMany({ data: mentions });
    totalScraped += mentions.length;

    await pusherServer.trigger("mentions-feed", "new-mentions", {
      keyword: term,
      mentions,
    });
  }

  return NextResponse.json({ scraped: totalScraped });
}
