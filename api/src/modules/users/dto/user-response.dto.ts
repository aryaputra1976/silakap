export interface UserResponseDto {
  id: string
  username: string
  namaLengkap: string
  email: string
  nomorHp?: string | null
  unitOrganisasiId?: string | null
  asnId?: string | null
  roleId: string
  roleNama: string
  isActive: boolean
  emailVerifiedAt: Date | null
  mustChangePassword: boolean
  lastLogin?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ResetPasswordResponseDto {
  temporaryPassword: string | null
  emailSent: boolean
}
