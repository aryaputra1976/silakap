import { z } from 'zod'

export const setRolePermissionsSchema = z.object({
  permissions: z.array(
    z.object({
      module: z.string().min(1).max(100).nullable().optional(),
      permission: z.string().min(1).max(100),
    }),
  ),
})

export type SetRolePermissionsDto = z.infer<typeof setRolePermissionsSchema>
