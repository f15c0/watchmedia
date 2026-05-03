import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user-001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  let dateFilter = {};
  if (month) {
    const [year, m] = month.split("-").map(Number);
    dateFilter = {
      scheduledAt: {
        gte: new Date(year, m - 1, 1),
        lt: new Date(year, m, 1),
      },
    };
  }

  const posts = await prisma.post.findMany({
    where: { userId: DEMO_USER_ID, ...dateFilter },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { content, platform, scheduledAt, aiGenerated } = body;

  if (!content || !scheduledAt) {
    return NextResponse.json({ error: "content and scheduledAt are required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: DEMO_USER_ID,
      content,
      platform: platform ?? ["TWITTER"],
      scheduledAt: new Date(scheduledAt),
      aiGenerated: aiGenerated ?? false,
      status: "SCHEDULED",
    },
  });

  return NextResponse.json(post);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, content, scheduledAt, status, platform } = body;

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(content ? { content } : {}),
      ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
      ...(status ? { status } : {}),
      ...(platform ? { platform } : {}),
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
