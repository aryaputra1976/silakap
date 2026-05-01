import nodemailer from 'nodemailer'
import { env } from '@/core/config/env'
import { emailTemplates, type EmailTemplate } from './email.templates'

type MailRecipient = {
  email: string | null
  namaLengkap?: string | null
}

type SendNotificationEmailInput = {
  recipient: MailRecipient
  type: string
  title: string
  body: string
  link?: string | null
}

const isConfigured = (): boolean => Boolean(env.SMTP_HOST && env.SMTP_FROM)

const transporter = () =>
  nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER
      ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        }
      : undefined,
  })

const templateFor = (type: string, input: Parameters<typeof emailTemplates.berkas>[0]): EmailTemplate => {
  if (type.toLowerCase().includes('sla')) return emailTemplates.sla(input)
  if (type.toLowerCase().includes('laporan')) return emailTemplates.laporan(input)
  return emailTemplates.berkas(input)
}

export const emailService = {
  isConfigured,

  async send(template: EmailTemplate, to: string): Promise<void> {
    if (!isConfigured()) return
    await transporter().sendMail({
      from: env.SMTP_FROM,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    })
  },

  async sendNotification(input: SendNotificationEmailInput): Promise<void> {
    if (!input.recipient.email || !isConfigured()) return
    const actionUrl = input.link?.startsWith('http') ? input.link : input.link ? `${env.APP_URL}${input.link}` : null
    const template = templateFor(input.type, {
      recipientName: input.recipient.namaLengkap,
      title: input.title,
      body: input.body,
      actionUrl,
    })
    await this.send(template, input.recipient.email)
  },

  async sendTest(to: string): Promise<void> {
    const template = emailTemplates.berkas({
      recipientName: 'Administrator',
      title: 'Tes Email SMTP SILAKAP',
      body: 'Konfigurasi SMTP berhasil digunakan untuk mengirim email dari SILAKAP.',
      actionUrl: env.APP_URL,
    })
    await this.send(template, to)
  },
}
