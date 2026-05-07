import { z } from 'zod'

/**
 * Password policy SILAKAP:
 * - 10–128 karakter
 * - Min 1 huruf besar (A-Z)
 * - Min 1 huruf kecil (a-z)
 * - Min 1 angka (0-9)
 * - Min 1 karakter spesial (!@#$%^&*...)
 * - Tidak boleh mengandung spasi
 *
 * Max 128 karakter: bcrypt hanya memproses 72 byte pertama,
 * tapi password sangat panjang bisa dipakai untuk DoS via bcrypt hash time.
 */
export const passwordSchema = z
  .string()
  .min(10, 'Password minimal 10 karakter')
  .max(128, 'Password maksimal 128 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung minimal 1 karakter spesial (!@#$%^&* dll)')
  .regex(/^\S+$/, 'Password tidak boleh mengandung spasi')
