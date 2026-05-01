import { Router } from 'express'
import { notifikasiController } from './notifikasi.controller'

export const notifikasiRoutes = Router()

notifikasiRoutes.get('/', notifikasiController.list)
notifikasiRoutes.get('/count', notifikasiController.count)
notifikasiRoutes.put('/read-all', notifikasiController.readAll)
notifikasiRoutes.put('/:id/read', notifikasiController.read)
notifikasiRoutes.delete('/:id', notifikasiController.remove)
