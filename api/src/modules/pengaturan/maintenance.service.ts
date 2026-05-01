import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Prisma } from '@prisma/client'
import { env } from '@/core/config/env'
import { auditEnv } from '@/core/config/env-audit'
import { db } from '@/core/database/prisma.client'
import { jalankanBackupDatabase, listBackups } from '@/jobs/db-backup.job'

const cutoffYears = (years: number): Date => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  return date
}

const walkFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkFiles(fullPath)
    if (entry.isFile()) return [fullPath]
    return []
  }))
  return nested.flat()
}

const normalizePath = (value: string): string => path.resolve(value).toLowerCase()

export const maintenanceService = {
  async health() {
    const started = Date.now()
    await db.$queryRaw`SELECT 1`
    const dbLatencyMs = Date.now() - started
    const [userCount, layananCount, latestBackups] = await Promise.all([
      db.user.count({ where: { deletedAt: null } }),
      db.usulanLayanan.count({ where: { deletedAt: null } }),
      listBackups().catch(() => []),
    ])
    const uploadStats = await fs.stat(env.UPLOAD_DIR).catch(() => null)
    const backupStats = await fs.stat(env.BACKUP_DIR).catch(() => null)
    const memory = process.memoryUsage()
    const envAuditResult = auditEnv()

    return {
      status: dbLatencyMs < 1000 ? 'ok' : 'warning',
      uptimeSeconds: Math.round(process.uptime()),
      node: process.version,
      platform: `${os.platform()} ${os.release()}`,
      db: { connected: true, latencyMs: dbLatencyMs },
      counts: { users: userCount, layanan: layananCount },
      storage: {
        uploadDir: env.UPLOAD_DIR,
        uploadDirReady: Boolean(uploadStats?.isDirectory()),
        backupDir: env.BACKUP_DIR,
        backupDirReady: Boolean(backupStats?.isDirectory()),
        backupCount: latestBackups.length,
        latestBackup: latestBackups[0] ?? null,
      },
      memory: {
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
      },
      envAudit: {
        ...envAuditResult,
        ok: envAuditResult.status !== 'critical',
        warnings: envAuditResult.items
          .filter((item) => item.status === 'warning')
          .map((item) => `${item.key}: ${item.message}`),
        errors: envAuditResult.items
          .filter((item) => item.status === 'critical')
          .map((item) => `${item.key}: ${item.message}`),
      },
    }
  },

  async arsipOlderThanOneYear(actor: Express.Request['user']) {
    const cutoff = cutoffYears(1)
    const candidates = await db.usulanLayanan.findMany({
      where: {
        deletedAt: null,
        status: { in: ['Selesai', 'Ditolak'] },
        OR: [{ tglSelesai: { lt: cutoff } }, { updatedAt: { lt: cutoff } }],
        arsipUsulan: { none: {} },
      },
      take: 50,
      include: { asn: true, jenisLayanan: true },
      orderBy: { updatedAt: 'asc' },
    })

    const created = candidates.length > 0
      ? await db.$transaction(
        candidates.map((usulan) => db.arsipUsulan.create({
          data: {
            usulanLayananId: usulan.id,
            alasanArsip: 'Arsip otomatis > 1 tahun',
            diarsipkanOlehId: actor?.id,
            dataSnapshot: {
              nomorUsulan: usulan.nomorUsulan,
              status: usulan.status,
              tahapSaatIni: usulan.tahapSaatIni,
              tanggalUsulan: usulan.tanggalUsulan.toISOString(),
              tglSelesai: usulan.tglSelesai?.toISOString() ?? null,
              asnNama: usulan.asn.nama,
              asnNip: usulan.asn.nipBaru,
              jenisLayanan: usulan.jenisLayanan.nama,
            },
          },
        })),
      )
      : []

    if (created.length > 0) {
      await db.auditLog.create({
        data: {
          userId: actor?.id,
          userNama: actor?.namaLengkap,
          action: 'MAINTENANCE_ARSIP_OLDER_THAN_1Y',
          entityType: 'ArsipUsulan',
          newValues: { total: created.length },
        },
      })
    }

    return { cutoff, archived: created.length, remainingBatchLimit: candidates.length === 50 }
  },

  async backupDatabase(actor: Express.Request['user']) {
    const result = await jalankanBackupDatabase()
    await db.auditLog.create({
      data: {
        userId: actor?.id,
        userNama: actor?.namaLengkap,
        action: 'MAINTENANCE_BACKUP_DB',
        entityType: 'Backup',
        entityId: result.filename,
        newValues: { size: result.size, retained: result.retained },
      },
    })
    return result
  },

  async cleanupOrphanFiles(actor: Express.Request['user'], dryRun = true) {
    const files = await walkFiles(env.UPLOAD_DIR).catch(() => [])
    const [dokumen, output] = await Promise.all([
      db.usulanDokumen.findMany({ select: { pathFile: true } }),
      db.usulanDokumenOutput.findMany({ where: { pathFile: { not: null } }, select: { pathFile: true } }),
    ])
    const referenced = new Set([
      ...dokumen.map((item) => normalizePath(item.pathFile)),
      ...output.map((item) => item.pathFile ? normalizePath(item.pathFile) : ''),
    ].filter(Boolean))

    const orphanFiles = files.filter((file) => !referenced.has(normalizePath(file)))
    if (!dryRun) {
      await Promise.all(orphanFiles.map((file) => fs.rm(file, { force: true })))
      await db.auditLog.create({
        data: {
          userId: actor?.id,
          userNama: actor?.namaLengkap,
          action: 'MAINTENANCE_CLEANUP_ORPHAN_FILES',
          entityType: 'FileStorage',
          newValues: { totalDeleted: orphanFiles.length } as Prisma.InputJsonObject,
        },
      })
    }

    return {
      dryRun,
      scanned: files.length,
      referenced: referenced.size,
      orphanCount: orphanFiles.length,
      orphanFiles: orphanFiles.slice(0, 100),
    }
  },
}
