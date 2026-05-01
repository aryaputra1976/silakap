export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export const getPaginationParams = (query: { page?: unknown; limit?: unknown }): PaginationParams => {
  const parsedPage = Number(query.page ?? 1)
  const parsedLimit = Number(query.limit ?? 20)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1
  const limitBase = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.floor(parsedLimit) : 20
  const limit = Math.min(limitBase, 50)

  return { page, limit, skip: (page - 1) * limit }
}

export const buildMeta = (total: number, page: number, limit: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
})
