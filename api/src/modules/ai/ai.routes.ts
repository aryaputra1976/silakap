import { Router } from 'express'
import { validate } from '@/core/middleware/validate.middleware'
import { aiController } from './ai.controller'
import { aiCekKelengkapanSchema, aiChatSchema } from './dto/ai.dto'

export const aiRoutes = Router()

aiRoutes.get('/status', aiController.status)
aiRoutes.post('/chat', validate(aiChatSchema), aiController.chat)
aiRoutes.post('/usulan/:id/ringkasan', aiController.ringkasUsulan)
aiRoutes.post('/usulan/:id/cek-kelengkapan', validate(aiCekKelengkapanSchema), aiController.cekKelengkapan)
