import { z } from 'zod'
import path from 'node:path'

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true'
  return value
}, z.boolean())

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET minimal 32 karakter'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).default(10),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOCK_DURATION_MINUTES: z.coerce.number().int().positive().default(30),
  PASSWORD_HISTORY_COUNT: z.coerce.number().int().positive().default(5),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(5),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  BACKUP_DIR: z.string().default('backups'),
  BACKUP_RETENTION_FILES: z.coerce.number().int().positive().default(7),
  MYSQLDUMP_BIN: z.string().default('mysqldump'),
  API_PREFIX: z.string().default('/api/v1'),
  APP_URL: z.string().default('http://localhost:3000'),
  CRON_SECRET: z.string().min(16, 'CRON_SECRET minimal 16 karakter').default('dev-cron-secret'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().optional().default(587),
  SMTP_SECURE: booleanFromEnv.default(false),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default(''),
  WHATSAPP_ENABLED: booleanFromEnv.default(false),
  WHATSAPP_WEBHOOK_URL: z.string().optional().default(''),
  WHATSAPP_TOKEN: z.string().optional().default(''),
  AI_PROVIDER: z.enum(['local', 'openai-compatible']).default('local'),
  AI_API_KEY: z.string().optional().default(''),
  AI_BASE_URL: z.string().url().default('https://api.openai.com/v1/chat/completions'),
  AI_MODEL: z.string().optional().default(''),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  AI_SHARE_SENSITIVE_DATA: booleanFromEnv.default(false),
})

export const env = envSchema.parse(process.env)

if (env.NODE_ENV === 'production') {
  if (!path.isAbsolute(env.UPLOAD_DIR)) {
    throw new Error('UPLOAD_DIR wajib path absolut di production, contoh: /home/username/uploads')
  }
  if (!path.isAbsolute(env.BACKUP_DIR)) {
    throw new Error('BACKUP_DIR wajib path absolut di production, contoh: /home/username/backups')
  }
  if (env.CRON_SECRET === 'dev-cron-secret') {
    throw new Error('CRON_SECRET production wajib diganti')
  }
}

export type Env = typeof env
