import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { subDays, subHours } from "date-fns";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEMO_USER_ID = "demo-user-001";

const KEYWORDS = ["ghana election", "ndc", "npp", "ghana economy", "bank of ghana"];

const MOCK_MENTIONS = [
  { title: "Ghana Election Results: NPP Claims Victory in Close Race", source: "NEWS", sentiment: "NEUTRAL" },
  { title: "NDC Supporters Rally in Accra as Vote Count Continues", source: "NEWS", sentiment: "POSITIVE" },
  { title: "Bank of Ghana Raises Interest Rate to Combat Inflation", source: "NEWS", sentiment: "NEGATIVE" },
  { title: "Ghana Economy Shows Signs of Recovery in Q3 Report", source: "NEWS", sentiment: "POSITIVE" },
  { title: "NPP Promises Infrastructure Boost Ahead of Elections", source: "TWITTER", sentiment: "POSITIVE" },
  { title: "Citizens Voice Concern Over Ghana Economy Amid Rising Costs", source: "FACEBOOK", sentiment: "NEGATIVE" },
  { title: "NDC Manifesto Unveiled: Key Points You Need to Know", source: "NEWS", sentiment: "NEUTRAL" },
  { title: "Bank of Ghana Issues Warning on Digital Currency Risks", source: "NEWS", sentiment: "NEGATIVE" },
  { title: "Ghana Election Commission Confirms Voter Registration Numbers", source: "TWITTER", sentiment: "NEUTRAL" },
  { title: "NPP Celebrates Regional Win in Northern Ghana", source: "INSTAGRAM", sentiment: "POSITIVE" },
];

async function main() {
  console.log("Seeding database...");

  // Upsert demo user
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "demo@mediawatch.pro",
      name: "Demo User",
    },
  });

  // Seed keywords
  const createdKeywords: Record<string, string> = {};
  for (const term of KEYWORDS) {
    const kw = await prisma.keyword.upsert({
      where: { term_userId: { term, userId: DEMO_USER_ID } },
      update: {},
      create: { term, userId: DEMO_USER_ID },
    });
    createdKeywords[term] = kw.id;
  }

  // Seed mentions spread over the last 7 days
  for (let i = 0; i < MOCK_MENTIONS.length; i++) {
    const m = MOCK_MENTIONS[i];
    const keyword = KEYWORDS[i % KEYWORDS.length];
    const keywordId = createdKeywords[keyword];

    await prisma.mention.create({
      data: {
        keywordId,
        source: m.source as any,
        title: m.title,
        content: `${m.title}. This is demo content for the MediaWatch Pro platform showcasing real-time media monitoring capabilities across Ghanaian and international news sources.`,
        sentiment: m.sentiment as any,
        sentimentScore: m.sentiment === "POSITIVE" ? 0.7 : m.sentiment === "NEGATIVE" ? -0.6 : 0.05,
        publishedAt: subHours(new Date(), i * 8),
        url: `https://example.com/article-${i + 1}`,
        author: ["@ghananews", "Joy FM", "Citi Newsroom", "Ghana Web"][i % 4],
      },
    });
  }

  // Seed scheduled posts
  const postContents = [
    { content: "📊 Monitoring Ghana's media landscape so you don't have to. Real-time alerts, AI insights, one dashboard. #MediaWatch #Ghana", platform: ["TWITTER"] },
    { content: "Stay ahead of the narrative. MediaWatch Pro tracks mentions across 50+ Ghanaian news portals, social media, and broadcast media. Try it free today!", platform: ["FACEBOOK"] },
    { content: "Your brand's reputation matters. Let AI-powered sentiment analysis tell you how Ghana is talking about you. #BrandMonitoring", platform: ["TWITTER", "LINKEDIN"] },
  ];

  for (let i = 0; i < postContents.length; i++) {
    await prisma.post.create({
      data: {
        userId: DEMO_USER_ID,
        content: postContents[i].content,
        platform: postContents[i].platform as any,
        scheduledAt: subDays(new Date(), -i - 1),
        status: "SCHEDULED",
        aiGenerated: i === 2,
      },
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
