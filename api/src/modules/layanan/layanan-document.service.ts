import path from 'node:path'
import { createHash } from 'crypto'
import { layananRepository } from './layanan.repository'
import { AppError } from '@/core/errors/app-error'
import { env } from '@/core/config/env'

const assertSafePath = (filePath: string): string => {
  const uploadDir = path.resolve(env.UPLOAD_DIR)
  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(uploadDir + path.sep) && resolved !== uploadDir) {
    throw new AppError('Path dokumen tidak valid', 422)
  }
  return resolved
}

export const layananDocumentService = {
  async upload(usulanId: string, file: any, dto: any, userId: string) {
    if (!file) throw new AppError('File wajib', 422)

    const hash = createHash('sha256').update(file.buffer ?? '').digest('hex')

    return layananRepository.createDokumen({
      usulanLayanan: { connect: { id: usulanId } },
      jenisDokumen: dto.jenisDokumen,
      namaFile: file.originalname,
      pathFile: file.path,
      ukuran: BigInt(file.size),
      mimeType: file.mimetype,
      hashFile: hash,
      uploadOleh: { connect: { id: userId } },
    })
  },

  async getOutput(usulanId: string) {
    const doc = await layananRepository.getLatestOutput(usulanId)
    if (!doc || !doc.pathFile) throw new AppError('Dokumen tidak ditemukan', 404)

    const safePath = assertSafePath(doc.pathFile)

    return {
      pathFile: safePath,
      namaFile: doc.namaFile!,
      mimeType: 'application/octet-stream',
    }
  },
}