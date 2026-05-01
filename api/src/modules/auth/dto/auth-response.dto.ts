export interface AuthUserResponseDto {
  id: string
  username: string
  namaLengkap: string
  email: string
  role: {
    id: string
    nama: string
  }
  unitOrganisasiId?: string
  mustChangePassword: boolean
}

export interface LoginResponseDto {
  accessToken: string
  refreshToken: string
  user: AuthUserResponseDto
}

export interface RefreshResponseDto {
  accessToken: string
  refreshToken: string
}
