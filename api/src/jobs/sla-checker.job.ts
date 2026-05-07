import { db } from '@/core/database/prisma.client'
import { ROLES } from '@/shared/constants'
import { notifikasiService } from '@/modules/notifikasi'
import { Prisma } from '@prisma/client'
import { logger } from '@/core/logger/logger'
import {
  getPeremajaanNamaLayanan,
  getPeremajaanSlaHari,
  getPeremajaanSlaStatus,
} from '@/modules/asn/peremajaan-sla.helper'

type PeremajaanRiskRow = {
  id: bigint
  jenisPerubahan: string
  dataBaru: Prisma.JsonValue | string | null
  createdAt: Date
  ditugaskanKepadaId: string | null
  nama: string | null
  nipBaru: string | null
}

type PeremajaanRiskItem = {
  id: bigint
  nama: string
  nipBaru: string
  namaLayanan: string
  ditugaskanKepadaId: string | null
  sla: { hariKe: number; totalSla: number; statusSla: 'OK' | 'Warning' | 'Overdue' }
}

const parseJsonValue = (value: Prisma.JsonValue | string | null): unknown => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const notifyUserOnce = async (
  userId: string,
  payload: { type: string; judul: string; isi: string; link: string },
): Promise<boolean> => {
  const existing = await db.notifikasi.findFirst({
    where: { userId, type: payload.type, link: payload.link, isRead: false },
    select: { id: true },
  })
  if (existing) return false

  await db.notifikasi.create({ data: { userId, ...payload } })
  return true
}

const notifyRoleOnce = async (
  roleName: string,
  payload: { type: string; judul: string; isi: string; link: string },
): Promise<number> => {
  const users = await db.user.findMany({
    where: { role: { nama: roleName, deletedAt: null }, isActive: true, deletedAt: null },
    select: { id: true },
  })

  const results = await Promise.all(users.map((user) => notifyUserOnce(user.id, payload)))
  return results.filter(Boolean).length
}

const getPeremajaanRisks = async (now: Date): Promise<PeremajaanRiskItem[]> => {
  const rows = await db.$queryRaw<PeremajaanRiskRow[]>`
    SELECT
      p.id,
      p.jenis_perubahan AS jenisPerubahan,
      p.data_baru AS dataBaru,
      p.createdAt,
      p.ditugaskan_kepada_id AS ditugaskanKepadaId,
      a.nama,
      a.nip_baru AS nipBaru
    FROM asn_peremajaan p
    INNER JOIN asn a ON a.id = p.asnId
    WHERE p.status_approval = 'Pending'
  `

  return rows
    .map((row) => {
      const dataBaru = parseJsonValue(row.dataBaru)
      const totalSla = getPeremajaanSlaHari(row.jenisPerubahan, dataBaru)
      return {
        id: row.id,
        nama: row.nama ?? '-',
        nipBaru: row.nipBaru ?? '-',
        namaLayanan: getPeremajaanNamaLayanan(row.jenisPerubahan, dataBaru),
        ditugaskanKepadaId: row.ditugaskanKepadaId,
        sla: getPeremajaanSlaStatus(row.createdAt, totalSla, now),
      }
    })
    .filter((item) => item.sla.statusSla !== 'OK')
}

const notifyPeremajaanRisks = async (items: PeremajaanRiskItem[]) => {
  let sent = 0
  const warnings = items.filter((item) => item.sla.statusSla === 'Warning')
  const overdues = items.filter((item) => item.sla.statusSla === 'Overdue')

  for (const item of items) {
    const payload = {
      type: item.sla.statusSla === 'Overdue' ? 'PEREMAJAAN_SLA_OVERDUE' : 'PEREMAJAAN_SLA_WARNING',
      judul: item.sla.statusSla === 'Overdue' ? 'Peremajaan melewati SLA' : 'Peremajaan mendekati SLA',
      isi: `${item.namaLayanan} untuk ${item.nama} (${item.nipBaru}) hari ke-${item.sla.hariKe}/${item.sla.totalSla}.`,
      link: `/asn/peremajaan?ticket=${item.id.toString()}`,
    }

    if (item.ditugaskanKepadaId) {
      if (await notifyUserOnce(item.ditugaskanKepadaId, payload)) sent += 1
    } else {
      sent += await notifyRoleOnce(ROLES.ANALIS_MADYA, payload)
    }
  }

  if (overdues.length > 0) {
    const payload = {
      type: 'PEREMAJAAN_SLA_OVERDUE_SUMMARY',
      judul: 'Eskalasi peremajaan SLA',
      isi: `${overdues.length} tiket peremajaan melewati SLA dan perlu keputusan segera.`,
      link: '/dashboard/kepala-badan',
    }
    sent += await notifyRoleOnce(ROLES.KABID, payload)
    sent += await notifyRoleOnce(ROLES.KEPALA_BADAN, payload)
  }

  if (warnings.length > 0) {
    const payload = {
      type: 'PEREMAJAAN_SLA_WARNING_SUMMARY',
      judul: 'Peremajaan mendekati SLA',
      isi: `${warnings.length} tiket peremajaan mendekati batas SLA.`,
      link: '/dashboard/analis-madya',
    }
    sent += await notifyRoleOnce(ROLES.KABID, payload)
  }

  return sent
}

export async function jalankanSlaChecker(): Promise<{
  warning: number
  overdue: number
  peremajaanWarning: number
  peremajaanOverdue: number
  peremajaanNotifikasi: number
}> {
  const startMs = Date.now()
  logger.info('job:start', { job: 'sla-checker' })
  const now = new Date()
  const warningThreshold = new Date(now.getTime() + 4 * 60 * 60 * 1000)

  const [warnings, overdues, peremajaanRisks] = await Promise.all([
    db.slaTracker.updateMany({
      where: { statusSla: 'OK', slaHabisAt: { lte: warningThreshold }, selesaiAt: null },
      data: { statusSla: 'Warning' },
    }),
    db.slaTracker.updateMany({
      where: { statusSla: { in: ['OK', 'Warning'] }, slaHabisAt: { lt: now }, selesaiAt: null },
      data: { statusSla: 'Overdue' },
    }),
    getPeremajaanRisks(now),
  ])

  if (overdues.count > 0) {
    await notifikasiService.sendToRole(ROLES.KABID, {
      type: 'SLA_OVERDUE',
      judul: 'SLA Terlampaui',
      isi: `${overdues.count} berkas melampaui batas waktu SLA`,
      link: '/dashboard',
    })
  }

  const peremajaanNotifikasi = await notifyPeremajaanRisks(peremajaanRisks)
  const peremajaanWarning = peremajaanRisks.filter((item) => item.sla.statusSla === 'Warning').length
  const peremajaanOverdue = peremajaanRisks.filter((item) => item.sla.statusSla === 'Overdue').length

  const result = {
    warning: warnings.count,
    overdue: overdues.count,
    peremajaanWarning,
    peremajaanOverdue,
    peremajaanNotifikasi,
  }
  logger.info('job:done', { job: 'sla-checker', durationMs: Date.now() - startMs, ...result })
  return result
}
