import { Router } from 'express'
import { workflowController } from './workflow.controller'

export const workflowRoutes = Router()

workflowRoutes.get('/:usulanId/history', workflowController.history)
workflowRoutes.get('/:usulanId/sla', workflowController.slaStatus)
workflowRoutes.get('/:usulanId/revisi', workflowController.revisi)
