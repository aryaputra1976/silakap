import path from 'node:path'
import { env } from './env'

type AuditStatus = 'ok' | 'warning' | 'critical'

type AuditItem = {
  key: string
  status: AuditStatus
  message: string
}

const isPlaceholder = (value: string): boolean =>
  value.includes('isi-random') || value.includes('yourdomain') || value.includes('DB_USER') || value.includes('DB_PASS')

const strongSecret = (value: string): boolean =>
  value.length >= 64 && !isPlaceholder(value) && !/(.)\1{12,}/.test(value)

const corsSafe = (): boolean => {
  const origins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  return origins.every((origin) => origin.startsWith('https://')) && !origins.includes('*')
}

export const auditEnv = (): { status: AuditStatus; items: AuditItem[] } => {
  const items: AuditItem[] = [
    {
      key: 'NODE_ENV',
      status: env.NODE_ENV === 'production' ? 'ok' : 'warning',
      message: env.NODE_ENV === 'production' ? 'Production mode aktif' : 'NODE_ENV belum production',
    },
    {
      key: 'JWT_SECRET',
      status: strongSecret(env.JWT_SECRET) ? 'ok' : 'critical',
      message: strongSecret(env.JWT_SECRET) ? 'JWT_SECRET kuat' : 'JWT_SECRET harus random minimal 64 karakter dan bukan placeholder',
    },
    {
      key: 'JWT_REFRESH_SECRET',
      status: strongSecret(env.JWT_REFRESH_SECRET) ? 'ok' : 'critical',
      message: strongSecret(env.JWT_REFRESH_SECRET) ? 'JWT_REFRESH_SECRET kuat' : 'JWT_REFRESH_SECRET harus random minimal 64 karakter dan bukan placeholder',
    },
    {
      key: 'BCRYPT_ROUNDS',
      status: env.BCRYPT_ROUNDS >= 10 ? 'ok' : 'warning',
      message: env.BCRYPT_ROUNDS >= 10 ? 'BCRYPT_ROUNDS memadai' : 'BCRYPT_ROUNDS disarankan minimal 10',
    },
    {
      key: 'CORS_ORIGINS',
      status: corsSafe() ? 'ok' : 'critical',
      message: corsSafe() ? 'CORS hanya HTTPS eksplisit' : 'CORS production harus HTTPS eksplisit dan tidak wildcard',
    },
    {
      key: 'SENTRY_DSN',
      status: process.env.SENTRY_DSN ? 'ok' : 'warning',
      message: process.env.SENTRY_DSN ? 'Sentry DSN tersedia' : 'SENTRY_DSN belum diisi',
    },
    {
      key: 'UPLOAD_DIR',
      status: path.isAbsolute(env.UPLOAD_DIR) ? 'ok' : 'critical',
      message: path.isAbsolute(env.UPLOAD_DIR) ? 'UPLOAD_DIR absolut' : 'UPLOAD_DIR harus path absolut untuk storage permanen',
    },
    {
      key: 'BACKUP_DIR',
      status: path.isAbsolute(env.BACKUP_DIR) ? 'ok' : 'critical',
      message: path.isAbsolute(env.BACKUP_DIR) ? 'BACKUP_DIR absolut' : 'BACKUP_DIR harus path absolut untuk backup permanen',
    },
    {
      key: 'CRON_SECRET',
      status: strongSecret(env.CRON_SECRET) ? 'ok' : 'critical',
      message: strongSecret(env.CRON_SECRET) ? 'CRON_SECRET kuat' : 'CRON_SECRET harus random minimal 64 karakter',
    },
  ]

  const status: AuditStatus = items.some((item) => item.status === 'critical')
    ? 'critical'
    : items.some((item) => item.status === 'warning')
      ? 'warning'
      : 'ok'

  return { status, items }
}
