import { PrismaClient, Prisma } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClientOptions: Prisma.PrismaClientOptions = {
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL
    }
  },
  log: ['query'] as Prisma.LogLevel[]
}

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
