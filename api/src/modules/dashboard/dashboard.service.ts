import { dashboardRepository } from './dashboard.repository'

export const dashboardService = {
  // ─── Enterprise Dashboard ────────────────────────────────────────────────

  async summary() {
    const [total, byStatus, byTahap, sla] = await Promise.all([
      dashboardRepository.countAll(),
      dashboardRepository.countByStatus(),
      dashboardRepository.countByTahap(),
      dashboardRepository.slaSummary(),
    ])
    return { totalUsulan: total, byStatus, byTahap, sla }
  },

  async recent() {
    return dashboardRepository.recentUsulan()
  },

  async trend(days: number) {
    return dashboardRepository.trendPerDay(days)
  },

  // ─── Role-Based Dashboard (existing pages) ───────────────────────────────

  async ringkasan(unitOrganisasiId?: string) {
    return dashboardRepository.ringkasan(unitOrganisasiId)
  },

  async perJenisLayanan() {
    return dashboardRepository.perJenisLayanan()
  },

  async antrianPerTahap() {
    return dashboardRepository.antrianPerTahap()
  },

  async laporanHarian() {
    return dashboardRepository.laporanHarian()
  },

  async aktivitas() {
    return dashboardRepository.aktivitas()
  },

  // ─── Analytics ───────────────────────────────────────────────────────────

  async slaTrend(days: number) {
    return dashboardRepository.slaTrend(days)
  },

  async throughput(days: number) {
    return dashboardRepository.throughput(days)
  },

  async bottleneck() {
    return dashboardRepository.bottleneck()
  },

  async rankingOpd(limit: number) {
    return dashboardRepository.rankingOpd(limit)
  },
}
