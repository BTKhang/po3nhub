import { PrismaClient } from '@prisma/client';

declare const process: any;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export * from '@prisma/client';