import path from 'path'
import { randomUUID } from 'crypto'
import fs from 'fs'
import multer from 'multer'
import { env } from '@/core/config/env'
import { AppError } from '@/core/errors/app-error'
import { isAllowedMimeType } from '@/core/security/file.helper'

fs.mkdirSync(env.UPLOAD_DIR, { recursive: true, mode: 0o700 })

const storage = multer.diskStorage({
  destination: env.UPLOAD_DIR,
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname)
    callback(null, `${randomUUID()}${extension}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!isAllowedMimeType(file.mimetype)) {
      return callback(new AppError('Tipe file tidak diizinkan', 422))
    }

    return callback(null, true)
  },
})
