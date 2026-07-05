import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL || "postgresql://dummy";

const globalForPrisma7 = globalThis as unknown as { prisma7: PrismaClient };

export const prisma = globalForPrisma7.prisma7 || (() => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
})();

if (process.env.NODE_ENV !== 'production') globalForPrisma7.prisma7 = prisma;
