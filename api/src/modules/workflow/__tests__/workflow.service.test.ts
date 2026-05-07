import { describe, it, expect } from 'vitest'
import { TahapUsulan, StatusUsulan } from '@prisma/client'
import {
  workflowService,
  statusByTahap,
  roleByTahap,
  nextTahapByCurrent,
  previousTahapByCurrent,
} from '../workflow.service'
import { ROLES } from '@/shared/constants'

describe('statusByTahap', () => {
  it('setiap tahap punya status yang unik dan terdefinisi', () => {
    const tahapList = Object.values(TahapUsulan)
    const statusList = tahapList.map((t) => statusByTahap[t])
    expect(statusList.every(Boolean)).toBe(true)
    expect(new Set(statusList).size).toBe(tahapList.length)
  })

  it('AP → VerifikasiAP', () => {
    expect(statusByTahap[TahapUsulan.AP]).toBe(StatusUsulan.VerifikasiAP)
  })

  it('KepalaBadan → ApprovalKepalaBadan', () => {
    expect(statusByTahap[TahapUsulan.KepalaBadan]).toBe(StatusUsulan.ApprovalKepalaBadan)
  })
})

describe('roleByTahap', () => {
  it('setiap tahap punya role yang terdefinisi', () => {
    for (const tahap of Object.values(TahapUsulan)) {
      expect(roleByTahap[tahap]).toBeTruthy()
    }
  })

  it('AP dikerjakan oleh Analis_Pertama', () => {
    expect(roleByTahap[TahapUsulan.AP]).toBe(ROLES.ANALIS_PERTAMA)
  })

  it('KepalaBadan dikerjakan oleh Kepala_Badan', () => {
    expect(roleByTahap[TahapUsulan.KepalaBadan]).toBe(ROLES.KEPALA_BADAN)
  })
})

describe('workflowService.assertTahapValid', () => {
  it('tidak throw jika tahap valid', () => {
    expect(() => workflowService.assertTahapValid(TahapUsulan.AP)).not.toThrow()
    expect(() => workflowService.assertTahapValid(TahapUsulan.KepalaBadan)).not.toThrow()
  })

  it('throw AppError jika tahap null', () => {
    expect(() => workflowService.assertTahapValid(null)).toThrow('Tahap usulan tidak valid')
  })
})

describe('workflowService.assertRoleCanHandleTahap', () => {
  it('tidak throw jika role sesuai tahap', () => {
    expect(() =>
      workflowService.assertRoleCanHandleTahap(ROLES.ANALIS_PERTAMA, TahapUsulan.AP),
    ).not.toThrow()
    expect(() =>
      workflowService.assertRoleCanHandleTahap(ROLES.KEPALA_BADAN, TahapUsulan.KepalaBadan),
    ).not.toThrow()
  })

  it('throw 403 jika role tidak sesuai tahap', () => {
    expect(() =>
      workflowService.assertRoleCanHandleTahap(ROLES.ANALIS_MUDA, TahapUsulan.Kabid),
    ).toThrow('Anda tidak memiliki akses ke tahap ini')
  })

  it('throw 403 jika role undefined', () => {
    expect(() =>
      workflowService.assertRoleCanHandleTahap(undefined, TahapUsulan.AP),
    ).toThrow('Anda tidak memiliki akses ke tahap ini')
  })
})

describe('workflowService.assertStatusMatchesTahap', () => {
  it('tidak throw jika status cocok tahap', () => {
    expect(() =>
      workflowService.assertStatusMatchesTahap(StatusUsulan.VerifikasiAP, TahapUsulan.AP),
    ).not.toThrow()
  })

  it('throw jika status tidak cocok tahap', () => {
    expect(() =>
      workflowService.assertStatusMatchesTahap(StatusUsulan.VerifikasiAM, TahapUsulan.AP),
    ).toThrow('Status tidak sesuai tahap')
  })
})

describe('workflowService.resolveNextTahap', () => {
  it('AP → AM', () => expect(workflowService.resolveNextTahap(TahapUsulan.AP)).toBe(TahapUsulan.AM))
  it('AM → AD', () => expect(workflowService.resolveNextTahap(TahapUsulan.AM)).toBe(TahapUsulan.AD))
  it('AD → Kabid', () => expect(workflowService.resolveNextTahap(TahapUsulan.AD)).toBe(TahapUsulan.Kabid))

  it('throw jika tidak ada tahap berikutnya (KepalaBadan adalah akhir)', () => {
    expect(() => workflowService.resolveNextTahap(TahapUsulan.KepalaBadan)).toThrow('Tidak bisa lanjut tahap')
  })
})

describe('workflowService.resolvePreviousTahap', () => {
  it('AM kembali ke AP', () => {
    expect(workflowService.resolvePreviousTahap(TahapUsulan.AM)).toBe(TahapUsulan.AP)
  })
  it('Kabid kembali ke AD', () => {
    expect(workflowService.resolvePreviousTahap(TahapUsulan.Kabid)).toBe(TahapUsulan.AD)
  })
})

describe('konsistensi next/previous tahap', () => {
  it('next lalu previous kembali ke tahap asal', () => {
    const asal = TahapUsulan.AP
    const next = workflowService.resolveNextTahap(asal) // AM
    const back = workflowService.resolvePreviousTahap(next) // AP
    expect(back).toBe(asal)
  })

  it('semua tahap di nextTahapByCurrent punya previous yang valid', () => {
    for (const [from, to] of Object.entries(nextTahapByCurrent)) {
      const prev = previousTahapByCurrent[to as TahapUsulan]
      expect(prev).toBe(from)
    }
  })
})
