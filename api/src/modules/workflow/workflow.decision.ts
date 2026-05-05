import { TahapUsulan, StatusUsulan } from '@prisma/client'

export interface WorkflowDecision {
  from: TahapUsulan | null
  to: TahapUsulan | null
  status: StatusUsulan
  closeSla: boolean
  openSla: boolean
}

export const workflowDecision = {
  forward(current: TahapUsulan): WorkflowDecision {
    switch (current) {
      case 'AP':
        return { from: current, to: 'AM', status: StatusUsulan.VerifikasiAM, closeSla: true, openSla: true }
      case 'AM':
        return { from: current, to: 'AD', status: StatusUsulan.QualityControl, closeSla: true, openSla: true }
      case 'AD':
        return { from: current, to: 'Kabid', status: StatusUsulan.ApprovalKabid, closeSla: true, openSla: true }
      case 'Kabid':
        return { from: current, to: 'KepalaBadan', status: StatusUsulan.ApprovalKepalaBadan, closeSla: true, openSla: true }
      default:
        throw new Error('Invalid transition')
    }
  },
}