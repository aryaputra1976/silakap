import { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { emailService } from '@/modules/email'
import type { ConfigSlaDto, UpdateNotifikasiConfigDto, UpsertLaporanOtomatisDto } from './dto/pengaturan.dto'

const parseBigInt = (id: string): bigint => {
  try {
    return BigInt(id)
  } catch {
    throw new AppError('Data tidak ditemukan', 404)
  }
}

const auditLog = async (
  actor: Express.Request['user'],
  action: string,
  entityId: string,
  newValues?: Prisma.InputJsonValue,
): Promise<void> => {
  await db.auditLog.create({
    data: {
      userId: actor?.id,
      userNama: actor?.namaLengkap,
      action,
      entityType: 'ConfigSla',
      entityId,
      newValues,
    },
  })
}

export const pengaturanService = {
  listConfigSla(jenisLayananId?: string) {
    const where: Prisma.ConfigSlaWhereInput = jenisLayananId ? { jenisLayananId: BigInt(jenisLayananId) } : {}
    return db.configSla.findMany({
      where,
      include: { jenisLayanan: { select: { id: true, nama: true, kode: true } } },
      orderBy: [{ jenisLayananId: 'asc' }, { jabatan: 'asc' }],
    })
  },

  async upsertConfigSla(dto: ConfigSlaDto, actor: Express.Request['user']) {
    const existing = await db.configSla.findFirst({
      where: { jenisLayananId: dto.jenisLayananId ?? null, jabatan: dto.jabatan },
    })
    const result = existing
      ? await db.configSla.update({
          where: { id: existing.id },
          data: {
            slaHari: dto.slaHari,
            slaJam: dto.slaJam,
            eskalasiHari: dto.eskalasiHari,
          },
        })
      : await db.configSla.create({
          data: {
            jenisLayananId: dto.jenisLayananId,
            jabatan: dto.jabatan,
            slaHari: dto.slaHari,
            slaJam: dto.slaJam,
            eskalasiHari: dto.eskalasiHari,
          },
        })
    await auditLog(actor, 'UPSERT_CONFIG_SLA', result.id.toString(), {
      jenisLayananId: dto.jenisLayananId?.toString(),
      jabatan: dto.jabatan,
      slaHari: dto.slaHari,
      slaJam: dto.slaJam,
      eskalasiHari: dto.eskalasiHari,
    })
    return result
  },

  async deleteConfigSla(id: string, actor: Express.Request['user']) {
    const configId = parseBigInt(id)
    const existing = await db.configSla.findUnique({ where: { id: configId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    await db.configSla.delete({ where: { id: configId } })
    await auditLog(actor, 'DELETE_CONFIG_SLA', id)
  },

  async testEmail(to: string) {
    if (!emailService.isConfigured()) throw new AppError('SMTP belum dikonfigurasi', 422)
    await emailService.sendTest(to)
    return { to, sentAt: new Date() }
  },

  emailStatus() {
    return {
      configured: emailService.isConfigured(),
      smtpHost: process.env.SMTP_HOST ?? '',
      smtpPort: Number(process.env.SMTP_PORT ?? 587),
      smtpFrom: process.env.SMTP_FROM ?? '',
    }
  },

  listConfigNotifikasi() {
    return db.configNotifikasi.findMany({ orderBy: [{ eventType: 'asc' }, { channel: 'asc' }] })
  },

  async createConfigNotifikasi(dto: UpdateNotifikasiConfigDto, actor: Express.Request['user']) {
    const result = await db.configNotifikasi.create({
      data: {
        eventType: dto.eventType,
        channel: dto.channel,
        penerimaRole: dto.penerimaRole,
        templateMessage: dto.templateMessage,
        isActive: dto.isActive ?? true,
      },
    })
    await auditLog(actor, 'CREATE_CONFIG_NOTIFIKASI', result.id.toString(), dto as Prisma.InputJsonObject)
    return result
  },

  async updateConfigNotifikasi(id: string, dto: UpdateNotifikasiConfigDto, actor: Express.Request['user']) {
    const configId = parseBigInt(id)
    const existing = await db.configNotifikasi.findUnique({ where: { id: configId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    const result = await db.configNotifikasi.update({
      where: { id: configId },
      data: {
        eventType: dto.eventType,
        channel: dto.channel,
        penerimaRole: dto.penerimaRole,
        templateMessage: dto.templateMessage,
        isActive: dto.isActive,
      },
    })
    await auditLog(actor, 'UPDATE_CONFIG_NOTIFIKASI', id, dto as Prisma.InputJsonObject)
    return result
  },

  listLaporanOtomatis() {
    return db.configLaporanOtomatis.findMany({ orderBy: [{ jenisLaporan: 'asc' }, { penerimaRole: 'asc' }] })
  },

  async upsertLaporanOtomatis(dto: UpsertLaporanOtomatisDto, actor: Express.Request['user']) {
    const result = dto.id
      ? await db.configLaporanOtomatis.update({
          where: { id: dto.id },
          data: {
            jenisLaporan: dto.jenisLaporan,
            jadwalPengiriman: dto.jadwalPengiriman,
            formatLaporan: dto.formatLaporan,
            penerimaRole: dto.penerimaRole,
            isActive: dto.isActive,
          },
        })
      : await db.configLaporanOtomatis.create({
          data: {
            jenisLaporan: dto.jenisLaporan,
            jadwalPengiriman: dto.jadwalPengiriman,
            formatLaporan: dto.formatLaporan,
            penerimaRole: dto.penerimaRole,
            isActive: dto.isActive ?? true,
          },
        })
    await auditLog(actor, 'UPSERT_LAPORAN_OTOMATIS', result.id.toString(), {
      ...dto,
      id: dto.id?.toString(),
    })
    return result
  },
}
