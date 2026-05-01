import { Router } from 'express'

export const createPlaceholderRoutes = (moduleName: string): Router => {
  const router = Router()

  router.all('*', (_req, res) => {
    res.status(501).json({
      success: false,
      message: `Module ${moduleName} belum diimplementasikan`,
    })
  })

  return router
}
