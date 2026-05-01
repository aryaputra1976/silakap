import { describe, it, expect, vi, beforeEach } from 'vitest'
import Cookies from 'js-cookie'
import type { RoleName, User } from '@/types/models'

vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    remove: vi.fn(),
    get: vi.fn(),
  },
}))

const mockUser: User = {
  id: 'user-1',
  username: 'testuser',
  namaLengkap: 'Test User',
  email: 'test@example.com',
  nomorHp: null,
  unitOrganisasiId: null,
  asnId: null,
  roleId: 'role-1',
  roleNama: 'Admin_Sistem' as const,
  isActive: true,
  mustChangePassword: false,
  lastLogin: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('auth store', () => {
  // Fresh store each test — zustand store is a singleton,
  // so we reset state manually via the actions themselves.
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('starts unauthenticated', async () => {
    const { useAuthStore } = await import('../auth.store')
    useAuthStore.getState().logout() // ensure clean slate
    const { user, isAuthenticated } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
  })

  it('setAuth sets user, isAuthenticated, and writes cookies', async () => {
    const { useAuthStore } = await import('../auth.store')

    useAuthStore.getState().setAuth(mockUser, 'access-abc', 'refresh-xyz')

    const { user, isAuthenticated } = useAuthStore.getState()
    expect(isAuthenticated).toBe(true)
    expect(user?.namaLengkap).toBe('Test User')
    expect(Cookies.set).toHaveBeenCalledWith('accessToken', 'access-abc', expect.any(Object))
    expect(Cookies.set).toHaveBeenCalledWith('refreshToken', 'refresh-xyz', expect.any(Object))
  })

  it('setAuth normalizes role aliases', async () => {
    const { useAuthStore } = await import('../auth.store')

    useAuthStore.getState().setAuth(
      { ...mockUser, roleNama: 'admin' as unknown as RoleName },
      'tok',
      'ref',
    )

    expect(useAuthStore.getState().user?.roleNama).toBe('Admin_Sistem')
  })

  it('logout clears state and removes cookies', async () => {
    const { useAuthStore } = await import('../auth.store')

    useAuthStore.getState().setAuth(mockUser, 'access-abc', 'refresh-xyz')
    useAuthStore.getState().logout()

    const { user, isAuthenticated } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
    expect(Cookies.remove).toHaveBeenCalledWith('accessToken')
    expect(Cookies.remove).toHaveBeenCalledWith('refreshToken')
  })
})
