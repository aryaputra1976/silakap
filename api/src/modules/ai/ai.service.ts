import type { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { env } from '@/core/config/env'
import { AppError } from '@/core/errors/app-error'
import { ROLES } from '@/shared/constants'
import type { AiCekKelengkapanDto, AiChatDto } from './dto/ai.dto'
import { AI_SYSTEM_PROMPT, buildDocumentCheckPrompt, buildUsulanSummaryPrompt } from './ai.prompt'
import { aiProvider, type AiMessage } from './ai.provider'

type Actor = Express.Request['user']

type UsulanAiContext = Prisma.UsulanLayananGetPayload<{
  include: {
    asn: {
      include: {
        golongan: true
        jenisJabatan: true
        jabatan: true
        unitOrganisasi: true
        tingkatPendidikan: true
      }
    }
    jenisLayanan: { include: { persyaratanLayanan: true } }
    unitOrganisasi: true
    diajukanOleh: { select: { id: true; namaLengkap: true } }
    dokumen: true
    workflowLog: { include: { dilakukanOleh: { select: { id: true; namaLengkap: true } } } }
    slaTracker: true
    usulanRevisi: true
  }
}>

const canReadAllUsulan = (roleName?: string): boolean =>
  [
    ROLES.ADMIN_SISTEM,
    ROLES.ANALIS_PERTAMA,
    ROLES.ANALIS_MUDA,
    ROLES.ANALIS_MADYA,
    ROLES.KABID,
    ROLES.KEPALA_BADAN,
  ].some((role) => role === roleName)

const maskMiddle = (value?: string | null): string | null => {
  if (!value) return null
  if (env.AI_SHARE_SENSITIVE_DATA) return value
  if (value.length <= 4) return '****'
  return `${value.slice(0, 3)}${'*'.repeat(Math.max(value.length - 7, 4))}${value.slice(-4)}`
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const findMissingRequirements = (usulan: UsulanAiContext): string[] => {
  const docs = usulan.dokumen.map((doc) => normalize(`${doc.jenisDokumen ?? ''} ${doc.namaFile}`))
  return usulan.jenisLayanan.persyaratanLayanan
    .filter((item) => item.isRequired)
    .filter((item) => {
      const required = normalize(item.namaPersyaratan)
      if (!required) return false
      return !docs.some((doc) => doc.includes(required) || required.includes(doc))
    })
    .map((item) => item.namaPersyaratan)
}

const formatDate = (date?: Date | null): string | null => (date ? date.toISOString().slice(0, 10) : null)

const buildUsulanContext = (usulan: UsulanAiContext): string => {
  const activeSla = usulan.slaTracker.find((item) => !item.selesaiAt)
  const missingRequirements = findMissingRequirements(usulan)
  const jabatan =
    usulan.asn.jabatan?.nama ??
    null

  return JSON.stringify(
    {
      usulan: {
        id: usulan.id,
        nomorUsulan: usulan.nomorUsulan,
        jenisLayanan: usulan.jenisLayanan.nama,
        kodeLayanan: usulan.jenisLayanan.kode,
        status: usulan.status,
        tahapSaatIni: usulan.tahapSaatIni,
        tanggalUsulan: formatDate(usulan.tanggalUsulan),
        unitPengaju: usulan.unitOrganisasi.nama,
        catatan: {
          AP: usulan.catatanAp,
          AM: usulan.catatanAm,
          AD: usulan.catatanAd,
          Kabid: usulan.catatanKabid,
          KepalaBadan: usulan.catatanKepalaBadan,
          alasanPenolakan: usulan.alasanPenolakan,
        },
      },
      asn: {
        id: usulan.asn.id,
        nama: usulan.asn.nama,
        nipBaru: maskMiddle(usulan.asn.nipBaru),
        statusPegawai: usulan.asn.statusPegawai,
        golongan: usulan.asn.golongan?.kode ?? null,
        masaKerja: `${usulan.asn.mkTahun} tahun ${usulan.asn.mkBulan} bulan`,
        jenisJabatan: usulan.asn.jenisJabatan?.nama ?? null,
        jabatan,
        unitOrganisasi: usulan.asn.unitOrganisasi?.nama ?? null,
        pendidikan: usulan.asn.tingkatPendidikan?.nama ?? null,
        tahunLulus: usulan.asn.tahunLulus,
        nikValid: usulan.asn.nikValid,
        flagIkd: usulan.asn.flagIkd,
        lastSyncSiasn: formatDate(usulan.asn.lastSyncSiasn),
      },
      persyaratan: usulan.jenisLayanan.persyaratanLayanan
        .sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999))
        .map((item) => ({
          nama: item.namaPersyaratan,
          wajib: item.isRequired,
        })),
      dokumenTerunggah: usulan.dokumen.map((doc) => ({
        jenisDokumen: doc.jenisDokumen,
        namaFile: doc.namaFile,
        mimeType: doc.mimeType,
        versi: doc.versi,
        uploadedAt: doc.createdAt.toISOString(),
      })),
      dokumenWajibBelumTerlihat: missingRequirements,
      slaAktif: activeSla
        ? {
            tahapSaat: activeSla.tahapSaat,
            statusSla: activeSla.statusSla,
            masukTahap: activeSla.masukTahap.toISOString(),
            slaHabisAt: activeSla.slaHabisAt.toISOString(),
            eskalasi: activeSla.eskalasi,
          }
        : null,
      revisi: usulan.usulanRevisi.map((item) => ({
        nomorRevisi: item.nomorRevisi,
        dariTahap: item.dariTahap,
        keTahap: item.keTahap,
        statusRevisi: item.statusRevisi,
        alasan: item.alasanDikembalikan,
      })),
      workflowTerakhir: usulan.workflowLog.slice(0, 8).map((log) => ({
        aksi: log.aksi,
        dariTahap: log.dariTahap,
        keTahap: log.keTahap,
        oleh: log.dilakukanOleh?.namaLengkap ?? null,
        catatan: log.catatan,
        waktu: log.createdAt.toISOString(),
      })),
    },
    null,
    2,
  )
}

