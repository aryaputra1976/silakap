import type { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '@/core/http/response.helper'
import { workflowQueryService } from './workflow.query.service'

export const workflowController = {
  history: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await workflowQueryService.history(req.params.usulanId))
    } catch (error) {
      next(error)
    }
  },

  slaStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await workflowQueryService.slaStatus(req.params.usulanId))
    } catch (error) {
      next(error)
    }
  },

  revisi: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await workflowQueryService.revisi(req.params.usulanId))
    } catch (error) {
      next(error)
    }
  },
}
