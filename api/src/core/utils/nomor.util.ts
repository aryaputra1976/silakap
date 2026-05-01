import { db } from '@/core/database/prisma.client'

const pad = (value: number): string => value.toString().padStart(6, '0')

export const generateNomorUsulan = async (): Promise<string> => {
  const year = new Date().getFullYear()
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)
  const count = await db.usulanLayanan.count({
    where: { tanggalUsulan: { gte: start, lt: end } },
  })

  return `USL/${year}/${pad(count + 1)}`
}

export const generateNomorDokumen = async (jenis: string): Promise<string> => {
  const year = new Date().getFullYear()
  const count = await db.usulanDokumenOutput.count({
    where: {
      nomorDokumen: { startsWith: `${jenis}/${year}/` },
    },
  })

  return `${jenis}/${year}/${pad(count + 1)}`
}
