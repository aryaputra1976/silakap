import { env } from '@/core/config/env'
import type { NotifikasiPayload } from './types/notifikasi.types'

type WhatsAppRecipient = {
  nomorHp: string | null
  namaLengkap?: string | null
}

export const whatsappService = {
  isConfigured(): boolean {
    return Boolean(env.WHATSAPP_ENABLED && env.WHATSAPP_WEBHOOK_URL)
  },

  async sendNotification(recipient: WhatsAppRecipient, payload: NotifikasiPayload): Promise<void> {
    if (!this.isConfigured() || !recipient.nomorHp) return

    const message = [
      payload.judul ?? 'Notifikasi SILAKAP',
      payload.isi ?? 'Ada pembaruan informasi di SILAKAP.',
      payload.link ? `${env.APP_URL}${payload.link}` : null,
    ].filter(Boolean).join('\n')

    const response = await fetch(env.WHATSAPP_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.WHATSAPP_TOKEN ? { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        to: recipient.nomorHp,
        name: recipient.namaLengkap,
        message,
        source: 'silakap',
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp webhook gagal: ${response.status}`)
    }
  },
}
