import type { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '@/core/http/response.helper'
import { insightsService } from './insights.service'

export const insightsController = {
  summary: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await insightsService.summary())
    } catch (error) {
      next(error)
    }
  },
}