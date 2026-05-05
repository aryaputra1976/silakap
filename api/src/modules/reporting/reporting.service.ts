import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import { reportingRepository } from './reporting.repository'

const getQuarterRange = (year: number, quarter: number) => {
  const startMonth = (quarter - 1) * 3
  const start = new Date(year, startMonth, 1)
  const end = new Date(year, startMonth + 3, 1)
  return { start, end }
}

export const reportingService = {
  async getTriwulanData(year: number, quarter: number) {
    const { start, end } = getQuarterRange(year, quarter)
    return reportingRepository.summaryRange(start, end)
  },

  async generateExcel(data: any) {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Laporan')

    ws.addRow(['LAPORAN TRIWULAN'])
    ws.addRow([])
    ws.addRow(['Total Usulan', data.total])

    ws.addRow([])
    ws.addRow(['STATUS'])
    Object.entries(data.byStatus).forEach(([k, v]) => {
      ws.addRow([k, v])
    })

    ws.addRow([])
    ws.addRow(['TAHAP'])
    Object.entries(data.byTahap).forEach(([k, v]) => {
      ws.addRow([k, v])
    })

    ws.addRow([])
    ws.addRow(['SLA'])
    ws.addRow(['Total', data.sla.total])
    ws.addRow(['Overdue', data.sla.overdue])
    ws.addRow(['Selesai', data.sla.selesai])

    ws.addRow([])
    ws.addRow(['DETAIL'])
    ws.addRow(['NIP', 'Nama', 'Layanan', 'Status', 'Tanggal'])

    data.list.forEach((item: any) => {
      ws.addRow([
        item.asn?.nipBaru,
        item.asn?.nama,
        item.jenisLayanan?.nama,
        item.status,
        item.createdAt,
      ])
    })

    const buffer = await wb.xlsx.writeBuffer()
    return buffer
  },

  async generatePDF(data: any) {
    const doc = new PDFDocument()
    const buffers: Buffer[] = []

    doc.on('data', buffers.push.bind(buffers))

    doc.fontSize(16).text('LAPORAN TRIWULAN', { align: 'center' })
    doc.moveDown()

    doc.fontSize(12).text(`Total Usulan: ${data.total}`)
    doc.moveDown()

    doc.text('STATUS:')
    Object.entries(data.byStatus).forEach(([k, v]) => {
      doc.text(`${k}: ${v}`)
    })

    doc.moveDown()
    doc.text('SLA:')
    doc.text(`Total: ${data.sla.total}`)
    doc.text(`Overdue: ${data.sla.overdue}`)
    doc.text(`Selesai: ${data.sla.selesai}`)

    doc.end()

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)))
    })
  },
}