export interface RoleResponseDto {
  id: string
  nama: string
  deskripsi?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RolePermissionResponseDto {
  id: string
  module?: string | null
  permission: string
}
