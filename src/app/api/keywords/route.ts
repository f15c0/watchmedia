import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user-001";

export async function GET() {
  const keywords = await prisma.keyword.findMany({
    where: { userId: DEMO_USER_ID, active: true },
    include: { _count: { select: { mentions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(keywords);
}

export async function POST(req: Request) {
  const { term } = await req.json();
  if (!term?.trim()) {
    return NextResponse.json({ error: "Term is required" }, { status: 400 });
  }

  const keyword = await prisma.keyword.upsert({
    where: { term_userId: { term: term.trim().toLowerCase(), userId: DEMO_USER_ID } },
    update: { active: true },
    create: { term: term.trim().toLowerCase(), userId: DEMO_USER_ID },
  });

  return NextResponse.json(keyword);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.keyword.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
