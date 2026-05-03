import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user-001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keywordId = searchParams.get("keywordId");
  const source = searchParams.get("source");
  const sentiment = searchParams.get("sentiment");
  const limit = Number(searchParams.get("limit") ?? 50);

  const mentions = await prisma.mention.findMany({
    where: {
      keyword: { userId: DEMO_USER_ID },
      ...(keywordId ? { keywordId } : {}),
      ...(source ? { source: source as any } : {}),
      ...(sentiment ? { sentiment: sentiment as any } : {}),
    },
    include: { keyword: { select: { term: true } } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return NextResponse.json(mentions);
}
