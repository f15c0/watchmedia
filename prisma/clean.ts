import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function clean() {
  const mentions = await prisma.mention.deleteMany({});
  const posts = await prisma.post.deleteMany({});
  console.log(`✅ Deleted ${mentions.count} mentions and ${posts.count} posts`);
  await prisma.$disconnect();
}

clean().catch(console.error);
