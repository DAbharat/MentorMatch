import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
})

const createPrismaClient = () => {
    return new PrismaClient({ adapter });
}

type prismaClientType = ReturnType<typeof createPrismaClient>;

const globalForPrisma = global as unknown as { prisma : PrismaClient | undefined }

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;