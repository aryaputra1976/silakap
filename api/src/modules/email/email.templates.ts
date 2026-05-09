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

const renderBodyHtml = (body: string): string =>
  body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')

const baseTemplate = ({ recipientName, title, body, actionUrl }: EmailTemplateInput): EmailTemplate => {
  const greeting = recipientName ? `Yth. ${recipientName},` : 'Yth. pengguna SILAKAP,'
  const safeTitle = escapeHtml(title)
  const safeGreeting = escapeHtml(greeting)
  const safeBody = renderBodyHtml(body)
  const safeActionUrl = actionUrl ? escapeHtml(actionUrl) : null

  return {
    subject: title,
    text: [greeting, '', body, actionUrl ? `Buka: ${actionUrl}` : null, '', 'SILAKAP'].filter(Boolean).join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <p>${safeGreeting}</p>
        <h2 style="margin:0 0 12px;color:#111827">${safeTitle}</h2>
        ${safeBody}
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

  emailVerification({ namaLengkap, verificationUrl }: { namaLengkap: string; verificationUrl: string }): EmailTemplate {
    return baseTemplate({
      recipientName: namaLengkap,
      title: 'Verifikasi Email Akun SILAKAP',
      body: 'Terima kasih telah mendaftar di SILAKAP. Silakan klik tombol di bawah untuk memverifikasi alamat email Bapak/Ibu. Tautan ini berlaku selama 24 jam.\n\nSetelah email terverifikasi, akun Bapak/Ibu akan menunggu aktivasi oleh Admin BKPSDM.',
      actionUrl: verificationUrl,
    })
  },

  adminNewRegistration({
    namaAdmin,
    namaPendaftar,
    nip,
    unitNama,
    emailPendaftar,
    activationUrl,
  }: {
    namaAdmin: string | null
    namaPendaftar: string
    nip: string
    unitNama: string
    emailPendaftar: string
    activationUrl: string
  }): EmailTemplate {
    return baseTemplate({
      recipientName: namaAdmin,
      title: 'Ada Pendaftar Baru di SILAKAP',
      body: `Seorang ASN baru telah mendaftar dan menunggu aktivasi akun:\n\n- Nama: ${namaPendaftar}\n- NIP: ${nip}\n- Unit: ${unitNama}\n- Email: ${emailPendaftar}\n\nSilakan masuk ke SILAKAP untuk memeriksa dan mengaktifkan akun tersebut apabila data sudah sesuai.`,
      actionUrl: activationUrl,
    })
  },

  loginFromNewIp({
    namaLengkap,
    ipAddress,
    browser,
    waktu,
    changePasswordUrl,
  }: {
    namaLengkap: string
    ipAddress: string
    browser: string
    waktu: string
    changePasswordUrl: string
  }): EmailTemplate {
    return baseTemplate({
      recipientName: namaLengkap,
      title: 'Peringatan: Login dari Perangkat Baru',
      body: `Akun SILAKAP Bapak/Ibu baru saja diakses dari lokasi atau perangkat baru:\n\n- Waktu: ${waktu}\n- IP Address: ${ipAddress}\n- Browser/Perangkat: ${browser}\n\nApabila aktivitas ini tidak dikenali, segera ganti password dan hubungi Admin BKPSDM.`,
      actionUrl: changePasswordUrl,
    })
  },

  accountLocked({
    namaLengkap,
    maxAttempts,
    lockDurationMinutes,
  }: {
    namaLengkap: string
    maxAttempts: number
    lockDurationMinutes: number
  }): EmailTemplate {
    return baseTemplate({
      recipientName: namaLengkap,
      title: 'Akun SILAKAP Anda Terkunci Sementara',
      body: `Akun SILAKAP Bapak/Ibu terkunci karena terdapat ${maxAttempts} kali percobaan login yang gagal.\n\nAkun akan terbuka otomatis dalam ${lockDurationMinutes} menit. Apabila aktivitas ini tidak dikenali, segera hubungi Admin BKPSDM.`,
    })
  },

  sessionRevoked({
    namaLengkap,
    revokedCount,
    changePasswordUrl,
  }: {
    namaLengkap: string
    revokedCount: number
    changePasswordUrl: string
  }): EmailTemplate {
    return baseTemplate({
      recipientName: namaLengkap,
      title: 'Sesi Aktif SILAKAP Anda Diakhiri',
      body: `${revokedCount} sesi aktif akun SILAKAP Bapak/Ibu telah diakhiri secara otomatis karena batas maksimal perangkat yang dapat login secara bersamaan telah tercapai.\n\nApabila Bapak/Ibu tidak melakukan login baru-baru ini, segera ganti password dan hubungi Admin BKPSDM.`,
      actionUrl: changePasswordUrl,
    })
  },

  accountUnlocked({ namaLengkap }: { namaLengkap: string }): EmailTemplate {
    return baseTemplate({
      recipientName: namaLengkap,
      title: 'Akun SILAKAP Anda Telah Dibuka',
      body: 'Akun SILAKAP Bapak/Ibu yang sebelumnya terkunci telah dibuka oleh Admin BKPSDM. Bapak/Ibu sekarang dapat login kembali ke SILAKAP.',
    })
  },

  passwordReset({
    namaLengkap,
    temporaryPassword,
  }: {
    namaLengkap: string
    temporaryPassword: string
  }): EmailTemplate {
    return baseTemplate({
      recipientName: namaLengkap,
      title: 'Reset Password Akun SILAKAP',
      body: `Password sementara akun SILAKAP Bapak/Ibu adalah:\n\n${temporaryPassword}\n\nDemi keamanan, segera login dan ganti password setelah berhasil masuk. Abaikan email ini apabila Bapak/Ibu tidak meminta reset password melalui Admin BKPSDM.`,
    })
  },
}
