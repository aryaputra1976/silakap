import type { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '@/core/http/response.helper'
import { workflowService } from './workflow.service'

export const workflowController = {
  history: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await workflowService.history(req.params.usulanId))
    } catch (error) {
      next(error)
    }
  },

  slaStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await workflowService.slaStatus(req.params.usulanId))
    } catch (error) {
      next(error)
    }
  },

  revisi: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await workflowService.revisi(req.params.usulanId))
    } catch (error) {
      next(error)
    }
  },
}
