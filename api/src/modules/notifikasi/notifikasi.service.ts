import { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import { emailService } from '@/modules/email'
import type { NotifikasiPayload } from './types/notifikasi.types'
import { whatsappService } from './whatsapp.service'

const sendEmailSafely = async (
  recipient: { email: string | null; namaLengkap?: string | null },
  payload: NotifikasiPayload,
): Promise<void> => {
  try {
    await emailService.sendNotification({
      recipient,
      type: payload.type,
      title: payload.judul ?? 'Notifikasi SILAKAP',
      body: payload.isi ?? 'Ada pembaruan informasi di SILAKAP.',
      link: payload.link,
    })
  } catch (error) {
    console.error('Gagal mengirim email notifikasi', error)
  }
}

const sendWhatsAppSafely = async (
  recipient: { nomorHp: string | null; namaLengkap?: string | null },
  payload: NotifikasiPayload,
): Promise<void> => {
  try {
    await whatsappService.sendNotification(recipient, payload)
  } catch (error) {
    console.error('Gagal mengirim WhatsApp notifikasi', error)
  }
}

export const notifikasiService = {
  async sendToUser(userId: string, payload: NotifikasiPayload): Promise<void> {
    const user = await db.user.findFirst({
      where: { id: userId, isActive: true, deletedAt: null },
      select: { email: true, nomorHp: true, namaLengkap: true },
    })
    await db.notifikasi.create({ data: { userId, ...payload } })
    if (user) await Promise.all([sendEmailSafely(user, payload), sendWhatsAppSafely(user, payload)])
  },

  async sendToRole(roleName: string, payload: NotifikasiPayload): Promise<void> {
    const users = await db.user.findMany({
      where: { role: { nama: roleName, deletedAt: null }, isActive: true, deletedAt: null },
      select: { id: true, email: true, nomorHp: true, namaLengkap: true },
    })

    if (users.length === 0) return
    await db.notifikasi.createMany({
      data: users.map((user) => ({ userId: user.id, ...payload })),
    })
    await Promise.all(users.flatMap((user) => [sendEmailSafely(user, payload), sendWhatsAppSafely(user, payload)]))
  },

  async sendToUnitRole(unitOrganisasiId: string, roleName: string, payload: NotifikasiPayload): Promise<void> {
    const users = await db.user.findMany({
      where: {
        unitOrganisasiId,
        role: { nama: roleName, deletedAt: null },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, email: true, nomorHp: true, namaLengkap: true },
    })

    if (users.length === 0) return
    await db.notifikasi.createMany({
      data: users.map((user) => ({ userId: user.id, ...payload })),
    })
    await Promise.all(users.flatMap((user) => [sendEmailSafely(user, payload), sendWhatsAppSafely(user, payload)]))
  },

  async list(userId: string, query: { page?: unknown; limit?: unknown; isRead?: unknown }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.NotifikasiWhereInput = { userId }
    if (typeof query.isRead === 'string') where.isRead = query.isRead === 'true'

    const [data, total] = await Promise.all([
      db.notifikasi.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.notifikasi.count({ where }),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async count(userId: string) {
    const [total, belumDibaca] = await Promise.all([
      db.notifikasi.count({ where: { userId } }),
      db.notifikasi.count({ where: { userId, isRead: false } }),
    ])

    return { total, belumDibaca }
  },

  async read(userId: string, id: string) {
    const notificationId = BigInt(id)
    const item = await db.notifikasi.findFirst({ where: { id: notificationId, userId } })
    if (!item) throw new AppError('Data tidak ditemukan', 404)
    return db.notifikasi.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    })
  },

  async readAll(userId: string) {
    await db.notifikasi.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
  },

  async remove(userId: string, id: string) {
    const notificationId = BigInt(id)
    const item = await db.notifikasi.findFirst({ where: { id: notificationId, userId } })
    if (!item) throw new AppError('Data tidak ditemukan', 404)
    await db.notifikasi.delete({ where: { id: notificationId } })
  },
}
