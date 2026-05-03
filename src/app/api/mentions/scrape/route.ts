import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import Parser from "rss-parser";

const POSITIVE_WORDS = ["growth","success","win","record","launch","improve","rise","boost","achieve","peace","agreement","progress","gain","strong","best","recover","relief","celebrate","approve","award","profit","increase","opportunity","support","invest","develop"];
const NEGATIVE_WORDS = ["crisis","fail","collapse","death","attack","loss","decline","conflict","fraud","arrest","protest","strike","flood","fire","kill","corrupt","injure","crash","scandal","deficit","debt","poor","drop","fall","riot","violence","suspend","ban","reject","accuse"];

function localSentiment(text: string): { sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"; score: number } {
  const lower = text.toLowerCase();
  const pos = POSITIVE_WORDS.filter((w) => lower.includes(w)).length;
  const neg = NEGATIVE_WORDS.filter((w) => lower.includes(w)).length;
  if (pos > neg) return { sentiment: "POSITIVE", score: Math.min(pos * 0.2, 1) };
  if (neg > pos) return { sentiment: "NEGATIVE", score: -Math.min(neg * 0.2, 1) };
  return { sentiment: "NEUTRAL", score: 0 };
}

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

export async function POST() {
  const keywords = await prisma.keyword.findMany({
    where: { userId: DEMO_USER_ID, active: true },
  });

  if (!keywords.length) {
    return NextResponse.json({ scraped: 0, message: "No active keywords" });
  }

  let totalScraped = 0;

  // Fetch all feeds once, then match against all keywords
  const feedResults: { url: string; items: Parser.Item[] }[] = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      feedResults.push({ url: feedUrl, items: feed.items });
    } catch {
      // skip unreachable feeds
    }
  }

  for (const keyword of keywords) {
    const newMentions: {
      keywordId: string;
      source: "NEWS";
      title: string;
      content: string;
      url?: string;
      author?: string;
      sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
      sentimentScore?: number;
      publishedAt: Date;
    }[] = [];

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

        const text = item.title || item.contentSnippet || "";
        const { sentiment, score: sentimentScore } = localSentiment(text);

        newMentions.push({
          keywordId: keyword.id,
          source: "NEWS",
          title: item.title ?? "Untitled",
          content: item.contentSnippet ?? item.title ?? "",
          url: item.link,
          author: item.creator ?? (item as Record<string, string>).author,
          sentiment,
          sentimentScore,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        });
      }
    }

    if (newMentions.length > 0) {
      await prisma.mention.createMany({ data: newMentions });
      totalScraped += newMentions.length;

      await pusherServer.trigger("mentions-feed", "new-mentions", {
        keyword: keyword.term,
        mentions: newMentions,
      });
    }
  }

  return NextResponse.json({ scraped: totalScraped });
}