const getUsulanForAi = async (id: string, actor: Actor): Promise<UsulanAiContext> => {
  const usulan = await db.usulanLayanan.findFirst({
    where: { id, deletedAt: null },
    include: {
      asn: {
        include: {
          golongan: true,
          jenisJabatan: true,
          jabatan: true,
          unitOrganisasi: true,
          tingkatPendidikan: true,
        },
      },
      jenisLayanan: {
        include: {
          persyaratanLayanan: { orderBy: [{ urutan: 'asc' }, { id: 'asc' }] },
        },
      },
      unitOrganisasi: true,
      diajukanOleh: { select: { id: true, namaLengkap: true } },
      dokumen: { orderBy: { createdAt: 'desc' } },
      workflowLog: {
        take: 15,
        include: { dilakukanOleh: { select: { id: true, namaLengkap: true } } },
        orderBy: { createdAt: 'desc' },
      },
      slaTracker: { orderBy: { masukTahap: 'desc' } },
      usulanRevisi: { orderBy: { nomorRevisi: 'desc' } },
    },
  })

  if (!usulan) throw new AppError('Usulan tidak ditemukan', 404)
  if (!canReadAllUsulan(actor?.roleName) && actor?.unitOrganisasiId !== usulan.unitOrganisasiId.toString()) {
    throw new AppError('Anda tidak memiliki akses ke usulan ini', 403)
  }

  return usulan
}

const writeAudit = async (
  actor: Actor,
  action: string,
  entityId: string | null,
  detail: Record<string, unknown>,
): Promise<void> => {
  await db.auditLog.create({
    data: {
      userId: actor?.id,
      userNama: actor?.namaLengkap,
      action,
      entityType: 'AI',
      entityId,
      newValues: detail as Prisma.InputJsonObject,
    },
  })
}

const localSummary = (usulan: UsulanAiContext): string => {
  const missing = findMissingRequirements(usulan)
  const activeSla = usulan.slaTracker.find((item) => !item.selesaiAt)
  const documents = usulan.dokumen.length
    ? usulan.dokumen.map((doc) => `- ${doc.jenisDokumen ?? 'Dokumen'}: ${doc.namaFile}`).join('\n')
    : '- Belum ada dokumen terunggah'

  return [
    `1. Ringkasan singkat\nUsulan ${usulan.nomorUsulan} adalah layanan ${usulan.jenisLayanan.nama} untuk ${usulan.asn.nama} pada unit ${usulan.unitOrganisasi.nama}.`,
    `2. Status dan posisi workflow\nStatus saat ini ${usulan.status}${usulan.tahapSaatIni ? ` di tahap ${usulan.tahapSaatIni}` : ''}.`,
    `3. Dokumen dan persyaratan\n${documents}\n\nPersyaratan wajib yang belum terlihat cocok: ${missing.length ? missing.join(', ') : 'tidak ada berdasarkan nama dokumen yang terunggah'}.`,
    `4. Catatan risiko atau perhatian\n${activeSla ? `SLA aktif berada pada status ${activeSla.statusSla}, batas ${activeSla.slaHabisAt.toISOString()}.` : 'Tidak ada SLA aktif yang tercatat.'}`,
    `5. Rekomendasi tindak lanjut\nVerifikasi isi dokumen secara manual, cek kesesuaian data ASN dengan SIASN, lalu lanjutkan workflow bila dokumen dan data sudah valid.`,
  ].join('\n\n')
}

