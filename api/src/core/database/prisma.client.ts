import { PrismaClient, type Prisma } from '@prisma/client'
import { env } from '@/core/config/env'

const log: Prisma.LogLevel[] =
  env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['warn', 'error']

const separator = env.DATABASE_URL.includes('?') ? '&' : '?'
const databaseUrl =
  `${env.DATABASE_URL}${separator}` +
  `connection_limit=${env.DB_POOL_LIMIT}&pool_timeout=${env.DB_POOL_TIMEOUT}`

export const db = new PrismaClient({
  log,
  datasources: { db: { url: databaseUrl } },
})
