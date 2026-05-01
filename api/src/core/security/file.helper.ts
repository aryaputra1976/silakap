import crypto from 'crypto'

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
])

export const hashFile = (buffer: Buffer): string => crypto.createHash('sha256').update(buffer).digest('hex')

export const isAllowedMimeType = (mime: string): boolean => allowedMimeTypes.has(mime)