const localDocumentCheck = (usulan: UsulanAiContext): string => {
  const missing = findMissingRequirements(usulan)
  const required = usulan.jenisLayanan.persyaratanLayanan.filter((item) => item.isRequired)
  const available = required
    .map((item) => item.namaPersyaratan)
    .filter((name) => !missing.includes(name))

  return [
    `1. Kesimpulan kelengkapan\n${missing.length ? 'Berkas belum dapat dianggap lengkap karena masih ada persyaratan wajib yang belum terlihat.' : 'Berkas terlihat lengkap berdasarkan kecocokan nama dokumen dan daftar persyaratan.'}`,
    `2. Persyaratan yang terlihat terpenuhi\n${available.length ? available.map((name) => `- ${name}`).join('\n') : '- Belum ada persyaratan wajib yang terdeteksi terpenuhi.'}`,
    `3. Persyaratan yang belum terlihat/masih perlu dicek\n${missing.length ? missing.map((name) => `- ${name}`).join('\n') : '- Tidak ada berdasarkan nama dokumen yang tersedia.'}`,
    '4. Rekomendasi untuk OPD atau analis\nCek isi file satu per satu, bukan hanya nama file. Bila nama dokumen tidak sesuai persyaratan, minta OPD mengganti jenis/nama dokumen agar mudah diverifikasi.',
  ].join('\n\n')
}

const completeOrFallback = async (
  messages: AiMessage[],
  fallback: string,
): Promise<{ answer: string; provider: string; warning?: string }> => {
  const result = await aiProvider.complete(messages)
  return {
    answer: result.content?.trim() || fallback,
    provider: result.content ? result.provider : 'local',
    warning: result.warning,
  }
}

export const aiService = {
  status() {
    return {
      provider: env.AI_PROVIDER,
      externalEnabled: env.AI_PROVIDER !== 'local' && Boolean(env.AI_API_KEY && env.AI_MODEL),
      model: env.AI_MODEL || null,
      shareSensitiveData: env.AI_SHARE_SENSITIVE_DATA,
    }
  },

  async chat(dto: AiChatDto, actor: Actor) {
    const usulan = dto.usulanId ? await getUsulanForAi(dto.usulanId, actor) : null
    const context = usulan ? buildUsulanContext(usulan) : 'Tidak ada konteks usulan spesifik.'
    const fallback = usulan
      ? localSummary(usulan)
      : 'Saya bisa membantu menjelaskan status layanan, ringkasan usulan, cek kelengkapan dokumen, SLA, dan catatan workflow berdasarkan data SILAKAP yang tersedia.'

    const result = await completeOrFallback(
      [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Mode: ${dto.mode}\nPertanyaan user: ${dto.message}\n\nKonteks:\n${context}`,
        },
      ],
      fallback,
    )

    await writeAudit(actor, 'AI_CHAT', dto.usulanId ?? null, {
      mode: dto.mode,
      hasUsulanContext: Boolean(dto.usulanId),
      provider: result.provider,
    })

    return { ...result, generatedAt: new Date().toISOString() }
  },

  async ringkasUsulan(id: string, actor: Actor) {
    const usulan = await getUsulanForAi(id, actor)
    const context = buildUsulanContext(usulan)
    const result = await completeOrFallback(
      [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: buildUsulanSummaryPrompt(context) },
      ],
      localSummary(usulan),
    )

    await writeAudit(actor, 'AI_RINGKAS_USULAN', id, {
      nomorUsulan: usulan.nomorUsulan,
      provider: result.provider,
    })

    return { ...result, generatedAt: new Date().toISOString() }
  },

  async cekKelengkapan(id: string, dto: AiCekKelengkapanDto, actor: Actor) {
    const usulan = await getUsulanForAi(id, actor)
    const context = buildUsulanContext(usulan)
    const result = await completeOrFallback(
      [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: buildDocumentCheckPrompt(context, dto.catatanTambahan) },
      ],
      localDocumentCheck(usulan),
    )

    await writeAudit(actor, 'AI_CEK_KELENGKAPAN', id, {
      nomorUsulan: usulan.nomorUsulan,
      provider: result.provider,
      totalDokumen: usulan.dokumen.length,
      totalPersyaratan: usulan.jenisLayanan.persyaratanLayanan.length,
    })

    return { ...result, generatedAt: new Date().toISOString() }
  },
}
