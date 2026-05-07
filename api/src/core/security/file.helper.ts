import crypto from 'crypto'
import path from 'node:path'

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
])

const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.xlsx', '.xls', '.docx'])

export const hashFile = (buffer: Buffer): string => crypto.createHash('sha256').update(buffer).digest('hex')

export const isAllowedMimeType = (mime: string): boolean => allowedMimeTypes.has(mime)

export const isAllowedExtension = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase()
  return allowedExtensions.has(ext)
}
