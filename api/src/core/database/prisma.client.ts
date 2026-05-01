import { PrismaClient, type Prisma } from '@prisma/client'
import { env } from '@/core/config/env'

const log: Prisma.LogLevel[] =
  env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['warn', 'error']

export const db = new PrismaClient({ log })
