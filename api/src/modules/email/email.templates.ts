type EmailTemplateInput = {
  recipientName?: string | null
  title: string
  body: string
  actionUrl?: string | null
}

export type EmailTemplate = {
  subject: string
  text: string
  html: string
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const baseTemplate = ({ recipientName, title, body, actionUrl }: EmailTemplateInput): EmailTemplate => {
  const greeting = recipientName ? `Yth. ${recipientName},` : 'Yth. pengguna SILAKAP,'
  const safeTitle = escapeHtml(title)
  const safeGreeting = escapeHtml(greeting)
  const safeBody = escapeHtml(body)
  const safeActionUrl = actionUrl ? escapeHtml(actionUrl) : null

  return {
    subject: title,
    text: [greeting, '', body, actionUrl ? `Buka: ${actionUrl}` : null, '', 'SILAKAP'].filter(Boolean).join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <p>${safeGreeting}</p>
        <h2 style="margin:0 0 12px;color:#111827">${safeTitle}</h2>
        <p>${safeBody}</p>
        ${
          safeActionUrl
            ? `<p><a href="${safeActionUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Buka SILAKAP</a></p>`
            : ''
        }
        <p style="margin-top:24px;color:#6b7280;font-size:12px">Email otomatis dari SILAKAP.</p>
      </div>
    `,
  }
}

export const emailTemplates = {
  berkas(input: EmailTemplateInput): EmailTemplate {
    return baseTemplate(input)
  },

  sla(input: EmailTemplateInput): EmailTemplate {
    return baseTemplate(input)
  },

  laporan(input: EmailTemplateInput): EmailTemplate {
    return baseTemplate(input)
  },
}
