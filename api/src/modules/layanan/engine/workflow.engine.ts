import { db } from '@/core/database/prisma.client'
import { TahapUsulan } from '@/shared/enums'
import type { Prisma } from '@prisma/client'

export async function logWorkflow(
  usulanId: string,
  dariTahap: TahapUsulan | null,
  keTahap: TahapUsulan | null,
  aksi: string,
  userId: string | null | undefined,
  catatan?: string,
  client: Prisma.TransactionClient = db,
): Promise<void> {
  await client.usulanWorkflowLog.create({
    data: { usulanLayananId: usulanId, dariTahap, keTahap, aksi, dilakukanOlehId: userId, catatan },
  })
}
