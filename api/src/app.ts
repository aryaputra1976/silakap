import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import * as Sentry from '@sentry/node'
import { env } from '@/core/config/env'
import { errorMiddleware } from '@/core/middleware/error.middleware'
import { requestIdMiddleware } from '@/core/middleware/request-id.middleware'
import { NotFoundError } from '@/core/errors/not-found.error'
import { openApiDocument, swaggerHtml } from '@/docs/openapi'
import { router } from '@/routes'

export const app = express()

// Percayai satu level proxy (Apache di Hostinger) agar req.ip terbaca benar
app.set('trust proxy', 1)

app.set('json replacer', (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value,
)

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()) }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(requestIdMiddleware)

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'OK',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
    },
  })
})

app.get('/api-docs/openapi.json', (_req, res) => {
  res.json(openApiDocument)
})

app.get('/api-docs', (_req, res) => {
  res.type('html').send(swaggerHtml)
})

app.use(env.API_PREFIX, router)

app.use((_req, _res, next) => {
  next(new NotFoundError('Route tidak ditemukan'))
})

// Sentry error handler must come before the custom error middleware
Sentry.setupExpressErrorHandler(app)
app.use(errorMiddleware)
