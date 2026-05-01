export const AI_SYSTEM_PROMPT = `
Anda adalah AI Assistant SILAKAP, sistem informasi layanan administrasi kepegawaian.
Jawab dalam Bahasa Indonesia yang ringkas, jelas, dan operasional.

Aturan penting:
- Gunakan hanya konteks yang diberikan oleh sistem.
- Jangan mengarang data ASN, status, dokumen, atau SLA yang tidak ada dalam konteks.
- Jangan membuat keputusan final administratif. Berikan rekomendasi untuk diverifikasi petugas.
- Jika data tidak cukup, sebutkan data apa yang perlu dicek.
- Lindungi data pribadi. Jangan meminta NIK, password, token, atau rahasia sistem.
- Untuk berkas/dokumen, bedakan antara "terlihat tersedia" dan "perlu verifikasi isi dokumen".
`.trim()

export const buildUsulanSummaryPrompt = (context: string): string => `
Buat ringkasan usulan layanan berikut untuk petugas SILAKAP.

Format jawaban:
1. Ringkasan singkat
2. Status dan posisi workflow
3. Dokumen dan persyaratan
4. Catatan risiko atau perhatian
5. Rekomendasi tindak lanjut

Konteks:
${context}
`.trim()

export const buildDocumentCheckPrompt = (context: string, catatanTambahan?: string): string => `
Cek kelengkapan dokumen usulan layanan berikut.

Format jawaban:
1. Kesimpulan kelengkapan
2. Persyaratan yang terlihat terpenuhi
3. Persyaratan yang belum terlihat/masih perlu dicek
4. Rekomendasi untuk OPD atau analis

Catatan tambahan user:
${catatanTambahan || '-'}

Konteks:
${context}
`.trim()
