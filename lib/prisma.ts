import { PrismaClient } from "@prisma/client";

// Next.js reloads modules frequently in dev mode. Without this guard, every
// reload would create a brand new PrismaClient (and a new DB connection),
// eventually exhausting connections. Storing it on `globalThis` makes it
// survive hot reloads.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
