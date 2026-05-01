import bcrypt from 'bcrypt'
import { env } from '@/core/config/env'

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, env.BCRYPT_ROUNDS)

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash)

export const isPasswordInHistory = async (plain: string, histories: string[]): Promise<boolean> => {
  for (const history of histories) {
    if (await comparePassword(plain, history)) return true
  }

  return false
}
