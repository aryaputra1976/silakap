import { insightsRepository } from './insights.repository'

const daysBetween = (from: Date, to: Date): number => {
  const diff = to.getTime() - from.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export const insightsService = {
  async summary() {
    const [active, overdue, workload] = await Promise.all([
      insightsRepository.activeUsulan(),
      insightsRepository.overdueSla(),
      insightsRepository.workloadByTahap(),
    ])

    const now = new Date()

    const riskItems = active.map((item) => {
      const sla = item.slaTracker[0]
      const remainingDays = sla?.slaHabisAt ? daysBetween(now, sla.slaHabisAt) : null
      const isOverdue = sla?.slaHabisAt ? sla.slaHabisAt < now : false

      let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'

      if (isOverdue) risk = 'HIGH'
      else if (remainingDays !== null && remainingDays <= 1) risk = 'MEDIUM'

      return {
        id: item.id,
        nomorUsulan: item.nomorUsulan,
        namaAsn: item.asn.nama,
        nip: item.asn.nipBaru,
        layanan: item.jenisLayanan.nama,
        status: item.status,
        tahap: item.tahapSaatIni,
        slaHabisAt: sla?.slaHabisAt ?? null,
        remainingDays,
        risk,
      }
    })

    const highRisk = riskItems.filter((x) => x.risk === 'HIGH')
    const mediumRisk = riskItems.filter((x) => x.risk === 'MEDIUM')

    return {
      totalActive: active.length,
      totalOverdue: overdue.length,
      totalHighRisk: highRisk.length,
      totalMediumRisk: mediumRisk.length,
      workloadByTahap: workload.map((w) => ({
        tahap: w.tahapSaatIni,
        total: w._count._all,
      })),
      recommendations: [
        highRisk.length > 0
          ? `Ada ${highRisk.length} usulan melewati SLA dan perlu prioritas segera.`
          : 'Tidak ada usulan yang melewati SLA.',
        mediumRisk.length > 0
          ? `Ada ${mediumRisk.length} usulan mendekati batas SLA.`
          : 'Tidak ada usulan yang mendekati batas SLA.',
      ],
      riskItems,
    }
  },
}