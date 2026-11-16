import { PrismaClient } from '@prisma/client'
import { logger } from '../config/logger.js'
import { env } from '../config/env.js'

export const prisma = new PrismaClient({
  log:
    env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ]
      : [{ emit: 'stdout', level: 'error' }],
})

if (env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(prisma as any).$on('query', (e: { query: string; params: string; duration: number }) => {
    logger.debug({ query: e.query, duration: `${e.duration}ms` }, 'Prisma query')
  })
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect()
    logger.info('PostgreSQL connected successfully via Prisma')
  } catch (error) {
    logger.error({ error }, 'Failed to connect to PostgreSQL database')
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
  logger.info('PostgreSQL disconnected')
}

