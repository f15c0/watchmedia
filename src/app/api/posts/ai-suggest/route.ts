import { NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { startOfDay, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";

const DEMO_USER_ID = "demo-user-001";

export async function POST(req: Request) {
  try {
    const { month, platform, topic } = await req.json();

    const [year, m] = (month as string).split("-").map(Number);
    const monthStart = startOfMonth(new Date(year, m - 1));
    const monthEnd = endOfMonth(new Date(year, m - 1));

    const existingPosts = await prisma.post.findMany({
      where: {
        userId: DEMO_USER_ID,
        scheduledAt: { gte: monthStart, lte: monthEnd },
      },
      select: { scheduledAt: true },
    });

    const scheduledDays = new Set(
      existingPosts.map((p) => startOfDay(p.scheduledAt).toISOString())
    );

    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const gaps = allDays.filter((d) => !scheduledDays.has(startOfDay(d).toISOString()));

    if (gaps.length === 0) {
      return NextResponse.json({ suggestions: [], message: "No gaps found in this month." });
    }

    const gapDates = gaps.slice(0, 7).map((d) => d.toISOString().split("T")[0]);
    const platformName = platform ?? "TWITTER";
    const topicContext = topic ? ` Focus on the topic: "${topic}".` : "";

    const prompt = `You are a social media manager for a Ghanaian media monitoring brand called MediaWatch Pro.
Generate ${gapDates.length} engaging social media post${gapDates.length > 1 ? "s" : ""} for ${platformName}.${topicContext}
Keep each post concise (under 280 characters for TWITTER, up to 500 for others), professional, and relevant to African media/brand monitoring.
Include relevant hashtags.

Respond ONLY with a raw JSON array — no markdown, no code fences, no explanation:
[
  { "date": "YYYY-MM-DD", "content": "post text here", "platform": "${platformName}" }
]

Dates to fill: ${gapDates.join(", ")}`;

    const raw = await generateContent(prompt);

    // Extract JSON array robustly — strip markdown fences then find the array
    const stripped = raw.replace(/```json|```/gi, "").trim();
    const match = stripped.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("Gemini response had no JSON array:", raw);
      return NextResponse.json({ error: "Gemini returned an unexpected format" }, { status: 502 });
    }

    const suggestions = JSON.parse(match[0]);
    return NextResponse.json({ suggestions });

  } catch (err) {
    console.error("AI suggest error:", err);
    return NextResponse.json({ error: "AI generation failed", detail: String(err) }, { status: 500 });
  }
}
