declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        username: string
        namaLengkap: string
        roleId: bigint
        roleName: string
        unitOrganisasiId?: string
      }
      requestId?: string
    }
  }
}

export {}
