import nodemailer from 'nodemailer'
import { env } from '@/core/config/env'
import { logger } from '@/core/logger/logger'
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

const warnedContexts = new Set<string>()

const missingConfig = (): string[] => [
  ['SMTP_HOST', env.SMTP_HOST],
  ['SMTP_FROM', env.SMTP_FROM],
  ['SMTP_USER', env.SMTP_USER],
  ['SMTP_PASS', env.SMTP_PASS],
].filter(([, value]) => !value).map(([key]) => key)

const isEnabled = (): boolean => env.EMAIL_ENABLED

const isConfigured = (): boolean => isEnabled() && missingConfig().length === 0

const warnUnavailable = (context: string, to?: string): void => {
  const key = `${context}:${missingConfig().join(',')}`
  if (warnedContexts.has(key)) return
  warnedContexts.add(key)
  logger.warn('Email SMTP belum dikonfigurasi; pengiriman email dilewati', {
    context,
    to,
    missingConfig: missingConfig(),
    emailEnabled: env.EMAIL_ENABLED,
  })
}

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
  isEnabled,
  isConfigured,

  async send(template: EmailTemplate, to: string): Promise<void> {
    if (!isEnabled()) return
    if (!isConfigured()) {
      warnUnavailable(template.subject, to)
      return
    }
    await transporter().sendMail({
      from: env.SMTP_FROM,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    })
  },

  async sendNotification(input: SendNotificationEmailInput): Promise<void> {
    if (!input.recipient.email) return
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
