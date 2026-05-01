import { env } from '@/core/config/env'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'
type LogMeta = Record<string, unknown>

const write = (level: LogLevel, message: string, meta?: LogMeta): void => {
  if (level === 'debug' && env.NODE_ENV === 'production') return

  if (env.NODE_ENV === 'production') {
    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(meta ?? {}),
    }
    console[level === 'debug' ? 'log' : level](JSON.stringify(payload))
    return
  }

  const suffix = meta ? ` ${JSON.stringify(meta)}` : ''
  console[level === 'debug' ? 'log' : level](`[${level.toUpperCase()}] ${message}${suffix}`)
}

export const logger = {
  info: (message: string, meta?: LogMeta) => write('info', message, meta),
  warn: (message: string, meta?: LogMeta) => write('warn', message, meta),
  error: (message: string, meta?: LogMeta) => write('error', message, meta),
  debug: (message: string, meta?: LogMeta) => write('debug', message, meta),
}
